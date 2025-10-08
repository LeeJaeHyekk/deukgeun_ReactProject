#!/usr/bin/env node

/**
 * 함수형 PM2 관리 스크립트
 * PM2 프로세스 관리를 위한 스크립트
 */

import * as path from 'path'
import * as readline from 'readline'
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
  checkPM2Installation,
  showPM2InstallationGuide,
  startPM2Processes,
  stopPM2Processes,
  restartPM2Processes,
  deletePM2Processes,
  showPM2Status,
  showPM2Logs,
  startPM2Monitoring,
  flushPM2Logs,
  printPM2ProcessInfo,
  createPM2Config,
  showPM2Menu
} from './modules/pm2-functions'

// 스크립트 옵션 인터페이스
interface PM2ScriptOptions {
  projectRoot: string
  configFile: string
  env: string
  timeout: number
  action: 'start' | 'stop' | 'restart' | 'delete' | 'status' | 'logs' | 'monitor' | 'flush' | 'config' | 'menu'
  lines: number
  verbose: boolean
  interactive: boolean
}

// 기본 옵션
const defaultOptions: PM2ScriptOptions = {
  projectRoot: process.cwd(),
  configFile: 'ecosystem.config.cjs',
  env: 'production',
  timeout: 60000,
  action: 'menu',
  lines: 50,
  verbose: false,
  interactive: false
}

/**
 * PM2 스크립트 실행
 */
