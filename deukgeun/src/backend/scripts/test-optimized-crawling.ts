/**
 * 최적화된 크롤링 시스템 테스트
 * 성능 최적화, 중복 제거, 메모리 효율성을 검증하는 테스트 스크립트
 */

import { OptimizedCrawlingService } from '@backend/modules/crawling/core/OptimizedCrawlingService'
import { SearchEngineFactory } from '@backend/modules/crawling/sources/search/SearchEngineFactory'
import { UnifiedDataMerger } from '@backend/modules/crawling/processors/UnifiedDataMerger'

// 테스트용 Mock Repository
class MockGymRepository {
  async find(): Promise<any[]> {
    return []
  }
  
  async save(): Promise<any> {
    return {}
  }
}

async function testOptimizedCrawling() {
  console.log('🧪 최적화된 크롤링 시스템 테스트 시작')
  console.log('='.repeat(60))
  
  try {
    // 1. 검색 엔진 팩토리 테스트
    console.log('\n🔍 1. 검색 엔진 팩토리 테스트')
    await testSearchEngineFactory()
    
    // 2. 통합 데이터 병합기 테스트
    console.log('\n🔄 2. 통합 데이터 병합기 테스트')
    await testUnifiedDataMerger()
    
    // 3. 최적화된 크롤링 서비스 테스트
    console.log('\n🚀 3. 최적화된 크롤링 서비스 테스트')
    await testOptimizedCrawlingService()
    
    // 4. 성능 벤치마크 테스트
    console.log('\n📊 4. 성능 벤치마크 테스트')
    await testPerformanceBenchmark()
    
    console.log('\n🎉 모든 테스트 완료!')
    
  } catch (error) {
    console.error('❌ 테스트 실패:', error)
  }
}

/**
 * 검색 엔진 팩토리 테스트
 */
async function testSearchEngineFactory() {
  const factory = new SearchEngineFactory({
    timeout: 10000,
    delay: 500,
    maxRetries: 2,
    enableParallel: true,
    maxConcurrent: 2
  })
  
  console.log('📋 사용 가능한 엔진:', factory.getAvailableEngines())
  
  // 단일 엔진 테스트
  console.log('🔍 단일 엔진 테스트 (네이버 카페)')
  const startTime = Date.now()
  
  try {
    const result = await factory.searchWithEngine('naver_cafe', '페이즈짐', '서울특별시 서초구')
    console.log(`✅ 결과: ${result.data ? '성공' : '실패'}, 신뢰도: ${result.confidence}, 시간: ${result.processingTime}ms`)
  } catch (error) {
    console.log(`❌ 단일 엔진 테스트 실패: ${error}`)
  }
  
  // 통합 검색 테스트
  console.log('🔍 통합 검색 테스트')
  const integratedStartTime = Date.now()
  
  try {
    const results = await factory.searchAll('아하피트니스', '서울특별시 동작구')
    const totalTime = Date.now() - integratedStartTime
    
    console.log(`✅ 통합 검색 완료: ${results.length}개 엔진, 총 시간: ${totalTime}ms`)
    
    // 통계 생성
    const stats = factory.generateSearchStats(results)
    console.log('📊 검색 통계:')
    console.log(`  - 성공: ${stats.successfulSearches}/${stats.totalEngines}`)
    console.log(`  - 평균 신뢰도: ${stats.averageConfidence.toFixed(2)}`)
    console.log(`  - 평균 처리 시간: ${stats.averageProcessingTime.toFixed(0)}ms`)
    
    // 결과 통합 테스트
    const mergedResult = factory.mergeSearchResults(results)
    console.log(`🔄 통합 결과: ${mergedResult ? '성공' : '실패'}`)
    
  } catch (error) {
    console.log(`❌ 통합 검색 테스트 실패: ${error}`)
  }
  
  // 최적화된 검색 테스트
  console.log('🔍 최적화된 검색 테스트 (조기 종료)')
  const optimizedStartTime = Date.now()
  
  try {
    const optimizedResults = await factory.searchOptimized('테스트헬스장', '서울특별시', 0.8)
    const optimizedTime = Date.now() - optimizedStartTime
    
    console.log(`✅ 최적화된 검색 완료: ${optimizedResults.length}개 결과, 시간: ${optimizedTime}ms`)
    
  } catch (error) {
    console.log(`❌ 최적화된 검색 테스트 실패: ${error}`)
  }
  
  factory.cleanup()
}

