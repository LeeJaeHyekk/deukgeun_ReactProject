#!/usr/bin/env node

/**
 * 간단한 컴파일 스크립트
 * js-to-cjs-converter를 빠르게 컴파일하고 실행하는 유틸리티
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
 * 간단한 컴파일 클래스
 */
class SimpleCompiler {
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
   * js-to-cjs-converter 컴파일 및 실행
   */
  async compileAndRun(): Promise<boolean> {
    const startTime = Date.now()
    
    try {
      log('🚀 js-to-cjs-converter 컴파일 및 실행 시작...', 'bright')
      
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
      
      log(`컴파일 명령어: ${compileCommand}`, 'blue')
      
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
      
      logSuccess(`컴파일 완료! (소요시간: ${duration}초)`)
      logSuccess('이제 다음 명령어로 실행할 수 있습니다:')
      log('  node dist/scripts/js-to-cjs-converter.cjs', 'cyan')
      
      return true
      
    } catch (error: any) {
      logError(`컴파일 실패: ${error.message}`)
      return false
    }
  }

  /**
   * 컴파일 후 즉시 실행
   */
  async compileAndExecute(): Promise<void> {
    const success = await this.compileAndRun()
    
    if (success) {
      logStep('EXECUTE', '컴파일된 스크립트 실행 중...')
      
      try {
        const cjsPath = path.join(this.distScriptsDir, 'js-to-cjs-converter.cjs')
        
        if (fs.existsSync(cjsPath)) {
          execSync(`node ${cjsPath}`, { 
            stdio: 'inherit',
            cwd: this.projectRoot,
            timeout: 300000 // 5분
          })
          
          logSuccess('스크립트 실행 완료!')
        } else {
          throw new Error('컴파일된 .cjs 파일을 찾을 수 없습니다.')
        }
      } catch (error: any) {
        logError(`스크립트 실행 실패: ${error.message}`)
        throw error
      }
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
   * 사용법 출력
   */
  printUsage(): void {
    log('\n📖 간단한 컴파일 사용법:', 'bright')
    log('  npm run simple:compile        : 컴파일만', 'cyan')
    log('  npm run simple:compile:run     : 컴파일 후 실행', 'cyan')
    
    log('\n🔧 명령어:', 'bright')
    log('  simple:compile        : js-to-cjs-converter만 컴파일', 'green')
    log('  simple:compile:run    : 컴파일 후 즉시 실행', 'green')
  }
}

/**
 * 메인 함수
 */
async function main(): Promise<void> {
  const args = process.argv.slice(2)
  const compiler = new SimpleCompiler()
  
  try {
    if (args.includes('--help') || args.includes('-h')) {
      compiler.printUsage()
      return
    }
    
    if (args.includes('--run') || args.includes('-r')) {
      await compiler.compileAndExecute()
    } else {
      await compiler.compileAndRun()
    }
  } catch (error: any) {
    logError(`실행 실패: ${error.message}`)
    process.exit(1)
  }
}

// 스크립트 실행
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}

export { SimpleCompiler, main }