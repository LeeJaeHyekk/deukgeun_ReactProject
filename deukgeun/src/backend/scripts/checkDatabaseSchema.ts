// ============================================================================
// 데이터베이스 스키마 확인 스크립트 (개선 버전)
// ============================================================================
// 현재 데이터베이스 스키마를 확인하고 엔티티와 비교합니다.
// 안전장치 및 검증 로직 포함
// ============================================================================

import { AppDataSource } from '@backend/config/databaseConfig'
import { logger } from '@backend/utils/logger'
import { config } from 'dotenv'

// 환경 변수 로드
config({ path: 'src/backend/env.production' })
config({ path: '.env.production' })
config()

// ============================================================================
// 타입 정의
// ============================================================================

interface TableInfo {
  name: string
  columns: ColumnInfo[]
  rowCount?: number
  size?: string
}

interface ColumnInfo {
  name: string
  type: string
  nullable: boolean
  default: string | null
  key: string
  extra: string
}

// ============================================================================
// 안전장치 함수
// ============================================================================

/**
 * 데이터베이스 연결 검증
 */
async function validateDatabaseConnection(): Promise<boolean> {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize()
    }

    // 간단한 쿼리로 연결 확인
    await AppDataSource.query('SELECT 1 as health_check')
    logger.info('✅ 데이터베이스 연결 검증 성공')
    return true
  } catch (error) {
    logger.error('❌ 데이터베이스 연결 검증 실패:', error)
    return false
  }
}

// ============================================================================
// 스키마 확인 함수
// ============================================================================

/**
 * 모든 테이블 목록 가져오기
 */
async function getAllTables(): Promise<string[]> {
  try {
    const result = await AppDataSource.query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = DATABASE()
      ORDER BY TABLE_NAME
    `)
    
    if (Array.isArray(result)) {
      return result.map((row: any) => row.TABLE_NAME || row.table_name)
    }
    
    return []
  } catch (error) {
    logger.error('❌ 테이블 목록 조회 실패:', error)
    return []
  }
}

/**
 * 테이블 정보 가져오기
 */
async function getTableInfo(tableName: string): Promise<TableInfo | null> {
  try {
    // 컬럼 정보 조회
    const columns = await AppDataSource.query(`DESCRIBE \`${tableName}\``)
    
    if (!Array.isArray(columns)) {
      return null
    }

    const columnInfo: ColumnInfo[] = columns.map((col: any) => ({
      name: col.Field || col.field,
      type: col.Type || col.type,
      nullable: (col.Null || col.null) === 'YES',
      default: col.Default || col.default || null,
      key: col.Key || col.key || '',
      extra: col.Extra || col.extra || ''
    }))

    // 행 수 조회
    let rowCount: number | undefined
    try {
      const [countResult] = await AppDataSource.query(`SELECT COUNT(*) as count FROM \`${tableName}\``)
      if (countResult && typeof countResult === 'object' && 'count' in countResult) {
        rowCount = Number(countResult.count)
      }
    } catch (error) {
      logger.warn(`⚠️ ${tableName} 테이블 행 수 조회 실패:`, error)
    }

    // 테이블 크기 조회
    let size: string | undefined
    try {
      const [sizeResult] = await AppDataSource.query(`
        SELECT 
          ROUND(((data_length + index_length) / 1024 / 1024), 2) AS size_mb
        FROM information_schema.TABLES 
        WHERE table_schema = DATABASE()
        AND table_name = ?
      `, [tableName])
      
      if (Array.isArray(sizeResult) && sizeResult.length > 0) {
        const sizeData = sizeResult[0] as any
        size = `${sizeData.size_mb || 0} MB`
      }
    } catch (error) {
      logger.warn(`⚠️ ${tableName} 테이블 크기 조회 실패:`, error)
    }

    return {
      name: tableName,
      columns: columnInfo,
      rowCount,
      size
    }
  } catch (error) {
    logger.error(`❌ ${tableName} 테이블 정보 조회 실패:`, error)
    return null
  }
}

/**
 * 주요 테이블 목록
 */
const IMPORTANT_TABLES = [
  'users',
  'machines',
  'gym',
  'user_levels',
  'posts',
  'comments',
  'workout_plans',
  'workout_sessions',
  'workout_goals',
  'homepage_configs'
]

/**
 * 데이터베이스 스키마 확인
 */
