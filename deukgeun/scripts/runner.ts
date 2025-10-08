#!/usr/bin/env node

/**
 * 함수형 통합 스크립트 실행기
 * 모든 빌드/배포 스크립트를 통합하여 최적화된 실행 흐름 제공
 */

import { 
  logStep, 
  logSuccess, 
  logError, 
  logInfo, 
  logWarning,
  logSeparator,
  configureLogger,
  setLogLevel,
  setLogPrefix
} from './modules/logger-functions'
import { runConvertScript } from './convert'
import { runBuildScript } from './build'
import { runDeployScript } from './deploy'
import { runSafetyScript } from './safety'
import { handleError, ErrorType, ErrorSeverity } from './modules/error-recovery-functions'
import { PerformanceMonitor, ParallelProcessor, performanceUtils } from './modules/performance-functions'

import * as path from 'path'

// 스크립트 타입 정의
type ScriptType = 'convert' | 'build' | 'deploy' | 'safety' | 'all'

// 실행 옵션 인터페이스
interface RunOptions {
  script: ScriptType
  projectRoot: string
  parallel: boolean
  maxWorkers: number
  backup: boolean
  validate: boolean
  autoRecovery: boolean
  maxRetries: number
  timeout: number
  verbose: boolean
  dryRun: boolean
  memoryLimit?: number
  performanceMonitoring?: boolean
  errorReporting?: boolean
}

// 기본 옵션
const defaultOptions: RunOptions = {
  script: 'all',
  projectRoot: process.cwd(),
  parallel: true,
  maxWorkers: performanceUtils.getOptimalWorkerCount(),
  backup: true,
  validate: true,
  autoRecovery: true,
  maxRetries: 3,
  timeout: 300000,
  verbose: false,
  dryRun: false,
  memoryLimit: 1024, // 1GB
  performanceMonitoring: true,
  errorReporting: true
}

/**
 * 최적화된 통합 스크립트 실행기 함수
 */
function createScriptRunner(options: Partial<RunOptions> = {}) {
  const finalOptions = { ...defaultOptions, ...options }
  
  // 로거 설정
  if (finalOptions.verbose) {
    setLogLevel('debug')
  }
  setLogPrefix('RUNNER')

  // 성능 모니터 초기화
  const performanceMonitor = new PerformanceMonitor()
  
  // 시스템 리소스 확인
  const systemResources = performanceUtils.checkSystemResources()
  if (!systemResources.available) {
    logWarning('시스템 리소스가 부족합니다. 성능이 저하될 수 있습니다.')
  }

  return {
    options: finalOptions,
    startTime: 0,
    performanceMonitor,
    systemResources
  }
}

/**
 * 최적화된 스크립트 실행
 */
