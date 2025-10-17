/**
 * 최적화된 크롤링 서비스
 * 성능 최적화, 중복 제거, 메모리 효율성을 고려한 통합 크롤링 서비스
 */

import { Repository } from 'typeorm'
import { Gym } from '@backend/entities/Gym'
import { PublicApiSource } from '@backend/modules/crawling/sources/PublicApiSource'
import { SearchEngineFactory } from '@backend/modules/crawling/sources/search/SearchEngineFactory'
import { UnifiedDataMerger } from '@backend/modules/crawling/processors/UnifiedDataMerger'
import { DataValidator } from '@backend/modules/crawling/processors/DataValidator'
import { CrawlingHistoryTracker } from '@backend/modules/crawling/tracking/CrawlingHistoryTracker'
import { 
  ProcessedGymData, 
  CrawlingResult, 
  CrawlingConfig, 
  CrawlingStatus,
  CrawlingOptions 
} from '@backend/modules/crawling/types/CrawlingTypes'

export interface OptimizedCrawlingConfig extends CrawlingConfig {
  // 성능 최적화 설정
  enableCaching: boolean
  cacheSize: number
  enableParallelProcessing: boolean
  maxConcurrentRequests: number
  batchSize: number
  memoryOptimization: boolean
  
  // 검색 엔진 설정
  searchEngines: string[]
  minSearchConfidence: number
  enableEarlyTermination: boolean
  
  // 데이터 처리 설정
  enableDataDeduplication: boolean
  enableQualityFiltering: boolean
  qualityThreshold: number
}

export class OptimizedCrawlingService {
  private gymRepo: Repository<Gym>
  private publicApiSource: PublicApiSource
  private searchEngineFactory: SearchEngineFactory
  private unifiedDataMerger: UnifiedDataMerger
  private dataValidator: DataValidator
  private historyTracker: CrawlingHistoryTracker
  private config: OptimizedCrawlingConfig
  private status: CrawlingStatus
  private cache: Map<string, ProcessedGymData> = new Map()
  private processingQueue: Array<() => Promise<void>> = []
  private activeProcesses = 0

  constructor(gymRepo: Repository<Gym>) {
    this.gymRepo = gymRepo
    this.publicApiSource = new PublicApiSource()
    this.searchEngineFactory = new SearchEngineFactory({
      timeout: 30000,
      delay: 1000,
      maxRetries: 3,
      enableParallel: true,
      maxConcurrent: 3
    })
    this.unifiedDataMerger = new UnifiedDataMerger()
    this.dataValidator = new DataValidator()
    this.historyTracker = new CrawlingHistoryTracker()
    
    this.config = {
      // 기본 크롤링 설정
      enablePublicApi: true,
      enableCrawling: true,
      enableDataMerging: true,
      enableQualityCheck: true,
      batchSize: 5,
      maxConcurrentRequests: 3,
      delayBetweenBatches: 5000,
      maxRetries: 3,
      timeout: 30000,
      saveToFile: true,
      saveToDatabase: true,
      
      // 성능 최적화 설정
      enableCaching: true,
      cacheSize: 1000,
      enableParallelProcessing: true,
      memoryOptimization: true,
      
      // 검색 엔진 설정
      searchEngines: ['naver_cafe', 'naver', 'google', 'daum'],
      minSearchConfidence: 0.7,
      enableEarlyTermination: true,
      
      // 데이터 처리 설정
      enableDataDeduplication: true,
      enableQualityFiltering: true,
      qualityThreshold: 0.7
    }

    this.status = {
      isRunning: false,
      currentStep: '',
      progress: { current: 0, total: 0, percentage: 0 },
      startTime: null,
      estimatedCompletion: null,
      errors: []
    }
  }

