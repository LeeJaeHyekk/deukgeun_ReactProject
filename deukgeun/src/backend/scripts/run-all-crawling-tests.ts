/**
 * 모든 크롤링 테스트를 순차적으로 실행하는 통합 테스트 스크립트
 */
import { testBasicCrawling } from '@backend/scripts/test-crawling-basic'
import { testComplexCrawling } from '@backend/scripts/test-crawling-complex'
import { testStressCrawling } from '@backend/scripts/test-crawling-stress'
import { testFallbackCrawling } from '@backend/scripts/test-crawling-fallback'
import { testPerformanceCrawling } from '@backend/scripts/test-crawling-performance'

interface TestResult {
  testName: string
  success: boolean
  successRate?: number
  totalTime?: number
  error?: string
  details?: any
}

async function runAllCrawlingTests() {
  console.log('🚀 모든 크롤링 테스트 시작')
  console.log('='.repeat(60))
  
  const tests = [
    { name: '기본 크롤링 테스트', fn: testBasicCrawling },
    { name: '복잡한 쿼리 테스트', fn: testComplexCrawling },
    { name: '스트레스 테스트', fn: testStressCrawling },
    { name: '폴백 전략 테스트', fn: testFallbackCrawling },
    { name: '성능 테스트', fn: testPerformanceCrawling }
  ]
  
  const results: TestResult[] = []
  let totalStartTime = Date.now()
  
  for (let i = 0; i < tests.length; i++) {
    const test = tests[i]
    console.log(`\n🧪 ${i + 1}/${tests.length} - ${test.name} 실행 중...`)
    console.log('-'.repeat(40))
    
    try {
      const testStartTime = Date.now()
      const result = await test.fn()
      const testEndTime = Date.now()
      
      const testResult: TestResult = {
        testName: test.name,
        success: result.success,
        successRate: result.successRate,
        totalTime: testEndTime - testStartTime,
        details: result
      }
      
      if (!result.success) {
        testResult.error = result.error
      }
      
      results.push(testResult)
      
      console.log(`✅ ${test.name} 완료 - 성공률: ${result.successRate?.toFixed(1) || 0}%, 시간: ${testResult.totalTime}ms`)
      
    } catch (error) {
      const testResult: TestResult = {
        testName: test.name,
        success: false,
        error: error instanceof Error ? error.message : String(error)
      }
      
      results.push(testResult)
      console.log(`❌ ${test.name} 실패 - ${error instanceof Error ? error.message : String(error)}`)
    }
    
    // 테스트 간 잠시 대기
    if (i < tests.length - 1) {
      console.log('⏳ 다음 테스트까지 3초 대기...')
      await new Promise(resolve => setTimeout(resolve, 3000))
    }
  }
  
  const totalEndTime = Date.now()
  const totalTime = totalEndTime - totalStartTime
  
  // 전체 결과 요약
  console.log('\n' + '='.repeat(60))
  console.log('📊 전체 테스트 결과 요약')
  console.log('='.repeat(60))
  
  const successCount = results.filter(r => r.success).length
  const totalSuccessRate = results.reduce((sum, r) => sum + (r.successRate || 0), 0) / results.length
  
  console.log(`📈 전체 성공률: ${totalSuccessRate.toFixed(1)}%`)
  console.log(`✅ 성공한 테스트: ${successCount}/${results.length}개`)
  console.log(`⏱️ 총 실행 시간: ${totalTime}ms`)
  console.log(`⏱️ 평균 테스트 시간: ${Math.round(totalTime / results.length)}ms`)
  
  console.log('\n📋 개별 테스트 결과:')
  console.log('-'.repeat(60))
  
  results.forEach((result, index) => {
    const status = result.success ? '✅' : '❌'
    const successRate = result.successRate ? `${result.successRate.toFixed(1)}%` : 'N/A'
    const time = result.totalTime ? `${result.totalTime}ms` : 'N/A'
    
    console.log(`${index + 1}. ${status} ${result.testName}`)
    console.log(`   성공률: ${successRate}, 시간: ${time}`)
    
    if (result.error) {
      console.log(`   에러: ${result.error}`)
    }
    
    console.log('')
  })
  
  // 성능 분석
  console.log('📊 성능 분석:')
  console.log('-'.repeat(30))
  
  const avgSuccessRate = results.filter(r => r.success).reduce((sum, r) => sum + (r.successRate || 0), 0) / successCount
  const avgTime = results.reduce((sum, r) => sum + (r.totalTime || 0), 0) / results.length
  
  console.log(`평균 성공률: ${avgSuccessRate.toFixed(1)}%`)
  console.log(`평균 실행 시간: ${Math.round(avgTime)}ms`)
  
  // 최고/최저 성능
  const bestTest = results.reduce((best, current) => 
    (current.successRate || 0) > (best.successRate || 0) ? current : best
  )
  const worstTest = results.reduce((worst, current) => 
    (current.successRate || 0) < (worst.successRate || 0) ? current : worst
  )
  
  console.log(`최고 성능: ${bestTest.testName} (${bestTest.successRate?.toFixed(1)}%)`)
  console.log(`최저 성능: ${worstTest.testName} (${worstTest.successRate?.toFixed(1)}%)`)
  
  // 권장사항
  console.log('\n💡 권장사항:')
  console.log('-'.repeat(20))
  
  if (totalSuccessRate >= 90) {
    console.log('✅ 전체적으로 우수한 성능을 보입니다.')
  } else if (totalSuccessRate >= 70) {
    console.log('⚠️ 전반적인 성능이 보통 수준입니다. 일부 개선이 필요할 수 있습니다.')
  } else {
    console.log('❌ 성능 개선이 필요합니다. 설정을 재검토해보세요.')
  }
  
  if (avgTime > 10000) {
    console.log('⚠️ 평균 실행 시간이 길어 최적화를 고려해보세요.')
  }
  
  const failedTests = results.filter(r => !r.success)
  if (failedTests.length > 0) {
    console.log(`❌ ${failedTests.length}개의 테스트가 실패했습니다. 로그를 확인해보세요.`)
  }
  
  console.log('\n🎉 모든 테스트 완료!')
  
  return {
    success: successCount === results.length,
    totalSuccessRate,
    successCount,
    totalTests: results.length,
    totalTime,
    results
  }
}

// 스크립트 실행
if (require.main === module) {
  runAllCrawlingTests()
    .then((result) => {
      if (result.success) {
        console.log('🎉 모든 테스트가 성공적으로 완료되었습니다!')
        process.exit(0)
      } else {
        console.log('⚠️ 일부 테스트가 실패했습니다.')
        process.exit(1)
      }
    })
    .catch((error) => {
      console.error('💥 통합 테스트 스크립트 실패:', error)
      process.exit(1)
    })
}

export { runAllCrawlingTests }
