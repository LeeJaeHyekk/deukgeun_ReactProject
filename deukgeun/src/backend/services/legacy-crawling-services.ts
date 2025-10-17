/**
 * 레거시 크롤링 서비스들
 * 기존의 복잡한 크롤링 서비스들을 비활성화하고 새로운 모듈화된 구조로 대체
 */

import { getMigrationWarning, DEPRECATED_SERVICES } from '@backend/services/crawling-migration'

// 기존 크롤링 서비스들을 비활성화하기 위한 플레이스홀더
// 실제 구현은 src/backend/modules/crawling/ 에서 처리

export const LEGACY_CRAWLING_SERVICES = {
  // 기존 서비스들을 비활성화
  integratedCrawlingService: null,
  enhancedCrawlerService: null,
  crawlingBypassService: null,
  equipmentCrawlerService: null,
  multiSourceCrawlerService: null,
  advancedCrawlerService: null,
  enhancedCrawlingSources: null,
  gymCrawlerService: null,
  publicApiScheduler: null,
  apiListUpdater: null,
  dataMergingService: null,
  dataQualityService: null,
  typeGuardService: null,
  batchProcessingService: null,
  dataReferenceService: null,
  integratedGymDataService: null,
  errorHandlingService: null
}

/**
 * 레거시 크롤링 서비스 비활성화 메시지
 */
export function getLegacyServiceMessage(serviceName: string): string {
  return getMigrationWarning(serviceName)
}

/**
 * 레거시 서비스 호출 시 경고 메시지 출력
 */
export function warnLegacyServiceUsage(serviceName: string): void {
  console.warn(getLegacyServiceMessage(serviceName))
}

/**
 * 레거시 서비스인지 확인
 */
export function isLegacyService(serviceName: string): boolean {
  return DEPRECATED_SERVICES.includes(serviceName)
}

/**
 * 모든 레거시 서비스 목록 반환
 */
export function getLegacyServices(): string[] {
  return DEPRECATED_SERVICES
}
