// ============================================================================
// API Response Test Script
// ============================================================================

console.log('🚀 API 응답 테스트 시작...')

async function testApiResponse() {
  try {
    // API 서버 연결 확인
    console.log('🔌 API 서버 연결 확인 중...')
    
    const response = await fetch('http://localhost:3001/api/machines', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    
    console.log('✅ API 응답 성공!')
    console.log('📊 응답 데이터 구조:')
    console.log('- message:', data.message)
    console.log('- count:', data.count)
    console.log('- data length:', data.data?.length || 0)
    
    if (data.data && data.data.length > 0) {
      console.log('\n📋 첫 번째 기구 데이터:')
      const firstMachine = data.data[0]
      console.log('- ID:', firstMachine.id)
      console.log('- Name:', firstMachine.name)
      console.log('- NameKo:', firstMachine.nameKo)
      console.log('- Category:', firstMachine.category)
      console.log('- Difficulty:', firstMachine.difficulty)
      console.log('- ImageUrl:', firstMachine.imageUrl)
    }

    console.log('\n🎯 총 기구 수:', data.data?.length || 0)
    
    if (data.data && data.data.length === 10) {
      console.log('⚠️ 10개의 기구만 반환되고 있습니다. 이는 제한이 있음을 의미합니다.')
    } else if (data.data && data.data.length > 10) {
      console.log('✅ 10개 이상의 기구가 반환되고 있습니다.')
    } else {
      console.log('❌ 기구 데이터가 없거나 적습니다.')
    }

  } catch (error) {
    console.error('❌ API 테스트 실패:', error)
    console.log('\n💡 해결 방법:')
    console.log('1. 백엔드 서버가 실행 중인지 확인하세요')
    console.log('2. 데이터베이스에 데이터가 있는지 확인하세요')
    console.log('3. API 엔드포인트가 올바른지 확인하세요')
  }
}

// 스크립트 실행
testApiResponse()
  .then(() => {
    console.log('🎉 테스트 완료!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ 테스트 실패:', error)
    process.exit(1)
  })
