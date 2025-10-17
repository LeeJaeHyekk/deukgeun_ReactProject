#!/usr/bin/env node

/**
 * 향상된 최적화 빌드 스크립트
 * - 의존성 문제 해결
 * - 경로 별칭 문제 해결
 * - 타입 정의 문제 해결
 * - 향상된 ESM to CJS 변환
 */

import * as fs from 'fs'
import * as path from 'path'
import { execSync } from 'child_process'
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
 * 빌드 옵션 인터페이스
 */
interface BuildOptions {
  projectRoot: string
  cleanDist: boolean
  buildBackend: boolean
  buildFrontend: boolean
  convertToCjs: boolean
  fixDependencies: boolean
  fixPathAliases: boolean
  verbose: boolean
  dryRun: boolean
}

/**
 * 기본 빌드 옵션
 */
const defaultOptions: BuildOptions = {
  projectRoot: process.cwd(),
  cleanDist: true,
  buildBackend: true,
  buildFrontend: true,
  convertToCjs: true,
  fixDependencies: true,
  fixPathAliases: true,
  verbose: false,
  dryRun: false
}

/**
 * 향상된 빌드 프로세스 클래스
 */
class EnhancedBuildProcess {
  private options: BuildOptions
  private distPath: string
  private tempPath: string

  constructor(options: BuildOptions) {
    this.options = options
    this.distPath = path.join(options.projectRoot, 'dist')
    this.tempPath = path.join(options.projectRoot, '.temp-build')
  }

  /**
   * 전체 빌드 프로세스 실행
   */
  async execute(): Promise<boolean> {
    const startTime = Date.now()
    
    try {
      log('🚀 향상된 빌드 프로세스를 시작합니다...', 'bright')
      logSeparator('=', 60, 'bright')
      
      // 1. 빌드 전 준비
      await this.prepareBuild()
      
      // 2. 의존성 설치 확인
      if (this.options.fixDependencies) {
        await this.ensureDependencies()
      }
      
      // 3. 백엔드 빌드
      if (this.options.buildBackend) {
        await this.buildBackend()
      }
      
      // 4. 프론트엔드 빌드
      if (this.options.buildFrontend) {
        await this.buildFrontend()
      }
      
      // 5. JS to CJS 변환 (dist 폴더에서만)
      if (this.options.convertToCjs) {
        await this.convertJsToCjs()
      }
      
      // 6. 빌드 후 정리
      await this.cleanup()
      
      const duration = ((Date.now() - startTime) / 1000).toFixed(2)
      logSuccess(`빌드가 완료되었습니다! (소요시간: ${duration}초)`)
      logSeparator('=', 60, 'green')
      
      return true
    } catch (error) {
      logError(`빌드 실패: ${(error as Error).message}`)
      await this.emergencyCleanup()
      return false
    }
  }

  /**
   * 빌드 전 준비 작업
   */
  private async prepareBuild(): Promise<void> {
    logStep('PREPARE', '빌드 전 준비 작업...')
    
    if (this.options.dryRun) {
      logWarning('드라이 런 모드: 실제 빌드하지 않습니다.')
      return
    }
    
    // dist 폴더 정리
    if (this.options.cleanDist && fs.existsSync(this.distPath)) {
      log('dist 폴더를 정리합니다...', 'blue')
      fs.rmSync(this.distPath, { recursive: true, force: true })
    }
    
    // 임시 폴더 생성
    if (fs.existsSync(this.tempPath)) {
      fs.rmSync(this.tempPath, { recursive: true, force: true })
    }
    fs.mkdirSync(this.tempPath, { recursive: true })
    
    logSuccess('빌드 준비 완료')
  }

