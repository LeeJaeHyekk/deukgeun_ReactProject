#!/usr/bin/env node

/**
 * 향상된 JS to CJS 변환 스크립트 (모듈화 버전)
 * - 기능별 모듈화로 중복 제거 및 유지보수성 향상
 * - 모든 경로 패턴에 대한 정교한 처리
 * - 로그 기반 로직 개선
 */

import * as fs from 'fs'
import * as path from 'path'

// 모듈 임포트
import { ConversionOptions, ConversionStats } from './modules/converter-types'
import { log, logStep, logSuccess, logError, logWarning, logSeparator, isFileTooLarge, isEmptyFile } from './modules/converter-utils'
import { FileScanner } from './modules/file-scanner'
import { EsmConverter } from './modules/esm-converter'
import { DirnameRemover } from './modules/dirname-remover'
import { PathAliasResolver } from './modules/path-alias-resolver'
import { RequirePathFixer } from './modules/require-path-fixer'
import { PathFinder } from './modules/path-finder'

/**
 * 기본 변환 옵션
 */
const defaultOptions: ConversionOptions = {
  projectRoot: process.cwd(),
  distPath: path.join(process.cwd(), 'dist'),
  verbose: false,
  dryRun: false,
  backup: true,
  fixPathAliases: true,
  fixDependencies: true
}

/**
 * 향상된 JS to CJS 변환 클래스 (모듈화 버전)
 */
class EnhancedJsToCjsConverter {
  private options: ConversionOptions
  private backupPath: string
  private conversionStats: ConversionStats = {
    filesProcessed: 0,
    filesConverted: 0,
    pathAliasesFixed: 0,
    dependenciesFixed: 0,
    errors: 0
  }
  
  private fileScanner: FileScanner

  constructor(options: ConversionOptions) {
    this.options = options
    this.backupPath = path.join(options.projectRoot, '.conversion-backup')
    this.fileScanner = new FileScanner({ distPath: options.distPath })
  }

  /**
   * 변환 프로세스 실행
   */
  async execute(): Promise<boolean> {
    const startTime = Date.now()
    
    try {
      log('🚀 향상된 JS to CJS 변환을 시작합니다...', 'bright')
      logSeparator('=', 60, 'bright')
      
      // 1. dist 폴더 확인
      if (!this.validateDistFolder()) {
        return false
      }
      
      // 2. 백업 생성
      if (this.options.backup) {
        await this.createBackup()
      }
      
      // 3. JS 파일 찾기 및 변환
      const jsFiles = this.fileScanner.findJsFiles()
      
      if (jsFiles.length === 0) {
        logWarning('변환할 .js 파일이 없습니다.')
      } else {
        log(`변환 대상: ${jsFiles.length}개 파일`, 'blue')
        await this.convertFiles(jsFiles)
      }
      
      // 4. CJS 파일에서 ESM 문법 변환
      await this.convertCjsFilesWithEsmSyntax()
      
      // 5. require 경로 수정 (정교한 버전)
      await this.fixRequirePaths()
      
      // 6. 정리
      await this.cleanup()
      
      const duration = ((Date.now() - startTime) / 1000).toFixed(2)
      logSuccess(`JS to CJS 변환이 완료되었습니다! (소요시간: ${duration}초)`)
      this.printStats()
      logSeparator('=', 60, 'green')
      
      return this.conversionStats.errors === 0
    } catch (error) {
      logError(`변환 프로세스 실패: ${(error as Error).message}`)
      await this.emergencyRollback()
      return false
    }
  }

  /**
   * dist 폴더 유효성 검사
   */
  private validateDistFolder(): boolean {
    logStep('VALIDATE', 'dist 폴더 확인 중...')
    
    if (!fs.existsSync(this.options.distPath)) {
      logError(`dist 폴더가 존재하지 않습니다: ${this.options.distPath}`)
      logError('먼저 빌드를 실행해주세요.')
      return false
    }
    
    logSuccess('dist 폴더 확인 완료')
    return true
  }

  /**
   * 백업 생성
   */
  private async createBackup(): Promise<void> {
    logStep('BACKUP', '백업 생성 중...')
    
    if (this.options.dryRun) {
      log('백업 생성 (드라이 런)', 'yellow')
      return
    }
    
    try {
      if (fs.existsSync(this.backupPath)) {
        fs.rmSync(this.backupPath, { recursive: true, force: true })
      }
      
      fs.cpSync(this.options.distPath, this.backupPath, { recursive: true })
      logSuccess('백업 생성 완료')
    } catch (error) {
      logWarning(`백업 생성 실패: ${(error as Error).message}`)
    }
  }

