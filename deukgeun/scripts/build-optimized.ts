#!/usr/bin/env node

/**
 * 최적화된 빌드 스크립트
 * - 원본 파일을 수정하지 않음
 * - dist 폴더에서만 js -> cjs 변환
 * - 프로젝트 구조에 맞게 최적화
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
  verbose: false,
  dryRun: false
}

/**
 * 빌드 프로세스 클래스
 */
class OptimizedBuildProcess {
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
      // 프로덕션 환경 변수 설정
      process.env.NODE_ENV = process.env.NODE_ENV || 'production'
      process.env.MODE = process.env.MODE || 'production'
      
      log('🚀 최적화된 빌드 프로세스를 시작합니다... (프로덕션 모드)', 'bright')
      logSeparator('=', 60, 'bright')
      log(`🌍 환경: ${process.env.NODE_ENV}`, 'cyan')
      
      // 1. 빌드 전 준비
      await this.prepareBuild()
      
      // 2. 백엔드 빌드
      if (this.options.buildBackend) {
        await this.buildBackend()
      }
      
      // 3. 프론트엔드 빌드
      if (this.options.buildFrontend) {
        await this.buildFrontend()
      }
      
      // 4. JS to CJS 변환 (dist 폴더에서만)
      if (this.options.convertToCjs) {
        await this.convertJsToCjs()
      }
      
      // 5. 빌드 후 정리
      await this.cleanup()
      
      // 6. 빌드된 파일 추가 수정 (__dirname, require 경로)
      await this.fixBuiltFiles()
      
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
   * 백엔드 빌드
   */
  private async buildBackend(): Promise<void> {
    logStep('BACKEND', '백엔드 빌드 중...')
    
    if (this.options.dryRun) {
      log('백엔드 빌드 (드라이 런)', 'yellow')
      return
    }
    
    try {
      // 프로덕션 환경 변수 설정
      const env = {
        ...process.env,
        NODE_ENV: 'production',
        MODE: 'production',
        CORS_ORIGIN: process.env.CORS_ORIGIN || 'https://devtrail.net,https://www.devtrail.net,http://43.203.30.167:3000,http://43.203.30.167:5000',
        RECAPTCHA_SITE_KEY: process.env.RECAPTCHA_SITE_KEY || '6LeKXgIsAAAAAO_09k3lshBH0jagb2uyNf2kvE8P',
      }
      
      // 백엔드 TypeScript 컴파일 실행
      // 타입 오류가 있어도 빌드 파일은 생성될 수 있으므로 에러를 catch하여 처리
      const tscCommand = 'npx tsc -p src/backend/tsconfig.build.json'
      let tscSuccess = false
      
      try {
        execSync(tscCommand, {
          stdio: this.options.verbose ? 'inherit' : 'pipe',
          cwd: this.options.projectRoot,
          timeout: 300000,
          env: env
        })
        tscSuccess = true
      } catch (tscError) {
        // 타입 오류가 있어도 빌드 파일이 생성될 수 있으므로 경고만 출력
        logWarning(`백엔드 타입 오류가 있지만 빌드는 계속 진행합니다`)
        if (this.options.verbose) {
          logWarning(`타입 오류 상세: ${(tscError as Error).message}`)
        }
      }
      
      // dist/backend 폴더가 생성되었는지 확인
      const distBackendPath = path.join(this.distPath, 'backend')
      if (fs.existsSync(distBackendPath)) {
        if (tscSuccess) {
          logSuccess('백엔드 TypeScript 컴파일 완료')
        } else {
          logSuccess('백엔드 빌드 파일 생성 완료 (타입 오류 있음)')
        }
      } else {
        logWarning('백엔드 빌드 파일이 생성되지 않았습니다.')
        // 빌드 파일이 없어도 계속 진행 (프론트엔드 빌드는 가능할 수 있음)
      }
      
      // Shared 폴더 별도 빌드
      await this.buildShared()
      
      logSuccess('백엔드 빌드 완료')
    } catch (error) {
      logError(`백엔드 빌드 실패: ${(error as Error).message}`)
      // 에러가 발생해도 프론트엔드 빌드는 진행할 수 있으므로 에러를 던지지 않음
      logWarning('백엔드 빌드 실패했지만 프론트엔드 빌드를 계속 진행합니다.')
    }
  }

