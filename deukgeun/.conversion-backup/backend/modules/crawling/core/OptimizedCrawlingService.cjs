"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.OptimizedCrawlingService = void 0;
const PublicApiSource_1 = require("../sources/PublicApiSource.cjs");
const SearchEngineFactory_1 = require("../sources/search/SearchEngineFactory.cjs");
const UnifiedDataMerger_1 = require("../processors/UnifiedDataMerger.cjs");
const DataValidator_1 = require("../processors/DataValidator.cjs");
const CrawlingHistoryTracker_1 = require("../tracking/CrawlingHistoryTracker.cjs");
class OptimizedCrawlingService {
    constructor(gymRepo) {
        this.cache = new Map();
        this.processingQueue = [];
        this.activeProcesses = 0;
        this.gymRepo = gymRepo;
        this.publicApiSource = new PublicApiSource_1.PublicApiSource();
        this.searchEngineFactory = new SearchEngineFactory_1.SearchEngineFactory({
            timeout: 30000,
            delay: 1000,
            maxRetries: 3,
            enableParallel: true,
            maxConcurrent: 3
        });
        this.unifiedDataMerger = new UnifiedDataMerger_1.UnifiedDataMerger();
        this.dataValidator = new DataValidator_1.DataValidator();
        this.historyTracker = new CrawlingHistoryTracker_1.CrawlingHistoryTracker();
        this.config = {
            enablePublicApi: true,
            enableCrawling: true,
            enableDataMerging: true,
            enableQualityCheck: true,
            batchSize: 5,
            maxConcurrentRequests: 3,
            delayBetweenBatches: 5000,
            maxRetries: 3,
            timeout: 30000,
            saveToFile: true,
            saveToDatabase: true,
            enableCaching: true,
            cacheSize: 1000,
            enableParallelProcessing: true,
            memoryOptimization: true,
            searchEngines: ['naver_cafe', 'naver', 'google', 'daum'],
            minSearchConfidence: 0.7,
            enableEarlyTermination: true,
            enableDataDeduplication: true,
            enableQualityFiltering: true,
            qualityThreshold: 0.7
        };
        this.status = {
            isRunning: false,
            currentStep: '',
            progress: { current: 0, total: 0, percentage: 0 },
            startTime: null,
            estimatedCompletion: null,
            errors: []
        };
    }
    async executeOptimizedCrawling() {
        if (this.status.isRunning) {
            throw new Error('크롤링이 이미 실행 중입니다.');
        }
        this.status.isRunning = true;
        this.status.startTime = new Date();
        this.status.currentStep = '최적화된 크롤링 시작';
        const result = {
            success: false,
            totalGyms: 0,
            publicApiGyms: 0,
            crawlingGyms: 0,
            mergedGyms: 0,
            duration: 0,
            processingTime: 0,
            errors: [],
            warnings: [],
            dataQuality: {
                average: 0,
                min: 0,
                max: 0,
                distribution: {}
            }
        };
        const startTime = Date.now();
        try {
            console.log('🚀 최적화된 크롤링 시작');
            if (this.config.enablePublicApi) {
                this.status.currentStep = '공공 API 데이터 수집 (최적화)';
                const publicApiData = await this.collectFromPublicAPIOptimized();
                result.publicApiGyms = publicApiData.length;
                console.log(`✅ 공공 API 수집 완료: ${publicApiData.length}개 헬스장`);
                if (this.config.saveToFile) {
                    await this.saveToGymsRawOptimized(publicApiData);
                }
            }
            if (this.config.enableCrawling) {
                this.status.currentStep = '최적화된 웹 크롤링';
                const crawlingResults = await this.crawlGymsOptimized();
                result.crawlingGyms = crawlingResults.length;
                console.log(`✅ 최적화된 크롤링 완료: ${crawlingResults.length}개 헬스장`);
                if (this.config.saveToFile && crawlingResults.length > 0) {
                    await this.mergeAndSaveOptimized(crawlingResults);
                }
            }
            if (this.config.enableQualityCheck) {
                this.status.currentStep = '데이터 품질 검사 (최적화)';
                const qualityResult = await this.checkDataQualityOptimized();
                result.dataQuality = {
                    average: qualityResult.averageConfidence,
                    min: 0,
                    max: 1,
                    distribution: qualityResult.distribution
                };
            }
            result.totalGyms = result.publicApiGyms + result.crawlingGyms;
            result.mergedGyms = result.totalGyms;
            result.duration = Date.now() - startTime;
            result.processingTime = result.duration;
            result.success = true;
            console.log(`🎉 최적화된 크롤링 완료: ${result.totalGyms}개 헬스장 (${result.processingTime}ms)`);
            this.historyTracker.recordNameCrawling(this.status);
        }
        catch (error) {
            console.error('❌ 최적화된 크롤링 실패:', error);
            result.success = false;
            this.status.errors.push(error instanceof Error ? error.message : String(error));
        }
        finally {
            this.status.isRunning = false;
            this.status.currentStep = '완료';
        }
        return result;
    }
    async collectFromPublicAPIOptimized() {
        console.log('🔄 최적화된 공공 API 데이터 수집 시작');
        try {
            const rawData = await this.publicApiSource.collectData();
            const batchSize = this.config.batchSize;
            const batches = this.createBatches(rawData, batchSize);
            const processedBatches = [];
            for (const batch of batches) {
                const processedBatch = await Promise.all(batch.map(data => this.processPublicApiData(data)));
                processedBatches.push(processedBatch);
            }
            const processedData = processedBatches.flat();
            if (this.config.enableCaching) {
                this.updateCache(processedData);
            }
            console.log(`✅ 최적화된 공공 API 처리 완료: ${processedData.length}개`);
            return processedData;
        }
        catch (error) {
            console.error('❌ 최적화된 공공 API 수집 실패:', error);
            throw error;
        }
    }
    async crawlGymsOptimized() {
        console.log('🔄 최적화된 웹 크롤링 시작');
        try {
            const gymsRawData = await this.readGymsRawData();
            if (!gymsRawData || gymsRawData.length === 0) {
                console.log('⚠️ gyms_raw.json 데이터가 없습니다.');
                return [];
            }
            const batchSize = this.config.batchSize;
            const batches = this.createBatches(gymsRawData, batchSize);
            const allResults = [];
            for (let i = 0; i < batches.length; i++) {
                const batch = batches[i];
                console.log(`🔄 배치 ${i + 1}/${batches.length} 처리 중 (${batch.length}개 헬스장)`);
                const batchResults = await this.processBatchOptimized(batch);
                allResults.push(...batchResults);
                if (i < batches.length - 1 && this.config.delayBetweenBatches > 0) {
                    await this.delay(this.config.delayBetweenBatches);
                }
                this.updateProgress(i + 1, batches.length);
            }
            console.log(`✅ 최적화된 웹 크롤링 완료: ${allResults.length}개 헬스장`);
            return allResults;
        }
        catch (error) {
            console.error('❌ 최적화된 웹 크롤링 실패:', error);
            throw error;
        }
    }
    async processBatchOptimized(batch) {
        const results = [];
        const semaphore = new Semaphore(this.config.maxConcurrentRequests);
        const promises = batch.map(async (gym) => {
            return semaphore.acquire(async () => {
                try {
                    const cacheKey = this.generateCacheKey(gym.name, gym.address);
                    if (this.config.enableCaching && this.cache.has(cacheKey)) {
                        const cached = this.cache.get(cacheKey);
                        console.log(`📋 캐시에서 데이터 반환: ${gym.name}`);
                        return cached;
                    }
                    const searchResults = await this.searchEngineFactory.searchOptimized(gym.name, gym.address, this.config.minSearchConfidence);
                    const mergedSearchResult = this.searchEngineFactory.mergeSearchResults(searchResults);
                    if (mergedSearchResult) {
                        const processedData = this.convertEnhancedGymInfoToProcessedGymData(mergedSearchResult, gym);
                        if (this.config.enableCaching) {
                            this.cache.set(cacheKey, processedData);
                        }
                        return processedData;
                    }
                    else {
                        console.log(`⚠️ 검색 결과 없음: ${gym.name}`);
                        return null;
                    }
                }
                catch (error) {
                    console.error(`❌ 크롤링 실패: ${gym.name}`, error);
                    return null;
                }
            });
        });
        const batchResults = await Promise.all(promises);
        const validResults = batchResults.filter((result) => result !== null);
        results.push(...validResults);
        return results;
    }
    async mergeAndSaveOptimized(crawlingResults) {
        console.log('🔄 최적화된 데이터 병합 및 저장 시작');
        try {
            const existingData = await this.readGymsRawData();
            const mergeResult = await this.unifiedDataMerger.mergeGymDataWithCrawling(existingData, crawlingResults);
            console.log(`✅ 최적화된 병합 완료: ${mergeResult.mergedData.length}개 헬스장`);
            console.log(`📊 통계: 성공 ${mergeResult.statistics.successfullyMerged}개, 폴백 ${mergeResult.statistics.fallbackUsed}개`);
            console.log(`⏱️ 처리 시간: ${mergeResult.statistics.processingTime}ms`);
            await this.saveToGymsRawOptimized(mergeResult.mergedData);
        }
        catch (error) {
            console.error('❌ 최적화된 데이터 병합 실패:', error);
            throw error;
        }
    }
    async checkDataQualityOptimized() {
        console.log('🔄 최적화된 데이터 품질 검사 시작');
        try {
            const gymsData = await this.readGymsRawData();
            let totalConfidence = 0;
            let totalCompleteness = 0;
            let totalAccuracy = 0;
            let validCount = 0;
            const distribution = {};
            for (const gym of gymsData) {
                if (this.dataValidator.validateGymData(gym)) {
                    totalConfidence += gym.confidence || 0.5;
                    totalCompleteness += this.calculateCompleteness(gym);
                    totalAccuracy += this.calculateAccuracy(gym);
                    validCount++;
                    const serviceType = gym.serviceType || 'unknown';
                    distribution[serviceType] = (distribution[serviceType] || 0) + 1;
                }
            }
            const result = {
                averageConfidence: validCount > 0 ? totalConfidence / validCount : 0,
                completenessScore: validCount > 0 ? totalCompleteness / validCount : 0,
                accuracyScore: validCount > 0 ? totalAccuracy / validCount : 0,
                distribution
            };
            console.log(`✅ 최적화된 품질 검사 완료: 신뢰도 ${result.averageConfidence.toFixed(2)}`);
            return result;
        }
        catch (error) {
            console.error('❌ 최적화된 품질 검사 실패:', error);
            throw error;
        }
    }
    convertEnhancedGymInfoToProcessedGymData(enhancedInfo, originalGym) {
        return {
            ...originalGym,
            rating: originalGym?.rating || enhancedInfo.rating,
            reviewCount: originalGym?.reviewCount || enhancedInfo.reviewCount,
            openHour: originalGym?.openHour || enhancedInfo.openHour,
            closeHour: originalGym?.closeHour || enhancedInfo.closeHour,
            price: originalGym?.price || enhancedInfo.price,
            membershipPrice: originalGym?.membershipPrice || enhancedInfo.membershipPrice,
            ptPrice: originalGym?.ptPrice || enhancedInfo.ptPrice,
            gxPrice: originalGym?.gxPrice || enhancedInfo.gxPrice,
            dayPassPrice: originalGym?.dayPassPrice || enhancedInfo.dayPassPrice,
            priceDetails: originalGym?.priceDetails || enhancedInfo.priceDetails,
            minimumPrice: originalGym?.minimumPrice || enhancedInfo.minimumPrice,
            discountInfo: originalGym?.discountInfo || enhancedInfo.discountInfo,
            facilities: this.mergeArrays(originalGym?.facilities, enhancedInfo.facilities),
            services: this.mergeArrays(originalGym?.services, enhancedInfo.services),
            website: originalGym?.website || enhancedInfo.website,
            instagram: originalGym?.instagram || enhancedInfo.instagram,
            facebook: originalGym?.facebook || enhancedInfo.facebook,
            source: this.mergeSources(originalGym?.source, enhancedInfo.source),
            confidence: Math.max(originalGym?.confidence || 0.5, enhancedInfo.confidence),
            serviceType: originalGym?.serviceType || this.determineServiceType(enhancedInfo.name),
            isCurrentlyOpen: originalGym?.isCurrentlyOpen !== undefined ? originalGym.isCurrentlyOpen : true,
            updatedAt: new Date().toISOString(),
            crawledAt: new Date().toISOString()
        };
    }
    mergeArrays(original, crawled) {
        const result = new Set();
        if (original) {
            if (Array.isArray(original)) {
                original.forEach(item => item && result.add(item));
            }
            else if (typeof original === 'string') {
                result.add(original);
            }
        }
        if (crawled) {
            if (Array.isArray(crawled)) {
                crawled.forEach(item => item && result.add(item));
            }
            else if (typeof crawled === 'string') {
                result.add(crawled);
            }
        }
        return Array.from(result);
    }
    mergeSources(originalSource, crawledSource) {
        const sources = new Set();
        if (originalSource)
            sources.add(originalSource);
        if (crawledSource && crawledSource !== originalSource)
            sources.add(crawledSource);
        return Array.from(sources).join(' + ');
    }
    async processPublicApiData(data) {
        return {
            id: data.id,
            name: data.name,
            address: data.address,
            phone: data.phone,
            latitude: data.latitude,
            longitude: data.longitude,
            type: data.type,
            is24Hours: data.is24Hours,
            hasParking: data.hasParking,
            hasShower: data.hasShower,
            createdAt: data.createdAt,
            updatedAt: new Date().toISOString(),
            businessStatus: data.businessStatus,
            businessType: data.businessType,
            detailBusinessType: data.detailBusinessType,
            cultureSportsType: data.cultureSportsType,
            managementNumber: data.managementNumber,
            approvalDate: data.approvalDate,
            siteArea: data.siteArea,
            postalCode: data.postalCode,
            sitePostalCode: data.sitePostalCode,
            siteAddress: data.siteAddress,
            roadAddress: data.roadAddress,
            roadPostalCode: data.roadPostalCode,
            insuranceCode: data.insuranceCode,
            leaderCount: data.leaderCount,
            buildingCount: data.buildingCount,
            buildingArea: data.buildingArea,
            source: data.source || 'seoul_public_api',
            confidence: data.confidence || 0.8,
            serviceType: this.determineServiceType(data.name || 'Unknown'),
            isCurrentlyOpen: data.isCurrentlyOpen !== undefined ? data.isCurrentlyOpen : true,
            crawledAt: new Date().toISOString()
        };
    }
    calculateCompleteness(gym) {
        let score = 0;
        let factors = 0;
        const requiredFields = ['name', 'address', 'phone'];
        const optionalFields = ['rating', 'openHour', 'price', 'website'];
        for (const field of requiredFields) {
            if (gym[field])
                score += 0.3;
            factors += 0.3;
        }
        for (const field of optionalFields) {
            if (gym[field])
                score += 0.1;
            factors += 0.1;
        }
        return factors > 0 ? score / factors : 0;
    }
    calculateAccuracy(gym) {
        let score = 0;
        let factors = 0;
        if (gym.confidence) {
            score += gym.confidence;
            factors += 1;
        }
        if (gym.rating && gym.rating >= 1 && gym.rating <= 5) {
            score += 0.8;
            factors += 1;
        }
        if (gym.reviewCount && gym.reviewCount > 0) {
            score += 0.7;
            factors += 1;
        }
        return factors > 0 ? score / factors : 0.5;
    }
    determineServiceType(gymName) {
        const name = gymName.toLowerCase();
        if (name.includes('크로스핏') || name.includes('crossfit'))
            return '크로스핏';
        if (name.includes('pt') || name.includes('개인트레이닝'))
            return 'pt';
        if (name.includes('gx') || name.includes('그룹'))
            return 'gx';
        if (name.includes('요가') || name.includes('yoga'))
            return '요가';
        if (name.includes('필라테스') || name.includes('pilates'))
            return '필라테스';
        return 'gym';
    }
    updateCache(data) {
        if (!this.config.enableCaching)
            return;
        for (const item of data) {
            const key = this.generateCacheKey(item.name, item.address);
            this.cache.set(key, item);
            if (this.cache.size > this.config.cacheSize) {
                const firstKey = this.cache.keys().next().value;
                if (firstKey) {
                    this.cache.delete(firstKey);
                }
            }
        }
    }
    generateCacheKey(name, address) {
        return `${name.toLowerCase().replace(/\s+/g, '')}-${address.toLowerCase().replace(/\s+/g, '')}`;
    }
    createBatches(items, batchSize) {
        const batches = [];
        for (let i = 0; i < items.length; i += batchSize) {
            batches.push(items.slice(i, i + batchSize));
        }
        return batches;
    }
    updateProgress(current, total) {
        const percentage = Math.round((current / total) * 100);
        this.status.progress = { current, total, percentage };
        if (this.status.startTime) {
            const elapsed = Date.now() - this.status.startTime.getTime();
            const estimatedTotal = (elapsed / current) * total;
            this.status.estimatedCompletion = new Date(this.status.startTime.getTime() + estimatedTotal);
        }
    }
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    async readGymsRawData() {
        try {
            const fs = await Promise.resolve().then(() => __importStar(require('fs/promises')));
            const path = await Promise.resolve().then(() => __importStar(require('path')));
            const filePath = path.join(process.cwd(), 'src', 'data', 'gyms_raw.json');
            const data = await fs.readFile(filePath, 'utf-8');
            return JSON.parse(data);
        }
        catch (error) {
            console.error('❌ gyms_raw.json 읽기 실패:', error);
            return [];
        }
    }
    async saveToGymsRawOptimized(data) {
        try {
            const fs = await Promise.resolve().then(() => __importStar(require('fs/promises')));
            const path = await Promise.resolve().then(() => __importStar(require('path')));
            const filePath = path.join(process.cwd(), 'src', 'data', 'gyms_raw.json');
            await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
            console.log(`💾 최적화된 저장 완료: ${data.length}개 헬스장`);
        }
        catch (error) {
            console.error('❌ 최적화된 저장 실패:', error);
            throw error;
        }
    }
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        this.searchEngineFactory.updateConfig({
            timeout: this.config.timeout,
            delay: this.config.delayBetweenBatches,
            maxRetries: this.config.maxRetries,
            enableParallel: this.config.enableParallelProcessing,
            maxConcurrent: this.config.maxConcurrentRequests
        });
    }
    getStatus() {
        return { ...this.status };
    }
    getCacheStats() {
        return {
            size: this.cache.size,
            hitRate: 0
        };
    }
    cleanup() {
        this.cache.clear();
        this.processingQueue = [];
        this.activeProcesses = 0;
        this.searchEngineFactory.cleanup();
        this.unifiedDataMerger.clearCache();
    }
}
exports.OptimizedCrawlingService = OptimizedCrawlingService;
class Semaphore {
    constructor(permits) {
        this.waiting = [];
        this.permits = permits;
    }
    async acquire(fn) {
        await this.waitForPermit();
        try {
            return await fn();
        }
        finally {
            this.release();
        }
    }
    async waitForPermit() {
        if (this.permits > 0) {
            this.permits--;
            return;
        }
        return new Promise((resolve) => {
            this.waiting.push(resolve);
        });
    }
    release() {
        if (this.waiting.length > 0) {
            const resolve = this.waiting.shift();
            resolve();
        }
        else {
            this.permits++;
        }
    }
}