  /**
   * 파일들 변환
   */
  private async convertFiles(jsFiles: string[]): Promise<void> {
    logStep('CONVERT', '파일 변환 중...')
    
    const failedFiles: string[] = []
    
    for (const jsFile of jsFiles) {
      try {
        this.conversionStats.filesProcessed++
        
        if (await this.convertFile(jsFile)) {
          this.conversionStats.filesConverted++
        }
      } catch (error) {
        logError(`파일 변환 실패: ${jsFile} - ${(error as Error).message}`)
        this.conversionStats.errors++
        failedFiles.push(jsFile)
        
        if (failedFiles.length > 10) {
          logError('너무 많은 파일 변환 실패로 중단합니다.')
          throw new Error('파일 변환 실패율이 너무 높습니다.')
        }
      }
    }
    
    if (failedFiles.length > 0) {
      logWarning(`${failedFiles.length}개 파일 변환 실패`)
    }
  }

  /**
   * 개별 파일 변환
   */
  private async convertFile(filePath: string): Promise<boolean> {
    try {
      // 파일 크기 확인
      if (isFileTooLarge(filePath)) {
        const stats = fs.statSync(filePath)
        logWarning(`파일이 너무 큽니다 (${(stats.size / 1024 / 1024).toFixed(2)}MB): ${path.relative(this.options.distPath, filePath)}`)
        return false
      }
      
      const content = fs.readFileSync(filePath, 'utf8')
      
      // 빈 파일 처리
      if (isEmptyFile(content)) {
        if (this.options.dryRun) {
          log(`빈 파일 삭제 예정: ${path.relative(this.options.distPath, filePath)}`, 'yellow')
          return true
        }
        
        fs.unlinkSync(filePath)
        log(`빈 파일 삭제됨: ${path.relative(this.options.distPath, filePath)}`, 'green')
        return true
      }
      
      // 변환 실행
      let convertedContent = this.convertContent(content, filePath)
      
      if (this.options.dryRun) {
        log(`변환 예정: ${path.relative(this.options.distPath, filePath)}`, 'yellow')
        return true
      }
      
      // __dirname 선언 제거
      convertedContent = DirnameRemover.removeDirnameDeclarations(convertedContent)
      
      // .cjs 파일로 저장
      const cjsPath = this.getCjsPath(filePath)
      
      // 원자적 쓰기
      const tempPath = cjsPath + '.tmp'
      fs.writeFileSync(tempPath, convertedContent)
      fs.renameSync(tempPath, cjsPath)
      
      // 저장 후 __dirname 선언 재검증
      const savedContent = fs.readFileSync(cjsPath, 'utf8')
      if (DirnameRemover.hasDirnameDeclaration(savedContent)) {
        const cleanedContent = DirnameRemover.removeDirnameDeclarations(savedContent)
        if (cleanedContent !== savedContent) {
          fs.writeFileSync(cjsPath, cleanedContent, 'utf8')
          if (this.options.verbose) {
            log(`__dirname 선언 제거됨: ${path.relative(this.options.distPath, cjsPath)}`, 'yellow')
          }
        }
      }
      
      // 원본 파일 삭제
      fs.unlinkSync(filePath)
      
      log(`변환됨: ${path.relative(this.options.distPath, filePath)} → ${path.relative(this.options.distPath, cjsPath)}`, 'green')
      return true
    } catch (error) {
      logError(`파일 변환 실패: ${filePath} - ${(error as Error).message}`)
      return false
    }
  }

  /**
   * CJS 파일 경로 생성
   */
  private getCjsPath(originalPath: string): string {
    if (originalPath.endsWith('.js')) {
      return originalPath.replace('.js', '.cjs')
    } else if (originalPath.endsWith('.ts')) {
      return originalPath.replace('.ts', '.cjs')
    } else if (originalPath.endsWith('.tsx')) {
      return originalPath.replace('.tsx', '.cjs')
    }
    return originalPath + '.cjs'
  }

