import { EnhancedGymInfo, ProcessedGymData } from '@backend/modules/crawling/types/CrawlingTypes'
import { BaseSearchEngine } from '@backend/modules/crawling/sources/search/BaseSearchEngine'
import { NaverSearchEngine } from '@backend/modules/crawling/sources/search/NaverSearchEngine'
import { GoogleSearchEngine } from '@backend/modules/crawling/sources/search/GoogleSearchEngine'
import { DaumSearchEngine } from '@backend/modules/crawling/sources/search/DaumSearchEngine'
import { NaverBlogSearchEngine } from '@backend/modules/crawling/sources/search/NaverBlogSearchEngine'
import { NaverCafeSearchEngine } from '@backend/modules/crawling/sources/search/NaverCafeSearchEngine'
import { CrossValidator } from '@backend/modules/crawling/processors/CrossValidator'
import { PriceExtractor } from '@backend/modules/crawling/processors/PriceExtractor'
import { AntiDetectionUtils } from '@backend/modules/crawling/utils/AntiDetectionUtils'
import { PerformanceMonitor } from '@backend/modules/crawling/utils/PerformanceMonitor'
import { BatchProcessor } from '@backend/modules/crawling/processors/BatchProcessor'
import { CrawlingConfigManager } from '@backend/modules/crawling/config/CrawlingConfigManager'

/**
 * 최적화된 헬스장 크롤링 소스
 * 모듈화된 구조로 성공률 향상 로직 적용
 */
export class OptimizedGymCrawlingSource {
  private searchEngines: BaseSearchEngine[]
  private crossValidator: CrossValidator
  private priceExtractor: PriceExtractor
  private performanceMonitor: PerformanceMonitor
  private batchProcessor: BatchProcessor
  private configManager: CrawlingConfigManager

  constructor(
    timeout: number = 30000, 
    delay: number = 1000,
    config?: Partial<import('../config/CrawlingConfigManager').CrawlingSystemConfig>
  ) {
    // 설정 관리자 초기화
    this.configManager = new CrawlingConfigManager({
      timeout,
      delay,
      ...config
    })

    // 성능 모니터 초기화
    this.performanceMonitor = new PerformanceMonitor(
      this.configManager.getPerformanceMonitoringConfig()
    )

    // 배치 프로세서 초기화
    this.batchProcessor = new BatchProcessor(
      this.configManager.getBatchProcessingConfig(),
      this.performanceMonitor
    )

    // 검색 엔진 초기화
    const searchConfig = this.configManager.getSearchEnginesConfig()
    this.searchEngines = this.initializeSearchEngines(searchConfig)
    
    this.crossValidator = new CrossValidator()
    this.priceExtractor = new PriceExtractor()
  }

  /**
   * 검색 엔진 초기화
   */
  private initializeSearchEngines(config: any): BaseSearchEngine[] {
    const engines: BaseSearchEngine[] = []
    const engineMap = {
      'naver': () => new NaverSearchEngine(config.timeout, config.delay),
      'google': () => new GoogleSearchEngine(config.timeout, config.delay),
      'daum': () => new DaumSearchEngine(config.timeout, config.delay),
      'naver_blog': () => new NaverBlogSearchEngine(config.timeout, config.delay),
      'naver_cafe': () => new NaverCafeSearchEngine(config.timeout, config.delay)
    }

    for (const engineName of config.enabled) {
      if (engineMap[engineName as keyof typeof engineMap]) {
        engines.push(engineMap[engineName as keyof typeof engineMap]())
      }
    }

    return engines
  }

