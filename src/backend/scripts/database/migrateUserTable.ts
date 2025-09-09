import { AppDataSource } from "../../shared/database"
import { User } from "../../domains/auth/entities/User"
import { logger } from "../../shared/utils/logger"

/**
 * User 테이블 마이그레이션 스크립트
 * - role enum에 moderator 추가
 * - 계정 복구 관련 필드 추가
 * - 기존 데이터 보존
 */

async function migrateUserTable() {
  logger.info("User 테이블 마이그레이션 시작...")

  try {
    // 기존 테이블 백업
    await AppDataSource.query(`
      CREATE TABLE IF NOT EXISTS users_backup AS 
      SELECT * FROM users
    `)
    logger.info("User 테이블 백업 완료")

    // role enum에 moderator 추가
    await AppDataSource.query(`
      ALTER TABLE users 
      MODIFY COLUMN role ENUM('user', 'admin', 'moderator') DEFAULT 'user'
    `)
    logger.info("User role enum 업데이트 완료")

    // 계정 복구 관련 필드 추가
    await AppDataSource.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS name VARCHAR(100) NULL,
      ADD COLUMN IF NOT EXISTS username VARCHAR(100) NULL
    `)
    logger.info("계정 복구 필드 추가 완료")

    // 기존 사용자 데이터에 기본값 설정
    await AppDataSource.query(`
      UPDATE users 
      SET name = nickname, username = email 
      WHERE name IS NULL OR username IS NULL
    `)
    logger.info("기존 사용자 데이터 업데이트 완료")

    logger.info("User 테이블 마이그레이션 완료")
  } catch (error) {
    logger.error("User 테이블 마이그레이션 실패:", error)
    throw error
  }
}

async function main() {
  logger.info("User 테이블 마이그레이션 시작...")

  try {
    // 데이터베이스 연결
    await AppDataSource.initialize()
    logger.info("데이터베이스 연결 성공")

    // User 테이블 마이그레이션 실행
    await migrateUserTable()

    logger.info("User 테이블 마이그레이션 완료!")

    // 연결 종료
    await AppDataSource.destroy()
    logger.info("데이터베이스 연결 종료")
  } catch (error) {
    logger.error("마이그레이션 실패:", error)
    process.exit(1)
  }
}

// 스크립트 실행
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}