  /**
   * 의존성 설치 확인
   */
  private async ensureDependencies(): Promise<void> {
    logStep('DEPENDENCIES', '의존성 확인 중...')
    
    if (this.options.dryRun) {
      log('의존성 확인 (드라이 런)', 'yellow')
      return
    }
    
    try {
      // package.json에서 누락된 의존성 확인
      const packageJsonPath = path.join(this.options.projectRoot, 'package.json')
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
      
      const requiredDeps = [
        'cors', 'helmet', 'morgan', 'cookie-parser', 
        'cheerio', 'nodemailer', 'winston'
      ]
      
      const missingDeps = requiredDeps.filter(dep => 
        !packageJson.dependencies?.[dep] && !packageJson.devDependencies?.[dep]
      )
      
      if (missingDeps.length > 0) {
        logWarning(`누락된 의존성 발견: ${missingDeps.join(', ')}`)
        log('의존성을 설치합니다...', 'blue')
        
        // npm install 실행
        execSync(`npm install ${missingDeps.join(' ')}`, {
          stdio: this.options.verbose ? 'inherit' : 'pipe',
          cwd: this.options.projectRoot,
          timeout: 300000 // 5분
        })
        
        logSuccess('의존성 설치 완료')
      } else {
        logSuccess('모든 의존성이 설치되어 있습니다')
      }
    } catch (error) {
      logWarning(`의존성 확인 실패: ${(error as Error).message}`)
    }
  }

  /**
   * 백엔드 빌드 (향상된 버전)
   */
  private async buildBackend(): Promise<void> {
    logStep('BACKEND', '백엔드 빌드 중...')
    
    if (this.options.dryRun) {
      log('백엔드 빌드 (드라이 런)', 'yellow')
      return
    }
    
    try {
      // 백엔드 TypeScript 컴파일 (빌드용 설정 사용)
      execSync('npx tsc -p src/backend/tsconfig.build.json', {
        stdio: this.options.verbose ? 'inherit' : 'pipe',
        cwd: this.options.projectRoot,
        timeout: 300000 // 5분
      })
      
      logSuccess('백엔드 빌드 완료')
    } catch (error) {
      logError(`백엔드 빌드 실패: ${(error as Error).message}`)
      
      // 빌드 오류 상세 정보 출력
      if (this.options.verbose) {
        logError('빌드 오류 상세 정보:')
        console.error(error)
      }
      
      throw error
    }
  }

  /**
   * 프론트엔드 빌드
   */
  private async buildFrontend(): Promise<void> {
    logStep('FRONTEND', '프론트엔드 빌드 중...')
    
    if (this.options.dryRun) {
      log('프론트엔드 빌드 (드라이 런)', 'yellow')
      return
    }
    
    try {
      // Vite 빌드 실행
      execSync('npx vite build', {
        stdio: this.options.verbose ? 'inherit' : 'pipe',
        cwd: this.options.projectRoot,
        timeout: 300000 // 5분
      })
      
      logSuccess('프론트엔드 빌드 완료')
    } catch (error) {
      logError(`프론트엔드 빌드 실패: ${(error as Error).message}`)
      throw error
    }
  }

  /**
   * JS to CJS 변환 (향상된 버전)
   */
  private async convertJsToCjs(): Promise<void> {
    logStep('CONVERT', 'JS to CJS 변환 중...')
    
    if (this.options.dryRun) {
      log('JS to CJS 변환 (드라이 런)', 'yellow')
      return
    }
    
    if (!fs.existsSync(this.distPath)) {
      logWarning('dist 폴더가 존재하지 않습니다.')
      return
    }
    
    try {
      // 향상된 변환 스크립트 실행
      const converterScript = path.join(this.options.projectRoot, 'scripts', 'enhanced-js-to-cjs-converter.ts')
      
      if (fs.existsSync(converterScript)) {
        execSync(`npx tsx ${converterScript} --verbose`, {
          stdio: this.options.verbose ? 'inherit' : 'pipe',
          cwd: this.options.projectRoot,
          timeout: 300000 // 5분
        })
      } else {
        // 기본 변환 로직 실행
        await this.basicConvertJsToCjs()
      }
      
      logSuccess('JS to CJS 변환 완료')
    } catch (error) {
      logError(`JS to CJS 변환 실패: ${(error as Error).message}`)
      throw error
    }
  }

