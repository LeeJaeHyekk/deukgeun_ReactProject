/**
 * 데이터 병합기
 * 여러 소스에서 수집된 데이터를 병합하고 중복을 제거
 */

import { ProcessedGymData, ProcessedEquipmentData } from '@backend/modules/crawling/types/CrawlingTypes'
import { DataValidator } from '@backend/modules/crawling/processors/DataValidator'

export class DataMerger {
  private validator: DataValidator

  constructor() {
    this.validator = new DataValidator()
  }

  /**
   * 헬스장 데이터 병합 (안전장치 강화)
   */
  mergeGymData(dataList: ProcessedGymData[]): ProcessedGymData[] {
    console.log(`🔄 헬스장 데이터 병합 시작: ${dataList.length}개 데이터`)
    
    // 입력 검증
    if (!Array.isArray(dataList)) {
      console.error('❌ 데이터 리스트가 배열 형식이 아닙니다')
      return []
    }

    if (dataList.length === 0) {
      console.warn('⚠️ 데이터 리스트가 비어있습니다')
      return []
    }

    // 메모리 사용량 제한 (최대 50000개 항목)
    const MAX_ITEMS = 50000
    const limitedDataList = dataList.length > MAX_ITEMS 
      ? dataList.slice(0, MAX_ITEMS)
      : dataList

    if (dataList.length > MAX_ITEMS) {
      console.warn(`⚠️ 데이터 리스트가 너무 많습니다 (${dataList.length}개). 최대 ${MAX_ITEMS}개만 처리합니다.`)
    }

    // 1. 데이터 검증 및 정제
    const validData: ProcessedGymData[] = []
    let invalidCount = 0

    for (const data of limitedDataList) {
      try {
        // 데이터 항목 검증
        if (!data || typeof data !== 'object') {
          invalidCount++
          continue
        }

        // 순환 참조 검증
        try {
          JSON.stringify(data)
        } catch (error) {
          invalidCount++
          console.warn('⚠️ 데이터 항목에 순환 참조가 있습니다')
          continue
        }

        // Validator 검증
        if (!this.validator.validateGymData(data)) {
          invalidCount++
          continue
        }

        // 데이터 정제
        const cleanedData = this.validator.cleanGymData(data)
        validData.push(cleanedData)
      } catch (error) {
        invalidCount++
        console.warn(`⚠️ 데이터 항목 처리 실패: ${error instanceof Error ? error.message : String(error)}`)
        continue
      }
    }

    console.log(`✅ 유효한 데이터: ${validData.length}개 (유효하지 않음: ${invalidCount}개)`)

    if (validData.length === 0) {
      console.warn('⚠️ 유효한 데이터가 없습니다')
      return []
    }

    // 2. 중복 제거 및 병합
    const mergedMap = new Map<string, ProcessedGymData>()
    let mergedCount = 0
    let duplicateCount = 0

    for (const data of validData) {
      try {
        const key = this.generateGymKey(data)
        
        if (mergedMap.has(key)) {
          const existing = mergedMap.get(key)!
          const merged = this.mergeGymRecords(existing, data)
          mergedMap.set(key, merged)
          duplicateCount++
        } else {
          mergedMap.set(key, data)
        }
      } catch (error) {
        console.warn(`⚠️ 데이터 병합 실패: ${error instanceof Error ? error.message : String(error)}`)
        continue
      }
    }

    const mergedData = Array.from(mergedMap.values())
    mergedCount = mergedData.length
    
    console.log(`✅ 병합 완료: ${mergedCount}개 헬스장 (중복 제거: ${duplicateCount}개)`)
    
    return mergedData
  }

  /**
   * 기구 데이터 병합
   */
  mergeEquipmentData(dataList: ProcessedEquipmentData[]): ProcessedEquipmentData[] {
    console.log(`🔄 기구 데이터 병합 시작: ${dataList.length}개 데이터`)
    
    // 1. 데이터 검증 및 정제
    const validData = dataList
      .filter(data => this.validator.validateEquipmentData(data))
      .map(data => this.validator.cleanEquipmentData(data))

    console.log(`✅ 유효한 기구 데이터: ${validData.length}개`)

    // 2. 중복 제거 및 병합
    const mergedMap = new Map<string, ProcessedEquipmentData>()

    for (const data of validData) {
      const key = this.generateEquipmentKey(data)
      
      if (mergedMap.has(key)) {
        const existing = mergedMap.get(key)!
        const merged = this.mergeEquipmentRecords(existing, data)
        mergedMap.set(key, merged)
      } else {
        mergedMap.set(key, data)
      }
    }

    const mergedData = Array.from(mergedMap.values())
    console.log(`✅ 기구 병합 완료: ${mergedData.length}개 기구`)
    
    return mergedData
  }

