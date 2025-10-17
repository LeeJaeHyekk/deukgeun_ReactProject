/**
 * 크롤링 설정 관리 모듈
 * 크롤링 시스템의 모든 설정을 중앙에서 관리
 */

export interface CrawlingSystemConfig {
  // 기본 크롤링 설정
  timeout: number
  delay: number
  maxRetries: number
  
  // 배치 처리 설정
  batchProcessing: {
    initialBatchSize: number
    minBatchSize: number
    maxBatchSize: number
    maxConsecutiveFailures: number
    batchDelay: {
      min: number
      max: number
    }
    lowSuccessRateDelay: {
      min: number
      max: number
    }
    lowSuccessRateThreshold: number
  }
  
  // 성능 모니터링 설정
  performanceMonitoring: {
    enableDetailedStats: boolean
    enableRealTimeMonitoring: boolean
    reportInterval: number
  }
  
  // 검색 엔진 설정
  searchEngines: {
    enabled: string[]
    timeout: number
    delay: number
    maxRetries: number
    enableParallel: boolean
    maxConcurrent: number
  }
  
  // 폴백 설정
  fallback: {
    enableEnhancedFallback: boolean
    minConfidence: number
    fallbackConfidence: number
  }
  
  // 봇 탐지 회피 설정
  antiDetection: {
    enableRandomDelay: boolean
    minDelay: number
    maxDelay: number
    enableUserAgentRotation: boolean
    enableRequestHeaders: boolean
  }
  
  // 성공률 목표 설정
  successRate: {
    targetRate: number
    warningThreshold: number
    criticalThreshold: number
  }
}

export class CrawlingConfigManager {
  private config: CrawlingSystemConfig

  constructor(initialConfig?: Partial<CrawlingSystemConfig>) {
    this.config = this.getDefaultConfig()
    
    if (initialConfig) {
      this.updateConfig(initialConfig)
    }
  }

  /**
   * 기본 설정 반환
   */
  private getDefaultConfig(): CrawlingSystemConfig {
    return {
      // 기본 크롤링 설정
      timeout: 30000,
      delay: 1000,
      maxRetries: 3,
      
      // 배치 처리 설정
      batchProcessing: {
        initialBatchSize: 10,
        minBatchSize: 1,
        maxBatchSize: 20,
        maxConsecutiveFailures: 3,
        batchDelay: {
          min: 2000,
          max: 5000
        },
        lowSuccessRateDelay: {
          min: 5000,
          max: 10000
        },
        lowSuccessRateThreshold: 80
      },
      
      // 성능 모니터링 설정
      performanceMonitoring: {
        enableDetailedStats: true,
        enableRealTimeMonitoring: true,
        reportInterval: 10000
      },
      
      // 검색 엔진 설정
      searchEngines: {
        enabled: ['naver_cafe', 'naver', 'google', 'daum', 'naver_blog'],
        timeout: 30000,
        delay: 1000,
        maxRetries: 3,
        enableParallel: false,
        maxConcurrent: 1
      },
      
      // 폴백 설정
      fallback: {
        enableEnhancedFallback: true,
        minConfidence: 0.1,
        fallbackConfidence: 0.05
      },
      
      // 봇 탐지 회피 설정
      antiDetection: {
        enableRandomDelay: true,
        minDelay: 1000,
        maxDelay: 3000,
        enableUserAgentRotation: true,
        enableRequestHeaders: true
      },
      
      // 성공률 목표 설정
      successRate: {
        targetRate: 95,
        warningThreshold: 80,
        criticalThreshold: 60
      }
    }
  }

  /**
   * 설정 업데이트
   */
  updateConfig(newConfig: Partial<CrawlingSystemConfig>): void {
    // 설정 업데이트
    this.config = this.deepMerge(this.config, newConfig)
    
    console.log('⚙️ 크롤링 설정이 업데이트되었습니다.')
  }

  /**
   * 전체 설정 반환
   */
  getConfig(): CrawlingSystemConfig {
    return { ...this.config }
  }

  /**
   * 특정 설정 반환
   */
  getConfigValue<T>(path: string): T | undefined {
    return this.getNestedValue(this.config, path) as T
  }

  /**
   * 특정 설정 업데이트
   */
  setConfigValue(path: string, value: any): void {
    this.setNestedValue(this.config, path, value)
    console.log(`⚙️ 설정 업데이트: ${path} = ${JSON.stringify(value)}`)
  }

  /**
   * 배치 처리 설정 반환
   */
  getBatchProcessingConfig() {
    return { ...this.config.batchProcessing }
  }

  /**
   * 성능 모니터링 설정 반환
   */
  getPerformanceMonitoringConfig() {
    return { ...this.config.performanceMonitoring }
  }

