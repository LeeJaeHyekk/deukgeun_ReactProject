/**
 * 데이터 병합기
 * 여러 소스에서 수집된 데이터를 병합하고 중복을 제거
 */

import { ProcessedGymData, ProcessedEquipmentData } from '../types/CrawlingTypes'
import { DataValidator } from './DataValidator'

export class DataMerger {
  private validator: DataValidator

  constructor() {
    this.validator = new DataValidator()
  }

  /**
   * 헬스장 데이터 병합
   */
  mergeGymData(dataList: ProcessedGymData[]): ProcessedGymData[] {
    console.log(`🔄 헬스장 데이터 병합 시작: ${dataList.length}개 데이터`)
    
    // 1. 데이터 검증 및 정제
    const validData = dataList
      .filter(data => this.validator.validateGymData(data))
      .map(data => this.validator.cleanGymData(data))

    console.log(`✅ 유효한 데이터: ${validData.length}개`)

    // 2. 중복 제거 및 병합
    const mergedMap = new Map<string, ProcessedGymData>()

    for (const data of validData) {
      const key = this.generateGymKey(data)
      
      if (mergedMap.has(key)) {
        const existing = mergedMap.get(key)!
        const merged = this.mergeGymRecords(existing, data)
        mergedMap.set(key, merged)
      } else {
        mergedMap.set(key, data)
      }
    }

    const mergedData = Array.from(mergedMap.values())
    console.log(`✅ 병합 완료: ${mergedData.length}개 헬스장`)
    
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
   * 헬스장 레코드 병합
   */
  private mergeGymRecords(existing: ProcessedGymData, newData: ProcessedGymData): ProcessedGymData {
    // 신뢰도가 높은 데이터를 우선으로 하되, 누락된 정보는 보완
    const merged: ProcessedGymData = {
      ...existing,
      ...newData,
      // 신뢰도가 높은 데이터의 기본 정보 유지
      name: existing.confidence >= newData.confidence ? existing.name : newData.name,
      address: existing.confidence >= newData.confidence ? existing.address : newData.address,
      // 누락된 정보 보완
      phone: existing.phone || newData.phone,
      latitude: existing.latitude || newData.latitude,
      longitude: existing.longitude || newData.longitude,
      facilities: existing.facilities || newData.facilities,
      openHour: existing.openHour || newData.openHour,
      closeHour: existing.closeHour || newData.closeHour,
      price: existing.price || newData.price,
      rating: existing.rating || newData.rating,
      reviewCount: existing.reviewCount || newData.reviewCount,
      // 신뢰도는 더 높은 값으로 설정
      confidence: Math.max(existing.confidence, newData.confidence),
      // 소스 정보 병합
      source: `${existing.source},${newData.source}`
    }

    return merged
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
   * 헬스장 키 생성
   */
  private generateGymKey(data: ProcessedGymData): string {
    const name = data.name.toLowerCase().trim().replace(/\s+/g, '')
    const address = data.address.toLowerCase().trim().replace(/\s+/g, '')
    return `${name}-${address}`
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
