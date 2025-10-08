#!/usr/bin/env node

/**
 * 함수형 테스트 관리 스크립트
 * 테스트 실행 및 관리를 위한 스크립트
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
  runUnitTests,
  runIntegrationTests,
  runE2ETests,
  runAllTests,
  runTestWatch,
  generateTestCoverage,
  createTestConfig,
  createTestSetup,
  printTestSummary,
  createTestLog
} from './modules/test-functions'

// 스크립트 옵션 인터페이스
interface TestScriptOptions {
  projectRoot: string
  testDir: string
  coverageDir: string
  reportDir: string
  timeout: number
  testType: 'unit' | 'integration' | 'e2e' | 'all' | 'watch' | 'coverage' | 'setup'
  verbose: boolean
  dryRun: boolean
}

// 기본 옵션
const defaultOptions: TestScriptOptions = {
  projectRoot: process.cwd(),
  testDir: 'src/frontend',
  coverageDir: 'coverage',
  reportDir: 'test-reports',
  timeout: 300000, // 5분
  testType: 'all',
  verbose: false,
  dryRun: false
}

/**
 * 테스트 스크립트 실행
 */
export async function runTestScript(options: Partial<TestScriptOptions> = {}): Promise<{ success: boolean; duration: number; results: any }> {
  const startTime = Date.now()
  const finalOptions = { ...defaultOptions, ...options }
  
  try {
    // 로거 설정
    if (finalOptions.verbose) {
      setLogLevel('debug')
    }
    setLogPrefix('TEST')

    logSeparator('=', 60, 'bright')
    logStep('TEST', '테스트 관리 스크립트를 시작합니다...')
    logSeparator('=', 60, 'bright')

    // 실행 계획 출력
    printExecutionPlan(finalOptions)

    // 드라이 런 모드
    if (finalOptions.dryRun) {
      logInfo('드라이 런 모드: 실제 테스트하지 않습니다.')
      return {
        success: true,
        duration: 0,
        results: { dryRun: true }
      }
    }

    const config = {
      projectRoot: finalOptions.projectRoot,
      testDir: finalOptions.testDir,
      coverageDir: finalOptions.coverageDir,
      reportDir: finalOptions.reportDir,
      timeout: finalOptions.timeout,
      verbose: finalOptions.verbose
    }

    let results: any = {}

    switch (finalOptions.testType) {
      case 'unit':
        results = await runUnitTestMode(config)
        break
      case 'integration':
        results = await runIntegrationTestMode(config)
        break
      case 'e2e':
        results = await runE2ETestMode(config)
        break
      case 'all':
        results = await runAllTestMode(config)
        break
      case 'watch':
        results = await runWatchTestMode(config)
        break
      case 'coverage':
        results = await runCoverageTestMode(config)
        break
      case 'setup':
        results = await runSetupTestMode(config)
        break
      default:
        throw new Error(`알 수 없는 테스트 타입: ${finalOptions.testType}`)
    }

    const duration = Date.now() - startTime

    if (results.success) {
      logSeparator('=', 60, 'green')
      logSuccess('테스트 스크립트가 완료되었습니다!')
      logSeparator('=', 60, 'green')
    } else {
      logSeparator('=', 60, 'red')
      logError('테스트 스크립트 실패')
      logSeparator('=', 60, 'red')
    }

    return {
      success: results.success,
      duration,
      results
    }

  } catch (error: any) {
    const duration = Date.now() - startTime
    
    logSeparator('=', 60, 'red')
    logError(`테스트 스크립트 실패: ${error.message}`)
    logSeparator('=', 60, 'red')

    return {
      success: false,
      duration,
      results: { error: error.message }
    }
  }
}

/**
 * 단위 테스트 모드 실행
 */
async function runUnitTestMode(config: any): Promise<any> {
  logStep('UNIT', '단위 테스트 모드 실행 중...')
  
  try {
    const result = runUnitTests(config)
    
    if (result.success) {
      printTestSummary([result])
      createTestLog(config.projectRoot, [result])
    }
    
    return result

  } catch (error: any) {
    logError(`단위 테스트 모드 실행 실패: ${error.message}`)
    throw error
  }
}

/**
 * 통합 테스트 모드 실행
 */
async function runIntegrationTestMode(config: any): Promise<any> {
  logStep('INTEGRATION', '통합 테스트 모드 실행 중...')
  
  try {
    const result = runIntegrationTests(config)
    
    if (result.success) {
      printTestSummary([result])
      createTestLog(config.projectRoot, [result])
    }
    
    return result

  } catch (error: any) {
    logError(`통합 테스트 모드 실행 실패: ${error.message}`)
    throw error
  }
}

/**
 * E2E 테스트 모드 실행
 */
async function runE2ETestMode(config: any): Promise<any> {
  logStep('E2E', 'E2E 테스트 모드 실행 중...')
  
  try {
    const result = runE2ETests(config)
    
    if (result.success) {
      printTestSummary([result])
      createTestLog(config.projectRoot, [result])
    }
    
    return result

  } catch (error: any) {
    logError(`E2E 테스트 모드 실행 실패: ${error.message}`)
    throw error
  }
}