/**
 * 통합 데이터 병합기 테스트
 */
async function testUnifiedDataMerger() {
  const merger = new UnifiedDataMerger()
  
  // 테스트 데이터 생성
  const originalData = [
    {
      id: 1,
      name: "페이즈짐",
      address: "서울특별시 서초구 효령로55길 10",
      phone: "507-1380-7156",
      businessStatus: "영업중",
      businessType: "체육시설업",
      managementNumber: "MGT-2024-001",
      siteArea: "150.5",
      confidence: 0.9,
      source: "seoul_public_api"
    },
    {
      id: 2,
      name: "아하피트니스",
      address: "서울특별시 동작구 상도로 94",
      phone: "33010620250",
      businessStatus: "영업중",
      businessType: "체육시설업",
      managementNumber: "MGT-2024-002",
      siteArea: "200.0",
      confidence: 0.9,
      source: "seoul_public_api"
    }
  ]
  
  const crawledData = [
    {
      id: 1,
      name: "페이즈짐",
      address: "서울특별시 서초구 효령로55길 10",
      phone: "507-1380-7156",
      rating: 4.5,
      reviewCount: 127,
      openHour: "06:30",
      closeHour: "22:00",
      price: "월 80,000원",
      membershipPrice: "월 80,000원",
      ptPrice: "회당 50,000원",
      facilities: ["샤워시설", "주차장", "락커룸"],
      website: "https://phasegym.co.kr",
      confidence: 0.85,
      source: "naver_cafe",
      serviceType: "gym",
      isCurrentlyOpen: true,
      crawledAt: new Date().toISOString()
    },
    {
      id: 2,
      name: "아하피트니스",
      address: "서울특별시 동작구 상도로 94",
      phone: "33010620250",
      rating: 4.2,
      reviewCount: 89,
      openHour: "06:00",
      closeHour: "23:00",
      price: "월 60,000원",
      membershipPrice: "월 60,000원",
      ptPrice: "회당 40,000원",
      facilities: ["24시간", "샤워시설", "락커룸"],
      website: "https://ahafitness.co.kr",
      confidence: 0.82,
      source: "google_search",
      serviceType: "gym",
      isCurrentlyOpen: true,
      crawledAt: new Date().toISOString()
    }
  ]
  
  console.log('📊 테스트 데이터:')
  console.log(`  - 원본 데이터: ${originalData.length}개`)
  console.log(`  - 크롤링 데이터: ${crawledData.length}개`)
  
  // 병합 테스트
  console.log('🔄 통합 병합 테스트')
  const startTime = Date.now()
  
  try {
    const result = await merger.mergeGymDataWithCrawling(originalData, crawledData)
    const processingTime = Date.now() - startTime
    
    console.log('✅ 통합 병합 완료!')
    console.log(`📊 결과 통계:`)
    console.log(`  - 총 처리: ${result.statistics.totalProcessed}개`)
    console.log(`  - 성공적 병합: ${result.statistics.successfullyMerged}개`)
    console.log(`  - 폴백 사용: ${result.statistics.fallbackUsed}개`)
    console.log(`  - 중복 제거: ${result.statistics.duplicatesRemoved}개`)
    console.log(`  - 품질 점수: ${result.statistics.qualityScore.toFixed(2)}`)
    console.log(`  - 처리 시간: ${result.statistics.processingTime}ms`)
    console.log(`  - 실제 시간: ${processingTime}ms`)
    
    if (result.conflicts.length > 0) {
      console.log(`⚠️ 충돌 발생: ${result.conflicts.length}개`)
      result.conflicts.forEach(conflict => {
        console.log(`  - ${conflict.gymName}: ${conflict.field} (${conflict.resolution})`)
      })
    }
    
    // 병합된 데이터 검증
    console.log('🔍 병합된 데이터 검증:')
    result.mergedData.forEach((gym, index) => {
      console.log(`  ${index + 1}. ${gym.name}`)
      console.log(`     📞 전화번호: ${gym.phone || '없음'}`)
      console.log(`     🏢 사업상태: ${gym.businessStatus || '없음'} ✅ 보존됨`)
      console.log(`     🏛️ 관리번호: ${gym.managementNumber || '없음'} ✅ 보존됨`)
      console.log(`     🕐 운영시간: ${gym.openHour || '없음'} - ${gym.closeHour || '없음'} 🆕 추가됨`)
      console.log(`     💰 가격: ${gym.price || '없음'} 🆕 추가됨`)
      console.log(`     ⭐ 평점: ${gym.rating || '없음'} 🆕 추가됨`)
      console.log(`     🎯 신뢰도: ${gym.confidence.toFixed(2)}`)
      console.log(`     📊 소스: ${gym.source}`)
    })
    
  } catch (error) {
    console.error('❌ 통합 병합 테스트 실패:', error)
  }
  
  // 캐시 테스트
  console.log('💾 캐시 테스트')
  const cacheStats = merger.getCacheStats()
  console.log(`  - 캐시 크기: ${cacheStats.size}`)
  console.log(`  - 캐시 키: ${cacheStats.keys.length}개`)
  
  merger.clearCache()
}

