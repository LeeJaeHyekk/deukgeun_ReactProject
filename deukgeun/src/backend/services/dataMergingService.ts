import { Repository } from 'typeorm'
import { Gym } from '../entities/Gym'

// 데이터 소스별 가중치
const SOURCE_WEIGHTS = {
  'seoul_opendata': 1.0,
  'google_places': 0.95,
  'kakao_map': 0.9,
  'facebook': 0.85,
  'naver_blog': 0.8,
  'naver_kin': 0.75,
  'naver_cafe': 0.7,
  'daum_blog': 0.65,
  'gym_site': 0.8,
  'local_community': 0.6,
  'instagram': 0.5,
  'twitter': 0.4
}

// 필드별 우선순위 (높을수록 우선)
const FIELD_PRIORITIES = {
  name: 1.0,
  address: 0.95,
  phone: 0.9,
  latitude: 0.85,
  longitude: 0.85,
  is24Hours: 0.8,
  hasParking: 0.7,
  hasShower: 0.7,
  hasPT: 0.8,
  hasGX: 0.8,
  hasGroupPT: 0.7,
  openHour: 0.6,
  closeHour: 0.6,
  price: 0.5,
  rating: 0.8,
  reviewCount: 0.7
}

// 통합된 헬스장 데이터 인터페이스
interface MergedGymData {
  id: string
  name: string
  type: string
  address: string
  phone: string
  latitude: number
  longitude: number
  is24Hours: boolean
  hasParking: boolean
  hasShower: boolean
  hasPT: boolean
  hasGX: boolean
  hasGroupPT: boolean
  openHour: string
  closeHour: string
  price: string
  rating: number
  reviewCount: number
  facilities: string
  source: string
  confidence: number
  dataQuality: number
  lastUpdated: Date
  createdAt: Date
  updatedAt: Date
}

// 원본 데이터 인터페이스
interface SourceGymData {
  id?: string
  name: string
  type?: string
  address: string
  phone: string
  latitude: number
  longitude: number
  is24Hours: boolean
  hasParking: boolean
  hasShower: boolean
  hasPT: boolean
  hasGX: boolean
  hasGroupPT: boolean
  openHour: string
  closeHour: string
  price: string
  rating: number
  reviewCount: number
  source: string
  confidence: number
  additionalInfo?: Record<string, any>
}

/**
 * 데이터 병합 및 중복 제거 서비스
 * 다양한 소스에서 수집된 헬스장 데이터를 지능적으로 병합하고 중복을 제거
 */
export class DataMergingService {
  private gymRepo: Repository<Gym>
  private similarityThreshold: number = 0.8
  private confidenceThreshold: number = 0.6

  constructor(gymRepo: Repository<Gym>) {
    this.gymRepo = gymRepo
  }

  /**
   * 여러 소스의 헬스장 데이터를 병합
   */
  async mergeGymDataFromMultipleSources(
    sourceDataList: SourceGymData[]
  ): Promise<MergedGymData[]> {
    console.log(`🔄 데이터 병합 시작: ${sourceDataList.length}개 소스 데이터`)

    // 1. 데이터 전처리 및 정규화
    const normalizedData = this.normalizeSourceData(sourceDataList)
    console.log(`📊 정규화 완료: ${normalizedData.length}개 데이터`)

    // 2. 유사한 데이터 그룹화
    const groupedData = this.groupSimilarGyms(normalizedData)
    console.log(`📦 그룹화 완료: ${groupedData.length}개 그룹`)

    // 3. 각 그룹 내에서 데이터 병합
    const mergedData = await this.mergeGroups(groupedData)
    console.log(`✅ 병합 완료: ${mergedData.length}개 최종 데이터`)

    // 4. 데이터 품질 검증
    const validatedData = this.validateMergedData(mergedData)
    console.log(`🔍 검증 완료: ${validatedData.length}개 유효 데이터`)

    return validatedData
  }

