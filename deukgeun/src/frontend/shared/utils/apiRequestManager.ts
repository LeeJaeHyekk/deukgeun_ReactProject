import { logger } from './logger'

// ============================================================================
// API 요청 관리 유틸리티
// ============================================================================

interface RequestConfig {
  maxRetries: number
  baseDelay: number
  maxDelay: number
  backoffMultiplier: number
  retryCondition: (error: any) => boolean
}

interface RequestState {
  isRequesting: boolean
  lastRequestTime: number
  retryCount: number
  cooldownUntil: number
}

class ApiRequestManager {
  private requestStates = new Map<string, RequestState>()
  private defaultConfig: RequestConfig = {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 30000,
    backoffMultiplier: 2,
    retryCondition: (error) => {
      // 429, 500, 502, 503, 504 에러에 대해서만 재시도
      const status = error?.response?.status
      return status === 429 || status === 500 || status === 502 || status === 503 || status === 504
    }
  }

  // 요청 상태 초기화
  private getRequestState(key: string): RequestState {
    if (!this.requestStates.has(key)) {
      this.requestStates.set(key, {
        isRequesting: false,
        lastRequestTime: 0,
        retryCount: 0,
        cooldownUntil: 0
      })
    }
    return this.requestStates.get(key)!
  }

  // 요청 제한 확인
  canMakeRequest(key: string, cooldownMs: number = 1000): boolean {
    const state = this.getRequestState(key)
    const now = Date.now()
    
    // 쿨다운 예외 엔드포인트 확인
    const cooldownExempt = ['/api/stats/user', '/api/auth/me']
    const isExempt = cooldownExempt.some(endpoint => key.includes(endpoint))
    
    if (isExempt) {
      logger.debug('API_REQUEST_MANAGER', '쿨다운 예외 엔드포인트', { key })
      return true
    }
    
    // 쿨다운 확인 (cooldownMs와 cooldownUntil 중 더 큰 값 사용)
    // 단, cooldownUntil이 0이면 lastRequestTime + cooldownMs만 사용
    const baseCooldownUntil = state.lastRequestTime > 0 
      ? state.lastRequestTime + cooldownMs 
      : 0
    const effectiveCooldownUntil = state.cooldownUntil > 0
      ? Math.max(state.cooldownUntil, baseCooldownUntil)
      : baseCooldownUntil
    
    // 이미 요청 중이거나 쿨다운 중인 경우
    if (state.isRequesting || (effectiveCooldownUntil > 0 && now < effectiveCooldownUntil)) {
      const remainingCooldown = effectiveCooldownUntil > now ? effectiveCooldownUntil - now : 0
      logger.debug('API_REQUEST_MANAGER', '요청 제한됨', {
        key,
        isRequesting: state.isRequesting,
        cooldownUntil: effectiveCooldownUntil,
        remainingCooldown: remainingCooldown > 0 ? Math.ceil(remainingCooldown / 1000) : 0,
        now,
        reason: state.isRequesting ? '이미 요청 중' : '쿨다운 중'
      })
      return false
    }
    
    logger.debug('API_REQUEST_MANAGER', '요청 허용', { key })
    return true
  }

  // 요청 시작
  startRequest(key: string): void {
    const state = this.getRequestState(key)
    state.isRequesting = true
    state.lastRequestTime = Date.now()
    console.log('🚀 [apiRequestManager] 요청 시작', { 
      key,
      timestamp: new Date().toISOString()
    })
    logger.debug('API_REQUEST_MANAGER', '요청 시작', { key })
  }

  // 요청 완료
  completeRequest(key: string, success: boolean = true): void {
    const state = this.getRequestState(key)
    state.isRequesting = false
    
    if (success) {
      state.retryCount = 0
      // 성공 시 쿨다운 초기화 (429 에러가 아닌 경우)
      // 429 에러로 인한 쿨다운은 유지
      if (state.cooldownUntil > 0) {
        const now = Date.now()
        // 쿨다운이 429 에러로 인한 것이 아닌 경우에만 초기화
        // 429 에러는 handleRequestFailure에서 더 긴 쿨다운을 설정하므로 유지
        // 단, 이미 지난 쿨다운은 초기화
        if (state.cooldownUntil < now + 1000) {
          // 쿨다운이 곧 끝나면 (1초 이내) 초기화
          state.cooldownUntil = 0
        }
      }
    }
    
    logger.debug('API_REQUEST_MANAGER', '요청 완료', { key, success, cooldownUntil: state.cooldownUntil })
  }

