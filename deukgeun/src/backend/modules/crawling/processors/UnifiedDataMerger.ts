/**
 * 통합 데이터 병합기
 * 모든 데이터 병합 로직을 하나로 통합하여 중복 제거 및 성능 최적화
 */

import { ProcessedGymData } from '../types/CrawlingTypes'

export interface UnifiedMergeResult {
  mergedData: ProcessedGymData[]
  statistics: {
    totalProcessed: number
    successfullyMerged: number
    fallbackUsed: number
    duplicatesRemoved: number
    qualityScore: number
    processingTime: number
  }
  conflicts: Array<{
    gymName: string
    field: string
    originalValue: any
    crawledValue: any
    resolution: 'original' | 'crawled' | 'merged'
  }>
}

export class UnifiedDataMerger {
  private readonly qualityThreshold = 0.7
  private readonly duplicateThreshold = 0.8
  private readonly cache = new Map<string, ProcessedGymData>()

  /**
   * 통합 데이터 병합 (모든 병합 로직 통합)
   */
  async mergeGymDataWithCrawling(
    originalData: any[],
    crawledData: ProcessedGymData[]
  ): Promise<UnifiedMergeResult> {
    const startTime = Date.now()
    
    console.log('🔄 통합 데이터 병합 시작')
    console.log(`📊 원본 데이터: ${originalData.length}개, 크롤링 데이터: ${crawledData.length}개`)

    const result: UnifiedMergeResult = {
      mergedData: [],
      statistics: {
        totalProcessed: 0,
        successfullyMerged: 0,
        fallbackUsed: 0,
        duplicatesRemoved: 0,
        qualityScore: 0,
        processingTime: 0
      },
      conflicts: []
    }

    try {
      // 1. 캐시 기반 중복 제거
      const deduplicatedData = this.deduplicateData(originalData, crawledData)
      result.statistics.duplicatesRemoved = originalData.length + crawledData.length - deduplicatedData.original.length - deduplicatedData.crawled.length

      // 2. 병렬 매칭 및 병합
      const matchedPairs = await this.matchGymsParallel(deduplicatedData.original, deduplicatedData.crawled)
      console.log(`🔗 매칭된 쌍: ${matchedPairs.length}개`)

      // 3. 배치 병합 처리
      const batchSize = 10
      const batches = this.createBatches(matchedPairs, batchSize)
      
      for (const batch of batches) {
        const batchResults = await Promise.all(
          batch.map(pair => this.mergeSingleGymOptimized(pair.original, pair.crawled))
        )
        
        for (const mergeResult of batchResults) {
          result.mergedData.push(mergeResult.merged)
          result.conflicts.push(...mergeResult.conflicts)
          
          if (mergeResult.merged.confidence >= this.qualityThreshold) {
            result.statistics.successfullyMerged++
          } else {
            result.statistics.fallbackUsed++
          }
        }
      }

      // 4. 매칭되지 않은 데이터 처리
      await this.processUnmatchedData(deduplicatedData, result)

      // 5. 통계 계산
      result.statistics.totalProcessed = result.mergedData.length
      result.statistics.qualityScore = this.calculateQualityScore(result.mergedData)
      result.statistics.processingTime = Date.now() - startTime

      console.log(`✅ 통합 병합 완료: ${result.mergedData.length}개 헬스장 (${result.statistics.processingTime}ms)`)
      
      return result
    } catch (error) {
      console.error('❌ 통합 병합 실패:', error)
      throw error
    }
  }

  /**
   * 캐시 기반 중복 제거
   */
  private deduplicateData(originalData: any[], crawledData: ProcessedGymData[]): {
    original: any[]
    crawled: ProcessedGymData[]
  } {
    const originalMap = new Map<string, any>()
    const crawledMap = new Map<string, ProcessedGymData>()

    // 원본 데이터 중복 제거
    for (const data of originalData) {
      const key = this.generateCacheKey(data.name, data.address)
      if (!originalMap.has(key)) {
        originalMap.set(key, data)
      }
    }

    // 크롤링 데이터 중복 제거
    for (const data of crawledData) {
      const key = this.generateCacheKey(data.name, data.address)
      if (!crawledMap.has(key)) {
        crawledMap.set(key, data)
      }
    }

    return {
      original: Array.from(originalMap.values()),
      crawled: Array.from(crawledMap.values())
    }
  }

  /**
   * 병렬 매칭 처리
   */
  private async matchGymsParallel(originalData: any[], crawledData: ProcessedGymData[]): Promise<Array<{
    original: any
    crawled: ProcessedGymData
  }>> {
    const matchedPairs: Array<{ original: any; crawled: ProcessedGymData }> = []
    const batchSize = 5

    // 배치 단위로 병렬 처리
    for (let i = 0; i < originalData.length; i += batchSize) {
      const batch = originalData.slice(i, i + batchSize)
      
      const batchMatches = await Promise.all(
        batch.map(original => this.findBestMatch(original, crawledData))
      )

      for (const match of batchMatches) {
        if (match) {
          matchedPairs.push(match)
        }
      }
    }

    return matchedPairs
  }