export async function runPM2Script(options: Partial<PM2ScriptOptions> = {}): Promise<{ success: boolean; duration: number; results: any }> {
  const startTime = Date.now()
  const finalOptions = { ...defaultOptions, ...options }
  
  try {
    // 로거 설정
    if (finalOptions.verbose) {
      setLogLevel('debug')
    }
    setLogPrefix('PM2')

    logSeparator('=', 60, 'bright')
    logStep('PM2', 'PM2 관리 스크립트를 시작합니다...')
    logSeparator('=', 60, 'bright')

    // PM2 설치 확인
    if (!checkPM2Installation()) {
      showPM2InstallationGuide()
      return {
        success: false,
        duration: Date.now() - startTime,
        results: { error: 'PM2 not installed' }
      }
    }

    // 실행 계획 출력
    printExecutionPlan(finalOptions)

    let results: any = {}

    switch (finalOptions.action) {
      case 'start':
        results = await runStartAction(finalOptions)
        break
      case 'stop':
        results = await runStopAction(finalOptions)
        break
      case 'restart':
        results = await runRestartAction(finalOptions)
        break
      case 'delete':
        results = await runDeleteAction(finalOptions)
        break
      case 'status':
        results = await runStatusAction(finalOptions)
        break
      case 'logs':
        results = await runLogsAction(finalOptions)
        break
      case 'monitor':
        results = await runMonitorAction(finalOptions)
        break
      case 'flush':
        results = await runFlushAction(finalOptions)
        break
      case 'config':
        results = await runConfigAction(finalOptions)
        break
      case 'menu':
        results = await runMenuAction(finalOptions)
        break
      default:
        throw new Error(`알 수 없는 액션: ${finalOptions.action}`)
    }

    const duration = Date.now() - startTime

    if (results.success) {
      logSeparator('=', 60, 'green')
      logSuccess('PM2 스크립트가 완료되었습니다!')
      logSeparator('=', 60, 'green')
    } else {
      logSeparator('=', 60, 'red')
      logError('PM2 스크립트 실패')
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
    logError(`PM2 스크립트 실패: ${error.message}`)
    logSeparator('=', 60, 'red')

    return {
      success: false,
      duration,
      results: { error: error.message }
    }
  }
}

/**
 * 시작 액션 실행
 */
async function runStartAction(options: PM2ScriptOptions): Promise<any> {
  logStep('START', 'PM2 프로세스 시작 중...')
  
  try {
    const config = {
      projectRoot: options.projectRoot,
      configFile: options.configFile,
      env: options.env,
      timeout: options.timeout
    }

    const success = startPM2Processes(config)
    
    return {
      success,
      action: 'start',
      timestamp: new Date().toISOString()
    }

  } catch (error: any) {
    logError(`시작 액션 실행 실패: ${error.message}`)
    throw error
  }
}

/**
 * 중지 액션 실행
 */
async function runStopAction(options: PM2ScriptOptions): Promise<any> {
  logStep('STOP', 'PM2 프로세스 중지 중...')
  
  try {
    const success = stopPM2Processes()
    
    return {
      success,
      action: 'stop',
      timestamp: new Date().toISOString()
    }

  } catch (error: any) {
    logError(`중지 액션 실행 실패: ${error.message}`)
    throw error
  }
}

/**
 * 재시작 액션 실행
 */
async function runRestartAction(options: PM2ScriptOptions): Promise<any> {
  logStep('RESTART', 'PM2 프로세스 재시작 중...')
  
  try {
    const success = restartPM2Processes()
    
    return {
      success,
      action: 'restart',
      timestamp: new Date().toISOString()
    }

  } catch (error: any) {
    logError(`재시작 액션 실행 실패: ${error.message}`)
    throw error
  }
}

/**
 * 삭제 액션 실행
 */
async function runDeleteAction(options: PM2ScriptOptions): Promise<any> {
  logStep('DELETE', 'PM2 프로세스 삭제 중...')
  
  try {
    const success = deletePM2Processes()
    
    return {
      success,
      action: 'delete',
      timestamp: new Date().toISOString()
    }

  } catch (error: any) {
    logError(`삭제 액션 실행 실패: ${error.message}`)
    throw error
  }
}

/**
 * 상태 액션 실행
 */
async function runStatusAction(options: PM2ScriptOptions): Promise<any> {
  logStep('STATUS', 'PM2 상태 확인 중...')
  
  try {
    showPM2Status()
    printPM2ProcessInfo()
    
    return {
      success: true,
      action: 'status',
      timestamp: new Date().toISOString()
    }

  } catch (error: any) {
    logError(`상태 액션 실행 실패: ${error.message}`)
    throw error
  }
}

/**
 * 로그 액션 실행
 */
async function runLogsAction(options: PM2ScriptOptions): Promise<any> {
  logStep('LOGS', 'PM2 로그 확인 중...')
  
  try {
    showPM2Logs(options.lines)
    
    return {
      success: true,
      action: 'logs',
      timestamp: new Date().toISOString()
    }

  } catch (error: any) {
    logError(`로그 액션 실행 실패: ${error.message}`)
    throw error
  }
}

/**
 * 모니터링 액션 실행
 */
async function runMonitorAction(options: PM2ScriptOptions): Promise<any> {
  logStep('MONITOR', 'PM2 모니터링 시작 중...')
  
  try {
    startPM2Monitoring()
    
    return {
      success: true,
      action: 'monitor',
      timestamp: new Date().toISOString()
    }

  } catch (error: any) {
    logError(`모니터링 액션 실행 실패: ${error.message}`)
    throw error
  }
}

/**
 * 로그 정리 액션 실행
 */
async function runFlushAction(options: PM2ScriptOptions): Promise<any> {
  logStep('FLUSH', 'PM2 로그 정리 중...')
  
  try {
    const success = flushPM2Logs()
    
    return {
      success,
      action: 'flush',
      timestamp: new Date().toISOString()
    }

  } catch (error: any) {
    logError(`로그 정리 액션 실행 실패: ${error.message}`)
    throw error
  }
}

/**
 * 설정 액션 실행
 */
async function runConfigAction(options: PM2ScriptOptions): Promise<any> {
  logStep('CONFIG', 'PM2 설정 파일 생성 중...')
  
  try {
    const success = createPM2Config(options.projectRoot, options.configFile)
    
    return {
      success,
      action: 'config',
      timestamp: new Date().toISOString()
    }

  } catch (error: any) {
    logError(`설정 액션 실행 실패: ${error.message}`)
    throw error
  }
}

/**
 * 메뉴 액션 실행
 */
async function runMenuAction(options: PM2ScriptOptions): Promise<any> {
  if (options.interactive) {
    return await runInteractiveMenu()
  } else {
    showPM2Menu()
    return {
      success: true,
      action: 'menu',
      timestamp: new Date().toISOString()
    }
  }
}

/**
 * 대화형 메뉴 실행
 */
async function runInteractiveMenu(): Promise<any> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  return new Promise((resolve) => {
    const showMenu = () => {
      showPM2Menu()
      rl.question('\n선택하세요 (0-9): ', async (answer) => {
        switch (answer.trim()) {
          case '1':
            await runStartAction(defaultOptions)
            showMenu()
            break
          case '2':
            await runStopAction(defaultOptions)
            showMenu()
            break
          case '3':
            await runRestartAction(defaultOptions)
            showMenu()
            break
          case '4':
            await runDeleteAction(defaultOptions)
            showMenu()
            break
          case '5':
            await runStatusAction(defaultOptions)
            showMenu()
            break
          case '6':
            await runLogsAction(defaultOptions)
            showMenu()
            break
          case '7':
            await runMonitorAction(defaultOptions)
            showMenu()
            break
          case '8':
            await runFlushAction(defaultOptions)
            showMenu()
            break
          case '9':
            await runConfigAction(defaultOptions)
            showMenu()
            break
          case '0':
            rl.close()
            resolve({ success: true, action: 'menu', interactive: true })
            break
          default:
            logError('잘못된 선택입니다.')
            showMenu()
            break
        }
      })
    }

    showMenu()
  })
}

