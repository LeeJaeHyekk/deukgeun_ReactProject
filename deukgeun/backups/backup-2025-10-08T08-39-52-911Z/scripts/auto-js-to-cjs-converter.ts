#!/usr/bin/env node

/**
 * 자동화된 JS to CJS 변환 스크립트
 * TypeScript 컴파일과 변환을 자동으로 처리하는 통합 스크립트
 */

import * as fs from 'fs'
import * as path from 'path'
import { execSync } from 'child_process'
import { AutoCompileRunner } from './auto-compile-runner'

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
 * 자동화된 JS to CJS 변환 클래스
 */
class AutoJsToCjsConverter {
  private projectRoot: string
  private autoRunner: AutoCompileRunner

  constructor() {
    this.projectRoot = process.cwd()
    this.autoRunner = new AutoCompileRunner()
  }

  /**
   * 자동화된 변환 프로세스 실행
   */
  async executeAutoConversion(): Promise<void> {
    const startTime = Date.now()
    
    try {
      log('🚀 자동화된 JS to CJS 변환을 시작합니다...', 'bright')
      
      // 1. js-to-cjs-converter.ts 컴파일 및 실행
      logStep('STEP1', 'js-to-cjs-converter.ts 컴파일 및 실행')
      await this.autoRunner.runScript('js-to-cjs-converter.ts')
      
      // 2. 빌드 스크립트 실행 (선택적)
      const shouldRunBuild = process.argv.includes('--build') || process.argv.includes('-b')
      if (shouldRunBuild) {
        logStep('STEP2', '빌드 스크립트 실행')
        await this.autoRunner.runScript('build.ts')
      }
      
      // 3. 배포 스크립트 실행 (선택적)
      const shouldRunDeploy = process.argv.includes('--deploy') || process.argv.includes('-d')
      if (shouldRunDeploy) {
        logStep('STEP3', '배포 스크립트 실행')
        await this.autoRunner.runScript('deploy-script.ts')
      }
      
      const endTime = Date.now()
      const duration = ((endTime - startTime) / 1000).toFixed(2)
      
      logSuccess(`자동화된 변환이 완료되었습니다! (소요시간: ${duration}초)`)
      logSuccess('🎉 모든 작업이 성공적으로 완료되었습니다!')
      
    } catch (error) {
      logError(`자동화된 변환 실패: ${(error as Error).message}`)
      throw error
    }
  }

  /**
   * 사용법 출력
   */
  printUsage(): void {
    log('\n📖 자동화된 JS to CJS 변환 사용법:', 'bright')
    log('  npm run script:auto:js-to-cjs', 'cyan')
    log('  npm run script:auto:js-to-cjs -- --build', 'cyan')
    log('  npm run script:auto:js-to-cjs -- --deploy', 'cyan')
    log('  npm run script:auto:js-to-cjs -- --build --deploy', 'cyan')
    
    log('\n🔧 옵션:', 'bright')
    log('  --build, -b    : 변환 후 빌드 스크립트 실행', 'green')
    log('  --deploy, -d   : 변환 후 배포 스크립트 실행', 'green')
    log('  --help, -h     : 이 도움말 출력', 'green')
    
    log('\n💡 예시:', 'bright')
    log('  npm run script:auto:js-to-cjs', 'cyan')
    log('  npm run script:auto:js-to-cjs -- --build', 'cyan')
    log('  npm run script:auto:js-to-cjs -- --build --deploy', 'cyan')
  }
}

/**
 * 메인 함수
 */
async function main(): Promise<void> {
  const args = process.argv.slice(2)
  
  // 도움말 출력
  if (args.includes('--help') || args.includes('-h')) {
    const converter = new AutoJsToCjsConverter()
    converter.printUsage()
    return
  }
  
  const converter = new AutoJsToCjsConverter()
  
  try {
    await converter.executeAutoConversion()
  } catch (error) {
    logError(`실행 실패: ${(error as Error).message}`)
    process.exit(1)
  }
}

// 스크립트 실행
if (require.main === module) {
  main()
}

export { AutoJsToCjsConverter, main }