  /**
   * 최적화된 단일 헬스장 병합
   */
  private async mergeSingleGymOptimized(original: any, crawled: ProcessedGymData): Promise<{
    merged: ProcessedGymData
    conflicts: Array<{
      gymName: string
      field: string
      originalValue: any
      crawledValue: any
      resolution: 'original' | 'crawled' | 'merged'
    }>
  }> {
    const conflicts: Array<{
      gymName: string
      field: string
      originalValue: any
      crawledValue: any
      resolution: 'original' | 'crawled' | 'merged'
    }> = []

    // 기존 데이터 완전 보존 + 크롤링 정보 추가
    const merged: ProcessedGymData = {
      ...original, // 모든 기존 필드 보존
      
      // 메타데이터 업데이트
      updatedAt: new Date().toISOString(),
      
      // 크롤링 정보 추가 (기존 값이 없을 때만)
      rating: original.rating || crawled.rating,
      reviewCount: original.reviewCount || crawled.reviewCount,
      openHour: original.openHour || crawled.openHour,
      closeHour: original.closeHour || crawled.closeHour,
      price: original.price || crawled.price,
      membershipPrice: original.membershipPrice || crawled.membershipPrice,
      ptPrice: original.ptPrice || crawled.ptPrice,
      gxPrice: original.gxPrice || crawled.gxPrice,
      dayPassPrice: original.dayPassPrice || crawled.dayPassPrice,
      priceDetails: original.priceDetails || crawled.priceDetails,
      minimumPrice: original.minimumPrice || crawled.minimumPrice,
      discountInfo: original.discountInfo || crawled.discountInfo,
      
      // 시설 및 서비스 정보 병합
      facilities: this.mergeArrays(original.facilities, crawled.facilities),
      services: this.mergeArrays(original.services, crawled.services),
      
      // 소셜 미디어 및 웹사이트
      website: original.website || crawled.website,
      instagram: original.instagram || crawled.instagram,
      facebook: original.facebook || crawled.facebook,
      
      // 서비스 타입 및 상태 (기존 값 우선)
      hasGX: original.hasGX !== undefined ? original.hasGX : crawled.hasGX,
      hasPT: original.hasPT !== undefined ? original.hasPT : crawled.hasPT,
      hasGroupPT: original.hasGroupPT !== undefined ? original.hasGroupPT : crawled.hasGroupPT,
      is24Hours: original.is24Hours !== undefined ? original.is24Hours : crawled.is24Hours,
      hasParking: original.hasParking !== undefined ? original.hasParking : crawled.hasParking,
      hasShower: original.hasShower !== undefined ? original.hasShower : crawled.hasShower,
      
      // 메타데이터 업데이트
      source: this.mergeSources(original.source, crawled.source),
      confidence: Math.max(original.confidence || 0.5, crawled.confidence),
      serviceType: original.serviceType || this.determineServiceType(original.name || crawled.name),
      isCurrentlyOpen: original.isCurrentlyOpen !== undefined ? original.isCurrentlyOpen : true,
      crawledAt: new Date().toISOString(),
      
      // 기구 정보
      equipment: crawled.equipment || original.equipment
    }

    // 충돌 감지
    this.detectConflicts(original, crawled, conflicts)

    return { merged, conflicts }
  }

  /**
   * 최적화된 매칭 알고리즘
   */
  private async findBestMatch(original: any, crawledData: ProcessedGymData[]): Promise<{
    original: any
    crawled: ProcessedGymData
  } | null> {
    let bestMatch: ProcessedGymData | null = null
    let bestScore = 0

    for (const crawled of crawledData) {
      const score = this.calculateMatchScore(original, crawled)
      if (score > bestScore && score > this.duplicateThreshold) {
        bestScore = score
        bestMatch = crawled
      }
    }

    return bestMatch ? { original, crawled: bestMatch } : null
  }

  /**
   * 매칭 점수 계산 (최적화된 버전)
   */
  private calculateMatchScore(original: any, crawled: ProcessedGymData): number {
    let score = 0
    let factors = 0

    // 이름 매칭 (가중치 0.4)
    if (original.name && crawled.name) {
      const nameSimilarity = this.calculateStringSimilarity(original.name, crawled.name)
      score += nameSimilarity * 0.4
      factors += 0.4
    }

    // 주소 매칭 (가중치 0.3)
    if (original.address && crawled.address) {
      const addressSimilarity = this.calculateStringSimilarity(original.address, crawled.address)
      score += addressSimilarity * 0.3
      factors += 0.3
    }

    // 전화번호 매칭 (가중치 0.3)
    if (original.phone && crawled.phone) {
      const phoneSimilarity = this.calculatePhoneSimilarity(original.phone, crawled.phone)
      score += phoneSimilarity * 0.3
      factors += 0.3
    }

    return factors > 0 ? score / factors : 0
  }

