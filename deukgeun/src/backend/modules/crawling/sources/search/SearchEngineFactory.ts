/**
 * 검색 엔진 팩토리
 * 모든 검색 엔진을 통합 관리하고 중복 코드를 제거하여 성능 최적화
 */

import { BaseSearchEngine } from './BaseSearchEngine'
import { NaverCafeSearchEngine } from './NaverCafeSearchEngine'
import { NaverSearchEngine } from './NaverSearchEngine'
import { GoogleSearchEngine } from './GoogleSearchEngine'
import { DaumSearchEngine } from './DaumSearchEngine'
import { NaverBlogSearchEngine } from './NaverBlogSearchEngine'
import { EnhancedGymInfo } from '@backend/modules/crawling/types/CrawlingTypes'

export interface SearchEngineConfig {
  timeout: number
  delay: number
  maxRetries: number
  enableParallel: boolean
  maxConcurrent: number
}

export interface SearchResult {
  engine: string
  data: EnhancedGymInfo | null
  confidence: number
  processingTime: number
  error?: string
}

export class SearchEngineFactory {
  private engines: Map<string, BaseSearchEngine> = new Map()
  private config: SearchEngineConfig
  private requestQueue: Array<() => Promise<void>> = []
  private activeRequests = 0

  constructor(config: Partial<SearchEngineConfig> = {}) {
    this.config = {
      timeout: 45000, // 타임아웃 증가
      delay: 2000,    // 기본 지연 시간 증가
      maxRetries: 3,
      enableParallel: false, // 병렬 실행 비활성화 (403 에러 방지)
      maxConcurrent: 1,      // 동시 요청 수 최소화
      ...config
    }

    this.initializeEngines()
  }

  /**
   * 검색 엔진 초기화
   */
  private initializeEngines(): void {
    const engineConfig = {
      timeout: this.config.timeout,
      delay: this.config.delay
    }

    // 네이버 카페 검색 엔진에 더 긴 지연 시간 적용
    this.engines.set('naver_cafe', new NaverCafeSearchEngine(engineConfig.timeout, 3000))
    this.engines.set('naver', new NaverSearchEngine(engineConfig.timeout, engineConfig.delay))
    this.engines.set('google', new GoogleSearchEngine(engineConfig.timeout, engineConfig.delay))
    this.engines.set('daum', new DaumSearchEngine(engineConfig.timeout, engineConfig.delay))
    this.engines.set('naver_blog', new NaverBlogSearchEngine(engineConfig.timeout, engineConfig.delay))
  }

  /**
   * 통합 검색 실행 (모든 엔진 병렬 실행)
   */
  async searchAll(gymName: string, address?: string): Promise<SearchResult[]> {
    const startTime = Date.now()
    console.log(`🔍 통합 검색 시작: ${gymName} ${address ? `(${address})` : ''}`)

    if (this.config.enableParallel) {
      return this.searchParallel(gymName, address)
    } else {
      return this.searchSequential(gymName, address)
    }
  }

  /**
   * 병렬 검색 실행
   */
  private async searchParallel(gymName: string, address?: string): Promise<SearchResult[]> {
    const searchPromises = Array.from(this.engines.entries()).map(async ([engineName, engine]) => {
      return this.executeSearchWithRetry(engineName, engine, gymName, address)
    })

    const results = await Promise.allSettled(searchPromises)
    
    return results.map((result, index) => {
      const engineName = Array.from(this.engines.keys())[index]
      
      if (result.status === 'fulfilled') {
        return result.value
      } else {
        return {
          engine: engineName,
          data: null,
          confidence: 0,
          processingTime: 0,
          error: result.reason?.message || 'Unknown error'
        }
      }
    })
  }

  /**
   * 순차 검색 실행
   */
  private async searchSequential(gymName: string, address?: string): Promise<SearchResult[]> {
    const results: SearchResult[] = []

    for (const [engineName, engine] of this.engines) {
      const result = await this.executeSearchWithRetry(engineName, engine, gymName, address)
      results.push(result)
      
      // 요청 간 지연
      if (this.config.delay > 0) {
        await this.delay(this.config.delay)
      }
    }

    return results
  }

