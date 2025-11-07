// ============================================================================
// 백엔드 헬스체크 및 자동 재시작 모니터링 (개선 버전)
// ============================================================================

import { logger } from '@frontend/shared/utils/logger'
import { config } from '@frontend/shared/config'
import axios, { AxiosError } from 'axios'

// ============================================================================
// 타입 정의
// ============================================================================

interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy' | 'unknown'
  timestamp: number
  responseTime?: number
  error?: string
  details?: any
}

interface HealthMonitorConfig {
  checkInterval: number // 헬스체크 간격 (ms)
  unhealthyThreshold: number // unhealthy 판정을 위한 연속 실패 횟수
  degradedThreshold: number // degraded 판정을 위한 연속 실패 횟수
  timeout: number // 요청 타임아웃 (ms)
  retryDelay: number // 재시도 지연 시간 (ms)
  maxRetries: number // 최대 재시도 횟수
  maxWaitTime?: number // 최대 대기 시간 (ms)
  maxRecoveryAttempts?: number // 최대 복구 시도 횟수
}

// ============================================================================
// 기본 설정
// ============================================================================

const DEFAULT_CONFIG: HealthMonitorConfig = {
  checkInterval: 30000, // 30초마다 체크
  unhealthyThreshold: 3, // 3회 연속 실패 시 unhealthy
  degradedThreshold: 2, // 2회 연속 실패 시 degraded
  timeout: 5000, // 5초 타임아웃
  retryDelay: 5000, // 5초 후 재시도
  maxRetries: 3, // 최대 3회 재시도
  maxWaitTime: 60000, // 최대 60초 대기
  maxRecoveryAttempts: 3, // 최대 3회 복구 시도
}

// ============================================================================
// 헬스체크 상태 관리
// ============================================================================

class BackendHealthMonitor {
  private config: HealthMonitorConfig
  private checkIntervalId: NodeJS.Timeout | null = null
  private consecutiveFailures = 0
  private lastHealthStatus: HealthCheckResult | null = null
  private isChecking = false
  private listeners: Array<(result: HealthCheckResult) => void> = []
  private recoveryAttempts = 0 // 복구 시도 횟수
  private lastRecoveryAttempt = 0 // 마지막 복구 시도 시간
  private isRecovering = false // 복구 중 플래그

