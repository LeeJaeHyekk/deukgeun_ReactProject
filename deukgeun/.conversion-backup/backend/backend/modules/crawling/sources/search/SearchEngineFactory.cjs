"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchEngineFactory = void 0;
const NaverCafeSearchEngine_1 = require('modules/crawling/sources/search/NaverCafeSearchEngine');
const NaverSearchEngine_1 = require('modules/crawling/sources/search/NaverSearchEngine');
const GoogleSearchEngine_1 = require('modules/crawling/sources/search/GoogleSearchEngine');
const DaumSearchEngine_1 = require('modules/crawling/sources/search/DaumSearchEngine');
const NaverBlogSearchEngine_1 = require('modules/crawling/sources/search/NaverBlogSearchEngine');
class SearchEngineFactory {
    constructor(config = {}) {
        this.engines = new Map();
        this.requestQueue = [];
        this.activeRequests = 0;
        this.config = {
            timeout: 45000,
            delay: 2000,
            maxRetries: 3,
            enableParallel: false,
            maxConcurrent: 1,
            ...config
        };
        this.initializeEngines();
    }
    initializeEngines() {
        const engineConfig = {
            timeout: this.config.timeout,
            delay: this.config.delay
        };
        this.engines.set('naver_cafe', new NaverCafeSearchEngine_1.NaverCafeSearchEngine(engineConfig.timeout, 3000));
        this.engines.set('naver', new NaverSearchEngine_1.NaverSearchEngine(engineConfig.timeout, engineConfig.delay));
        this.engines.set('google', new GoogleSearchEngine_1.GoogleSearchEngine(engineConfig.timeout, engineConfig.delay));
        this.engines.set('daum', new DaumSearchEngine_1.DaumSearchEngine(engineConfig.timeout, engineConfig.delay));
        this.engines.set('naver_blog', new NaverBlogSearchEngine_1.NaverBlogSearchEngine(engineConfig.timeout, engineConfig.delay));
    }
    async searchAll(gymName, address) {
        const startTime = Date.now();
        console.log(`🔍 통합 검색 시작: ${gymName} ${address ? `(${address})` : ''}`);
        if (this.config.enableParallel) {
            return this.searchParallel(gymName, address);
        }
        else {
            return this.searchSequential(gymName, address);
        }
    }
    async searchParallel(gymName, address) {
        const searchPromises = Array.from(this.engines.entries()).map(async ([engineName, engine]) => {
            return this.executeSearchWithRetry(engineName, engine, gymName, address);
        });
        const results = await Promise.allSettled(searchPromises);
        return results.map((result, index) => {
            const engineName = Array.from(this.engines.keys())[index];
            if (result.status === 'fulfilled') {
                return result.value;
            }
            else {
                return {
                    engine: engineName,
                    data: null,
                    confidence: 0,
                    processingTime: 0,
                    error: result.reason?.message || 'Unknown error'
                };
            }
        });
    }
    async searchSequential(gymName, address) {
        const results = [];
        for (const [engineName, engine] of this.engines) {
            const result = await this.executeSearchWithRetry(engineName, engine, gymName, address);
            results.push(result);
            if (this.config.delay > 0) {
                await this.delay(this.config.delay);
            }
        }
        return results;
    }
    async executeSearchWithRetry(engineName, engine, gymName, address) {
        const startTime = Date.now();
        let lastError = null;
        for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
            try {
                console.log(`🔍 ${engineName} 검색 시도 ${attempt}/${this.config.maxRetries}: ${gymName}`);
                const data = await engine.search(gymName, address);
                const processingTime = Date.now() - startTime;
                if (data) {
                    console.log(`✅ ${engineName} 검색 성공: ${gymName} (${processingTime}ms)`);
                    return {
                        engine: engineName,
                        data,
                        confidence: data.confidence || 0.5,
                        processingTime
                    };
                }
                else {
                    console.log(`⚠️ ${engineName} 검색 결과 없음: ${gymName}`);
                }
            }
            catch (error) {
                lastError = error instanceof Error ? error : new Error(String(error));
                console.warn(`❌ ${engineName} 검색 실패 (시도 ${attempt}/${this.config.maxRetries}): ${gymName}`, lastError.message);
                if (attempt < this.config.maxRetries) {
                    const delay = this.config.delay * attempt;
                    await this.delay(delay);
                }
            }
        }
        const processingTime = Date.now() - startTime;
        return {
            engine: engineName,
            data: null,
            confidence: 0,
            processingTime,
            error: lastError?.message || 'Max retries exceeded'
        };
    }
    async searchOptimized(gymName, address, minConfidence = 0.8) {
        const startTime = Date.now();
        console.log(`🔍 최적화된 검색 시작: ${gymName} (최소 신뢰도: ${minConfidence})`);
        const results = [];
        const searchPromises = new Map();
        for (const [engineName, engine] of this.engines) {
            const promise = this.executeSearchWithRetry(engineName, engine, gymName, address);
            searchPromises.set(engineName, promise);
        }
        for (const [engineName, promise] of searchPromises) {
            try {
                const result = await promise;
                if (result.data && result.confidence >= minConfidence) {
                    console.log(`🎯 ${engineName}에서 충분한 신뢰도 달성 (${result.confidence}), 조기 종료`);
                    results.push(result);
                    break;
                }
                else {
                    results.push(result);
                }
            }
            catch (error) {
                console.warn(`❌ ${engineName} 검색 실패:`, error);
                results.push({
                    engine: engineName,
                    data: null,
                    confidence: 0,
                    processingTime: 0,
                    error: error instanceof Error ? error.message : String(error)
                });
            }
        }
        const totalTime = Date.now() - startTime;
        console.log(`✅ 최적화된 검색 완료: ${results.length}개 결과 (${totalTime}ms)`);
        return results;
    }
    async searchWithEngine(engineName, gymName, address) {
        const engine = this.engines.get(engineName);
        if (!engine) {
            throw new Error(`검색 엔진을 찾을 수 없습니다: ${engineName}`);
        }
        return this.executeSearchWithRetry(engineName, engine, gymName, address);
    }
    mergeSearchResults(results) {
        if (results.length === 0)
            return null;
        const validResults = results.filter(result => result.data && result.confidence > 0);
        if (validResults.length === 0)
            return null;
        validResults.sort((a, b) => b.confidence - a.confidence);
        const bestResult = validResults[0].data;
        const mergedInfo = { ...bestResult };
        for (let i = 1; i < validResults.length; i++) {
            const result = validResults[i].data;
            if (!mergedInfo.phone && result.phone)
                mergedInfo.phone = result.phone;
            if (!mergedInfo.openHour && result.openHour)
                mergedInfo.openHour = result.openHour;
            if (!mergedInfo.closeHour && result.closeHour)
                mergedInfo.closeHour = result.closeHour;
            if (!mergedInfo.price && result.price)
                mergedInfo.price = result.price;
            if (!mergedInfo.rating && result.rating)
                mergedInfo.rating = result.rating;
            if (!mergedInfo.website && result.website)
                mergedInfo.website = result.website;
            if (result.facilities && result.facilities.length > 0) {
                const existingFacilities = mergedInfo.facilities || [];
                const newFacilities = result.facilities.filter(f => !existingFacilities.includes(f));
                mergedInfo.facilities = [...existingFacilities, ...newFacilities];
            }
            if (result.services && result.services.length > 0) {
                const existingServices = mergedInfo.services || [];
                const newServices = result.services.filter(s => !existingServices.includes(s));
                mergedInfo.services = [...existingServices, ...newServices];
            }
        }
        const sources = validResults.map(r => r.engine).join(' + ');
        mergedInfo.source = sources;
        const avgConfidence = validResults.reduce((sum, r) => sum + r.confidence, 0) / validResults.length;
        mergedInfo.confidence = Math.min(avgConfidence, 1.0);
        console.log(`🔄 검색 결과 통합 완료: ${validResults.length}개 엔진, 신뢰도 ${mergedInfo.confidence.toFixed(2)}`);
        return mergedInfo;
    }
    generateSearchStats(results) {
        const stats = {
            totalEngines: results.length,
            successfulSearches: 0,
            failedSearches: 0,
            averageConfidence: 0,
            averageProcessingTime: 0,
            engineStats: {}
        };
        let totalConfidence = 0;
        let totalProcessingTime = 0;
        for (const result of results) {
            const isSuccess = result.data !== null;
            if (isSuccess) {
                stats.successfulSearches++;
                totalConfidence += result.confidence;
            }
            else {
                stats.failedSearches++;
            }
            totalProcessingTime += result.processingTime;
            stats.engineStats[result.engine] = {
                success: isSuccess,
                confidence: result.confidence,
                processingTime: result.processingTime,
                error: result.error
            };
        }
        stats.averageConfidence = stats.successfulSearches > 0 ? totalConfidence / stats.successfulSearches : 0;
        stats.averageProcessingTime = totalProcessingTime / results.length;
        return stats;
    }
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        this.initializeEngines();
    }
    getAvailableEngines() {
        return Array.from(this.engines.keys());
    }
    async checkEngineHealth() {
        const health = {};
        for (const [engineName, engine] of this.engines) {
            try {
                const testResult = await engine.search('테스트', '서울');
                health[engineName] = true;
            }
            catch (error) {
                health[engineName] = false;
                console.warn(`❌ ${engineName} 엔진 상태 불량:`, error);
            }
        }
        return health;
    }
    cleanup() {
        this.engines.clear();
        this.requestQueue = [];
        this.activeRequests = 0;
    }
}
exports.SearchEngineFactory = SearchEngineFactory;