  /**
   * 재시도 로직이 포함된 검색 실행
   */
  private async executeSearchWithRetry(
    engineName: string, 
    engine: BaseSearchEngine, 
    gymName: string, 
    address?: string
  ): Promise<SearchResult> {
    const startTime = Date.now()
    let lastError: Error | null = null

    for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
      try {
        console.log(`🔍 ${engineName} 검색 시도 ${attempt}/${this.config.maxRetries}: ${gymName}`)
        
        const data = await engine.search(gymName, address)
        const processingTime = Date.now() - startTime
        
        if (data) {
          console.log(`✅ ${engineName} 검색 성공: ${gymName} (${processingTime}ms)`)
          return {
            engine: engineName,
            data,
            confidence: data.confidence || 0.5,
            processingTime
          }
        } else {
          console.log(`⚠️ ${engineName} 검색 결과 없음: ${gymName}`)
        }
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))
        console.warn(`❌ ${engineName} 검색 실패 (시도 ${attempt}/${this.config.maxRetries}): ${gymName}`, lastError.message)
        
        if (attempt < this.config.maxRetries) {
          const delay = this.config.delay * attempt // 지수 백오프
          await this.delay(delay)
        }
      }
    }

    const processingTime = Date.now() - startTime
    return {
      engine: engineName,
      data: null,
      confidence: 0,
      processingTime,
      error: lastError?.message || 'Max retries exceeded'
    }
  }

  /**
   * 최적화된 검색 (신뢰도 기반 조기 종료)
   */
  async searchOptimized(gymName: string, address?: string, minConfidence = 0.8): Promise<SearchResult[]> {
    const startTime = Date.now()
    console.log(`🔍 최적화된 검색 시작: ${gymName} (최소 신뢰도: ${minConfidence})`)

    const results: SearchResult[] = []
    const searchPromises = new Map<string, Promise<SearchResult>>()

    // 모든 엔진에 대해 검색 시작
    for (const [engineName, engine] of this.engines) {
      const promise = this.executeSearchWithRetry(engineName, engine, gymName, address)
      searchPromises.set(engineName, promise)
    }

    // 결과를 순차적으로 확인하며 조기 종료
    for (const [engineName, promise] of searchPromises) {
      try {
        const result = await promise
        
        if (result.data && result.confidence >= minConfidence) {
          console.log(`🎯 ${engineName}에서 충분한 신뢰도 달성 (${result.confidence}), 조기 종료`)
          
          // 나머지 요청 취소 (실제로는 완료될 때까지 기다림)
          results.push(result)
          break
        } else {
          results.push(result)
        }
      } catch (error) {
        console.warn(`❌ ${engineName} 검색 실패:`, error)
        results.push({
          engine: engineName,
          data: null,
          confidence: 0,
          processingTime: 0,
          error: error instanceof Error ? error.message : String(error)
        })
      }
    }

    const totalTime = Date.now() - startTime
    console.log(`✅ 최적화된 검색 완료: ${results.length}개 결과 (${totalTime}ms)`)
    
    return results
  }

  /**
   * 특정 엔진만 검색
   */
  async searchWithEngine(engineName: string, gymName: string, address?: string): Promise<SearchResult> {
    const engine = this.engines.get(engineName)
    if (!engine) {
      throw new Error(`검색 엔진을 찾을 수 없습니다: ${engineName}`)
    }

    return this.executeSearchWithRetry(engineName, engine, gymName, address)
  }

  /**
   * 검색 결과 통합 및 최적화
   */
  mergeSearchResults(results: SearchResult[]): EnhancedGymInfo | null {
    if (results.length === 0) return null

    // 유효한 결과만 필터링
    const validResults = results.filter(result => result.data && result.confidence > 0)
    if (validResults.length === 0) return null

    // 신뢰도 기준으로 정렬
    validResults.sort((a, b) => b.confidence - a.confidence)

    // 가장 신뢰도가 높은 결과를 기본으로 사용
    const bestResult = validResults[0].data!
    const mergedInfo: EnhancedGymInfo = { ...bestResult }

    // 다른 결과에서 누락된 정보 보완
    for (let i = 1; i < validResults.length; i++) {
      const result = validResults[i].data!
      
      // 누락된 필드 보완
      if (!mergedInfo.phone && result.phone) mergedInfo.phone = result.phone
      if (!mergedInfo.openHour && result.openHour) mergedInfo.openHour = result.openHour
      if (!mergedInfo.closeHour && result.closeHour) mergedInfo.closeHour = result.closeHour
      if (!mergedInfo.price && result.price) mergedInfo.price = result.price
      if (!mergedInfo.rating && result.rating) mergedInfo.rating = result.rating
      if (!mergedInfo.website && result.website) mergedInfo.website = result.website
      
      // 시설 정보 병합
      if (result.facilities && result.facilities.length > 0) {
        const existingFacilities = mergedInfo.facilities || []
        const newFacilities = result.facilities.filter(f => !existingFacilities.includes(f))
        mergedInfo.facilities = [...existingFacilities, ...newFacilities]
      }
      
      // 서비스 정보 병합
      if (result.services && result.services.length > 0) {
        const existingServices = mergedInfo.services || []
        const newServices = result.services.filter(s => !existingServices.includes(s))
        mergedInfo.services = [...existingServices, ...newServices]
      }
    }

    // 통합된 소스 정보
    const sources = validResults.map(r => r.engine).join(' + ')
    mergedInfo.source = sources

    // 평균 신뢰도 계산
    const avgConfidence = validResults.reduce((sum, r) => sum + r.confidence, 0) / validResults.length
    mergedInfo.confidence = Math.min(avgConfidence, 1.0)

    console.log(`🔄 검색 결과 통합 완료: ${validResults.length}개 엔진, 신뢰도 ${mergedInfo.confidence.toFixed(2)}`)
    
    return mergedInfo
  }

  /**
   * 검색 통계 생성
   */
  generateSearchStats(results: SearchResult[]): {
    totalEngines: number
    successfulSearches: number
    failedSearches: number
    averageConfidence: number
    averageProcessingTime: number
    engineStats: Record<string, {
      success: boolean
      confidence: number
      processingTime: number
      error?: string
    }>
  } {
    const stats = {
      totalEngines: results.length,
      successfulSearches: 0,
      failedSearches: 0,
      averageConfidence: 0,
      averageProcessingTime: 0,
      engineStats: {} as Record<string, any>
    }

    let totalConfidence = 0
    let totalProcessingTime = 0

    for (const result of results) {
      const isSuccess = result.data !== null
      
      if (isSuccess) {
        stats.successfulSearches++
        totalConfidence += result.confidence
      } else {
        stats.failedSearches++
      }
      
      totalProcessingTime += result.processingTime
      
      stats.engineStats[result.engine] = {
        success: isSuccess,
        confidence: result.confidence,
        processingTime: result.processingTime,
        error: result.error
      }
    }

    stats.averageConfidence = stats.successfulSearches > 0 ? totalConfidence / stats.successfulSearches : 0
    stats.averageProcessingTime = totalProcessingTime / results.length

    return stats
  }

  /**
   * 지연 실행
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * 설정 업데이트
   */
  updateConfig(newConfig: Partial<SearchEngineConfig>): void {
    this.config = { ...this.config, ...newConfig }
    
    // 엔진 재초기화
    this.initializeEngines()
  }

  /**
   * 사용 가능한 엔진 목록
   */
  getAvailableEngines(): string[] {
    return Array.from(this.engines.keys())
  }

  /**
   * 엔진 상태 확인
   */
  async checkEngineHealth(): Promise<Record<string, boolean>> {
    const health: Record<string, boolean> = {}
    
    for (const [engineName, engine] of this.engines) {
      try {
        // 간단한 테스트 검색으로 엔진 상태 확인
        const testResult = await engine.search('테스트', '서울')
        health[engineName] = true
      } catch (error) {
        health[engineName] = false
        console.warn(`❌ ${engineName} 엔진 상태 불량:`, error)
      }
    }
    
    return health
  }

  /**
   * 팩토리 정리
   */
  cleanup(): void {
    this.engines.clear()
    this.requestQueue = []
    this.activeRequests = 0
  }
}
