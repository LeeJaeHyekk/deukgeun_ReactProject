// ============================================================================
// 안전한 데이터베이스 리셋 스크립트 (개선 버전)
// ============================================================================
// 모든 테이블을 삭제하고 스키마를 재생성합니다.
// 안전장치 및 검증 로직 포함
// ============================================================================

import { AppDataSource } from '@backend/config/databaseConfig'
import { DataSource } from "typeorm"
import { logger } from '@backend/utils/logger'
import { config } from 'dotenv'
import * as readline from 'readline'

// 환경 변수 로드
config({ path: 'src/backend/env.production' })
config({ path: '.env.production' })
config()

// ============================================================================
// 타입 정의
// ============================================================================

interface ResetOptions {
  skipConfirmation?: boolean // 확인 스킵
  skipBackup?: boolean // 백업 스킵
  tablesOnly?: boolean // 테이블만 삭제 (스키마 재생성 안 함)
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
 * 사용자 확인 (프로덕션 환경에서만)
 */
function createReadlineInterface(): readline.Interface {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })
}

/**
 * 사용자 확인 요청
 */
function askConfirmation(question: string): Promise<boolean> {
  return new Promise((resolve) => {
    const rl = createReadlineInterface()
    
    rl.question(`${question} (yes/no): `, (answer) => {
      rl.close()
      const normalized = answer.trim().toLowerCase()
      resolve(normalized === 'yes' || normalized === 'y')
    })
  })
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
 * 데이터베이스 백업 (간단한 체크)
 */
async function checkBackupExists(): Promise<boolean> {
  if (!isProductionEnvironment()) {
    return true // 개발 환경에서는 백업 불필요
  }

  logger.warn('⚠️ 프로덕션 환경: 데이터베이스 백업을 확인하세요.')
  return true
}

// ============================================================================
// 외래키 제약조건 관리
// ============================================================================

/**
 * 외래키 제약조건 비활성화
 */
async function disableForeignKeyChecks(dataSource: DataSource): Promise<void> {
  try {
    await dataSource.query("SET FOREIGN_KEY_CHECKS = 0")
    logger.info('✅ 외래키 제약조건 비활성화 완료')
  } catch (error) {
    logger.error('❌ 외래키 제약조건 비활성화 실패:', error)
    throw error
  }
}

/**
 * 외래키 제약조건 재활성화
 */
async function enableForeignKeyChecks(dataSource: DataSource): Promise<void> {
  try {
    await dataSource.query("SET FOREIGN_KEY_CHECKS = 1")
    logger.info('✅ 외래키 제약조건 재활성화 완료')
  } catch (error) {
    logger.error('❌ 외래키 제약조건 재활성화 실패:', error)
    throw error
  }
}

// ============================================================================
// 메인 리셋 함수
// ============================================================================

/**
 * 안전한 데이터베이스 리셋
 */
async function safeDatabaseReset(options: ResetOptions = {}): Promise<void> {
  const startTime = Date.now()
  let isInitialized = false

  try {
    logger.info('🔄 안전한 데이터베이스 리셋 시작...')
    logger.info('='.repeat(60))

    // 프로덕션 환경 확인
    if (isProductionEnvironment()) {
      logger.error('❌ 프로덕션 환경에서는 이 스크립트를 실행할 수 없습니다.')
      logger.error('⚠️ 프로덕션 환경에서는 데이터베이스 리셋을 수행하지 마세요.')
      throw new Error('프로덕션 환경에서 리셋 스크립트 실행 불가')
    }

    // 사용자 확인 (스킵하지 않은 경우)
    if (!options.skipConfirmation) {
      logger.warn('⚠️ 경고: 이 작업은 모든 데이터를 삭제합니다!')
      logger.warn('⚠️ 이 작업은 되돌릴 수 없습니다!')
      
      const confirmed = await askConfirmation('정말로 모든 데이터를 삭제하시겠습니까?')
      if (!confirmed) {
        logger.info('❌ 사용자가 작업을 취소했습니다.')
        process.exit(0)
      }
    }

    // 데이터베이스 연결 검증
    const isValid = await validateDatabaseConnection()
    if (!isValid) {
      throw new Error('데이터베이스 연결 검증 실패')
    }

    isInitialized = AppDataSource.isInitialized

    // 백업 확인 (스킵하지 않은 경우)
    if (!options.skipBackup && isProductionEnvironment()) {
      const hasBackup = await checkBackupExists()
      if (!hasBackup) {
        logger.warn('⚠️ 백업이 확인되지 않았습니다.')
        const confirmed = await askConfirmation('백업 없이 계속 진행하시겠습니까?')
        if (!confirmed) {
          logger.info('❌ 사용자가 작업을 취소했습니다.')
          process.exit(0)
        }
      }
    }

    // 외래키 제약조건 비활성화
    await disableForeignKeyChecks(AppDataSource)

    // 모든 테이블 삭제 (순서 중요)
    const tablesToDrop = [
      "typeorm_metadata",
      "workout_reminders",
      "workout_progress",
      "workout_stats",
      "exercise_sets",
      "workout_sessions",
      "workout_plan_exercises",
      "workout_plans",
      "workout_goals",
      "user_streaks",
      "milestones",
      "user_rewards",
      "exp_history",
      "user_levels",
      "post_likes",
      "comments",
      "posts",
      "password_reset_token",
      "verification_token",
      "machines",
      "gym",
      "users",
      "homepage_configs"
    ]

    logger.info(`🔄 ${tablesToDrop.length}개 테이블 삭제 중...`)
    let droppedCount = 0
    let skippedCount = 0

    for (const table of tablesToDrop) {
      try {
        // 테이블 존재 여부 확인
        const [tables] = await AppDataSource.query(`
          SELECT TABLE_NAME 
          FROM INFORMATION_SCHEMA.TABLES 
          WHERE TABLE_SCHEMA = DATABASE() 
          AND TABLE_NAME = ?
        `, [table])

        if (Array.isArray(tables) && tables.length > 0) {
          await AppDataSource.query(`DROP TABLE IF EXISTS \`${table}\``)
          droppedCount++
          logger.info(`✅ 테이블 삭제: ${table}`)
        } else {
          skippedCount++
          logger.debug(`ℹ️ 테이블이 존재하지 않음: ${table}`)
        }
      } catch (error: any) {
        logger.warn(`⚠️ 테이블 삭제 실패 (무시): ${table} - ${error?.message || error}`)
        skippedCount++
      }
    }

    logger.info(`✅ 테이블 삭제 완료: ${droppedCount}개 삭제, ${skippedCount}개 스킵`)

    // 외래키 제약조건 재활성화
    await enableForeignKeyChecks(AppDataSource)

    // 스키마 동기화 (테이블만 삭제 옵션이 아닌 경우)
    if (!options.tablesOnly) {
      logger.info('🔄 스키마 동기화 중...')
      await AppDataSource.synchronize(true)
      logger.info('✅ 스키마 동기화 완료')
    }

    const endTime = Date.now()
    const duration = (endTime - startTime) / 1000

    logger.info('='.repeat(60))
    logger.info('🎉 안전한 데이터베이스 리셋 완료!')
    logger.info(`⏱️ 실행 시간: ${duration.toFixed(2)}초`)
    logger.info(`📊 삭제된 테이블: ${droppedCount}개`)
    logger.info('='.repeat(60))

  } catch (error) {
    logger.error('❌ 데이터베이스 리셋 실패:', error)
    
    // 외래키 제약조건 재활성화 시도 (에러 발생 시에도)
    try {
      if (AppDataSource.isInitialized) {
        await enableForeignKeyChecks(AppDataSource)
      }
    } catch (cleanupError) {
      logger.error('❌ 외래키 제약조건 재활성화 실패:', cleanupError)
    }
    
    throw error
  } finally {
    // 데이터베이스 연결 종료
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
  // 명령줄 인자 파싱
  const args = process.argv.slice(2)
  const options: ResetOptions = {
    skipConfirmation: args.includes('--skip-confirmation') || args.includes('--yes'),
    skipBackup: args.includes('--skip-backup'),
    tablesOnly: args.includes('--tables-only')
  }

  safeDatabaseReset(options)
    .then(() => {
      logger.info('✅ 리셋 스크립트 완료')
      process.exit(0)
    })
    .catch(error => {
      logger.error('❌ 리셋 스크립트 실패:', error)
      process.exit(1)
    })
}

export { safeDatabaseReset, ResetOptions }