  /**
   * 내용 변환 (모듈화 버전)
   */
  private convertContent(content: string, filePath: string): string {
    let convertedContent: string = content
    
    // ESM 문법이 있는지 확인
    const hasEsmSyntax = EsmConverter.hasEsmSyntax(convertedContent)
    
    // 이미 CommonJS 형태이고 ESM 문법이 없는 경우 경로만 수정
    if (EsmConverter.isAlreadyCommonJS(convertedContent) && !hasEsmSyntax) {
      // 1. 경로 별칭 변환
      if (this.options.fixPathAliases) {
        convertedContent = PathAliasResolver.convertPathAliases(
          convertedContent,
          filePath,
          this.options.distPath
        )
      }
      
      // 2. require 경로를 .cjs로 수정
      convertedContent = RequirePathFixer.fixRequireExtensions(
        convertedContent,
        filePath,
        this.options.distPath
      )
      
      return convertedContent
    }
    
    // ESM 형태인 경우 전체 변환
    // 1. import.meta.env 변환
    convertedContent = EsmConverter.convertImportMetaEnv(convertedContent)
    
    // 2. import/export 변환
    if (EsmConverter.needsImportExportConversion(convertedContent)) {
      convertedContent = EsmConverter.convertImportExport(convertedContent, filePath)
    }
    
    // 3. 경로 별칭 변환
    if (this.options.fixPathAliases) {
      convertedContent = PathAliasResolver.convertPathAliases(
        convertedContent,
        filePath,
        this.options.distPath
      )
    }
    
    // 4. 의존성 모듈 경로 수정
    if (this.options.fixDependencies) {
      convertedContent = this.fixDependencyPaths(convertedContent)
    }
    
    // 5. 기타 ESM 문법 변환
    convertedContent = EsmConverter.convertOtherEsmSyntax(convertedContent)
    
    // 6. __dirname 선언 제거
    convertedContent = DirnameRemover.removeDirnameDeclarations(convertedContent)
    
    // 7. 최종 정리
    convertedContent = EsmConverter.cleanupConvertedContent(convertedContent)
    
    return convertedContent
  }

  /**
   * 의존성 모듈 경로 수정
   */
  private fixDependencyPaths(content: string): string {
    let convertedContent = content
    
    // node_modules 경로 수정
    convertedContent = convertedContent.replace(
      /require\(['"]\.\.\/node_modules\/([^'"]+)['"]\)/g,
      "require('$1')"
    )
    
    convertedContent = convertedContent.replace(
      /require\(['"]\.\.\/\.\.\/node_modules\/([^'"]+)['"]\)/g,
      "require('$1')"
    )
    
    this.conversionStats.dependenciesFixed++
    return convertedContent
  }

  /**
   * CJS 파일에서 ESM 문법 변환
   */
  private async convertCjsFilesWithEsmSyntax(): Promise<void> {
    logStep('CONVERT_CJS', 'CJS 파일에서 ESM 문법 변환 중...')
    
    const cjsFiles = this.fileScanner.findCjsFiles()
    let convertedCount = 0
    let esmFoundCount = 0
    
    log(`[SCAN] CJS 파일 스캔 중...`, 'cyan')
    log(`발견된 CJS 파일: ${cjsFiles.length}개`, 'blue')
    
    for (const cjsFile of cjsFiles) {
      try {
        const content = fs.readFileSync(cjsFile, 'utf8')
        
        // ESM 문법이 있는지 확인
        if (EsmConverter.hasEsmSyntax(content)) {
          log(`CJS 파일에서 ESM 문법 발견: ${path.relative(this.options.distPath, cjsFile)}`, 'yellow')
          esmFoundCount++
          
          // 변환 실행
          const convertedContent = this.convertContent(content, cjsFile)
          
          if (this.options.dryRun) {
            log(`CJS 변환 예정: ${path.relative(this.options.distPath, cjsFile)}`, 'yellow')
            continue
          }
          
          // 변환된 내용 저장
          fs.writeFileSync(cjsFile, convertedContent)
          log(`CJS 변환됨: ${path.relative(this.options.distPath, cjsFile)}`, 'green')
          convertedCount++
        }
      } catch (error) {
        logError(`CJS 파일 변환 실패: ${cjsFile} - ${(error as Error).message}`)
      }
    }
    
    log(`\n📊 분석 결과:`, 'bright')
    log(`  • CJS 파일: ${cjsFiles.length}개`, 'blue')
    log(`  • CJS 파일 중 ESM 문법 사용: ${esmFoundCount}개`, 'yellow')
    if (esmFoundCount > 0) {
      log(`⚠️  변환이 필요한 파일들이 있습니다.`, 'yellow')
    }
    
    log(`CJS 파일 변환 완료: ${convertedCount}개`, 'green')
  }

  /**
   * require 경로 수정 (정교한 버전)
   */
  private async fixRequirePaths(): Promise<void> {
    logStep('FIX_REQUIRES', 'require 경로를 .cjs 확장자로 수정...')
    
    const cjsFiles = this.fileScanner.findCjsFiles()
    
    for (const cjsFile of cjsFiles) {
      try {
        const content = fs.readFileSync(cjsFile, 'utf8')
        
        // 모든 require 경로 수정 (정교한 버전)
        const modifiedContent = RequirePathFixer.fixAllRequirePaths(
          content,
          cjsFile,
          this.options.distPath
        )
        
        // __dirname 선언 제거 (require 경로 수정 후 재검증)
        const finalContent = DirnameRemover.removeDirnameDeclarations(modifiedContent)
        
        if (finalContent !== content) {
          if (!this.options.dryRun) {
            fs.writeFileSync(cjsFile, finalContent, 'utf8')
          }
          log(`require 경로 수정됨: ${path.relative(this.options.distPath, cjsFile)}`, 'green')
        }
      } catch (error) {
        logWarning(`require 경로 수정 실패: ${cjsFile} - ${(error as Error).message}`)
      }
    }
  }

