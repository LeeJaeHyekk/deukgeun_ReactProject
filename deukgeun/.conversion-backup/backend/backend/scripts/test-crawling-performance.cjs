"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testPerformanceCrawling = testPerformanceCrawling;
const OptimizedGymCrawlingSource_1 = require('modules/crawling/sources/OptimizedGymCrawlingSource');
async function testPerformanceCrawling() {
    console.log('🧪 성능 테스트 시작');
    console.log('='.repeat(50));
    const crawlingSource = new OptimizedGymCrawlingSource_1.OptimizedGymCrawlingSource();
    const testGyms = [
        { name: '헬스장', address: '서울시 강남구', type: 'private', source: 'test', confidence: 0 },
        { name: '피트니스센터', address: '서울시 서초구', type: 'private', source: 'test', confidence: 0 },
        { name: '짐', address: '서울시 마포구', type: 'private', source: 'test', confidence: 0 },
        { name: '헬스장모어(헬스장MORE)', address: '서울시 송파구', type: 'private', source: 'test', confidence: 0 },
        { name: '짐모어(GYMMORE)', address: '서울시 영등포구', type: 'private', source: 'test', confidence: 0 },
        { name: '헬스&피트니스', address: '서울시 종로구', type: 'private', source: 'test', confidence: 0 },
        { name: '스포츠센터+', address: '서울시 중구', type: 'private', source: 'test', confidence: 0 },
        { name: '매우긴헬스장이름이여기까지계속되는헬스장', address: '서울시 용산구', type: 'private', source: 'test', confidence: 0 },
        { name: 'Fitness Center', address: '서울시 성동구', type: 'private', source: 'test', confidence: 0 },
        { name: 'GYM 24', address: '서울시 광진구', type: 'private', source: 'test', confidence: 0 }
    ];
    console.log(`📋 성능 테스트 대상: ${testGyms.length}개 헬스장`);
    console.log('⚠️ 성능 측정을 위해 상세한 로깅이 활성화됩니다...');
    try {
        const startTime = Date.now();
        const results = await crawlingSource.crawlGymsFromRawData(testGyms);
        const endTime = Date.now();
        console.log('\n📊 성능 테스트 결과:');
        console.log('='.repeat(50));
        const successCount = results.filter(r => r.confidence > 0.1).length;
        const successRate = (successCount / results.length) * 100;
        const totalTime = endTime - startTime;
        const averageTime = Math.round(totalTime / results.length);
        const highConfidence = results.filter(r => r.confidence > 0.7).length;
        const mediumConfidence = results.filter(r => r.confidence > 0.3 && r.confidence <= 0.7).length;
        const lowConfidence = results.filter(r => r.confidence > 0.1 && r.confidence <= 0.3).length;
        const failed = results.filter(r => r.confidence <= 0.1).length;
        const sourceStats = new Map();
        results.forEach(result => {
            const count = sourceStats.get(result.source) || 0;
            sourceStats.set(result.source, count + 1);
        });
        console.log(`📈 전체 성공률: ${successRate.toFixed(1)}% (${successCount}/${results.length})`);
        console.log(`⏱️ 총 실행 시간: ${totalTime}ms`);
        console.log(`⏱️ 평균 처리 시간: ${averageTime}ms/개`);
        console.log(`⚡ 처리 속도: ${(results.length / (totalTime / 1000)).toFixed(2)}개/초`);
        console.log(`\n📊 신뢰도별 분류:`);
        console.log(`   높은 신뢰도 (>0.7): ${highConfidence}개 (${(highConfidence / results.length * 100).toFixed(1)}%)`);
        console.log(`   중간 신뢰도 (0.3-0.7): ${mediumConfidence}개 (${(mediumConfidence / results.length * 100).toFixed(1)}%)`);
        console.log(`   낮은 신뢰도 (0.1-0.3): ${lowConfidence}개 (${(lowConfidence / results.length * 100).toFixed(1)}%)`);
        console.log(`   실패 (≤0.1): ${failed}개 (${(failed / results.length * 100).toFixed(1)}%)`);
        console.log(`\n📊 소스별 분류:`);
        sourceStats.forEach((count, source) => {
            console.log(`   ${source}: ${count}개 (${(count / results.length * 100).toFixed(1)}%)`);
        });
        console.log(`\n📋 개별 결과:`);
        results.forEach((result, index) => {
            console.log(`${index + 1}. ${result.name} - 신뢰도: ${result.confidence} (${result.source})`);
        });
        console.log(`\n📊 성능 평가:`);
        if (successRate >= 90) {
            console.log(`   ✅ 성공률: 우수 (${successRate.toFixed(1)}%)`);
        }
        else if (successRate >= 70) {
            console.log(`   ⚠️ 성공률: 보통 (${successRate.toFixed(1)}%)`);
        }
        else {
            console.log(`   ❌ 성공률: 개선 필요 (${successRate.toFixed(1)}%)`);
        }
        if (averageTime <= 5000) {
            console.log(`   ✅ 처리 속도: 우수 (${averageTime}ms/개)`);
        }
        else if (averageTime <= 10000) {
            console.log(`   ⚠️ 처리 속도: 보통 (${averageTime}ms/개)`);
        }
        else {
            console.log(`   ❌ 처리 속도: 개선 필요 (${averageTime}ms/개)`);
        }
        console.log('\n📊 상세 성능 리포트:');
        const searchEngines = crawlingSource.getSearchEngines();
        searchEngines.forEach((engine, index) => {
            console.log(`\n🔍 검색 엔진 ${index + 1}: ${engine.constructor.name}`);
            console.log(engine.generatePerformanceReport());
        });
        return {
            success: true,
            successRate,
            totalTime,
            averageTime,
            processingSpeed: results.length / (totalTime / 1000),
            highConfidence,
            mediumConfidence,
            lowConfidence,
            failed,
            sourceStats: Object.fromEntries(sourceStats),
            results
        };
    }
    catch (error) {
        console.error('❌ 성능 테스트 실패:', error);
        return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
}
if (require.main === module) {
    testPerformanceCrawling()
        .then((result) => {
        if (result.success) {
            console.log('✅ 성능 테스트 완료');
        }
        else {
            console.log('❌ 성능 테스트 실패');
        }
        process.exit(result.success ? 0 : 1);
    })
        .catch((error) => {
        console.error('💥 성능 테스트 스크립트 실패:', error);
        process.exit(1);
    });
}
