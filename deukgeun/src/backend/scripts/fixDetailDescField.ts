import { AppDataSource } from '../config/database'
import { logger } from '../utils/logger'

/**
 * machines 테이블의 detailDesc 필드를 nullable로 변경하는 스크립트
 */
async function fixDetailDescField() {
  logger.info('🔧 Fixing detailDesc field in machines table...')

  try {
    // 데이터베이스 연결 확인
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize()
      logger.info('✅ Database connection established')
    }

    // detailDesc 필드를 nullable로 변경
    await AppDataSource.query(`
      ALTER TABLE machines 
      MODIFY COLUMN detailDesc TEXT NULL
    `)
    logger.info('✅ detailDesc field is now nullable')

    // positiveEffect 필드도 nullable로 변경 (혹시 모를 경우를 대비)
    try {
      await AppDataSource.query(`
        ALTER TABLE machines 
        MODIFY COLUMN positiveEffect TEXT NULL
      `)
      logger.info('✅ positiveEffect field is now nullable')
    } catch (error) {
      logger.info(
        'ℹ️ positiveEffect field was already nullable or does not exist'
      )
    }

    logger.info('🎉 Field modifications completed successfully!')
  } catch (error) {
    logger.error('💥 Error fixing fields:', error)
    throw error
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy()
      logger.info('🔌 Database connection closed')
    }
  }
}

// 스크립트가 직접 실행될 때만 함수 호출
if (require.main === module) {
  fixDetailDescField().catch(error => {
    console.error('💥 Unhandled error:', error)
    process.exit(1)
  })
}

export { fixDetailDescField }