  /**
   * 소스 데이터 정규화
   */
  private normalizeSourceData(sourceDataList: SourceGymData[]): SourceGymData[] {
    return sourceDataList.map(data => ({
      ...data,
      name: this.normalizeName(data.name),
      address: this.normalizeAddress(data.address),
      phone: this.normalizePhone(data.phone),
      latitude: this.normalizeCoordinate(data.latitude),
      longitude: this.normalizeCoordinate(data.longitude),
      is24Hours: Boolean(data.is24Hours),
      hasParking: Boolean(data.hasParking),
      hasShower: Boolean(data.hasShower),
      hasPT: Boolean(data.hasPT),
      hasGX: Boolean(data.hasGX),
      hasGroupPT: Boolean(data.hasGroupPT),
      openHour: this.normalizeTime(data.openHour),
      closeHour: this.normalizeTime(data.closeHour),
      price: this.normalizePrice(data.price),
      rating: Math.max(0, Math.min(5, data.rating || 0)),
      reviewCount: Math.max(0, data.reviewCount || 0),
      confidence: Math.max(0, Math.min(1, data.confidence || 0))
    }))
  }

  /**
   * 유사한 헬스장들을 그룹화
   */
  private groupSimilarGyms(normalizedData: SourceGymData[]): SourceGymData[][] {
    const groups: SourceGymData[][] = []
    const processed = new Set<number>()

    for (let i = 0; i < normalizedData.length; i++) {
      if (processed.has(i)) continue

      const group: SourceGymData[] = [normalizedData[i]]
      processed.add(i)

      // 현재 데이터와 유사한 다른 데이터들을 찾아서 그룹에 추가
      for (let j = i + 1; j < normalizedData.length; j++) {
        if (processed.has(j)) continue

        const similarity = this.calculateSimilarity(normalizedData[i], normalizedData[j])
        if (similarity >= this.similarityThreshold) {
          group.push(normalizedData[j])
          processed.add(j)
        }
      }

      groups.push(group)
    }

    return groups
  }

  /**
   * 그룹 내 데이터 병합
   */
  private async mergeGroups(groups: SourceGymData[][]): Promise<MergedGymData[]> {
    const mergedData: MergedGymData[] = []

    for (const group of groups) {
      if (group.length === 0) continue

      // 그룹 내 데이터를 신뢰도와 소스 가중치에 따라 정렬
      const sortedGroup = this.sortGroupByConfidence(group)

      // 최고 품질의 데이터를 기본으로 사용
      const baseData = sortedGroup[0]
      
      // 다른 데이터들과 병합
      const merged = await this.mergeGroupData(sortedGroup)

      mergedData.push(merged)
    }

    return mergedData
  }

  /**
   * 그룹 내 데이터를 신뢰도에 따라 정렬
   */
  private sortGroupByConfidence(group: SourceGymData[]): SourceGymData[] {
    return group.sort((a, b) => {
      const scoreA = this.calculateDataScore(a)
      const scoreB = this.calculateDataScore(b)
      return scoreB - scoreA
    })
  }

  /**
   * 데이터 점수 계산 (신뢰도 + 소스 가중치)
   */
  private calculateDataScore(data: SourceGymData): number {
    const sourceWeight = SOURCE_WEIGHTS[data.source as keyof typeof SOURCE_WEIGHTS] || 0.5
    const confidenceWeight = data.confidence
    const completenessWeight = this.calculateCompleteness(data)
    
    return (sourceWeight * 0.4) + (confidenceWeight * 0.4) + (completenessWeight * 0.2)
  }

  /**
   * 데이터 완성도 계산
   */
  private calculateCompleteness(data: SourceGymData): number {
    const fields = [
      'name', 'address', 'phone', 'latitude', 'longitude',
      'is24Hours', 'hasParking', 'hasShower', 'hasPT', 'hasGX', 'hasGroupPT',
      'openHour', 'closeHour', 'price', 'rating', 'reviewCount'
    ]

    let completedFields = 0
    let totalWeight = 0

    fields.forEach(field => {
      const value = data[field as keyof SourceGymData]
      const priority = FIELD_PRIORITIES[field as keyof typeof FIELD_PRIORITIES] || 0.5
      
      if (this.isFieldValid(value)) {
        completedFields += priority
      }
      totalWeight += priority
    })

    return totalWeight > 0 ? completedFields / totalWeight : 0
  }

  /**
   * 필드 값이 유효한지 확인
   */
  private isFieldValid(value: any): boolean {
    if (value === null || value === undefined) return false
    if (typeof value === 'string') return value.trim().length > 0
    if (typeof value === 'number') return !isNaN(value) && value !== 0
    if (typeof value === 'boolean') return true
    return true
  }

