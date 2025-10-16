/**
 * 데이터 검증기
 * 크롤링된 데이터의 유효성을 검증하고 정제
 */

import { ProcessedGymData, ProcessedEquipmentData } from '../types/CrawlingTypes'

export class DataValidator {
  /**
   * 헬스장 데이터 검증
   */
  validateGymData(data: any): data is ProcessedGymData {
    if (!data || typeof data !== 'object') {
      return false
    }

    // 필수 필드 검증
    if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
      return false
    }

    if (!data.address || typeof data.address !== 'string' || data.address.trim().length === 0) {
      return false
    }

    if (!data.source || typeof data.source !== 'string') {
      return false
    }

    if (typeof data.confidence !== 'number' || data.confidence < 0 || data.confidence > 1) {
      return false
    }

    return true
  }

  /**
   * 기구 데이터 검증
   */
  validateEquipmentData(data: any): data is ProcessedEquipmentData {
    if (!data || typeof data !== 'object') {
      return false
    }

    // 필수 필드 검증
    if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
      return false
    }

    if (!data.type || !['cardio', 'weight'].includes(data.type)) {
      return false
    }

    if (!data.category || typeof data.category !== 'string') {
      return false
    }

    if (typeof data.quantity !== 'number' || data.quantity < 0) {
      return false
    }

    if (typeof data.confidence !== 'number' || data.confidence < 0 || data.confidence > 1) {
      return false
    }

    return true
  }

  /**
   * 헬스장 데이터 정제
   */
  cleanGymData(data: ProcessedGymData): ProcessedGymData {
    return {
      ...data,
      name: data.name.trim(),
      address: data.address.trim(),
      phone: data.phone?.trim() || undefined,
      facilities: typeof data.facilities === 'string' ? data.facilities.trim() : data.facilities,
      openHour: data.openHour?.trim() || undefined,
      closeHour: data.closeHour?.trim() || undefined,
      price: data.price?.trim() || undefined,
      type: data.type?.trim() || undefined,
      // 좌표 검증
      latitude: this.validateCoordinate(data.latitude, -90, 90),
      longitude: this.validateCoordinate(data.longitude, -180, 180),
      // 평점 검증
      rating: this.validateRating(data.rating),
      // 리뷰 수 검증
      reviewCount: this.validateReviewCount(data.reviewCount),
      // 신뢰도 검증
      confidence: Math.max(0, Math.min(1, data.confidence || 0))
    }
  }

  /**
   * 기구 데이터 정제
   */
  cleanEquipmentData(data: ProcessedEquipmentData): ProcessedEquipmentData {
    return {
      ...data,
      name: data.name.trim(),
      category: data.category.trim(),
      brand: data.brand?.trim() || undefined,
      model: data.model?.trim() || undefined,
      weightRange: data.weightRange?.trim() || undefined,
      equipmentVariant: data.equipmentVariant?.trim() || undefined,
      additionalInfo: data.additionalInfo?.trim() || undefined,
      // 수량 검증
      quantity: Math.max(0, data.quantity || 0),
      // 신뢰도 검증
      confidence: Math.max(0, Math.min(1, data.confidence || 0))
    }
  }

  /**
   * 좌표 검증
   */
  private validateCoordinate(value: number | undefined, min: number, max: number): number | undefined {
    if (value && typeof value === 'number' && value >= min && value <= max) {
      return value
    }
    return undefined
  }

  /**
   * 평점 검증
   */
  private validateRating(rating: number | undefined): number | undefined {
    if (rating && typeof rating === 'number' && rating >= 0 && rating <= 5) {
      return rating
    }
    return undefined
  }

  /**
   * 리뷰 수 검증
   */
  private validateReviewCount(reviewCount: number | undefined): number | undefined {
    if (reviewCount && typeof reviewCount === 'number' && reviewCount >= 0) {
      return reviewCount
    }
    return undefined
  }

  /**
   * 데이터 품질 점수 계산
   */
  calculateDataQuality(data: ProcessedGymData): number {
    let score = 0
    let maxScore = 0

    // 기본 정보 (필수)
    maxScore += 3
    if (data.name && data.name.trim().length > 0) score += 1
    if (data.address && data.address.trim().length > 0) score += 1
    if (data.source && data.source.trim().length > 0) score += 1

    // 추가 정보 (선택)
    maxScore += 7
    if (data.phone) score += 1
    if (data.latitude && data.longitude) score += 2
    if (data.facilities) score += 1
    if (data.openHour && data.closeHour) score += 1
    if (data.price) score += 1
    if (data.rating !== undefined) score += 1

    return maxScore > 0 ? score / maxScore : 0
  }

  /**
   * 데이터 중복 검사
   */
  isDuplicate(data1: ProcessedGymData, data2: ProcessedGymData): boolean {
    // 이름과 주소가 같으면 중복으로 간주
    const name1 = data1.name.toLowerCase().trim()
    const name2 = data2.name.toLowerCase().trim()
    const address1 = data1.address.toLowerCase().trim()
    const address2 = data2.address.toLowerCase().trim()

    return name1 === name2 && address1 === address2
  }

  /**
   * 데이터 일관성 검사
   */
  checkDataConsistency(data: ProcessedGymData): {
    isValid: boolean
    issues: string[]
  } {
    const issues: string[] = []

    // 이름 검증
    if (!data.name || data.name.trim().length === 0) {
      issues.push('헬스장 이름이 없습니다')
    }

    // 주소 검증
    if (!data.address || data.address.trim().length === 0) {
      issues.push('헬스장 주소가 없습니다')
    }

    // 좌표 검증
    if (data.latitude && data.longitude) {
      if (data.latitude < -90 || data.latitude > 90) {
        issues.push('위도가 유효하지 않습니다')
      }
      if (data.longitude < -180 || data.longitude > 180) {
        issues.push('경도가 유효하지 않습니다')
      }
    }

    // 평점 검증
    if (data.rating !== undefined && (data.rating < 0 || data.rating > 5)) {
      issues.push('평점이 유효하지 않습니다')
    }

    // 신뢰도 검증
    if (data.confidence < 0 || data.confidence > 1) {
      issues.push('신뢰도가 유효하지 않습니다')
    }

    return {
      isValid: issues.length === 0,
      issues
    }
  }
}