  // 요청 실패 처리
  handleRequestFailure(key: string, error: any, config?: Partial<RequestConfig>): Promise<boolean> {
    const state = this.getRequestState(key)
    const requestConfig = { ...this.defaultConfig, ...config }
    
    state.retryCount++
    
    // 재시도 조건 확인
    if (state.retryCount > requestConfig.maxRetries || !requestConfig.retryCondition(error)) {
      logger.warn('API_REQUEST_MANAGER', '재시도 포기', {
        key,
        retryCount: state.retryCount,
        maxRetries: requestConfig.maxRetries,
        error: error?.message
      })
      this.completeRequest(key, false)
      return Promise.resolve(false)
    }

    // 백오프 지연 계산
    const delay = Math.min(
      requestConfig.baseDelay * Math.pow(requestConfig.backoffMultiplier, state.retryCount - 1),
      requestConfig.maxDelay
    )

    // 429 에러인 경우 특별 처리 (더 긴 쿨다운 설정)
    if (error?.response?.status === 429) {
      const retryAfter = error.response.data?.retryAfter || 60
      // 429 에러는 retryAfter + 여유 시간(10초) 추가
      const cooldownTime = (retryAfter + 10) * 1000
      state.cooldownUntil = Date.now() + cooldownTime
      logger.warn('API_REQUEST_MANAGER', '429 에러 - 쿨다운 설정', {
        key,
        retryAfter,
        cooldownTime,
        cooldownUntil: state.cooldownUntil,
        cooldownUntilDate: new Date(state.cooldownUntil).toISOString()
      })
    } else {
      state.cooldownUntil = Date.now() + delay
    }

    logger.info('API_REQUEST_MANAGER', '재시도 예약', {
      key,
      retryCount: state.retryCount,
      delay,
      cooldownUntil: state.cooldownUntil
    })

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(true)
      }, delay)
    })
  }

  // 요청 상태 리셋
  resetRequest(key: string): void {
    this.requestStates.delete(key)
    logger.debug('API_REQUEST_MANAGER', '요청 상태 리셋', { key })
  }

  // 모든 요청 상태 리셋
  resetAllRequests(): void {
    this.requestStates.clear()
    logger.debug('API_REQUEST_MANAGER', '모든 요청 상태 리셋')
  }

  // 요청 상태 조회
  getRequestStatus(key: string): RequestState | null {
    return this.requestStates.get(key) || null
  }

  // 대기 중인 요청 수 조회
  getPendingRequestCount(): number {
    return Array.from(this.requestStates.values()).filter(state => state.isRequesting).length
  }
}

// 싱글톤 인스턴스
export const apiRequestManager = new ApiRequestManager()

// ============================================================================
// API 요청 래퍼 함수
// ============================================================================

interface RequestOptions {
  key: string
  cooldownMs?: number
  retryConfig?: Partial<RequestConfig>
  onSuccess?: (data: any) => void
  onError?: (error: any) => void
  onRetry?: (retryCount: number) => void
}