  /**
   * 최적화된 통합 크롤링 실행
   */
  async executeOptimizedCrawling(): Promise<CrawlingResult> {
    if (this.status.isRunning) {
      throw new Error('크롤링이 이미 실행 중입니다.')
    }

    this.status.isRunning = true
    this.status.startTime = new Date()
    this.status.currentStep = '최적화된 크롤링 시작'

    const result: CrawlingResult = {
      success: false,
      totalGyms: 0,
      publicApiGyms: 0,
      crawlingGyms: 0,
      mergedGyms: 0,
      duration: 0,
      processingTime: 0,
      errors: [],
      warnings: [],
      dataQuality: {
        average: 0,
        min: 0,
        max: 0,
        distribution: {}
      }
    }

    const startTime = Date.now()

    try {
      console.log('🚀 최적화된 크롤링 시작')
      
      // 1. 공공 API 데이터 수집 (최적화된 버전)
      if (this.config.enablePublicApi) {
        this.status.currentStep = '공공 API 데이터 수집 (최적화)'
        const publicApiData = await this.collectFromPublicAPIOptimized()
        result.publicApiGyms = publicApiData.length
        
        console.log(`✅ 공공 API 수집 완료: ${publicApiData.length}개 헬스장`)
        
        if (this.config.saveToFile) {
          await this.saveToGymsRawOptimized(publicApiData)
        }
      }

      // 2. 최적화된 웹 크롤링
      if (this.config.enableCrawling) {
        this.status.currentStep = '최적화된 웹 크롤링'
        const crawlingResults = await this.crawlGymsOptimized()
        result.crawlingGyms = crawlingResults.length
        
        console.log(`✅ 최적화된 크롤링 완료: ${crawlingResults.length}개 헬스장`)
        
        if (this.config.saveToFile && crawlingResults.length > 0) {
          await this.mergeAndSaveOptimized(crawlingResults)
        }
      }

      // 3. 데이터 품질 검사 (최적화된 버전)
      if (this.config.enableQualityCheck) {
        this.status.currentStep = '데이터 품질 검사 (최적화)'
        const qualityResult = await this.checkDataQualityOptimized()
        result.dataQuality = {
          average: qualityResult.averageConfidence,
          min: 0,
          max: 1,
          distribution: qualityResult.distribution
        }
      }

      // 4. 최종 결과 계산
      result.totalGyms = result.publicApiGyms + result.crawlingGyms
      result.mergedGyms = result.totalGyms
      result.duration = Date.now() - startTime
      result.processingTime = result.duration
      result.success = true

      console.log(`🎉 최적화된 크롤링 완료: ${result.totalGyms}개 헬스장 (${result.processingTime}ms)`)
      
      // 히스토리 기록
      this.historyTracker.recordNameCrawling(this.status)
      
    } catch (error) {
      console.error('❌ 최적화된 크롤링 실패:', error)
      result.success = false
      this.status.errors.push(
        error instanceof Error ? error.message : String(error)
      )
    } finally {
      this.status.isRunning = false
      this.status.currentStep = '완료'
    }

    return result
  }

  /**
   * 최적화된 공공 API 데이터 수집
   */
  private async collectFromPublicAPIOptimized(): Promise<ProcessedGymData[]> {
    console.log('🔄 최적화된 공공 API 데이터 수집 시작')
    
    try {
      const rawData = await this.publicApiSource.collectData()
      
      // 병렬 데이터 처리
      const batchSize = this.config.batchSize
      const batches = this.createBatches(rawData, batchSize)
      const processedBatches: ProcessedGymData[][] = []
      
      for (const batch of batches) {
        const processedBatch = await Promise.all(
          batch.map(data => this.processPublicApiData(data))
        )
        processedBatches.push(processedBatch)
      }
      
      const processedData = processedBatches.flat()
      
      // 캐시에 저장
      if (this.config.enableCaching) {
        this.updateCache(processedData)
      }
      
      console.log(`✅ 최적화된 공공 API 처리 완료: ${processedData.length}개`)
      return processedData
      
    } catch (error) {
      console.error('❌ 최적화된 공공 API 수집 실패:', error)
      throw error
    }
  }

