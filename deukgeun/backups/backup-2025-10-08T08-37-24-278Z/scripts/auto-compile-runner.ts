#!/usr/bin/env node

/**
 * 자동 컴파일 및 실행 스크립트
 * TypeScript 스크립트를 자동으로 컴파일하고 실행하는 유틸리티
 */

import * as fs from 'fs'
import * as path from 'path'
import { execSync, spawn } from 'child_process'

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
 * 자동 컴파일 및 실행 클래스
 */
class AutoCompileRunner {
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
   * 스크립트 자동 컴파일 및 실행
   */
  async runScript(scriptName: string, args: string[] = []): Promise<void> {
    const startTime = Date.now()
    
    try {
      log(`🚀 스크립트 실행 시작: ${scriptName}`, 'bright')
      
      // 1. 스크립트 파일 존재 확인
      const scriptPath = path.join(this.scriptsDir, scriptName)
      if (!fs.existsSync(scriptPath)) {
        throw new Error(`스크립트 파일을 찾을 수 없습니다: ${scriptPath}`)
      }
      
      // 2. dist 디렉토리 생성
      this.ensureDistDirectories()
      
      // 3. TypeScript 컴파일
      await this.compileScript(scriptName)
      
      // 4. 컴파일된 스크립트 실행
      await this.executeCompiledScript(scriptName, args)
      
      const endTime = Date.now()
      const duration = ((endTime - startTime) / 1000).toFixed(2)
      
      logSuccess(`스크립트 실행 완료! (소요시간: ${duration}초)`)
      
    } catch (error) {
      logError(`스크립트 실행 실패: ${(error as Error).message}`)
      throw error
    }
  }

  /**
   * dist 디렉토리 생성
   */
  private ensureDistDirectories(): void {
    logStep('SETUP', 'dist 디렉토리 생성 중...')
    
    if (!fs.existsSync(this.distDir)) {
      fs.mkdirSync(this.distDir, { recursive: true })
    }
    
    if (!fs.existsSync(this.distScriptsDir)) {
      fs.mkdirSync(this.distScriptsDir, { recursive: true })
    }
    
    logSuccess('dist 디렉토리 생성 완료')
  }

  /**
   * TypeScript 스크립트 컴파일
   */
  private async compileScript(scriptName: string): Promise<void> {
    logStep('COMPILE', `TypeScript 컴파일 중: ${scriptName}`)
    
    try {
      const scriptPath = path.join(this.scriptsDir, scriptName)
      const outputPath = path.join(this.distScriptsDir, scriptName.replace('.ts', '.js'))
      
      // TypeScript 컴파일 명령어
      const compileCommand = [
        'npx tsc',
        scriptPath,
        '--outDir', this.distScriptsDir,
        '--target', 'es2020',
        '--module', 'commonjs',
        '--esModuleInterop',
        '--allowSyntheticDefaultImports',
        '--skipLibCheck',
        '--resolveJsonModule',
        '--allowJs'
      ].join(' ')
      
      log(`컴파일 명령어: ${compileCommand}`, 'blue')
      
      // 컴파일 실행
      execSync(compileCommand, { 
        stdio: 'inherit',
        cwd: this.projectRoot,
        timeout: 60000 // 1분
      })
      
      // .js 파일을 .cjs로 복사
      const cjsPath = outputPath.replace('.js', '.cjs')
      if (fs.existsSync(outputPath)) {
        fs.copyFileSync(outputPath, cjsPath)
        log(`✅ .cjs 파일 생성됨: ${path.relative(this.projectRoot, cjsPath)}`, 'green')
      }
      
      logSuccess(`컴파일 완료: ${scriptName}`)
      
    } catch (error) {
      logError(`컴파일 실패: ${(error as Error).message}`)
      throw error
    }
  }