async function runScript(options: Partial<RunOptions> = {}): Promise<{ success: boolean; duration: number; results: any }> {
  const runner = createScriptRunner(options)
  const startTime = Date.now()
  runner.startTime = startTime
  
  try {
    logSeparator('=', 60, 'bright')
    logInfo('🚀 최적화된 통합 스크립트 실행기를 시작합니다...')
    logSeparator('=', 60, 'bright')

    // 실행 계획 출력
    printExecutionPlan(runner.options)

    // 성능 모니터링 시작
    if (runner.options.performanceMonitoring) {
      runner.performanceMonitor.collectMetrics()
    }

    // 드라이 런 모드
    if (runner.options.dryRun) {
      logInfo('드라이 런 모드: 실제 실행하지 않습니다.')
      return {
        success: true,
        duration: 0,
        results: { dryRun: true }
      }
    }

    let results: any = {}

    try {
      switch (runner.options.script) {
        case 'convert':
          results = await runConversion(runner.options)
          break
        case 'build':
          results = await runBuild(runner.options)
          break
        case 'deploy':
          results = await runDeploy(runner.options)
          break
        case 'safety':
          results = await runSafety(runner.options)
          break
        case 'all':
          results = await runAll(runner.options)
          break
        default:
          throw new Error(`알 수 없는 스크립트 타입: ${runner.options.script}`)
      }
    } catch (error: any) {
      // 통합 에러 처리
      if (runner.options.errorReporting) {
        const errorResult = await handleError(error, {
          script: runner.options.script,
          options: runner.options
        }, {
          autoRecovery: runner.options.autoRecovery,
          maxRetries: runner.options.maxRetries
        })

        if (errorResult.recovered) {
          logSuccess('에러가 자동으로 복구되었습니다. 다시 시도합니다.')
          // 복구 후 재시도 로직 (간단한 구현)
          throw new Error('복구 후 재시도가 필요합니다')
        } else {
          throw error
        }
      } else {
        throw error
      }
    }

    const duration = Date.now() - startTime
    const success = results.success !== false

    // 성능 통계 출력
    if (runner.options.performanceMonitoring) {
      const stats = runner.performanceMonitor.generateStats()
      logInfo(`\n📊 성능 통계:`)
      logInfo(`- 평균 메모리: ${stats.averageMemory.toFixed(2)}MB`)
      logInfo(`- 최대 메모리: ${stats.peakMemory.toFixed(2)}MB`)
      logInfo(`- 평균 CPU: ${stats.averageCpu.toFixed(2)}초`)
      logInfo(`- 총 소요시간: ${(stats.duration / 1000).toFixed(2)}초`)
    }

    if (success) {
      logSeparator('=', 60, 'green')
      logSuccess('🎉 스크립트 실행이 완료되었습니다!')
      logSeparator('=', 60, 'green')
    } else {
      logSeparator('=', 60, 'red')
      logError('❌ 스크립트 실행 실패')
      logSeparator('=', 60, 'red')
    }

    return {
      success,
      duration,
      results
    }

  } catch (error: any) {
    logSeparator('=', 60, 'red')
    logError(`스크립트 실행 실패: ${error.message}`)
    logSeparator('=', 60, 'red')

    return {
      success: false,
      duration: Date.now() - startTime,
      results: { error: error.message }
    }
  }
}

/**
 * 변환만 실행
 */
async function runConversion(options: RunOptions): Promise<any> {
  logStep('CONVERT', '변환 스크립트 실행 중...')
  
  try {
    const result = await runConvertScript({
      projectRoot: options.projectRoot,
      backup: options.backup,
      validate: options.validate,
      polyfill: true,
      parallel: options.parallel,
      maxWorkers: options.maxWorkers,
      verbose: options.verbose,
      dryRun: options.dryRun
    })

    return result.results

  } catch (error: any) {
    logError(`변환 실행 실패: ${error.message}`)
    throw error
  }
}

/**
 * 빌드만 실행
 */
async function runBuild(options: RunOptions): Promise<any> {
  logStep('BUILD', '빌드 스크립트 실행 중...')
  
  try {
    const result = await runBuildScript({
      projectRoot: options.projectRoot,
      timeout: options.timeout,
      maxRetries: options.maxRetries,
      parallel: false,
      validate: options.validate,
      cleanup: true,
      verbose: options.verbose,
      dryRun: options.dryRun
    })

    return result.results

  } catch (error: any) {
    logError(`빌드 실행 실패: ${error.message}`)
    throw error
  }
}

/**
 * 배포만 실행
 */
async function runDeploy(options: RunOptions): Promise<any> {
  logStep('DEPLOY', '배포 스크립트 실행 중...')
  
  try {
    const result = await runDeployScript({
      projectRoot: options.projectRoot,
      timeout: options.timeout,
      maxRetries: options.maxRetries,
      parallel: options.parallel,
      validate: options.validate,
      cleanup: true,
      backup: options.backup,
      autoRecovery: options.autoRecovery,
      verbose: options.verbose,
      dryRun: options.dryRun
    })

    return result.results

  } catch (error: any) {
    logError(`배포 실행 실패: ${error.message}`)
    throw error
  }
}

/**
 * 안전장치만 실행
 */
async function runSafety(options: RunOptions): Promise<any> {
  logStep('SAFETY', '안전장치 스크립트 실행 중...')
  
  try {
    const result = await runSafetyScript({
      projectRoot: options.projectRoot,
      createBackup: options.backup,
      validateBefore: options.validate,
      validateAfter: options.validate,
      rollbackOnError: options.autoRecovery,
      verbose: options.verbose,
      dryRun: options.dryRun
    })

    return result.results

  } catch (error: any) {
    logError(`안전장치 실행 실패: ${error.message}`)
    throw error
  }
}

/**
 * 전체 실행 (변환 + 빌드 + 배포)
 */
