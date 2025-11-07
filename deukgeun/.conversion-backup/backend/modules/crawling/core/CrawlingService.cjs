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
exports.CrawlingService = void 0;
const DataProcessor_1 = require('./DataProcessor.cjs');
const PublicApiSource_1 = require('../sources/PublicApiSource.cjs');
const OptimizedGymCrawlingSource_1 = require('../sources/OptimizedGymCrawlingSource.cjs');
const DataMerger_1 = require('../processors/DataMerger.cjs');
const EnhancedDataMerger_1 = require('../processors/EnhancedDataMerger.cjs');
const DataValidator_1 = require('../processors/DataValidator.cjs');
const CrawlingHistoryTracker_1 = require('../tracking/CrawlingHistoryTracker.cjs');
const pathUtils_1 = require('../utils/pathUtils.cjs');
class CrawlingService {
    constructor(gymRepo) {
        this.gymRepo = gymRepo;
        this.dataProcessor = gymRepo ? new DataProcessor_1.DataProcessor(gymRepo) : null;
        this.publicApiSource = new PublicApiSource_1.PublicApiSource();
        this.optimizedCrawlingSource = new OptimizedGymCrawlingSource_1.OptimizedGymCrawlingSource();
        this.dataMerger = new DataMerger_1.DataMerger();
        this.enhancedDataMerger = new EnhancedDataMerger_1.EnhancedDataMerger();
        this.dataValidator = new DataValidator_1.DataValidator();
        this.historyTracker = new CrawlingHistoryTracker_1.CrawlingHistoryTracker();
        this.config = {
            enablePublicApi: true,
            enableCrawling: true,
            enableDataMerging: true,
            enableQualityCheck: true,
            batchSize: 5,
            maxConcurrentRequests: 1,
            delayBetweenBatches: 10000,
            maxRetries: 3,
            timeout: 30000,
            saveToFile: true,
            saveToDatabase: false
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
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
    }
    getStatus() {
        return { ...this.status };
    }
    async collectFromPublicAPI() {
        console.log('📡 공공 API에서 헬스장 데이터 수집 시작');
        const startTime = Date.now();
        const maxExecutionTime = 5 * 60 * 1000;
        try {
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => {
                    reject(new Error('공공 API 데이터 수집 타임아웃 (5분 초과)'));
                }, maxExecutionTime);
            });
            const apiPromise = this.publicApiSource.fetchAllPublicAPIData();
            const publicApiData = await Promise.race([apiPromise, timeoutPromise]);
            if (!Array.isArray(publicApiData)) {
                console.error('❌ 공공 API 데이터가 배열 형식이 아닙니다');
                return [];
            }
            const MAX_ITEMS = 10000;
            const limitedData = publicApiData.length > MAX_ITEMS
                ? publicApiData.slice(0, MAX_ITEMS)
                : publicApiData;
            if (publicApiData.length > MAX_ITEMS) {
                console.warn(`⚠️ 공공 API 데이터가 너무 많습니다 (${publicApiData.length}개). 최대 ${MAX_ITEMS}개만 사용합니다.`);
            }
            const mergedData = this.dataMerger.mergeGymData(limitedData);
            const duration = Date.now() - startTime;
            console.log(`✅ 공공 API 데이터 수집 완료: ${mergedData.length}개 헬스장 (${(duration / 1000).toFixed(2)}초)`);
            return mergedData;
        }
        catch (error) {
            const duration = Date.now() - startTime;
            console.error('❌ 공공 API 데이터 수집 실패:', error);
            if (error instanceof Error) {
                console.error(`   에러 메시지: ${error.message}`);
                if (error.stack) {
                    console.error(`   스택 트레이스: ${error.stack.substring(0, 500)}`);
                }
            }
            console.error(`   소요 시간: ${(duration / 1000).toFixed(2)}초`);
            return [];
        }
    }
    async crawlGymDetails(options) {
        if (!options || typeof options !== 'object') {
            console.error('❌ 크롤링 옵션이 유효하지 않습니다');
            return null;
        }
        if (!this.config.enableCrawling) {
            console.log('⚠️ 크롤링이 비활성화되어 있습니다');
            return null;
        }
        if (!options.gymName || typeof options.gymName !== 'string' || options.gymName.trim().length === 0) {
            console.error('❌ 헬스장 이름이 필요합니다');
            return null;
        }
        if (options.gymName.length > 200) {
            console.error(`❌ 헬스장 이름이 너무 깁니다: ${options.gymName.length}자 (최대 200자)`);
            return null;
        }
        if (options.gymAddress && options.gymAddress.length > 500) {
            console.error(`❌ 헬스장 주소가 너무 깁니다: ${options.gymAddress.length}자 (최대 500자)`);
            return null;
        }
        const startTime = Date.now();
        const maxExecutionTime = 2 * 60 * 1000;
        console.log(`🔍 헬스장 정보 크롤링 시작: ${options.gymName}`);
        try {
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => {
                    reject(new Error('헬스장 크롤링 타임아웃 (2분 초과)'));
                }, maxExecutionTime);
            });
            const crawlPromise = this.optimizedCrawlingSource.crawlGymsFromRawData([{
                    name: options.gymName.trim(),
                    address: (options.gymAddress || '').trim(),
                    source: 'manual_search',
                    confidence: 0.5
                }]);
            const webResult = await Promise.race([crawlPromise, timeoutPromise]);
            if (!webResult || !Array.isArray(webResult) || webResult.length === 0) {
                console.log(`❌ 헬스장 크롤링 실패: ${options.gymName}`);
                return null;
            }
            const result = webResult[0];
            if (!result || typeof result !== 'object') {
                console.error(`❌ 헬스장 크롤링 결과가 유효하지 않습니다: ${options.gymName}`);
                return null;
            }
            if (!result.name || !result.address) {
                console.warn(`⚠️ 헬스장 크롤링 결과에 필수 필드가 없습니다: ${options.gymName}`);
                return null;
            }
            const duration = Date.now() - startTime;
            console.log(`✅ 헬스장 크롤링 완료: ${options.gymName} (${(duration / 1000).toFixed(2)}초)`);
            return result;
        }
        catch (error) {
            const duration = Date.now() - startTime;
            console.error(`❌ 헬스장 크롤링 오류: ${options.gymName}`, error);
            if (error instanceof Error) {
                console.error(`   에러 메시지: ${error.message}`);
                if (error.stack) {
                    console.error(`   스택 트레이스: ${error.stack.substring(0, 500)}`);
                }
            }
            console.error(`   소요 시간: ${(duration / 1000).toFixed(2)}초`);
            return null;
        }
    }
    async executeIntegratedCrawling() {
        if (this.status.isRunning) {
            const errorMsg = '크롤링이 이미 실행 중입니다';
            console.error(`❌ ${errorMsg}`);
            throw new Error(errorMsg);
        }
        this.status.isRunning = true;
        this.status.startTime = new Date();
        this.status.errors = [];
        this.status.currentStep = '초기화';
        let sessionId = null;
        try {
            sessionId = this.historyTracker.startSession(this.config);
        }
        catch (error) {
            console.warn('⚠️ 히스토리 추적 시작 실패:', error);
        }
        console.log('🚀 통합 크롤링 시작 (새로운 구조)');
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
                distribution: {},
                complete: 0,
                partial: 0,
                minimal: 0,
                averageQualityScore: 0
            }
        };
        try {
            if (this.config.enablePublicApi) {
                this.status.currentStep = '공공 API 데이터 수집 (영업중 + 헬스장 필터링)';
                const publicApiData = await this.collectFromPublicAPI();
                result.publicApiGyms = publicApiData.length;
                this.historyTracker.recordApiCollection({ current: publicApiData.length, total: publicApiData.length }, { count: publicApiData.length });
                console.log(`✅ 공공 API 수집 완료: ${publicApiData.length}개 헬스장 (영업중 + 필터링됨)`);
                if (this.config.saveToFile) {
                    await this.saveToGymsRaw(publicApiData);
                }
            }
            if (this.config.enableCrawling) {
                this.status.currentStep = 'gyms_raw name 기반 웹 크롤링';
                const crawlingResults = await this.crawlGymsFromRawData();
                result.crawlingGyms = crawlingResults.length;
                const crawlingProgress = this.getStatus();
                this.historyTracker.recordNameCrawling(crawlingProgress);
                console.log(`✅ name 기반 크롤링 완료: ${crawlingResults.length}개 헬스장`);
                if (this.config.saveToFile && crawlingResults.length > 0) {
                    await this.mergeAndSaveToGymsRaw(crawlingResults);
                }
            }
            if (this.config.enableQualityCheck) {
                this.status.currentStep = '데이터 품질 검사';
                const qualityResult = await this.dataProcessor?.checkDataQuality();
                result.dataQuality = qualityResult || { average: 0, min: 0, max: 0, distribution: {} };
            }
            result.totalGyms = result.publicApiGyms + result.crawlingGyms;
            result.success = true;
            result.duration = Date.now() - this.status.startTime.getTime();
            console.log(`✅ 통합 크롤링 완료: 공공API ${result.publicApiGyms}개, name 크롤링 ${result.crawlingGyms}개, 총 ${result.totalGyms}개 헬스장, ${(result.duration / 1000).toFixed(1)}초`);
        }
        catch (error) {
            result.success = false;
            const errorMessage = error instanceof Error ? error.message : String(error);
            result.errors.push(errorMessage);
            this.status.errors.push(errorMessage);
            this.historyTracker.recordError(errorMessage, this.status.currentStep);
            console.error('❌ 통합 크롤링 실패:', error);
        }
        finally {
            this.status.isRunning = false;
            this.status.currentStep = '완료';
            if (sessionId) {
                this.historyTracker.endSession(sessionId, result.success ? 'completed' : 'failed');
            }
            await this.historyTracker.saveHistoryToFile();
        }
        return result;
    }
    async crawlGymsFromRawData() {
        console.log('🔍 gyms_raw.json 기반 웹 크롤링 시작');
        try {
            const fs = await Promise.resolve().then(() => __importStar(require('fs/promises')));
            const filePath = (0, pathUtils_1.getGymsRawPath)();
            let gymsRawData = [];
            try {
                const content = await fs.readFile(filePath, 'utf-8');
                gymsRawData = JSON.parse(content);
                console.log(`📄 gyms_raw.json 로드 완료: ${gymsRawData.length}개 헬스장`);
            }
            catch (error) {
                console.error('❌ gyms_raw.json 파일을 읽을 수 없습니다:', error);
                return [];
            }
            if (gymsRawData.length === 0) {
                console.log('⚠️ gyms_raw.json에 데이터가 없습니다');
                return [];
            }
            const enhancedResults = await this.optimizedCrawlingSource.crawlGymsFromRawData(gymsRawData);
            const crawlingResults = enhancedResults.map((enhancedInfo, index) => {
                const originalGym = gymsRawData[index];
                return this.enhancedDataMerger.convertEnhancedGymInfoToProcessedGymData(enhancedInfo, originalGym);
            });
            console.log(`✅ gyms_raw 기반 크롤링 완료: ${crawlingResults.length}개 헬스장`);
            return crawlingResults;
        }
        catch (error) {
            console.error('❌ gyms_raw 기반 크롤링 실패:', error);
            return [];
        }
    }
    async mergeAndSaveToGymsRaw(crawledData) {
        try {
            const fs = await Promise.resolve().then(() => __importStar(require('fs/promises')));
            const filePath = (0, pathUtils_1.getGymsRawPath)();
            let existingData = [];
            try {
                const existingContent = await fs.readFile(filePath, 'utf-8');
                existingData = JSON.parse(existingContent);
            }
            catch (error) {
                console.log('📄 gyms_raw.json 파일을 찾을 수 없습니다');
                return { successfulMerges: 0, fallbackUsed: 0, qualityScore: 0 };
            }
            const mergeResult = await this.enhancedDataMerger.mergeGymDataWithCrawling(existingData, crawledData);
            await fs.writeFile(filePath, JSON.stringify(mergeResult.mergedData, null, 2), 'utf-8');
            console.log(`💾 gyms_raw.json 병합 저장 완료: ${mergeResult.mergedData.length}개 헬스장`);
            console.log(`📊 병합 통계: 성공 ${mergeResult.statistics.successfullyMerged}개, 폴백 ${mergeResult.statistics.fallbackUsed}개, 중복제거 ${mergeResult.statistics.duplicatesRemoved}개`);
            console.log(`⭐ 품질 점수: ${mergeResult.statistics.qualityScore.toFixed(2)}`);
            if (mergeResult.conflicts.length > 0) {
                console.log(`⚠️ 충돌 발생: ${mergeResult.conflicts.length}개 필드`);
                mergeResult.conflicts.forEach(conflict => {
                    console.log(`  - ${conflict.gymName}: ${conflict.field} (${conflict.resolution})`);
                });
            }
            return {
                successfulMerges: mergeResult.statistics.successfullyMerged,
                fallbackUsed: mergeResult.statistics.fallbackUsed,
                qualityScore: mergeResult.statistics.qualityScore
            };
        }
        catch (error) {
            console.error('❌ gyms_raw.json 병합 저장 실패:', error);
            return { successfulMerges: 0, fallbackUsed: 0, qualityScore: 0 };
        }
    }
    getCrawlingProgress() {
        return this.status;
    }
    getCurrentSession() {
        return this.historyTracker.getCurrentSession();
    }
    getSession(sessionId) {
        return this.historyTracker.getSession(sessionId);
    }
    getRecentSessions(limit = 10) {
        return this.historyTracker.getRecentSessions(limit);
    }
    getSessionStatistics() {
        return this.historyTracker.getSessionStatistics();
    }
    async loadHistory() {
        await this.historyTracker.loadHistoryFromFile();
    }
    async crawlAdditionalInfo() {
        console.log('🔍 공공 API 데이터로 웹 크롤링 시작');
        try {
            const publicApiData = await this.collectFromPublicAPI();
            const crawlingResults = [];
            for (let i = 0; i < publicApiData.length; i += this.config.batchSize) {
                const batch = publicApiData.slice(i, i + this.config.batchSize);
                console.log(`📦 배치 처리 중: ${i + 1}-${Math.min(i + this.config.batchSize, publicApiData.length)}/${publicApiData.length}`);
                const batchResults = [];
                for (const gym of batch) {
                    try {
                        const crawlingResults = await this.optimizedCrawlingSource.crawlGymsFromRawData([gym]);
                        const crawlingResult = crawlingResults[0] || null;
                        if (crawlingResult) {
                            const mergedResult = this.dataMerger.mergeGymData([gym, crawlingResult])[0];
                            batchResults.push({ status: 'fulfilled', value: mergedResult });
                        }
                        else {
                            batchResults.push({ status: 'fulfilled', value: gym });
                        }
                    }
                    catch (error) {
                        console.error(`❌ 크롤링 실패: ${gym.name}`, error);
                        batchResults.push({ status: 'fulfilled', value: gym });
                    }
                    await new Promise(resolve => setTimeout(resolve, 2000));
                }
                const validResults = batchResults
                    .filter(result => result.status === 'fulfilled')
                    .map(result => result.value);
                crawlingResults.push(...validResults);
                if (i + this.config.batchSize < publicApiData.length) {
                    await new Promise(resolve => setTimeout(resolve, this.config.delayBetweenBatches));
                }
            }
            console.log(`✅ 웹 크롤링 완료: ${crawlingResults.length}개 헬스장 처리`);
            return crawlingResults;
        }
        catch (error) {
            console.error('❌ 웹 크롤링 실패:', error);
            return [];
        }
    }
    async saveToGymsRaw(data) {
        try {
            const fs = await Promise.resolve().then(() => __importStar(require('fs/promises')));
            const filePath = (0, pathUtils_1.getGymsRawPath)();
            let existingData = [];
            try {
                const existingContent = await fs.readFile(filePath, 'utf-8');
                existingData = JSON.parse(existingContent);
            }
            catch (error) {
                console.log('📄 새로운 gyms_raw.json 파일 생성');
            }
            const mergedData = this.dataMerger.mergeGymData([...existingData, ...data]);
            await fs.writeFile(filePath, JSON.stringify(mergedData, null, 2), 'utf-8');
            console.log(`💾 gyms_raw.json 저장 완료: ${mergedData.length}개 헬스장`);
        }
        catch (error) {
            console.error('❌ gyms_raw.json 저장 실패:', error);
        }
    }
    async appendToGymsRaw(data) {
        try {
            const fs = await Promise.resolve().then(() => __importStar(require('fs/promises')));
            const filePath = (0, pathUtils_1.getGymsRawPath)();
            let existingData = [];
            try {
                const existingContent = await fs.readFile(filePath, 'utf-8');
                existingData = JSON.parse(existingContent);
            }
            catch (error) {
                console.log('📄 gyms_raw.json 파일을 찾을 수 없습니다');
                return;
            }
            const mergedData = this.dataMerger.mergeGymData([...existingData, ...data]);
            await fs.writeFile(filePath, JSON.stringify(mergedData, null, 2), 'utf-8');
            console.log(`💾 gyms_raw.json 업데이트 완료: ${mergedData.length}개 헬스장`);
        }
        catch (error) {
            console.error('❌ gyms_raw.json 업데이트 실패:', error);
        }
    }
    async cleanup() {
        console.log('🧹 크롤링 서비스 정리 중...');
        if (this.status.isRunning) {
            this.status.isRunning = false;
            this.status.currentStep = '중단됨';
        }
        await this.dataProcessor?.cleanup();
        console.log('✅ 크롤링 서비스 정리 완료');
    }
}
exports.CrawlingService = CrawlingService;
