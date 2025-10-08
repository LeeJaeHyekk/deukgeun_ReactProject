#!/usr/bin/env node

/**
 * 자동화된 JS to CJS 변환 스크립트
 * TypeScript 컴파일과 변환을 자동으로 처리하는 통합 스크립트
 */

import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'
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
      try {
        const res = await this.autoRunner.runScript('js-to-cjs-converter.ts')
        // runScript가 반환값을 준다면 출력 (디버깅용)
        logSuccess(`STEP1 완료${res ? ` — ${JSON.stringify(res)}` : ''}`)
      } catch (err) {
        logError(`STEP1 실패: ${(err as Error).message}`)
        throw err
      }
      
      // 2. 빌드 스크립트 실행 (선택적)
      const shouldRunBuild = process.argv.includes('--build') || process.argv.includes('-b')
      if (shouldRunBuild) {
        logStep('STEP2', '빌드 스크립트 실행')
        try {
          const res = await this.autoRunner.runScript('build.ts')
          logSuccess(`STEP2 완료${res ? ` — ${JSON.stringify(res)}` : ''}`)
        } catch (err) {
          logError(`STEP2 실패: ${(err as Error).message}`)
          throw err
        }
      }
      
      // 3. 배포 스크립트 실행 (선택적)
      const shouldRunDeploy = process.argv.includes('--deploy') || process.argv.includes('-d')
      if (shouldRunDeploy) {
        logStep('STEP3', '배포 스크립트 실행')
        try {
          const res = await this.autoRunner.runScript('deploy-script.ts')
          logSuccess(`STEP3 완료${res ? ` — ${JSON.stringify(res)}` : ''}`)
        } catch (err) {
          logError(`STEP3 실패: ${(err as Error).message}`)
          throw err
        }
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

// === ESM/CJS 모두에서 "직접 실행"을 감지하는 안전한 진입점 ===
async function runIfMain() {
  // ESM: import.meta.url -> 파일 경로
  try {
    const __filename = fileURLToPath(import.meta.url)
    // process.argv[1]은 node 실행시 첫 번째 인자로 넘어온 스크립트 경로
    if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename)) {
      await main()
      return
    }
  } catch (e) {
    // import.meta가 없는 CJS 환경에서 무시
  }

  // CJS 환경에서의 기존 검사 (require가 정의되어 있으면 사용)
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    // require가 없는 ESM 환경에서는 ReferenceError가 발생하므로 try/catch로 감싼다
    // @ts-ignore
    if (typeof require !== 'undefined' && require.main === module) {
      await main()
      return
    }
  } catch { /* ignore */ }
}

// 즉시 실행
runIfMain().catch(err => {
  logError(`실행 실패(진입점): ${(err as Error).message}`)
  process.exit(1)
})

export { AutoJsToCjsConverter, main }