export async function withRequestManagement<T>(
  requestFn: () => Promise<T>,
  options: RequestOptions
): Promise<T | null> {
  const { key, cooldownMs = 1000, retryConfig, onSuccess, onError, onRetry } = options

  // 요청 제한 확인
  if (!apiRequestManager.canMakeRequest(key, cooldownMs)) {
    logger.debug('API_REQUEST_MANAGER', '요청 제한으로 인한 스킵', { key })
    return null
  }

  // 요청 시작
  apiRequestManager.startRequest(key)

  try {
    const result = await requestFn()
    
    // 성공 처리
    apiRequestManager.completeRequest(key, true)
    onSuccess?.(result)
    
    logger.debug('API_REQUEST_MANAGER', '요청 성공', { key })
    return result
  } catch (error: any) {
    logger.error('API_REQUEST_MANAGER', '요청 실패', { key, error: error instanceof Error ? error.message : String(error) })
    onError?.(error)

    // 429 에러인 경우 재시도하지 않고 즉시 실패 처리
    if (error?.response?.status === 429) {
      const retryAfter = error.response.data?.retryAfter || 60
      const state = apiRequestManager.getRequestStatus(key)
      if (state) {
        // 429 에러는 쿨다운을 더 길게 설정
        state.cooldownUntil = Date.now() + (retryAfter + 10) * 1000
        state.retryCount = 0 // 재시도 카운터 리셋 (자동 재연결에 맡김)
      }
      apiRequestManager.completeRequest(key, false)
      logger.warn('API_REQUEST_MANAGER', '429 에러 - 재시도 스킵', { key, retryAfter })
      return null
    }

    // 재시도 처리 (429 외의 에러)
    const shouldRetry = await apiRequestManager.handleRequestFailure(key, error, retryConfig)
    
    if (shouldRetry) {
      onRetry?.(apiRequestManager.getRequestStatus(key)?.retryCount || 0)
      logger.info('API_REQUEST_MANAGER', '재시도 예약됨', { key })
    }

    return null
  }
}

// ============================================================================
// 자동 재연결 관리자
// ============================================================================

class AutoReconnectManager {
  private reconnectTimers = new Map<string, NodeJS.Timeout>()
  private reconnectAttempts = new Map<string, number>()
  private maxReconnectAttempts = 5
  private baseReconnectDelay = 30000 // 30초로 증가 (rate limit 방지)

  // 자동 재연결 시작
  startAutoReconnect(key: string, reconnectFn: () => Promise<void>): void {
    // 이미 재연결 중인 경우 중복 방지
    if (this.reconnectTimers.has(key)) {
      logger.debug('AUTO_RECONNECT', '이미 재연결 타이머가 설정됨 - 스킵', { key })
      return
    }

    const attempts = this.reconnectAttempts.get(key) || 0
    
    if (attempts >= this.maxReconnectAttempts) {
      logger.warn('AUTO_RECONNECT', '최대 재연결 시도 횟수 초과', { key, attempts })
      return
    }

    // 백오프 지연: 30초, 60초, 120초, 240초, 480초
    const delay = this.baseReconnectDelay * Math.pow(2, attempts)
    const timer = setTimeout(async () => {
      try {
        logger.info('AUTO_RECONNECT', '재연결 시도', { key, attempt: attempts + 1 })
        
        // 타이머 실행 후 즉시 타이머 맵에서 제거 (중복 방지)
        this.reconnectTimers.delete(key)
        
        await reconnectFn()
        
        // 성공 시 카운터 리셋
        this.reconnectAttempts.delete(key)
        logger.info('AUTO_RECONNECT', '재연결 성공', { key })
        
        // 성공 후 다음 재연결도 설정 (주기적 새로고침) - 타이머가 없을 때만
        if (!this.reconnectTimers.has(key)) {
          this.startAutoReconnect(key, reconnectFn)
        }
      } catch (error) {
        logger.error('AUTO_RECONNECT', '재연결 실패', { key, error: error instanceof Error ? error.message : String(error) })
        this.reconnectAttempts.set(key, attempts + 1)
        
        // 실패 시 더 긴 지연 후 재시도 - 타이머가 없을 때만
        if (!this.reconnectTimers.has(key)) {
          const retryDelay = delay * 2 // 실패 시 지연 시간 2배
          setTimeout(() => {
            // 재시도 전에 다시 한 번 확인
            if (!this.reconnectTimers.has(key)) {
              this.startAutoReconnect(key, reconnectFn)
            }
          }, retryDelay)
        }
      }
    }, delay)

    this.reconnectTimers.set(key, timer)
    logger.info('AUTO_RECONNECT', '자동 재연결 타이머 설정', { key, delay, attempt: attempts + 1 })
  }