  /**
   * 그룹 내 데이터 병합
   */
  private async mergeGroupData(group: SourceGymData[]): Promise<MergedGymData> {
    const baseData = group[0]
    const merged: MergedGymData = {
      id: baseData.id || this.generateId(),
      name: baseData.name,
      type: baseData.type || '짐',
      address: baseData.address,
      phone: baseData.phone,
      latitude: baseData.latitude,
      longitude: baseData.longitude,
      is24Hours: baseData.is24Hours,
      hasParking: baseData.hasParking,
      hasShower: baseData.hasShower,
      hasPT: baseData.hasPT,
      hasGX: baseData.hasGX,
      hasGroupPT: baseData.hasGroupPT,
      openHour: baseData.openHour,
      closeHour: baseData.closeHour,
      price: baseData.price,
      rating: baseData.rating,
      reviewCount: baseData.reviewCount,
      facilities: '',
      source: '',
      confidence: 0,
      dataQuality: 0,
      lastUpdated: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    }

    // 다른 데이터들과 병합
    for (let i = 1; i < group.length; i++) {
      const otherData = group[i]
      this.mergeDataFields(merged, otherData)
    }

    // 최종 데이터 정리
    merged.facilities = this.generateFacilitiesDescription(merged)
    merged.source = this.generateSourceDescription(group)
    merged.confidence = this.calculateFinalConfidence(group)
    merged.dataQuality = this.calculateDataQuality(merged)

    return merged
  }

  /**
   * 데이터 필드 병합
   */
  private mergeDataFields(merged: MergedGymData, otherData: SourceGymData): void {
    const fields = [
      'address', 'phone', 'latitude', 'longitude',
      'is24Hours', 'hasParking', 'hasShower', 'hasPT', 'hasGX', 'hasGroupPT',
      'openHour', 'closeHour', 'price', 'rating', 'reviewCount'
    ]

    fields.forEach(field => {
      const mergedValue = merged[field as keyof MergedGymData]
      const otherValue = otherData[field as keyof SourceGymData]
      const priority = FIELD_PRIORITIES[field as keyof typeof FIELD_PRIORITIES] || 0.5

      // 현재 값이 비어있거나 품질이 낮은 경우 다른 값으로 대체
      if (!this.isFieldValid(mergedValue) || this.shouldReplaceField(mergedValue, otherValue, priority)) {
        if (this.isFieldValid(otherValue)) {
          (merged as any)[field] = otherValue
        }
      }
    })
  }

  /**
   * 필드를 교체해야 하는지 판단
   */
  private shouldReplaceField(currentValue: any, newValue: any, priority: number): boolean {
    if (!this.isFieldValid(newValue)) return false
    if (!this.isFieldValid(currentValue)) return true

    // 좌표의 경우 거리 기반으로 판단
    if (typeof currentValue === 'number' && typeof newValue === 'number') {
      if (priority >= 0.8) { // 좌표 필드
        return Math.abs(currentValue - newValue) > 0.001 // 100m 이상 차이
      }
    }

    // 문자열의 경우 길이와 품질로 판단
    if (typeof currentValue === 'string' && typeof newValue === 'string') {
      return newValue.length > currentValue.length && this.isHigherQualityString(newValue, currentValue)
    }

    // 숫자의 경우 더 큰 값 선호 (리뷰 수, 평점 등)
    if (typeof currentValue === 'number' && typeof newValue === 'number') {
      return newValue > currentValue
    }

    return false
  }

  /**
   * 문자열 품질 비교
   */
  private isHigherQualityString(str1: string, str2: string): boolean {
    // 더 자세한 정보가 있는 문자열을 선호
    const detailScore1 = this.calculateStringDetailScore(str1)
    const detailScore2 = this.calculateStringDetailScore(str2)
    
    return detailScore1 > detailScore2
  }

  /**
   * 문자열 상세도 점수 계산
   */
  private calculateStringDetailScore(str: string): number {
    let score = 0
    
    // 숫자가 포함된 경우 (주소, 전화번호 등)
    if (/\d/.test(str)) score += 0.3
    
    // 특수문자가 포함된 경우 (상세 주소 등)
    if (/[-,()]/.test(str)) score += 0.2
    
    // 길이가 긴 경우
    if (str.length > 10) score += 0.2
    
    // 한글이 포함된 경우
    if (/[가-힣]/.test(str)) score += 0.3
    
    return score
  }