  /**
   * 최적화된 웹 크롤링
   */
  private async crawlGymsOptimized(): Promise<ProcessedGymData[]> {
    console.log('🔄 최적화된 웹 크롤링 시작')
    
    try {
      // gyms_raw.json에서 데이터 읽기
      const gymsRawData = await this.readGymsRawData()
      if (!gymsRawData || gymsRawData.length === 0) {
        console.log('⚠️ gyms_raw.json 데이터가 없습니다.')
        return []
      }

      // 배치 단위로 크롤링 처리
      const batchSize = this.config.batchSize
      const batches = this.createBatches(gymsRawData, batchSize)
      const allResults: ProcessedGymData[] = []
      
      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i]
        console.log(`🔄 배치 ${i + 1}/${batches.length} 처리 중 (${batch.length}개 헬스장)`)
        
        // 병렬 크롤링 (동시 요청 수 제한)
        const batchResults = await this.processBatchOptimized(batch)
        allResults.push(...batchResults)
        
        // 배치 간 지연
        if (i < batches.length - 1 && this.config.delayBetweenBatches > 0) {
          await this.delay(this.config.delayBetweenBatches)
        }
        
        // 진행률 업데이트
        this.updateProgress(i + 1, batches.length)
      }
      
      console.log(`✅ 최적화된 웹 크롤링 완료: ${allResults.length}개 헬스장`)
      return allResults
      
    } catch (error) {
      console.error('❌ 최적화된 웹 크롤링 실패:', error)
      throw error
    }
  }

  /**
   * 최적화된 배치 처리
   */
  private async processBatchOptimized(batch: any[]): Promise<ProcessedGymData[]> {
    const results: ProcessedGymData[] = []
    const semaphore = new Semaphore(this.config.maxConcurrentRequests)
    
    const promises = batch.map(async (gym) => {
      return semaphore.acquire(async () => {
        try {
          // 캐시 확인
          const cacheKey = this.generateCacheKey(gym.name, gym.address)
          if (this.config.enableCaching && this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey)!
            console.log(`📋 캐시에서 데이터 반환: ${gym.name}`)
            return cached
          }
          
          // 검색 엔진 팩토리를 통한 통합 검색
          const searchResults = await this.searchEngineFactory.searchOptimized(
            gym.name,
            gym.address,
            this.config.minSearchConfidence
          )
          
          // 검색 결과 통합
          const mergedSearchResult = this.searchEngineFactory.mergeSearchResults(searchResults)
          
          if (mergedSearchResult) {
            // EnhancedGymInfo를 ProcessedGymData로 변환
            const processedData = this.convertEnhancedGymInfoToProcessedGymData(
              mergedSearchResult,
              gym
            )
            
            // 캐시에 저장
            if (this.config.enableCaching) {
              this.cache.set(cacheKey, processedData)
            }
            
            return processedData
          } else {
            console.log(`⚠️ 검색 결과 없음: ${gym.name}`)
            return null
          }
          
        } catch (error) {
          console.error(`❌ 크롤링 실패: ${gym.name}`, error)
          return null
        }
      })
    })
    
    const batchResults = await Promise.all(promises)
    const validResults = batchResults.filter((result): result is ProcessedGymData => result !== null)
    results.push(...validResults)
    
    return results
  }

  /**
   * 최적화된 데이터 병합 및 저장
   */
  private async mergeAndSaveOptimized(crawlingResults: ProcessedGymData[]): Promise<void> {
    console.log('🔄 최적화된 데이터 병합 및 저장 시작')
    
    try {
      // gyms_raw.json에서 기존 데이터 읽기
      const existingData = await this.readGymsRawData()
      
      // 통합 데이터 병합기 사용
      const mergeResult = await this.unifiedDataMerger.mergeGymDataWithCrawling(
        existingData,
        crawlingResults
      )
      
      console.log(`✅ 최적화된 병합 완료: ${mergeResult.mergedData.length}개 헬스장`)
      console.log(`📊 통계: 성공 ${mergeResult.statistics.successfullyMerged}개, 폴백 ${mergeResult.statistics.fallbackUsed}개`)
      console.log(`⏱️ 처리 시간: ${mergeResult.statistics.processingTime}ms`)
      
      // 최적화된 저장
      await this.saveToGymsRawOptimized(mergeResult.mergedData)
      
    } catch (error) {
      console.error('❌ 최적화된 데이터 병합 실패:', error)
      throw error
    }
  }

  /**
   * 최적화된 데이터 품질 검사
   */
  private async checkDataQualityOptimized(): Promise<{
    averageConfidence: number
    completenessScore: number
    accuracyScore: number
    distribution: Record<string, number>
  }> {
    console.log('🔄 최적화된 데이터 품질 검사 시작')
    
    try {
      const gymsData = await this.readGymsRawData()
      
      let totalConfidence = 0
      let totalCompleteness = 0
      let totalAccuracy = 0
      let validCount = 0
      
      const distribution: Record<string, number> = {}
      
      for (const gym of gymsData) {
        if (this.dataValidator.validateGymData(gym)) {
          totalConfidence += gym.confidence || 0.5
          totalCompleteness += this.calculateCompleteness(gym)
          totalAccuracy += this.calculateAccuracy(gym)
          validCount++
          
          // 분포 계산
          const serviceType = gym.serviceType || 'unknown'
          distribution[serviceType] = (distribution[serviceType] || 0) + 1
        }
      }
      
      const result = {
        averageConfidence: validCount > 0 ? totalConfidence / validCount : 0,
        completenessScore: validCount > 0 ? totalCompleteness / validCount : 0,
        accuracyScore: validCount > 0 ? totalAccuracy / validCount : 0,
        distribution
      }
      
      console.log(`✅ 최적화된 품질 검사 완료: 신뢰도 ${result.averageConfidence.toFixed(2)}`)
      return result
      
    } catch (error) {
      console.error('❌ 최적화된 품질 검사 실패:', error)
      throw error
    }
  }

  /**
   * EnhancedGymInfo를 ProcessedGymData로 변환
   */
  private convertEnhancedGymInfoToProcessedGymData(enhancedInfo: any, originalGym?: any): ProcessedGymData {
    return {
      ...originalGym,
      
      // 크롤링에서 추출된 정보만 추가 (기존 값이 없을 때만)
      rating: originalGym?.rating || enhancedInfo.rating,
      reviewCount: originalGym?.reviewCount || enhancedInfo.reviewCount,
      openHour: originalGym?.openHour || enhancedInfo.openHour,
      closeHour: originalGym?.closeHour || enhancedInfo.closeHour,
      price: originalGym?.price || enhancedInfo.price,
      membershipPrice: originalGym?.membershipPrice || enhancedInfo.membershipPrice,
      ptPrice: originalGym?.ptPrice || enhancedInfo.ptPrice,
      gxPrice: originalGym?.gxPrice || enhancedInfo.gxPrice,
      dayPassPrice: originalGym?.dayPassPrice || enhancedInfo.dayPassPrice,
      priceDetails: originalGym?.priceDetails || enhancedInfo.priceDetails,
      minimumPrice: originalGym?.minimumPrice || enhancedInfo.minimumPrice,
      discountInfo: originalGym?.discountInfo || enhancedInfo.discountInfo,
      facilities: this.mergeArrays(originalGym?.facilities, enhancedInfo.facilities),
      services: this.mergeArrays(originalGym?.services, enhancedInfo.services),
      website: originalGym?.website || enhancedInfo.website,
      instagram: originalGym?.instagram || enhancedInfo.instagram,
      facebook: originalGym?.facebook || enhancedInfo.facebook,
      
      // 메타데이터 업데이트
      source: this.mergeSources(originalGym?.source, enhancedInfo.source),
      confidence: Math.max(originalGym?.confidence || 0.5, enhancedInfo.confidence),
      serviceType: originalGym?.serviceType || this.determineServiceType(enhancedInfo.name),
      isCurrentlyOpen: originalGym?.isCurrentlyOpen !== undefined ? originalGym.isCurrentlyOpen : true,
      updatedAt: new Date().toISOString(),
      crawledAt: new Date().toISOString()
    }
  }

  /**
   * 배열 병합
   */
  private mergeArrays(original: any, crawled: any): string[] {
    const result = new Set<string>()
    
    if (original) {
      if (Array.isArray(original)) {
        original.forEach(item => item && result.add(item))
      } else if (typeof original === 'string') {
        result.add(original)
      }
    }
    
    if (crawled) {
      if (Array.isArray(crawled)) {
        crawled.forEach(item => item && result.add(item))
      } else if (typeof crawled === 'string') {
        result.add(crawled)
      }
    }
    
    return Array.from(result)
  }

  /**
   * 소스 정보 병합
   */
  private mergeSources(originalSource: any, crawledSource: any): string {
    const sources = new Set<string>()
    
    if (originalSource) sources.add(originalSource)
    if (crawledSource && crawledSource !== originalSource) sources.add(crawledSource)
    
    return Array.from(sources).join(' + ')
  }

  /**
   * 공공 API 데이터 처리
   */
  private async processPublicApiData(data: any): Promise<ProcessedGymData> {
    return {
      id: data.id,
      name: data.name,
      address: data.address,
      phone: data.phone,
      latitude: data.latitude,
      longitude: data.longitude,
      type: data.type,
      is24Hours: data.is24Hours,
      hasParking: data.hasParking,
      hasShower: data.hasShower,
      createdAt: data.createdAt,
      updatedAt: new Date().toISOString(),
      
      // 서울 공공 API 필드들
      businessStatus: data.businessStatus,
      businessType: data.businessType,
      detailBusinessType: data.detailBusinessType,
      cultureSportsType: data.cultureSportsType,
      managementNumber: data.managementNumber,
      approvalDate: data.approvalDate,
      siteArea: data.siteArea,
      postalCode: data.postalCode,
      sitePostalCode: data.sitePostalCode,
      siteAddress: data.siteAddress,
      roadAddress: data.roadAddress,
      roadPostalCode: data.roadPostalCode,
      insuranceCode: data.insuranceCode,
      leaderCount: data.leaderCount,
      buildingCount: data.buildingCount,
      buildingArea: data.buildingArea,
      
      // 메타데이터
      source: data.source || 'seoul_public_api',
      confidence: data.confidence || 0.8,
      serviceType: this.determineServiceType(data.name || 'Unknown'),
      isCurrentlyOpen: data.isCurrentlyOpen !== undefined ? data.isCurrentlyOpen : true,
      crawledAt: new Date().toISOString()
    }
  }

  /**
   * 완성도 계산
   */
  private calculateCompleteness(gym: any): number {
    let score = 0
    let factors = 0
    
    const requiredFields = ['name', 'address', 'phone']
    const optionalFields = ['rating', 'openHour', 'price', 'website']
    
    for (const field of requiredFields) {
      if (gym[field]) score += 0.3
      factors += 0.3
    }
    
    for (const field of optionalFields) {
      if (gym[field]) score += 0.1
      factors += 0.1
    }
    
    return factors > 0 ? score / factors : 0
  }

  /**
   * 정확도 계산
   */
  private calculateAccuracy(gym: any): number {
    let score = 0
    let factors = 0
    
    if (gym.confidence) {
      score += gym.confidence
      factors += 1
    }
    
    if (gym.rating && gym.rating >= 1 && gym.rating <= 5) {
      score += 0.8
      factors += 1
    }
    
    if (gym.reviewCount && gym.reviewCount > 0) {
      score += 0.7
      factors += 1
    }
    
    return factors > 0 ? score / factors : 0.5
  }

  /**
   * 서비스 타입 결정
   */
  private determineServiceType(gymName: string): string {
    const name = gymName.toLowerCase()
    
    if (name.includes('크로스핏') || name.includes('crossfit')) return '크로스핏'
    if (name.includes('pt') || name.includes('개인트레이닝')) return 'pt'
    if (name.includes('gx') || name.includes('그룹')) return 'gx'
    if (name.includes('요가') || name.includes('yoga')) return '요가'
    if (name.includes('필라테스') || name.includes('pilates')) return '필라테스'
    
    return 'gym'
  }

  /**
   * 캐시 업데이트
   */
  private updateCache(data: ProcessedGymData[]): void {
    if (!this.config.enableCaching) return
    
    for (const item of data) {
      const key = this.generateCacheKey(item.name, item.address)
      this.cache.set(key, item)
      
      // 캐시 크기 제한
      if (this.cache.size > this.config.cacheSize) {
        const firstKey = this.cache.keys().next().value
        if (firstKey) {
          this.cache.delete(firstKey)
        }
      }
    }
  }

  /**
   * 캐시 키 생성
   */
  private generateCacheKey(name: string, address: string): string {
    return `${name.toLowerCase().replace(/\s+/g, '')}-${address.toLowerCase().replace(/\s+/g, '')}`
  }

  /**
   * 배치 생성
   */
  private createBatches<T>(items: T[], batchSize: number): T[][] {
    const batches: T[][] = []
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize))
    }
    return batches
  }

  /**
   * 진행률 업데이트
   */
  private updateProgress(current: number, total: number): void {
    const percentage = Math.round((current / total) * 100)
    this.status.progress = { current, total, percentage }
    
    if (this.status.startTime) {
      const elapsed = Date.now() - this.status.startTime.getTime()
      const estimatedTotal = (elapsed / current) * total
      this.status.estimatedCompletion = new Date(this.status.startTime.getTime() + estimatedTotal)
    }
  }

  /**
   * 지연 실행
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * gyms_raw.json 읽기
   */
  private async readGymsRawData(): Promise<any[]> {
    try {
      const fs = await import('fs/promises')
      const path = await import('path')
      
      const filePath = path.join(process.cwd(), 'src', 'data', 'gyms_raw.json')
      const data = await fs.readFile(filePath, 'utf-8')
      return JSON.parse(data)
    } catch (error) {
      console.error('❌ gyms_raw.json 읽기 실패:', error)
      return []
    }
  }

  /**
   * 최적화된 gyms_raw.json 저장
   */
  private async saveToGymsRawOptimized(data: ProcessedGymData[]): Promise<void> {
    try {
      const fs = await import('fs/promises')
      const path = await import('path')
      
      const filePath = path.join(process.cwd(), 'src', 'data', 'gyms_raw.json')
      await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8')
      
      console.log(`💾 최적화된 저장 완료: ${data.length}개 헬스장`)
    } catch (error) {
      console.error('❌ 최적화된 저장 실패:', error)
      throw error
    }
  }

  /**
   * 설정 업데이트
   */
  updateConfig(newConfig: Partial<OptimizedCrawlingConfig>): void {
    this.config = { ...this.config, ...newConfig }
    
    // 검색 엔진 팩토리 설정 업데이트
    this.searchEngineFactory.updateConfig({
      timeout: this.config.timeout,
      delay: this.config.delayBetweenBatches,
      maxRetries: this.config.maxRetries,
      enableParallel: this.config.enableParallelProcessing,
      maxConcurrent: this.config.maxConcurrentRequests
    })
  }

  /**
   * 상태 조회
   */
  getStatus(): CrawlingStatus {
    return { ...this.status }
  }

  /**
   * 캐시 통계
   */
  getCacheStats(): { size: number; hitRate: number } {
    return {
      size: this.cache.size,
      hitRate: 0 // TODO: 히트율 계산 로직 추가
    }
  }

  /**
   * 메모리 정리
   */
  cleanup(): void {
    this.cache.clear()
    this.processingQueue = []
    this.activeProcesses = 0
    this.searchEngineFactory.cleanup()
    this.unifiedDataMerger.clearCache()
  }
}

/**
 * 세마포어 클래스 (동시 요청 수 제한)
 */
class Semaphore {
  private permits: number
  private waiting: Array<() => void> = []

  constructor(permits: number) {
    this.permits = permits
  }

  async acquire<T>(fn: () => Promise<T>): Promise<T> {
    await this.waitForPermit()
    
    try {
      return await fn()
    } finally {
      this.release()
    }
  }

  private async waitForPermit(): Promise<void> {
    if (this.permits > 0) {
      this.permits--
      return
    }

    return new Promise<void>((resolve) => {
      this.waiting.push(resolve)
    })
  }

  private release(): void {
    if (this.waiting.length > 0) {
      const resolve = this.waiting.shift()!
      resolve()
    } else {
      this.permits++
    }
  }
}
