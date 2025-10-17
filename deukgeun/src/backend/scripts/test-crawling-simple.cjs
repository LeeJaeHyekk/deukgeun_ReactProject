/**
 * 간단한 크롤링 테스트 스크립트 (JavaScript 버전)
 */
const { OptimizedGymCrawlingSource } = require('../modules/crawling/sources/OptimizedGymCrawlingSource');

async function testSimpleCrawling() {
  console.log('🧪 간단한 크롤링 테스트 시작');
  console.log('='.repeat(50));
  
  try {
    const crawlingSource = new OptimizedGymCrawlingSource();
    
    // 테스트용 헬스장 데이터
    const testGyms = [
      {
        name: '헬스장모어',
        address: '서울시 강남구',
        type: 'private',
        source: 'test',
        confidence: 0
      },
      {
        name: '피트니스센터',
        address: '서울시 서초구',
        type: 'private',
        source: 'test',
        confidence: 0
      }
    ];
    
    console.log(`📋 테스트 대상: ${testGyms.length}개 헬스장`);
    
    const startTime = Date.now();
    const results = await crawlingSource.crawlGymsFromRawData(testGyms);
    const endTime = Date.now();
    
    console.log('\n📊 테스트 결과:');
    console.log('='.repeat(50));
    
    results.forEach((result, index) => {
      console.log(`\n${index + 1}. ${result.name}`);
      console.log(`   주소: ${result.address}`);
      console.log(`   전화번호: ${result.phone || 'N/A'}`);
      console.log(`   소스: ${result.source}`);
      console.log(`   신뢰도: ${result.confidence}`);
    });
    
    // 성공률 계산
    const successCount = results.filter(r => r.confidence > 0.1).length;
    const successRate = (successCount / results.length) * 100;
    
    console.log(`\n📈 성공률: ${successRate.toFixed(1)}% (${successCount}/${results.length})`);
    console.log(`⏱️ 총 실행 시간: ${endTime - startTime}ms`);
    
    return { success: true, successRate, totalTime: endTime - startTime };
    
  } catch (error) {
    console.error('❌ 테스트 실패:', error);
    return { success: false, error: error.message };
  }
}

// 스크립트 실행
if (require.main === module) {
  testSimpleCrawling()
    .then((result) => {
      if (result.success) {
        console.log('✅ 간단한 크롤링 테스트 완료');
        process.exit(0);
      } else {
        console.log('❌ 간단한 크롤링 테스트 실패');
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error('💥 테스트 스크립트 실패:', error);
      process.exit(1);
    });
}

module.exports = { testSimpleCrawling };