  // 자동 재연결 중지
  stopAutoReconnect(key: string): void {
    const timer = this.reconnectTimers.get(key)
    if (timer) {
      clearTimeout(timer)
      this.reconnectTimers.delete(key)
      // 재시도 카운터는 유지 (나중에 다시 시작할 때 이어서)
      logger.debug('AUTO_RECONNECT', '자동 재연결 타이머 정리', { key })
    }
  }
  
  // 재연결 상태 확인
  isReconnecting(key: string): boolean {
    return this.reconnectTimers.has(key)
  }
  
  // 재시도 카운터 리셋
  resetReconnectAttempts(key: string): void {
    this.reconnectAttempts.delete(key)
    logger.debug('AUTO_RECONNECT', '재시도 카운터 리셋', { key })
  }

  // 모든 자동 재연결 중지
  stopAllAutoReconnects(): void {
    this.reconnectTimers.forEach((timer, key) => {
      clearTimeout(timer)
      logger.debug('AUTO_RECONNECT', '자동 재연결 타이머 정리', { key })
    })
    this.reconnectTimers.clear()
    this.reconnectAttempts.clear()
  }
}

// 싱글톤 인스턴스
export const autoReconnectManager = new AutoReconnectManager()

// ============================================================================
// 상태 관리 안전장치
// ============================================================================

class StateSafetyManager {
  private loadingStates = new Map<string, boolean>()
  private errorStates = new Map<string, string | null>()
  private lastActivity = new Map<string, number>()
  private maxInactiveTime = 5 * 60 * 1000 // 5분

  // 로딩 상태 설정
  setLoading(key: string, loading: boolean): void {
    this.loadingStates.set(key, loading)
    if (loading) {
      this.lastActivity.set(key, Date.now())
    }
    logger.debug('STATE_SAFETY', '로딩 상태 설정', { key, loading })
  }

  // 에러 상태 설정
  setError(key: string, error: string | null): void {
    this.errorStates.set(key, error)
    logger.debug('STATE_SAFETY', '에러 상태 설정', { key, error })
  }

  // 상태 조회
  getLoading(key: string): boolean {
    return this.loadingStates.get(key) || false
  }

  getError(key: string): string | null {
    return this.errorStates.get(key) || null
  }

  // 비활성 상태 확인
  isInactive(key: string): boolean {
    const lastActivityTime = this.lastActivity.get(key)
    if (!lastActivityTime) return true
    
    return Date.now() - lastActivityTime > this.maxInactiveTime
  }

  // 상태 리셋
  resetState(key: string): void {
    this.loadingStates.delete(key)
    this.errorStates.delete(key)
    this.lastActivity.delete(key)
    logger.debug('STATE_SAFETY', '상태 리셋', { key })
  }
  
  // 활성화 (lastActivity 업데이트)
  activate(key: string): void {
    this.lastActivity.set(key, Date.now())
    logger.debug('STATE_SAFETY', '활성화', { key })
  }

  // 모든 상태 리셋
  resetAllStates(): void {
    this.loadingStates.clear()
    this.errorStates.clear()
    this.lastActivity.clear()
    logger.debug('STATE_SAFETY', '모든 상태 리셋')
  }

  // 비활성 상태 정리
  cleanupInactiveStates(): void {
    const now = Date.now()
    const inactiveKeys: string[] = []

    this.lastActivity.forEach((lastTime, key) => {
      if (now - lastTime > this.maxInactiveTime) {
        inactiveKeys.push(key)
      }
    })

    inactiveKeys.forEach(key => {
      this.resetState(key)
    })

    if (inactiveKeys.length > 0) {
      logger.info('STATE_SAFETY', '비활성 상태 정리', { cleanedKeys: inactiveKeys })
    }
  }
}

// 싱글톤 인스턴스
export const stateSafetyManager = new StateSafetyManager()

// ============================================================================
// 정기 정리 작업
// ============================================================================

// 5분마다 비활성 상태 정리
setInterval(() => {
  stateSafetyManager.cleanupInactiveStates()
}, 5 * 60 * 1000)

export default {
  apiRequestManager,
  autoReconnectManager,
  stateSafetyManager,
  withRequestManagement
}
