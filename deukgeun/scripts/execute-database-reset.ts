// ============================================================================
// Execute Database Reset Script
// ============================================================================

import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { AppDataSource } from '../src/backend/config/databaseConfig'

// ES 모듈에서 __dirname 대체
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

console.log('🚀 데이터베이스 초기화 실행 시작...')

async function resetDatabase() {
  try {
    // 데이터베이스 연결
    console.log('📡 데이터베이스 연결 중...')
    await AppDataSource.initialize()
    console.log('✅ 데이터베이스 연결 성공!')

    // SQL 파일 읽기
    const sqlFilePath = join(__dirname, '../database_reset.sql')
    const sqlContent = readFileSync(sqlFilePath, 'utf8')
    
    console.log('📄 SQL 파일 읽기 완료')

    // SQL 문장들을 분리 (세미콜론으로 구분)
    const sqlStatements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))

    console.log(`📊 총 ${sqlStatements.length}개의 SQL 문장을 실행합니다.`)

    // 각 SQL 문장 실행
    for (let i = 0; i < sqlStatements.length; i++) {
      const statement = sqlStatements[i]
      if (statement.trim()) {
        try {
          console.log(`⏳ 실행 중... (${i + 1}/${sqlStatements.length})`)
          await AppDataSource.query(statement)
          console.log(`✅ SQL 문장 ${i + 1} 실행 완료`)
        } catch (error) {
          console.log(`⚠️ SQL 문장 ${i + 1} 실행 중 오류 (무시하고 계속):`, error.message)
        }
      }
    }

    // 결과 확인
    const result = await AppDataSource.query('SELECT COUNT(*) as count FROM machines')
    console.log(`\n🎉 데이터베이스 초기화 완료!`)
    console.log(`📊 현재 기구 수: ${result[0].count}개`)

    if (result[0].count === 28) {
      console.log('✅ 28개 기구 데이터가 성공적으로 삽입되었습니다!')
    } else {
      console.log(`⚠️ 예상과 다른 기구 수: ${result[0].count}개 (예상: 28개)`)
    }

  } catch (error) {
    console.error('❌ 데이터베이스 초기화 실패:', error)
    throw error
  } finally {
    // 데이터베이스 연결 종료
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy()
      console.log('🔌 데이터베이스 연결 종료')
    }
  }
}

// 스크립트 실행
resetDatabase()
  .then(() => {
    console.log('\n🎉 스크립트 실행 완료!')
    console.log('📋 다음 단계:')
    console.log('1. 서버 재시작: npm start')
    console.log('2. 프론트엔드에서 28개 카드 확인')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ 스크립트 실행 실패:', error)
    process.exit(1)
  })