async function checkDatabaseSchema(): Promise<void> {
  let isInitialized = false

  try {
    logger.info('🔄 데이터베이스 스키마 확인 시작...')
    logger.info('='.repeat(60))

    // 데이터베이스 연결 검증
    const isValid = await validateDatabaseConnection()
    if (!isValid) {
      throw new Error('데이터베이스 연결 검증 실패')
    }

    isInitialized = AppDataSource.isInitialized

    // 모든 테이블 목록 확인
    logger.info('📋 모든 테이블 목록 조회 중...')
    const allTables = await getAllTables()
    logger.info(`✅ 총 ${allTables.length}개 테이블 발견`)

    if (allTables.length === 0) {
      logger.warn('⚠️ 데이터베이스에 테이블이 없습니다.')
      logger.warn('💡 데이터베이스 동기화를 실행하세요: npm run db:sync')
      return
    }

    // 주요 테이블 확인
    logger.info('\n📋 주요 테이블 확인 중...')
    const missingTables: string[] = []
    const existingTables: string[] = []

    for (const tableName of IMPORTANT_TABLES) {
      if (allTables.includes(tableName)) {
        existingTables.push(tableName)
        logger.info(`✅ ${tableName} 테이블 존재`)
      } else {
        missingTables.push(tableName)
        logger.warn(`⚠️ ${tableName} 테이블이 존재하지 않습니다`)
      }
    }

    if (missingTables.length > 0) {
      logger.warn(`\n⚠️ ${missingTables.length}개 주요 테이블이 누락되었습니다:`)
      missingTables.forEach(table => logger.warn(`   - ${table}`))
      logger.warn('💡 데이터베이스 동기화를 실행하세요: npm run db:sync')
    }

    // 주요 테이블 상세 정보 출력
    logger.info('\n📊 주요 테이블 상세 정보:')
    logger.info('='.repeat(60))

    for (const tableName of existingTables.slice(0, 10)) { // 최대 10개만 출력
      const tableInfo = await getTableInfo(tableName)
      
      if (tableInfo) {
        logger.info(`\n📋 테이블: ${tableInfo.name}`)
        logger.info(`   - 컬럼 수: ${tableInfo.columns.length}개`)
        if (tableInfo.rowCount !== undefined) {
          logger.info(`   - 행 수: ${tableInfo.rowCount.toLocaleString()}개`)
        }
        if (tableInfo.size) {
          logger.info(`   - 크기: ${tableInfo.size}`)
        }
        
        // 주요 컬럼 정보 출력 (최대 5개)
        logger.info(`   - 주요 컬럼:`)
        tableInfo.columns.slice(0, 5).forEach(col => {
          const nullable = col.nullable ? 'NULL' : 'NOT NULL'
          const key = col.key ? ` [${col.key}]` : ''
          logger.info(`     • ${col.name}: ${col.type} ${nullable}${key}`)
        })
        
        if (tableInfo.columns.length > 5) {
          logger.info(`     ... 외 ${tableInfo.columns.length - 5}개 컬럼`)
        }
      }
    }

    // 데이터베이스 통계
    logger.info('\n📊 데이터베이스 통계:')
    logger.info('='.repeat(60))
    logger.info(`   - 총 테이블 수: ${allTables.length}개`)
    logger.info(`   - 주요 테이블 존재: ${existingTables.length}/${IMPORTANT_TABLES.length}개`)
    logger.info(`   - 누락된 테이블: ${missingTables.length}개`)

    logger.info('\n✅ 데이터베이스 스키마 확인 완료!')

  } catch (error) {
    logger.error('❌ 스키마 확인 실패:', error)
    throw error
  } finally {
    // 연결 종료
    if (isInitialized && AppDataSource.isInitialized) {
      try {
        await AppDataSource.destroy()
        logger.info('✅ 데이터베이스 연결 종료')
      } catch (error) {
        logger.error('❌ 데이터베이스 연결 종료 실패:', error)
      }
    }
  }
}

// ============================================================================
// 스크립트 실행
// ============================================================================

if (require.main === module) {
  checkDatabaseSchema()
    .then(() => {
      logger.info('✅ 스키마 확인 스크립트 완료')
      process.exit(0)
    })
    .catch(error => {
      logger.error('❌ 스키마 확인 스크립트 실패:', error)
      process.exit(1)
    })
}

export { checkDatabaseSchema, getAllTables, getTableInfo }