  /**
   * 문자열 유사도 계산 (최적화된 버전)
   */
  private calculateStringSimilarity(str1: string, str2: string): number {
    const s1 = str1.toLowerCase().replace(/\s+/g, '')
    const s2 = str2.toLowerCase().replace(/\s+/g, '')
    
    if (s1 === s2) return 1.0
    if (s1.includes(s2) || s2.includes(s1)) return 0.8
    
    // 간단한 Levenshtein 거리 기반 유사도
    const distance = this.levenshteinDistance(s1, s2)
    const maxLength = Math.max(s1.length, s2.length)
    
    return maxLength > 0 ? 1 - (distance / maxLength) : 0
  }

  /**
   * 전화번호 유사도 계산
   */
  private calculatePhoneSimilarity(phone1: string, phone2: string): number {
    const p1 = phone1.replace(/[^\d]/g, '')
    const p2 = phone2.replace(/[^\d]/g, '')
    
    if (p1 === p2) return 1.0
    if (p1.includes(p2) || p2.includes(p1)) return 0.9
    
    return 0
  }

  /**
   * Levenshtein 거리 계산 (최적화된 버전)
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null))
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        )
      }
    }
    
    return matrix[str2.length][str1.length]
  }

  /**
   * 배열 병합 (최적화된 버전)
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
   * 충돌 감지
   */
  private detectConflicts(original: any, crawled: ProcessedGymData, conflicts: Array<{
    gymName: string
    field: string
    originalValue: any
    crawledValue: any
    resolution: 'original' | 'crawled' | 'merged'
  }>): void {
    const conflictFields = [
      'name', 'address', 'phone', 'rating', 'reviewCount', 
      'openHour', 'closeHour', 'price', 'membershipPrice', 
      'ptPrice', 'gxPrice', 'dayPassPrice', 'website', 
      'instagram', 'facebook'
    ]

    for (const field of conflictFields) {
      const originalValue = original[field]
      const crawledValue = crawled[field as keyof ProcessedGymData]
      
      if (originalValue && crawledValue && originalValue !== crawledValue) {
        conflicts.push({
          gymName: original.name || 'Unknown',
          field,
          originalValue,
          crawledValue,
          resolution: 'original'
        })
      }
    }
  }

  /**
   * 매칭되지 않은 데이터 처리
   */
  private async processUnmatchedData(
    deduplicatedData: { original: any[]; crawled: ProcessedGymData[] },
    result: UnifiedMergeResult
  ): Promise<void> {
    // 매칭되지 않은 원본 데이터
    const matchedOriginalIds = new Set(
      result.mergedData.map(data => data.id).filter(id => id !== undefined)
    )
    
    const unmatchedOriginal = deduplicatedData.original.filter(
      original => !matchedOriginalIds.has(original.id)
    )
    
    for (const original of unmatchedOriginal) {
      const fallbackData = this.convertToProcessedGymData(original)
      result.mergedData.push(fallbackData)
      result.statistics.fallbackUsed++
    }

    // 매칭되지 않은 크롤링 데이터
    const matchedCrawledNames = new Set(
      result.mergedData.map(data => data.name)
    )
    
    const unmatchedCrawled = deduplicatedData.crawled.filter(
      crawled => !matchedCrawledNames.has(crawled.name)
    )
    
    for (const crawled of unmatchedCrawled) {
      result.mergedData.push(crawled)
      result.statistics.successfullyMerged++
    }
  }

  /**
   * 원본 데이터를 ProcessedGymData로 변환
   */
  private convertToProcessedGymData(original: any): ProcessedGymData {
    return {
      ...original,
      updatedAt: new Date().toISOString(),
      source: original.source || 'gyms_raw_fallback',
      confidence: original.confidence || 0.5,
      serviceType: original.serviceType || this.determineServiceType(original.name),
      isCurrentlyOpen: original.isCurrentlyOpen !== undefined ? original.isCurrentlyOpen : true,
      crawledAt: original.crawledAt || new Date().toISOString()
    }
  }

  /**
   * 품질 점수 계산
   */
  private calculateQualityScore(data: ProcessedGymData[]): number {
    if (data.length === 0) return 0

    const totalScore = data.reduce((sum, item) => {
      let score = 0
      let factors = 0

      if (item.name) { score += 0.2; factors += 0.2 }
      if (item.address) { score += 0.2; factors += 0.2 }
      if (item.phone) { score += 0.15; factors += 0.15 }
      if (item.rating) { score += 0.1; factors += 0.1 }
      if (item.reviewCount) { score += 0.1; factors += 0.1 }
      if (item.confidence) { score += item.confidence * 0.1; factors += 0.1 }

      return sum + (factors > 0 ? score / factors : 0)
    }, 0)

    return totalScore / data.length
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
   * 캐시 키 생성
   */
  private generateCacheKey(name: string, address: string): string {
    return `${name.toLowerCase().replace(/\s+/g, '')}-${address.toLowerCase().replace(/\s+/g, '')}`
  }

  /**
   * 캐시 클리어
   */
  clearCache(): void {
    this.cache.clear()
  }

  /**
   * 캐시 통계
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    }
  }
}
