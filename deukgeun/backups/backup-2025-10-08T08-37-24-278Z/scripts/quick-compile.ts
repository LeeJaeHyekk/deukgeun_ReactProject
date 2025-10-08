#!/usr/bin/env node

/**
 * 빠른 컴파일 스크립트
 * 자주 사용하는 스크립트들을 빠르게 컴파일하고 실행하는 유틸리티
 */

import * as fs from 'fs'
import * as path from 'path'
import { execSync } from 'child_process'

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
 * 빠른 컴파일 클래스
 */
class QuickCompiler {
  private projectRoot: string
  private scriptsDir: string
  private distDir: string
  private distScriptsDir: string

  constructor() {
    this.projectRoot = process.cwd()
    this.scriptsDir = path.join(this.projectRoot, 'scripts')
    this.distDir = path.join(this.projectRoot, 'dist')
    this.distScriptsDir = path.join(this.distDir, 'scripts')
  }

  /**
   * js-to-cjs-converter 빠른 컴파일 및 실행
   */
  async quickCompileJsToCjs(): Promise<void> {
    const startTime = Date.now()
    
    try {
      log('🚀 js-to-cjs-converter 빠른 컴파일 시작...', 'bright')
      
      // 1. dist 디렉토리 생성
      this.ensureDistDirectories()
      
      // 2. TypeScript 컴파일
      logStep('COMPILE', 'TypeScript 컴파일 중...')
      const compileCommand = [
        'npx tsc scripts/js-to-cjs-converter.ts',
        '--outDir dist/scripts',
        '--target es2020',
        '--module commonjs',
        '--esModuleInterop',
        '--allowSyntheticDefaultImports',
        '--skipLibCheck'
      ].join(' ')
      
      execSync(compileCommand, { 
        stdio: 'inherit',
        cwd: this.projectRoot,
        timeout: 60000
      })
      
      // 3. .js를 .cjs로 복사
      logStep('COPY', '.js 파일을 .cjs로 복사 중...')
      const jsPath = path.join(this.distScriptsDir, 'js-to-cjs-converter.js')
      const cjsPath = path.join(this.distScriptsDir, 'js-to-cjs-converter.cjs')
      
      if (fs.existsSync(jsPath)) {
        fs.copyFileSync(jsPath, cjsPath)
        logSuccess('.cjs 파일 생성 완료')
      } else {
        throw new Error('컴파일된 .js 파일을 찾을 수 없습니다.')
      }
      
      const endTime = Date.now()
      const duration = ((endTime - startTime) / 1000).toFixed(2)
      
      logSuccess(`빠른 컴파일 완료! (소요시간: ${duration}초)`)
      logSuccess('이제 다음 명령어로 실행할 수 있습니다:')
      log('  node dist/scripts/js-to-cjs-converter.cjs', 'cyan')
      
    } catch (error) {
      logError(`빠른 컴파일 실패: ${(error as Error).message}`)
      throw error
    }
  }

  /**
   * 모든 스크립트 빠른 컴파일
   */
  async quickCompileAll(): Promise<void> {
    const startTime = Date.now()
    
    try {
      log('🚀 모든 스크립트 빠른 컴파일 시작...', 'bright')
      
      // 1. dist 디렉토리 생성
      this.ensureDistDirectories()
      
      // 2. TypeScript 컴파일 (전체)
      logStep('COMPILE', '모든 TypeScript 스크립트 컴파일 중...')
      const compileCommand = [
        'npx tsc scripts/*.ts',
        '--outDir dist/scripts',
        '--target es2020',
        '--module commonjs',
        '--esModuleInterop',
        '--allowSyntheticDefaultImports',
        '--skipLibCheck'
      ].join(' ')
      
      execSync(compileCommand, { 
        stdio: 'inherit',
        cwd: this.projectRoot,
        timeout: 120000 // 2분
      })
      
      // 3. 모든 .js 파일을 .cjs로 복사
      logStep('COPY', '모든 .js 파일을 .cjs로 복사 중...')
      this.copyAllJsToCjs()
      
      const endTime = Date.now()
      const duration = ((endTime - startTime) / 1000).toFixed(2)
      
      logSuccess(`모든 스크립트 컴파일 완료! (소요시간: ${duration}초)`)
      
    } catch (error) {
      logError(`빠른 컴파일 실패: ${(error as Error).message}`)
      throw error
    }
  }

  /**
   * dist 디렉토리 생성
   */
  private ensureDistDirectories(): void {
    if (!fs.existsSync(this.distDir)) {
      fs.mkdirSync(this.distDir, { recursive: true })
    }
    
    if (!fs.existsSync(this.distScriptsDir)) {
      fs.mkdirSync(this.distScriptsDir, { recursive: true })
    }
  }

  /**
   * 모든 .js 파일을 .cjs로 복사
   */
  private copyAllJsToCjs(): void {
    if (!fs.existsSync(this.distScriptsDir)) {
      return
    }
    
    const files = fs.readdirSync(this.distScriptsDir)
    
    for (const file of files) {
      if (file.endsWith('.js')) {
        const jsPath = path.join(this.distScriptsDir, file)
        const cjsPath = jsPath.replace('.js', '.cjs')
        
        fs.copyFileSync(jsPath, cjsPath)
        log(`✅ 복사됨: ${file} → ${file.replace('.js', '.cjs')}`, 'green')
      }
    }
  }

  /**
   * 사용법 출력
   */
  printUsage(): void {
    log('\n📖 빠른 컴파일 사용법:', 'bright')
    log('  npm run quick:compile', 'cyan')
    log('  npm run quick:compile:all', 'cyan')
    log('  npm run quick:js-to-cjs', 'cyan')
    
    log('\n🔧 명령어:', 'bright')
    log('  quick:compile        : js-to-cjs-converter만 빠른 컴파일', 'green')
    log('  quick:compile:all    : 모든 스크립트 빠른 컴파일', 'green')
    log('  quick:js-to-cjs      : js-to-cjs-converter 컴파일 및 실행', 'green')
  }
}

/**
 * 메인 함수
 */
async function main(): Promise<void> {
  const args = process.argv.slice(2)
  const compiler = new QuickCompiler()
  
  try {
    if (args.includes('--all') || args.includes('-a')) {
      await compiler.quickCompileAll()
    } else if (args.includes('--help') || args.includes('-h')) {
      compiler.printUsage()
    } else {
      await compiler.quickCompileJsToCjs()
    }
  } catch (error) {
    logError(`실행 실패: ${(error as Error).message}`)
    process.exit(1)
  }
}

// 스크립트 실행
if (require.main === module) {
  main()
}

export { QuickCompiler, main }
