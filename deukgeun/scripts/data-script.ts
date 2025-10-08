#!/usr/bin/env node

/**
 * 함수형 데이터 관리 스크립트
 * 데이터 파일 복사 및 관리를 위한 스크립트
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
  copyDataFiles,
  validateDataFiles,
  cleanupDataFiles,
  listDataFiles,
  printDataFileStats
} from './modules/data-functions'

// 스크립트 옵션 인터페이스
interface DataScriptOptions {
  projectRoot: string
  sourceDir: string
  targetDir: string
  dataFiles: string[]
  action: 'copy' | 'validate' | 'cleanup' | 'list' | 'stats' | 'all'
  verbose: boolean
  dryRun: boolean
}

// 기본 옵션
const defaultOptions: DataScriptOptions = {
  projectRoot: process.cwd(),
  sourceDir: 'src/data',
  targetDir: 'dist/data',
  dataFiles: [
    'gyms_raw.json',
    'gyms_processed.json',
    'locations.json',
    'categories.json'
  ],
  action: 'all',
  verbose: false,
  dryRun: false
}

/**
 * 데이터 스크립트 실행
 */
export async function runDataScript(options: Partial<DataScriptOptions> = {}): Promise<{ success: boolean; duration: number; results: any }> {
  const startTime = Date.now()
  const finalOptions = { ...defaultOptions, ...options }
  
  try {
    // 로거 설정
    if (finalOptions.verbose) {
      setLogLevel('debug')
    }
    setLogPrefix('DATA')

    logSeparator('=', 60, 'bright')
    logStep('DATA', '데이터 관리 스크립트를 시작합니다...')
    logSeparator('=', 60, 'bright')

    // 실행 계획 출력
    printExecutionPlan(finalOptions)

    // 드라이 런 모드
    if (finalOptions.dryRun) {
      logInfo('드라이 런 모드: 실제 데이터 작업하지 않습니다.')
      return {
        success: true,
        duration: 0,
        results: { dryRun: true }
      }
    }

    const config = {
      projectRoot: finalOptions.projectRoot,
      sourceDir: finalOptions.sourceDir,
      targetDir: finalOptions.targetDir,
      dataFiles: finalOptions.dataFiles,
      verbose: finalOptions.verbose
    }

    let results: any = {}

    switch (finalOptions.action) {
      case 'copy':
        results = await runCopyAction(config)
        break
      case 'validate':
        results = await runValidateAction(config)
        break
      case 'cleanup':
        results = await runCleanupAction(config)
        break
      case 'list':
        results = await runListAction(config)
        break
      case 'stats':
        results = await runStatsAction(config)
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
      logSuccess('데이터 스크립트가 완료되었습니다!')
      logSeparator('=', 60, 'green')
    } else {
      logSeparator('=', 60, 'red')
      logError('데이터 스크립트 실패')
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
    logError(`데이터 스크립트 실패: ${error.message}`)
    logSeparator('=', 60, 'red')

    return {
      success: false,
      duration,
      results: { error: error.message }
    }
  }
}

/**
 * 복사 액션 실행
 */
async function runCopyAction(config: any): Promise<any> {
  logStep('COPY', '데이터 파일 복사 중...')
  
  try {
    const success = copyDataFiles(config)
    
    return {
      success,
      action: 'copy',
      timestamp: new Date().toISOString()
    }

  } catch (error: any) {
    logError(`복사 액션 실행 실패: ${error.message}`)
    throw error
  }
}

/**
 * 검증 액션 실행
 */
async function runValidateAction(config: any): Promise<any> {
  logStep('VALIDATE', '데이터 파일 검증 중...')
  
  try {
    const success = validateDataFiles(config)
    
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
 * 정리 액션 실행
 */
async function runCleanupAction(config: any): Promise<any> {
  logStep('CLEANUP', '데이터 파일 정리 중...')
  
  try {
    const success = cleanupDataFiles(config)
    
    return {
      success,
      action: 'cleanup',
      timestamp: new Date().toISOString()
    }

  } catch (error: any) {
    logError(`정리 액션 실행 실패: ${error.message}`)
    throw error
  }
}

/**
 * 목록 액션 실행
 */
async function runListAction(config: any): Promise<any> {
  logStep('LIST', '데이터 파일 목록 출력 중...')
  
  try {
    listDataFiles(config)
    
    return {
      success: true,
      action: 'list',
      timestamp: new Date().toISOString()
    }

  } catch (error: any) {
    logError(`목록 액션 실행 실패: ${error.message}`)
    throw error
  }
}

/**
 * 통계 액션 실행
 */
async function runStatsAction(config: any): Promise<any> {
  logStep('STATS', '데이터 파일 통계 출력 중...')
  
  try {
    printDataFileStats(config)
    
    return {
      success: true,
      action: 'stats',
      timestamp: new Date().toISOString()
    }

  } catch (error: any) {
    logError(`통계 액션 실행 실패: ${error.message}`)
    throw error
  }
}

/**
 * 전체 액션 실행
 */
async function runAllAction(config: any): Promise<any> {
  logStep('ALL', '전체 데이터 관리 실행 중...')
  
  try {
    const results: any = {}
    
    // 1. 데이터 파일 목록 출력
    results.list = await runListAction(config)
    
    // 2. 데이터 파일 통계 출력
    results.stats = await runStatsAction(config)
    
    // 3. 데이터 파일 복사
    results.copy = await runCopyAction(config)
    
    // 4. 데이터 파일 검증
    results.validate = await runValidateAction(config)
    
    const success = results.copy.success && results.validate.success
    
    return {
      success,
      action: 'all',
      timestamp: new Date().toISOString(),
      results
    }

  } catch (error: any) {
    logError(`전체 액션 실행 실패: ${error.message}`)
    throw error
  }
}

/**
 * 실행 계획 출력
 */
function printExecutionPlan(options: DataScriptOptions): void {
  logInfo('\n📋 실행 계획:')
  logInfo(`- 프로젝트: ${options.projectRoot}`)
  logInfo(`- 소스 디렉토리: ${options.sourceDir}`)
  logInfo(`- 대상 디렉토리: ${options.targetDir}`)
  logInfo(`- 액션: ${options.action}`)
  logInfo(`- 데이터 파일: ${options.dataFiles.length}개`)
  logInfo(`- 상세 로그: ${options.verbose ? '활성화' : '비활성화'}`)
  logInfo(`- 드라이 런: ${options.dryRun ? '활성화' : '비활성화'}`)
  
  if (options.verbose) {
    logInfo('\n데이터 파일 목록:')
    options.dataFiles.forEach((file, index) => {
      logInfo(`  ${index + 1}. ${file}`)
    })
  }
}

/**
 * 명령행 인수 파싱
 */
function parseArguments(): Partial<DataScriptOptions> {
  const args = process.argv.slice(2)
  const options: Partial<DataScriptOptions> = {}

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    
    switch (arg) {
      case '--project-root':
      case '-p':
        options.projectRoot = args[++i]
        break
      case '--source-dir':
      case '-s':
        options.sourceDir = args[++i]
        break
      case '--target-dir':
      case '-t':
        options.targetDir = args[++i]
        break
      case '--data-files':
        options.dataFiles = args[++i].split(',')
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
사용법: node data-script.ts [옵션]

옵션:
  -p, --project-root <path>   프로젝트 루트 경로
  -s, --source-dir <path>     소스 디렉토리
  -t, --target-dir <path>     대상 디렉토리
  --data-files <files>        데이터 파일 목록 (쉼표로 구분)
  -a, --action <action>       액션 (copy|validate|cleanup|list|stats|all)
  -v, --verbose              상세 로그 활성화
  -d, --dry-run              드라이 런 모드
  -h, --help                  도움말 출력

예시:
  node data-script.ts --action copy --verbose
  node data-script.ts --action validate --data-files "file1.json,file2.json"
  node data-script.ts --dry-run
`)
}

/**
 * 메인 함수
 */
async function main(): Promise<void> {
  try {
    const options = parseArguments()
    const result = await runDataScript(options)
    
    if (result.success) {
      process.exit(0)
    } else {
      process.exit(1)
    }
    
  } catch (error: any) {
    logError(`데이터 스크립트 실패: ${error.message}`)
    process.exit(1)
  }
}

// 스크립트 실행
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}

// export { runDataScript } - 이미 위에서 export됨