  /**
   * 유사도 계산
   */
  private calculateSimilarity(data1: SourceGymData, data2: SourceGymData): number {
    const weights = {
      name: 0.4,
      address: 0.3,
      phone: 0.2,
      coordinates: 0.1
    }

    let totalScore = 0
    let totalWeight = 0

    // 이름 유사도
    if (data1.name && data2.name) {
      const nameSimilarity = this.calculateStringSimilarity(data1.name, data2.name)
      totalScore += nameSimilarity * weights.name
      totalWeight += weights.name
    }

    // 주소 유사도
    if (data1.address && data2.address) {
      const addressSimilarity = this.calculateStringSimilarity(data1.address, data2.address)
      totalScore += addressSimilarity * weights.address
      totalWeight += weights.address
    }

    // 전화번호 유사도
    if (data1.phone && data2.phone) {
      const phoneSimilarity = this.calculatePhoneSimilarity(data1.phone, data2.phone)
      totalScore += phoneSimilarity * weights.phone
      totalWeight += weights.phone
    }

    // 좌표 유사도
    if (data1.latitude && data2.latitude && data1.longitude && data2.longitude) {
      const coordinateSimilarity = this.calculateCoordinateSimilarity(
        data1.latitude, data1.longitude,
        data2.latitude, data2.longitude
      )
      totalScore += coordinateSimilarity * weights.coordinates
      totalWeight += weights.coordinates
    }

    return totalWeight > 0 ? totalScore / totalWeight : 0
  }

  /**
   * 문자열 유사도 계산 (Jaccard 유사도)
   */
  private calculateStringSimilarity(str1: string, str2: string): number {
    const set1 = new Set(str1.toLowerCase().split(''))
    const set2 = new Set(str2.toLowerCase().split(''))
    
    const intersection = new Set([...set1].filter(x => set2.has(x)))
    const union = new Set([...set1, ...set2])
    
    return intersection.size / union.size
  }

  /**
   * 전화번호 유사도 계산
   */
  private calculatePhoneSimilarity(phone1: string, phone2: string): number {
    const clean1 = phone1.replace(/[^\d]/g, '')
    const clean2 = phone2.replace(/[^\d]/g, '')
    
    if (clean1 === clean2) return 1.0
    if (clean1.length === 0 || clean2.length === 0) return 0.0
    
    // 부분 일치 확인
    const minLength = Math.min(clean1.length, clean2.length)
    let matches = 0
    
    for (let i = 0; i < minLength; i++) {
      if (clean1[i] === clean2[i]) matches++
    }
    
    return matches / Math.max(clean1.length, clean2.length)
  }

  /**
   * 좌표 유사도 계산 (거리 기반)
   */
  private calculateCoordinateSimilarity(
    lat1: number, lon1: number,
    lat2: number, lon2: number
  ): number {
    const distance = this.calculateDistance(lat1, lon1, lat2, lon2)
    
    // 100m 이내면 1.0, 1km 이내면 0.8, 5km 이내면 0.5, 그 외는 0
    if (distance <= 0.1) return 1.0
    if (distance <= 1.0) return 0.8
    if (distance <= 5.0) return 0.5
    return 0.0
  }

