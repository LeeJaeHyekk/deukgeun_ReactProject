#!/usr/bin/env node

/**
 * 함수형 안전장치 스크립트
 * 프로젝트 안전성을 보장하는 스크립트
 */

import * as path from 'path'
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
import { 
  executeSafetyGuard,
  preBuildSafetyCheck,
  postBuildSafetyCheck,
  createSafetyBackup,
  restoreFromBackup,
  initializeSafetyConfig
} from './modules/safety-functions'

// 스크립트 옵션 인터페이스
interface SafetyScriptOptions {
  projectRoot: string
  createBackup: boolean
  validateBefore: boolean
  validateAfter: boolean
  rollbackOnError: boolean
  maxBackups: number
  backupRetentionDays: number
  verbose: boolean
  dryRun: boolean
}

// 기본 옵션
const defaultOptions: SafetyScriptOptions = {
  projectRoot: process.cwd(),
  createBackup: true,
  validateBefore: true,
  validateAfter: true,
  rollbackOnError: true,
  maxBackups: 5,
  backupRetentionDays: 7,
  verbose: false,
  dryRun: false
}

/**
 * 안전장치 스크립트 실행
 */
async function runSafetyScript(options: Partial<SafetyScriptOptions> = {}): Promise<{ success: boolean; duration: number; results: any }> {
  const startTime = Date.now()
  const finalOptions = { ...defaultOptions, ...options }

  try {
    // 로거 설정
    if (finalOptions.verbose) {
      setLogLevel('debug')
    }
    setLogPrefix('SAFETY')

    logSeparator('=', 60, 'blue')
    logStep('SAFETY', '안전장치 스크립트 시작')
    logSeparator('=', 60, 'blue')

    // 드라이런 모드
    if (finalOptions.dryRun) {
      logInfo('드라이런 모드: 실제 작업은 수행하지 않습니다')
      return {
        success: true,
        duration: 0,
        results: { dryRun: true }
      }
    }

    // 안전장치 실행
    const safetyResult = await executeSafetyGuard(finalOptions.projectRoot, {
      createBackup: finalOptions.createBackup,
      validateBefore: finalOptions.validateBefore,
      validateAfter: finalOptions.validateAfter,
      rollbackOnError: finalOptions.rollbackOnError,
      maxBackups: finalOptions.maxBackups,
      backupRetentionDays: finalOptions.backupRetentionDays
    })

    const duration = Date.now() - startTime

    if (safetyResult.success) {
      logSeparator('=', 60, 'green')
      logSuccess('안전장치 스크립트가 완료되었습니다!')
      if (safetyResult.backupPath) {
        logInfo(`백업 경로: ${safetyResult.backupPath}`)
      }
      logSeparator('=', 60, 'green')
    } else {
      logSeparator('=', 60, 'red')
      logError('안전장치 스크립트 실패')
      if (safetyResult.error) {
        logError(`오류: ${safetyResult.error}`)
      }
      logSeparator('=', 60, 'red')
    }

    return {
      success: safetyResult.success,
      duration,
      results: {
        backupPath: safetyResult.backupPath,
        error: safetyResult.error
      }
    }

  } catch (error: any) {
    const duration = Date.now() - startTime
    logError(`안전장치 스크립트 실행 중 오류: ${error.message}`)
    
    return {
      success: false,
      duration,
      results: { error: error.message }
    }
  }
}

/**
 * 사전 안전 검사 실행
 */
async function runPreSafetyCheck(projectRoot: string): Promise<{ success: boolean; results: any }> {
  try {
    logStep('SAFETY', '사전 안전 검사 실행 중...')
    
    const config = initializeSafetyConfig(projectRoot)
    const result = await preBuildSafetyCheck(config)
    
    if (result.success) {
      logSuccess('사전 안전 검사 완료')
    } else {
      logError('사전 안전 검사 실패')
      result.errors.forEach(error => logError(`- ${error}`))
    }
    
    if (result.warnings.length > 0) {
      logWarning('경고사항:')
      result.warnings.forEach(warning => logWarning(`- ${warning}`))
    }
    
    return {
      success: result.success,
      results: result
    }
  } catch (error: any) {
    logError(`사전 안전 검사 실행 중 오류: ${error.message}`)
    return {
      success: false,
      results: { error: error.message }
    }
  }
}

/**
 * 사후 안전 검사 실행
 */