  /**
   * 기본 JS to CJS 변환 (fallback)
   */
  private async basicConvertJsToCjs(): Promise<void> {
    const jsFiles = this.findJsFiles(this.distPath)
    
    if (jsFiles.length === 0) {
      logWarning('변환할 .js 파일이 없습니다.')
      return
    }
    
    log(`변환 대상: ${jsFiles.length}개 파일`, 'blue')
    
    for (const jsFile of jsFiles) {
      await this.convertFile(jsFile)
    }
  }

  /**
   * .js 파일 찾기
   */
  private findJsFiles(dir: string): string[] {
    const jsFiles: string[] = []
    
    if (!fs.existsSync(dir)) {
      return jsFiles
    }
    
    const items = fs.readdirSync(dir)
    
    for (const item of items) {
      const itemPath = path.join(dir, item)
      const stat = fs.statSync(itemPath)
      
      if (stat.isDirectory()) {
        // 특정 디렉토리는 제외
        if (!['node_modules', '.git', '.temp-build'].includes(item)) {
          jsFiles.push(...this.findJsFiles(itemPath))
        }
      } else if (item.endsWith('.js') && !item.endsWith('.min.js')) {
        jsFiles.push(itemPath)
      }
    }
    
    return jsFiles
  }

  /**
   * 개별 파일 변환
   */
  private async convertFile(filePath: string): Promise<void> {
    try {
      const content = fs.readFileSync(filePath, 'utf8')
      
      // 이미 변환된 파일인지 확인
      if (this.isAlreadyConverted(content)) {
        log(`이미 변환됨: ${path.relative(this.distPath, filePath)}`, 'yellow')
        return
      }
      
      // 변환 실행
      const convertedContent = this.convertContent(content)
      
      if (convertedContent !== content) {
        // .cjs 파일로 저장
        const cjsPath = filePath.replace('.js', '.cjs')
        fs.writeFileSync(cjsPath, convertedContent)
        
        // 원본 .js 파일 삭제
        fs.unlinkSync(filePath)
        
        log(`변환됨: ${path.relative(this.distPath, filePath)} → ${path.relative(this.distPath, cjsPath)}`, 'green')
      } else {
        log(`변환 불필요: ${path.relative(this.distPath, filePath)}`, 'yellow')
      }
    } catch (error) {
      logError(`파일 변환 실패: ${filePath} - ${(error as Error).message}`)
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
   * 빌드 후 정리
   */
  private async cleanup(): Promise<void> {
    logStep('CLEANUP', '빌드 후 정리 중...')
    
    try {
      // 임시 폴더 삭제
      if (fs.existsSync(this.tempPath)) {
        fs.rmSync(this.tempPath, { recursive: true, force: true })
      }
      
      // require 경로 수정
      await this.fixRequirePaths()
      
      // dist 폴더 구조 정리
      await this.organizeDistStructure()
      
      logSuccess('정리 완료')
    } catch (error) {
      logWarning(`정리 중 오류: ${(error as Error).message}`)
    }
  }

  /**
   * require 경로 수정
   */
  private async fixRequirePaths(): Promise<void> {
    logStep('FIX_REQUIRES', 'require 경로를 .cjs 확장자로 수정...')
    
    const cjsFiles = this.findCjsFiles(this.distPath)
    
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
          fs.writeFileSync(cjsFile, modifiedContent, 'utf8')
          log(`require 경로 수정됨: ${path.relative(this.distPath, cjsFile)}`, 'green')
        }
      } catch (error) {
        logWarning(`require 경로 수정 실패: ${cjsFile} - ${(error as Error).message}`)
      }
    }
  }

  /**
   * .cjs 파일 찾기
   */
  private findCjsFiles(dir: string): string[] {
    const cjsFiles: string[] = []
    
    if (!fs.existsSync(dir)) {
      return cjsFiles
    }
    
    const items = fs.readdirSync(dir)
    
    for (const item of items) {
      const itemPath = path.join(dir, item)
      const stat = fs.statSync(itemPath)
      
      if (stat.isDirectory()) {
        if (!['node_modules', '.git', '.temp-build'].includes(item)) {
          cjsFiles.push(...this.findCjsFiles(itemPath))
        }
      } else if (item.endsWith('.cjs')) {
        cjsFiles.push(itemPath)
      }
    }
    
    return cjsFiles
  }

  /**
   * dist 폴더 구조 정리
   */
  private async organizeDistStructure(): Promise<void> {
    logStep('ORGANIZE', 'dist 폴더 구조 정리...')
    
    try {
      // shared 폴더를 dist 루트로 이동
      const backendSharedPath = path.join(this.distPath, 'backend', 'shared')
      const distSharedPath = path.join(this.distPath, 'shared')
      
      if (fs.existsSync(backendSharedPath)) {
        if (fs.existsSync(distSharedPath)) {
          fs.rmSync(distSharedPath, { recursive: true, force: true })
        }
        fs.renameSync(backendSharedPath, distSharedPath)
        log('✅ shared 폴더를 dist 루트로 이동', 'green')
      }
      
      // data 폴더 생성 (src/data 복사)
      const srcDataPath = path.join(this.options.projectRoot, 'src', 'data')
      const distDataPath = path.join(this.distPath, 'data')
      
      if (fs.existsSync(srcDataPath)) {
        if (fs.existsSync(distDataPath)) {
          fs.rmSync(distDataPath, { recursive: true, force: true })
        }
        fs.cpSync(srcDataPath, distDataPath, { recursive: true })
        log('✅ data 폴더 복사 완료', 'green')
      }
      
      logSuccess('dist 폴더 구조 정리 완료')
    } catch (error) {
      logWarning(`dist 폴더 구조 정리 실패: ${(error as Error).message}`)
    }
  }

  /**
   * 긴급 정리
   */
  private async emergencyCleanup(): Promise<void> {
    logStep('EMERGENCY_CLEANUP', '긴급 정리 중...')
    
    try {
      if (fs.existsSync(this.tempPath)) {
        fs.rmSync(this.tempPath, { recursive: true, force: true })
      }
      logSuccess('긴급 정리 완료')
    } catch (error) {
      logError(`긴급 정리 실패: ${(error as Error).message}`)
    }
  }
}

