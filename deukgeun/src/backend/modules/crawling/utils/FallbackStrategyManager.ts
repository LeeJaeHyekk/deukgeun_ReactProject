/**
 * 다단계 폴백 전략 관리자
 * 봇 탐지 회피 실패 시 다양한 대체 전략을 순차적으로 시도
 */
import { EnhancedGymInfo } from '@backend/modules/crawling/types/CrawlingTypes'
import { AdaptiveRetryManager } from '@backend/modules/crawling/utils/AdaptiveRetryManager'

export interface FallbackStrategy {
  name: string
  priority: number
  execute: (gymName: string, address?: string) => Promise<EnhancedGymInfo | null>
  isAvailable: () => boolean
}

export interface FallbackResult {
  success: boolean
  data: EnhancedGymInfo | null
  strategy: string
  attempts: number
  totalTime: number
  error?: string
}

export class FallbackStrategyManager {
  private strategies: FallbackStrategy[] = []
  private retryManager: AdaptiveRetryManager
  private executionHistory: Map<string, FallbackResult[]> = new Map()

  constructor() {
    this.retryManager = new AdaptiveRetryManager({
      maxRetries: 3,
      baseDelay: 3000,
      maxDelay: 15000
    })
  }

  /**
   * 폴백 전략 등록
   */
  registerStrategy(strategy: FallbackStrategy): void {
    this.strategies.push(strategy)
    this.strategies.sort((a, b) => a.priority - b.priority)
    console.log(`📋 폴백 전략 등록: ${strategy.name} (우선순위: ${strategy.priority})`)
  }

  /**
   * 다단계 폴백 실행
   */
  async executeFallback(
    gymName: string, 
    address?: string,
    context: string = 'fallback'
  ): Promise<FallbackResult> {
    const startTime = Date.now()
    const results: FallbackResult[] = []
    
    console.log(`🔄 다단계 폴백 시작: ${gymName}`)
    
    // 사용 가능한 전략들만 필터링
    const availableStrategies = this.strategies.filter(s => s.isAvailable())
    
    if (availableStrategies.length === 0) {
      console.warn('⚠️ 사용 가능한 폴백 전략이 없습니다')
      return this.createFailureResult('no_available_strategies', startTime)
    }

    for (const strategy of availableStrategies) {
      try {
        console.log(`🎯 전략 시도: ${strategy.name}`)
        
        const result = await this.retryManager.executeWithRetry(
          () => strategy.execute(gymName, address),
          `${context}_${strategy.name}`
        )

        if (result && this.isValidResult(result)) {
          const successResult = this.createSuccessResult(
            strategy.name, 
            result, 
            startTime, 
            results.length + 1
          )
          
          console.log(`✅ 폴백 성공: ${strategy.name} (${Math.round(successResult.totalTime)}ms)`)
          this.recordExecution(gymName, successResult)
          return successResult
        }
        
        // 결과가 유효하지 않은 경우
        const invalidResult = this.createFailureResult(
          strategy.name, 
          startTime, 
          'invalid_result'
        )
        results.push(invalidResult)
        
      } catch (error) {
        console.warn(`❌ 전략 실패: ${strategy.name}`, error)
        
        const failureResult = this.createFailureResult(
          strategy.name, 
          startTime, 
          error instanceof Error ? error.message : 'unknown_error'
        )
        results.push(failureResult)
      }
    }

    // 모든 전략 실패
    const finalResult = this.createFailureResult(
      'all_strategies_failed', 
      startTime, 
      '모든 폴백 전략 실패'
    )
    
    console.error(`💥 모든 폴백 전략 실패: ${gymName}`)
    this.recordExecution(gymName, finalResult)
    return finalResult
  }

  /**
   * 결과 유효성 검사
   */
  private isValidResult(result: EnhancedGymInfo): boolean {
    return !!(
      result &&
      result.name &&
      result.confidence &&
      result.confidence > 0.1
    )
  }

  /**
   * 성공 결과 생성
   */
  private createSuccessResult(
    strategy: string, 
    data: EnhancedGymInfo, 
    startTime: number, 
    attempts: number
  ): FallbackResult {
    return {
      success: true,
      data,
      strategy,
      attempts,
      totalTime: Date.now() - startTime
    }
  }

  /**
   * 실패 결과 생성
   */
  private createFailureResult(
    strategy: string, 
    startTime: number, 
    error?: string
  ): FallbackResult {
    return {
      success: false,
      data: null,
      strategy,
      attempts: 1,
      totalTime: Date.now() - startTime,
      error
    }
  }

  /**
   * 실행 기록 저장
   */
  private recordExecution(gymName: string, result: FallbackResult): void {
    if (!this.executionHistory.has(gymName)) {
      this.executionHistory.set(gymName, [])
    }
    
    const history = this.executionHistory.get(gymName)!
    history.push(result)
    
    // 최대 10개 기록만 유지
    if (history.length > 10) {
      history.shift()
    }
  }

  /**
   * 실행 기록 조회
   */
  getExecutionHistory(gymName: string): FallbackResult[] {
    return this.executionHistory.get(gymName) || []
  }

  /**
   * 전략별 성공률 계산
   */
  getStrategySuccessRate(): Map<string, number> {
    const successRates = new Map<string, { success: number; total: number }>()
    
    for (const [gymName, results] of this.executionHistory) {
      for (const result of results) {
        const current = successRates.get(result.strategy) || { success: 0, total: 0 }
        current.total++
        if (result.success) current.success++
        successRates.set(result.strategy, current)
      }
    }
    
    // 성공률 계산
    const rates = new Map<string, number>()
    for (const [strategy, stats] of successRates) {
      rates.set(strategy, (stats.success / stats.total) * 100)
    }
    
    return rates
  }

  /**
   * 전략 우선순위 재정렬
   */
  reorderStrategiesBySuccess(): void {
    const successRates = this.getStrategySuccessRate()
    
    this.strategies.sort((a, b) => {
      const rateA = successRates.get(a.name) || 0
      const rateB = successRates.get(b.name) || 0
      return rateB - rateA // 성공률 높은 순으로 정렬
    })
    
    console.log('🔄 전략 우선순위 재정렬 완료')
  }

  /**
   * 등록된 전략 목록 반환
   */
  getRegisteredStrategies(): string[] {
    return this.strategies.map(s => s.name)
  }

  /**
   * 특정 전략 비활성화
   */
  disableStrategy(strategyName: string): void {
    const strategy = this.strategies.find(s => s.name === strategyName)
    if (strategy) {
      strategy.isAvailable = () => false
      console.log(`🚫 전략 비활성화: ${strategyName}`)
    }
  }

  /**
   * 특정 전략 활성화
   */
  enableStrategy(strategyName: string): void {
    const strategy = this.strategies.find(s => s.name === strategyName)
    if (strategy) {
      strategy.isAvailable = () => true
      console.log(`✅ 전략 활성화: ${strategyName}`)
    }
  }

  /**
   * 전체 통계 반환
   */
  getOverallStats(): {
    totalExecutions: number
    successfulExecutions: number
    averageExecutionTime: number
    strategyCount: number
  } {
    let totalExecutions = 0
    let successfulExecutions = 0
    let totalTime = 0
    
    for (const results of this.executionHistory.values()) {
      for (const result of results) {
        totalExecutions++
        totalTime += result.totalTime
        if (result.success) successfulExecutions++
      }
    }
    
    return {
      totalExecutions,
      successfulExecutions,
      averageExecutionTime: totalExecutions > 0 ? totalTime / totalExecutions : 0,
      strategyCount: this.strategies.length
    }
  }
}
