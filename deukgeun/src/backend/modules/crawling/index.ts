/**
 * 크롤링 모듈 통합 인덱스
 * 모든 크롤링 관련 기능을 하나의 모듈로 통합
 */

// 핵심 크롤링 서비스들
export { CrawlingService } from './core/CrawlingService'
export { DataProcessor } from './core/DataProcessor'

// 크롤링 소스들
export { PublicApiSource } from './sources/PublicApiSource'
export { OptimizedGymCrawlingSource } from './sources/OptimizedGymCrawlingSource'

// 데이터 처리기들
export { DataValidator } from './processors/DataValidator'
export { DataMerger } from './processors/DataMerger'

// 유틸리티 함수들
export { 
  validateCrawlingData,
  cleanCrawlingData,
  mergeCrawlingResults,
  removeDuplicates,
  calculateDataQuality,
  sortByConfidence,
  filterByMinConfidence,
  calculateDataStatistics,
  cleanErrorMessage,
  delay,
  retry
} from './utils/CrawlingUtils'

// 타입 정의들
export type {
  CrawlingResult,
  CrawlingSource,
  CrawlingOptions,
  ProcessedGymData,
  ProcessedEquipmentData,
  CrawlingConfig,
  CrawlingStatus,
  EnhancedGymInfo
} from './types/CrawlingTypes'