  /**
   * Shared 폴더 빌드
   */
  private async buildShared(): Promise<void> {
    logStep('SHARED', 'Shared 폴더 빌드 중...')
    
    try {
      // Shared 폴더를 dist/shared로 복사
      const srcSharedPath = path.join(this.options.projectRoot, 'src', 'shared')
      const distSharedPath = path.join(this.distPath, 'shared')
      
      if (fs.existsSync(srcSharedPath)) {
        if (fs.existsSync(distSharedPath)) {
          fs.rmSync(distSharedPath, { recursive: true, force: true })
        }
        fs.cpSync(srcSharedPath, distSharedPath, { recursive: true })
        logSuccess('Shared 폴더 복사 완료')
      }
    } catch (error) {
      logError(`Shared 폴더 빌드 실패: ${(error as Error).message}`)
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
      // 프로덕션 환경 변수 설정
      const env = {
        ...process.env,
        NODE_ENV: 'production',
        MODE: 'production',
        VITE_BACKEND_URL: process.env.VITE_BACKEND_URL || 'http://43.203.30.167:5000',
        VITE_FRONTEND_URL: process.env.VITE_FRONTEND_URL || 'https://devtrail.net',
        VITE_RECAPTCHA_SITE_KEY: process.env.VITE_RECAPTCHA_SITE_KEY || '6LeKXgIsAAAAAO_09k3lshBH0jagb2uyNf2kvE8P',
      }
      
      // Vite 빌드 실행 (프로덕션 모드)
      execSync('npx vite build --mode production', {
        stdio: this.options.verbose ? 'inherit' : 'pipe',
        cwd: this.options.projectRoot,
        timeout: 300000, // 5분
        env: env
      })
      
      logSuccess('프론트엔드 빌드 완료 (프로덕션 모드)')
    } catch (error) {
      logError(`프론트엔드 빌드 실패: ${(error as Error).message}`)
      throw error
    }
  }