  constructor(config?: Partial<HealthMonitorConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config }
  }

  /**
   * 헬스체크 상태 변경 리스너 등록
   */
  onHealthChange(listener: (result: HealthCheckResult) => void): () => void {
    this.listeners.push(listener)
    return () => {
      const index = this.listeners.indexOf(listener)
      if (index > -1) {
        this.listeners.splice(index, 1)
      }
    }
  }

  /**
   * 헬스체크 실행
   */
  async checkHealth(): Promise<HealthCheckResult> {
    if (this.isChecking) {
      return this.lastHealthStatus || {
        status: 'unknown',
        timestamp: Date.now(),
        error: 'Health check already in progress'
      }
    }

    this.isChecking = true
    const startTime = Date.now()

    try {
      const healthUrl = `${config.api.baseURL}/api/health`
      
      const response = await axios.get(healthUrl, {
        timeout: this.config.timeout,
        validateStatus: (status) => status < 500, // 5xx 에러만 실패로 처리
      })

      const responseTime = Date.now() - startTime

      let status: HealthCheckResult['status'] = 'healthy'
      
      if (response.status >= 500) {
        status = 'unhealthy'
        this.consecutiveFailures++
      } else if (response.status >= 400) {
        status = 'degraded'
        this.consecutiveFailures++
      } else {
        // 성공 시 연속 실패 카운터 리셋
        this.consecutiveFailures = 0
        this.recoveryAttempts = 0 // 복구 성공 시 카운터 리셋
      }

      // 연속 실패 횟수에 따른 상태 조정
      if (this.consecutiveFailures >= this.config.unhealthyThreshold) {
        status = 'unhealthy'
      } else if (this.consecutiveFailures >= this.config.degradedThreshold) {
        status = 'degraded'
      }

      const result: HealthCheckResult = {
        status,
        timestamp: Date.now(),
        responseTime,
        details: response.data
      }

      this.lastHealthStatus = result
      this.notifyListeners(result)

      logger.debug('BACKEND_HEALTH', '헬스체크 완료', {
        status,
        responseTime,
        consecutiveFailures: this.consecutiveFailures
      })

      return result

    } catch (error) {
      const responseTime = Date.now() - startTime
      this.consecutiveFailures++

      let status: HealthCheckResult['status'] = 'unhealthy'
      
      // 연속 실패 횟수에 따른 상태 조정
      if (this.consecutiveFailures >= this.config.unhealthyThreshold) {
        status = 'unhealthy'
      } else if (this.consecutiveFailures >= this.config.degradedThreshold) {
        status = 'degraded'
      }

      const axiosError = error as AxiosError
      const errorMessage = axiosError.message || 'Unknown error'
      const errorCode = axiosError.code || 'UNKNOWN'

      const result: HealthCheckResult = {
        status,
        timestamp: Date.now(),
        responseTime,
        error: `${errorCode}: ${errorMessage}`
      }

      this.lastHealthStatus = result
      this.notifyListeners(result)

      logger.warn('BACKEND_HEALTH', '헬스체크 실패', {
        status,
        error: errorMessage,
        code: errorCode,
        consecutiveFailures: this.consecutiveFailures
      })

      return result

    } finally {
      this.isChecking = false
    }
  }

  /**
   * 리스너에게 상태 변경 알림
   */
  private notifyListeners(result: HealthCheckResult): void {
    this.listeners.forEach(listener => {
      try {
        listener(result)
      } catch (error) {
        logger.error('BACKEND_HEALTH', '리스너 실행 중 오류', error)
      }
    })
  }

  /**
   * 주기적 헬스체크 시작
   */
  start(): void {
    if (this.checkIntervalId) {
      logger.warn('BACKEND_HEALTH', '헬스체크가 이미 실행 중입니다.')
      return
    }

    logger.info('BACKEND_HEALTH', '헬스체크 모니터링 시작', {
      interval: this.config.checkInterval,
      unhealthyThreshold: this.config.unhealthyThreshold,
      degradedThreshold: this.config.degradedThreshold
    })

    // 즉시 한 번 체크
    this.checkHealth()

    // 주기적 체크 시작
    this.checkIntervalId = setInterval(() => {
      this.checkHealth()
    }, this.config.checkInterval)
  }

  /**
   * 주기적 헬스체크 중지
   */
  stop(): void {
    if (this.checkIntervalId) {
      clearInterval(this.checkIntervalId)
      this.checkIntervalId = null
      this.consecutiveFailures = 0
      this.recoveryAttempts = 0
      this.isRecovering = false
      logger.info('BACKEND_HEALTH', '헬스체크 모니터링 중지')
    }
  }

  /**
   * 현재 헬스 상태 가져오기
   */
  getLastHealthStatus(): HealthCheckResult | null {
    return this.lastHealthStatus
  }

  /**
   * 백엔드 재시작 시도 (PM2 API 사용)
   */
  async restartBackend(): Promise<boolean> {
    // 복구 시도 횟수 제한
    const maxAttempts = this.config.maxRecoveryAttempts || 3
    const now = Date.now()
    const minIntervalBetweenAttempts = 60000 // 1분 간격

    // 최근 복구 시도가 너무 가까우면 스킵
    if (now - this.lastRecoveryAttempt < minIntervalBetweenAttempts) {
      logger.warn('BACKEND_HEALTH', '복구 시도 간격이 너무 짧음, 스킵', {
        lastAttempt: this.lastRecoveryAttempt,
        now,
        interval: now - this.lastRecoveryAttempt
      })
      return false
    }

    // 최대 복구 시도 횟수 초과
    if (this.recoveryAttempts >= maxAttempts) {
      logger.error('BACKEND_HEALTH', '최대 복구 시도 횟수 초과', {
        attempts: this.recoveryAttempts,
        maxAttempts
      })
      return false
    }

    // 이미 복구 중이면 스킵
    if (this.isRecovering) {
      logger.warn('BACKEND_HEALTH', '이미 복구 시도 중, 스킵')
      return false
    }

    this.isRecovering = true
    this.recoveryAttempts++
    this.lastRecoveryAttempt = now

    try {
      logger.info('BACKEND_HEALTH', '백엔드 재시작 시도', {
        attempt: this.recoveryAttempts,
        maxAttempts
      })

      // PM2 API를 통한 재시작 (백엔드에 재시작 엔드포인트가 있는 경우)
      const restartUrl = `${config.api.baseURL}/api/admin/restart`
      
      try {
        const response = await axios.post(restartUrl, {}, {
          timeout: 10000,
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken') || ''}`
          }
        })

        if (response.status === 200 || response.status === 202) {
          logger.info('BACKEND_HEALTH', '백엔드 재시작 요청 성공')
          
          // 재시작 후 헬스체크 대기 (최대 대기 시간 제한)
          const maxWaitTime = this.config.maxWaitTime || 60000
          const isReady = await this.waitForBackendReady(maxWaitTime)
          
          if (isReady) {
            this.recoveryAttempts = 0 // 성공 시 카운터 리셋
            this.isRecovering = false
            return true
          } else {
            logger.warn('BACKEND_HEALTH', '백엔드 복구 대기 시간 초과')
            this.isRecovering = false
            return false
          }
        }
      } catch (error) {
        logger.warn('BACKEND_HEALTH', '백엔드 재시작 API 호출 실패', error)
      }

      // API를 통한 재시작이 실패한 경우, 페이지 새로고침으로 대체 (한 번만)
      if (this.recoveryAttempts === 1) {
        logger.warn('BACKEND_HEALTH', '백엔드 재시작 API 사용 불가, 페이지 새로고침으로 대체')
        // 페이지 새로고침은 한 번만 실행
        setTimeout(() => {
          window.location.reload()
        }, 2000)
      }

      this.isRecovering = false
      return false

    } catch (error) {
      logger.error('BACKEND_HEALTH', '백엔드 재시작 실패', error)
      this.isRecovering = false
      return false
    }
  }

  /**
   * 백엔드가 준비될 때까지 대기 (무한 루프 방지)
   */
  private async waitForBackendReady(maxWaitTime: number = 60000): Promise<boolean> {
    const startTime = Date.now()
    const checkInterval = 2000 // 2초마다 체크
    const maxChecks = Math.floor(maxWaitTime / checkInterval) // 최대 체크 횟수
    let checkCount = 0

    logger.info('BACKEND_HEALTH', '백엔드 준비 대기 시작', {
      maxWaitTime,
      maxChecks,
      checkInterval
    })

    while (checkCount < maxChecks) {
      const elapsed = Date.now() - startTime
      
      if (elapsed >= maxWaitTime) {
        logger.warn('BACKEND_HEALTH', '백엔드 복구 대기 시간 초과', {
          elapsed,
          maxWaitTime,
          checkCount
        })
        return false
      }

      try {
        const result = await this.checkHealth()
        
        if (result.status === 'healthy') {
          logger.info('BACKEND_HEALTH', '백엔드가 정상 상태로 복구되었습니다', {
            checkCount,
            elapsed
          })
          return true
        }

        checkCount++
        await new Promise(resolve => setTimeout(resolve, checkInterval))
      } catch (error) {
        logger.warn('BACKEND_HEALTH', '헬스체크 중 오류', error)
        checkCount++
        await new Promise(resolve => setTimeout(resolve, checkInterval))
      }
    }

    logger.warn('BACKEND_HEALTH', '백엔드 복구 대기 최대 체크 횟수 초과', {
      checkCount,
      maxChecks
    })
    return false
  }

  /**
   * 백엔드 상태에 따른 자동 조치 (무한 루프 방지)
   */
  async handleUnhealthyBackend(): Promise<void> {
    const status = this.lastHealthStatus

    if (!status || status.status !== 'unhealthy') {
      return
    }

    // 복구 시도 횟수 제한 확인
    const maxAttempts = this.config.maxRecoveryAttempts || 3
    if (this.recoveryAttempts >= maxAttempts) {
      logger.error('BACKEND_HEALTH', '최대 복구 시도 횟수 초과, 자동 조치 중지', {
        attempts: this.recoveryAttempts,
        maxAttempts
      })
      this.showBackendErrorNotification()
      return
    }

    // 이미 복구 중이면 스킵
    if (this.isRecovering) {
      logger.debug('BACKEND_HEALTH', '이미 복구 시도 중, 스킵')
      return
    }

    logger.warn('BACKEND_HEALTH', '백엔드 unhealthy 상태 감지, 자동 조치 시작', {
      consecutiveFailures: this.consecutiveFailures,
      error: status.error,
      recoveryAttempts: this.recoveryAttempts
    })

    // 재시작 시도
    const restartSuccess = await this.restartBackend()

    if (!restartSuccess) {
      // 재시작 실패 시 사용자에게 알림
      this.showBackendErrorNotification()
    }
  }

  /**
   * 백엔드 오류 알림 표시
   */
  private showBackendErrorNotification(): void {
    // 전역 이벤트를 통해 UI에 알림
    const event = new CustomEvent('backend-unhealthy', {
      detail: {
        message: '백엔드 서버에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.',
        timestamp: Date.now(),
        recoveryAttempts: this.recoveryAttempts
      }
    })
    window.dispatchEvent(event)
  }

  /**
   * 복구 시도 횟수 리셋
   */
  resetRecoveryAttempts(): void {
    this.recoveryAttempts = 0
    this.lastRecoveryAttempt = 0
    this.isRecovering = false
    logger.info('BACKEND_HEALTH', '복구 시도 횟수 리셋')
  }
}