  /**
   * 두 좌표 간 거리 계산 (km)
   */
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371 // 지구 반지름 (km)
    const dLat = this.toRadians(lat2 - lat1)
    const dLon = this.toRadians(lon2 - lon1)
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2)
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    
    return R * c
  }

  /**
   * 도를 라디안으로 변환
   */
  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180)
  }

  /**
   * 최종 신뢰도 계산
   */
  private calculateFinalConfidence(group: SourceGymData[]): number {
    if (group.length === 0) return 0

    let totalConfidence = 0
    let totalWeight = 0

    group.forEach(data => {
      const sourceWeight = SOURCE_WEIGHTS[data.source as keyof typeof SOURCE_WEIGHTS] || 0.5
      totalConfidence += data.confidence * sourceWeight
      totalWeight += sourceWeight
    })

    // 소스 다양성 보너스
    const sourceDiversity = new Set(group.map(d => d.source)).size
    const diversityBonus = Math.min(0.1, sourceDiversity * 0.02)

    return totalWeight > 0 ? Math.min(1.0, (totalConfidence / totalWeight) + diversityBonus) : 0
  }

  /**
   * 데이터 품질 계산
   */
  private calculateDataQuality(data: MergedGymData): number {
    const completeness = this.calculateCompleteness(data as any)
    const accuracy = this.calculateAccuracy(data)
    const consistency = this.calculateConsistency(data)

    return (completeness * 0.4) + (accuracy * 0.4) + (consistency * 0.2)
  }

  /**
   * 정확도 계산
   */
  private calculateAccuracy(data: MergedGymData): number {
    let score = 0
    let total = 0

    // 좌표 유효성
    if (data.latitude !== 0 && data.longitude !== 0) {
      score += 0.3
    }
    total += 0.3

    // 전화번호 형식
    if (this.isValidPhone(data.phone)) {
      score += 0.2
    }
    total += 0.2

    // 주소 형식
    if (this.isValidAddress(data.address)) {
      score += 0.3
    }
    total += 0.3

    // 평점 범위
    if (data.rating >= 0 && data.rating <= 5) {
      score += 0.2
    }
    total += 0.2

    return total > 0 ? score / total : 0
  }

  /**
   * 일관성 계산
   */
  private calculateConsistency(data: MergedGymData): number {
    let score = 0
    let total = 0

    // 운영시간 일관성
    if (data.openHour && data.closeHour) {
      if (this.isValidTimeRange(data.openHour, data.closeHour)) {
        score += 0.3
      }
    }
    total += 0.3

    // 시설 정보 일관성
    if (data.is24Hours && (data.openHour || data.closeHour)) {
      // 24시간이면 운영시간이 없어야 함
      if (!data.openHour && !data.closeHour) {
        score += 0.2
      }
    } else {
      score += 0.2
    }
    total += 0.2

    // 가격 정보 일관성
    if (data.price && this.isValidPrice(data.price)) {
      score += 0.2
    }
    total += 0.2

    // 리뷰 수와 평점 일관성
    if (data.reviewCount > 0 && data.rating > 0) {
      score += 0.3
    } else if (data.reviewCount === 0 && data.rating === 0) {
      score += 0.3
    }
    total += 0.3

    return total > 0 ? score / total : 0
  }

  /**
   * 병합된 데이터 검증
   */
  private validateMergedData(mergedData: MergedGymData[]): MergedGymData[] {
    return mergedData.filter(data => {
      // 최소 신뢰도 확인
      if (data.confidence < this.confidenceThreshold) {
        console.warn(`⚠️ 낮은 신뢰도로 제외: ${data.name} (${data.confidence})`)
        return false
      }

      // 필수 필드 확인
      if (!data.name || !data.address) {
        console.warn(`⚠️ 필수 필드 누락으로 제외: ${data.name}`)
        return false
      }

      // 좌표 유효성 확인
      if (data.latitude === 0 && data.longitude === 0) {
        console.warn(`⚠️ 좌표 정보 없음으로 제외: ${data.name}`)
        return false
      }

      return true
    })
  }

  // 유틸리티 메서드들
  private normalizeName(name: string): string {
    return name.trim().replace(/\s+/g, ' ')
  }

  private normalizeAddress(address: string): string {
    return address.trim().replace(/\s+/g, ' ')
  }

  private normalizePhone(phone: string): string {
    return phone.replace(/[^\d-]/g, '')
  }

  private normalizeCoordinate(coord: number): number {
    return isNaN(coord) ? 0 : coord
  }

  private normalizeTime(time: string): string {
    return time.trim()
  }

  private normalizePrice(price: string): string {
    return price.trim()
  }

  private generateId(): string {
    return `GYM_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private generateFacilitiesDescription(data: MergedGymData): string {
    const facilities = []
    
    if (data.is24Hours) facilities.push('24시간')
    if (data.hasParking) facilities.push('주차')
    if (data.hasShower) facilities.push('샤워')
    if (data.hasPT) facilities.push('PT')
    if (data.hasGX) facilities.push('GX')
    if (data.hasGroupPT) facilities.push('그룹PT')
    
    return facilities.length > 0 ? facilities.join(', ') : '기본시설'
  }

  private generateSourceDescription(group: SourceGymData[]): string {
    const sources = [...new Set(group.map(d => d.source))]
    return `통합검색_${sources.join('+')}`
  }

  private isValidPhone(phone: string): boolean {
    const phoneRegex = /^\d{2,3}-\d{3,4}-\d{4}$/
    return phoneRegex.test(phone)
  }

  private isValidAddress(address: string): boolean {
    return address.length > 5 && /서울/.test(address)
  }

  private isValidTimeRange(openHour: string, closeHour: string): boolean {
    // 간단한 시간 형식 검증
    const timeRegex = /^\d{1,2}:\d{2}$/
    return timeRegex.test(openHour) && timeRegex.test(closeHour)
  }

  private isValidPrice(price: string): boolean {
    return /원|만원|천원/.test(price)
  }
}