/**
 * 실행 계획 출력
 */
function printExecutionPlan(options: PM2ScriptOptions): void {
  logInfo('\n📋 실행 계획:')
  logInfo(`- 프로젝트: ${options.projectRoot}`)
  logInfo(`- 액션: ${options.action}`)
  logInfo(`- 설정 파일: ${options.configFile}`)
  logInfo(`- 환경: ${options.env}`)
  logInfo(`- 타임아웃: ${options.timeout / 1000}초`)
  logInfo(`- 로그 라인: ${options.lines}개`)
  logInfo(`- 상세 로그: ${options.verbose ? '활성화' : '비활성화'}`)
  logInfo(`- 대화형: ${options.interactive ? '활성화' : '비활성화'}`)
}

/**
 * 명령행 인수 파싱
 */
function parseArguments(): Partial<PM2ScriptOptions> {
  const args = process.argv.slice(2)
  const options: Partial<PM2ScriptOptions> = {}

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    
    switch (arg) {
      case '--project-root':
      case '-p':
        options.projectRoot = args[++i]
        break
      case '--config-file':
      case '-c':
        options.configFile = args[++i]
        break
      case '--env':
      case '-e':
        options.env = args[++i]
        break
      case '--timeout':
      case '-t':
        options.timeout = parseInt(args[++i]) * 1000
        break
      case '--action':
      case '-a':
        options.action = args[++i] as any
        break
      case '--lines':
      case '-l':
        options.lines = parseInt(args[++i])
        break
      case '--verbose':
      case '-v':
        options.verbose = true
        break
      case '--interactive':
      case '-i':
        options.interactive = true
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
사용법: node pm2-script.ts [옵션]

옵션:
  -p, --project-root <path>   프로젝트 루트 경로
  -c, --config-file <file>    PM2 설정 파일
  -e, --env <env>             환경 (production|development)
  -t, --timeout <sec>         타임아웃 (초)
  -a, --action <action>       액션 (start|stop|restart|delete|status|logs|monitor|flush|config|menu)
  -l, --lines <num>           로그 라인 수
  -v, --verbose              상세 로그 활성화
  -i, --interactive          대화형 모드
  -h, --help                  도움말 출력

예시:
  node pm2-script.ts --action start --verbose
  node pm2-script.ts --action status
  node pm2-script.ts --action menu --interactive
`)
}

/**
 * 메인 함수
 */
async function main(): Promise<void> {
  try {
    const options = parseArguments()
    const result = await runPM2Script(options)
    
    if (result.success) {
      process.exit(0)
    } else {
      process.exit(1)
    }
    
  } catch (error: any) {
    logError(`PM2 스크립트 실패: ${error.message}`)
    process.exit(1)
  }
}

// 스크립트 실행
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}

// export { runPM2Script } - 이미 위에서 export됨
