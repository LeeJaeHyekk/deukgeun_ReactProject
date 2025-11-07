"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LEGACY_CRAWLING_SERVICES = void 0;
exports.getLegacyServiceMessage = getLegacyServiceMessage;
exports.warnLegacyServiceUsage = warnLegacyServiceUsage;
exports.isLegacyService = isLegacyService;
exports.getLegacyServices = getLegacyServices;
const crawlingMigration_1 = require("./crawlingMigration.cjs");
exports.LEGACY_CRAWLING_SERVICES = {
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
};
function getLegacyServiceMessage(serviceName) {
    return (0, crawlingMigration_1.getMigrationWarning)(serviceName);
}
function warnLegacyServiceUsage(serviceName) {
    console.warn(getLegacyServiceMessage(serviceName));
}
function isLegacyService(serviceName) {
    return crawlingMigration_1.DEPRECATED_SERVICES.includes(serviceName);
}
function getLegacyServices() {
    return crawlingMigration_1.DEPRECATED_SERVICES;
}
