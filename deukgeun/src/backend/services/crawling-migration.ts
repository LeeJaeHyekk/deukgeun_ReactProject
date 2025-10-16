/**
 * 크롤링 서비스 마이그레이션 가이드
 * 기존 크롤링 서비스들을 새로운 모듈 구조로 마이그레이션
 */

// 기존 크롤링 서비스들을 비활성화하고 새로운 모듈로 대체하는 가이드

export const CRAWLING_MIGRATION_MAP = {
  // 기존 서비스 → 새 모듈 위치
  'integratedCrawlingService.ts': 'modules/crawling/core/CrawlingService.ts',
  'enhancedCrawlerService.ts': 'modules/crawling/core/DataProcessor.ts',
  'crawlingBypassService.ts': 'modules/crawling/sources/',
  'equipmentCrawlerService.ts': 'modules/crawling/sources/EquipmentSource.ts',
  'publicApiScheduler.ts': 'modules/crawling/schedulers/PublicApiScheduler.ts',
  'autoUpdateScheduler.ts': 'modules/crawling/schedulers/AutoUpdateScheduler.ts',
  'dataMergingService.ts': 'modules/crawling/processors/DataMerger.ts',
  'dataQualityService.ts': 'modules/crawling/processors/DataQualityChecker.ts',
  'typeGuardService.ts': 'modules/crawling/processors/DataValidator.ts',
  'apiListUpdater.ts': 'modules/crawling/sources/PublicApiSource.ts',
  'batchProcessingService.ts': 'modules/crawling/utils/BatchProcessor.ts',
  'dataReferenceService.ts': 'modules/crawling/utils/DataReference.ts',
  'enhancedCrawlingSources.ts': 'modules/crawling/sources/',
  'gymCrawlerService.ts': 'modules/crawling/sources/GymSource.ts',
  'integratedGymDataService.ts': 'modules/crawling/core/CrawlingService.ts',
  'multiSourceCrawlerService.ts': 'modules/crawling/core/CrawlingService.ts',
  'advancedCrawlerService.ts': 'modules/crawling/sources/AdvancedSource.ts',
  'errorHandlingService.ts': 'modules/crawling/utils/ErrorHandler.ts'
}

export const DEPRECATED_SERVICES = [
  'integratedCrawlingService.ts',
  'enhancedCrawlerService.ts',
  'crawlingBypassService.ts',
  'equipmentCrawlerService.ts',
  'publicApiScheduler.ts',
  'autoUpdateScheduler.ts',
  'dataMergingService.ts',
  'dataQualityService.ts',
  'typeGuardService.ts',
  'apiListUpdater.ts',
  'batchProcessingService.ts',
  'dataReferenceService.ts',
  'enhancedCrawlingSources.ts',
  'gymCrawlerService.ts',
  'integratedGymDataService.ts',
  'multiSourceCrawlerService.ts',
  'advancedCrawlerService.ts',
  'errorHandlingService.ts'
]

/**
 * 레거시 서비스 사용 시 경고 메시지
 */
export function getMigrationWarning(serviceName: string): string {
  const newLocation = CRAWLING_MIGRATION_MAP[serviceName as keyof typeof CRAWLING_MIGRATION_MAP]
  
  if (newLocation) {
    return `⚠️ ${serviceName}는 새로운 모듈 구조로 마이그레이션되었습니다. ${newLocation}를 사용하세요.`
  }
  
  return `⚠️ ${serviceName}는 더 이상 사용되지 않습니다. 새로운 크롤링 모듈을 사용하세요.`
}

/**
 * 마이그레이션 상태 확인
 */
export function checkMigrationStatus(): {
  migrated: string[]
  deprecated: string[]
  newModules: string[]
} {
  return {
    migrated: Object.keys(CRAWLING_MIGRATION_MAP),
    deprecated: DEPRECATED_SERVICES,
    newModules: [
      'modules/crawling/core/CrawlingService.ts',
      'modules/crawling/core/DataProcessor.ts',
      'modules/crawling/sources/PublicApiSource.ts',
      'modules/crawling/sources/KakaoPlaceSource.ts',
      'modules/crawling/sources/GooglePlaceSource.ts',
      'modules/crawling/processors/DataValidator.ts',
      'modules/crawling/processors/DataMerger.ts',
      'modules/crawling/utils/CrawlingUtils.ts'
    ]
  }
}
