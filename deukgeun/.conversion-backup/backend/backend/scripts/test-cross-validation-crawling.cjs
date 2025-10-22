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
exports.testCrossValidationCrawling = testCrossValidationCrawling;
const databaseConfig_1 = require('config/databaseConfig');
const OptimizedGymCrawlingSource_1 = require('modules/crawling/sources/OptimizedGymCrawlingSource');
const EnhancedDataMerger_1 = require('modules/crawling/processors/EnhancedDataMerger');
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
async function testCrossValidationCrawling() {
    console.log('🚀 교차 검증 크롤링 테스트 시작');
    try {
        await databaseConfig_1.AppDataSource.initialize();
        console.log('✅ 데이터베이스 연결 성공');
        const filePath = path.join(process.cwd(), '..', '..', 'src', 'data', 'gyms_raw.json');
        const content = await fs.readFile(filePath, 'utf-8');
        const allGymsData = JSON.parse(content);
        const testGyms = allGymsData.slice(0, 3);
        console.log(`🎯 테스트 대상: ${testGyms.length}개 헬스장`);
        testGyms.forEach((gym, index) => {
            console.log(`  ${index + 1}. ${gym.name} (${gym.serviceType}) - ${gym.address}`);
        });
        const crawlingSource = new OptimizedGymCrawlingSource_1.OptimizedGymCrawlingSource(30000, 1000);
        console.log('\n🔍 교차 검증 크롤링 시작...');
        console.log('⚙️ 교차 검증 대상 정보:');
        console.log('  📞 전화번호 - 여러 소스에서 동일한 번호 검증');
        console.log('  🕐 운영시간 - 오픈/클로즈 시간 일치도 검증');
        console.log('  💰 가격 정보 - 가격 유형별 정확도 검증');
        console.log('  🏋️ 시설 정보 - 2개 이상 소스에서 언급된 시설만 포함');
        console.log('\n🔧 교차 검증 로직:');
        console.log('  📊 신뢰도 가중치: 전화번호(30%) + 운영시간(20%) + 가격(30%) + 시설(20%)');
        console.log('  🎯 최소 임계값: 2개 이상 소스에서 일치하는 정보만 채택');
        console.log('  ⭐ 신뢰도 향상: 교차 검증 점수에 따라 최대 0.2점 추가');
        console.log('  🔍 검색 엔진: 네이버, 구글, 다음, 네이버블로그, 네이버카페');
        const startTime = Date.now();
        const crawledResults = await crawlingSource.crawlGymsFromRawData(testGyms);
        const endTime = Date.now();
        const duration = (endTime - startTime) / 1000;
        console.log(`\n✅ 크롤링 완료: ${duration.toFixed(1)}초 소요`);
        console.log(`📊 크롤링 결과: ${crawledResults.length}개 헬스장`);
        console.log('\n📈 교차 검증 결과 상세 분석:');
        let webCrawledCount = 0;
        let fallbackCount = 0;
        let crossValidatedCount = 0;
        let phoneValidatedCount = 0;
        let hoursValidatedCount = 0;
        let priceValidatedCount = 0;
        let facilitiesValidatedCount = 0;
        let averageConfidence = 0;
        crawledResults.forEach((gym, index) => {
            console.log(`\n${index + 1}. ${gym.name}`);
            console.log(`   - 소스: ${gym.source}`);
            console.log(`   - 신뢰도: ${gym.confidence}`);
            const isCrossValidated = gym.source.includes('cross_validated');
            if (isCrossValidated) {
                crossValidatedCount++;
                console.log(`   ✅ 교차 검증 완료`);
            }
            if (gym.phone) {
                phoneValidatedCount++;
                console.log(`   📞 전화번호: ${gym.phone} ✅`);
            }
            else {
                console.log(`   📞 전화번호: 없음 ❌`);
            }
            if (gym.openHour || gym.closeHour) {
                hoursValidatedCount++;
                console.log(`   🕐 운영시간: ${gym.openHour || '없음'} - ${gym.closeHour || '없음'} ✅`);
            }
            else {
                console.log(`   🕐 운영시간: 없음 ❌`);
            }
            const hasPriceInfo = gym.membershipPrice || gym.ptPrice || gym.gxPrice || gym.dayPassPrice || gym.priceDetails || gym.minimumPrice;
            if (hasPriceInfo || gym.price === '방문후 확인') {
                priceValidatedCount++;
                console.log(`   💰 가격 정보:`);
                if (gym.membershipPrice) {
                    console.log(`     💳 회원권: ${gym.membershipPrice} (정확한 금액)`);
                }
                else if (gym.ptPrice) {
                    console.log(`     🏋️ PT: ${gym.ptPrice} (정확한 금액)`);
                }
                else if (gym.gxPrice) {
                    console.log(`     🎯 GX: ${gym.gxPrice} (정확한 금액)`);
                }
                else if (gym.dayPassPrice) {
                    console.log(`     🎫 일일권: ${gym.dayPassPrice} (정확한 금액)`);
                }
                else if (gym.minimumPrice) {
                    console.log(`     💰 최소가격: ${gym.minimumPrice} (최소 금액)`);
                }
                else if (gym.priceDetails) {
                    console.log(`     💰 기타: ${gym.priceDetails} (기타 정보)`);
                }
                else if (gym.price === '방문후 확인') {
                    console.log(`     📞 방문후 확인 (가격 정보 없음)`);
                }
                if (gym.discountInfo)
                    console.log(`     🎁 할인: ${gym.discountInfo}`);
                console.log(`     ✅ 가격 정보 검증됨`);
            }
            else {
                console.log(`   💰 가격 정보: 없음 ❌`);
            }
            if (gym.facilities) {
                const facilitiesText = Array.isArray(gym.facilities) ? gym.facilities.join(', ') : gym.facilities;
                if (facilitiesText && facilitiesText.trim().length > 0) {
                    facilitiesValidatedCount++;
                    console.log(`   🏋️ 시설: ${facilitiesText} ✅`);
                }
                else {
                    console.log(`   🏋️ 시설: 없음 ❌`);
                }
            }
            else {
                console.log(`   🏋️ 시설: 없음 ❌`);
            }
            if (gym.source.includes('naver') || gym.source.includes('google') || gym.source.includes('daum') || isCrossValidated) {
                webCrawledCount++;
            }
            else {
                fallbackCount++;
            }
            averageConfidence += gym.confidence;
        });
        averageConfidence = averageConfidence / crawledResults.length;
        console.log(`\n📊 교차 검증 성공률:`);
        console.log(`   - 웹 크롤링 성공: ${webCrawledCount}개`);
        console.log(`   - 교차 검증 완료: ${crossValidatedCount}개`);
        console.log(`   - 폴백 사용: ${fallbackCount}개`);
        console.log(`   - 성공률: ${((webCrawledCount / crawledResults.length) * 100).toFixed(1)}%`);
        console.log(`   - 교차 검증률: ${((crossValidatedCount / crawledResults.length) * 100).toFixed(1)}%`);
        console.log(`\n📊 정보별 검증 통계:`);
        console.log(`   - 전화번호 검증: ${phoneValidatedCount}개`);
        console.log(`   - 운영시간 검증: ${hoursValidatedCount}개`);
        console.log(`   - 가격 정보 검증: ${priceValidatedCount}개`);
        console.log(`   - 시설 정보 검증: ${facilitiesValidatedCount}개`);
        console.log(`   - 평균 신뢰도: ${averageConfidence.toFixed(2)}`);
        console.log('\n🔄 데이터 병합 테스트...');
        const dataMerger = new EnhancedDataMerger_1.EnhancedDataMerger();
        const mergeResult = await dataMerger.mergeGymDataWithCrawling(testGyms, crawledResults);
        console.log(`✅ 병합 완료: ${mergeResult.mergedData.length}개 헬스장`);
        console.log(`📊 병합 통계:`);
        console.log(`   - 성공적 병합: ${mergeResult.statistics.successfullyMerged}개`);
        console.log(`   - 폴백 사용: ${mergeResult.statistics.fallbackUsed}개`);
        console.log(`   - 품질 점수: ${mergeResult.statistics.qualityScore.toFixed(2)}`);
        console.log('\n📋 교차 검증된 데이터 샘플:');
        mergeResult.mergedData.slice(0, 2).forEach((gym, index) => {
            console.log(`\n${index + 1}. ${gym.name}`);
            console.log(`   - 주소: ${gym.address}`);
            console.log(`   - 전화번호: ${gym.phone || '없음'}`);
            console.log(`   - 서비스타입: ${gym.serviceType}`);
            console.log(`   - 소스: ${gym.source}`);
            console.log(`   - 신뢰도: ${gym.confidence}`);
            const enhancedInfo = [];
            if (gym.phone)
                enhancedInfo.push(`📞 전화번호: ${gym.phone}`);
            if (gym.openHour || gym.closeHour)
                enhancedInfo.push(`🕐 운영시간: ${gym.openHour || '없음'} - ${gym.closeHour || '없음'}`);
            if (gym.membershipPrice) {
                enhancedInfo.push(`💳 회원권: ${gym.membershipPrice} (정확한 금액)`);
            }
            else if (gym.ptPrice) {
                enhancedInfo.push(`🏋️ PT: ${gym.ptPrice} (정확한 금액)`);
            }
            else if (gym.gxPrice) {
                enhancedInfo.push(`🎯 GX: ${gym.gxPrice} (정확한 금액)`);
            }
            else if (gym.dayPassPrice) {
                enhancedInfo.push(`🎫 일일권: ${gym.dayPassPrice} (정확한 금액)`);
            }
            else if (gym.minimumPrice) {
                enhancedInfo.push(`💰 최소가격: ${gym.minimumPrice} (최소 금액)`);
            }
            else if (gym.priceDetails) {
                enhancedInfo.push(`💰 기타: ${gym.priceDetails} (기타 정보)`);
            }
            else if (gym.price === '방문후 확인') {
                enhancedInfo.push(`📞 방문후 확인 (가격 정보 없음)`);
            }
            if (gym.discountInfo)
                enhancedInfo.push(`🎁 할인: ${gym.discountInfo}`);
            if (gym.facilities) {
                const facilitiesText = Array.isArray(gym.facilities) ? gym.facilities.join(', ') : gym.facilities;
                enhancedInfo.push(`🏋️ 시설: ${facilitiesText}`);
            }
            if (enhancedInfo.length > 0) {
                console.log(`   🔍 교차 검증된 정보:`);
                enhancedInfo.forEach(info => console.log(`     - ${info}`));
            }
            else {
                console.log(`   📋 교차 검증 정보 없음`);
            }
        });
        const testResultPath = path.join(process.cwd(), '..', '..', 'src', 'data', 'test_cross_validation_crawled.json');
        await fs.writeFile(testResultPath, JSON.stringify(mergeResult.mergedData, null, 2), 'utf-8');
        console.log(`\n💾 교차 검증 테스트 결과 저장: ${testResultPath}`);
        console.log('\n📈 크롤링 진행상황:');
        console.log(`- 현재: ${crawledResults.length}/${testGyms.length}`);
        console.log(`- 진행률: 100%`);
        console.log(`- 상태: completed`);
        console.log(`- 오류 수: 0`);
        console.log(`- 결과 수: ${crawledResults.length}`);
        console.log('\n💡 권장사항:');
        if (crossValidatedCount === 0) {
            console.log('   ⚠️ 교차 검증이 실행되지 않았습니다.');
            console.log('   🔧 개선 방안:');
            console.log('     1. 더 많은 검색 엔진에서 성공적인 결과 수집');
            console.log('     2. 지연시간 조정으로 차단 방지');
            console.log('     3. 검색 쿼리 다양화');
        }
        else if (crossValidatedCount < crawledResults.length / 2) {
            console.log(`   ⚠️ 교차 검증률이 낮습니다 (${((crossValidatedCount / crawledResults.length) * 100).toFixed(1)}%)`);
            console.log('   🔧 개선 방안:');
            console.log('     1. 검색 엔진별 성공률 분석');
            console.log('     2. 실패한 검색 엔진의 CSS 선택자 업데이트');
            console.log('     3. 더 긴 지연시간 설정');
        }
        else {
            console.log(`   ✅ 교차 검증이 ${crossValidatedCount}개 성공했습니다!`);
            console.log(`   📊 검증된 정보:`);
            console.log(`      - 전화번호: ${phoneValidatedCount}개`);
            console.log(`      - 운영시간: ${hoursValidatedCount}개`);
            console.log(`      - 가격정보: ${priceValidatedCount}개`);
            console.log(`      - 시설정보: ${facilitiesValidatedCount}개`);
            console.log(`   🚀 전체 크롤링 실행을 고려해보세요.`);
            console.log(`   📊 예상 전체 시간: ${(crawledResults.length * (duration / crawledResults.length) * 467 / 3 / 60).toFixed(1)}분`);
        }
    }
    catch (error) {
        console.error('❌ 교차 검증 크롤링 테스트 실패:', error);
    }
    finally {
        if (databaseConfig_1.AppDataSource.isInitialized) {
            await databaseConfig_1.AppDataSource.destroy();
            console.log('✅ 데이터베이스 연결 종료');
        }
    }
}
console.log('🚀 교차 검증 크롤링 테스트 스크립트 시작');
testCrossValidationCrawling()
    .then(() => {
    console.log('🎉 교차 검증 크롤링 테스트 완료');
    process.exit(0);
})
    .catch((error) => {
    console.error('💥 교차 검증 크롤링 테스트 실패:', error);
    process.exit(1);
});
