import { AppDataSource } from "../config/database"
import { logger } from "../utils/logger"

/**
 * Machine 테이블만 마이그레이션하는 스크립트
 */

async function migrateMachineTable() {
  logger.info("Machine 테이블 마이그레이션 시작...")

  try {
    // 기존 테이블 백업
    await AppDataSource.query(`
      CREATE TABLE IF NOT EXISTS machines_backup AS 
      SELECT * FROM machines
    `)
    logger.info("Machine 테이블 백업 완료")

    // Machine 테이블 스키마 업데이트
    await AppDataSource.query(`
      ALTER TABLE machines 
      CHANGE COLUMN machine_key machineKey VARCHAR(100) NOT NULL,
      CHANGE COLUMN name_ko name VARCHAR(100) NOT NULL,
      CHANGE COLUMN name_en nameEn VARCHAR(100) NULL,
      CHANGE COLUMN image_url imageUrl VARCHAR(255) NOT NULL,
      CHANGE COLUMN short_desc shortDesc VARCHAR(255) NOT NULL,
      CHANGE COLUMN detail_desc detailDesc TEXT NOT NULL,
      CHANGE COLUMN positive_effect positiveEffect TEXT NULL,
      CHANGE COLUMN target_muscle targetMuscles JSON NULL,
      CHANGE COLUMN difficulty_level difficulty ENUM('beginner', 'intermediate', 'advanced', 'expert') DEFAULT 'beginner',
      CHANGE COLUMN video_url videoUrl VARCHAR(255) NULL,
      ADD COLUMN isActive BOOLEAN DEFAULT TRUE,
      CHANGE COLUMN created_at createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CHANGE COLUMN updated_at updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    `)
    logger.info("Machine 테이블 스키마 업데이트 완료")

    // 카테고리 값 변환
    await AppDataSource.query(`
      UPDATE machines 
      SET category = CASE 
        WHEN category = '상체' THEN 'strength'
        WHEN category = '하체' THEN 'strength'
        WHEN category = '전신' THEN 'functional'
        WHEN category = '기타' THEN 'strength'
        ELSE 'strength'
      END
    `)
    logger.info("Machine 카테고리 값 변환 완료")

    // 난이도 값 변환
    await AppDataSource.query(`
      UPDATE machines 
      SET difficulty = CASE 
        WHEN difficulty = '초급' THEN 'beginner'
        WHEN difficulty = '중급' THEN 'intermediate'
        WHEN difficulty = '고급' THEN 'advanced'
        ELSE 'beginner'
      END
    `)
    logger.info("Machine 난이도 값 변환 완료")

    logger.info("Machine 테이블 마이그레이션 완료!")
  } catch (error) {
    logger.error("Machine 테이블 마이그레이션 실패:", error)
    throw error
  }
}

async function main() {
  logger.info("Machine 테이블 마이그레이션 시작...")

  try {
    // 데이터베이스 연결
    await AppDataSource.initialize()
    logger.info("데이터베이스 연결 성공")

    // Machine 테이블 마이그레이션 실행
    await migrateMachineTable()

    logger.info("Machine 테이블 마이그레이션 완료!")

    // 연결 종료
    await AppDataSource.destroy()
    logger.info("데이터베이스 연결 종료")
  } catch (error) {
    logger.error("마이그레이션 실패:", error)
    process.exit(1)
  }
}

// 스크립트 실행
if (require.main === module) {
  main()
}

export { main as migrateMachineOnly }
