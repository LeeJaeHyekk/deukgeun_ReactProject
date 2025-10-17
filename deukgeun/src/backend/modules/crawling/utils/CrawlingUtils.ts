/**
 * 크롤링 유틸리티 함수들
 */

import { ProcessedGymData, ProcessedEquipmentData } from '@backend/modules/crawling/types/CrawlingTypes'

/**
 * 크롤링 데이터 검증
 */
export function validateCrawlingData(data: any): data is ProcessedGymData {
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
 * 크롤링 데이터 정리
 */
export function cleanCrawlingData(data: ProcessedGymData): ProcessedGymData {
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
    latitude: data.latitude && typeof data.latitude === 'number' && 
              data.latitude >= -90 && data.latitude <= 90 ? data.latitude : undefined,
    longitude: data.longitude && typeof data.longitude === 'number' && 
               data.longitude >= -180 && data.longitude <= 180 ? data.longitude : undefined,
    // 평점 검증
    rating: data.rating && typeof data.rating === 'number' && 
            data.rating >= 0 && data.rating <= 5 ? data.rating : undefined,
    // 리뷰 수 검증
    reviewCount: data.reviewCount && typeof data.reviewCount === 'number' && 
                 data.reviewCount >= 0 ? data.reviewCount : undefined,
    // 신뢰도 검증
    confidence: Math.max(0, Math.min(1, data.confidence || 0))
  }
}

/**
 * 크롤링 결과 병합
 */
export function mergeCrawlingResults(results: ProcessedGymData[]): ProcessedGymData[] {
  const mergedMap = new Map<string, ProcessedGymData>()

  for (const result of results) {
    if (!validateCrawlingData(result)) {
      console.warn('⚠️ 유효하지 않은 크롤링 데이터 건너뜀:', result)
      continue
    }

    const cleanedData = cleanCrawlingData(result)
    const key = `${cleanedData.name}-${cleanedData.address}`

    if (mergedMap.has(key)) {
      const existing = mergedMap.get(key)!
      
      // 신뢰도가 높은 데이터로 업데이트
      if (cleanedData.confidence > existing.confidence) {
        mergedMap.set(key, { ...existing, ...cleanedData })
      } else {
        // 신뢰도가 낮더라도 누락된 정보가 있다면 보완
        const updated = { ...cleanedData }
        Object.keys(existing).forEach(key => {
          const existingValue = existing[key as keyof ProcessedGymData]
          const updatedValue = updated[key as keyof ProcessedGymData]
          if (existingValue && !updatedValue) {
            (updated as any)[key] = existingValue
          }
        })
        mergedMap.set(key, updated)
      }
    } else {
      mergedMap.set(key, cleanedData)
    }
  }

  return Array.from(mergedMap.values())
}

/**
 * 데이터 중복 제거
 */
export function removeDuplicates(data: ProcessedGymData[]): ProcessedGymData[] {
  const seen = new Set<string>()
  return data.filter(item => {
    const key = `${item.name}-${item.address}`
    if (seen.has(key)) {
      return false
    }
    seen.add(key)
    return true
  })
}

/**
 * 데이터 품질 점수 계산
 */
export function calculateDataQuality(data: ProcessedGymData): number {
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
 * 데이터 정렬 (신뢰도 기준)
 */
export function sortByConfidence(data: ProcessedGymData[]): ProcessedGymData[] {
  return [...data].sort((a, b) => b.confidence - a.confidence)
}

/**
 * 데이터 필터링 (최소 신뢰도 기준)
 */
export function filterByMinConfidence(data: ProcessedGymData[], minConfidence: number = 0.5): ProcessedGymData[] {
  return data.filter(item => item.confidence >= minConfidence)
}

/**
 * 데이터 통계 계산
 */
export function calculateDataStatistics(data: ProcessedGymData[]): {
  total: number
  averageConfidence: number
  minConfidence: number
  maxConfidence: number
  sourceDistribution: Record<string, number>
  qualityDistribution: {
    high: number
    medium: number
    low: number
  }
} {
  if (data.length === 0) {
    return {
      total: 0,
      averageConfidence: 0,
      minConfidence: 0,
      maxConfidence: 0,
      sourceDistribution: {},
      qualityDistribution: { high: 0, medium: 0, low: 0 }
    }
  }

  const confidences = data.map(item => item.confidence)
  const averageConfidence = confidences.reduce((sum, conf) => sum + conf, 0) / confidences.length
  const minConfidence = Math.min(...confidences)
  const maxConfidence = Math.max(...confidences)

  const sourceDistribution: Record<string, number> = {}
  data.forEach(item => {
    sourceDistribution[item.source] = (sourceDistribution[item.source] || 0) + 1
  })

  const qualityDistribution = {
    high: data.filter(item => item.confidence >= 0.8).length,
    medium: data.filter(item => item.confidence >= 0.5 && item.confidence < 0.8).length,
    low: data.filter(item => item.confidence < 0.5).length
  }

  return {
    total: data.length,
    averageConfidence,
    minConfidence,
    maxConfidence,
    sourceDistribution,
    qualityDistribution
  }
}

/**
 * 에러 메시지 정리
 */
export function cleanErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  if (typeof error === 'string') {
    return error
  }
  return '알 수 없는 오류가 발생했습니다'
}

/**
 * 재시도 로직을 위한 지연 함수
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * 재시도 함수
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      
      if (attempt === maxRetries) {
        throw lastError
      }

      console.warn(`⚠️ 시도 ${attempt}/${maxRetries} 실패, ${delayMs}ms 후 재시도:`, lastError.message)
      await delay(delayMs)
      delayMs *= 1.5 // 지수 백오프
    }
  }

  throw lastError!
}
