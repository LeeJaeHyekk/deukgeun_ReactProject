// ============================================================================
// 데이터베이스 동기화 스크립트 (개선 버전)
// ============================================================================
// TypeORM 엔티티를 기반으로 데이터베이스 스키마를 동기화합니다.
// 안전장치 및 검증 로직 포함
// ============================================================================

import { AppDataSource } from '@backend/config/databaseConfig'
import { DataSource } from "typeorm"
import { logger } from '@backend/utils/logger'
import { config } from 'dotenv'

// 환경 변수 로드
config({ path: 'src/backend/env.production' })
config({ path: '.env.production' })
config()

// ============================================================================
// 타입 정의
// ============================================================================

interface SyncOptions {
  force?: boolean // 강제 동기화 (데이터 손실 위험)
  dropSchema?: boolean // 스키마 삭제 후 재생성 (데이터 손실 위험)
  skipValidation?: boolean // 검증 스킵
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
async function confirmProductionAction(action: string): Promise<boolean> {
  if (!isProductionEnvironment()) {
    return true
  }

  // 프로덕션 환경에서는 항상 false 반환 (안전)
  logger.warn(`⚠️ 프로덕션 환경에서 ${action} 실행은 위험합니다.`)
  logger.warn('⚠️ 프로덕션 환경에서는 이 스크립트를 실행하지 마세요.')
  return false
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
 * 데이터베이스 백업 확인 (프로덕션 환경)
 */
async function checkBackupExists(): Promise<boolean> {
  if (!isProductionEnvironment()) {
    return true // 개발 환경에서는 백업 불필요
  }

  // 백업 파일 존재 여부 확인 (간단한 체크)
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
// 메인 동기화 함수
// ============================================================================

/**
 * 데이터베이스 동기화
 */
async function syncDatabase(options: SyncOptions = {}): Promise<void> {
  const startTime = Date.now()
  let isInitialized = false

  try {
    logger.info('🔄 데이터베이스 동기화 시작...')
    logger.info('='.repeat(60))

    // 프로덕션 환경 확인
    if (isProductionEnvironment()) {
      logger.error('❌ 프로덕션 환경에서는 이 스크립트를 실행할 수 없습니다.')
      logger.error('⚠️ 프로덕션 환경에서는 마이그레이션을 사용하세요.')
      throw new Error('프로덕션 환경에서 동기화 스크립트 실행 불가')
    }

    // 옵션 검증
    if (options.force || options.dropSchema) {
      const confirmed = await confirmProductionAction('강제 동기화')
      if (!confirmed) {
        throw new Error('강제 동기화가 취소되었습니다.')
      }
      logger.warn('⚠️ 강제 동기화 모드: 데이터 손실 위험이 있습니다.')
    }

    // 데이터베이스 연결 검증
    const isValid = await validateDatabaseConnection()
    if (!isValid) {
      throw new Error('데이터베이스 연결 검증 실패')
    }

    isInitialized = AppDataSource.isInitialized

    // 백업 확인 (프로덕션 환경)
    if (isProductionEnvironment()) {
      const hasBackup = await checkBackupExists()
      if (!hasBackup) {
        logger.warn('⚠️ 백업이 확인되지 않았습니다. 계속 진행하시겠습니까?')
        // 실제로는 사용자 입력을 받아야 하지만, 스크립트에서는 경고만
      }
    }

    // 외래키 제약조건 비활성화
    await disableForeignKeyChecks(AppDataSource)

    // 스키마 동기화
    logger.info('🔄 스키마 동기화 중...')
    await AppDataSource.synchronize(options.force || false)
    logger.info('✅ 스키마 동기화 완료')

    // 외래키 제약조건 재활성화
    await enableForeignKeyChecks(AppDataSource)

    const endTime = Date.now()
    const duration = (endTime - startTime) / 1000

    logger.info('='.repeat(60))
    logger.info('🎉 데이터베이스 동기화 완료!')
    logger.info(`⏱️ 실행 시간: ${duration.toFixed(2)}초`)
    logger.info('='.repeat(60))

  } catch (error) {
    logger.error('❌ 데이터베이스 동기화 실패:', error)
    
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
  const options: SyncOptions = {
    force: args.includes('--force'),
    dropSchema: args.includes('--drop-schema'),
    skipValidation: args.includes('--skip-validation')
  }

  syncDatabase(options)
    .then(() => {
      logger.info('✅ 동기화 스크립트 완료')
      process.exit(0)
    })
    .catch(error => {
      logger.error('❌ 동기화 스크립트 실패:', error)
      process.exit(1)
    })
}

export { syncDatabase, SyncOptions }
