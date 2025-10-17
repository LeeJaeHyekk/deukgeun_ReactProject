/**
 * 적응형 재시도 관리자
 * 실패 패턴에 따라 재시도 전략을 동적으로 조정
 */
import { CircuitBreaker } from '@backend/modules/crawling/utils/CircuitBreaker'

export interface RetryConfig {
  maxRetries: number
  baseDelay: number
  maxDelay: number
  backoffMultiplier: number
  jitter: boolean
}

export interface RetryMetrics {
  totalAttempts: number
  successfulAttempts: number
  failedAttempts: number
  averageDelay: number
  lastFailureTime: number
  consecutiveFailures: number
}

export class AdaptiveRetryManager {
  private metrics: RetryMetrics = {
    totalAttempts: 0,
    successfulAttempts: 0,
    failedAttempts: 0,
    averageDelay: 0,
    lastFailureTime: 0,
    consecutiveFailures: 0
  }

  private circuitBreaker: CircuitBreaker
  private config: RetryConfig

  constructor(config: Partial<RetryConfig> = {}) {
    this.config = {
      maxRetries: 5,
      baseDelay: 2000,
      maxDelay: 30000,
      backoffMultiplier: 2,
      jitter: true,
      ...config
    }

    this.circuitBreaker = new CircuitBreaker(
      config.maxRetries || 5,
      config.maxDelay || 30000
    )
  }

  /**
   * 적응형 재시도 실행
   */
  async executeWithRetry<T>(
    operation: () => Promise<T>,
    context: string = 'operation'
  ): Promise<T> {
    let lastError: Error | null = null
    let totalDelay = 0

    for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
      try {
        console.log(`🔄 ${context} 재시도 ${attempt}/${this.config.maxRetries}`)
        
        // 회로 차단기 확인
        const result = await this.circuitBreaker.execute(operation)
        
        // 성공 시 메트릭 업데이트
        this.updateSuccessMetrics(totalDelay)
        console.log(`✅ ${context} 성공 (시도 ${attempt})`)
        
        return result
      } catch (error) {
        lastError = error as Error
        this.updateFailureMetrics()
        
        console.warn(`❌ ${context} 실패 (시도 ${attempt}):`, error)
        
        // 마지막 시도가 아니면 지연
        if (attempt < this.config.maxRetries) {
          const delay = this.calculateAdaptiveDelay(attempt)
          totalDelay += delay
          
          console.log(`⏳ ${Math.round(delay)}ms 대기 후 재시도...`)
          await this.sleep(delay)
        }
      }
    }

    // 모든 재시도 실패
    console.error(`💥 ${context} 모든 재시도 실패 (${this.config.maxRetries}회)`)
    throw lastError || new Error(`${context} failed after ${this.config.maxRetries} attempts`)
  }

  /**
   * 적응형 지연 시간 계산
   */
  private calculateAdaptiveDelay(attempt: number): number {
    // 기본 지수 백오프
    let delay = this.config.baseDelay * Math.pow(this.config.backoffMultiplier, attempt - 1)
    
    // 연속 실패에 따른 추가 지연
    if (this.metrics.consecutiveFailures > 3) {
      delay *= Math.min(this.metrics.consecutiveFailures / 3, 3)
    }
    
    // 최대 지연 시간 제한
    delay = Math.min(delay, this.config.maxDelay)
    
    // 지터 추가 (랜덤성)
    if (this.config.jitter) {
      const jitterRange = delay * 0.1 // 10% 지터
      delay += (Math.random() - 0.5) * 2 * jitterRange
    }
    
    return Math.max(delay, 100) // 최소 100ms
  }

  /**
   * 성공 메트릭 업데이트
   */
  private updateSuccessMetrics(totalDelay: number): void {
    this.metrics.totalAttempts++
    this.metrics.successfulAttempts++
    this.metrics.consecutiveFailures = 0
    this.metrics.averageDelay = (this.metrics.averageDelay + totalDelay) / 2
  }

  /**
   * 실패 메트릭 업데이트
   */
  private updateFailureMetrics(): void {
    this.metrics.totalAttempts++
    this.metrics.failedAttempts++
    this.metrics.consecutiveFailures++
    this.metrics.lastFailureTime = Date.now()
  }

  /**
   * 지연 실행
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * 메트릭 반환
   */
  getMetrics(): RetryMetrics {
    return { ...this.metrics }
  }

  /**
   * 성공률 계산
   */
  getSuccessRate(): number {
    if (this.metrics.totalAttempts === 0) return 0
    return (this.metrics.successfulAttempts / this.metrics.totalAttempts) * 100
  }

  /**
   * 회로 차단기 상태 반환
   */
  getCircuitBreakerState(): string {
    return this.circuitBreaker.getState()
  }

  /**
   * 메트릭 리셋
   */
  resetMetrics(): void {
    this.metrics = {
      totalAttempts: 0,
      successfulAttempts: 0,
      failedAttempts: 0,
      averageDelay: 0,
      lastFailureTime: 0,
      consecutiveFailures: 0
    }
    this.circuitBreaker.reset()
    console.log('🔄 적응형 재시도 관리자 메트릭 리셋')
  }

  /**
   * 설정 업데이트
   */
  updateConfig(newConfig: Partial<RetryConfig>): void {
    this.config = { ...this.config, ...newConfig }
    console.log('⚙️ 재시도 설정 업데이트:', this.config)
  }
}
