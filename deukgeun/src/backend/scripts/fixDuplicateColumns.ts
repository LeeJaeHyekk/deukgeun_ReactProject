// ============================================================================
// 중복 컬럼 수정 스크립트 (개선 버전)
// ============================================================================
// 중복된 컬럼들을 정리하는 마이그레이션 스크립트
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

interface DuplicateColumn {
  old: string
  new: string
  fk?: string
  table: string
  newFk?: string
}

// ============================================================================
// 안전장치 함수
// ============================================================================

/**
 * 프로덕션 환경 확인
 */
function isProductionEnvironment(): boolean {
  const nodeEnv = process.env.NODE_ENV || process.env.MODE || 'development'
  return nodeEnv === 'production'
}

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

/**
 * 컬럼 존재 여부 확인
 */
async function columnExists(tableName: string, columnName: string): Promise<boolean> {
  try {
    const result = await AppDataSource.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = ? 
      AND COLUMN_NAME = ?
    `, [tableName, columnName])
    
    return Array.isArray(result) && result.length > 0
  } catch (error) {
    logger.error(`❌ 컬럼 존재 여부 확인 실패 (${tableName}.${columnName}):`, error)
    return false
  }
}

/**
 * 외래키 제약조건 존재 여부 확인
 */
async function foreignKeyExists(tableName: string, constraintName: string): Promise<boolean> {
  try {
    const result = await AppDataSource.query(`
      SELECT CONSTRAINT_NAME 
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
      WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = ?
      AND CONSTRAINT_NAME = ?
    `, [tableName, constraintName])
    
    return Array.isArray(result) && result.length > 0
  } catch (error) {
    logger.error(`❌ 외래키 제약조건 존재 여부 확인 실패 (${tableName}.${constraintName}):`, error)
    return false
  }
}

// ============================================================================
// 중복 컬럼 수정 함수
// ============================================================================

/**
 * workout_goals 테이블 중복 컬럼 정리
 */
async function fixWorkoutGoalsTable(): Promise<void> {
  logger.info('🔄 workout_goals 테이블 중복 컬럼 정리 시작...')

  try {
    const tableName = 'workout_goals'
    const oldColumn = 'user_id'
    const newColumn = 'userId'
    const oldFk = 'FK_cad21d3812cb9a2b845092ee38c'
    const newFk = 'FK_workout_goals_user'

    // user_id 컬럼 존재 여부 확인
    const hasOldColumn = await columnExists(tableName, oldColumn)
    const hasNewColumn = await columnExists(tableName, newColumn)

    if (!hasOldColumn) {
      logger.info(`✅ ${tableName} 테이블에 ${oldColumn} 컬럼이 존재하지 않습니다 (이미 정리됨)`)
      return
    }

    if (!hasNewColumn) {
      logger.warn(`⚠️ ${tableName} 테이블에 ${newColumn} 컬럼이 존재하지 않습니다`)
      logger.warn(`⚠️ ${oldColumn} 컬럼을 제거할 수 없습니다 (대체 컬럼 없음)`)
      return
    }

    // 외래키 제약조건 삭제
    const hasOldFk = await foreignKeyExists(tableName, oldFk)
    if (hasOldFk) {
      try {
        await AppDataSource.query(`
          ALTER TABLE \`${tableName}\` 
          DROP FOREIGN KEY \`${oldFk}\`
        `)
        logger.info(`✅ ${tableName} 테이블 외래키 제약조건 삭제 완료: ${oldFk}`)
      } catch (error: any) {
        logger.warn(`⚠️ 외래키 제약조건 삭제 실패 (무시): ${oldFk} - ${error?.message || error}`)
      }
    } else {
      logger.info(`ℹ️ 외래키 제약조건이 존재하지 않습니다: ${oldFk}`)
    }

    // user_id 컬럼 제거
    await AppDataSource.query(`
      ALTER TABLE \`${tableName}\` 
      DROP COLUMN \`${oldColumn}\`
    `)
    logger.info(`✅ ${tableName} 테이블에서 ${oldColumn} 컬럼 제거 완료`)

    // userId 컬럼에 새로운 외래키 제약조건 추가
    const hasNewFk = await foreignKeyExists(tableName, newFk)
    if (!hasNewFk) {
      try {
        await AppDataSource.query(`
          ALTER TABLE \`${tableName}\` 
          ADD CONSTRAINT \`${newFk}\` 
          FOREIGN KEY (\`${newColumn}\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE
        `)
        logger.info(`✅ ${tableName} 테이블 새로운 외래키 제약조건 추가 완료: ${newFk}`)
      } catch (error: any) {
        logger.warn(`⚠️ 외래키 제약조건 추가 실패 (무시): ${newFk} - ${error?.message || error}`)
      }
    } else {
      logger.info(`ℹ️ 외래키 제약조건이 이미 존재합니다: ${newFk}`)
    }

    logger.info(`✅ ${tableName} 테이블 정리 완료`)
  } catch (error) {
    logger.error(`❌ ${tableName} 테이블 정리 실패:`, error)
    throw error
  }
}

/**
 * workout_sessions 테이블 중복 컬럼 정리
 */
