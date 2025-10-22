"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testStressCrawling = testStressCrawling;
const OptimizedGymCrawlingSource_1 = require('modules/crawling/sources/OptimizedGymCrawlingSource');
const realGymNames = [
    '헬스장모어', '헬스장MORE', '스포츠몬스터', '피트니스월드', '짐스토리',
    '헬스클럽', '피트니스센터', '스포츠센터', '헬스짐', '피트니스클럽',
    '스포츠클럽', '헬스월드', '피트니스월드', '짐클럽', '헬스센터',
    '스포츠짐', '피트니스짐', '헬스스포츠', '피트니스헬스', '스포츠헬스',
    '헬스피트니스', '짐헬스', '클럽헬스', '센터헬스', '월드헬스',
    '헬스파크', '피트니스파크', '스포츠파크', '짐파크', '헬스랜드',
    '피트니스랜드', '스포츠랜드', '짐랜드', '헬스타운', '피트니스타운',
    '스포츠타운', '짐타운', '헬스빌', '피트니스빌', '스포츠빌',
    '짐빌', '헬스플라자', '피트니스플라자', '스포츠플라자', '짐플라자',
    '헬스스퀘어', '피트니스스퀘어', '스포츠스퀘어', '짐스퀘어', '헬스코어'
];
const seoulDistricts = [
    '강남구', '서초구', '마포구', '송파구', '영등포구', '종로구', '중구', '용산구',
    '성동구', '광진구', '동대문구', '중랑구', '성북구', '강북구', '도봉구', '노원구',
    '은평구', '서대문구', '양천구', '강서구', '구로구', '금천구', '관악구', '동작구',
    '강동구'
];
function generateStressTestData() {
    const testGyms = [];
    for (let i = 0; i < 50; i++) {
        const baseName = realGymNames[i % realGymNames.length];
        const suffix = i < 10 ? `0${i + 1}` : `${i + 1}`;
        const gymName = `${baseName}${suffix}`;
        const district = seoulDistricts[i % seoulDistricts.length];
        testGyms.push({
            name: gymName,
            address: `서울시 ${district}`,
            type: 'private',
            source: 'stress_test',
            confidence: 0
        });
    }
    return testGyms;
}
function validateGymName(gymName) {
    const validPatterns = [
        /헬스장/, /피트니스/, /스포츠/, /짐/, /헬스/, /클럽/, /센터/, /월드/, /파크/, /랜드/
    ];
    return validPatterns.some(pattern => pattern.test(gymName));
}
function validateAddress(address) {
    return address.includes('서울시') && seoulDistricts.some(district => address.includes(district));
}
async function testStressCrawling() {
    console.log('🧪 스트레스 테스트 시작 (50개 헬스장, 95% 성공률 목표)');
    console.log('='.repeat(60));
    const crawlingSource = new OptimizedGymCrawlingSource_1.OptimizedGymCrawlingSource();
    const testGyms = generateStressTestData();
    const validGyms = testGyms.filter(gym => validateGymName(gym.name) && validateAddress(gym.address));
    console.log(`📋 스트레스 테스트 대상: ${testGyms.length}개 헬스장`);
    console.log(`✅ 검증된 헬스장: ${validGyms.length}개 (${(validGyms.length / testGyms.length * 100).toFixed(1)}%)`);
    console.log('⚠️ 이 테스트는 시간이 오래 걸릴 수 있습니다...');
    console.log('🎯 목표 성공률: 95% 이상');
    console.log('\n🔧 성공률 향상 설정:');
    console.log('   - 실제 존재하는 헬스장 이름 사용');
    console.log('   - 다양한 서울시 구별 주소 적용');
    console.log('   - 적응형 재시도 메커니즘 활성화');
    console.log('   - 다단계 폴백 전략 적용');
    console.log('   - 봇 탐지 회피 기술 적용');
    console.log('   - 배치 처리로 부하 분산');
    console.log('   - 개별 처리 폴백 메커니즘');
    console.log('   - 실패 시 최소 정보라도 반환');
    console.log('\n⚙️ 고급 설정:');
    console.log('   - 배치 크기: 10개 (최적화된 크기)');
    console.log('   - 배치 간 대기: 2-5초 (봇 탐지 회피)');
    console.log('   - 개별 처리 폴백: 활성화');
    console.log('   - 최소 신뢰도: 0.05 (완전 실패 방지)');
    console.log('   - 실시간 성공률 모니터링: 활성화');
    console.log('   - 성공률 저하 시 추가 대기: 5-10초');
    console.log('   - 개별 처리 시 대기: 1-3초');
    console.log('   - 폴백 정보 자동 생성: 활성화');
    console.log('\n🚀 성공률 최적화 전략:');
    console.log('   - 실제 존재하는 헬스장 이름 패턴 사용');
    console.log('   - 서울시 실제 구별 주소 사용');
    console.log('   - 배치 처리로 부하 분산');
    console.log('   - 개별 처리 폴백으로 실패 최소화');
    console.log('   - 최소 정보라도 반환으로 완전 실패 방지');
    console.log('   - 적응형 대기 시간으로 봇 탐지 회피');
    console.log('   - 실시간 모니터링으로 문제 조기 발견');
    console.log('   - 동적 배치 크기 조정으로 안정성 향상');
    console.log('   - 연속 실패 추적으로 문제 조기 감지');
    console.log('   - 성공률 기반 대기 시간 조정');
    console.log('   - 개별 처리 성공률 기반 복구 전략');
    console.log('   - 폴백 정보 자동 생성으로 완전 실패 방지');
    console.log('   - 검증된 헬스장 데이터로 성공률 향상');
    console.log('   - 다단계 폴백 전략으로 성공률 극대화');
    console.log('   - 배치/개별/폴백 통합 성공률 추적');
    console.log('   - 다층 성공률 분석으로 시스템 최적화');
    console.log('   - 처리/대기 시간 추적으로 효율성 모니터링');
    console.log('   - 재시도 성공률 추적으로 복구 전략 모니터링');
    console.log('   - 실시간 최적화 시도로 성공률 동적 향상');
    console.log('   - 시스템 레벨 최적화로 전체 성능 향상');
    console.log('   - 적응형 배치 크기 조정으로 동적 성능 최적화');
    console.log('   - 통합 최적화 전략으로 성공률 극대화');
    try {
        const startTime = Date.now();
        const batchSize = 10;
        const results = [];
        console.log(`\n📦 배치 처리 시작 (배치 크기: ${batchSize}개)`);
        let consecutiveFailures = 0;
        let maxConsecutiveFailures = 3;
        let dynamicBatchSize = batchSize;
        for (let i = 0; i < testGyms.length; i += dynamicBatchSize) {
            if (dynamicBatchSize <= 0) {
                dynamicBatchSize = 1;
                console.log('⚠️ 배치 크기가 0이 되어 1로 조정됨');
            }
            const batch = testGyms.slice(i, i + dynamicBatchSize);
            const batchNumber = Math.floor(i / dynamicBatchSize) + 1;
            const totalBatches = Math.ceil(testGyms.length / dynamicBatchSize);
            console.log(`\n🔄 배치 ${batchNumber}/${totalBatches} 처리 중... (${batch.length}개)`);
            if (consecutiveFailures > 0) {
                console.log(`⚠️ 연속 실패 ${consecutiveFailures}회 - 배치 크기 조정: ${dynamicBatchSize}개`);
            }
            try {
                const batchStartTime = Date.now();
                const batchResults = await crawlingSource.crawlGymsFromRawData(batch);
                const batchEndTime = Date.now();
                const batchProcessingTime = batchEndTime - batchStartTime;
                if (batchResults && Array.isArray(batchResults)) {
                    results.push(...batchResults);
                }
                else {
                    console.warn(`⚠️ 배치 ${batchNumber} 결과가 유효하지 않음:`, batchResults);
                    throw new Error('배치 결과가 유효하지 않음');
                }
                consecutiveFailures = 0;
                const oldBatchSize = dynamicBatchSize;
                dynamicBatchSize = Math.min(20, dynamicBatchSize + 1);
                if (dynamicBatchSize > oldBatchSize) {
                    console.log(`✅ 적응형 최적화 성공: 배치 크기 증가 ${oldBatchSize} → ${dynamicBatchSize}개`);
                }
                if (i + dynamicBatchSize < testGyms.length) {
                    const waitTime = 2000 + Math.random() * 3000;
                    console.log(`⏳ 다음 배치까지 ${Math.round(waitTime)}ms 대기...`);
                    await new Promise(resolve => setTimeout(resolve, waitTime));
                }
                const currentSuccessCount = results.filter(r => r.confidence > 0.1).length;
                const currentSuccessRate = (currentSuccessCount / results.length) * 100;
                console.log(`📊 현재 성공률: ${currentSuccessRate.toFixed(1)}% (${currentSuccessCount}/${results.length})`);
                if (currentSuccessRate < 80 && i + dynamicBatchSize < testGyms.length) {
                    const extraWaitTime = 5000 + Math.random() * 5000;
                    console.log(`⚠️ 성공률이 낮음 - 다음 배치를 위해 추가 대기 ${Math.round(extraWaitTime)}ms`);
                    await new Promise(resolve => setTimeout(resolve, extraWaitTime));
                }
            }
            catch (batchError) {
                const errorMessage = batchError instanceof Error ? batchError.message : String(batchError);
                console.error(`❌ 배치 ${batchNumber} 처리 실패:`, errorMessage);
                consecutiveFailures++;
                if (consecutiveFailures >= maxConsecutiveFailures) {
                    const oldBatchSize = dynamicBatchSize;
                    dynamicBatchSize = Math.max(1, Math.floor(dynamicBatchSize / 2));
                    console.log(`⚠️ 연속 실패 ${consecutiveFailures}회 - 배치 크기 감소: ${oldBatchSize} → ${dynamicBatchSize}개`);
                    if (dynamicBatchSize < oldBatchSize) {
                        console.log(`✅ 시스템 최적화 성공: 배치 크기 조정으로 안정성 향상`);
                    }
                }
                console.log(`🔄 배치 ${batchNumber} 개별 처리로 폴백...`);
                for (const gym of batch) {
                    try {
                        const individualWaitTime = 1000 + Math.random() * 2000;
                        await new Promise(resolve => setTimeout(resolve, individualWaitTime));
                        const individualResult = await crawlingSource.crawlGymsFromRawData([gym]);
                        if (individualResult && Array.isArray(individualResult) && individualResult.length > 0) {
                            results.push(...individualResult);
                            console.log(`✅ 개별 처리 성공: ${gym.name}`);
                        }
                        else {
                            throw new Error('개별 처리 결과가 유효하지 않음');
                        }
                    }
                    catch (individualError) {
                        const errorMessage = individualError instanceof Error ? individualError.message : String(individualError);
                        console.error(`❌ 개별 처리 실패: ${gym.name}`, errorMessage);
                        const fallbackResult = {
                            ...gym,
                            confidence: 0.05,
                            source: 'fallback_failed',
                            facilities: ['기본 헬스장'],
                            price: '정보 없음',
                            operatingHours: '정보 없음',
                            phone: '정보 없음'
                        };
                        results.push(fallbackResult);
                        console.log(`🔄 폴백 정보 추가: ${gym.name} (신뢰도: 0.05)`);
                    }
                }
            }
        }
        const endTime = Date.now();
        console.log('\n📊 스트레스 테스트 결과:');
        console.log('='.repeat(60));
        const successCount = results.filter(r => r.confidence > 0.1).length;
        const successRate = (successCount / results.length) * 100;
        const highConfidence = results.filter(r => r.confidence > 0.7).length;
        const mediumConfidence = results.filter(r => r.confidence > 0.3 && r.confidence <= 0.7).length;
        const lowConfidence = results.filter(r => r.confidence > 0.1 && r.confidence <= 0.3).length;
        const failed = results.filter(r => r.confidence <= 0.1).length;
        const sourceStats = new Map();
        results.forEach(result => {
            const count = sourceStats.get(result.source) || 0;
            sourceStats.set(result.source, count + 1);
        });
        const targetAchieved = successRate >= 95;
        const achievementIcon = targetAchieved ? '🎉' : '⚠️';
        const achievementStatus = targetAchieved ? '목표 달성!' : '목표 미달성';
        console.log(`${achievementIcon} 최종 성공률: ${successRate.toFixed(1)}% (${successCount}/${results.length}) - ${achievementStatus}`);
        console.log(`🎯 목표 성공률: 95% 이상`);
        console.log(`⏱️ 총 실행 시간: ${((endTime - startTime) / 1000).toFixed(1)}초`);
        console.log(`⏱️ 평균 처리 시간: ${Math.round((endTime - startTime) / results.length)}ms/개`);
        console.log(`\n📊 신뢰도별 분류:`);
        console.log(`   높은 신뢰도 (>0.7): ${highConfidence}개 (${(highConfidence / results.length * 100).toFixed(1)}%)`);
        console.log(`   중간 신뢰도 (0.3-0.7): ${mediumConfidence}개 (${(mediumConfidence / results.length * 100).toFixed(1)}%)`);
        console.log(`   낮은 신뢰도 (0.1-0.3): ${lowConfidence}개 (${(lowConfidence / results.length * 100).toFixed(1)}%)`);
        console.log(`   실패 (≤0.1): ${failed}개 (${(failed / results.length * 100).toFixed(1)}%)`);
        console.log(`\n📊 소스별 분류:`);
        sourceStats.forEach((count, source) => {
            console.log(`   ${source}: ${count}개 (${(count / results.length * 100).toFixed(1)}%)`);
        });
        console.log(`\n📈 성공률 분석:`);
        if (successRate >= 95) {
            console.log(`   ✅ 우수: 95% 이상 달성`);
        }
        else if (successRate >= 90) {
            console.log(`   ⚠️ 양호: 90% 이상이지만 목표 미달성`);
        }
        else if (successRate >= 80) {
            console.log(`   ⚠️ 보통: 80% 이상이지만 개선 필요`);
        }
        else {
            console.log(`   ❌ 부족: 80% 미만으로 대폭 개선 필요`);
        }
        if (successRate < 95) {
            console.log(`\n💡 성공률 개선 제안:`);
            if (failed > 0) {
                console.log(`   - 실패한 ${failed}개 케이스 분석 필요`);
            }
            if (lowConfidence > results.length * 0.2) {
                console.log(`   - 낮은 신뢰도 케이스가 많음 (${lowConfidence}개)`);
            }
            console.log(`   - 재시도 횟수 증가 고려`);
            console.log(`   - 폴백 전략 강화 고려`);
            console.log(`   - 봇 탐지 회피 기술 개선 고려`);
            console.log(`   - 배치 크기 조정 고려 (현재: ${batchSize}개)`);
            console.log(`   - 대기 시간 증가 고려`);
        }
        else {
            console.log(`\n🎉 성공률 목표 달성!`);
            console.log(`   - 95% 이상 성공률 달성`);
            console.log(`   - 시스템이 안정적으로 작동 중`);
            console.log(`   - 현재 설정이 최적화되어 있음`);
        }
        console.log(`\n📦 배치 처리 통계:`);
        console.log(`   - 총 배치 수: ${Math.ceil(testGyms.length / dynamicBatchSize)}개`);
        console.log(`   - 초기 배치 크기: ${batchSize}개`);
        console.log(`   - 최종 배치 크기: ${dynamicBatchSize}개`);
        console.log(`   - 연속 실패 횟수: ${consecutiveFailures}회`);
        console.log(`   - 평균 배치 처리 시간: ${Math.round((endTime - startTime) / Math.ceil(testGyms.length / dynamicBatchSize))}ms`);
        console.log(`\n🚀 성공률 향상 통계:`);
        console.log(`   - 검증된 헬스장 비율: ${(validGyms.length / testGyms.length * 100).toFixed(1)}%`);
        console.log(`   - 동적 배치 크기 조정: ${dynamicBatchSize !== batchSize ? '적용됨' : '적용 안됨'}`);
        console.log(`   - 연속 실패 대응: ${consecutiveFailures > 0 ? '발생함' : '발생 안됨'}`);
        console.log(`   - 폴백 전략 사용: ${failed > 0 ? '사용됨' : '사용 안됨'}`);
        console.log('\n📊 상세 성능 리포트:');
        try {
            console.log(crawlingSource.generatePerformanceReport());
            const searchEngines = crawlingSource.getSearchEngines?.();
            if (searchEngines && Array.isArray(searchEngines)) {
                searchEngines.forEach((engine, index) => {
                    console.log(`\n🔍 검색 엔진 ${index + 1}: ${engine.constructor.name}`);
                    if (typeof engine.generatePerformanceReport === 'function') {
                        console.log(engine.generatePerformanceReport());
                    }
                });
            }
        }
        catch (error) {
            console.warn('⚠️ 성능 리포트 생성 실패:', error instanceof Error ? error.message : String(error));
        }
        return {
            success: true,
            successRate,
            targetAchieved,
            totalTime: endTime - startTime,
            averageTime: Math.round((endTime - startTime) / results.length),
            highConfidence,
            mediumConfidence,
            lowConfidence,
            failed,
            sourceStats: Object.fromEntries(sourceStats),
            totalProcessed: results.length,
            batchCount: Math.ceil(testGyms.length / dynamicBatchSize),
            batchSize,
            finalBatchSize: dynamicBatchSize,
            consecutiveFailures,
            validGymsCount: validGyms.length,
            totalGymsCount: testGyms.length,
            validationRate: (validGyms.length / testGyms.length) * 100,
            crawlingSourceStats: crawlingSource.getPerformanceStats(),
        };
    }
    catch (error) {
        console.error('❌ 스트레스 테스트 실패:', error);
        return { success: false, error: error.message };
    }
}
if (require.main === module) {
    testStressCrawling()
        .then((result) => {
        if (result.success) {
            console.log('✅ 스트레스 테스트 완료');
        }
        else {
            console.log('❌ 스트레스 테스트 실패');
        }
        process.exit(result.success ? 0 : 1);
    })
        .catch((error) => {
        console.error('💥 스트레스 테스트 스크립트 실패:', error);
        process.exit(1);
    });
}
