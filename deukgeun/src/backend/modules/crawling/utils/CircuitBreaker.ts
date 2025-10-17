/**
 * 회로 차단기 패턴 구현
 * 연속적인 실패 시 일시적으로 요청을 차단하여 시스템 보호
 */
export class CircuitBreaker {
  private failureCount = 0
  private lastFailureTime = 0
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED'
  
  constructor(
    private readonly failureThreshold: number = 5,
    private readonly recoveryTimeout: number = 60000, // 1분
    private readonly halfOpenMaxCalls: number = 3
  ) {}

  /**
   * 요청 실행 전 상태 확인
   */
  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.recoveryTimeout) {
        this.state = 'HALF_OPEN'
        console.log('🔄 회로 차단기: HALF_OPEN 상태로 전환')
      } else {
        throw new Error('Circuit breaker is OPEN - too many failures')
      }
    }

    if (this.state === 'HALF_OPEN' && this.failureCount >= this.halfOpenMaxCalls) {
      this.state = 'OPEN'
      this.lastFailureTime = Date.now()
      throw new Error('Circuit breaker is OPEN - half-open limit exceeded')
    }

    try {
      const result = await operation()
      this.onSuccess()
      return result
    } catch (error) {
      this.onFailure()
      throw error
    }
  }

  /**
   * 성공 시 상태 업데이트
   */
  private onSuccess(): void {
    this.failureCount = 0
    if (this.state === 'HALF_OPEN') {
      this.state = 'CLOSED'
      console.log('✅ 회로 차단기: CLOSED 상태로 복구')
    }
  }

  /**
   * 실패 시 상태 업데이트
   */
  private onFailure(): void {
    this.failureCount++
    this.lastFailureTime = Date.now()

    if (this.failureCount >= this.failureThreshold) {
      this.state = 'OPEN'
      console.log(`🚫 회로 차단기: OPEN 상태로 전환 (실패 횟수: ${this.failureCount})`)
    }
  }

  /**
   * 현재 상태 반환
   */
  getState(): string {
    return this.state
  }

  /**
   * 실패 횟수 반환
   */
  getFailureCount(): number {
    return this.failureCount
  }

  /**
   * 회로 차단기 리셋
   */
  reset(): void {
    this.failureCount = 0
    this.lastFailureTime = 0
    this.state = 'CLOSED'
    console.log('🔄 회로 차단기: 리셋됨')
  }
}
