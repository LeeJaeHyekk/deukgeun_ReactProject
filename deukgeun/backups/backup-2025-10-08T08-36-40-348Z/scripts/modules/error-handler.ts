/**
 * 에러 처리 모듈
 * 빌드 과정에서 발생하는 에러 처리 및 복구
 */

import * as fs from 'fs'
import * as path from 'path'
import { logError, logWarning, logSuccess, logInfo } from './logger'
import { FileUtils } from './file-utils'

/**
 * 에러 타입 정의
 */
export const ErrorTypes = {
  BUILD_FAILED: 'BUILD_FAILED',
  CONVERSION_FAILED: 'CONVERSION_FAILED',
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  FILE_NOT_FOUND: 'FILE_NOT_FOUND',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  TIMEOUT: 'TIMEOUT',
  MEMORY_ERROR: 'MEMORY_ERROR',
  UNKNOWN: 'UNKNOWN'
} as const

/**
 * 에러 심각도 정의
 */
export const ErrorSeverity = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL'
} as const

type ErrorType = typeof ErrorTypes[keyof typeof ErrorTypes]
type ErrorSeverityLevel = typeof ErrorSeverity[keyof typeof ErrorSeverity]

interface ErrorInfo {
  timestamp: string
  message: string
  stack?: string
  type: ErrorType
  severity: ErrorSeverityLevel
  context: any
  recoverable: boolean
  suggestions: string[]
}

interface RecoveryResult {
  success: boolean
  action?: string
  error?: string
  reason?: string
  newTimeout?: number
}

interface ErrorHandlerOptions {
  autoRecovery: boolean
  maxRetries: number
  logErrors: boolean
  createBackup: boolean
}

/**
 * 에러 처리기 클래스
 */
export class ErrorHandler {
  private projectRoot: string
  private fileUtils: FileUtils
  private options: ErrorHandlerOptions
  private errorLog: ErrorInfo[] = []
  private recoveryActions: any[] = []

  constructor(projectRoot: string, options: Partial<ErrorHandlerOptions> = {}) {
    this.projectRoot = projectRoot
    this.fileUtils = new FileUtils(projectRoot)
    this.options = {
      autoRecovery: true,
      maxRetries: 3,
      logErrors: true,
      createBackup: true,
      ...options
    }
  }

  /**
   * 에러 처리
   */
  handleError(error: Error, context: any = {}): { handled: boolean; recovered: boolean; errorInfo: ErrorInfo } {
    const errorInfo = this.analyzeError(error, context)
    
    // 에러 로깅
    if (this.options.logErrors) {
      this.logError(errorInfo)
    }
    
    // 에러 로그에 추가
    this.errorLog.push(errorInfo)
    
    // 자동 복구 시도
    if (this.options.autoRecovery) {
      const recoveryResult = this.attemptRecovery(errorInfo)
      if (recoveryResult.success) {
        logSuccess(`에러 복구 성공: ${errorInfo.type}`)
        return { handled: true, recovered: true, errorInfo }
      }
    }
    
    return { handled: true, recovered: false, errorInfo }
  }

  /**
   * 에러 분석
   */
  private analyzeError(error: Error, context: any): ErrorInfo {
    const errorInfo: ErrorInfo = {
      timestamp: new Date().toISOString(),
      message: error.message,
      stack: error.stack,
      type: this.determineErrorType(error),
      severity: this.determineSeverity(error),
      context,
      recoverable: this.isRecoverable(error),
      suggestions: this.getSuggestions(error)
    }
    
    return errorInfo
  }

  /**
   * 에러 타입 결정
   */
  private determineErrorType(error: Error): ErrorType {
    const message = error.message.toLowerCase()
    
    if (message.includes('build') || message.includes('compilation')) {
      return ErrorTypes.BUILD_FAILED
    } else if (message.includes('conversion') || message.includes('transform')) {
      return ErrorTypes.CONVERSION_FAILED
    } else if (message.includes('validation') || message.includes('verify')) {
      return ErrorTypes.VALIDATION_FAILED
    } else if (message.includes('enoent') || message.includes('not found')) {
      return ErrorTypes.FILE_NOT_FOUND
    } else if (message.includes('eacces') || message.includes('permission')) {
      return ErrorTypes.PERMISSION_DENIED
    } else if (message.includes('timeout')) {
      return ErrorTypes.TIMEOUT
    } else if (message.includes('memory') || message.includes('heap')) {
      return ErrorTypes.MEMORY_ERROR
    } else {
      return ErrorTypes.UNKNOWN
    }
  }

  /**
   * 에러 심각도 결정
   */
  private determineSeverity(error: Error): ErrorSeverityLevel {
    const type = this.determineErrorType(error)
    
    switch (type) {
      case ErrorTypes.BUILD_FAILED:
      case ErrorTypes.CONVERSION_FAILED:
        return ErrorSeverity.HIGH
      case ErrorTypes.VALIDATION_FAILED:
        return ErrorSeverity.MEDIUM
      case ErrorTypes.FILE_NOT_FOUND:
      case ErrorTypes.PERMISSION_DENIED:
        return ErrorSeverity.HIGH
      case ErrorTypes.TIMEOUT:
        return ErrorSeverity.MEDIUM
      case ErrorTypes.MEMORY_ERROR:
        return ErrorSeverity.CRITICAL
      default:
        return ErrorSeverity.MEDIUM
    }
  }

