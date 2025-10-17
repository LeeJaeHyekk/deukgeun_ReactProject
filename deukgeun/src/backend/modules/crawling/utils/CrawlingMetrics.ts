/**
 * 크롤링 메트릭 수집 및 모니터링 시스템
 */
import { EnhancedGymInfo } from '@backend/modules/crawling/types/CrawlingTypes'

export interface CrawlingMetrics {
  totalRequests: number
  successfulRequests: number
  failedRequests: number
  blockedRequests: number
  averageResponseTime: number
  successRate: number
  blockRate: number
  lastUpdated: number
}

export interface StrategyMetrics {
  strategyName: string
  totalAttempts: number
  successfulAttempts: number
  failedAttempts: number
  averageExecutionTime: number
  successRate: number
  lastUsed: number
}

export interface GymMetrics {
  gymName: string
  totalAttempts: number
  successfulAttempts: number
  strategiesUsed: string[]
  averageConfidence: number
  lastSuccessfulStrategy: string
  lastAttempt: number
}

export class CrawlingMetricsCollector {
  private metrics: CrawlingMetrics = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    blockedRequests: 0,
    averageResponseTime: 0,
    successRate: 0,
    blockRate: 0,
    lastUpdated: Date.now()
  }

  private strategyMetrics: Map<string, StrategyMetrics> = new Map()
  private gymMetrics: Map<string, GymMetrics> = new Map()
  private responseTimes: number[] = []

  /**
   * 요청 시작 기록
   */
  recordRequestStart(gymName: string, strategyName: string): number {
    const startTime = Date.now()
    this.metrics.totalRequests++
    this.metrics.lastUpdated = startTime

    // 헬스장별 메트릭 업데이트
    this.updateGymMetrics(gymName, strategyName, startTime)

    // 전략별 메트릭 업데이트
    this.updateStrategyMetrics(strategyName, startTime)

    return startTime
  }

  /**
   * 요청 성공 기록
   */
  recordRequestSuccess(
    gymName: string, 
    strategyName: string, 
    startTime: number, 
    result: EnhancedGymInfo
  ): void {
    const endTime = Date.now()
    const responseTime = endTime - startTime

    this.metrics.successfulRequests++
    this.responseTimes.push(responseTime)
    this.updateAverageResponseTime()

    // 헬스장별 성공 기록
    const gymMetric = this.gymMetrics.get(gymName)
    if (gymMetric) {
      gymMetric.successfulAttempts++
      gymMetric.averageConfidence = (gymMetric.averageConfidence + result.confidence) / 2
      gymMetric.lastSuccessfulStrategy = strategyName
    }

    // 전략별 성공 기록
    const strategyMetric = this.strategyMetrics.get(strategyName)
    if (strategyMetric) {
      strategyMetric.successfulAttempts++
      strategyMetric.averageExecutionTime = (strategyMetric.averageExecutionTime + responseTime) / 2
    }

    this.updateSuccessRate()
    this.metrics.lastUpdated = endTime

    console.log(`📊 메트릭 기록: ${gymName} 성공 (${strategyName}, ${responseTime}ms)`)
  }

  /**
   * 요청 실패 기록
   */
  recordRequestFailure(
    gymName: string, 
    strategyName: string, 
    startTime: number, 
    error: Error
  ): void {
    const endTime = Date.now()
    const responseTime = endTime - startTime

    this.metrics.failedRequests++
    this.responseTimes.push(responseTime)
    this.updateAverageResponseTime()

    // 403 에러인 경우 차단 요청으로 분류
    if (error.message.includes('403') || error.message.includes('Forbidden')) {
      this.metrics.blockedRequests++
      this.updateBlockRate()
    }

    // 헬스장별 실패 기록
    const gymMetric = this.gymMetrics.get(gymName)
    if (gymMetric) {
      // 실패는 이미 recordRequestStart에서 기록됨
    }

    // 전략별 실패 기록
    const strategyMetric = this.strategyMetrics.get(strategyName)
    if (strategyMetric) {
      strategyMetric.failedAttempts++
      strategyMetric.averageExecutionTime = (strategyMetric.averageExecutionTime + responseTime) / 2
    }

    this.updateSuccessRate()
    this.metrics.lastUpdated = endTime

    console.log(`📊 메트릭 기록: ${gymName} 실패 (${strategyName}, ${responseTime}ms)`)
  }

  /**
   * 헬스장별 메트릭 업데이트
   */
  private updateGymMetrics(gymName: string, strategyName: string, timestamp: number): void {
    if (!this.gymMetrics.has(gymName)) {
      this.gymMetrics.set(gymName, {
        gymName,
        totalAttempts: 0,
        successfulAttempts: 0,
        strategiesUsed: [],
        averageConfidence: 0,
        lastSuccessfulStrategy: '',
        lastAttempt: timestamp
      })
    }

    const gymMetric = this.gymMetrics.get(gymName)!
    gymMetric.totalAttempts++
    gymMetric.lastAttempt = timestamp

    if (!gymMetric.strategiesUsed.includes(strategyName)) {
      gymMetric.strategiesUsed.push(strategyName)
    }
  }

  /**
   * 전략별 메트릭 업데이트
   */
  private updateStrategyMetrics(strategyName: string, timestamp: number): void {
    if (!this.strategyMetrics.has(strategyName)) {
      this.strategyMetrics.set(strategyName, {
        strategyName,
        totalAttempts: 0,
        successfulAttempts: 0,
        failedAttempts: 0,
        averageExecutionTime: 0,
        successRate: 0,
        lastUsed: timestamp
      })
    }

    const strategyMetric = this.strategyMetrics.get(strategyName)!
    strategyMetric.totalAttempts++
    strategyMetric.lastUsed = timestamp
  }

  /**
   * 평균 응답 시간 업데이트
   */
  private updateAverageResponseTime(): void {
    if (this.responseTimes.length > 0) {
      const sum = this.responseTimes.reduce((a, b) => a + b, 0)
      this.metrics.averageResponseTime = sum / this.responseTimes.length
    }

    // 최근 100개 응답 시간만 유지
    if (this.responseTimes.length > 100) {
      this.responseTimes = this.responseTimes.slice(-100)
    }
  }

  /**
   * 성공률 업데이트
   */
  private updateSuccessRate(): void {
    if (this.metrics.totalRequests > 0) {
      this.metrics.successRate = (this.metrics.successfulRequests / this.metrics.totalRequests) * 100
    }
  }

  /**
   * 차단률 업데이트
   */
  private updateBlockRate(): void {
    if (this.metrics.totalRequests > 0) {
      this.metrics.blockRate = (this.metrics.blockedRequests / this.metrics.totalRequests) * 100
    }
  }

  /**
   * 전체 메트릭 반환
   */
  getMetrics(): CrawlingMetrics {
    return { ...this.metrics }
  }

  /**
   * 전략별 메트릭 반환
   */
  getStrategyMetrics(): StrategyMetrics[] {
    return Array.from(this.strategyMetrics.values())
  }

  /**
   * 헬스장별 메트릭 반환
   */
  getGymMetrics(): GymMetrics[] {
    return Array.from(this.gymMetrics.values())
  }

  /**
   * 특정 헬스장 메트릭 반환
   */
  getGymMetric(gymName: string): GymMetrics | undefined {
    return this.gymMetrics.get(gymName)
  }

  /**
   * 특정 전략 메트릭 반환
   */
  getStrategyMetric(strategyName: string): StrategyMetrics | undefined {
    return this.strategyMetrics.get(strategyName)
  }

  /**
   * 성능 리포트 생성
   */
  generatePerformanceReport(): string {
    const metrics = this.getMetrics()
    const strategyMetrics = this.getStrategyMetrics()
    
    let report = '\n📊 크롤링 성능 리포트\n'
    report += '='.repeat(50) + '\n'
    report += `총 요청 수: ${metrics.totalRequests}\n`
    report += `성공 요청 수: ${metrics.successfulRequests}\n`
    report += `실패 요청 수: ${metrics.failedRequests}\n`
    report += `차단 요청 수: ${metrics.blockedRequests}\n`
    report += `성공률: ${metrics.successRate.toFixed(2)}%\n`
    report += `차단률: ${metrics.blockRate.toFixed(2)}%\n`
    report += `평균 응답 시간: ${metrics.averageResponseTime.toFixed(0)}ms\n`
    report += `마지막 업데이트: ${new Date(metrics.lastUpdated).toLocaleString()}\n\n`

    report += '📈 전략별 성능:\n'
    report += '-'.repeat(30) + '\n'
    strategyMetrics.forEach(strategy => {
      report += `${strategy.strategyName}:\n`
      report += `  시도: ${strategy.totalAttempts}, 성공: ${strategy.successfulAttempts}\n`
      report += `  성공률: ${strategy.successRate.toFixed(2)}%\n`
      report += `  평균 실행 시간: ${strategy.averageExecutionTime.toFixed(0)}ms\n\n`
    })

    return report
  }

  /**
   * 메트릭 리셋
   */
  resetMetrics(): void {
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      blockedRequests: 0,
      averageResponseTime: 0,
      successRate: 0,
      blockRate: 0,
      lastUpdated: Date.now()
    }
    this.strategyMetrics.clear()
    this.gymMetrics.clear()
    this.responseTimes = []
    console.log('🔄 크롤링 메트릭 리셋 완료')
  }

  /**
   * 메트릭을 JSON으로 내보내기
   */
  exportMetrics(): string {
    return JSON.stringify({
      metrics: this.metrics,
      strategyMetrics: Array.from(this.strategyMetrics.values()),
      gymMetrics: Array.from(this.gymMetrics.values()),
      exportedAt: new Date().toISOString()
    }, null, 2)
  }
}
