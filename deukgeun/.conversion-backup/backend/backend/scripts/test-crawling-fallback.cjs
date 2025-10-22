"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testFallbackCrawling = testFallbackCrawling;
const OptimizedGymCrawlingSource_1 = require('modules/crawling/sources/OptimizedGymCrawlingSource');
async function testFallbackCrawling() {
    console.log('🧪 폴백 전략 테스트 시작');
    console.log('='.repeat(50));
    const crawlingSource = new OptimizedGymCrawlingSource_1.OptimizedGymCrawlingSource();
    const testGyms = [
        {
            name: '존재하지않는헬스장12345',
            address: '존재하지않는주소',
            type: 'private',
            source: 'test',
            confidence: 0
        },
        {
            name: '!@#$%^&*()헬스장',
            address: '특수문자주소!@#',
            type: 'private',
            source: 'test',
            confidence: 0
        },
        {
            name: '매우매우매우긴헬스장이름이여기까지계속되는헬스장',
            address: '매우매우매우긴주소가여기까지계속되는주소입니다',
            type: 'private',
            source: 'test',
            confidence: 0
        },
        {
            name: '헬스장모어(헬스장MORE)',
            address: '서울시 강남구',
            type: 'private',
            source: 'test',
            confidence: 0
        },
        {
            name: '짐모어(GYMMORE)',
            address: '서울시 서초구',
            type: 'private',
            source: 'test',
            confidence: 0
        }
    ];
    console.log(`📋 폴백 테스트 대상: ${testGyms.length}개 헬스장`);
    console.log('⚠️ 일부 쿼리는 의도적으로 실패할 수 있습니다...');
    try {
        const startTime = Date.now();
        const results = await crawlingSource.crawlGymsFromRawData(testGyms);
        const endTime = Date.now();
        console.log('\n📊 폴백 테스트 결과:');
        console.log('='.repeat(50));
        results.forEach((result, index) => {
            console.log(`\n${index + 1}. ${result.name}`);
            console.log(`   주소: ${result.address}`);
            console.log(`   전화번호: ${result.phone || 'N/A'}`);
            console.log(`   운영시간: ${result.openHour || 'N/A'} - ${result.closeHour || 'N/A'}`);
            console.log(`   가격: ${result.price || 'N/A'}`);
            console.log(`   평점: ${result.rating || 'N/A'}`);
            console.log(`   시설: ${result.facilities?.join(', ') || 'N/A'}`);
            console.log(`   소스: ${result.source}`);
            console.log(`   신뢰도: ${result.confidence}`);
        });
        const successCount = results.filter(r => r.confidence > 0.1).length;
        const successRate = (successCount / results.length) * 100;
        const sourceStats = new Map();
        results.forEach(result => {
            const count = sourceStats.get(result.source) || 0;
            sourceStats.set(result.source, count + 1);
        });
        const fallbackSuccess = results.filter(r => r.source.includes('fallback') || r.source.includes('minimal')).length;
        console.log(`\n📈 폴백 테스트 성공률: ${successRate.toFixed(1)}% (${successCount}/${results.length})`);
        console.log(`⏱️ 총 실행 시간: ${endTime - startTime}ms`);
        console.log(`🔄 폴백 전략 사용: ${fallbackSuccess}개`);
        console.log(`\n📊 소스별 분류:`);
        sourceStats.forEach((count, source) => {
            console.log(`   ${source}: ${count}개 (${(count / results.length * 100).toFixed(1)}%)`);
        });
        const primarySuccess = results.filter(r => !r.source.includes('fallback') && !r.source.includes('minimal')).length;
        console.log(`\n📊 폴백 전략 효과 분석:`);
        console.log(`   기본 검색 성공: ${primarySuccess}개`);
        console.log(`   폴백 전략 성공: ${fallbackSuccess}개`);
        console.log(`   폴백 효과: ${fallbackSuccess > 0 ? '✅ 폴백 전략이 작동함' : '❌ 폴백 전략 미작동'}`);
        console.log('\n📊 상세 성능 리포트:');
        const searchEngines = crawlingSource.getSearchEngines();
        searchEngines.forEach((engine, index) => {
            console.log(`\n🔍 검색 엔진 ${index + 1}: ${engine.constructor.name}`);
            console.log(engine.generatePerformanceReport());
        });
        return {
            success: true,
            successRate,
            totalTime: endTime - startTime,
            fallbackSuccess,
            primarySuccess,
            sourceStats: Object.fromEntries(sourceStats)
        };
    }
    catch (error) {
        console.error('❌ 폴백 테스트 실패:', error);
        return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
}
if (require.main === module) {
    testFallbackCrawling()
        .then((result) => {
        if (result.success) {
            console.log('✅ 폴백 전략 테스트 완료');
        }
        else {
            console.log('❌ 폴백 전략 테스트 실패');
        }
        process.exit(result.success ? 0 : 1);
    })
        .catch((error) => {
        console.error('💥 폴백 전략 테스트 스크립트 실패:', error);
        process.exit(1);
    });
}