async function runPostSafetyCheck(projectRoot: string): Promise<{ success: boolean; results: any }> {
  try {
    logStep('SAFETY', '사후 안전 검사 실행 중...')
    
    const config = initializeSafetyConfig(projectRoot)
    const result = await postBuildSafetyCheck(config)
    
    if (result.success) {
      logSuccess('사후 안전 검사 완료')
    } else {
      logError('사후 안전 검사 실패')
      result.errors.forEach(error => logError(`- ${error}`))
    }
    
    if (result.warnings.length > 0) {
      logWarning('경고사항:')
      result.warnings.forEach(warning => logWarning(`- ${warning}`))
    }
    
    return {
      success: result.success,
      results: result
    }
  } catch (error: any) {
    logError(`사후 안전 검사 실행 중 오류: ${error.message}`)
    return {
      success: false,
      results: { error: error.message }
    }
  }
}

/**
 * 백업 생성
 */
async function runBackupCreation(projectRoot: string): Promise<{ success: boolean; backupPath?: string; error?: string }> {
  try {
    logStep('BACKUP', '백업 생성 중...')
    
    const config = initializeSafetyConfig(projectRoot, {
      createBackup: true
    })
    
    const backupPath = await createSafetyBackup(config)
    
    if (backupPath) {
      logSuccess(`백업 생성 완료: ${backupPath}`)
      return {
        success: true,
        backupPath
      }
    } else {
      return {
        success: false,
        error: '백업 생성 실패'
      }
    }
  } catch (error: any) {
    logError(`백업 생성 중 오류: ${error.message}`)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * 백업에서 복원
 */
async function runBackupRestore(projectRoot: string, backupPath: string): Promise<{ success: boolean; error?: string }> {
  try {
    logStep('RESTORE', `백업에서 복원 중: ${backupPath}`)
    
    const config = initializeSafetyConfig(projectRoot)
    const success = await restoreFromBackup(config, backupPath)
    
    if (success) {
      logSuccess('백업에서 복원 완료')
      return { success: true }
    } else {
      return {
        success: false,
        error: '백업 복원 실패'
      }
    }
  } catch (error: any) {
    logError(`백업 복원 중 오류: ${error.message}`)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * 명령행 인수 파싱
 */
function parseArguments(): Partial<SafetyScriptOptions> {
  const args = process.argv.slice(2)
  const options: Partial<SafetyScriptOptions> = {}

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    
    switch (arg) {
      case '--project-root':
        options.projectRoot = args[++i]
        break
      case '--no-backup':
        options.createBackup = false
        break
      case '--no-validate-before':
        options.validateBefore = false
        break
      case '--no-validate-after':
        options.validateAfter = false
        break
      case '--no-rollback':
        options.rollbackOnError = false
        break
      case '--max-backups':
        options.maxBackups = parseInt(args[++i])
        break
      case '--backup-retention-days':
        options.backupRetentionDays = parseInt(args[++i])
        break
      case '--verbose':
      case '-v':
        options.verbose = true
        break
      case '--dry-run':
        options.dryRun = true
        break
      case '--help':
      case '-h':
        console.log(`
안전장치 스크립트 사용법:

  npm run script:safety [옵션]

옵션:
  --project-root <path>     프로젝트 루트 경로 (기본값: 현재 디렉토리)
  --no-backup              백업 생성 비활성화
  --no-validate-before     사전 검증 비활성화
  --no-validate-after      사후 검증 비활성화
  --no-rollback            오류 시 롤백 비활성화
  --max-backups <number>   최대 백업 수 (기본값: 5)
  --backup-retention-days <number>  백업 보존 기간 (기본값: 7)
  --verbose, -v            상세 로그 출력
  --dry-run                드라이런 모드
  --help, -h               도움말 표시

예시:
  npm run script:safety
  npm run script:safety --verbose
  npm run script:safety --no-backup --dry-run
        `)
        process.exit(0)
        break
    }
  }

  return options
}

/**
 * 메인 함수
 */
async function main(): Promise<void> {
  try {
    const options = parseArguments()
    const result = await runSafetyScript(options)
    
    if (result.success) {
      process.exit(0)
    } else {
      process.exit(1)
    }
  } catch (error: any) {
    logError(`안전장치 스크립트 실행 실패: ${error.message}`)
    process.exit(1)
  }
}

// 스크립트가 직접 실행될 때만 main 함수 호출
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}

export {
  runSafetyScript,
  runPreSafetyCheck,
  runPostSafetyCheck,
  runBackupCreation,
  runBackupRestore,
  main
}
