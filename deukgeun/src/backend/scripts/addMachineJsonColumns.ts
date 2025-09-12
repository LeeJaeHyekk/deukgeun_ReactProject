import { AppDataSource } from '../config/database'
import { logger } from '../utils/logger'

/**
 * machines 테이블에 필요한 JSON 컬럼들을 추가하는 스크립트
 */
async function addMachineJsonColumns() {
  logger.info('🔧 Adding JSON columns to machines table...')

  try {
    // 데이터베이스 연결 확인
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize()
      logger.info('✅ Database connection established')
    }

    // 필요한 JSON 컬럼들 추가
    const columnsToAdd = [
      { name: 'anatomy', type: 'JSON NOT NULL' },
      { name: 'guide', type: 'JSON NOT NULL' },
      { name: 'training', type: 'JSON NOT NULL' },
      { name: 'extraInfo', type: 'JSON NOT NULL' },
      { name: 'isActive', type: 'BOOLEAN DEFAULT TRUE' },
    ]

    for (const column of columnsToAdd) {
      try {
        await AppDataSource.query(`
          ALTER TABLE machines 
          ADD COLUMN ${column.name} ${column.type}
        `)
        logger.info(`✅ Added column: ${column.name}`)
      } catch (error) {
        if (
          error instanceof Error &&
          error.message.includes('Duplicate column name')
        ) {
          logger.info(`ℹ️ Column ${column.name} already exists`)
        } else {
          logger.error(`❌ Failed to add column ${column.name}:`, error)
          throw error
        }
      }
    }

    // videoUrl 컬럼이 없으면 추가
    try {
      await AppDataSource.query(`
        ALTER TABLE machines 
        ADD COLUMN videoUrl VARCHAR(255) NULL
      `)
      logger.info('✅ Added column: videoUrl')
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes('Duplicate column name')
      ) {
        logger.info('ℹ️ Column videoUrl already exists')
      } else {
        logger.error('❌ Failed to add column videoUrl:', error)
        throw error
      }
    }

    // createdAt, updatedAt 컬럼이 없으면 추가
    try {
      await AppDataSource.query(`
        ALTER TABLE machines 
        ADD COLUMN createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      `)
      logger.info('✅ Added column: createdAt')
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes('Duplicate column name')
      ) {
        logger.info('ℹ️ Column createdAt already exists')
      } else {
        logger.error('❌ Failed to add column createdAt:', error)
        throw error
      }
    }

    try {
      await AppDataSource.query(`
        ALTER TABLE machines 
        ADD COLUMN updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      `)
      logger.info('✅ Added column: updatedAt')
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes('Duplicate column name')
      ) {
        logger.info('ℹ️ Column updatedAt already exists')
      } else {
        logger.error('❌ Failed to add column updatedAt:', error)
        throw error
      }
    }

    logger.info('🎉 All required columns added successfully!')

    // 최종 테이블 구조 확인
    const result = await AppDataSource.query('DESCRIBE machines')
    logger.info('📋 Updated machines table structure:')
    console.log('\nColumn Name | Type | Null | Key | Default | Extra')
    console.log('----------------------------------------------------')

    result.forEach((column: any) => {
      console.log(
        `${column.Field} | ${column.Type} | ${column.Null} | ${column.Key} | ${column.Default} | ${column.Extra}`
      )
    })
  } catch (error) {
    logger.error('💥 Error adding columns:', error)
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
  addMachineJsonColumns().catch(error => {
    console.error('💥 Unhandled error:', error)
    process.exit(1)
  })
}

export { addMachineJsonColumns }
