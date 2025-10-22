"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const databaseConfig_1 = require('config/databaseConfig');
const logger_1 = require('utils/logger');
async function migrateUserTable() {
    logger_1.logger.info("User 테이블 마이그레이션 시작...");
    try {
        await databaseConfig_1.AppDataSource.query(`
      CREATE TABLE IF NOT EXISTS users_backup AS 
      SELECT * FROM users
    `);
        logger_1.logger.info("User 테이블 백업 완료");
        await databaseConfig_1.AppDataSource.query(`
      ALTER TABLE users 
      MODIFY COLUMN role ENUM('user', 'admin', 'moderator') DEFAULT 'user'
    `);
        logger_1.logger.info("User role enum 업데이트 완료");
        await databaseConfig_1.AppDataSource.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS name VARCHAR(100) NULL,
      ADD COLUMN IF NOT EXISTS username VARCHAR(100) NULL
    `);
        logger_1.logger.info("계정 복구 필드 추가 완료");
        await databaseConfig_1.AppDataSource.query(`
      UPDATE users 
      SET name = nickname, username = email 
      WHERE name IS NULL OR username IS NULL
    `);
        logger_1.logger.info("기존 사용자 데이터 업데이트 완료");
        logger_1.logger.info("User 테이블 마이그레이션 완료");
    }
    catch (error) {
        logger_1.logger.error("User 테이블 마이그레이션 실패:", error);
        throw error;
    }
}
async function main() {
    logger_1.logger.info("User 테이블 마이그레이션 시작...");
    try {
        await databaseConfig_1.AppDataSource.initialize();
        logger_1.logger.info("데이터베이스 연결 성공");
        await migrateUserTable();
        logger_1.logger.info("User 테이블 마이그레이션 완료!");
        await databaseConfig_1.AppDataSource.destroy();
        logger_1.logger.info("데이터베이스 연결 종료");
    }
    catch (error) {
        logger_1.logger.error("마이그레이션 실패:", error);
        process.exit(1);
    }
}
if (require.main === module) {
    main();
}
