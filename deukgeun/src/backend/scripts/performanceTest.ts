import { createConnection } from 'typeorm'
import { config } from '../config/env'
import { Gym } from '../entities/Gym'
import { optimizedGymSearchService } from '../services/optimizedGymSearchService'

/**
 * 헬스장 검색 성능 테스트 스크립트
 */
async function performanceTest() {
  let connection

  try {
    console.log('🧪 헬스장 검색 성능 테스트 시작...')

    // 데이터베이스 연결
    connection = await createConnection({
      type: 'mysql',
      host: config.database.host,
      port: config.database.port,
      username: config.database.username,
      password: config.database.password,
      database: config.database.database,
      synchronize: false,
      logging: false, // 성능 테스트 중 로깅 비활성화
      entities: [Gym],
    })

    console.log('📦 데이터베이스 연결 성공')

    // 테스트 데이터 준비
    const testLocations = [
      { lat: 37.5665, lng: 126.978, name: '서울시청' },
      { lat: 37.5172, lng: 127.0473, name: '강남역' },
      { lat: 37.5512, lng: 126.9882, name: '홍대입구역' },
      { lat: 37.5133, lng: 127.1028, name: '잠실역' },
      { lat: 37.5663, lng: 126.9779, name: '명동' },
    ]

    const testQueries = ['헬스', '피트니스', '짐', '강남', '홍대', '잠실']

    // 1. 위치 기반 검색 성능 테스트
    console.log('\n📍 위치 기반 검색 성능 테스트')
    console.log('='.repeat(50))

    for (const location of testLocations) {
      const times: number[] = []

      // 5회 반복 테스트
      for (let i = 0; i < 5; i++) {
        const startTime = Date.now()
        await optimizedGymSearchService.getNearbyGyms(
          location.lat,
          location.lng,
          5,
          20
        )
        const endTime = Date.now()
        times.push(endTime - startTime)
      }

      const avgTime = times.reduce((a, b) => a + b, 0) / times.length
      const minTime = Math.min(...times)
      const maxTime = Math.max(...times)

      console.log(
        `${location.name}: 평균 ${avgTime.toFixed(2)}ms (최소: ${minTime}ms, 최대: ${maxTime}ms)`
      )
    }

    // 2. 텍스트 검색 성능 테스트
    console.log('\n🔍 텍스트 검색 성능 테스트')
    console.log('='.repeat(50))

    for (const query of testQueries) {
      const times: number[] = []

      // 5회 반복 테스트
      for (let i = 0; i < 5; i++) {
        const startTime = Date.now()
        await optimizedGymSearchService.searchGyms({ name: query, limit: 50 })
        const endTime = Date.now()
        times.push(endTime - startTime)
      }

      const avgTime = times.reduce((a, b) => a + b, 0) / times.length
      const minTime = Math.min(...times)
      const maxTime = Math.max(...times)

      console.log(
        `"${query}": 평균 ${avgTime.toFixed(2)}ms (최소: ${minTime}ms, 최대: ${maxTime}ms)`
      )
    }

    // 3. 복합 검색 성능 테스트
    console.log('\n🔗 복합 검색 성능 테스트')
    console.log('='.repeat(50))

    const complexTests = [
      {
        name: '위치 + 헬스장명',
        params: {
          latitude: 37.5665,
          longitude: 126.978,
          name: '헬스',
          radius: 10,
          limit: 30,
        },
      },
      {
        name: '위치 + 시설 필터',
        params: {
          latitude: 37.5172,
          longitude: 127.0473,
          hasPT: true,
          is24Hours: true,
          radius: 5,
          limit: 20,
        },
      },
      {
        name: '지역 + 시설 필터',
        params: {
          address: '강남구',
          hasParking: true,
          hasShower: true,
          limit: 40,
        },
      },
    ]

    for (const test of complexTests) {
      const times: number[] = []

      // 5회 반복 테스트
      for (let i = 0; i < 5; i++) {
        const startTime = Date.now()
        await optimizedGymSearchService.searchGyms(test.params)
        const endTime = Date.now()
        times.push(endTime - startTime)
      }

      const avgTime = times.reduce((a, b) => a + b, 0) / times.length
      const minTime = Math.min(...times)
      const maxTime = Math.max(...times)

      console.log(
        `${test.name}: 평균 ${avgTime.toFixed(2)}ms (최소: ${minTime}ms, 최대: ${maxTime}ms)`
      )
    }

    // 4. 자동완성 성능 테스트
    console.log('\n💡 자동완성 성능 테스트')
    console.log('='.repeat(50))

    const autoCompleteTests = ['헬', '피트', '강남', '홍대', '잠실']

    for (const query of autoCompleteTests) {
      const times: number[] = []

      // 5회 반복 테스트
      for (let i = 0; i < 5; i++) {
        const startTime = Date.now()
        await optimizedGymSearchService.searchGymNames(query, 10)
        const endTime = Date.now()
        times.push(endTime - startTime)
      }

      const avgTime = times.reduce((a, b) => a + b, 0) / times.length
      const minTime = Math.min(...times)
      const maxTime = Math.max(...times)

      console.log(
        `"${query}": 평균 ${avgTime.toFixed(2)}ms (최소: ${minTime}ms, 최대: ${maxTime}ms)`
      )
    }

    // 5. 통계 조회 성능 테스트
    console.log('\n📊 통계 조회 성능 테스트')
    console.log('='.repeat(50))

    const statsTests = [
      {
        name: '지역별 통계',
        fn: () => optimizedGymSearchService.getGymStatsByRegion(),
      },
      {
        name: '시설별 통계',
        fn: () => optimizedGymSearchService.getGymStatsByFacilities(),
      },
    ]

    for (const test of statsTests) {
      const times: number[] = []

      // 3회 반복 테스트 (통계는 무거운 쿼리)
      for (let i = 0; i < 3; i++) {
        const startTime = Date.now()
        await test.fn()
        const endTime = Date.now()
        times.push(endTime - startTime)
      }

      const avgTime = times.reduce((a, b) => a + b, 0) / times.length
      const minTime = Math.min(...times)
      const maxTime = Math.max(...times)

      console.log(
        `${test.name}: 평균 ${avgTime.toFixed(2)}ms (최소: ${minTime}ms, 최대: ${maxTime}ms)`
      )
    }

    // 6. 동시 요청 성능 테스트
    console.log('\n⚡ 동시 요청 성능 테스트')
    console.log('='.repeat(50))

    const concurrentTests = [
      { name: '10개 동시 요청', count: 10 },
      { name: '20개 동시 요청', count: 20 },
      { name: '50개 동시 요청', count: 50 },
    ]

    for (const test of concurrentTests) {
      const startTime = Date.now()

      const promises = Array(test.count)
        .fill(null)
        .map(async (_, index) => {
          const location = testLocations[index % testLocations.length]
          return optimizedGymSearchService.getNearbyGyms(
            location.lat,
            location.lng,
            5,
            10
          )
        })

      await Promise.all(promises)
      const endTime = Date.now()
      const totalTime = endTime - startTime
      const avgTimePerRequest = totalTime / test.count

      console.log(
        `${test.name}: 총 ${totalTime}ms, 요청당 평균 ${avgTimePerRequest.toFixed(2)}ms`
      )
    }

    console.log('\n✅ 성능 테스트 완료!')
    console.log('\n📈 성능 개선 권장사항:')
    console.log('   1. 자주 사용되는 검색어는 캐싱 고려')
    console.log('   2. 대량 동시 요청 시 Connection Pool 크기 조정')
    console.log('   3. 복잡한 통계 쿼리는 별도 테이블로 미리 계산')
    console.log('   4. CDN을 통한 정적 데이터 캐싱')
  } catch (error) {
    console.error('❌ 성능 테스트 실패:', error)
    throw error
  } finally {
    if (connection) {
      await connection.close()
      console.log('📦 데이터베이스 연결 종료')
    }
  }
}

// 스크립트 실행
if (require.main === module) {
  performanceTest()
    .then(() => {
      console.log('🎉 성능 테스트가 성공적으로 완료되었습니다!')
      process.exit(0)
    })
    .catch(error => {
      console.error('💥 성능 테스트 실패:', error)
      process.exit(1)
    })
}

export { performanceTest }
