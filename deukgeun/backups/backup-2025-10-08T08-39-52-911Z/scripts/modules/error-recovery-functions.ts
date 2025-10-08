/**
 * 통합 에러 처리 및 복구 함수 모듈
 * 모든 스크립트에서 일관된 에러 처리와 복구 메커니즘 제공
 */

import * as fs from 'fs'
import * as path from 'path'
import { logError, logWarning, logSuccess, logInfo, logStep } from './logger-functions'
import { fileExists, createBackup, restoreFromBackup } from './file-functions'

// 에러 타입 정의
export enum ErrorType {
  BUILD_ERROR = 'BUILD_ERROR',
  DEPLOY_ERROR = 'DEPLOY_ERROR',
  CONVERSION_ERROR = 'CONVERSION_ERROR',
  FILE_ERROR = 'FILE_ERROR',
  MEMORY_ERROR = 'MEMORY_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  PERMISSION_ERROR = 'PERMISSION_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

// 에러 심각도 정의
export enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

// 복구 전략 정의
export enum RecoveryStrategy {
  RETRY = 'RETRY',
  ROLLBACK = 'ROLLBACK',
  SKIP = 'SKIP',
  ABORT = 'ABORT',
  MANUAL = 'MANUAL'
}

// 에러 정보 인터페이스
export interface ErrorInfo {
  type: ErrorType
  severity: ErrorSeverity
  message: string
  context?: any
  timestamp: string
  recoverable: boolean
  suggestedStrategy: RecoveryStrategy
  retryCount?: number
  maxRetries?: number
}

// 복구 결과 인터페이스
export interface RecoveryResult {
  success: boolean
  strategy: RecoveryStrategy
  message: string
  nextAction?: string
}

// 에러 처리 옵션
export interface ErrorHandlerOptions {
  maxRetries: number
  retryDelay: number
  autoRecovery: boolean
  createBackup: boolean
  logErrors: boolean
  notifyOnCritical: boolean
}

// 기본 옵션
const defaultOptions: ErrorHandlerOptions = {
  maxRetries: 3,
  retryDelay: 2000,
  autoRecovery: true,
  createBackup: true,
  logErrors: true,
  notifyOnCritical: true
}

/**
 * 에러 분석 및 분류
 */
export function analyzeError(error: Error, context: any = {}): ErrorInfo {
  const message = error.message.toLowerCase()
  
  // 에러 타입 결정
  let type: ErrorType = ErrorType.UNKNOWN_ERROR
  let severity: ErrorSeverity = ErrorSeverity.MEDIUM
  let recoverable = true
  let suggestedStrategy: RecoveryStrategy = RecoveryStrategy.RETRY

  // 빌드 관련 에러
  if (message.includes('build') || message.includes('compile') || message.includes('typescript')) {
    type = ErrorType.BUILD_ERROR
    severity = ErrorSeverity.HIGH
    suggestedStrategy = RecoveryStrategy.RETRY
  }
  // 배포 관련 에러
  else if (message.includes('deploy') || message.includes('pm2') || message.includes('nginx')) {
    type = ErrorType.DEPLOY_ERROR
    severity = ErrorSeverity.HIGH
    suggestedStrategy = RecoveryStrategy.ROLLBACK
  }
  // 변환 관련 에러
  else if (message.includes('convert') || message.includes('import') || message.includes('export')) {
    type = ErrorType.CONVERSION_ERROR
    severity = ErrorSeverity.MEDIUM
    suggestedStrategy = RecoveryStrategy.SKIP
  }
  // 파일 관련 에러
  else if (message.includes('file') || message.includes('directory') || message.includes('permission')) {
    type = ErrorType.FILE_ERROR
    severity = ErrorSeverity.MEDIUM
    suggestedStrategy = RecoveryStrategy.RETRY
  }
  // 메모리 관련 에러
  else if (message.includes('memory') || message.includes('heap') || message.includes('out of memory')) {
    type = ErrorType.MEMORY_ERROR
    severity = ErrorSeverity.HIGH
    suggestedStrategy = RecoveryStrategy.RETRY
  }
  // 네트워크 관련 에러
  else if (message.includes('network') || message.includes('timeout') || message.includes('connection')) {
    type = ErrorType.NETWORK_ERROR
    severity = ErrorSeverity.MEDIUM
    suggestedStrategy = RecoveryStrategy.RETRY
  }
  // 권한 관련 에러
  else if (message.includes('permission') || message.includes('access') || message.includes('unauthorized')) {
    type = ErrorType.PERMISSION_ERROR
    severity = ErrorSeverity.CRITICAL
    recoverable = false
    suggestedStrategy = RecoveryStrategy.MANUAL
  }

  // 심각도 조정
  if (message.includes('critical') || message.includes('fatal')) {
    severity = ErrorSeverity.CRITICAL
    recoverable = false
    suggestedStrategy = RecoveryStrategy.ABORT
  }

  return {
    type,
    severity,
    message: error.message,
    context,
    timestamp: new Date().toISOString(),
    recoverable,
    suggestedStrategy,
    retryCount: 0,
    maxRetries: 3
  }
}

/**
 * 에러 복구 시도
 */
export async function attemptRecovery(
  errorInfo: ErrorInfo, 
  options: Partial<ErrorHandlerOptions> = {}
): Promise<RecoveryResult> {
  const finalOptions = { ...defaultOptions, ...options }
  
  logStep('RECOVERY', `에러 복구 시도 중... (${errorInfo.type})`)

  try {
    switch (errorInfo.suggestedStrategy) {
      case RecoveryStrategy.RETRY:
        return await handleRetryStrategy(errorInfo, finalOptions)
      
      case RecoveryStrategy.ROLLBACK:
        return await handleRollbackStrategy(errorInfo, finalOptions)
      
      case RecoveryStrategy.SKIP:
        return await handleSkipStrategy(errorInfo, finalOptions)
      
      case RecoveryStrategy.ABORT:
        return await handleAbortStrategy(errorInfo, finalOptions)
      
      case RecoveryStrategy.MANUAL:
        return await handleManualStrategy(errorInfo, finalOptions)
      
      default:
        return {
          success: false,
          strategy: RecoveryStrategy.ABORT,
          message: '알 수 없는 복구 전략'
        }
    }
  } catch (recoveryError) {
    logError(`복구 시도 실패: ${(recoveryError as Error).message}`)
    return {
      success: false,
      strategy: RecoveryStrategy.ABORT,
      message: `복구 실패: ${(recoveryError as Error).message}`
    }
  }
}

/**
 * 재시도 전략 처리
 */
async function handleRetryStrategy(
  errorInfo: ErrorInfo, 
  options: ErrorHandlerOptions
): Promise<RecoveryResult> {
  if (errorInfo.retryCount && errorInfo.retryCount >= options.maxRetries) {
    return {
      success: false,
      strategy: RecoveryStrategy.RETRY,
      message: '최대 재시도 횟수 초과'
    }
  }

  logInfo(`재시도 대기 중... (${options.retryDelay}ms)`)
  await new Promise(resolve => setTimeout(resolve, options.retryDelay))

  return {
    success: true,
    strategy: RecoveryStrategy.RETRY,
    message: '재시도 준비 완료',
    nextAction: '원래 작업을 다시 시도하세요'
  }
}

/**
 * 롤백 전략 처리
 */
async function handleRollbackStrategy(
  errorInfo: ErrorInfo, 
  options: ErrorHandlerOptions
): Promise<RecoveryResult> {
  try {
    // 백업 파일 찾기
    const backupDir = path.join(process.cwd(), 'backups')
    if (!fileExists(backupDir)) {
      return {
        success: false,
        strategy: RecoveryStrategy.ROLLBACK,
        message: '백업 디렉토리를 찾을 수 없습니다'
      }
    }

    // 최신 백업 찾기
    const backups = fs.readdirSync(backupDir)
      .filter(file => file.endsWith('.backup'))
      .sort()
      .reverse()

    if (backups.length === 0) {
      return {
        success: false,
        strategy: RecoveryStrategy.ROLLBACK,
        message: '복원할 백업이 없습니다'
      }
    }

    const latestBackup = path.join(backupDir, backups[0])
    logInfo(`백업에서 복원 중: ${latestBackup}`)

    // 복원 실행
    const restoreSuccess = await restoreFromBackup(latestBackup, process.cwd())
    
    if (restoreSuccess) {
      return {
        success: true,
        strategy: RecoveryStrategy.ROLLBACK,
        message: '백업에서 성공적으로 복원되었습니다'
      }
    } else {
      return {
        success: false,
        strategy: RecoveryStrategy.ROLLBACK,
        message: '백업 복원에 실패했습니다'
      }
    }
  } catch (error) {
    return {
      success: false,
      strategy: RecoveryStrategy.ROLLBACK,
      message: `롤백 실패: ${(error as Error).message}`
    }
  }
}

/**
 * 건너뛰기 전략 처리
 */
async function handleSkipStrategy(
  errorInfo: ErrorInfo, 
  options: ErrorHandlerOptions
): Promise<RecoveryResult> {
  logWarning(`작업을 건너뜁니다: ${errorInfo.message}`)
  
  return {
    success: true,
    strategy: RecoveryStrategy.SKIP,
    message: '작업이 건너뛰어졌습니다',
    nextAction: '다음 단계로 진행하세요'
  }
}

/**
 * 중단 전략 처리
 */
async function handleAbortStrategy(
  errorInfo: ErrorInfo, 
  options: ErrorHandlerOptions
): Promise<RecoveryResult> {
  logError(`작업을 중단합니다: ${errorInfo.message}`)
  
  return {
    success: false,
    strategy: RecoveryStrategy.ABORT,
    message: '작업이 중단되었습니다',
    nextAction: '수동으로 문제를 해결한 후 다시 시도하세요'
  }
}

/**
 * 수동 처리 전략
 */
async function handleManualStrategy(
  errorInfo: ErrorInfo, 
  options: ErrorHandlerOptions
): Promise<RecoveryResult> {
  logError(`수동 개입이 필요합니다: ${errorInfo.message}`)
  
  return {
    success: false,
    strategy: RecoveryStrategy.MANUAL,
    message: '수동 개입이 필요합니다',
    nextAction: '관리자에게 문의하거나 수동으로 문제를 해결하세요'
  }
}

/**
 * 통합 에러 처리기
 */
export async function handleError(
  error: Error,
  context: any = {},
  options: Partial<ErrorHandlerOptions> = {}
): Promise<{ handled: boolean; recovered: boolean; errorInfo: ErrorInfo; recoveryResult?: RecoveryResult }> {
  const finalOptions = { ...defaultOptions, ...options }
  
  // 에러 분석
  const errorInfo = analyzeError(error, context)
  
  // 에러 로깅
  if (finalOptions.logErrors) {
    logError(`에러 발생: ${errorInfo.type} - ${errorInfo.message}`)
    if (errorInfo.context) {
      logInfo(`컨텍스트: ${JSON.stringify(errorInfo.context, null, 2)}`)
    }
  }

  // 복구 불가능한 에러
  if (!errorInfo.recoverable) {
    return {
      handled: true,
      recovered: false,
      errorInfo
    }
  }

  // 자동 복구 시도
  if (finalOptions.autoRecovery) {
    const recoveryResult = await attemptRecovery(errorInfo, finalOptions)
    
    if (recoveryResult.success) {
      logSuccess(`에러 복구 성공: ${recoveryResult.message}`)
      return {
        handled: true,
        recovered: true,
        errorInfo,
        recoveryResult
      }
    } else {
      logError(`에러 복구 실패: ${recoveryResult.message}`)
      return {
        handled: true,
        recovered: false,
        errorInfo,
        recoveryResult
      }
    }
  }

  return {
    handled: true,
    recovered: false,
    errorInfo
  }
}

/**
 * 에러 통계 생성
 */
export function generateErrorStats(errors: ErrorInfo[]): {
  total: number
  byType: Record<ErrorType, number>
  bySeverity: Record<ErrorSeverity, number>
  recoverable: number
  critical: number
} {
  const stats = {
    total: errors.length,
    byType: {} as Record<ErrorType, number>,
    bySeverity: {} as Record<ErrorSeverity, number>,
    recoverable: 0,
    critical: 0
  }

  // 초기화
  Object.values(ErrorType).forEach(type => {
    stats.byType[type] = 0
  })
  Object.values(ErrorSeverity).forEach(severity => {
    stats.bySeverity[severity] = 0
  })

  // 통계 계산
  errors.forEach(error => {
    stats.byType[error.type]++
    stats.bySeverity[error.severity]++
    
    if (error.recoverable) {
      stats.recoverable++
    }
    
    if (error.severity === ErrorSeverity.CRITICAL) {
      stats.critical++
    }
  })

  return stats
}

/**
 * 에러 리포트 생성
 */
export function generateErrorReport(errors: ErrorInfo[]): string {
  const stats = generateErrorStats(errors)
  
  let report = '\n📊 에러 리포트\n'
  report += '='.repeat(50) + '\n'
  report += `총 에러 수: ${stats.total}\n`
  report += `복구 가능: ${stats.recoverable}\n`
  report += `치명적: ${stats.critical}\n\n`

  report += '에러 타입별 분포:\n'
  Object.entries(stats.byType).forEach(([type, count]) => {
    if (count > 0) {
      report += `- ${type}: ${count}개\n`
    }
  })

  report += '\n심각도별 분포:\n'
  Object.entries(stats.bySeverity).forEach(([severity, count]) => {
    if (count > 0) {
      report += `- ${severity}: ${count}개\n`
    }
  })

  return report
}
