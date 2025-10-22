"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.migrateMachineOnly = main;
const databaseConfig_1 = require('config/databaseConfig');
const logger_1 = require('utils/logger');
async function migrateMachineTable() {
    logger_1.logger.info("Machine 테이블 마이그레이션 시작...");
    try {
        await databaseConfig_1.AppDataSource.query(`
      CREATE TABLE IF NOT EXISTS machines_backup AS 
      SELECT * FROM machines
    `);
        logger_1.logger.info("Machine 테이블 백업 완료");
        await databaseConfig_1.AppDataSource.query(`
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
    `);
        logger_1.logger.info("Machine 테이블 스키마 업데이트 완료");
        await databaseConfig_1.AppDataSource.query(`
      UPDATE machines 
      SET category = CASE 
        WHEN category = '상체' THEN 'strength'
        WHEN category = '하체' THEN 'strength'
        WHEN category = '전신' THEN 'functional'
        WHEN category = '기타' THEN 'strength'
        ELSE 'strength'
      END
    `);
        logger_1.logger.info("Machine 카테고리 값 변환 완료");
        await databaseConfig_1.AppDataSource.query(`
      UPDATE machines 
      SET difficulty = CASE 
        WHEN difficulty = '초급' THEN 'beginner'
        WHEN difficulty = '중급' THEN 'intermediate'
        WHEN difficulty = '고급' THEN 'advanced'
        ELSE 'beginner'
      END
    `);
        logger_1.logger.info("Machine 난이도 값 변환 완료");
        logger_1.logger.info("Machine 테이블 마이그레이션 완료!");
    }
    catch (error) {
        logger_1.logger.error("Machine 테이블 마이그레이션 실패:", error);
        throw error;
    }
}
async function main() {
    logger_1.logger.info("Machine 테이블 마이그레이션 시작...");
    try {
        await databaseConfig_1.AppDataSource.initialize();
        logger_1.logger.info("데이터베이스 연결 성공");
        await migrateMachineTable();
        logger_1.logger.info("Machine 테이블 마이그레이션 완료!");
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