  /**
   * 헬스장 레코드 병합 (안전장치 강화)
   */
  private mergeGymRecords(existing: ProcessedGymData, newData: ProcessedGymData): ProcessedGymData {
    try {
      // 데이터 무결성 검증
      if (!existing || !newData || typeof existing !== 'object' || typeof newData !== 'object') {
        throw new Error('병합할 데이터가 유효하지 않습니다')
      }

      // 순환 참조 검증
      try {
        JSON.stringify(existing)
        JSON.stringify(newData)
      } catch (error) {
        throw new Error('병합할 데이터에 순환 참조가 있습니다')
      }

      // 신뢰도가 높은 데이터를 우선으로 하되, 누락된 정보는 보완
      const merged: ProcessedGymData = {
        ...existing,
        ...newData,
        // 신뢰도가 높은 데이터의 기본 정보 유지
        name: this.safeMergeString(existing.name, newData.name, existing.confidence >= newData.confidence),
        address: this.safeMergeString(existing.address, newData.address, existing.confidence >= newData.confidence),
        // 누락된 정보 보완
        phone: this.safeMergeString(existing.phone, newData.phone, false),
        latitude: this.safeMergeNumber(existing.latitude, newData.latitude),
        longitude: this.safeMergeNumber(existing.longitude, newData.longitude),
        facilities: this.safeMergeString(existing.facilities, newData.facilities, false),
        openHour: this.safeMergeNumber(existing.openHour, newData.openHour),
        closeHour: this.safeMergeNumber(existing.closeHour, newData.closeHour),
        price: this.safeMergeNumber(existing.price, newData.price),
        rating: this.safeMergeNumber(existing.rating, newData.rating),
        reviewCount: this.safeMergeNumber(existing.reviewCount, newData.reviewCount),
        // 신뢰도는 더 높은 값으로 설정
        confidence: Math.max(existing.confidence || 0, newData.confidence || 0),
        // 소스 정보 병합
        source: this.safeMergeSource(existing.source, newData.source)
      }

      // 최종 검증
      if (!merged.name || !merged.address) {
        throw new Error('병합된 데이터에 필수 필드가 없습니다')
      }

      return merged
    } catch (error) {
      console.error('❌ 데이터 병합 실패:', error)
      // 에러 발생 시 기존 데이터 반환
      return existing
    }
  }

  /**
   * 안전한 문자열 병합
   */
  private safeMergeString(existing: any, newData: any, preferExisting: boolean): string {
    if (preferExisting && existing) {
      return String(existing).trim()
    }
    if (newData) {
      return String(newData).trim()
    }
    if (existing) {
      return String(existing).trim()
    }
    return ''
  }

  /**
   * 안전한 숫자 병합
   */
  private safeMergeNumber(existing: any, newData: any): number | undefined {
    const existingNum = this.safeParseNumber(existing)
    const newNum = this.safeParseNumber(newData)
    
    if (existingNum !== undefined) return existingNum
    if (newNum !== undefined) return newNum
    return undefined
  }

  /**
   * 안전한 숫자 파싱
   */
  private safeParseNumber(value: any): number | undefined {
    if (value === null || value === undefined || value === '') {
      return undefined
    }
    
    try {
      const parsed = typeof value === 'number' ? value : parseFloat(String(value))
      if (isNaN(parsed) || !isFinite(parsed)) {
        return undefined
      }
      return parsed
    } catch (error) {
      return undefined
    }
  }