  /**
   * 복구 가능성 확인
   */
  private isRecoverable(error: Error): boolean {
    const type = this.determineErrorType(error)
    
    switch (type) {
      case ErrorTypes.BUILD_FAILED:
      case ErrorTypes.CONVERSION_FAILED:
      case ErrorTypes.VALIDATION_FAILED:
      case ErrorTypes.TIMEOUT:
        return true
      case ErrorTypes.FILE_NOT_FOUND:
      case ErrorTypes.PERMISSION_DENIED:
        return false
      case ErrorTypes.MEMORY_ERROR:
        return true
      default:
        return true
    }
  }

  /**
   * 복구 시도
   */
  private attemptRecovery(errorInfo: ErrorInfo): RecoveryResult {
    const { type, context } = errorInfo
    
    try {
      switch (type) {
        case ErrorTypes.BUILD_FAILED:
          return this.recoverFromBuildFailure(context)
        case ErrorTypes.CONVERSION_FAILED:
          return this.recoverFromConversionFailure(context)
        case ErrorTypes.VALIDATION_FAILED:
          return this.recoverFromValidationFailure(context)
        case ErrorTypes.TIMEOUT:
          return this.recoverFromTimeout(context)
        case ErrorTypes.MEMORY_ERROR:
          return this.recoverFromMemoryError(context)
        default:
          return this.recoverGeneric(errorInfo)
      }
    } catch (recoveryError) {
      logError(`복구 시도 실패: ${(recoveryError as Error).message}`)
      return { success: false, error: (recoveryError as Error).message }
    }
  }

  /**
   * 빌드 실패 복구
   */
  private recoverFromBuildFailure(context: any): RecoveryResult {
    logInfo('빌드 실패 복구 시도 중...')
    
    try {
      // 1. node_modules 재설치
      if (context.phase === 'dependencies') {
        this.fileUtils.remove(path.join(this.projectRoot, 'node_modules'))
        this.fileUtils.remove(path.join(this.projectRoot, 'package-lock.json'))
        logInfo('node_modules 정리 완료')
        return { success: true, action: 'clean_dependencies' }
      }
      
      // 2. 캐시 정리
      if (context.phase === 'build') {
        this.cleanBuildCache()
        logInfo('빌드 캐시 정리 완료')
        return { success: true, action: 'clean_cache' }
      }
      
      return { success: false, reason: 'no_recovery_action' }
    } catch (error) {
      return { success: false, error: (error as Error).message }
    }
  }

  /**
   * 변환 실패 복구
   */
  private recoverFromConversionFailure(context: any): RecoveryResult {
    logInfo('변환 실패 복구 시도 중...')
    
    try {
      // 백업에서 복원
      if (context.backupPath && this.fileUtils.exists(context.backupPath)) {
        this.fileUtils.restoreFromBackup(context.backupPath, context.originalPath)
        logInfo('백업에서 복원 완료')
        return { success: true, action: 'restore_from_backup' }
      }
      
      return { success: false, reason: 'no_backup_available' }
    } catch (error) {
      return { success: false, error: (error as Error).message }
    }
  }

  /**
   * 검증 실패 복구
   */
  private recoverFromValidationFailure(context: any): RecoveryResult {
    logInfo('검증 실패 복구 시도 중...')
    
    try {
      // 재빌드 시도
      if (context.phase === 'validation') {
        logInfo('재빌드 시도...')
        return { success: true, action: 'rebuild' }
      }
      
      return { success: false, reason: 'no_recovery_action' }
    } catch (error) {
      return { success: false, error: (error as Error).message }
    }
  }

  /**
   * 타임아웃 복구
   */
  private recoverFromTimeout(context: any): RecoveryResult {
    logInfo('타임아웃 복구 시도 중...')
    
    try {
      // 타임아웃 시간 증가
      if (context.timeout) {
        const newTimeout = context.timeout * 1.5
        logInfo(`타임아웃 시간 증가: ${newTimeout}ms`)
        return { success: true, action: 'increase_timeout', newTimeout }
      }
      
      return { success: false, reason: 'no_timeout_context' }
    } catch (error) {
      return { success: false, error: (error as Error).message }
    }
  }

  /**
   * 메모리 에러 복구
   */
  private recoverFromMemoryError(context: any): RecoveryResult {
    logInfo('메모리 에러 복구 시도 중...')
    
    try {
      // 가비지 컬렉션 강제 실행
      if (global.gc) {
        global.gc()
        logInfo('가비지 컬렉션 실행')
      }
      
      // 메모리 사용량 모니터링
      const memUsage = process.memoryUsage()
      logInfo(`메모리 사용량: ${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`)
      
      return { success: true, action: 'force_gc' }
    } catch (error) {
      return { success: false, error: (error as Error).message }
    }
  }

