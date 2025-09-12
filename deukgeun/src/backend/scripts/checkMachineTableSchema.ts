import { AppDataSource } from '../config/database'
import { logger } from '../utils/logger'

/**
 * machines 테이블의 스키마를 확인하는 스크립트
 */
async function checkMachineTableSchema() {
  logger.info('🔍 Checking machines table schema...')

  try {
    // 데이터베이스 연결 확인
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize()
      logger.info('✅ Database connection established')
    }

    // machines 테이블 구조 확인
    const result = await AppDataSource.query('DESCRIBE machines')

    logger.info('📋 Current machines table structure:')
    console.log('\nColumn Name | Type | Null | Key | Default | Extra')
    console.log('----------------------------------------------------')

    result.forEach((column: any) => {
      console.log(
        `${column.Field} | ${column.Type} | ${column.Null} | ${column.Key} | ${column.Default} | ${column.Extra}`
      )
    })

    // 필요한 컬럼들이 있는지 확인
    const requiredColumns = ['anatomy', 'guide', 'training', 'extraInfo']
    const existingColumns = result.map((col: any) => col.Field)

    logger.info('\n🔍 Checking for required columns:')
    requiredColumns.forEach(column => {
      if (existingColumns.includes(column)) {
        logger.info(`✅ ${column} column exists`)
      } else {
        logger.info(`❌ ${column} column missing`)
      }
    })
  } catch (error) {
    logger.error('💥 Error checking table schema:', error)
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
  checkMachineTableSchema().catch(error => {
    console.error('💥 Unhandled error:', error)
    process.exit(1)
  })
}

export { checkMachineTableSchema }