  /**
   * 헬스장 데이터 크롤링 (모듈화된 배치 처리)
   */
  async crawlGymsFromRawData(gyms: ProcessedGymData[]): Promise<EnhancedGymInfo[]> {
    console.log(`🚀 최적화된 헬스장 크롤링 시작: ${gyms.length}개 헬스장`)
    console.log(`📦 배치 처리 모드: 동적 배치 크기 ${this.batchProcessor.getCurrentBatchSize()}개`)
    
    // 성능 모니터링 시작
    this.performanceMonitor.start()
    
    try {
      // 배치 처리 실행
      const batchResult = await this.batchProcessor.processBatches(
        gyms,
        (batch) => this.processBatch(batch)
      )
      
      // 최종 성공률 계산
      const successCount = batchResult.results.filter(r => r.confidence > 0.1).length
      const successRate = (successCount / batchResult.results.length) * 100
      
      console.log(`\n📊 최적화된 헬스장 크롤링 완료:`)
      console.log(`   - 총 처리: ${batchResult.results.length}개 헬스장`)
      console.log(`   - 성공률: ${successRate.toFixed(1)}% (${successCount}/${batchResult.results.length})`)
      console.log(`   - 총 실행 시간: ${(batchResult.processingTime / 1000).toFixed(1)}초`)
      console.log(`   - 평균 처리 시간: ${Math.round(batchResult.processingTime / batchResult.results.length)}ms/개`)
      console.log(`   - 성공한 배치: ${batchResult.successfulBatches}/${batchResult.totalBatches}`)
      console.log(`   - 평균 배치 크기: ${batchResult.averageBatchSize.toFixed(1)}개`)
      
      return batchResult.results
      
    } catch (error) {
      console.error('❌ 크롤링 처리 중 오류 발생:', error)
      throw error
    }
  }

  /**
   * 배치 처리 메서드
   */
  private async processBatch(batch: ProcessedGymData[]): Promise<EnhancedGymInfo[]> {
    const results: EnhancedGymInfo[] = []
    
    for (const gym of batch) {
      try {
        const result = await this.crawlSingleGym(gym)
        results.push(result)
        
        // 배치 내 지연
        if (batch.indexOf(gym) < batch.length - 1) {
          await this.delayExecution()
        }
      } catch (error) {
        console.error(`배치 내 크롤링 실패: ${gym.name}`, error)
        results.push(this.createFallbackResult(gym))
      }
    }
    
    return results
  }

  /**
   * 단일 헬스장 크롤링 (개선된 에러 처리)
   */
  private async crawlSingleGym(gym: ProcessedGymData): Promise<EnhancedGymInfo> {
    const searchResults: EnhancedGymInfo[] = []
    
    console.log(`🏋️ 헬스장 크롤링 시작: ${gym.name}`)
    
    // 검색 엔진을 순차적으로 실행 (병렬 실행 시 403 에러 위험 증가)
    for (let i = 0; i < this.searchEngines.length; i++) {
      const engine = this.searchEngines[i]
      try {
        console.log(`🔍 검색 엔진 ${i + 1}/${this.searchEngines.length}: ${engine.constructor.name}`)
        const result = await engine.search(gym.name, gym.address)
        
        if (result && result.confidence && result.confidence > 0.1) {
          searchResults.push(result)
          console.log(`✅ ${engine.constructor.name}에서 정보 추출 성공 (신뢰도: ${result.confidence})`)
          
          // 충분한 정보가 수집되면 조기 종료
          if (result.confidence > 0.7) {
            console.log(`🎯 높은 신뢰도 달성 - 조기 종료: ${gym.name}`)
            break
          }
        }
        
        // 검색 엔진 간 지연
        if (i < this.searchEngines.length - 1) {
          await this.delayBetweenEngines()
        }
        
      } catch (error) {
        console.warn(`❌ 검색 엔진 실패: ${engine.constructor.name}`, error)
        
        // 403 에러인 경우 더 긴 지연
        if (AntiDetectionUtils.is403Error(error)) {
          console.log(`🚫 403 에러 감지 - 긴 지연 후 계속`)
          await AntiDetectionUtils.delayAfter403Error()
        }
        continue
      }
    }
    
    if (searchResults.length === 0) {
      console.warn(`⚠️ 모든 검색 엔진 실패: ${gym.name}`)
      return this.createFallbackResult(gym)
    }
    
    // 교차 검증 실행
    const validatedResult = this.crossValidator.crossValidateResults(searchResults, gym)
    
    console.log(`✅ 최적화된 크롤링 성공: ${gym.name} (소스: ${validatedResult.source}, 신뢰도: ${validatedResult.confidence})`)
    
    return validatedResult
  }

