"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCrawlingService = getCrawlingService;
exports.initializeCrawlingService = initializeCrawlingService;
exports.cleanupCrawlingService = cleanupCrawlingService;
const CrawlingService_1 = require('modules/crawling/core/CrawlingService');
let crawlingServiceInstance = null;
function getCrawlingService(gymRepo) {
    if (!crawlingServiceInstance && gymRepo) {
        crawlingServiceInstance = new CrawlingService_1.CrawlingService(gymRepo);
    }
    else if (!crawlingServiceInstance && !gymRepo) {
        crawlingServiceInstance = new CrawlingService_1.CrawlingService(null);
    }
    return crawlingServiceInstance;
}
async function initializeCrawlingService(gymRepo) {
    const service = getCrawlingService(gymRepo);
    const config = {
        enablePublicApi: true,
        enableCrawling: false,
        enableDataMerging: true,
        enableQualityCheck: true,
        batchSize: 50,
        maxConcurrentRequests: 3,
        delayBetweenBatches: 2000,
        maxRetries: 3,
        timeout: 30000,
        saveToFile: true,
        saveToDatabase: true
    };
    service.updateConfig(config);
    console.log('✅ 크롤링 서비스 초기화 완료');
    return service;
}
async function cleanupCrawlingService() {
    if (crawlingServiceInstance) {
        await crawlingServiceInstance.cleanup();
        crawlingServiceInstance = null;
        console.log('✅ 크롤링 서비스 정리 완료');
    }
}
