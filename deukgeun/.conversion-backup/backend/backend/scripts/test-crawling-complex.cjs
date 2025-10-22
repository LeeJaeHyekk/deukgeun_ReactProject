"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testComplexCrawling = testComplexCrawling;
const OptimizedGymCrawlingSource_1 = require('modules/crawling/sources/OptimizedGymCrawlingSource');
async function testComplexCrawling() {
    console.log('🧪 복잡한 쿼리 크롤링 테스트 시작');
    console.log('='.repeat(50));
    const crawlingSource = new OptimizedGymCrawlingSource_1.OptimizedGymCrawlingSource();
    const testGyms = [
        {
            name: '헬스장모어(헬스장MORE)',
            address: '서울시 강남구 테헤란로',
            type: 'private',
            source: 'test',
            confidence: 0
        },
        {
            name: '짐모어(GYMMORE)',
            address: '서울시 서초구 서초대로',
            type: 'private',
            source: 'test',
            confidence: 0
        },
        {
            name: '피트니스&헬스클럽',
            address: '서울시 마포구 홍대입구역',
            type: 'private',
            source: 'test',
            confidence: 0
        },
        {
            name: '스포츠센터 24',
            address: '서울시 송파구 올림픽공원',
            type: 'private',
            source: 'test',
            confidence: 0
        },
        {
            name: '헬스장+피트니스',
            address: '서울시 영등포구 여의도',
            type: 'private',
            source: 'test',
            confidence: 0
        }
    ];
    console.log(`📋 복잡한 쿼리 테스트 대상: ${testGyms.length}개 헬스장`);
    try {
        const startTime = Date.now();
        const results = await crawlingSource.crawlGymsFromRawData(testGyms);
        const endTime = Date.now();
        console.log('\n📊 복잡한 쿼리 테스트 결과:');
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
        const highConfidence = results.filter(r => r.confidence > 0.7).length;
        const mediumConfidence = results.filter(r => r.confidence > 0.3 && r.confidence <= 0.7).length;
        const lowConfidence = results.filter(r => r.confidence > 0.1 && r.confidence <= 0.3).length;
        const failed = results.filter(r => r.confidence <= 0.1).length;
        console.log(`\n📈 복잡한 쿼리 테스트 성공률: ${successRate.toFixed(1)}% (${successCount}/${results.length})`);
        console.log(`⏱️ 총 실행 시간: ${endTime - startTime}ms`);
        console.log(`\n📊 신뢰도별 분류:`);
        console.log(`   높은 신뢰도 (>0.7): ${highConfidence}개`);
        console.log(`   중간 신뢰도 (0.3-0.7): ${mediumConfidence}개`);
        console.log(`   낮은 신뢰도 (0.1-0.3): ${lowConfidence}개`);
        console.log(`   실패 (≤0.1): ${failed}개`);
        return {
            success: true,
            successRate,
            totalTime: endTime - startTime,
            highConfidence,
            mediumConfidence,
            lowConfidence,
            failed
        };
    }
    catch (error) {
        console.error('❌ 복잡한 쿼리 테스트 실패:', error);
        return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
}
if (require.main === module) {
    testComplexCrawling()
        .then((result) => {
        if (result.success) {
            console.log('✅ 복잡한 쿼리 크롤링 테스트 완료');
        }
        else {
            console.log('❌ 복잡한 쿼리 크롤링 테스트 실패');
        }
        process.exit(result.success ? 0 : 1);
    })
        .catch((error) => {
        console.error('💥 복잡한 쿼리 크롤링 테스트 스크립트 실패:', error);
        process.exit(1);
    });
}
