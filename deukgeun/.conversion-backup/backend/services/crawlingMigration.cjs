"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEPRECATED_SERVICES = exports.CRAWLING_MIGRATION_MAP = void 0;
exports.getMigrationWarning = getMigrationWarning;
exports.checkMigrationStatus = checkMigrationStatus;
exports.CRAWLING_MIGRATION_MAP = {
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
};
exports.DEPRECATED_SERVICES = [
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
];
function getMigrationWarning(serviceName) {
    const newLocation = exports.CRAWLING_MIGRATION_MAP[serviceName];
    if (newLocation) {
        return `⚠️ ${serviceName}는 새로운 모듈 구조로 마이그레이션되었습니다. ${newLocation}를 사용하세요.`;
    }
    return `⚠️ ${serviceName}는 더 이상 사용되지 않습니다. 새로운 크롤링 모듈을 사용하세요.`;
}
function checkMigrationStatus() {
    return {
        migrated: Object.keys(exports.CRAWLING_MIGRATION_MAP),
        deprecated: exports.DEPRECATED_SERVICES,
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
    };
}
