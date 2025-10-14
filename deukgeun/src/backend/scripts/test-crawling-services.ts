import { CrawlingBypassService } from '../services/crawlingBypassService'
import { searchWithEnhancedSources } from '../services/enhancedCrawlerService'
import { searchWithMultipleSources } from '../services/multiSourceCrawlerService'

/**
 * 크롤링 서비스 테스트 스크립트
 * 각 크롤링 서비스의 기본 기능을 테스트합니다.
 */

async function testCrawlingBypassService() {
  console.log('\n🧪 CrawlingBypassService 테스트 시작')
  console.log('=' * 50)
  
  try {
    const service = new CrawlingBypassService()
    const testGymName = '스포츠몬스터'
    
    console.log(`📡 테스트 헬스장: ${testGymName}`)
    
    const results = await service.crawlAllSources(testGymName)
    
    console.log(`✅ 크롤링 결과: ${results.length}개`)
    
    if (results.length > 0) {
      console.log('\n📋 첫 번째 결과:')
      const firstResult = results[0]
      console.log(`- 이름: ${firstResult.name}`)
      console.log(`- 주소: ${firstResult.address}`)
      console.log(`- 전화번호: ${firstResult.phone}`)
      console.log(`- 24시간: ${firstResult.is24Hours}`)
      console.log(`- 주차: ${firstResult.hasParking}`)
      console.log(`- 샤워: ${firstResult.hasShower}`)
      console.log(`- PT: ${firstResult.hasPT}`)
      console.log(`- GX: ${firstResult.hasGX}`)
      console.log(`- 소스: ${firstResult.source}`)
      console.log(`- 신뢰도: ${firstResult.confidence}`)
    } else {
      console.log('❌ 크롤링 결과가 없습니다')
    }
    
    return { success: true, resultCount: results.length }
  } catch (error) {
    console.error('❌ CrawlingBypassService 테스트 실패:', error)
    return { success: false, error: error instanceof Error ? error.message : '알 수 없는 오류' }
  }
}

async function testEnhancedCrawlerService() {
  console.log('\n🧪 EnhancedCrawlerService 테스트 시작')
  console.log('=' * 50)
  
  try {
    const testGymName = '스포츠몬스터'
    
    console.log(`📡 테스트 헬스장: ${testGymName}`)
    
    const result = await searchWithEnhancedSources(testGymName)
    
    if (result) {
      console.log('✅ 향상된 크롤링 성공')
      console.log('\n📋 결과:')
      console.log(`- 이름: ${result.name}`)
      console.log(`- 주소: ${result.address}`)
      console.log(`- 전화번호: ${result.phone || '없음'}`)
      console.log(`- 위도: ${result.latitude}`)
      console.log(`- 경도: ${result.longitude}`)
      console.log(`- 소스: ${result.source}`)
      console.log(`- 신뢰도: ${result.confidence}`)
      console.log(`- 데이터 소스: ${result.dataSource}`)
      console.log(`- PT: ${result.hasPT}`)
      console.log(`- GX: ${result.hasGX}`)
      console.log(`- 그룹PT: ${result.hasGroupPT}`)
      console.log(`- 주차: ${result.hasParking}`)
      console.log(`- 샤워: ${result.hasShower}`)
      console.log(`- 24시간: ${result.is24Hours}`)
      console.log(`- 운영시간: ${result.openHour}`)
    } else {
      console.log('❌ 향상된 크롤링 결과가 없습니다')
    }
    
    return { success: true, hasResult: !!result }
  } catch (error) {
    console.error('❌ EnhancedCrawlerService 테스트 실패:', error)
    return { success: false, error: error instanceof Error ? error.message : '알 수 없는 오류' }
  }
}

async function testMultiSourceCrawlerService() {
  console.log('\n🧪 MultiSourceCrawlerService 테스트 시작')
  console.log('=' * 50)
  
  try {
    const testGymName = '스포츠몬스터'
    
    console.log(`📡 테스트 헬스장: ${testGymName}`)
    
    const result = await searchWithMultipleSources(testGymName)
    
    if (result) {
      console.log('✅ 멀티소스 크롤링 성공')
      console.log('\n📋 결과:')
      console.log(`- 이름: ${result.name}`)
      console.log(`- 주소: ${result.address}`)
      console.log(`- 전화번호: ${result.phone || '없음'}`)
      console.log(`- 위도: ${result.latitude}`)
      console.log(`- 경도: ${result.longitude}`)
      console.log(`- 소스: ${result.source}`)
      console.log(`- 신뢰도: ${result.confidence}`)
    } else {
      console.log('❌ 멀티소스 크롤링 결과가 없습니다')
    }
    
    return { success: true, hasResult: !!result }
  } catch (error) {
    console.error('❌ MultiSourceCrawlerService 테스트 실패:', error)
    return { success: false, error: error instanceof Error ? error.message : '알 수 없는 오류' }
  }
}

async function runAllTests() {
  console.log('🚀 크롤링 서비스 테스트 시작')
  console.log('=' * 60)
  
  const results = {
    crawlingBypass: await testCrawlingBypassService(),
    enhancedCrawler: await testEnhancedCrawlerService(),
    multiSourceCrawler: await testMultiSourceCrawlerService()
  }
  
  console.log('\n📊 테스트 결과 요약')
  console.log('=' * 60)
  
  Object.entries(results).forEach(([serviceName, result]) => {
    const status = result.success ? '✅' : '❌'
    console.log(`${status} ${serviceName}: ${result.success ? '성공' : '실패'}`)
    if (!result.success && result.error) {
      console.log(`   오류: ${result.error}`)
    }
  })
  
  const successCount = Object.values(results).filter(r => r.success).length
  const totalCount = Object.keys(results).length
  
  console.log(`\n🎯 전체 성공률: ${successCount}/${totalCount} (${((successCount / totalCount) * 100).toFixed(1)}%)`)
  
  if (successCount === totalCount) {
    console.log('🎉 모든 크롤링 서비스가 정상 동작합니다!')
  } else {
    console.log('⚠️ 일부 크롤링 서비스에 문제가 있습니다.')
  }
}

// 테스트 실행
if (require.main === module) {
  runAllTests().catch(console.error)
}

export { testCrawlingBypassService, testEnhancedCrawlerService, testMultiSourceCrawlerService, runAllTests }