/**
 * 모든 테스트 모드 실행
 */
async function runAllTestMode(config: any): Promise<any> {
  logStep('ALL', '모든 테스트 모드 실행 중...')
  
  try {
    const result = runAllTests(config)
    
    if (result.success) {
      printTestSummary([result])
      createTestLog(config.projectRoot, [result])
    }
    
    return result

  } catch (error: any) {
    logError(`모든 테스트 모드 실행 실패: ${error.message}`)
    throw error
  }
}

/**
 * 감시 테스트 모드 실행
 */
async function runWatchTestMode(config: any): Promise<any> {
  logStep('WATCH', '감시 테스트 모드 실행 중...')
  
  try {
    const result = runTestWatch(config)
    
    return result

  } catch (error: any) {
    logError(`감시 테스트 모드 실행 실패: ${error.message}`)
    throw error
  }
}

/**
 * 커버리지 테스트 모드 실행
 */
async function runCoverageTestMode(config: any): Promise<any> {
  logStep('COVERAGE', '커버리지 테스트 모드 실행 중...')
  
  try {
    const result = generateTestCoverage(config)
    
    if (result.success) {
      printTestSummary([result])
      createTestLog(config.projectRoot, [result])
    }
    
    return result

  } catch (error: any) {
    logError(`커버리지 테스트 모드 실행 실패: ${error.message}`)
    throw error
  }
}

/**
 * 설정 테스트 모드 실행
 */
async function runSetupTestMode(config: any): Promise<any> {
  logStep('SETUP', '테스트 설정 모드 실행 중...')
  
  try {
    const configResult = createTestConfig(config.projectRoot)
    const setupResult = createTestSetup(config.projectRoot)
    
    const success = configResult && setupResult
    
    return {
      success,
      action: 'setup',
      timestamp: new Date().toISOString(),
      results: {
        config: configResult,
        setup: setupResult
      }
    }

  } catch (error: any) {
    logError(`테스트 설정 모드 실행 실패: ${error.message}`)
    throw error
  }
}

/**
 * 실행 계획 출력
 */
function printExecutionPlan(options: TestScriptOptions): void {
  logInfo('\n📋 실행 계획:')
  logInfo(`- 프로젝트: ${options.projectRoot}`)
  logInfo(`- 테스트 타입: ${options.testType}`)
  logInfo(`- 테스트 디렉토리: ${options.testDir}`)
  logInfo(`- 커버리지 디렉토리: ${options.coverageDir}`)
  logInfo(`- 리포트 디렉토리: ${options.reportDir}`)
  logInfo(`- 타임아웃: ${options.timeout / 1000}초`)
  logInfo(`- 상세 로그: ${options.verbose ? '활성화' : '비활성화'}`)
  logInfo(`- 드라이 런: ${options.dryRun ? '활성화' : '비활성화'}`)
}

/**
 * 명령행 인수 파싱
 */
function parseArguments(): Partial<TestScriptOptions> {
  const args = process.argv.slice(2)
  const options: Partial<TestScriptOptions> = {}

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    
    switch (arg) {
      case '--project-root':
      case '-p':
        options.projectRoot = args[++i]
        break
      case '--test-dir':
      case '-t':
        options.testDir = args[++i]
        break
      case '--coverage-dir':
      case '-c':
        options.coverageDir = args[++i]
        break
      case '--report-dir':
      case '-r':
        options.reportDir = args[++i]
        break
      case '--timeout':
        options.timeout = parseInt(args[++i]) * 1000
        break
      case '--type':
        options.testType = args[++i] as any
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
사용법: node test-script.ts [옵션]

옵션:
  -p, --project-root <path>   프로젝트 루트 경로
  -t, --test-dir <path>       테스트 디렉토리
  -c, --coverage-dir <path>   커버리지 디렉토리
  -r, --report-dir <path>     리포트 디렉토리
  --timeout <sec>             타임아웃 (초)
  --type <type>               테스트 타입 (unit|integration|e2e|all|watch|coverage|setup)
  -v, --verbose              상세 로그 활성화
  -d, --dry-run              드라이 런 모드
  -h, --help                  도움말 출력

예시:
  node test-script.ts --type unit --verbose
  node test-script.ts --type all --timeout 600
  node test-script.ts --type setup
`)
}

/**
 * 메인 함수
 */
async function main(): Promise<void> {
  try {
    const options = parseArguments()
    const result = await runTestScript(options)
    
    if (result.success) {
      process.exit(0)
    } else {
      process.exit(1)
    }
    
  } catch (error: any) {
    logError(`테스트 스크립트 실패: ${error.message}`)
    process.exit(1)
  }
}

// 스크립트 실행
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}

// export { runTestScript } - 이미 위에서 export됨