  /**
   * 안전한 소스 병합
   */
  private safeMergeSource(existing: any, newData: any): string {
    const sources = new Set<string>()
    
    if (existing) {
      const existingStr = String(existing).trim()
      if (existingStr) {
        existingStr.split(',').forEach(s => {
          const trimmed = s.trim()
          if (trimmed) sources.add(trimmed)
        })
      }
    }
    
    if (newData) {
      const newStr = String(newData).trim()
      if (newStr) {
        newStr.split(',').forEach(s => {
          const trimmed = s.trim()
          if (trimmed) sources.add(trimmed)
        })
      }
    }
    
    return Array.from(sources).join(',')
  }

  /**
   * 기구 레코드 병합
   */
  private mergeEquipmentRecords(existing: ProcessedEquipmentData, newData: ProcessedEquipmentData): ProcessedEquipmentData {
    const merged: ProcessedEquipmentData = {
      ...existing,
      ...newData,
      // 수량은 합산
      quantity: existing.quantity + newData.quantity,
      // 신뢰도는 더 높은 값으로 설정
      confidence: Math.max(existing.confidence, newData.confidence),
      // 소스 정보 병합
      source: `${existing.source},${newData.source}`
    }

    return merged
  }

  /**
   * 헬스장 키 생성 (안전장치 강화)
   */
  private generateGymKey(data: ProcessedGymData): string {
    try {
      // 필수 필드 검증
      if (!data.name || !data.address) {
        throw new Error('필수 필드가 없습니다')
      }

      // 안전한 문자열 정제
      const name = String(data.name).toLowerCase().trim().replace(/\s+/g, '').substring(0, 200)
      const address = String(data.address).toLowerCase().trim().replace(/\s+/g, '').substring(0, 500)
      
      if (!name || !address) {
        throw new Error('정제된 필수 필드가 비어있습니다')
      }

      return `${name}-${address}`
    } catch (error) {
      // 에러 발생 시 해시 기반 키 생성
      const fallbackKey = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
      console.warn(`⚠️ 키 생성 실패, 대체 키 사용: ${fallbackKey}`)
      return fallbackKey
    }
  }

  /**
   * 기구 키 생성
   */
  private generateEquipmentKey(data: ProcessedEquipmentData): string {
    const name = data.name.toLowerCase().trim().replace(/\s+/g, '')
    const category = data.category.toLowerCase().trim().replace(/\s+/g, '')
    const gymId = data.gymId || 'unknown'
    return `${gymId}-${category}-${name}`
  }

  /**
   * 데이터 품질별 분류
   */
  classifyByQuality(dataList: ProcessedGymData[]): {
    high: ProcessedGymData[]
    medium: ProcessedGymData[]
    low: ProcessedGymData[]
  } {
    const high: ProcessedGymData[] = []
    const medium: ProcessedGymData[] = []
    const low: ProcessedGymData[] = []

    for (const data of dataList) {
      const quality = this.validator.calculateDataQuality(data)
      
      if (quality >= 0.8) {
        high.push(data)
      } else if (quality >= 0.5) {
        medium.push(data)
      } else {
        low.push(data)
      }
    }

    return { high, medium, low }
  }

  /**
   * 소스별 통계
   */
  getSourceStatistics(dataList: ProcessedGymData[]): Record<string, {
    count: number
    averageConfidence: number
    qualityDistribution: { high: number; medium: number; low: number }
  }> {
    const stats: Record<string, {
      count: number
      totalConfidence: number
      high: number
      medium: number
      low: number
    }> = {}

    for (const data of dataList) {
      const source = data.source
      
      if (!stats[source]) {
        stats[source] = {
          count: 0,
          totalConfidence: 0,
          high: 0,
          medium: 0,
          low: 0
        }
      }

      stats[source].count++
      stats[source].totalConfidence += data.confidence

      const quality = this.validator.calculateDataQuality(data)
      if (quality >= 0.8) {
        stats[source].high++
      } else if (quality >= 0.5) {
        stats[source].medium++
      } else {
        stats[source].low++
      }
    }

    // 결과 변환
    const result: Record<string, {
      count: number
      averageConfidence: number
      qualityDistribution: { high: number; medium: number; low: number }
    }> = {}

    for (const [source, stat] of Object.entries(stats)) {
      result[source] = {
        count: stat.count,
        averageConfidence: stat.totalConfidence / stat.count,
        qualityDistribution: {
          high: stat.high,
          medium: stat.medium,
          low: stat.low
        }
      }
    }

    return result
  }
}
