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
exports.BaseSearchEngine = void 0;
const axios_1 = __importStar(require("axios"));
const cheerio = __importStar(require("cheerio"));
const AntiDetectionUtils_1 = require('modules/crawling/utils/AntiDetectionUtils');
const AdaptiveRetryManager_1 = require('modules/crawling/utils/AdaptiveRetryManager');
const FallbackStrategyManager_1 = require('modules/crawling/utils/FallbackStrategyManager');
const CrawlingMetrics_1 = require('modules/crawling/utils/CrawlingMetrics');
class BaseSearchEngine {
    constructor(timeout = 30000, delay = 2000) {
        this.timeout = 30000;
        this.delay = 2000;
        this.retryCount = 3;
        this.retryDelay = 5000;
        this.userAgents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0'
        ];
        this.timeout = timeout;
        this.delay = delay;
        this.retryManager = new AdaptiveRetryManager_1.AdaptiveRetryManager({
            maxRetries: 5,
            baseDelay: 2000,
            maxDelay: 30000,
            backoffMultiplier: 2,
            jitter: true
        });
        this.fallbackManager = new FallbackStrategyManager_1.FallbackStrategyManager();
        this.metricsCollector = new CrawlingMetrics_1.CrawlingMetricsCollector();
        this.initializeFallbackStrategies();
    }
    initializeFallbackStrategies() {
    }
    async executeWithFallback(primarySearch, gymName, address) {
        const startTime = this.metricsCollector.recordRequestStart(gymName, 'primary_search');
        try {
            const result = await this.retryManager.executeWithRetry(primarySearch, `search_${this.constructor.name}`);
            if (result && result.confidence && result.confidence > 0.1) {
                this.metricsCollector.recordRequestSuccess(gymName, 'primary_search', startTime, result);
                console.log(`✅ 기본 검색 성공: ${gymName} (신뢰도: ${result.confidence})`);
                return result;
            }
            console.log(`🔄 기본 검색 실패 - 폴백 전략 실행: ${gymName}`);
            const fallbackResult = await this.fallbackManager.executeFallback(gymName, address);
            if (fallbackResult.success && fallbackResult.data) {
                this.metricsCollector.recordRequestSuccess(gymName, fallbackResult.strategy, startTime, fallbackResult.data);
                console.log(`✅ 폴백 성공: ${gymName} (전략: ${fallbackResult.strategy})`);
                return fallbackResult.data;
            }
            console.log(`⚠️ 모든 전략 실패 - 기본 정보 반환: ${gymName}`);
            const minimalInfo = this.createMinimalInfo(gymName, address);
            this.metricsCollector.recordRequestSuccess(gymName, 'minimal_fallback', startTime, minimalInfo);
            return minimalInfo;
        }
        catch (error) {
            this.metricsCollector.recordRequestFailure(gymName, 'primary_search', startTime, error);
            console.error(`💥 검색 완전 실패: ${gymName}`, error);
            const minimalInfo = this.createMinimalInfo(gymName, address);
            this.metricsCollector.recordRequestSuccess(gymName, 'error_fallback', startTime, minimalInfo);
            return minimalInfo;
        }
    }
    createMinimalInfo(gymName, address) {
        return {
            name: gymName,
            address: address || '',
            phone: undefined,
            openHour: undefined,
            closeHour: undefined,
            price: undefined,
            rating: undefined,
            reviewCount: undefined,
            facilities: [],
            source: 'minimal_fallback',
            confidence: 0.05,
            type: 'private'
        };
    }
    getMetrics() {
        return this.metricsCollector.getMetrics();
    }
    generatePerformanceReport() {
        return this.metricsCollector.generatePerformanceReport();
    }
    resetMetrics() {
        this.metricsCollector.resetMetrics();
    }
    getHeaders() {
        return AntiDetectionUtils_1.AntiDetectionUtils.getEnhancedHeaders();
    }
    async makeRequest(url) {
        let lastError = null;
        for (let attempt = 1; attempt <= this.retryCount; attempt++) {
            try {
                if (attempt > 1) {
                    const randomDelay = Math.random() * 2000 + 1000;
                    console.log(`⏳ 재시도 ${attempt}/${this.retryCount} - ${Math.round(randomDelay)}ms 대기`);
                    await new Promise(resolve => setTimeout(resolve, randomDelay));
                }
                const response = await axios_1.default.get(url, {
                    headers: this.getHeaders(),
                    timeout: this.timeout,
                    maxRedirects: 5,
                    validateStatus: (status) => status < 500
                });
                if (response.status === 403) {
                    console.warn(`🚫 403 Forbidden 에러 (시도 ${attempt}/${this.retryCount})`);
                    if (attempt < this.retryCount) {
                        const backoffDelay = AntiDetectionUtils_1.AntiDetectionUtils.getExponentialBackoffDelay(attempt, this.retryDelay);
                        console.log(`⏳ 지수 백오프 지연: ${Math.round(backoffDelay)}ms`);
                        await new Promise(resolve => setTimeout(resolve, backoffDelay));
                        continue;
                    }
                }
                return response;
            }
            catch (error) {
                lastError = error;
                if (error instanceof axios_1.AxiosError) {
                    console.warn(`❌ 요청 실패 (시도 ${attempt}/${this.retryCount}): ${error.response?.status} ${error.message}`);
                    if (AntiDetectionUtils_1.AntiDetectionUtils.isRetryableError(error)) {
                        if (attempt < this.retryCount) {
                            const backoffDelay = AntiDetectionUtils_1.AntiDetectionUtils.getExponentialBackoffDelay(attempt, this.retryDelay);
                            console.log(`⏳ ${Math.round(backoffDelay)}ms 후 재시도...`);
                            await new Promise(resolve => setTimeout(resolve, backoffDelay));
                            continue;
                        }
                    }
                }
                if (attempt === this.retryCount) {
                    throw lastError;
                }
            }
        }
        throw lastError || new Error('모든 재시도 실패');
    }
    extractText(html) {
        const $ = cheerio.load(html);
        return $('body').text() || $('html').text() || '';
    }
    async delayExecution() {
        const randomDelay = AntiDetectionUtils_1.AntiDetectionUtils.getRandomDelay(this.delay, this.delay + 1000);
        await new Promise(resolve => setTimeout(resolve, randomDelay));
    }
    async delayBetweenRequests() {
        await AntiDetectionUtils_1.AntiDetectionUtils.humanLikeDelay();
    }
    extractPhoneNumber(text) {
        if (!text || typeof text !== 'string')
            return undefined;
        const phonePatterns = [
            /(\d{2,3}-\d{3,4}-\d{4})/g,
            /(\d{2,3}\s\d{3,4}\s\d{4})/g,
            /(\d{10,11})/g
        ];
        for (const pattern of phonePatterns) {
            const match = text.match(pattern);
            if (match && match[1]) {
                return match[1].replace(/\s+/g, '-');
            }
        }
        return undefined;
    }
    parseOperatingHours(text) {
        const timePatterns = [
            /(\d{1,2}:\d{2})\s*[-~]\s*(\d{1,2}:\d{2})/g,
            /(\d{1,2}시)\s*[-~]\s*(\d{1,2}시)/g,
            /오픈\s*(\d{1,2}:\d{2})/g,
            /마감\s*(\d{1,2}:\d{2})/g
        ];
        for (const pattern of timePatterns) {
            const match = pattern.exec(text);
            if (match) {
                if (match[2]) {
                    return { openHour: match[1], closeHour: match[2] };
                }
                else if (match[1]) {
                    return { openHour: match[1] };
                }
            }
        }
        return {};
    }
}
exports.BaseSearchEngine = BaseSearchEngine;
