import { EnhancedGymInfo, ProcessedGymData } from '../types/CrawlingTypes'
import { BaseSearchEngine } from './search/BaseSearchEngine'
import { NaverSearchEngine } from './search/NaverSearchEngine'
import { GoogleSearchEngine } from './search/GoogleSearchEngine'
import { DaumSearchEngine } from './search/DaumSearchEngine'
import { NaverBlogSearchEngine } from './search/NaverBlogSearchEngine'
import { NaverCafeSearchEngine } from './search/NaverCafeSearchEngine'
import { CrossValidator } from '../processors/CrossValidator'
import { PriceExtractor } from '../processors/PriceExtractor'

/**
 * 최적화된 헬스장 크롤링 소스
 */
export class OptimizedGymCrawlingSource {
  private searchEngines: BaseSearchEngine[]
  private crossValidator: CrossValidator
  private priceExtractor: PriceExtractor
  private timeout: number
  private delay: number

  constructor(timeout: number = 30000, delay: number = 1000) {
    this.timeout = timeout
    this.delay = delay
    
    // 검색 엔진 초기화
    this.searchEngines = [
      new NaverSearchEngine(timeout, delay),
      new GoogleSearchEngine(timeout, delay),
      new DaumSearchEngine(timeout, delay),
      new NaverBlogSearchEngine(timeout, delay),
      new NaverCafeSearchEngine(timeout, delay)
    ]
    
    this.crossValidator = new CrossValidator()
    this.priceExtractor = new PriceExtractor()
  }

  /**
   * 헬스장 데이터 크롤링
   */
  async crawlGymsFromRawData(gyms: ProcessedGymData[]): Promise<EnhancedGymInfo[]> {
    console.log(`🚀 최적화된 헬스장 크롤링 시작: ${gyms.length}개 헬스장`)
    
    const results: EnhancedGymInfo[] = []
    
    for (let i = 0; i < gyms.length; i++) {
      const gym = gyms[i]
      console.log(`🔍 최적화된 크롤링 중: ${gym.name} (${i + 1}/${gyms.length})`)
      
      try {
        const crawledResult = await this.crawlSingleGym(gym)
        results.push(crawledResult)
        
        // 지연 실행
        if (i < gyms.length - 1) {
          await this.delayExecution()
        }
      } catch (error) {
        console.error(`크롤링 실패: ${gym.name}`, error)
        results.push(this.createFallbackResult(gym))
      }
    }
    
    console.log(`✅ 최적화된 헬스장 크롤링 완료: ${results.length}개 처리`)
    return results
  }

  /**
   * 단일 헬스장 크롤링
   */
  private async crawlSingleGym(gym: ProcessedGymData): Promise<EnhancedGymInfo> {
    const searchResults: EnhancedGymInfo[] = []
    
    // 모든 검색 엔진에서 병렬 검색
    const searchPromises = this.searchEngines.map(async (engine) => {
      try {
        const result = await engine.search(gym.name, gym.address)
        return result
      } catch (error) {
        console.warn(`검색 엔진 실패: ${engine.constructor.name}`, error)
        return null
      }
    })
    
    const searchResultsArray = await Promise.all(searchPromises)
    const validResults = searchResultsArray.filter(result => result !== null) as EnhancedGymInfo[]
    
    if (validResults.length === 0) {
      console.warn(`모든 검색 엔진 실패: ${gym.name}`)
      return this.createFallbackResult(gym)
    }
    
    // 교차 검증 실행
    const validatedResult = this.crossValidator.crossValidateResults(validResults, gym)
    
    console.log(`✅ 최적화된 크롤링 성공: ${gym.name} (소스: ${validatedResult.source}, 신뢰도: ${validatedResult.confidence})`)
    
    return validatedResult
  }

  /**
   * 지연 실행
   */
  private async delayExecution(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, this.delay))
  }

  /**
   * 폴백 결과 생성
   */
  private createFallbackResult(gym: ProcessedGymData): EnhancedGymInfo {
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
      facilities: Array.isArray(gym.facilities) ? gym.facilities : (gym.facilities ? [gym.facilities] : []),
      services: gym.services,
      website: gym.website,
      instagram: gym.instagram,
      facebook: gym.facebook,
      source: 'gyms_raw_fallback',
      confidence: 0.5,
      type: 'private'
    }
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
}