  /**
   * 정리 작업
   */
  private async cleanup(): Promise<void> {
    logStep('CLEANUP', '정리 작업 중...')
    
    try {
      if (this.options.backup && fs.existsSync(this.backupPath)) {
        log('백업 폴더는 유지됩니다.', 'blue')
      }
      
      logSuccess('정리 완료')
    } catch (error) {
      logWarning(`정리 중 오류: ${(error as Error).message}`)
    }
  }

  /**
   * 긴급 롤백
   */
  private async emergencyRollback(): Promise<void> {
    logStep('EMERGENCY_ROLLBACK', '긴급 롤백 중...')
    
    try {
      if (fs.existsSync(this.backupPath)) {
        fs.rmSync(this.options.distPath, { recursive: true, force: true })
        fs.cpSync(this.backupPath, this.options.distPath, { recursive: true })
        logSuccess('긴급 롤백 완료')
      } else {
        logWarning('백업이 없어 롤백할 수 없습니다.')
      }
    } catch (error) {
      logError(`긴급 롤백 실패: ${(error as Error).message}`)
    }
  }

  /**
   * 변환 통계 출력
   */
  private printStats(): void {
    const successRate = this.conversionStats.filesProcessed > 0 
      ? ((this.conversionStats.filesConverted / this.conversionStats.filesProcessed) * 100).toFixed(1)
      : '0'
    
    log('\n📊 변환 통계:', 'bright')
    log(`  • 처리된 파일: ${this.conversionStats.filesProcessed}개`, 'blue')
    log(`  • 변환된 파일: ${this.conversionStats.filesConverted}개`, 'green')
    log(`  • 성공률: ${successRate}%`, this.conversionStats.errors > 0 ? 'yellow' : 'green')
    log(`  • 경로 별칭 수정: ${this.conversionStats.pathAliasesFixed}개`, 'cyan')
    log(`  • 의존성 경로 수정: ${this.conversionStats.dependenciesFixed}개`, 'cyan')
    
    if (this.conversionStats.errors > 0) {
      log(`  • 오류: ${this.conversionStats.errors}개`, 'red')
      log(`  • 실패율: ${((this.conversionStats.errors / this.conversionStats.filesProcessed) * 100).toFixed(1)}%`, 'red')
    }
  }
}

/**
 * 명령행 인수 파싱
 */
function parseArguments(): Partial<ConversionOptions> {
  const args = process.argv.slice(2)
  const options: Partial<ConversionOptions> = {}

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    
    switch (arg) {
      case '--project-root':
      case '-p':
        options.projectRoot = args[++i]
        break
      case '--dist-path':
      case '-d':
        options.distPath = args[++i]
        break
      case '--verbose':
      case '-v':
        options.verbose = true
        break
      case '--dry-run':
        options.dryRun = true
        break
      case '--no-backup':
        options.backup = false
        break
      case '--no-path-aliases':
        options.fixPathAliases = false
        break
      case '--no-dependencies':
        options.fixDependencies = false
        break
      case '--help':
      case '-h':
        printHelp()
        process.exit(0)
        break
    }
  }

  return options
}

/**
 * 도움말 출력
 */
function printHelp(): void {
  console.log(`
사용법: node enhanced-js-to-cjs-converter.ts [옵션]

옵션:
  -p, --project-root <path>   프로젝트 루트 경로
  -d, --dist-path <path>      dist 폴더 경로
  -v, --verbose               상세 로그 활성화
  --dry-run                   드라이 런 모드
  --no-backup                 백업 생성하지 않음
  --no-path-aliases           경로 별칭 변환 건너뛰기
  --no-dependencies           의존성 경로 수정 건너뛰기
  -h, --help                  도움말 출력

예시:
  node enhanced-js-to-cjs-converter.ts --verbose
  node enhanced-js-to-cjs-converter.ts --dry-run
  node enhanced-js-to-cjs-converter.ts --no-backup
`)
}

/**
 * 메인 함수
 */
async function main(): Promise<void> {
  try {
    const options = parseArguments()
    const finalOptions = { ...defaultOptions, ...options }
    
    const converter = new EnhancedJsToCjsConverter(finalOptions)
    const success = await converter.execute()
    
    if (success) {
      process.exit(0)
    } else {
      process.exit(1)
    }
    
  } catch (error: any) {
    logError(`변환 스크립트 실패: ${error.message}`)
    process.exit(1)
  }
}

// 스크립트 실행
main().catch(error => {
  logError(`실행 실패: ${error.message}`)
  process.exit(1)
})

export { EnhancedJsToCjsConverter, main }