async function runAll(options: RunOptions): Promise<any> {
  logStep('ALL', '전체 스크립트 실행 중...')
  
  try {
    const results: any = {}

    // 1. 변환 실행
    results.conversion = await runConversion(options)

    // 2. 빌드 실행
    results.build = await runBuild(options)

    // 3. 배포 실행
    results.deploy = await runDeploy(options)

    return {
      success: results.conversion.success && results.build.success && results.deploy.success,
      conversion: results.conversion,
      build: results.build,
      deploy: results.deploy
    }

  } catch (error: any) {
    logError(`전체 실행 실패: ${error.message}`)
    throw error
  }
}

/**
 * 실행 계획 출력
 */
function printExecutionPlan(options: RunOptions): void {
  logInfo('\n📋 실행 계획:')
  logInfo(`- 스크립트: ${options.script}`)
  logInfo(`- 프로젝트: ${options.projectRoot}`)
  logInfo(`- 병렬 처리: ${options.parallel ? '활성화' : '비활성화'}`)
  logInfo(`- 최대 워커: ${options.maxWorkers}개`)
  logInfo(`- 백업: ${options.backup ? '활성화' : '비활성화'}`)
  logInfo(`- 검증: ${options.validate ? '활성화' : '비활성화'}`)
  logInfo(`- 자동 복구: ${options.autoRecovery ? '활성화' : '비활성화'}`)
  logInfo(`- 최대 재시도: ${options.maxRetries}회`)
  logInfo(`- 타임아웃: ${options.timeout / 1000}초`)
  logInfo(`- 상세 로그: ${options.verbose ? '활성화' : '비활성화'}`)
  logInfo(`- 드라이 런: ${options.dryRun ? '활성화' : '비활성화'}`)
}

/**
 * 명령행 인수 파싱
 */
function parseArguments(): Partial<RunOptions> {
  const args = process.argv.slice(2)
  const options: Partial<RunOptions> = {}

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    
    switch (arg) {
      case '--script':
      case '-s':
        options.script = args[++i] as ScriptType
        break
      case '--project-root':
      case '-p':
        options.projectRoot = args[++i]
        break
      case '--parallel':
        options.parallel = true
        break
      case '--no-parallel':
        options.parallel = false
        break
      case '--max-workers':
      case '-w':
        options.maxWorkers = parseInt(args[++i])
        break
      case '--backup':
        options.backup = true
        break
      case '--no-backup':
        options.backup = false
        break
      case '--validate':
        options.validate = true
        break
      case '--no-validate':
        options.validate = false
        break
      case '--auto-recovery':
        options.autoRecovery = true
        break
      case '--no-auto-recovery':
        options.autoRecovery = false
        break
      case '--max-retries':
      case '-r':
        options.maxRetries = parseInt(args[++i])
        break
      case '--timeout':
      case '-t':
        options.timeout = parseInt(args[++i]) * 1000
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
사용법: node script-runner.ts [옵션]

옵션:
  -s, --script <type>        실행할 스크립트 타입 (convert|build|deploy|safety|all)
  -p, --project-root <path>   프로젝트 루트 경로
  --parallel                  병렬 처리 활성화
  --no-parallel               병렬 처리 비활성화
  -w, --max-workers <num>     최대 워커 수
  --backup                    백업 활성화
  --no-backup                 백업 비활성화
  --validate                  검증 활성화
  --no-validate              검증 비활성화
  --auto-recovery            자동 복구 활성화
  --no-auto-recovery         자동 복구 비활성화
  -r, --max-retries <num>     최대 재시도 수
  -t, --timeout <sec>         타임아웃 (초)
  -v, --verbose              상세 로그 활성화
  -d, --dry-run              드라이 런 모드
  -h, --help                  도움말 출력

예시:
  node script-runner.ts --script convert --verbose
  node script-runner.ts --script build --parallel --max-workers 8
  node script-runner.ts --script deploy --no-backup
  node script-runner.ts --script all --dry-run
`)
}

/**
 * 메인 함수
 */
async function main(): Promise<void> {
  try {
    const options = parseArguments()
    const result = await runScript(options)
    
    if (result.success) {
      process.exit(0)
    } else {
      process.exit(1)
    }
    
  } catch (error: any) {
    logError(`스크립트 실행기 실패: ${error.message}`)
    process.exit(1)
  }
}

// 스크립트 실행
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}

export {
  runScript,
  main
}