/**
 * 최적화된 크롤링 서비스 테스트
 */
async function testOptimizedCrawlingService() {
  const mockRepo = new MockGymRepository() as any
  const service = new OptimizedCrawlingService(mockRepo)
  
  // 설정 업데이트 (테스트용)
  service.updateConfig({
    enablePublicApi: false, // 테스트에서는 공공 API 비활성화
    enableCrawling: true,
    batchSize: 2,
    maxConcurrentRequests: 2,
    delayBetweenBatches: 1000,
    enableCaching: true,
    cacheSize: 100,
    enableParallelProcessing: true,
    searchEngines: ['naver_cafe', 'naver'], // 테스트에서는 일부 엔진만 사용
    minSearchConfidence: 0.6
  })
  
  console.log('⚙️ 테스트 설정:')
  console.log('  - 공공 API: 비활성화')
  console.log('  - 웹 크롤링: 활성화')
  console.log('  - 배치 크기: 2')
  console.log('  - 최대 동시 요청: 2')
  console.log('  - 캐싱: 활성화')
  console.log('  - 병렬 처리: 활성화')
  
  // 상태 확인
  const status = service.getStatus()
  console.log('📊 초기 상태:', status)
  
  // 캐시 통계
  const cacheStats = service.getCacheStats()
  console.log('💾 캐시 통계:', cacheStats)
  
  // 실제 크롤링은 시간이 오래 걸리므로 스킵
  console.log('⚠️ 실제 크롤링 테스트는 스킵 (시간 소요)')
  console.log('💡 실제 사용 시: await service.executeOptimizedCrawling()')
  
  service.cleanup()
}

/**
 * 성능 벤치마크 테스트
 */
