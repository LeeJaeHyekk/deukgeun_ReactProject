/**
 * 개선된 크롤링 시스템 테스트 스크립트
 */
import { OptimizedGymCrawlingSource } from '../modules/crawling/sources/OptimizedGymCrawlingSource'
import { ProcessedGymData } from '../modules/crawling/types/CrawlingTypes'

async function testImprovedCrawling() {
  console.log('🧪 개선된 크롤링 시스템 테스트 시작')
  
  const crawlingSource = new OptimizedGymCrawlingSource()
  
  // 테스트용 헬스장 데이터
  const testGyms: ProcessedGymData[] = [
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
    },
    {
      name: '피트니스센터',
      address: '서울시 마포구',
      type: 'private',
      source: 'test',
      confidence: 0
    }
  ]
  
  console.log(`📋 테스트 대상: ${testGyms.length}개 헬스장`)
  
  try {
    const results = await crawlingSource.crawlGymsFromRawData(testGyms)
    
    console.log('\n📊 테스트 결과:')
    console.log('='.repeat(50))
    
    results.forEach((result, index) => {
      console.log(`\n${index + 1}. ${result.name}`)
      console.log(`   주소: ${result.address}`)
      console.log(`   전화번호: ${result.phone || 'N/A'}`)
      console.log(`   운영시간: ${result.openHour || 'N/A'} - ${result.closeHour || 'N/A'}`)
      console.log(`   가격: ${result.price || 'N/A'}`)
      console.log(`   평점: ${result.rating || 'N/A'}`)
      console.log(`   리뷰 수: ${result.reviewCount || 'N/A'}`)
      console.log(`   시설: ${result.facilities?.join(', ') || 'N/A'}`)
      console.log(`   소스: ${result.source}`)
      console.log(`   신뢰도: ${result.confidence}`)
      console.log(`   타입: ${result.type}`)
    })
    
    console.log('\n✅ 테스트 완료!')
    
    // 성공률 계산
    const successCount = results.filter(r => r.confidence > 0.1).length
    const successRate = (successCount / results.length) * 100
    
    console.log(`\n📈 성공률: ${successRate.toFixed(1)}% (${successCount}/${results.length})`)
    
    // 메트릭 리포트 생성
    console.log('\n📊 상세 성능 리포트:')
    console.log('='.repeat(50))
    
    // 각 검색 엔진의 메트릭 출력
    const searchEngines = crawlingSource.getSearchEngines()
    searchEngines.forEach((engine, index) => {
      console.log(`\n🔍 검색 엔진 ${index + 1}: ${engine.constructor.name}`)
      console.log(engine.generatePerformanceReport())
    })
    
  } catch (error) {
    console.error('❌ 테스트 실패:', error)
  }
}

// 스크립트 실행
if (require.main === module) {
  testImprovedCrawling()
    .then(() => {
      console.log('🎉 테스트 스크립트 완료')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 테스트 스크립트 실패:', error)
      process.exit(1)
    })
}

export { testImprovedCrawling }
