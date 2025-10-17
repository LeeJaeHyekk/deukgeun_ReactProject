/**
 * 향상된 데이터 병합 프로세서
 * gyms_raw 데이터와 크롤링 데이터를 지능적으로 병합
 */

import { ProcessedGymData } from '@backend/modules/crawling/types/CrawlingTypes'

export interface MergeResult {
  mergedData: ProcessedGymData[]
  statistics: {
    totalProcessed: number
    successfullyMerged: number
    fallbackUsed: number
    duplicatesRemoved: number
    qualityScore: number
  }
  conflicts: Array<{
    gymName: string
    field: string
    originalValue: any
    crawledValue: any
    resolution: 'original' | 'crawled' | 'merged'
  }>
}

export class EnhancedDataMerger {
  private readonly qualityThreshold = 0.7
  private readonly duplicateThreshold = 0.8

  /**
   * EnhancedGymInfo를 ProcessedGymData로 변환 (기존 데이터 완전 보존)
   */
  convertEnhancedGymInfoToProcessedGymData(enhancedInfo: any, originalGym?: any): ProcessedGymData {
    // 기존 데이터를 완전히 보존하면서 크롤링 정보만 추가
    return {
      ...originalGym, // 모든 기존 필드 보존 (서울 공공 API 데이터 포함)
      
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
      facilities: this.mergeFacilities(originalGym?.facilities, enhancedInfo.facilities),
      services: this.mergeServices(originalGym?.services, enhancedInfo.services),
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
   * gyms_raw 데이터와 크롤링 데이터를 병합
   */
  async mergeGymDataWithCrawling(
    originalData: any[],
    crawledData: ProcessedGymData[]
  ): Promise<MergeResult> {
    console.log('🔄 데이터 병합 시작')
    console.log(`📊 원본 데이터: ${originalData.length}개, 크롤링 데이터: ${crawledData.length}개`)

    const result: MergeResult = {
      mergedData: [],
      statistics: {
        totalProcessed: 0,
        successfullyMerged: 0,
        fallbackUsed: 0,
        duplicatesRemoved: 0,
        qualityScore: 0
      },
      conflicts: []
    }

    // 1. 중복 제거 및 매칭
    const matchedPairs = this.matchGyms(originalData, crawledData)
    console.log(`🔗 매칭된 쌍: ${matchedPairs.length}개`)

    // 2. 각 매칭된 쌍에 대해 병합 수행
    for (const pair of matchedPairs) {
      const mergeResult = this.mergeSingleGym(pair.original, pair.crawled)
      result.mergedData.push(mergeResult.merged)
      result.conflicts.push(...mergeResult.conflicts)
      
      if (mergeResult.merged.confidence >= this.qualityThreshold) {
        result.statistics.successfullyMerged++
      } else {
        result.statistics.fallbackUsed++
      }
    }

    // 3. 매칭되지 않은 원본 데이터 처리
    const unmatchedOriginal = originalData.filter(original => 
      !matchedPairs.some(pair => pair.original.id === original.id)
    )
    
    for (const original of unmatchedOriginal) {
      const fallbackData = this.convertToProcessedGymData(original)
      result.mergedData.push(fallbackData)
      result.statistics.fallbackUsed++
    }

    // 4. 매칭되지 않은 크롤링 데이터 처리 (새로운 헬스장)
    const unmatchedCrawled = crawledData.filter(crawled => 
      !matchedPairs.some(pair => this.isSameGym(pair.original, crawled))
    )
    
    for (const crawled of unmatchedCrawled) {
      result.mergedData.push(crawled)
      result.statistics.successfullyMerged++
    }

    // 5. 최종 중복 제거
    result.mergedData = this.removeDuplicates(result.mergedData)
    result.statistics.duplicatesRemoved = 
      matchedPairs.length + unmatchedOriginal.length + unmatchedCrawled.length - result.mergedData.length

    // 6. 통계 계산
    result.statistics.totalProcessed = result.mergedData.length
    result.statistics.qualityScore = this.calculateQualityScore(result.mergedData)

    console.log(`✅ 데이터 병합 완료: ${result.mergedData.length}개 헬스장`)
    console.log(`📈 성공적 병합: ${result.statistics.successfullyMerged}개`)
    console.log(`📉 폴백 사용: ${result.statistics.fallbackUsed}개`)
    console.log(`🔄 중복 제거: ${result.statistics.duplicatesRemoved}개`)
    console.log(`⭐ 품질 점수: ${result.statistics.qualityScore.toFixed(2)}`)

    return result
  }

  /**
   * 원본 데이터와 크롤링 데이터 매칭
   */
  private matchGyms(originalData: any[], crawledData: ProcessedGymData[]): Array<{
    original: any
    crawled: ProcessedGymData
    similarity: number
  }> {
    const matches: Array<{
      original: any
      crawled: ProcessedGymData
      similarity: number
    }> = []

    for (const original of originalData) {
      let bestMatch: ProcessedGymData | null = null
      let bestSimilarity = 0

      for (const crawled of crawledData) {
        const similarity = this.calculateSimilarity(original, crawled)
        if (similarity > bestSimilarity && similarity >= this.duplicateThreshold) {
          bestMatch = crawled
          bestSimilarity = similarity
        }
      }

      if (bestMatch) {
        matches.push({
          original,
          crawled: bestMatch,
          similarity: bestSimilarity
        })
      }
    }

    return matches
  }

  /**
   * 두 헬스장 데이터의 유사도 계산
   */
  private calculateSimilarity(original: any, crawled: ProcessedGymData): number {
    let similarity = 0
    let factors = 0

    // 이름 유사도 (가장 중요)
    if (original.name && crawled.name) {
      const nameSimilarity = this.calculateStringSimilarity(
        original.name.toLowerCase(),
        crawled.name.toLowerCase()
      )
      similarity += nameSimilarity * 0.5
      factors += 0.5
    }

    // 주소 유사도
    if (original.address && crawled.address) {
      const addressSimilarity = this.calculateStringSimilarity(
        original.address.toLowerCase(),
        crawled.address.toLowerCase()
      )
      similarity += addressSimilarity * 0.3
      factors += 0.3
    }

    // 전화번호 일치
    if (original.phone && crawled.phone) {
      const phoneMatch = original.phone === crawled.phone ? 1 : 0
      similarity += phoneMatch * 0.2
      factors += 0.2
    }

    return factors > 0 ? similarity / factors : 0
  }

  /**
   * 문자열 유사도 계산 (Levenshtein 거리 기반)
   */
  private calculateStringSimilarity(str1: string, str2: string): number {
    const maxLength = Math.max(str1.length, str2.length)
    if (maxLength === 0) return 1

    const distance = this.levenshteinDistance(str1, str2)
    return 1 - (distance / maxLength)
  }

  /**
   * Levenshtein 거리 계산
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
   * 단일 헬스장 데이터 병합 (기존 데이터 완전 보존 버전)
   */
  private mergeSingleGym(original: any, crawled: ProcessedGymData): {
    merged: ProcessedGymData
    conflicts: Array<{
      gymName: string
      field: string
      originalValue: any
      crawledValue: any
      resolution: 'original' | 'crawled' | 'merged'
    }>
  } {
    const conflicts: Array<{
      gymName: string
      field: string
      originalValue: any
      crawledValue: any
      resolution: 'original' | 'crawled' | 'merged'
    }> = []

    // 기존 데이터를 완전히 보존하면서 크롤링 정보만 추가
    const merged: ProcessedGymData = {
      // 기존 데이터 완전 보존 (서울 공공 API 데이터)
      ...original,
      
      // 기본 필드 업데이트 (필요한 경우만)
      updatedAt: new Date().toISOString(),
      
      // 크롤링에서 새로 추가된 정보만 병합 (기존 값이 없을 때만)
      rating: original.rating || crawled.rating,
      reviewCount: original.reviewCount || crawled.reviewCount,
      openHour: original.openHour || crawled.openHour,
      closeHour: original.closeHour || crawled.closeHour,
      
      // 가격 정보 (기존 값이 없을 때만 크롤링 값 사용)
      price: original.price || crawled.price,
      membershipPrice: original.membershipPrice || crawled.membershipPrice,
      ptPrice: original.ptPrice || crawled.ptPrice,
      gxPrice: original.gxPrice || crawled.gxPrice,
      dayPassPrice: original.dayPassPrice || crawled.dayPassPrice,
      priceDetails: original.priceDetails || crawled.priceDetails,
      minimumPrice: original.minimumPrice || crawled.minimumPrice,
      discountInfo: original.discountInfo || crawled.discountInfo,
      
      // 시설 및 서비스 정보 (기존과 크롤링 정보 병합)
      facilities: this.mergeFacilities(original.facilities, crawled.facilities),
      services: this.mergeServices(original.services, crawled.services),
      
      // 소셜 미디어 및 웹사이트 (기존 값이 없을 때만)
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
      
      // 기구 정보 (크롤링 정보가 있으면 추가)
      equipment: crawled.equipment || original.equipment
    }

    // 충돌 감지 (실제로 값이 다른 경우만)
    this.detectConflicts(original, crawled, conflicts)

    return { merged, conflicts }
  }

  /**
   * 충돌 감지 (실제로 값이 다른 경우만)
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
      const crawledValue = crawled[field as keyof typeof crawled]
      
      if (originalValue && crawledValue && originalValue !== crawledValue) {
        conflicts.push({
          gymName: original.name || 'Unknown',
          field,
          originalValue,
          crawledValue,
          resolution: 'original' // 기존 값 우선
        })
      }
    }
  }

  /**
   * 필드 충돌 해결
   */
  private resolveFieldConflict(
    fieldName: string,
    originalValue: any,
    crawledValue: any,
    conflicts: Array<{
      gymName: string
      field: string
      originalValue: any
      crawledValue: any
      resolution: 'original' | 'crawled' | 'merged'
    }>,
    defaultValue: any
  ): any {
    if (!originalValue && !crawledValue) {
      return defaultValue
    }
    
    if (!originalValue) {
      return crawledValue
    }
    
    if (!crawledValue) {
      return originalValue
    }

    // 값이 다른 경우 충돌 기록
    if (originalValue !== crawledValue) {
      conflicts.push({
        gymName: defaultValue || 'Unknown',
        field: fieldName,
        originalValue,
        crawledValue,
        resolution: this.getResolutionStrategy(fieldName, originalValue, crawledValue)
      })

      return this.getResolutionStrategy(fieldName, originalValue, crawledValue) === 'crawled' 
        ? crawledValue 
        : originalValue
    }

    return originalValue
  }

  /**
   * 충돌 해결 전략 결정 (개선된 버전)
   */
  private getResolutionStrategy(fieldName: string, originalValue: any, crawledValue: any): 'original' | 'crawled' {
    switch (fieldName) {
      case 'name':
        // 크롤링된 이름이 더 완전한 경우 (더 긴 문자열)
        return crawledValue && crawledValue.length > originalValue.length ? 'crawled' : 'original'
      
      case 'address':
        // 크롤링된 주소가 더 상세한 경우
        return crawledValue && crawledValue.length > originalValue.length ? 'crawled' : 'original'
      
      case 'phone':
        // 크롤링된 전화번호가 더 완전한 경우
        return crawledValue && crawledValue.length > originalValue.length ? 'crawled' : 'original'
      
      case 'rating':
      case 'reviewCount':
      case 'openHour':
      case 'closeHour':
      case 'price':
      case 'membershipPrice':
      case 'ptPrice':
      case 'gxPrice':
      case 'dayPassPrice':
      case 'priceDetails':
      case 'minimumPrice':
      case 'discountInfo':
      case 'website':
      case 'instagram':
      case 'facebook':
        // 크롤링된 정보가 있으면 우선 사용
        return crawledValue ? 'crawled' : 'original'
      
      default:
        return 'original'
    }
  }

  /**
   * 시설 정보 병합
   */
  private mergeFacilities(originalFacilities: any, crawledFacilities: any): string[] {
    const facilities: string[] = []
    
    // 원본 시설 정보 처리
    if (originalFacilities) {
      if (Array.isArray(originalFacilities)) {
        facilities.push(...originalFacilities)
      } else if (typeof originalFacilities === 'string') {
        facilities.push(originalFacilities)
      }
    }
    
    // 크롤링 시설 정보 처리
    if (crawledFacilities) {
      if (Array.isArray(crawledFacilities)) {
        facilities.push(...crawledFacilities)
      } else if (typeof crawledFacilities === 'string') {
        facilities.push(crawledFacilities)
      }
    }
    
    // 중복 제거 및 정리
    return [...new Set(facilities.filter(f => f && f.trim()))]
  }

  /**
   * 서비스 정보 병합
   */
  private mergeServices(originalServices: any, crawledServices: any): string[] {
    const services: string[] = []
    
    // 원본 서비스 정보 처리
    if (originalServices && Array.isArray(originalServices)) {
      services.push(...originalServices)
    }
    
    // 크롤링 서비스 정보 처리
    if (crawledServices && Array.isArray(crawledServices)) {
      services.push(...crawledServices)
    }
    
    // 중복 제거 및 정리
    return [...new Set(services.filter(s => s && s.trim()))]
  }

  /**
   * 소스 정보 병합
   */
  private mergeSources(originalSource: any, crawledSource: any): string {
    const sources: string[] = []
    
    if (originalSource) {
      sources.push(originalSource)
    }
    
    if (crawledSource && crawledSource !== originalSource) {
      sources.push(crawledSource)
    }
    
    return sources.join(' + ')
  }

  /**
   * 중복 제거
   */
  private removeDuplicates(data: ProcessedGymData[]): ProcessedGymData[] {
    const unique: ProcessedGymData[] = []
    const seen = new Set<string>()

    for (const item of data) {
      const key = `${item.name}-${item.address}`
      if (!seen.has(key)) {
        seen.add(key)
        unique.push(item)
      }
    }

    return unique
  }

  /**
   * 품질 점수 계산
   */
  private calculateQualityScore(data: ProcessedGymData[]): number {
    if (data.length === 0) return 0

    const totalScore = data.reduce((sum, item) => {
      let score = 0
      let factors = 0

      // 기본 정보 완성도
      if (item.name) { score += 0.2; factors += 0.2 }
      if (item.address) { score += 0.2; factors += 0.2 }
      if (item.phone) { score += 0.15; factors += 0.15 }
      if (item.latitude && item.longitude) { score += 0.15; factors += 0.15 }

      // 추가 정보
      if (item.rating) { score += 0.1; factors += 0.1 }
      if (item.reviewCount) { score += 0.1; factors += 0.1 }
      if (item.confidence) { score += item.confidence * 0.1; factors += 0.1 }

      return sum + (factors > 0 ? score / factors : 0)
    }, 0)

    return totalScore / data.length
  }

  /**
   * 원본 데이터를 ProcessedGymData 형식으로 변환 (기존 데이터 완전 보존)
   */
  private convertToProcessedGymData(original: any): ProcessedGymData {
    // 기존 데이터를 완전히 보존하면서 필요한 필드만 업데이트
    return {
      ...original, // 모든 기존 필드 보존
      updatedAt: new Date().toISOString(), // 업데이트 시간만 갱신
      source: original.source || 'gyms_raw_fallback',
      confidence: original.confidence || 0.5,
      serviceType: original.serviceType || this.determineServiceType(original.name),
      isCurrentlyOpen: original.isCurrentlyOpen !== undefined ? original.isCurrentlyOpen : true,
      crawledAt: original.crawledAt || new Date().toISOString()
    }
  }

  /**
   * 두 헬스장이 같은 헬스장인지 확인
   */
  private isSameGym(original: any, crawled: ProcessedGymData): boolean {
    return this.calculateSimilarity(original, crawled) >= this.duplicateThreshold
  }

  /**
   * 서비스 타입 결정
   */
  private determineServiceType(gymName: string): string {
    const name = gymName.toLowerCase()
    
    if (name.includes('크로스핏') || name.includes('crossfit')) {
      return '크로스핏'
    } else if (name.includes('pt') || name.includes('개인트레이닝')) {
      return 'pt'
    } else if (name.includes('gx') || name.includes('그룹')) {
      return 'gx'
    } else if (name.includes('요가') || name.includes('yoga')) {
      return '요가'
    } else if (name.includes('필라테스') || name.includes('pilates')) {
      return '필라테스'
    } else {
      return 'gym'
    }
  }
}
