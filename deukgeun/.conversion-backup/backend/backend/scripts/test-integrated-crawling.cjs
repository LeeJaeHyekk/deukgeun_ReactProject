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
exports.testIntegratedCrawling = testIntegratedCrawling;
require("reflect-metadata");
const CrawlingService_js_1 = require('modules/crawling/core/CrawlingService.js');
const dotenv = __importStar(require("dotenv"));
const path = __importStar(require("path"));
const pathUtils_1 = require('utils/pathUtils');
const __dirname = (0, pathUtils_1.getDirname)();
dotenv.config({ path: path.join(__dirname, '..', '.env') });
dotenv.config({ path: path.join(__dirname, '..', 'env.development') });
if (!process.env.SEOUL_OPENAPI_KEY) {
    console.error('❌ SEOUL_OPENAPI_KEY 환경 변수가 설정되지 않았습니다.');
    console.error('   .env 파일에 SEOUL_OPENAPI_KEY를 설정해주세요.');
    process.exit(1);
}
async function testIntegratedCrawling() {
    console.log('🧪 통합 크롤링 시스템 테스트 시작');
    console.log('='.repeat(70));
    let dataSource = null;
    let gymRepository = null;
    try {
        const mockRepository = {
            find: async () => [],
            findOne: async () => null,
            save: async (data) => data,
            create: (data) => data
        };
        gymRepository = mockRepository;
        console.log('✅ Mock Repository 초기화 완료');
    }
    catch (error) {
        console.log('⚠️ 데이터베이스 연결 없이 진행합니다 (파일 기반 테스트)');
        gymRepository = {};
    }
    try {
        const crawlingService = new CrawlingService_js_1.CrawlingService(gymRepository);
        crawlingService.updateConfig({
            enablePublicApi: true,
            enableCrawling: true,
            enableDataMerging: true,
            enableQualityCheck: true,
            batchSize: 3,
            maxConcurrentRequests: 1,
            delayBetweenBatches: 2000,
            maxRetries: 2,
            timeout: 15000,
            saveToFile: true,
            saveToDatabase: false
        });
        console.log('\n📋 크롤링 설정:');
        console.log('- 공공 API 수집: 활성화');
        console.log('- 웹 크롤링: 활성화');
        console.log('- 배치 크기: 3개');
        console.log('- 지연 시간: 2초');
        console.log('');
        console.log('🚀 통합 크롤링 실행 시작...\n');
        const result = await crawlingService.executeIntegratedCrawling();
        console.log('\n' + '='.repeat(70));
        console.log('📊 크롤링 결과 요약');
        console.log('='.repeat(70));
        console.log(`✅ 성공 여부: ${result.success ? '성공' : '실패'}`);
        console.log(`📡 공공 API 수집: ${result.publicApiGyms}개 헬스장`);
        console.log(`🔍 name 기반 크롤링: ${result.crawlingGyms}개 헬스장`);
        console.log(`📦 총 처리된 헬스장: ${result.totalGyms}개`);
        console.log(`⏱️  소요 시간: ${(result.duration / 1000).toFixed(1)}초`);
        if (result.dataQuality) {
            console.log('\n📈 데이터 품질:');
            console.log(`- 완전한 데이터: ${result.dataQuality.complete || 0}개`);
            console.log(`- 부분 데이터: ${result.dataQuality.partial || 0}개`);
            console.log(`- 최소 데이터: ${result.dataQuality.minimal || 0}개`);
            console.log(`- 평균 품질 점수: ${result.dataQuality.averageQualityScore?.toFixed(2) || 'N/A'}`);
        }
        if (result.errors && result.errors.length > 0) {
            console.log('\n⚠️ 오류:');
            result.errors.forEach((error, index) => {
                console.log(`${index + 1}. ${error}`);
            });
        }
        const sessionStats = crawlingService.getSessionStatistics();
        console.log('\n📊 세션 통계:');
        console.log(`- 총 세션 수: ${sessionStats.totalSessions}`);
        console.log(`- 완료된 세션: ${sessionStats.completedSessions}`);
        console.log(`- 실패한 세션: ${sessionStats.failedSessions}`);
        console.log(`- 총 처리 헬스장: ${sessionStats.totalGymsProcessed}`);
        console.log('\n✅ 통합 크롤링 테스트 완료!');
        console.log('\n💡 다음 단계:');
        console.log('1. src/data/gyms_raw.json 파일을 확인하세요');
        console.log('2. logs/crawling-history.json에서 히스토리를 확인하세요');
    }
    catch (error) {
        console.error('\n❌ 테스트 중 오류 발생:', error);
        if (error instanceof Error) {
            console.error('오류 메시지:', error.message);
            console.error('스택 트레이스:', error.stack);
        }
    }
    finally {
        if (dataSource && dataSource.isInitialized) {
            await dataSource.destroy();
            console.log('\n✅ 데이터베이스 연결 종료');
        }
    }
    console.log('\n' + '='.repeat(70));
    console.log('🏁 테스트 종료');
}
testIntegratedCrawling()
    .then(() => process.exit(0))
    .catch((error) => {
    console.error('스크립트 실행 실패:', error);
    process.exit(1);
});