  /**
   * 일반적인 복구
   */
  private recoverGeneric(errorInfo: ErrorInfo): RecoveryResult {
    logInfo('일반적인 복구 시도 중...')
    
    try {
      // 임시 파일 정리
      this.cleanTempFiles()
      logInfo('임시 파일 정리 완료')
      
      return { success: true, action: 'clean_temp' }
    } catch (error) {
      return { success: false, error: (error as Error).message }
    }
  }

  /**
   * 빌드 캐시 정리
   */
  private cleanBuildCache(): void {
    const cacheDirs = [
      '.next',
      '.nuxt',
      'dist',
      'build',
      'node_modules/.cache'
    ]
    
    for (const cacheDir of cacheDirs) {
      const fullPath = path.join(this.projectRoot, cacheDir)
      if (this.fileUtils.exists(fullPath)) {
        this.fileUtils.remove(fullPath, { recursive: true, force: true })
      }
    }
  }

  /**
   * 임시 파일 정리
   */
  private cleanTempFiles(): void {
    const tempDirs = [
      '.temp-conversion',
      '.conversion-cache',
      '.build-safety'
    ]
    
    for (const tempDir of tempDirs) {
      const fullPath = path.join(this.projectRoot, tempDir)
      if (this.fileUtils.exists(fullPath)) {
        this.fileUtils.remove(fullPath, { recursive: true, force: true })
      }
    }
  }

  /**
   * 에러 로깅
   */
  private logError(errorInfo: ErrorInfo): void {
    const { type, severity, message, context } = errorInfo
    
    logError(`[${type}] ${message}`)
    logError(`심각도: ${severity}`)
    
    if (context.phase) {
      logError(`단계: ${context.phase}`)
    }
    
    if (context.file) {
      logError(`파일: ${context.file}`)
    }
  }

  /**
   * 제안사항 생성
   */
  private getSuggestions(error: Error): string[] {
    const type = this.determineErrorType(error)
    const suggestions: string[] = []
    
    switch (type) {
      case ErrorTypes.BUILD_FAILED:
        suggestions.push('의존성을 다시 설치해보세요: npm install')
        suggestions.push('빌드 캐시를 정리해보세요')
        break
      case ErrorTypes.CONVERSION_FAILED:
        suggestions.push('원본 파일을 확인해보세요')
        suggestions.push('백업에서 복원을 시도해보세요')
        break
      case ErrorTypes.VALIDATION_FAILED:
        suggestions.push('빌드 결과를 다시 확인해보세요')
        break
      case ErrorTypes.FILE_NOT_FOUND:
        suggestions.push('필요한 파일이 존재하는지 확인해보세요')
        break
      case ErrorTypes.PERMISSION_DENIED:
        suggestions.push('파일 권한을 확인해보세요')
        break
      case ErrorTypes.TIMEOUT:
        suggestions.push('타임아웃 시간을 늘려보세요')
        break
      case ErrorTypes.MEMORY_ERROR:
        suggestions.push('메모리 사용량을 줄여보세요')
        break
    }
    
    return suggestions
  }

  /**
   * 에러 통계 조회
   */
  getErrorStats(): {
    total: number
    byType: Record<string, number>
    bySeverity: Record<string, number>
    recent: ErrorInfo[]
  } {
    const total = this.errorLog.length
    const byType: Record<string, number> = {}
    const bySeverity: Record<string, number> = {}
    
    this.errorLog.forEach(error => {
      byType[error.type] = (byType[error.type] || 0) + 1
      bySeverity[error.severity] = (bySeverity[error.severity] || 0) + 1
    })
    
    return {
      total,
      byType,
      bySeverity,
      recent: this.errorLog.slice(-10)
    }
  }

  /**
   * 에러 로그 초기화
   */
  clearErrorLog(): void {
    this.errorLog = []
    logInfo('에러 로그가 초기화되었습니다.')
  }

  /**
   * 에러 리포트 생성
   */
  generateErrorReport(): void {
    const stats = this.getErrorStats()
    
    logInfo('\n📊 에러 리포트:')
    logInfo(`총 에러 수: ${stats.total}`)
    
    if (Object.keys(stats.byType).length > 0) {
      logInfo('\n에러 타입별:')
      Object.entries(stats.byType).forEach(([type, count]) => {
        logInfo(`- ${type}: ${count}개`)
      })
    }
    
    if (Object.keys(stats.bySeverity).length > 0) {
      logInfo('\n심각도별:')
      Object.entries(stats.bySeverity).forEach(([severity, count]) => {
        logInfo(`- ${severity}: ${count}개`)
      })
    }
    
    if (stats.recent.length > 0) {
      logInfo('\n최근 에러:')
      stats.recent.forEach(error => {
        logError(`- [${error.type}] ${error.message}`)
      })
    }
  }
}