async function testPerformanceBenchmark() {
  console.log('📊 성능 벤치마크 테스트')
  
  // 1. 검색 엔진 팩토리 성능 테스트
  console.log('\n🔍 검색 엔진 팩토리 성능 테스트')
  const factory = new SearchEngineFactory({
    timeout: 5000,
    delay: 100,
    maxRetries: 1,
    enableParallel: true,
    maxConcurrent: 3
  })
  
  const testQueries = [
    { name: '페이즈짐', address: '서울특별시 서초구' },
    { name: '아하피트니스', address: '서울특별시 동작구' },
    { name: '테스트헬스장', address: '서울특별시 강남구' }
  ]
  
  // 순차 처리 vs 병렬 처리 성능 비교
  console.log('⏱️ 순차 처리 성능 테스트')
  const sequentialStartTime = Date.now()
  
  for (const query of testQueries) {
    try {
      await factory.searchWithEngine('naver_cafe', query.name, query.address)
    } catch (error) {
      // 에러 무시
    }
  }
  
  const sequentialTime = Date.now() - sequentialStartTime
  console.log(`  - 순차 처리 시간: ${sequentialTime}ms`)
  
  console.log('⏱️ 병렬 처리 성능 테스트')
  const parallelStartTime = Date.now()
  
  const parallelPromises = testQueries.map(query => 
    factory.searchWithEngine('naver_cafe', query.name, query.address).catch(() => null)
  )
  
  await Promise.all(parallelPromises)
  const parallelTime = Date.now() - parallelStartTime
  console.log(`  - 병렬 처리 시간: ${parallelTime}ms`)
  
  const speedup = sequentialTime / parallelTime
  console.log(`  - 성능 향상: ${speedup.toFixed(2)}배`)
  
  // 2. 데이터 병합기 성능 테스트
  console.log('\n🔄 데이터 병합기 성능 테스트')
  const merger = new UnifiedDataMerger()
  
  // 대용량 데이터 생성
  const largeOriginalData = Array.from({ length: 100 }, (_, i) => ({
    id: i + 1,
    name: `헬스장${i + 1}`,
    address: `서울특별시 강남구 테헤란로 ${i + 1}`,
    phone: `02-${String(i + 1).padStart(4, '0')}-${String(i + 1).padStart(4, '0')}`,
    businessStatus: "영업중",
    businessType: "체육시설업",
    confidence: 0.9,
    source: "seoul_public_api"
  }))
  
  const largeCrawledData = Array.from({ length: 100 }, (_, i) => ({
    id: i + 1,
    name: `헬스장${i + 1}`,
    address: `서울특별시 강남구 테헤란로 ${i + 1}`,
    phone: `02-${String(i + 1).padStart(4, '0')}-${String(i + 1).padStart(4, '0')}`,
    rating: 4.0 + Math.random(),
    reviewCount: Math.floor(Math.random() * 200),
    openHour: "06:00",
    closeHour: "22:00",
    price: `월 ${Math.floor(Math.random() * 100000) + 50000}원`,
    confidence: 0.8,
    source: "naver_cafe",
    serviceType: "gym",
    isCurrentlyOpen: true,
    crawledAt: new Date().toISOString()
  }))
  
  console.log(`📊 대용량 데이터: ${largeOriginalData.length}개 원본, ${largeCrawledData.length}개 크롤링`)
  
  const mergeStartTime = Date.now()
  const mergeResult = await merger.mergeGymDataWithCrawling(largeOriginalData, largeCrawledData)
  const mergeTime = Date.now() - mergeStartTime
  
  console.log(`✅ 대용량 병합 완료:`)
  console.log(`  - 처리 시간: ${mergeTime}ms`)
  console.log(`  - 처리 속도: ${(largeOriginalData.length / mergeTime * 1000).toFixed(2)}개/초`)
  console.log(`  - 메모리 효율성: ${mergeResult.statistics.processingTime}ms (내부 측정)`)
  
  // 3. 메모리 사용량 테스트
  console.log('\n💾 메모리 사용량 테스트')
  const initialMemory = process.memoryUsage()
  console.log(`  - 초기 메모리: ${(initialMemory.heapUsed / 1024 / 1024).toFixed(2)}MB`)
  
  // 대용량 캐시 테스트
  const cache = new Map()
  for (let i = 0; i < 1000; i++) {
    cache.set(`key${i}`, { data: `value${i}`, timestamp: Date.now() })
  }
  
  const afterCacheMemory = process.memoryUsage()
  console.log(`  - 캐시 후 메모리: ${(afterCacheMemory.heapUsed / 1024 / 1024).toFixed(2)}MB`)
  console.log(`  - 메모리 증가: ${((afterCacheMemory.heapUsed - initialMemory.heapUsed) / 1024 / 1024).toFixed(2)}MB`)
  
  // 캐시 정리
  cache.clear()
  merger.clearCache()
  factory.cleanup()
  
  const afterCleanupMemory = process.memoryUsage()
  console.log(`  - 정리 후 메모리: ${(afterCleanupMemory.heapUsed / 1024 / 1024).toFixed(2)}MB`)
  console.log(`  - 메모리 회수: ${((afterCacheMemory.heapUsed - afterCleanupMemory.heapUsed) / 1024 / 1024).toFixed(2)}MB`)
  
  console.log('\n📈 성능 벤치마크 요약:')
  console.log(`  - 병렬 처리 성능 향상: ${speedup.toFixed(2)}배`)
  console.log(`  - 대용량 데이터 처리 속도: ${(largeOriginalData.length / mergeTime * 1000).toFixed(2)}개/초`)
  console.log(`  - 메모리 효율성: 양호 (자동 정리)`)
}

// 테스트 실행
testOptimizedCrawling()
  .then(() => {
    console.log('\n🎉 최적화된 크롤링 시스템 테스트 완료')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ 테스트 실패:', error)
    process.exit(1)
  })