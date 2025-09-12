import { createConnection } from 'typeorm'
import { config } from '../config/env'
import { AddGymSearchIndexes1735000000000 } from '../migrations/AddGymSearchIndexes'

/**
 * 헬스장 검색 최적화 마이그레이션 실행 스크립트
 */
async function runGymOptimization() {
  let connection

  try {
    console.log('🚀 헬스장 검색 최적화 시작...')

    // 데이터베이스 연결
    connection = await createConnection({
      type: 'mysql',
      host: config.database.host,
      port: config.database.port,
      username: config.database.username,
      password: config.database.password,
      database: config.database.database,
      synchronize: false, // 마이그레이션을 수동으로 실행하므로 false
      logging: true,
      entities: [], // 마이그레이션만 실행하므로 엔티티 불필요
    })

    console.log('📦 데이터베이스 연결 성공')

    // 마이그레이션 실행
    const migration = new AddGymSearchIndexes1735000000000()

    console.log('🔧 인덱스 생성 중...')
    await migration.up(connection.createQueryRunner())

    console.log('✅ 헬스장 검색 최적화 완료!')
    console.log('📊 생성된 인덱스:')
    console.log('   - idx_gym_name_search (헬스장명 검색)')
    console.log('   - idx_gym_address_search (주소 검색)')
    console.log('   - idx_gym_location (위치 기반 검색)')
    console.log('   - idx_gym_24hours (24시간 운영)')
    console.log('   - idx_gym_pt (PT 가능)')
    console.log('   - idx_gym_gx (GX 가능)')
    console.log('   - idx_gym_parking (주차 가능)')
    console.log('   - idx_gym_shower (샤워 시설)')
    console.log('   - idx_gym_name_location (이름+위치 복합)')
    console.log('   - idx_gym_facilities (시설 복합)')

    // 성능 테스트 쿼리 실행
    console.log('\n🧪 성능 테스트 실행...')

    const testQueries = [
      {
        name: '위치 기반 검색 (5km 반경)',
        query: `
          SELECT COUNT(*) as count 
          FROM gym 
          WHERE (6371 * acos(cos(radians(37.5665)) * cos(radians(latitude)) * 
                 cos(radians(longitude) - radians(126.978)) + 
                 sin(radians(37.5665)) * sin(radians(latitude)))) <= 5
        `,
      },
      {
        name: '헬스장명 검색 (LIKE)',
        query: `
          SELECT COUNT(*) as count 
          FROM gym 
          WHERE name LIKE '%헬스%'
        `,
      },
      {
        name: '시설 필터링 (PT + 24시간)',
        query: `
          SELECT COUNT(*) as count 
          FROM gym 
          WHERE hasPT = 1 AND is24Hours = 1
        `,
      },
    ]

    for (const test of testQueries) {
      const startTime = Date.now()
      const result = await connection.query(test.query)
      const endTime = Date.now()

      console.log(
        `   ${test.name}: ${result[0].count}개 결과 (${endTime - startTime}ms)`
      )
    }
  } catch (error) {
    console.error('❌ 헬스장 검색 최적화 실패:', error)
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
  runGymOptimization()
    .then(() => {
      console.log('🎉 헬스장 검색 최적화가 성공적으로 완료되었습니다!')
      process.exit(0)
    })
    .catch(error => {
      console.error('💥 헬스장 검색 최적화 실패:', error)
      process.exit(1)
    })
}

export { runGymOptimization }