  /**
   * 컴파일된 스크립트 실행
   */
  private async executeCompiledScript(scriptName: string, args: string[] = []): Promise<void> {
    logStep('EXECUTE', `컴파일된 스크립트 실행 중: ${scriptName}`)
    
    try {
      const compiledScriptName = scriptName.replace('.ts', '.cjs')
      const scriptPath = path.join(this.distScriptsDir, compiledScriptName)
      
      if (!fs.existsSync(scriptPath)) {
        throw new Error(`컴파일된 스크립트를 찾을 수 없습니다: ${scriptPath}`)
      }
      
      log(`실행할 스크립트: ${path.relative(this.projectRoot, scriptPath)}`, 'blue')
      log(`실행 인수: ${args.join(' ')}`, 'blue')
      
      // 스크립트 실행
      const child = spawn('node', [scriptPath, ...args], {
        stdio: 'inherit',
        cwd: this.projectRoot,
        shell: true
      })
      
      // 프로세스 종료 대기
      await new Promise<void>((resolve, reject) => {
        child.on('close', (code) => {
          if (code === 0) {
            resolve()
          } else {
            reject(new Error(`스크립트 실행 실패 (종료 코드: ${code})`))
          }
        })
        
        child.on('error', (error) => {
          reject(error)
        })
      })
      
      logSuccess(`스크립트 실행 완료: ${scriptName}`)
      
    } catch (error) {
      logError(`스크립트 실행 실패: ${(error as Error).message}`)
      throw error
    }
  }

  /**
   * 여러 스크립트를 순차적으로 실행
   */
  async runMultipleScripts(scripts: Array<{ name: string, args?: string[] }>): Promise<void> {
    log(`🚀 여러 스크립트 실행 시작: ${scripts.length}개`, 'bright')
    
    for (let i = 0; i < scripts.length; i++) {
      const { name, args = [] } = scripts[i]
      
      log(`\n[${i + 1}/${scripts.length}] 스크립트 실행: ${name}`, 'cyan')
      
      try {
        await this.runScript(name, args)
        logSuccess(`스크립트 ${i + 1} 완료: ${name}`)
      } catch (error) {
        logError(`스크립트 ${i + 1} 실패: ${name} - ${(error as Error).message}`)
        throw error
      }
    }
    
    logSuccess('모든 스크립트 실행 완료!')
  }

  /**
   * 스크립트 파일 목록 조회
   */
  getAvailableScripts(): string[] {
    if (!fs.existsSync(this.scriptsDir)) {
      return []
    }
    
    return fs.readdirSync(this.scriptsDir)
      .filter(file => file.endsWith('.ts'))
      .sort()
  }

  /**
   * 사용법 출력
   */
  printUsage(): void {
    log('\n📖 사용법:', 'bright')
    log('  npm run script:auto <스크립트명> [인수...]', 'cyan')
    log('  npm run script:auto:multiple <스크립트1> <스크립트2> ...', 'cyan')
    log('\n📋 사용 가능한 스크립트:', 'bright')
    
    const scripts = this.getAvailableScripts()
    if (scripts.length === 0) {
      log('  사용 가능한 스크립트가 없습니다.', 'yellow')
    } else {
      scripts.forEach(script => {
        log(`  - ${script}`, 'green')
      })
    }
    
    log('\n💡 예시:', 'bright')
    log('  npm run script:auto js-to-cjs-converter.ts', 'cyan')
    log('  npm run script:auto build.ts --production', 'cyan')
    log('  npm run script:auto:multiple js-to-cjs-converter.ts build.ts', 'cyan')
  }
}

/**
 * 메인 함수
 */
async function main(): Promise<void> {
  const args = process.argv.slice(2)
  
  if (args.length === 0) {
    const runner = new AutoCompileRunner()
    runner.printUsage()
    return
  }
  
  const runner = new AutoCompileRunner()
  
  try {
    if (args[0] === '--multiple' || args[0] === '-m') {
      // 여러 스크립트 실행
      const scripts = args.slice(1).map(name => ({ name }))
      await runner.runMultipleScripts(scripts)
    } else {
      // 단일 스크립트 실행
      const scriptName = args[0]
      const scriptArgs = args.slice(1)
      
      await runner.runScript(scriptName, scriptArgs)
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

export { AutoCompileRunner, main }