  /**
   * JS to CJS 변환 (dist 폴더에서만)
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
      // 개선된 변환 스크립트 사용
      const { execSync } = await import('child_process')
      execSync('npx tsx scripts/enhanced-js-to-cjs-converter.ts', { 
        stdio: 'inherit',
        cwd: this.options.projectRoot 
      })
      logSuccess('JS to CJS 변환 완료 (개선된 스크립트 사용)')
    } catch (error) {
      logError(`변환 스크립트 실행 실패: ${(error as Error).message}`)
      throw error
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
        const fileDir = path.dirname(cjsFile)
        
        // require 경로 수정 (상대 경로에 .cjs 확장자 추가)
        // .js 확장자가 있는 경우
        modifiedContent = modifiedContent.replace(/require\(['"]\.\/([^'"]+)\.js['"]\)/g, 'require("./$1.cjs")')
        modifiedContent = modifiedContent.replace(/require\(['"]\.\.\/([^'"]+)\.js['"]\)/g, 'require("../$1.cjs")')
        modifiedContent = modifiedContent.replace(/require\(['"]\.\.\/\.\.\/([^'"]+)\.js['"]\)/g, 'require("../../$1.cjs")')
        
        // 확장자가 없는 상대 경로인 경우, .cjs 파일이 존재하면 추가
        modifiedContent = modifiedContent.replace(/require\(['"]\.\/([^'"]+)['"]\)/g, (match, moduleName) => {
          // node_modules나 절대 경로는 제외
          if (moduleName.startsWith('.') || moduleName.includes('/') || moduleName.includes('\\')) {
            const cjsPath = path.join(fileDir, `${moduleName}.cjs`)
            if (fs.existsSync(cjsPath)) {
              return `require("./${moduleName}.cjs")`
            }
          }
          return match
        })
        
        modifiedContent = modifiedContent.replace(/require\(['"]\.\.\/([^'"]+)['"]\)/g, (match, moduleName) => {
          // node_modules나 절대 경로는 제외
          if (!moduleName.startsWith('.') && !moduleName.includes('node_modules')) {
            const cjsPath = path.join(fileDir, '..', `${moduleName}.cjs`)
            if (fs.existsSync(cjsPath)) {
              return `require("../${moduleName}.cjs")`
            }
            // 디렉토리인 경우 index.cjs 확인
            const indexCjsPath = path.join(fileDir, '..', moduleName, 'index.cjs')
            if (fs.existsSync(indexCjsPath)) {
              return `require("../${moduleName}/index.cjs")`
            }
          }
          return match
        })
        
        // 상대 경로가 없는 경우 처리 (utils/*, config/*, middlewares/* 등)
        // 패턴: require('utils/logger'), require('config/databaseConfig'), require('middlewares/healthMonitor') 등
        modifiedContent = modifiedContent.replace(/require\(['"]([^'"]+)['"]\)/g, (match, modulePath) => {
          // 이미 상대 경로이거나 node_modules, 절대 경로는 제외
          if (modulePath.startsWith('.') || modulePath.startsWith('/') || modulePath.includes('node_modules') || modulePath.startsWith('@')) {
            return match
          }
          
          // 상대 경로가 없는 로컬 모듈 (utils/*, config/*, middlewares/* 등)
          // 현재 파일의 디렉토리에서 상위로 올라가면서 찾기
          const parts = modulePath.split('/')
          const moduleName = parts[parts.length - 1]
          const moduleDir = parts.slice(0, -1)
          
          // 현재 파일과 같은 디렉토리에서 시작
          let currentDir = fileDir
          
          // 최대 5단계 상위로 검색
          for (let i = 0; i < 5; i++) {
            // 파일 경로 테스트 (moduleName.cjs)
            const testPath = moduleDir.length > 0 
              ? path.join(currentDir, ...moduleDir, `${moduleName}.cjs`)
              : path.join(currentDir, `${moduleName}.cjs`)
            
            if (fs.existsSync(testPath)) {
              const relativePath = path.relative(fileDir, testPath).replace(/\\/g, '/')
              // 상대 경로가 같은 디렉토리면 ./ 추가
              return relativePath.startsWith('.') ? `require("${relativePath}")` : `require("./${relativePath}")`
            }
            
            // 디렉토리인 경우 index.cjs 확인
            const indexPath = moduleDir.length > 0
              ? path.join(currentDir, ...moduleDir, moduleName, 'index.cjs')
              : path.join(currentDir, modulePath, 'index.cjs')
            
            if (fs.existsSync(indexPath)) {
              const relativePath = path.relative(fileDir, indexPath).replace(/\\/g, '/')
              return relativePath.startsWith('.') ? `require("${relativePath}")` : `require("./${relativePath}")`
            }
            
            // 상위 디렉토리로 이동
            const parentDir = path.dirname(currentDir)
            if (parentDir === currentDir) break // 루트에 도달
            currentDir = parentDir
          }
          
          return match
        })
        
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
   * 빌드된 파일 추가 수정 (__dirname 중복 선언 제거)
   */
  private async fixBuiltFiles(): Promise<void> {
    logStep('FIX_BUILT', '빌드된 파일 추가 수정 중...')
    
    const cjsFiles = this.findCjsFiles(this.distPath)
    let fixedCount = 0
    
    for (const cjsFile of cjsFiles) {
      try {
        let content = fs.readFileSync(cjsFile, 'utf8')
        const originalContent = content
        
        // __dirname 중복 선언 제거
        // 패턴: const __dirname = (0, pathUtils_1.getDirname)();
        // 실제 패턴에 맞게 정확한 정규식 사용
        content = content.replace(
          /const __dirname = \(0, [^)]+\.getDirname\)\(\);?\s*/g,
          '// __dirname is automatically available in CommonJS\n'
        )
        // 패턴: const __dirname = (pathUtils_1.getDirname)();
        content = content.replace(
          /const __dirname = \([^)]+\.getDirname\)\(\);?\s*/g,
          '// __dirname is automatically available in CommonJS\n'
        )
        
        if (content !== originalContent) {
          fs.writeFileSync(cjsFile, content, 'utf8')
          fixedCount++
        }
      } catch (error) {
        logWarning(`파일 수정 실패: ${cjsFile} - ${(error as Error).message}`)
      }
    }
    
    if (fixedCount > 0) {
      logSuccess(`빌드된 파일 수정 완료: ${fixedCount}개 파일`)
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
사용법: node build-optimized.ts [옵션]

옵션:
  -p, --project-root <path>   프로젝트 루트 경로
  --no-clean                  dist 폴더 정리하지 않음
  --no-backend                백엔드 빌드 건너뛰기
  --no-frontend               프론트엔드 빌드 건너뛰기
  --no-convert                JS to CJS 변환 건너뛰기
  -v, --verbose               상세 로그 활성화
  -d, --dry-run               드라이 런 모드
  -h, --help                  도움말 출력

예시:
  node build-optimized.ts --verbose
  node build-optimized.ts --no-backend
  node build-optimized.ts --dry-run
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
    
    const buildProcess = new OptimizedBuildProcess(finalOptions)
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

export { OptimizedBuildProcess, main }
