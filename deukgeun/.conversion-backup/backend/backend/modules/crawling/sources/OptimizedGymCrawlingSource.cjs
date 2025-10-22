"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OptimizedGymCrawlingSource = void 0;
const NaverSearchEngine_1 = require('modules/crawling/sources/search/NaverSearchEngine');
const GoogleSearchEngine_1 = require('modules/crawling/sources/search/GoogleSearchEngine');
const DaumSearchEngine_1 = require('modules/crawling/sources/search/DaumSearchEngine');
const NaverBlogSearchEngine_1 = require('modules/crawling/sources/search/NaverBlogSearchEngine');
const NaverCafeSearchEngine_1 = require('modules/crawling/sources/search/NaverCafeSearchEngine');
const CrossValidator_1 = require('modules/crawling/processors/CrossValidator');
const PriceExtractor_1 = require('modules/crawling/processors/PriceExtractor');
const AntiDetectionUtils_1 = require('modules/crawling/utils/AntiDetectionUtils');
const PerformanceMonitor_1 = require('modules/crawling/utils/PerformanceMonitor');
const BatchProcessor_1 = require('modules/crawling/processors/BatchProcessor');
const CrawlingConfigManager_1 = require('modules/crawling/config/CrawlingConfigManager');
class OptimizedGymCrawlingSource {
    constructor(timeout = 30000, delay = 1000, config) {
        this.configManager = new CrawlingConfigManager_1.CrawlingConfigManager({
            timeout,
            delay,
            ...config
        });
        this.performanceMonitor = new PerformanceMonitor_1.PerformanceMonitor(this.configManager.getPerformanceMonitoringConfig());
        this.batchProcessor = new BatchProcessor_1.BatchProcessor(this.configManager.getBatchProcessingConfig(), this.performanceMonitor);
        const searchConfig = this.configManager.getSearchEnginesConfig();
        this.searchEngines = this.initializeSearchEngines(searchConfig);
        this.crossValidator = new CrossValidator_1.CrossValidator();
        this.priceExtractor = new PriceExtractor_1.PriceExtractor();
    }
    initializeSearchEngines(config) {
        const engines = [];
        const engineMap = {
            'naver': () => new NaverSearchEngine_1.NaverSearchEngine(config.timeout, config.delay),
            'google': () => new GoogleSearchEngine_1.GoogleSearchEngine(config.timeout, config.delay),
            'daum': () => new DaumSearchEngine_1.DaumSearchEngine(config.timeout, config.delay),
            'naver_blog': () => new NaverBlogSearchEngine_1.NaverBlogSearchEngine(config.timeout, config.delay),
            'naver_cafe': () => new NaverCafeSearchEngine_1.NaverCafeSearchEngine(config.timeout, config.delay)
        };
        for (const engineName of config.enabled) {
            if (engineMap[engineName]) {
                engines.push(engineMap[engineName]());
            }
        }
        return engines;
    }
    async crawlGymsFromRawData(gyms) {
        console.log(`🚀 최적화된 헬스장 크롤링 시작: ${gyms.length}개 헬스장`);
        console.log(`📦 배치 처리 모드: 동적 배치 크기 ${this.batchProcessor.getCurrentBatchSize()}개`);
        this.performanceMonitor.start();
        try {
            const batchResult = await this.batchProcessor.processBatches(gyms, (batch) => this.processBatch(batch));
            const successCount = batchResult.results.filter(r => r.confidence > 0.1).length;
            const successRate = (successCount / batchResult.results.length) * 100;
            console.log(`\n📊 최적화된 헬스장 크롤링 완료:`);
            console.log(`   - 총 처리: ${batchResult.results.length}개 헬스장`);
            console.log(`   - 성공률: ${successRate.toFixed(1)}% (${successCount}/${batchResult.results.length})`);
            console.log(`   - 총 실행 시간: ${(batchResult.processingTime / 1000).toFixed(1)}초`);
            console.log(`   - 평균 처리 시간: ${Math.round(batchResult.processingTime / batchResult.results.length)}ms/개`);
            console.log(`   - 성공한 배치: ${batchResult.successfulBatches}/${batchResult.totalBatches}`);
            console.log(`   - 평균 배치 크기: ${batchResult.averageBatchSize.toFixed(1)}개`);
            return batchResult.results;
        }
        catch (error) {
            console.error('❌ 크롤링 처리 중 오류 발생:', error);
            throw error;
        }
    }
    async processBatch(batch) {
        const results = [];
        for (const gym of batch) {
            try {
                const result = await this.crawlSingleGym(gym);
                results.push(result);
                if (batch.indexOf(gym) < batch.length - 1) {
                    await this.delayExecution();
                }
            }
            catch (error) {
                console.error(`배치 내 크롤링 실패: ${gym.name}`, error);
                results.push(this.createFallbackResult(gym));
            }
        }
        return results;
    }
    async crawlSingleGym(gym) {
        const searchResults = [];
        console.log(`🏋️ 헬스장 크롤링 시작: ${gym.name}`);
        for (let i = 0; i < this.searchEngines.length; i++) {
            const engine = this.searchEngines[i];
            try {
                console.log(`🔍 검색 엔진 ${i + 1}/${this.searchEngines.length}: ${engine.constructor.name}`);
                const result = await engine.search(gym.name, gym.address);
                if (result && result.confidence && result.confidence > 0.1) {
                    searchResults.push(result);
                    console.log(`✅ ${engine.constructor.name}에서 정보 추출 성공 (신뢰도: ${result.confidence})`);
                    if (result.confidence > 0.7) {
                        console.log(`🎯 높은 신뢰도 달성 - 조기 종료: ${gym.name}`);
                        break;
                    }
                }
                if (i < this.searchEngines.length - 1) {
                    await this.delayBetweenEngines();
                }
            }
            catch (error) {
                console.warn(`❌ 검색 엔진 실패: ${engine.constructor.name}`, error);
                if (AntiDetectionUtils_1.AntiDetectionUtils.is403Error(error)) {
                    console.log(`🚫 403 에러 감지 - 긴 지연 후 계속`);
                    await AntiDetectionUtils_1.AntiDetectionUtils.delayAfter403Error();
                }
                continue;
            }
        }
        if (searchResults.length === 0) {
            console.warn(`⚠️ 모든 검색 엔진 실패: ${gym.name}`);
            return this.createFallbackResult(gym);
        }
        const validatedResult = this.crossValidator.crossValidateResults(searchResults, gym);
        console.log(`✅ 최적화된 크롤링 성공: ${gym.name} (소스: ${validatedResult.source}, 신뢰도: ${validatedResult.confidence})`);
        return validatedResult;
    }
    async delayBetweenEngines() {
        const config = this.configManager.getAntiDetectionConfig();
        const delay = config.minDelay + Math.random() * (config.maxDelay - config.minDelay);
        console.log(`⏳ 검색 엔진 간 ${Math.round(delay)}ms 대기`);
        await new Promise(resolve => setTimeout(resolve, delay));
    }
    async delayExecution() {
        const config = this.configManager.getConfig();
        await new Promise(resolve => setTimeout(resolve, config.delay));
    }
    getSearchEngines() {
        return this.searchEngines;
    }
    createFallbackResult(gym) {
        const fallbackConfig = this.configManager.getFallbackConfig();
        return {
            name: gym.name,
            address: gym.address,
            phone: gym.phone,
            rating: gym.rating,
            reviewCount: gym.reviewCount,
            openHour: gym.openHour,
            closeHour: gym.closeHour,
            price: gym.price,
            membershipPrice: gym.membershipPrice,
            ptPrice: gym.ptPrice,
            gxPrice: gym.gxPrice,
            dayPassPrice: gym.dayPassPrice,
            priceDetails: gym.priceDetails,
            minimumPrice: gym.minimumPrice,
            discountInfo: gym.discountInfo,
            facilities: this.normalizeFacilities(gym.facilities),
            services: gym.services,
            website: gym.website,
            instagram: gym.instagram,
            facebook: gym.facebook,
            source: 'gyms_raw_fallback',
            confidence: fallbackConfig.fallbackConfidence,
            type: 'private'
        };
    }
    normalizeFacilities(facilities) {
        if (!facilities)
            return ['기본 헬스장'];
        if (Array.isArray(facilities))
            return facilities;
        return [String(facilities)];
    }
    extractPriceInfo(text) {
        return this.priceExtractor.extractPriceInfo(text);
    }
    crossValidate(results, originalGym) {
        return this.crossValidator.crossValidateResults(results, originalGym);
    }
    getPerformanceStats() {
        return this.performanceMonitor.getStats();
    }
    generatePerformanceReport() {
        return this.performanceMonitor.generatePerformanceReport();
    }
    resetStats() {
        this.performanceMonitor.reset();
        console.log('📊 성능 통계가 리셋되었습니다.');
    }
    setBatchSize(size) {
        this.batchProcessor.setBatchSize(size);
    }
    setMaxConsecutiveFailures(maxFailures) {
        this.batchProcessor.setMaxConsecutiveFailures(maxFailures);
    }
    getConfigManager() {
        return this.configManager;
    }
    getPerformanceMonitor() {
        return this.performanceMonitor;
    }
    getBatchProcessor() {
        return this.batchProcessor;
    }
}
exports.OptimizedGymCrawlingSource = OptimizedGymCrawlingSource;