// ============================================================================
// 싱글톤 인스턴스
// ============================================================================

let healthMonitorInstance: BackendHealthMonitor | null = null

export function getBackendHealthMonitor(config?: Partial<HealthMonitorConfig>): BackendHealthMonitor {
  if (!healthMonitorInstance) {
    healthMonitorInstance = new BackendHealthMonitor(config)
  }
  return healthMonitorInstance
}

// ============================================================================
// 편의 함수
// ============================================================================

/**
 * 헬스체크 모니터링 시작
 */
export function startBackendHealthMonitoring(config?: Partial<HealthMonitorConfig>): BackendHealthMonitor {
  const monitor = getBackendHealthMonitor(config)
  monitor.start()
  return monitor
}

/**
 * 헬스체크 모니터링 중지
 */
export function stopBackendHealthMonitoring(): void {
  if (healthMonitorInstance) {
    healthMonitorInstance.stop()
  }
}

/**
 * 즉시 헬스체크 실행
 */
export async function checkBackendHealth(): Promise<HealthCheckResult> {
  const monitor = getBackendHealthMonitor()
  return monitor.checkHealth()
}

// ============================================================================
// 자동 조치 리스너 설정
// ============================================================================

/**
 * 백엔드 unhealthy 상태 감지 시 자동 조치 (무한 루프 방지)
 */
export function setupAutoRecovery(): void {
  const monitor = getBackendHealthMonitor()
  
  monitor.onHealthChange((result) => {
    if (result.status === 'unhealthy') {
      // unhealthy 상태 감지 시 자동 조치 (무한 루프 방지 로직 포함)
      monitor.handleUnhealthyBackend()
    } else if (result.status === 'healthy') {
      // healthy 상태로 복구되면 복구 시도 횟수 리셋
      monitor.resetRecoveryAttempts()
    }
  })
}

export type { HealthCheckResult, HealthMonitorConfig }
export default BackendHealthMonitor
