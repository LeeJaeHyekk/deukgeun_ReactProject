import axios, { AxiosResponse, AxiosError } from 'axios'
import * as cheerio from 'cheerio'
import { EnhancedGymInfo } from '@backend/modules/crawling/types/CrawlingTypes'
import { AntiDetectionUtils } from '@backend/modules/crawling/utils/AntiDetectionUtils'
import { AdaptiveRetryManager } from '@backend/modules/crawling/utils/AdaptiveRetryManager'
import { FallbackStrategyManager } from '@backend/modules/crawling/utils/FallbackStrategyManager'
import { CrawlingMetricsCollector } from '@backend/modules/crawling/utils/CrawlingMetrics'

/**
 * 기본 검색 엔진 추상 클래스
 */
export abstract class BaseSearchEngine {
  protected timeout: number = 30000
  protected delay: number = 2000 // 기본 지연 시간 증가
  protected retryCount: number = 3
  protected retryDelay: number = 5000
  protected retryManager: AdaptiveRetryManager
  protected fallbackManager: FallbackStrategyManager
  protected metricsCollector: CrawlingMetricsCollector
  protected userAgents: string[] = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0'
  ]

  constructor(timeout: number = 30000, delay: number = 2000) {
    this.timeout = timeout
    this.delay = delay
    
    // 적응형 재시도 관리자 초기화
    this.retryManager = new AdaptiveRetryManager({
      maxRetries: 5,
      baseDelay: 2000,
      maxDelay: 30000,
      backoffMultiplier: 2,
      jitter: true
    })
    
    // 폴백 전략 관리자 초기화
    this.fallbackManager = new FallbackStrategyManager()
    
    // 메트릭 수집기 초기화
    this.metricsCollector = new CrawlingMetricsCollector()
    
    this.initializeFallbackStrategies()
  }

  /**
   * 검색 실행
   */
  abstract search(gymName: string, address?: string): Promise<EnhancedGymInfo | null>

  /**
   * 폴백 전략 초기화 (하위 클래스에서 오버라이드)
   */
  protected initializeFallbackStrategies(): void {
    // 기본 구현 - 하위 클래스에서 구체적인 전략 등록
  }

  /**
   * 강화된 검색 실행 (재시도 + 폴백 포함)
   */
  protected async executeWithFallback(
    primarySearch: () => Promise<EnhancedGymInfo | null>,
    gymName: string,
    address?: string
  ): Promise<EnhancedGymInfo | null> {
    const startTime = this.metricsCollector.recordRequestStart(gymName, 'primary_search')
    
    try {
      // 1차: 적응형 재시도로 기본 검색 시도
      const result = await this.retryManager.executeWithRetry(
        primarySearch,
        `search_${this.constructor.name}`
      )

      if (result && result.confidence && result.confidence > 0.1) {
        this.metricsCollector.recordRequestSuccess(gymName, 'primary_search', startTime, result)
        console.log(`✅ 기본 검색 성공: ${gymName} (신뢰도: ${result.confidence})`)
        return result
      }

      // 2차: 폴백 전략 실행
      console.log(`🔄 기본 검색 실패 - 폴백 전략 실행: ${gymName}`)
      const fallbackResult = await this.fallbackManager.executeFallback(gymName, address)

      if (fallbackResult.success && fallbackResult.data) {
        this.metricsCollector.recordRequestSuccess(gymName, fallbackResult.strategy, startTime, fallbackResult.data)
        console.log(`✅ 폴백 성공: ${gymName} (전략: ${fallbackResult.strategy})`)
        return fallbackResult.data
      }

      // 3차: 최종 폴백 - 기본 정보만 반환
      console.log(`⚠️ 모든 전략 실패 - 기본 정보 반환: ${gymName}`)
      const minimalInfo = this.createMinimalInfo(gymName, address)
      this.metricsCollector.recordRequestSuccess(gymName, 'minimal_fallback', startTime, minimalInfo)
      return minimalInfo

    } catch (error) {
      this.metricsCollector.recordRequestFailure(gymName, 'primary_search', startTime, error as Error)
      console.error(`💥 검색 완전 실패: ${gymName}`, error)
      
      // 최종 폴백
      const minimalInfo = this.createMinimalInfo(gymName, address)
      this.metricsCollector.recordRequestSuccess(gymName, 'error_fallback', startTime, minimalInfo)
      return minimalInfo
    }
  }

  /**
   * 최소한의 정보 생성
   */
  protected createMinimalInfo(gymName: string, address?: string): EnhancedGymInfo {
    return {
      name: gymName,
      address: address || '',
      phone: undefined,
      openHour: undefined,
      closeHour: undefined,
      price: undefined,
      rating: undefined,
      reviewCount: undefined,
      facilities: [],
      source: 'minimal_fallback',
      confidence: 0.05,
      type: 'private'
    }
  }

  /**
   * 메트릭 조회
   */
  getMetrics() {
    return this.metricsCollector.getMetrics()
  }

  /**
   * 성능 리포트 생성
   */
  generatePerformanceReport(): string {
    return this.metricsCollector.generatePerformanceReport()
  }

  /**
   * 메트릭 리셋
   */
  resetMetrics(): void {
    this.metricsCollector.resetMetrics()
  }

  /**
   * HTTP 요청 헤더 생성 (개선된 버전)
   */
  protected getHeaders(): Record<string, string> {
    return AntiDetectionUtils.getEnhancedHeaders()
  }

  /**
   * HTTP 요청 실행 (재시도 로직 포함)
   */
  protected async makeRequest(url: string): Promise<AxiosResponse> {
    let lastError: AxiosError | null = null
    
    for (let attempt = 1; attempt <= this.retryCount; attempt++) {
      try {
        // 요청 간 랜덤 지연 (1-3초)
        if (attempt > 1) {
          const randomDelay = Math.random() * 2000 + 1000
          console.log(`⏳ 재시도 ${attempt}/${this.retryCount} - ${Math.round(randomDelay)}ms 대기`)
          await new Promise(resolve => setTimeout(resolve, randomDelay))
        }

        const response = await axios.get(url, {
          headers: this.getHeaders(),
          timeout: this.timeout,
          maxRedirects: 5,
          validateStatus: (status) => status < 500 // 5xx 에러만 재시도
        })

        // 403 에러인 경우 특별 처리
        if (response.status === 403) {
          console.warn(`🚫 403 Forbidden 에러 (시도 ${attempt}/${this.retryCount})`)
          if (attempt < this.retryCount) {
            // 지수 백오프로 더 긴 대기 시간
            const backoffDelay = AntiDetectionUtils.getExponentialBackoffDelay(attempt, this.retryDelay)
            console.log(`⏳ 지수 백오프 지연: ${Math.round(backoffDelay)}ms`)
            await new Promise(resolve => setTimeout(resolve, backoffDelay))
            continue
          }
        }

        return response
      } catch (error) {
        lastError = error as AxiosError
        
        if (error instanceof AxiosError) {
          console.warn(`❌ 요청 실패 (시도 ${attempt}/${this.retryCount}): ${error.response?.status} ${error.message}`)
          
          // 재시도 가능한 에러인 경우 재시도
          if (AntiDetectionUtils.isRetryableError(error)) {
            if (attempt < this.retryCount) {
              const backoffDelay = AntiDetectionUtils.getExponentialBackoffDelay(attempt, this.retryDelay)
              console.log(`⏳ ${Math.round(backoffDelay)}ms 후 재시도...`)
              await new Promise(resolve => setTimeout(resolve, backoffDelay))
              continue
            }
          }
        }
        
        // 재시도 불가능한 에러인 경우 즉시 throw
        if (attempt === this.retryCount) {
          throw lastError
        }
      }
    }
    
    throw lastError || new Error('모든 재시도 실패')
  }

  /**
   * 페이지에서 텍스트 추출
   */
  protected extractText(html: string): string {
    const $ = cheerio.load(html)
    return $('body').text() || $('html').text() || ''
  }

  /**
   * 지연 실행 (랜덤 지연 포함)
   */
  protected async delayExecution(): Promise<void> {
    const randomDelay = AntiDetectionUtils.getRandomDelay(this.delay, this.delay + 1000)
    await new Promise(resolve => setTimeout(resolve, randomDelay))
  }

  /**
   * 요청 간 지연 (더 긴 지연)
   */
  protected async delayBetweenRequests(): Promise<void> {
    await AntiDetectionUtils.humanLikeDelay()
  }

  /**
   * 전화번호 추출
   */
  protected extractPhoneNumber(text: string): string | undefined {
    if (!text || typeof text !== 'string') return undefined
    
    const phonePatterns = [
      /(\d{2,3}-\d{3,4}-\d{4})/g,
      /(\d{2,3}\s\d{3,4}\s\d{4})/g,
      /(\d{10,11})/g
    ]
    
    for (const pattern of phonePatterns) {
      const match = text.match(pattern)
      if (match && match[1]) {
        return match[1].replace(/\s+/g, '-')
      }
    }
    return undefined
  }

  /**
   * 운영시간 추출
   */
  protected parseOperatingHours(text: string): { openHour?: string; closeHour?: string } {
    const timePatterns = [
      /(\d{1,2}:\d{2})\s*[-~]\s*(\d{1,2}:\d{2})/g,
      /(\d{1,2}시)\s*[-~]\s*(\d{1,2}시)/g,
      /오픈\s*(\d{1,2}:\d{2})/g,
      /마감\s*(\d{1,2}:\d{2})/g
    ]

    for (const pattern of timePatterns) {
      const match = pattern.exec(text)
      if (match) {
        if (match[2]) {
          return { openHour: match[1], closeHour: match[2] }
        } else if (match[1]) {
          return { openHour: match[1] }
        }
      }
    }

    return {}
  }
}
