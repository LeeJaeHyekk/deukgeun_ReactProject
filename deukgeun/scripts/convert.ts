#!/usr/bin/env node

/**
 * 함수형 변환 스크립트
 * ES Modules를 CommonJS로 변환하는 스크립트
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
  convertFiles, 
  scanConversionTargets, 
  printConversionReport 
} from './modules/converter-functions'
import { 
  fileExists, 
  scanDirectory 
} from './modules/file-functions'

// 스크립트 옵션 인터페이스
interface ConvertOptions {
  projectRoot: string
  backup: boolean
  validate: boolean
  polyfill: boolean
  parallel: boolean
  maxWorkers: number
  verbose: boolean
  dryRun: boolean
}

// 기본 옵션
const defaultOptions: ConvertOptions = {
  projectRoot: process.cwd(),
  backup: true,
  validate: true,
  polyfill: true,
  parallel: true,
  maxWorkers: 4,
  verbose: false,
  dryRun: false
}

/**
 * 변환 스크립트 실행
 */
export async function runConvertScript(options: Partial<ConvertOptions> = {}): Promise<{ success: boolean; duration: number; results: any }> {
  const startTime = Date.now()
  const finalOptions = { ...defaultOptions, ...options }
  
  try {
    // 로거 설정
    if (finalOptions.verbose) {
      setLogLevel('debug')
    }
    setLogPrefix('CONVERT')

    logSeparator('=', 60, 'bright')
    logStep('CONVERT', '변환 스크립트를 시작합니다...')
    logSeparator('=', 60, 'bright')

    // 실행 계획 출력
    printExecutionPlan(finalOptions)

    // 드라이 런 모드
    if (finalOptions.dryRun) {
      logInfo('드라이 런 모드: 실제 변환하지 않습니다.')
      return {
        success: true,
        duration: 0,
        results: { dryRun: true }
      }
    }

    // 변환 대상 스캔
    const conversionTargets = scanConversionTargets(finalOptions.projectRoot)
    
    if (conversionTargets.length === 0) {
      logInfo('변환이 필요한 파일이 없습니다.')
      return {
        success: true,
        duration: Date.now() - startTime,
        results: { converted: 0, total: 0 }
      }
    }

    // 변환 실행
    const conversionReport = convertFiles(conversionTargets, {
      backup: finalOptions.backup,
      validate: finalOptions.validate,
      polyfill: finalOptions.polyfill,
      parallel: finalOptions.parallel,
      maxWorkers: finalOptions.maxWorkers
    })

    // 변환 결과 보고서 출력
    printConversionReport(conversionReport)

    const duration = Date.now() - startTime
    const success = conversionReport.failed.length === 0

    if (success) {
      logSeparator('=', 60, 'green')
      logSuccess('변환 스크립트가 완료되었습니다!')
      logSeparator('=', 60, 'green')
    } else {
      logSeparator('=', 60, 'red')
      logError('변환 스크립트 실패')
      logSeparator('=', 60, 'red')
    }

    return {
      success,
      duration,
      results: {
        converted: conversionReport.success.filter(r => r.converted).length,
        failed: conversionReport.failed.length,
        total: conversionReport.total
      }
    }

  } catch (error: any) {
    const duration = Date.now() - startTime
    
    logSeparator('=', 60, 'red')
    logError(`변환 스크립트 실패: ${error.message}`)
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
function printExecutionPlan(options: ConvertOptions): void {
  logInfo('\n📋 실행 계획:')
  logInfo(`- 프로젝트: ${options.projectRoot}`)
  logInfo(`- 백업: ${options.backup ? '활성화' : '비활성화'}`)
  logInfo(`- 검증: ${options.validate ? '활성화' : '비활성화'}`)
  logInfo(`- Polyfill: ${options.polyfill ? '활성화' : '비활성화'}`)
  logInfo(`- 병렬 처리: ${options.parallel ? '활성화' : '비활성화'}`)
  logInfo(`- 최대 워커: ${options.maxWorkers}개`)
  logInfo(`- 상세 로그: ${options.verbose ? '활성화' : '비활성화'}`)
  logInfo(`- 드라이 런: ${options.dryRun ? '활성화' : '비활성화'}`)
}

/**
 * 명령행 인수 파싱
 */
function parseArguments(): Partial<ConvertOptions> {
  const args = process.argv.slice(2)
  const options: Partial<ConvertOptions> = {}

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    
    switch (arg) {
      case '--project-root':
      case '-p':
        options.projectRoot = args[++i]
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
      case '--polyfill':
        options.polyfill = true
        break
      case '--no-polyfill':
        options.polyfill = false
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
사용법: node convert-script.ts [옵션]

옵션:
  -p, --project-root <path>   프로젝트 루트 경로
  --backup                    백업 활성화
  --no-backup                 백업 비활성화
  --validate                  검증 활성화
  --no-validate              검증 비활성화
  --polyfill                 Polyfill 활성화
  --no-polyfill              Polyfill 비활성화
  --parallel                  병렬 처리 활성화
  --no-parallel               병렬 처리 비활성화
  -w, --max-workers <num>     최대 워커 수
  -v, --verbose              상세 로그 활성화
  -d, --dry-run              드라이 런 모드
  -h, --help                  도움말 출력

예시:
  node convert-script.ts --verbose
  node convert-script.ts --no-backup --parallel --max-workers 8
  node convert-script.ts --dry-run
`)
}

/**
 * 메인 함수
 */
async function main(): Promise<void> {
  try {
    const options = parseArguments()
    const result = await runConvertScript(options)
    
    if (result.success) {
      process.exit(0)
    } else {
      process.exit(1)
    }
    
  } catch (error: any) {
    logError(`변환 스크립트 실패: ${error.message}`)
    process.exit(1)
  }
}

// 스크립트 실행
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}

// export { runConvertScript } - 이미 위에서 export됨
