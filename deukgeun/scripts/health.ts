#!/usr/bin/env node

/**
 * 함수형 헬스 모니터링 스크립트
 * 시스템 리소스 및 애플리케이션 상태를 모니터링하는 스크립트
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
  runHealthMonitoring, 
  runHealthCheck,
  generateHealthReport 
} from './modules/health-functions'

// 스크립트 옵션 인터페이스
interface HealthScriptOptions {
  projectRoot: string
  logDir: string
  healthCheckInterval: number
  maxLogFiles: number
  alertThresholds: {
    cpu: number
    memory: number
    disk: number
  }
  mode: 'check' | 'monitor'
  verbose: boolean
  dryRun: boolean
}

// 기본 옵션
const defaultOptions: HealthScriptOptions = {
  projectRoot: process.cwd(),
  logDir: 'logs',
  healthCheckInterval: 30000, // 30초
  maxLogFiles: 7,
  alertThresholds: {
    cpu: 80,
    memory: 85,
    disk: 90
  },
  mode: 'check',
  verbose: false,
  dryRun: false
}

/**
 * 헬스 스크립트 실행
 */
export async function runHealthScript(options: Partial<HealthScriptOptions> = {}): Promise<{ success: boolean; duration: number; results: any }> {
  const startTime = Date.now()
  const finalOptions = { ...defaultOptions, ...options }
  
  try {
    // 로거 설정
    if (finalOptions.verbose) {
      setLogLevel('debug')
    }
    setLogPrefix('HEALTH')

    logSeparator('=', 60, 'bright')
    logStep('HEALTH', '헬스 모니터링 스크립트를 시작합니다...')
    logSeparator('=', 60, 'bright')

    // 실행 계획 출력
    printExecutionPlan(finalOptions)

    // 드라이 런 모드
    if (finalOptions.dryRun) {
      logInfo('드라이 런 모드: 실제 모니터링하지 않습니다.')
      return {
        success: true,
        duration: 0,
        results: { dryRun: true }
      }
    }

    let results: any = {}

    switch (finalOptions.mode) {
      case 'check':
        results = await runHealthCheckMode(finalOptions)
        break
      case 'monitor':
        results = await runHealthMonitorMode(finalOptions)
        break
      default:
        throw new Error(`알 수 없는 모드: ${finalOptions.mode}`)
    }

    const duration = Date.now() - startTime

    if (results.success) {
      logSeparator('=', 60, 'green')
      logSuccess('헬스 스크립트가 완료되었습니다!')
      logSeparator('=', 60, 'green')
    } else {
      logSeparator('=', 60, 'red')
      logError('헬스 스크립트 실패')
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
    logError(`헬스 스크립트 실패: ${error.message}`)
    logSeparator('=', 60, 'red')

    return {
      success: false,
      duration,
      results: { error: error.message }
    }
  }
}

/**
 * 헬스체크 모드 실행
 */
async function runHealthCheckMode(options: HealthScriptOptions): Promise<any> {
  logStep('CHECK', '헬스체크 모드 실행 중...')
  
  try {
    const config = {
      projectRoot: options.projectRoot,
      logDir: options.logDir,
      healthCheckInterval: options.healthCheckInterval,
      maxLogFiles: options.maxLogFiles,
      alertThresholds: options.alertThresholds
    }

    const success = runHealthCheck(config)
    
    return {
      success,
      mode: 'check',
      timestamp: new Date().toISOString()
    }

  } catch (error: any) {
    logError(`헬스체크 모드 실행 실패: ${error.message}`)
    throw error
  }
}

/**
 * 헬스 모니터링 모드 실행
 */
async function runHealthMonitorMode(options: HealthScriptOptions): Promise<any> {
  logStep('MONITOR', '헬스 모니터링 모드 실행 중...')
  
  try {
    const config = {
      projectRoot: options.projectRoot,
      logDir: options.logDir,
      healthCheckInterval: options.healthCheckInterval,
      maxLogFiles: options.maxLogFiles,
      alertThresholds: options.alertThresholds
    }

    runHealthMonitoring(config)
    
    return {
      success: true,
      mode: 'monitor',
      timestamp: new Date().toISOString()
    }

  } catch (error: any) {
    logError(`헬스 모니터링 모드 실행 실패: ${error.message}`)
    throw error
  }
}

/**
 * 실행 계획 출력
 */
function printExecutionPlan(options: HealthScriptOptions): void {
  logInfo('\n📋 실행 계획:')
  logInfo(`- 프로젝트: ${options.projectRoot}`)
  logInfo(`- 모드: ${options.mode}`)
  logInfo(`- 로그 디렉토리: ${options.logDir}`)
  logInfo(`- 체크 간격: ${options.healthCheckInterval / 1000}초`)
  logInfo(`- 최대 로그 파일: ${options.maxLogFiles}개`)
  logInfo(`- CPU 임계값: ${options.alertThresholds.cpu}%`)
  logInfo(`- 메모리 임계값: ${options.alertThresholds.memory}%`)
  logInfo(`- 디스크 임계값: ${options.alertThresholds.disk}%`)
  logInfo(`- 상세 로그: ${options.verbose ? '활성화' : '비활성화'}`)
  logInfo(`- 드라이 런: ${options.dryRun ? '활성화' : '비활성화'}`)
}

/**
 * 명령행 인수 파싱
 */
function parseArguments(): Partial<HealthScriptOptions> {
  const args = process.argv.slice(2)
  const options: Partial<HealthScriptOptions> = {}

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    
    switch (arg) {
      case '--project-root':
      case '-p':
        options.projectRoot = args[++i]
        break
      case '--log-dir':
      case '-l':
        options.logDir = args[++i]
        break
      case '--interval':
      case '-i':
        options.healthCheckInterval = parseInt(args[++i]) * 1000
        break
      case '--max-logs':
        options.maxLogFiles = parseInt(args[++i])
        break
      case '--cpu-threshold':
        options.alertThresholds = { ...defaultOptions.alertThresholds, cpu: parseInt(args[++i]) }
        break
      case '--memory-threshold':
        options.alertThresholds = { ...defaultOptions.alertThresholds, memory: parseInt(args[++i]) }
        break
      case '--disk-threshold':
        options.alertThresholds = { ...defaultOptions.alertThresholds, disk: parseInt(args[++i]) }
        break
      case '--mode':
      case '-m':
        options.mode = args[++i] as 'check' | 'monitor'
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
사용법: node health-script.ts [옵션]

옵션:
  -p, --project-root <path>   프로젝트 루트 경로
  -l, --log-dir <path>        로그 디렉토리
  -i, --interval <sec>        체크 간격 (초)
  --max-logs <num>            최대 로그 파일 수
  --cpu-threshold <num>       CPU 임계값 (%)
  --memory-threshold <num>    메모리 임계값 (%)
  --disk-threshold <num>      디스크 임계값 (%)
  -m, --mode <mode>           모드 (check|monitor)
  -v, --verbose              상세 로그 활성화
  -d, --dry-run              드라이 런 모드
  -h, --help                  도움말 출력

예시:
  node health-script.ts --mode check --verbose
  node health-script.ts --mode monitor --interval 60
  node health-script.ts --dry-run
`)
}

/**
 * 메인 함수
 */
async function main(): Promise<void> {
  try {
    const options = parseArguments()
    const result = await runHealthScript(options)
    
    if (result.success) {
      process.exit(0)
    } else {
      process.exit(1)
    }
    
  } catch (error: any) {
    logError(`헬스 스크립트 실패: ${error.message}`)
    process.exit(1)
  }
}

// 스크립트 실행
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}

// export { runHealthScript } - 이미 위에서 export됨
