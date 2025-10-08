#!/usr/bin/env node

/**
 * 함수형 빌드 스크립트
 * 프로젝트 빌드 과정을 관리하는 스크립트
 */

import * as path from 'path'
import { 
  logStep, 
  logSuccess, 
  logError, 
  logInfo, 
  logSeparator,
  configureLogger,
  setLogLevel,
  setLogPrefix
} from './modules/logger-functions'
import { 
  executeBuild, 
  printBuildStats 
} from './modules/build-functions'

// 스크립트 옵션 인터페이스
interface BuildScriptOptions {
  projectRoot: string
  timeout: number
  maxRetries: number
  parallel: boolean
  validate: boolean
  cleanup: boolean
  verbose: boolean
  dryRun: boolean
  safety: boolean
  backup: boolean
}

// 기본 옵션
const defaultOptions: BuildScriptOptions = {
  projectRoot: process.cwd(),
  timeout: 300000, // 5분
  maxRetries: 3,
  parallel: false,
  validate: true,
  cleanup: true,
  verbose: false,
  dryRun: false,
  safety: true,
  backup: true
}

/**
 * 빌드 스크립트 실행
 */
export async function runBuildScript(options: Partial<BuildScriptOptions> = {}): Promise<{ success: boolean; duration: number; results: any }> {
  const startTime = Date.now()
  const finalOptions = { ...defaultOptions, ...options }
  
  try {
    // 로거 설정
    if (finalOptions.verbose) {
      setLogLevel('debug')
    }
    setLogPrefix('BUILD')

    logSeparator('=', 60, 'bright')
    logStep('BUILD', '빌드 스크립트를 시작합니다...')
    logSeparator('=', 60, 'bright')

    // 실행 계획 출력
    printExecutionPlan(finalOptions)

    // 드라이 런 모드
    if (finalOptions.dryRun) {
      logInfo('드라이 런 모드: 실제 빌드하지 않습니다.')
      return {
        success: true,
        duration: 0,
        results: { dryRun: true }
      }
    }

    // 빌드 실행
    const buildResult = await executeBuild(finalOptions.projectRoot, {
      timeout: finalOptions.timeout,
      maxRetries: finalOptions.maxRetries,
      parallel: finalOptions.parallel,
      validate: finalOptions.validate,
      cleanup: finalOptions.cleanup,
      safety: finalOptions.safety,
      backup: finalOptions.backup
    })

    if (buildResult.success) {
      printBuildStats(buildResult.results)
    }

    const duration = Date.now() - startTime

    if (buildResult.success) {
      logSeparator('=', 60, 'green')
      logSuccess('빌드 스크립트가 완료되었습니다!')
      logSeparator('=', 60, 'green')
    } else {
      logSeparator('=', 60, 'red')
      logError('빌드 스크립트 실패')
      logSeparator('=', 60, 'red')
    }

    return {
      success: buildResult.success,
      duration,
      results: buildResult.results
    }

  } catch (error: any) {
    const duration = Date.now() - startTime
    
    logSeparator('=', 60, 'red')
    logError(`빌드 스크립트 실패: ${error.message}`)
    logSeparator('=', 60, 'red')

    return {
      success: false,
      duration,
      results: { error: error.message }
    }
  }
}

/**
 * 실행 계획 출력
 */
function printExecutionPlan(options: BuildScriptOptions): void {
  logInfo('\n📋 실행 계획:')
  logInfo(`- 프로젝트: ${options.projectRoot}`)
  logInfo(`- 타임아웃: ${options.timeout / 1000}초`)
  logInfo(`- 최대 재시도: ${options.maxRetries}회`)
  logInfo(`- 병렬 처리: ${options.parallel ? '활성화' : '비활성화'}`)
  logInfo(`- 검증: ${options.validate ? '활성화' : '비활성화'}`)
  logInfo(`- 정리: ${options.cleanup ? '활성화' : '비활성화'}`)
  logInfo(`- 상세 로그: ${options.verbose ? '활성화' : '비활성화'}`)
  logInfo(`- 드라이 런: ${options.dryRun ? '활성화' : '비활성화'}`)
}

/**
 * 명령행 인수 파싱
 */
function parseArguments(): Partial<BuildScriptOptions> {
  const args = process.argv.slice(2)
  const options: Partial<BuildScriptOptions> = {}

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    
    switch (arg) {
      case '--project-root':
      case '-p':
        options.projectRoot = args[++i]
        break
      case '--timeout':
      case '-t':
        options.timeout = parseInt(args[++i]) * 1000
        break
      case '--max-retries':
      case '-r':
        options.maxRetries = parseInt(args[++i])
        break
      case '--parallel':
        options.parallel = true
        break
      case '--no-parallel':
        options.parallel = false
        break
      case '--validate':
        options.validate = true
        break
      case '--no-validate':
        options.validate = false
        break
      case '--cleanup':
        options.cleanup = true
        break
      case '--no-cleanup':
        options.cleanup = false
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
사용법: node build.ts [옵션]

옵션:
  -p, --project-root <path>   프로젝트 루트 경로
  -t, --timeout <sec>         타임아웃 (초)
  -r, --max-retries <num>     최대 재시도 수
  --parallel                  병렬 처리 활성화
  --no-parallel               병렬 처리 비활성화
  --validate                  검증 활성화
  --no-validate              검증 비활성화
  --cleanup                  정리 활성화
  --no-cleanup               정리 비활성화
  -v, --verbose              상세 로그 활성화
  -d, --dry-run              드라이 런 모드
  -h, --help                  도움말 출력

예시:
  node build.ts --verbose
  node build.ts --parallel --timeout 600
  node build.ts --dry-run
`)
}

/**
 * 메인 함수
 */
async function main(): Promise<void> {
  try {
    const options = parseArguments()
    const result = await runBuildScript(options)
    
    if (result.success) {
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
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}

// export { runBuildScript } - 이미 위에서 export됨
