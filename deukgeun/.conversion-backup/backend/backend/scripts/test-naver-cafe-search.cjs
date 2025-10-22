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
exports.testNaverCafeSearch = testNaverCafeSearch;
const NaverCafeSearchEngine_1 = require('modules/crawling/sources/search/NaverCafeSearchEngine');
const pathUtils_1 = require('modules/crawling/utils/pathUtils');
const fs = __importStar(require("fs/promises"));
async function testNaverCafeSearch() {
    console.log('🧪 네이버 카페 검색 로직 테스트 시작');
    console.log('='.repeat(50));
    try {
        const gymsRawPath = (0, pathUtils_1.getGymsRawPath)();
        const gymsRawContent = await fs.readFile(gymsRawPath, 'utf-8');
        const gymsData = JSON.parse(gymsRawContent);
        const testGyms = gymsData.slice(0, 3);
        console.log(`📋 테스트 대상: ${testGyms.length}개 헬스장`);
        const naverCafeEngine = new NaverCafeSearchEngine_1.NaverCafeSearchEngine(30000, 2000);
        const results = [];
        for (let i = 0; i < testGyms.length; i++) {
            const gym = testGyms[i];
            console.log(`\n🔍 테스트 ${i + 1}/${testGyms.length}: ${gym.name}`);
            console.log(`📍 주소: ${gym.address}`);
            try {
                const startTime = Date.now();
                const searchResult = await naverCafeEngine.search(gym.name, gym.address);
                const endTime = Date.now();
                if (searchResult) {
                    console.log(`✅ 검색 성공 (${endTime - startTime}ms)`);
                    console.log(`📞 전화번호: ${searchResult.phone || '없음'}`);
                    console.log(`🕐 운영시간: ${searchResult.openHour || '없음'} - ${searchResult.closeHour || '없음'}`);
                    console.log(`💰 가격: ${searchResult.price || '없음'}`);
                    console.log(`⭐ 평점: ${searchResult.rating || '없음'}`);
                    console.log(`📝 리뷰 수: ${searchResult.reviewCount || '없음'}`);
                    console.log(`🏢 시설: ${searchResult.facilities?.length || 0}개`);
                    console.log(`🎯 신뢰도: ${searchResult.confidence.toFixed(2)}`);
                    console.log(`📊 소스: ${searchResult.source}`);
                    results.push({
                        gymName: gym.name,
                        success: true,
                        data: searchResult,
                        duration: endTime - startTime
                    });
                }
                else {
                    console.log(`❌ 검색 실패 - 정보를 찾을 수 없음`);
                    results.push({
                        gymName: gym.name,
                        success: false,
                        data: null,
                        duration: endTime - startTime
                    });
                }
            }
            catch (error) {
                console.error(`❌ 검색 오류:`, error);
                results.push({
                    gymName: gym.name,
                    success: false,
                    error: error instanceof Error ? error.message : String(error),
                    duration: 0
                });
            }
            if (i < testGyms.length - 1) {
                console.log('⏳ 다음 테스트를 위해 3초 대기...');
                await new Promise(resolve => setTimeout(resolve, 3000));
            }
        }
        console.log('\n' + '='.repeat(50));
        console.log('📊 테스트 결과 요약');
        console.log('='.repeat(50));
        const successfulSearches = results.filter(r => r.success);
        const failedSearches = results.filter(r => !r.success);
        console.log(`✅ 성공: ${successfulSearches.length}개`);
        console.log(`❌ 실패: ${failedSearches.length}개`);
        console.log(`📈 성공률: ${((successfulSearches.length / results.length) * 100).toFixed(1)}%`);
        if (successfulSearches.length > 0) {
            const avgDuration = successfulSearches.reduce((sum, r) => sum + r.duration, 0) / successfulSearches.length;
            console.log(`⏱️ 평균 응답 시간: ${avgDuration.toFixed(0)}ms`);
            const avgConfidence = successfulSearches.reduce((sum, r) => sum + (r.data?.confidence || 0), 0) / successfulSearches.length;
            console.log(`🎯 평균 신뢰도: ${avgConfidence.toFixed(2)}`);
            const withPhone = successfulSearches.filter(r => r.data?.phone).length;
            const withPrice = successfulSearches.filter(r => r.data?.price).length;
            const withRating = successfulSearches.filter(r => r.data?.rating).length;
            const withHours = successfulSearches.filter(r => r.data?.openHour).length;
            console.log(`📞 전화번호 추출: ${withPhone}개`);
            console.log(`💰 가격 정보 추출: ${withPrice}개`);
            console.log(`⭐ 평점 추출: ${withRating}개`);
            console.log(`🕐 운영시간 추출: ${withHours}개`);
        }
        const testResult = {
            timestamp: new Date().toISOString(),
            testType: 'naver_cafe_search',
            summary: {
                total: results.length,
                successful: successfulSearches.length,
                failed: failedSearches.length,
                successRate: (successfulSearches.length / results.length) * 100
            },
            results: results
        };
        await fs.writeFile('src/data/test_naver_cafe_search_result.json', JSON.stringify(testResult, null, 2), 'utf-8');
        console.log(`\n💾 상세 결과가 'src/data/test_naver_cafe_search_result.json'에 저장되었습니다.`);
    }
    catch (error) {
        console.error('❌ 테스트 실행 중 오류 발생:', error);
    }
}
if (require.main === module) {
    testNaverCafeSearch()
        .then(() => {
        console.log('\n🎉 네이버 카페 검색 테스트 완료');
        process.exit(0);
    })
        .catch((error) => {
        console.error('❌ 테스트 실패:', error);
        process.exit(1);
    });
}
