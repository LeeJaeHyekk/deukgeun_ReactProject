#!/usr/bin/env node

/**
 * 향상된 JS to CJS 변환 스크립트
 * - 더 상세하고 정확한 ESM to CommonJS 변환 패턴
 * - 경로 별칭 해석 및 변환
 * - 타입 정의 파일 처리
 * - 의존성 모듈 경로 수정
 * - 원본 파일을 절대 수정하지 않음
 */

import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

// 색상 출력을 위한 유틸리티
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
}

function log(message: string, color: keyof typeof colors = 'reset'): void {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function logStep(step: string, message: string): void {
  log(`[${step}] ${message}`, 'cyan')
}

function logSuccess(message: string): void {
  log(`✅ ${message}`, 'green')
}

function logError(message: string): void {
  log(`❌ ${message}`, 'red')
}

function logWarning(message: string): void {
  log(`⚠️  ${message}`, 'yellow')
}

/**
 * 변환 옵션 인터페이스
 */
interface ConversionOptions {
  projectRoot: string
  distPath: string
  verbose: boolean
  dryRun: boolean
  backup: boolean
  fixPathAliases: boolean
  fixDependencies: boolean
}

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
 * 경로 별칭 매핑 (현재 빌드 구조 기반)
 */
const pathAliases = {
  // 백엔드 모듈 경로 (dist/backend/backend/ 기준)
  '@backend/*': './*',
  '@backend/config/*': './config/*',
  '@backend/controllers/*': './controllers/*',
  '@backend/entities/*': './entities/*',
  '@backend/middlewares/*': './middlewares/*',
  '@backend/routes/*': './routes/*',
  '@backend/services/*': './services/*',
  '@backend/utils/*': './utils/*',
  '@backend/transformers/*': './transformers/*',
  '@backend/transformers': './transformers/index',
  '@backend/modules/*': './modules/*',
  '@backend/modules/server/*': './modules/server/*',
  '@backend/types/*': './types/*',
  
  // 공유 모듈 경로 (dist/backend/ 기준)
  '@shared/*': '../shared/*',
  '@shared/types/*': '../shared/types/*',
  '@shared/types/dto/*': '../shared/types/dto/*',
  '@shared/types/dto': '../shared/types/dto/index',
  '@shared/utils/*': '../shared/utils/*',
  '@shared/utils/transform/*': '../shared/utils/transform/*',
  '@shared/constants/*': '../shared/constants/*',
  '@shared/validation/*': '../shared/validation/*',
  '@shared/api/*': '../shared/api/*',
  
  // 레거시 별칭들
  '@types/*': '../shared/types/*',
  '@config/*': './config/*',
  '@controllers/*': './controllers/*',
  '@entities/*': './entities/*',
  '@middlewares/*': './middlewares/*',
  '@routes/*': './routes/*',
  '@services/*': './services/*',
  '@utils/*': './utils/*',
  '@transformers/*': './transformers/*',
  '@transformers': './transformers/index',
  '@dto/*': '../shared/types/dto/*',
  '@dto': '../shared/types/dto/index',
  '@domains/*': './domains/*',
  '@infrastructure/*': './infrastructure/*',
  '@constants/*': '../shared/constants/*',
  '@validation/*': '../shared/validation/*',
  '@api/*': '../shared/api/*',
  '@/shared/*': '../shared/*',
  '@/shared/utils/*': '../shared/utils/*',
  '@/shared/utils/transform/*': '../shared/utils/transform/*'
}

/**
 * 향상된 JS to CJS 변환 클래스
 */
class EnhancedJsToCjsConverter {
  private options: ConversionOptions
  private backupPath: string
  private conversionStats = {
    filesProcessed: 0,
    filesConverted: 0,
    pathAliasesFixed: 0,
    dependenciesFixed: 0,
    errors: 0
  }
  
  // 캐시된 파일 목록
  private cachedFiles: {
    jsFiles: string[]
    cjsFiles: string[]
    lastScan: number
  } = {
    jsFiles: [],
    cjsFiles: [],
    lastScan: 0
  }
  
  // ESM 문법 감지용 정규식 캐시
  private readonly esmPatterns = {
    import: /import\s+[^;]*from\s*['"]|import\s*\(|import\s*\{|import\s*\*|import\s+React|import\s+type\s+/,
    export: /export\s+[^;]*from\s*['"]|export\s*\{|export\s*\*|export\s+default|export\s+(const|let|var|function|class|async\s+function)|export\s+enum\s+|export\s+interface\s+/,
    importMeta: /import\.meta/,
    emptyExport: /export\s*\{\s*\}\s*;?/,
    dynamicImport: /import\s*\(/
  }

  constructor(options: ConversionOptions) {
    this.options = options
    this.backupPath = path.join(options.projectRoot, '.conversion-backup')
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
      
      // 2. 백업 생성 (필요한 경우)
      if (this.options.backup) {
        await this.createBackup()
      }
      
      // 3. JS 파일 찾기
      const jsFiles = this.findJsFiles()
      
      if (jsFiles.length === 0) {
        logWarning('변환할 .js 파일이 없습니다.')
      } else {
        log(`변환 대상: ${jsFiles.length}개 파일`, 'blue')
        
        // 4. 파일 변환
        await this.convertFiles(jsFiles)
      }
      
      // 5. CJS 파일에서 ESM 문법 변환
      await this.convertCjsFilesWithEsmSyntax()
      
      // 6. require 경로 수정
      await this.fixRequirePaths()
      
      // 7. 정리
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
   * JS/TS 파일 찾기 (최적화된 버전)
   */
  private findJsFiles(): string[] {
    // 캐시된 결과가 있으면 재사용
    const now = Date.now()
    if (this.cachedFiles.jsFiles.length > 0 && (now - this.cachedFiles.lastScan) < 5000) {
      return this.cachedFiles.jsFiles
    }
    
    logStep('SCAN', 'JS/TS 파일 스캔 중...')
    
    const jsFiles: string[] = []
    this.scanDirectory(this.options.distPath, jsFiles, ['.js', '.ts', '.tsx'])
    
    // 캐시 업데이트
    this.cachedFiles.jsFiles = jsFiles
    this.cachedFiles.lastScan = now
    
    log(`발견된 JS/TS 파일: ${jsFiles.length}개`, 'blue')
    
    // JS/TS 파일에서 ESM 문법 사용 여부 확인 (배치 처리)
    const esmInJsFiles = this.batchCheckEsmSyntax(jsFiles)
    log(`JS/TS 파일 중 ESM 문법 사용: ${esmInJsFiles}개`, 'blue')
    
    return jsFiles
  }

  /**
   * 디렉토리 스캔 (최적화된 버전)
   */
  private scanDirectory(dir: string, fileList: string[], extensions: string[] = ['.js', '.ts', '.tsx']): void {
    if (!fs.existsSync(dir)) {
      return
    }
    
    try {
      const items = fs.readdirSync(dir)
      
      for (const item of items) {
        const itemPath = path.join(dir, item)
        const stat = fs.statSync(itemPath)
        
        if (stat.isDirectory()) {
          // 특정 디렉토리는 제외 (프론트엔드 빌드 결과는 변환하지 않음)
          if (!['node_modules', '.git', '.conversion-backup', 'frontend'].includes(item)) {
            this.scanDirectory(itemPath, fileList, extensions)
          }
        } else if (extensions.some(ext => item.endsWith(ext)) && !item.endsWith('.min.js')) {
          fileList.push(itemPath)
        }
      }
    } catch (error) {
      logWarning(`디렉토리 스캔 실패: ${dir} - ${(error as Error).message}`)
    }
  }

  /**
   * 배치 ESM 문법 확인 (성능 최적화)
   */
  private batchCheckEsmSyntax(files: string[]): number {
    let esmCount = 0
    const batchSize = 10 // 한 번에 처리할 파일 수
    
    for (let i = 0; i < files.length; i += batchSize) {
      const batch = files.slice(i, i + batchSize)
      
      for (const file of batch) {
        try {
          const content = fs.readFileSync(file, 'utf8')
          if (this.hasEsmSyntax(content)) {
            esmCount++
          }
        } catch (error) {
          // 파일 읽기 실패는 무시
        }
      }
    }
    
    return esmCount
  }

  /**
   * 파일들 변환 (개선된 에러 처리)
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
        
        // 연속된 실패가 많으면 중단
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
   * 개별 파일 변환 (메모리 효율성 개선)
   */
  private async convertFile(filePath: string): Promise<boolean> {
    try {
      // 파일 크기 확인 (10MB 제한)
      const stats = fs.statSync(filePath)
      if (stats.size > 10 * 1024 * 1024) {
        logWarning(`파일이 너무 큽니다 (${(stats.size / 1024 / 1024).toFixed(2)}MB): ${path.relative(this.options.distPath, filePath)}`)
        return false
      }
      
      const content = fs.readFileSync(filePath, 'utf8')
      
      // 빈 파일이나 "use strict"만 있는 파일 처리
      if (content.trim() === '' || content.trim() === '"use strict";') {
        if (this.options.dryRun) {
          log(`빈 파일 삭제 예정: ${path.relative(this.options.distPath, filePath)}`, 'yellow')
          return true
        }
        
        // 빈 파일은 삭제
        fs.unlinkSync(filePath)
        log(`빈 파일 삭제됨: ${path.relative(this.options.distPath, filePath)}`, 'green')
        return true
      }
      
      // 변환 실행
      const convertedContent = this.convertContent(content, filePath)
      
      if (this.options.dryRun) {
        log(`변환 예정: ${path.relative(this.options.distPath, filePath)}`, 'yellow')
        return true
      }
      
      // .cjs 파일로 저장
      const cjsPath = this.getCjsPath(filePath)
      
      // 원자적 쓰기 (안전성 향상)
      const tempPath = cjsPath + '.tmp'
      fs.writeFileSync(tempPath, convertedContent)
      fs.renameSync(tempPath, cjsPath)
      
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
   * 이미 변환된 파일인지 확인
   */
  private isAlreadyConverted(content: string): boolean {
    // 이미 CommonJS 형태인지 확인
    const hasUseStrict = content.includes('"use strict"')
    const hasRequire = /require\s*\(/.test(content)
    const hasExports = /exports\.|module\.exports/.test(content)
    const hasObjectDefineProperty = content.includes('Object.defineProperty(exports')
    
    // ESM 문법이 있으면 변환이 필요함
    const hasImport = /import\s*[^;]*from\s*['"]/.test(content) || content.includes('import ')
    const hasExport = /export\s*[^;]*from\s*['"]/.test(content) || content.includes('export ')
    const hasImportMeta = content.includes('import.meta')
    
    // 빈 export 문도 ESM 문법으로 간주
    const hasEmptyExport = /export\s*\{\s*\}\s*;?/.test(content)
    const hasExportDefault = /export\s+default/.test(content)
    const hasExportDeclaration = /export\s+(const|let|var|function|class|async\s+function)/.test(content)
    
    // ESM 문법이 있으면 변환 필요
    if (hasImport || hasExport || hasImportMeta || hasEmptyExport || hasExportDefault || hasExportDeclaration) {
      return false
    }
    
    // CommonJS 문법이 있으면 이미 변환된 것으로 간주
    if (hasUseStrict && (hasRequire || hasExports || hasObjectDefineProperty)) {
      return true
    }
    
    // .js 파일이면 .cjs로 변환 필요 (확장자 변경)
    return false
  }

  /**
   * 내용 변환 (향상된 버전)
   */
  private convertContent(content: string, filePath: string): string {
    let convertedContent = content
    
    // ESM 문법이 있는지 먼저 확인
    const hasEsmSyntax = this.hasEsmSyntax(convertedContent)
    
    // 이미 CommonJS 형태이고 ESM 문법이 없는 경우 경로만 수정
    if (this.isAlreadyCommonJS(convertedContent) && !hasEsmSyntax) {
      // 1. 경로 별칭 변환 (가장 중요)
      if (this.options.fixPathAliases) {
        convertedContent = this.convertPathAliases(convertedContent, filePath)
      }
      
      // 2. require 경로를 .cjs로 수정
      convertedContent = this.fixRequireExtensions(convertedContent, filePath)
      
      return convertedContent
    }
    
    // ESM 형태인 경우 전체 변환
    // 1. import.meta.env 변환
    convertedContent = this.convertImportMetaEnv(convertedContent)
    
    // 2. import/export 변환
    if (this.needsImportExportConversion(convertedContent)) {
      convertedContent = this.convertImportExport(convertedContent, filePath)
    }
    
    // 3. 경로 별칭 변환
    if (this.options.fixPathAliases) {
      convertedContent = this.convertPathAliases(convertedContent, filePath)
    }
    
    // 4. 의존성 모듈 경로 수정
    if (this.options.fixDependencies) {
      convertedContent = this.fixDependencyPaths(convertedContent)
    }
    
    // 5. 기타 ESM 문법 변환
    convertedContent = this.convertOtherEsmSyntax(convertedContent)
    
    // 6. 최종 정리 - 빈 줄과 불필요한 세미콜론 정리
    convertedContent = this.cleanupConvertedContent(convertedContent)
    
    return convertedContent
  }

  /**
   * ESM 문법이 있는지 확인 (최적화된 버전)
   */
  private hasEsmSyntax(content: string): boolean {
    // 캐시된 정규식 패턴 사용으로 성능 향상
    return this.esmPatterns.import.test(content) ||
           this.esmPatterns.export.test(content) ||
           this.esmPatterns.importMeta.test(content) ||
           this.esmPatterns.emptyExport.test(content) ||
           this.esmPatterns.dynamicImport.test(content)
  }

  /**
   * 이미 CommonJS 형태인지 확인
   */
  private isAlreadyCommonJS(content: string): boolean {
    const hasUseStrict = content.includes('"use strict"')
    const hasRequire = /require\s*\(/.test(content)
    const hasExports = /exports\.|module\.exports/.test(content)
    const hasObjectDefineProperty = content.includes('Object.defineProperty(exports')
    
    return hasUseStrict && (hasRequire || hasExports || hasObjectDefineProperty)
  }

  /**
   * require 경로 확장자를 .cjs로 수정
   */
  private fixRequireExtensions(content: string, filePath: string): string {
    let convertedContent = content
    
    // 상대 경로의 .js 파일을 .cjs로 변경
    convertedContent = convertedContent.replace(
      /require\(['"]\.\/([^'"]+)\.js['"]\)/g,
      'require("./$1.cjs")'
    )
    
    convertedContent = convertedContent.replace(
      /require\(['"]\.\.\/([^'"]+)\.js['"]\)/g,
      'require("../$1.cjs")'
    )
    
    convertedContent = convertedContent.replace(
      /require\(['"]\.\.\/\.\.\/([^'"]+)\.js['"]\)/g,
      'require("../../$1.cjs")'
    )
    
    // 확장자가 없는 상대 경로도 .cjs로 변경 (해당 .cjs 파일이 존재하는 경우)
    convertedContent = convertedContent.replace(
      /require\(['"]\.\/([^'"]+)['"]\)/g,
      (match, moduleName) => {
        const cjsPath = path.join(path.dirname(filePath), `${moduleName}.cjs`)
        if (fs.existsSync(cjsPath)) {
          return `require("./${moduleName}.cjs")`
        }
        return match
      }
    )
    
    convertedContent = convertedContent.replace(
      /require\(['"]\.\.\/([^'"]+)['"]\)/g,
      (match, moduleName) => {
        const cjsPath = path.join(path.dirname(filePath), '..', `${moduleName}.cjs`)
        if (fs.existsSync(cjsPath)) {
          return `require("../${moduleName}.cjs")`
        }
        return match
      }
    )
    
    return convertedContent
  }

  /**
   * import.meta.env 변환
   */
  private convertImportMetaEnv(content: string): string {
    let convertedContent = content
    
    if (convertedContent.includes('import.meta.env')) {
      // VITE_ 변수들 먼저 처리
      convertedContent = convertedContent.replace(/import\.meta\.env\.VITE_([A-Z_]+)/g, 'process.env.VITE_$1')
      
      // 특수 변수들 처리
      convertedContent = convertedContent.replace(/import\.meta\.env\.MODE/g, 'process.env.NODE_ENV')
      convertedContent = convertedContent.replace(/import\.meta\.env\.DEV/g, 'process.env.NODE_ENV === "development"')
      convertedContent = convertedContent.replace(/import\.meta\.env\.PROD/g, 'process.env.NODE_ENV === "production"')
      
      // 일반 환경 변수들 처리
      convertedContent = convertedContent.replace(/import\.meta\.env\.([A-Z_]+)/g, 'process.env.$1')
      
      // 나머지 import.meta.env 처리
      convertedContent = convertedContent.replace(/import\.meta\.env/g, 'process.env')
    }
    
    return convertedContent
  }

  /**
   * import/export 변환 (향상된 버전)
   */
  private convertImportExport(content: string, filePath: string): string {
    let convertedContent = content
    
    // 1. 명명된 import 변환을 먼저 처리 (minified 코드도 처리)
    convertedContent = convertedContent.replace(
      /import\s*\{\s*([^}]+)\s*\}\s*from\s*['"]([^'"]+)['"]/g,
      (match, imports, modulePath) => {
        const resolvedPath = this.resolveModulePath(modulePath, filePath)
        // 'as' 키워드를 CommonJS 호환 형태로 변환
        const convertedImports = imports.replace(/(\w+)\s+as\s+(\w+)/g, '$1: $2')
        return `const { ${convertedImports} } = require('${resolvedPath}')`
      }
    )
    
    // 2. 기본 import 변환 (default import) - minified 코드도 처리
    convertedContent = convertedContent.replace(
      /import\s*(\w+)\s*from\s*['"]([^'"]+)['"]/g,
      (match, importName, modulePath) => {
        const resolvedPath = this.resolveModulePath(modulePath, filePath)
        return `const ${importName} = require('${resolvedPath}')`
      }
    )
    
    // 3. import "module" 변환 (side-effect import) - minified 코드도 처리
    convertedContent = convertedContent.replace(
      /import\s*['"]([^'"]+)['"]/g,
      (match, modulePath) => {
        const resolvedPath = this.resolveModulePath(modulePath, filePath)
        return `require('${resolvedPath}')`
      }
    )
    
    // 4. 네임스페이스 import 변환 - minified 코드도 처리
    convertedContent = convertedContent.replace(
      /import\s*\*\s*as\s*(\w+)\s*from\s*['"]([^'"]+)['"]/g,
      (match, namespaceName, modulePath) => {
        const resolvedPath = this.resolveModulePath(modulePath, filePath)
        return `const ${namespaceName} = require('${resolvedPath}')`
      }
    )
    
    // 5. 동적 import 변환
    convertedContent = convertedContent.replace(
      /import\s*\(['"]([^'"]+)['"]\)/g,
      (match, modulePath) => {
        const resolvedPath = this.resolveModulePath(modulePath, filePath)
        return `require('${resolvedPath}')`
      }
    )
    
    // 6. 기본 export 변환
    convertedContent = convertedContent.replace(
      /export\s+default\s+([^;]+)/g,
      'module.exports = $1'
    )
    
    // 7. 명명된 export 변환 (as 키워드 처리)
    convertedContent = convertedContent.replace(
      /export\s*\{\s*([^}]+)\s*\}/g,
      (match: string, exports: string) => {
        return exports.split(',').map(exp => {
          exp = exp.trim()
          // 'as' 키워드가 있는 경우 처리
          if (exp.includes(' as ')) {
            const [original, alias] = exp.split(' as ').map(s => s.trim())
            return `module.exports.${alias} = ${original}`
          }
          return `module.exports.${exp} = ${exp}`
        }).join('\n')
      }
    )
    
    // 8. export * from 변환 - minified 코드도 처리
    convertedContent = convertedContent.replace(
      /export\s*\*\s*from\s*['"]([^'"]+)['"]/g,
      (match, modulePath) => {
        const resolvedPath = this.resolveModulePath(modulePath, filePath)
        return `Object.assign(module.exports, require('${resolvedPath}'))`
      }
    )
    
    // 9. export const/let/var/function/class 변환
    convertedContent = convertedContent.replace(
      /export\s+(const|let|var|function|class)\s+(\w+)/g,
      (match, declaration, name) => {
        return `${declaration} ${name}\nmodule.exports.${name} = ${name}`
      }
    )
    
    // 10. export function 변환 (별도 처리)
    convertedContent = convertedContent.replace(
      /export\s+function\s+(\w+)/g,
      (match, name) => {
        return `function ${name}`
      }
    )
    
    // 11. export async function 변환
    convertedContent = convertedContent.replace(
      /export\s+async\s+function\s+(\w+)/g,
      (match, name) => {
        return `async function ${name}`
      }
    )
    
    // 12. 빈 export 문 제거 (더 포괄적인 패턴)
    convertedContent = convertedContent.replace(/export\s*\{\s*\}\s*;?/g, '')
    
    // 13. export {} 문 제거 (세미콜론이 있는 경우)
    convertedContent = convertedContent.replace(/export\s*\{\s*\}\s*;/g, '')
    
    // 14. export {} 문 제거 (세미콜론이 없는 경우)
    convertedContent = convertedContent.replace(/export\s*\{\s*\}/g, '')
    
    // 15. 남은 export 문들 제거 (더 포괄적인 패턴)
    convertedContent = convertedContent.replace(/export\s*\{\s*[^}]*\}/g, '')
    
    // 16. TypeScript 타입 전용 import 제거 (정확한 패턴)
    convertedContent = convertedContent.replace(/^import\s+type\s+[^;]+;?\s*$/gm, '')
    
    // 17. TypeScript 타입 전용 export 제거 (정확한 패턴)
    convertedContent = convertedContent.replace(/^export\s+type\s+[^;]+;?\s*$/gm, '')
    
    // 18. TypeScript interface export 제거 (멀티라인 정확한 패턴)
    convertedContent = convertedContent.replace(/^export\s+interface\s+[^{]*\{[^}]*\};?\s*$/gm, '')

    // 19. TypeScript enum export 변환
    convertedContent = convertedContent.replace(
      /export\s+enum\s+(\w+)\s*\{([^}]*)\}/g,
      (match, enumName, enumBody) => {
        // enum을 CommonJS 형태로 변환
        const enumValues = enumBody.split(',').map((item: string) => {
          const trimmed = item.trim()
          if (trimmed.includes('=')) {
            return trimmed
          }
          return `${trimmed} = "${trimmed}"`
        }).join(', ')
        
        return `const ${enumName} = {\n  ${enumValues}\n}\nmodule.exports.${enumName} = ${enumName}`
      }
    )

    // 20. React 컴포넌트 import 변환
    convertedContent = convertedContent.replace(
      /import\s+React\s*,\s*\{([^}]+)\}\s*from\s*['"]react['"]/g,
      (match, reactImports) => {
        const imports = reactImports.split(',').map((imp: string) => imp.trim()).join(', ')
        return `const React = require('react')\nconst { ${imports} } = require('react')`
      }
    )

    // 21. React 단독 import 변환
    convertedContent = convertedContent.replace(
      /import\s+React\s*from\s*['"]react['"]/g,
      'const React = require("react")'
    )

    // 22. React hooks import 변환
    convertedContent = convertedContent.replace(
      /import\s*\{([^}]+)\}\s*from\s*['"]react['"]/g,
      (match, hooks) => {
        const hookList = hooks.split(',').map((hook: string) => hook.trim()).join(', ')
        return `const { ${hookList} } = require('react')`
      }
    )

    // 23. 남은 export 문들 제거 (정확한 패턴)
    convertedContent = convertedContent.replace(/^export\s*\{\s*[^}]*\};?\s*$/gm, '')

    return convertedContent
  }

  /**
   * 경로 별칭 변환
   */
  private convertPathAliases(content: string, filePath: string): string {
    let convertedContent = content
    
    // 경로 별칭을 실제 상대 경로로 변환
    for (const [alias, realPath] of Object.entries(pathAliases)) {
      const aliasPattern = alias.replace('*', '([^"\']+)')
      const regex = new RegExp(`['"]${aliasPattern}['"]`, 'g')
      
      convertedContent = convertedContent.replace(regex, (match, subPath) => {
        const fullRealPath = realPath.replace('*', subPath)
        const relativePath = this.calculateRelativePath(filePath, fullRealPath)
        this.conversionStats.pathAliasesFixed++
        return `'${relativePath}'`
      })
    }
    
    return convertedContent
  }

  /**
   * 상대 경로 계산 (현재 빌드 구조에 맞게 수정)
   */
  private calculateRelativePath(fromFile: string, toPath: string): string {
    const fromDir = path.dirname(fromFile)
    
    // dist/backend/backend/ 기준으로 경로 계산
    let relativePath: string
    
    if (toPath.startsWith('./')) {
      // 같은 디렉토리 내 파일
      relativePath = path.relative(fromDir, path.join(fromDir, toPath.substring(2)))
    } else if (toPath.startsWith('../shared/')) {
      // shared 모듈로의 경로
      const sharedPath = path.join(path.dirname(fromDir), '..', toPath.substring(3))
      relativePath = path.relative(fromDir, sharedPath)
    } else {
      // 기타 경로
      relativePath = path.relative(fromDir, toPath)
    }
    
    // Windows 경로를 Unix 스타일로 변환
    return relativePath.replace(/\\/g, '/')
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
    
    // 상대 경로에서 node_modules 제거
    convertedContent = convertedContent.replace(
      /require\(['"]\.\.\/\.\.\/node_modules\/([^'"]+)['"]\)/g,
      "require('$1')"
    )
    
    this.conversionStats.dependenciesFixed++
    return convertedContent
  }

  /**
   * 기타 ESM 문법 변환
   */
  private convertOtherEsmSyntax(content: string): string {
    let convertedContent = content
    
    // import() 동적 import 변환
    convertedContent = convertedContent.replace(
      /import\(['"]([^'"]+)['"]\)/g,
      "require('$1')"
    )
    
    // __dirname, __filename 변환 (ESM에서는 사용 불가)
    if (convertedContent.includes('import.meta.url')) {
      convertedContent = convertedContent.replace(
        /import\.meta\.url/g,
        '__filename'
      )
    }
    
    // __dirname 사용 시 CommonJS에서 정상 작동하도록 보장
    // CommonJS에서는 __dirname이 자동 제공되므로, const __dirname = ... 선언 제거
    // 더 포괄적인 패턴으로 개선 (모든 변형 처리)
    
    // 패턴 1: const __dirname = (0, pathUtils_1.getDirname)();
    convertedContent = convertedContent.replace(
      /const __dirname\s*=\s*\(0,\s*[^)]*\)\.getDirname\(\)\s*;?\s*/g,
      '// __dirname is automatically available in CommonJS\n'
    )
    
    // 패턴 2: const __dirname = (pathUtils_1.getDirname)();
    convertedContent = convertedContent.replace(
      /const __dirname\s*=\s*\([^)]*\)\.getDirname\(\)\s*;?\s*/g,
      '// __dirname is automatically available in CommonJS\n'
    )
    
    // 패턴 3: const __dirname = getDirname();
    convertedContent = convertedContent.replace(
      /const __dirname\s*=\s*getDirname\(\)\s*;?\s*/g,
      '// __dirname is automatically available in CommonJS\n'
    )
    
    // 패턴 4: const __dirname = pathUtils_1.getDirname();
    convertedContent = convertedContent.replace(
      /const __dirname\s*=\s*pathUtils_[^.]*\.getDirname\(\)\s*;?\s*/g,
      '// __dirname is automatically available in CommonJS\n'
    )
    
    // 패턴 6: const __dirname = require('path').dirname(__filename) (다른 형태)
    convertedContent = convertedContent.replace(
      /const __dirname\s*=\s*require\(['"]path['"]\)\.dirname\(__filename\)\s*;?\s*/g,
      '// __dirname is automatically available in CommonJS\n'
    )
    
    // 패턴 7: const __dirname = require("path").dirname(__filename) (다른 따옴표)
    convertedContent = convertedContent.replace(
      /const __dirname\s*=\s*require\(["']path["']\)\.dirname\(__filename\)\s*;?\s*/g,
      '// __dirname is automatically available in CommonJS\n'
    )
    
    // 패턴 8: let __dirname = ... 또는 var __dirname = ... (다른 선언 키워드)
    convertedContent = convertedContent.replace(
      /(let|var)\s+__dirname\s*=\s*[^;]+;?\s*/g,
      '// __dirname is automatically available in CommonJS\n'
    )
    
    // pathUtils_1.getDirname() 호출을 __dirname으로 직접 교체 (사용되는 곳에서)
    // 하지만 선언이 아닌 사용 부분은 제외하고 선언만 제거
    
    // __dirname 사용 시 필요한 require 추가 (path가 필요한 경우)
    if (convertedContent.includes('__dirname') && convertedContent.includes('path.resolve') || convertedContent.includes('path.join')) {
      if (!convertedContent.includes('const path = require(') && 
          !convertedContent.includes('import path from') &&
          !convertedContent.includes('require("path")') &&
          !convertedContent.includes("require('path')")) {
        convertedContent = `const path = require('path');\n${convertedContent}`
      }
    }
    
    return convertedContent
  }

  /**
   * 변환된 내용 정리
   */
  private cleanupConvertedContent(content: string): string {
    let cleanedContent = content
    
    // 연속된 빈 줄을 하나로 줄이기
    cleanedContent = cleanedContent.replace(/\n\s*\n\s*\n/g, '\n\n')
    
    // 파일 끝의 불필요한 세미콜론과 빈 줄 제거
    cleanedContent = cleanedContent.replace(/;\s*$/, '')
    cleanedContent = cleanedContent.replace(/\n\s*$/, '')
    
    // 빈 export 문이 남아있으면 제거
    cleanedContent = cleanedContent.replace(/export\s*\{\s*\}\s*;?/g, '')
    
    return cleanedContent
  }

  /**
   * 모듈 경로 해석
   */
  private resolveModulePath(modulePath: string, currentFilePath: string): string {
    // 절대 경로나 node_modules는 그대로 반환
    if (modulePath.startsWith('/') || !modulePath.startsWith('.')) {
      return modulePath
    }
    
    // 상대 경로는 .cjs 확장자로 변환
    if (modulePath.endsWith('.js')) {
      return modulePath.replace('.js', '.cjs')
    }
    
    return modulePath
  }


  /**
   * import/export 변환이 필요한지 확인
   */
  private needsImportExportConversion(content: string): boolean {
    // minified 코드도 감지
    const hasImport = /import\s*[^;]*from\s*['"]/.test(content) || content.includes('import ')
    const hasExport = /export\s*[^;]*from\s*['"]/.test(content) || content.includes('export ')
    
    // 빈 export 문도 ESM 문법으로 간주 (export {}; export {};)
    const hasEmptyExport = /export\s*\{\s*\}\s*;?/.test(content)
    
    // export default, export const, export function 등도 감지
    const hasExportDefault = /export\s+default/.test(content)
    const hasExportDeclaration = /export\s+(const|let|var|function|class|async\s+function)/.test(content)
    
    // import.meta도 ESM 문법
    const hasImportMeta = content.includes('import.meta')
    
    return hasImport || hasExport || hasEmptyExport || hasExportDefault || hasExportDeclaration || hasImportMeta
  }

  /**
   * require 경로 수정
   */
  private async fixRequirePaths(): Promise<void> {
    logStep('FIX_REQUIRES', 'require 경로를 .cjs 확장자로 수정...')
    
    const cjsFiles = this.findCjsFiles()
    
    for (const cjsFile of cjsFiles) {
      try {
        const content = fs.readFileSync(cjsFile, 'utf8')
        let modifiedContent = content
        
        // require 경로 수정 - 더 포괄적인 패턴
        modifiedContent = modifiedContent.replace(/require\("\.\/([^"]+)\.js"\)/g, 'require("./$1.cjs")')
        modifiedContent = modifiedContent.replace(/require\("\.\/([^"]+)"\)/g, (match, moduleName) => {
          // .cjs 파일이 존재하는지 확인
          const cjsPath = path.join(path.dirname(cjsFile), `${moduleName}.cjs`)
          if (fs.existsSync(cjsPath)) {
            return `require("./${moduleName}.cjs")`
          }
          return match
        })
        
        modifiedContent = modifiedContent.replace(/require\("\.\.\/([^"]+)\.js"\)/g, 'require("../$1.cjs")')
        modifiedContent = modifiedContent.replace(/require\("\.\.\/([^"]+)"\)/g, (match, moduleName) => {
          // .cjs 파일이 존재하는지 확인
          const cjsPath = path.join(path.dirname(cjsFile), '..', `${moduleName}.cjs`)
          if (fs.existsSync(cjsPath)) {
            return `require("../${moduleName}.cjs")`
          }
          return match
        })
        
        // 더 깊은 상대 경로 처리
        modifiedContent = modifiedContent.replace(/require\("\.\.\/\.\.\/([^"]+)\.js"\)/g, 'require("../../$1.cjs")')
        modifiedContent = modifiedContent.replace(/require\("\.\.\/\.\.\/([^"]+)"\)/g, (match, moduleName) => {
          const cjsPath = path.join(path.dirname(cjsFile), '..', '..', `${moduleName}.cjs`)
          if (fs.existsSync(cjsPath)) {
            return `require("../../${moduleName}.cjs")`
          }
          return match
        })
        
        if (modifiedContent !== content) {
          if (!this.options.dryRun) {
            fs.writeFileSync(cjsFile, modifiedContent, 'utf8')
          }
          log(`require 경로 수정됨: ${path.relative(this.options.distPath, cjsFile)}`, 'green')
        }
      } catch (error) {
        logWarning(`require 경로 수정 실패: ${cjsFile} - ${(error as Error).message}`)
      }
    }
  }

  /**
   * CJS 파일 찾기 (최적화된 버전)
   */
  private findCjsFiles(): string[] {
    // 캐시된 결과가 있으면 재사용
    const now = Date.now()
    if (this.cachedFiles.cjsFiles.length > 0 && (now - this.cachedFiles.lastScan) < 5000) {
      return this.cachedFiles.cjsFiles
    }
    
    const cjsFiles: string[] = []
    this.scanDirectory(this.options.distPath, cjsFiles, ['.cjs'])
    
    // 캐시 업데이트
    this.cachedFiles.cjsFiles = cjsFiles
    this.cachedFiles.lastScan = now
    
    return cjsFiles
  }

  /**
   * CJS 파일에서 ESM 문법 변환 (개선된 버전)
   */
  private async convertCjsFilesWithEsmSyntax(): Promise<void> {
    logStep('CONVERT_CJS', 'CJS 파일에서 ESM 문법 변환 중...')
    
    const cjsFiles = this.findCjsFiles()
    let convertedCount = 0
    let esmFoundCount = 0
    
    log(`[SCAN] CJS 파일 스캔 중...`, 'cyan')
    log(`발견된 CJS 파일: ${cjsFiles.length}개`, 'blue')
    
    for (const cjsFile of cjsFiles) {
      try {
        const content = fs.readFileSync(cjsFile, 'utf8')
        
        // ESM 문법이 있는지 확인
        if (this.hasEsmSyntax(content)) {
          log(`CJS 파일에서 ESM 문법 발견: ${path.relative(this.options.distPath, cjsFile)}`, 'yellow')
          esmFoundCount++
          
          // 변환 실행 - CJS 파일에 특화된 변환
          const convertedContent = this.convertCjsFileContent(content, cjsFile)
          
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
      log(`변환을 실행하려면 다음 명령을 사용하세요:`, 'cyan')
      log(`  npx ts-node scripts/enhanced-js-to-cjs-converter.ts --verbose`, 'cyan')
    }
    
    log(`CJS 파일 변환 완료: ${convertedCount}개`, 'green')
  }

  /**
   * 통합된 변환 로직 (중복 제거)
   */
  private convertCjsFileContent(content: string, filePath: string): string {
    // 기존 convertContent 메서드 재사용 (중복 제거)
    return this.convertContent(content, filePath)
  }


  /**
   * 정리 작업
   */
  private async cleanup(): Promise<void> {
    logStep('CLEANUP', '정리 작업 중...')
    
    try {
      // 백업 폴더 정리 (선택적)
      if (this.options.backup && fs.existsSync(this.backupPath)) {
        // 백업은 유지 (안전을 위해)
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
        // 백업에서 복원
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
   * 변환 통계 출력 (개선된 버전)
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
 * 구분선 출력
 */
function logSeparator(char: string, length: number, color: keyof typeof colors = 'reset'): void {
  log(char.repeat(length), color)
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
