#!/usr/bin/env node

/**
 * 수정된 JS to CJS 변환 스크립트
 * - 원본 파일을 절대 수정하지 않음
 * - dist 폴더에서만 변환 작업 수행
 * - 프로젝트 구조에 맞게 최적화
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
}

/**
 * 기본 변환 옵션
 */
const defaultOptions: ConversionOptions = {
  projectRoot: process.cwd(),
  distPath: path.join(process.cwd(), 'dist'),
  verbose: false,
  dryRun: false,
  backup: true
}

/**
 * 수정된 JS to CJS 변환 클래스
 */
class FixedJsToCjsConverter {
  private options: ConversionOptions
  private backupPath: string

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
      log('🚀 JS to CJS 변환을 시작합니다... (수정된 버전)', 'bright')
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
        return true
      }
      
      log(`변환 대상: ${jsFiles.length}개 파일`, 'blue')
      
      // 4. 파일 변환
      const results = await this.convertFiles(jsFiles)
      
      // 5. require 경로 수정
      await this.fixRequirePaths()
      
      // 6. 정리
      await this.cleanup()
      
      const duration = ((Date.now() - startTime) / 1000).toFixed(2)
      logSuccess(`JS to CJS 변환이 완료되었습니다! (소요시간: ${duration}초)`)
      logSuccess(`성공: ${results.success}개, 실패: ${results.failed}개`)
      logSeparator('=', 60, 'green')
      
      return results.failed === 0
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
   * JS 파일 찾기
   */
  private findJsFiles(): string[] {
    logStep('SCAN', 'JS 파일 스캔 중...')
    
    const jsFiles: string[] = []
    this.scanDirectory(this.options.distPath, jsFiles)
    
    log(`발견된 JS 파일: ${jsFiles.length}개`, 'blue')
    return jsFiles
  }

  /**
   * 디렉토리 스캔
   */
  private scanDirectory(dir: string, jsFiles: string[]): void {
    if (!fs.existsSync(dir)) {
      return
    }
    
    const items = fs.readdirSync(dir)
    
    for (const item of items) {
      const itemPath = path.join(dir, item)
      const stat = fs.statSync(itemPath)
      
      if (stat.isDirectory()) {
        // 특정 디렉토리는 제외
        if (!['node_modules', '.git', '.conversion-backup'].includes(item)) {
          this.scanDirectory(itemPath, jsFiles)
        }
      } else if (item.endsWith('.js') && !item.endsWith('.min.js')) {
        jsFiles.push(itemPath)
      }
    }
  }

  /**
   * 파일들 변환
   */
  private async convertFiles(jsFiles: string[]): Promise<{ success: number; failed: number }> {
    logStep('CONVERT', '파일 변환 중...')
    
    let success = 0
    let failed = 0
    
    for (const jsFile of jsFiles) {
      try {
        if (await this.convertFile(jsFile)) {
          success++
        } else {
          failed++
        }
      } catch (error) {
        logError(`파일 변환 실패: ${jsFile} - ${(error as Error).message}`)
        failed++
      }
    }
    
    return { success, failed }
  }

  /**
   * 개별 파일 변환
   */
  private async convertFile(filePath: string): Promise<boolean> {
    try {
      const content = fs.readFileSync(filePath, 'utf8')
      
      // 이미 변환된 파일인지 확인
      if (this.isAlreadyConverted(content)) {
        log(`이미 변환됨: ${path.relative(this.options.distPath, filePath)}`, 'yellow')
        return true
      }
      
      // 변환 실행
      const convertedContent = this.convertContent(content)
      
      if (convertedContent !== content) {
        if (this.options.dryRun) {
          log(`변환 예정: ${path.relative(this.options.distPath, filePath)}`, 'yellow')
          return true
        }
        
        // .cjs 파일로 저장
        const cjsPath = filePath.replace('.js', '.cjs')
        fs.writeFileSync(cjsPath, convertedContent)
        
        // 원본 .js 파일 삭제
        fs.unlinkSync(filePath)
        
        log(`변환됨: ${path.relative(this.options.distPath, filePath)} → ${path.relative(this.options.distPath, cjsPath)}`, 'green')
      } else {
        log(`변환 불필요: ${path.relative(this.options.distPath, filePath)}`, 'yellow')
      }
      
      return true
    } catch (error) {
      logError(`파일 변환 실패: ${filePath} - ${(error as Error).message}`)
      return false
    }
  }

  /**
   * 이미 변환된 파일인지 확인
   */
  private isAlreadyConverted(content: string): boolean {
    // process.env를 사용하고 있고 import.meta.env가 없으면 변환됨
    const hasProcessEnv = content.includes('process.env')
    const hasImportMeta = content.includes('import.meta.env')
    
    return hasProcessEnv && !hasImportMeta
  }

  /**
   * 내용 변환
   */
  private convertContent(content: string): string {
    let convertedContent = content
    
    // import.meta.env 변환
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
    
    // import/export 변환 (필요한 경우에만)
    if (this.needsImportExportConversion(convertedContent)) {
      // 기본 import 변환
      convertedContent = convertedContent.replace(/import\s+(\w+)\s+from\s+['"]([^'"]+)['"]/g, 'const $1 = require(\'$2\').default')
      
      // 명명된 import 변환
      convertedContent = convertedContent.replace(/import\s*\{\s*([^}]+)\s*\}\s+from\s+['"]([^'"]+)['"]/g, 'const { $1 } = require(\'$2\')')
      
      // 네임스페이스 import 변환
      convertedContent = convertedContent.replace(/import\s+\*\s+as\s+(\w+)\s+from\s+['"]([^'"]+)['"]/g, 'const $1 = require(\'$2\')')
      
      // 기본 export 변환
      convertedContent = convertedContent.replace(/export\s+default\s+([^;]+)/g, 'module.exports.default = $1')
      
      // 명명된 export 변환
      convertedContent = convertedContent.replace(/export\s*\{\s*([^}]+)\s*\}/g, (match: string, exports: string) => {
        return exports.split(',').map(exp => {
          exp = exp.trim()
          return `module.exports.${exp} = ${exp}`
        }).join('\n')
      })
    }
    
    return convertedContent
  }

  /**
   * import/export 변환이 필요한지 확인
   */
  private needsImportExportConversion(content: string): boolean {
    return content.includes('import ') || content.includes('export ')
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
        
        // require 경로 수정
        modifiedContent = modifiedContent.replace(/require\("\.\/([^"]+)\.js"\)/g, 'require("./$1.cjs")')
        modifiedContent = modifiedContent.replace(/require\("\.\/([^"]+)"\)/g, 'require("./$1.cjs")')
        modifiedContent = modifiedContent.replace(/require\("\.\.\/([^"]+)\.js"\)/g, 'require("../$1.cjs")')
        modifiedContent = modifiedContent.replace(/require\("\.\.\/([^"]+)"\)/g, 'require("../$1.cjs")')
        
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
   * CJS 파일 찾기
   */
  private findCjsFiles(): string[] {
    const cjsFiles: string[] = []
    this.scanDirectoryForCjs(this.options.distPath, cjsFiles)
    return cjsFiles
  }

  /**
   * CJS 파일 스캔
   */
  private scanDirectoryForCjs(dir: string, cjsFiles: string[]): void {
    if (!fs.existsSync(dir)) {
      return
    }
    
    const items = fs.readdirSync(dir)
    
    for (const item of items) {
      const itemPath = path.join(dir, item)
      const stat = fs.statSync(itemPath)
      
      if (stat.isDirectory()) {
        if (!['node_modules', '.git', '.conversion-backup'].includes(item)) {
          this.scanDirectoryForCjs(itemPath, cjsFiles)
        }
      } else if (item.endsWith('.cjs')) {
        cjsFiles.push(itemPath)
      }
    }
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
사용법: node js-to-cjs-converter-fixed.ts [옵션]

옵션:
  -p, --project-root <path>   프로젝트 루트 경로
  -d, --dist-path <path>      dist 폴더 경로
  -v, --verbose               상세 로그 활성화
  --dry-run                   드라이 런 모드
  --no-backup                 백업 생성하지 않음
  -h, --help                  도움말 출력

예시:
  node js-to-cjs-converter-fixed.ts --verbose
  node js-to-cjs-converter-fixed.ts --dry-run
  node js-to-cjs-converter-fixed.ts --no-backup
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
    
    const converter = new FixedJsToCjsConverter(finalOptions)
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
async function runIfMain() {
  try {
    const __filename = fileURLToPath(import.meta.url)
    if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename)) {
      await main()
      return
    }
  } catch (e) {
    // import.meta가 없는 환경에서 무시
  }
}

runIfMain().catch(error => {
  logError(`실행 실패: ${error.message}`)
  process.exit(1)
})

export { FixedJsToCjsConverter, main }