  /**
   * 검색 엔진 설정 반환
   */
  getSearchEnginesConfig() {
    return { ...this.config.searchEngines }
  }

  /**
   * 폴백 설정 반환
   */
  getFallbackConfig() {
    return { ...this.config.fallback }
  }

  /**
   * 봇 탐지 회피 설정 반환
   */
  getAntiDetectionConfig() {
    return { ...this.config.antiDetection }
  }

  /**
   * 성공률 목표 설정 반환
   */
  getSuccessRateConfig() {
    return { ...this.config.successRate }
  }

  /**
   * 설정 검증
   */
  validateConfig(config: Partial<CrawlingSystemConfig>): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    // 기본 설정 검증
    if (config.timeout !== undefined && config.timeout <= 0) {
      errors.push('timeout은 0보다 커야 합니다.')
    }

    if (config.delay !== undefined && config.delay < 0) {
      errors.push('delay는 0 이상이어야 합니다.')
    }

    if (config.maxRetries !== undefined && config.maxRetries < 0) {
      errors.push('maxRetries는 0 이상이어야 합니다.')
    }

    // 배치 처리 설정 검증
    if (config.batchProcessing) {
      const bp = config.batchProcessing
      
      if (bp.initialBatchSize !== undefined && (bp.initialBatchSize < 1 || bp.initialBatchSize > 50)) {
        errors.push('initialBatchSize는 1-50 범위여야 합니다.')
      }

      if (bp.minBatchSize !== undefined && bp.minBatchSize < 1) {
        errors.push('minBatchSize는 1 이상이어야 합니다.')
      }

      if (bp.maxBatchSize !== undefined && bp.maxBatchSize > 100) {
        errors.push('maxBatchSize는 100 이하여야 합니다.')
      }

      if (bp.minBatchSize !== undefined && bp.maxBatchSize !== undefined && bp.minBatchSize > bp.maxBatchSize) {
        errors.push('minBatchSize는 maxBatchSize보다 작거나 같아야 합니다.')
      }
    }

    // 성공률 설정 검증
    if (config.successRate) {
      const sr = config.successRate
      
      if (sr.targetRate !== undefined && (sr.targetRate < 0 || sr.targetRate > 100)) {
        errors.push('targetRate는 0-100 범위여야 합니다.')
      }

      if (sr.warningThreshold !== undefined && (sr.warningThreshold < 0 || sr.warningThreshold > 100)) {
        errors.push('warningThreshold는 0-100 범위여야 합니다.')
      }

      if (sr.criticalThreshold !== undefined && (sr.criticalThreshold < 0 || sr.criticalThreshold > 100)) {
        errors.push('criticalThreshold는 0-100 범위여야 합니다.')
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * 설정 리셋
   */
  resetToDefault(): void {
    this.config = this.getDefaultConfig()
    console.log('⚙️ 설정이 기본값으로 리셋되었습니다.')
  }


  /**
   * 설정 요약 반환
   */
  getConfigSummary(): string {
    return `
📋 크롤링 설정 요약:
   - 타임아웃: ${this.config.timeout}ms
   - 지연 시간: ${this.config.delay}ms
   - 최대 재시도: ${this.config.maxRetries}회
   - 배치 크기: ${this.config.batchProcessing.initialBatchSize}개 (${this.config.batchProcessing.minBatchSize}-${this.config.batchProcessing.maxBatchSize})
   - 최대 연속 실패: ${this.config.batchProcessing.maxConsecutiveFailures}회
   - 성공률 목표: ${this.config.successRate.targetRate}%
   - 활성화된 검색 엔진: ${this.config.searchEngines.enabled.join(', ')}
   - 실시간 모니터링: ${this.config.performanceMonitoring.enableRealTimeMonitoring ? '활성화' : '비활성화'}
   - 향상된 폴백: ${this.config.fallback.enableEnhancedFallback ? '활성화' : '비활성화'}
    `
  }

  /**
   * 중첩된 객체 병합
   */
  private deepMerge(target: any, source: any): any {
    const result = { ...target }
    
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this.deepMerge(target[key] || {}, source[key])
      } else {
        result[key] = source[key]
      }
    }
    
    return result
  }

  /**
   * 중첩된 값 가져오기
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj)
  }

  /**
   * 중첩된 값 설정하기
   */
  private setNestedValue(obj: any, path: string, value: any): void {
    const keys = path.split('.')
    const lastKey = keys.pop()
    
    if (!lastKey) return
    
    const target = keys.reduce((current, key) => {
      if (!current[key]) current[key] = {}
      return current[key]
    }, obj)
    
    target[lastKey] = value
  }

}