/**
 * 명령행 인수 파싱
 */
function parseArguments(): Partial<BuildOptions> {
  const args = process.argv.slice(2)
  const options: Partial<BuildOptions> = {}

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    
    switch (arg) {
      case '--project-root':
      case '-p':
        options.projectRoot = args[++i]
        break
      case '--no-clean':
        options.cleanDist = false
        break
      case '--no-backend':
        options.buildBackend = false
        break
      case '--no-frontend':
        options.buildFrontend = false
        break
      case '--no-convert':
        options.convertToCjs = false
        break
      case '--no-dependencies':
        options.fixDependencies = false
        break
      case '--no-path-aliases':
        options.fixPathAliases = false
        break
      case '--verbose':
      case '-v':
        options.verbose = true
        break
      case '--dry-run':
      case '-d':
        options.dryRun = true
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
사용법: node enhanced-build-optimized.ts [옵션]

옵션:
  -p, --project-root <path>   프로젝트 루트 경로
  --no-clean                  dist 폴더 정리하지 않음
  --no-backend                백엔드 빌드 건너뛰기
  --no-frontend               프론트엔드 빌드 건너뛰기
  --no-convert                JS to CJS 변환 건너뛰기
  --no-dependencies           의존성 확인 건너뛰기
  --no-path-aliases           경로 별칭 변환 건너뛰기
  -v, --verbose               상세 로그 활성화
  -d, --dry-run               드라이 런 모드
  -h, --help                  도움말 출력

예시:
  node enhanced-build-optimized.ts --verbose
  node enhanced-build-optimized.ts --no-backend
  node enhanced-build-optimized.ts --dry-run
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
    
    const buildProcess = new EnhancedBuildProcess(finalOptions)
    const success = await buildProcess.execute()
    
    if (success) {
      process.exit(0)
    } else {
      process.exit(1)
    }
    
  } catch (error: any) {
    logError(`빌드 스크립트 실패: ${error.message}`)
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

export { EnhancedBuildProcess, main }