async function fixWorkoutSessionsTable(): Promise<void> {
  logger.info('🔄 workout_sessions 테이블 중복 컬럼 정리 시작...')

  try {
    const tableName = 'workout_sessions'
    
    // 중복 컬럼들 정의
    const duplicateColumns: DuplicateColumn[] = [
      { 
        old: 'user_id', 
        new: 'userId', 
        fk: 'FK_3a1ec9260afc530837db15579a5',
        table: 'users',
        newFk: 'FK_workout_sessions_user'
      },
      { 
        old: 'plan_id', 
        new: 'planId', 
        fk: 'FK_8417906741dc09e46fad2922f48',
        table: 'workout_plans',
        newFk: 'FK_workout_sessions_plan'
      },
      { 
        old: 'gym_id', 
        new: 'gymId', 
        fk: 'FK_7045a0e0659d34923b0efe234fa',
        table: 'gym',
        newFk: 'FK_workout_sessions_gym'
      },
    ]

    for (const { old, new: newCol, fk, table: refTable, newFk } of duplicateColumns) {
      // 기존 컬럼 존재 여부 확인
      const hasOldColumn = await columnExists(tableName, old)
      const hasNewColumn = await columnExists(tableName, newCol)

      if (!hasOldColumn) {
        logger.info(`✅ ${tableName} 테이블에 ${old} 컬럼이 존재하지 않습니다 (이미 정리됨)`)
        continue
      }

      if (!hasNewColumn) {
        logger.warn(`⚠️ ${tableName} 테이블에 ${newCol} 컬럼이 존재하지 않습니다`)
        logger.warn(`⚠️ ${old} 컬럼을 제거할 수 없습니다 (대체 컬럼 없음)`)
        continue
      }

      // 외래키 제약조건 삭제
      if (fk) {
        const hasFk = await foreignKeyExists(tableName, fk)
        if (hasFk) {
          try {
            await AppDataSource.query(`
              ALTER TABLE \`${tableName}\` 
              DROP FOREIGN KEY \`${fk}\`
            `)
            logger.info(`✅ ${tableName} 테이블 외래키 제약조건 삭제 완료: ${fk}`)
          } catch (error: any) {
            logger.warn(`⚠️ 외래키 제약조건 삭제 실패 (무시): ${fk} - ${error?.message || error}`)
          }
        } else {
          logger.info(`ℹ️ 외래키 제약조건이 존재하지 않습니다: ${fk}`)
        }
      }

      // 기존 컬럼 제거
      await AppDataSource.query(`
        ALTER TABLE \`${tableName}\` 
        DROP COLUMN \`${old}\`
      `)
      logger.info(`✅ ${tableName} 테이블에서 ${old} 컬럼 제거 완료`)

      // 새로운 외래키 제약조건 추가
      if (newFk && refTable) {
        const hasNewFk = await foreignKeyExists(tableName, newFk)
        if (!hasNewFk) {
          try {
            const onDelete = old === 'user_id' ? 'CASCADE' : 'SET NULL'
            await AppDataSource.query(`
              ALTER TABLE \`${tableName}\` 
              ADD CONSTRAINT \`${newFk}\` 
              FOREIGN KEY (\`${newCol}\`) REFERENCES \`${refTable}\`(\`id\`) ON DELETE ${onDelete}
            `)
            logger.info(`✅ ${tableName} 테이블 새로운 외래키 제약조건 추가 완료: ${newFk}`)
          } catch (error: any) {
            logger.warn(`⚠️ 외래키 제약조건 추가 실패 (무시): ${newFk} - ${error?.message || error}`)
          }
        } else {
          logger.info(`ℹ️ 외래키 제약조건이 이미 존재합니다: ${newFk}`)
        }
      }
    }

    logger.info(`✅ ${tableName} 테이블 정리 완료`)
  } catch (error) {
    logger.error(`❌ ${tableName} 테이블 정리 실패:`, error)
    throw error
  }
}

// ============================================================================
// 메인 함수
// ============================================================================

/**
 * 중복 컬럼 정리 마이그레이션
 */
async function main(): Promise<void> {
  let isInitialized = false

  try {
    logger.info('🔄 중복 컬럼 정리 마이그레이션 시작...')
    logger.info('='.repeat(60))

    // 프로덕션 환경 확인
    if (isProductionEnvironment()) {
      logger.warn('⚠️ 프로덕션 환경에서 실행 중입니다.')
      logger.warn('⚠️ 이 스크립트는 데이터베이스 스키마를 변경합니다.')
      logger.warn('⚠️ 실행 전 반드시 백업을 수행하세요.')
    }

    // 데이터베이스 연결 검증
    const isValid = await validateDatabaseConnection()
    if (!isValid) {
      throw new Error('데이터베이스 연결 검증 실패')
    }

    isInitialized = AppDataSource.isInitialized

    // 중복 컬럼 정리 실행
    await fixWorkoutGoalsTable()
    await fixWorkoutSessionsTable()

    logger.info('='.repeat(60))
    logger.info('🎉 모든 중복 컬럼 정리 완료!')

  } catch (error) {
    logger.error('❌ 마이그레이션 실패:', error)
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
  main()
    .then(() => {
      logger.info('✅ 중복 컬럼 정리 스크립트 완료')
      process.exit(0)
    })
    .catch(error => {
      logger.error('❌ 중복 컬럼 정리 스크립트 실패:', error)
      process.exit(1)
    })
}

export { main as fixDuplicateColumns, fixWorkoutGoalsTable, fixWorkoutSessionsTable }
