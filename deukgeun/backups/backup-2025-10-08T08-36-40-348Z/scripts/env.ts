#!/usr/bin/env node

/**
 * 함수형 환경 설정 스크립트
 * 환경 변수 설정 및 관리를 위한 스크립트
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
  createEnvFiles,
  validateEnvFiles,
  loadEnvVariables,
  printEnvSummary,
  completeEnvSetup
} from './modules/env-functions'

// 스크립트 옵션 인터페이스
interface EnvScriptOptions {
  projectRoot: string
  backendDir: string
  frontendDir: string
  env: string
  action: 'create' | 'validate' | 'load' | 'all'
  verbose: boolean
  dryRun: boolean
}

// 기본 옵션
const defaultOptions: EnvScriptOptions = {
  projectRoot: process.cwd(),
  backendDir: 'src/backend',
  frontendDir: 'src/frontend',
  env: 'development',
  action: 'all',
  verbose: false,
  dryRun: false
}

/**
 * 환경 설정 스크립트 실행
 */
export async function runEnvScript(options: Partial<EnvScriptOptions> = {}): Promise<{ success: boolean; duration: number; results: any }> {
  const startTime = Date.now()
  const finalOptions = { ...defaultOptions, ...options }
  
  try {
    // 로거 설정
    if (finalOptions.verbose) {
      setLogLevel('debug')
    }
    setLogPrefix('ENV')

    logSeparator('=', 60, 'bright')
    logStep('ENV', '환경 설정 스크립트를 시작합니다...')
    logSeparator('=', 60, 'bright')

    // 실행 계획 출력
    printExecutionPlan(finalOptions)

    // 드라이 런 모드
    if (finalOptions.dryRun) {
      logInfo('드라이 런 모드: 실제 환경 설정하지 않습니다.')
      return {
        success: true,
        duration: 0,
        results: { dryRun: true }
      }
    }

    const config = {
      projectRoot: finalOptions.projectRoot,
      backendDir: path.join(finalOptions.projectRoot, finalOptions.backendDir),
      frontendDir: path.join(finalOptions.projectRoot, finalOptions.frontendDir),
      env: finalOptions.env,
      verbose: finalOptions.verbose
    }

    let results: any = {}

    switch (finalOptions.action) {
      case 'create':
        results = await runCreateAction(config)
        break
      case 'validate':
        results = await runValidateAction(config)
        break
      case 'load':
        results = await runLoadAction(config)
        break
      case 'all':
        results = await runAllAction(config)
        break
      default:
        throw new Error(`알 수 없는 액션: ${finalOptions.action}`)
    }

    const duration = Date.now() - startTime

    if (results.success) {
      logSeparator('=', 60, 'green')
      logSuccess('환경 설정 스크립트가 완료되었습니다!')
      logSeparator('=', 60, 'green')
    } else {
      logSeparator('=', 60, 'red')
      logError('환경 설정 스크립트 실패')
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
    logError(`환경 설정 스크립트 실패: ${error.message}`)
    logSeparator('=', 60, 'red')

    return {
      success: false,
      duration,
      results: { error: error.message }
    }
  }
}

/**
 * 생성 액션 실행
 */
async function runCreateAction(config: any): Promise<any> {
  logStep('CREATE', '환경 파일 생성 중...')
  
  try {
    const success = createEnvFiles(config)
    
    return {
      success,
      action: 'create',
      timestamp: new Date().toISOString()
    }

  } catch (error: any) {
    logError(`생성 액션 실행 실패: ${error.message}`)
    throw error
  }
}

/**
 * 검증 액션 실행
 */
async function runValidateAction(config: any): Promise<any> {
  logStep('VALIDATE', '환경 파일 검증 중...')
  
  try {
    const success = validateEnvFiles(config)
    
    return {
      success,
      action: 'validate',
      timestamp: new Date().toISOString()
    }

  } catch (error: any) {
    logError(`검증 액션 실행 실패: ${error.message}`)
    throw error
  }
}

/**
 * 로드 액션 실행
 */
async function runLoadAction(config: any): Promise<any> {
  logStep('LOAD', '환경 변수 로드 중...')
  
  try {
    const envVars = loadEnvVariables(config)
    
    return {
      success: true,
      action: 'load',
      timestamp: new Date().toISOString(),
      envVars
    }

  } catch (error: any) {
    logError(`로드 액션 실행 실패: ${error.message}`)
    throw error
  }
}

/**
 * 전체 액션 실행
 */
async function runAllAction(config: any): Promise<any> {
  logStep('ALL', '전체 환경 설정 실행 중...')
  
  try {
    printEnvSummary(config)
    
    // 1. 환경 파일 생성
    const createResult = await runCreateAction(config)
    if (!createResult.success) {
      return createResult
    }
    
    // 2. 환경 파일 검증
    const validateResult = await runValidateAction(config)
    if (!validateResult.success) {
      return validateResult
    }
    
    // 3. 환경 변수 로드
    const loadResult = await runLoadAction(config)
    
    // 4. 완료 메시지
    completeEnvSetup(config)
    
    return {
      success: true,
      action: 'all',
      timestamp: new Date().toISOString(),
      results: {
        create: createResult,
        validate: validateResult,
        load: loadResult
      }
    }

  } catch (error: any) {
    logError(`전체 액션 실행 실패: ${error.message}`)
    throw error
  }
}

/**
 * 실행 계획 출력
 */
function printExecutionPlan(options: EnvScriptOptions): void {
  logInfo('\n📋 실행 계획:')
  logInfo(`- 프로젝트: ${options.projectRoot}`)
  logInfo(`- 백엔드: ${options.backendDir}`)
  logInfo(`- 프론트엔드: ${options.frontendDir}`)
  logInfo(`- 환경: ${options.env}`)
  logInfo(`- 액션: ${options.action}`)
  logInfo(`- 상세 로그: ${options.verbose ? '활성화' : '비활성화'}`)
  logInfo(`- 드라이 런: ${options.dryRun ? '활성화' : '비활성화'}`)
}

/**
 * 명령행 인수 파싱
 */
function parseArguments(): Partial<EnvScriptOptions> {
  const args = process.argv.slice(2)
  const options: Partial<EnvScriptOptions> = {}

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    
    switch (arg) {
      case '--project-root':
      case '-p':
        options.projectRoot = args[++i]
        break
      case '--backend-dir':
      case '-b':
        options.backendDir = args[++i]
        break
      case '--frontend-dir':
      case '-f':
        options.frontendDir = args[++i]
        break
      case '--env':
      case '-e':
        options.env = args[++i]
        break
      case '--action':
      case '-a':
        options.action = args[++i] as any
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
사용법: node env-script.ts [옵션]

옵션:
  -p, --project-root <path>   프로젝트 루트 경로
  -b, --backend-dir <path>     백엔드 디렉토리
  -f, --frontend-dir <path>   프론트엔드 디렉토리
  -e, --env <env>             환경 (development|production)
  -a, --action <action>       액션 (create|validate|load|all)
  -v, --verbose              상세 로그 활성화
  -d, --dry-run              드라이 런 모드
  -h, --help                  도움말 출력

예시:
  node env-script.ts --action create --verbose
  node env-script.ts --action validate --env production
  node env-script.ts --dry-run
`)
}

/**
 * 메인 함수
 */
async function main(): Promise<void> {
  try {
    const options = parseArguments()
    const result = await runEnvScript(options)
    
    if (result.success) {
      process.exit(0)
    } else {
      process.exit(1)
    }
    
  } catch (error: any) {
    logError(`환경 설정 스크립트 실패: ${error.message}`)
    process.exit(1)
  }
}

// 스크립트 실행
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}

// export { runEnvScript } - 이미 위에서 export됨