  /**
   * 검색 엔진 간 지연
   */
  private async delayBetweenEngines(): Promise<void> {
    const config = this.configManager.getAntiDetectionConfig()
    const delay = config.minDelay + Math.random() * (config.maxDelay - config.minDelay)
    console.log(`⏳ 검색 엔진 간 ${Math.round(delay)}ms 대기`)
    await new Promise(resolve => setTimeout(resolve, delay))
  }

  /**
   * 지연 실행
   */
  private async delayExecution(): Promise<void> {
    const config = this.configManager.getConfig()
    await new Promise(resolve => setTimeout(resolve, config.delay))
  }

  /**
   * 검색 엔진 목록 반환 (테스트용)
   */
  getSearchEngines(): BaseSearchEngine[] {
    return this.searchEngines
  }

  /**
   * 폴백 결과 생성 (기본)
   */
  private createFallbackResult(gym: ProcessedGymData): EnhancedGymInfo {
    const fallbackConfig = this.configManager.getFallbackConfig()
    
    return {
      name: gym.name,
      address: gym.address,
      phone: gym.phone,
      rating: gym.rating,
      reviewCount: gym.reviewCount,
      openHour: gym.openHour,
      closeHour: gym.closeHour,
      price: gym.price,
      membershipPrice: gym.membershipPrice,
      ptPrice: gym.ptPrice,
      gxPrice: gym.gxPrice,
      dayPassPrice: gym.dayPassPrice,
      priceDetails: gym.priceDetails,
      minimumPrice: gym.minimumPrice,
      discountInfo: gym.discountInfo,
      facilities: this.normalizeFacilities(gym.facilities),
      services: gym.services,
      website: gym.website,
      instagram: gym.instagram,
      facebook: gym.facebook,
      source: 'gyms_raw_fallback',
      confidence: fallbackConfig.fallbackConfidence,
      type: 'private'
    }
  }

  /**
   * facilities 필드를 string[]로 변환하는 헬퍼 함수
   */
  private normalizeFacilities(facilities: string | string[] | undefined): string[] {
    if (!facilities) return ['기본 헬스장']
    if (Array.isArray(facilities)) return facilities
    return [String(facilities)]
  }

  /**
   * 가격 정보 추출 (외부에서 사용 가능)
   */
  extractPriceInfo(text: string) {
    return this.priceExtractor.extractPriceInfo(text)
  }

  /**
   * 교차 검증 (외부에서 사용 가능)
   */
  crossValidate(results: EnhancedGymInfo[], originalGym: any) {
    return this.crossValidator.crossValidateResults(results, originalGym)
  }

  /**
   * 성능 통계 반환
   */
  getPerformanceStats() {
    return this.performanceMonitor.getStats()
  }

  /**
   * 성능 리포트 생성
   */
  generatePerformanceReport(): string {
    return this.performanceMonitor.generatePerformanceReport()
  }

  /**
   * 통계 리셋
   */
  resetStats() {
    this.performanceMonitor.reset()
    console.log('📊 성능 통계가 리셋되었습니다.')
  }

  /**
   * 배치 크기 설정
   */
  setBatchSize(size: number) {
    this.batchProcessor.setBatchSize(size)
  }

  /**
   * 최대 연속 실패 횟수 설정
   */
  setMaxConsecutiveFailures(maxFailures: number) {
    this.batchProcessor.setMaxConsecutiveFailures(maxFailures)
  }

  /**
   * 설정 관리자 반환
   */
  getConfigManager(): CrawlingConfigManager {
    return this.configManager
  }

  /**
   * 성능 모니터 반환
   */
  getPerformanceMonitor(): PerformanceMonitor {
    return this.performanceMonitor
  }

  /**
   * 배치 프로세서 반환
   */
  getBatchProcessor(): BatchProcessor {
    return this.batchProcessor
  }
}