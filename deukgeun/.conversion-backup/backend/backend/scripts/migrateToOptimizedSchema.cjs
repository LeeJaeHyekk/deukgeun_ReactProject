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
        try {
            await databaseConfig_1.AppDataSource.query(`
        ALTER TABLE users 
        ADD COLUMN name VARCHAR(100) NULL
      `);
            logger_1.logger.info("name 필드 추가 완료");
        }
        catch (error) {
            logger_1.logger.info("name 필드가 이미 존재합니다");
        }
        try {
            await databaseConfig_1.AppDataSource.query(`
        ALTER TABLE users 
        ADD COLUMN username VARCHAR(100) NULL
      `);
            logger_1.logger.info("username 필드 추가 완료");
        }
        catch (error) {
            logger_1.logger.info("username 필드가 이미 존재합니다");
        }
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
      CHANGE COLUMN created_at createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CHANGE COLUMN updated_at updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    `);
        logger_1.logger.info("Machine 테이블 스키마 업데이트 완료");
        try {
            await databaseConfig_1.AppDataSource.query(`
        ALTER TABLE machines 
        ADD COLUMN isActive BOOLEAN DEFAULT TRUE
      `);
            logger_1.logger.info("isActive 필드 추가 완료");
        }
        catch (error) {
            logger_1.logger.info("isActive 필드가 이미 존재합니다");
        }
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
        logger_1.logger.info("Machine 테이블 마이그레이션 완료");
    }
    catch (error) {
        logger_1.logger.error("Machine 테이블 마이그레이션 실패:", error);
        throw error;
    }
}
async function migrateWorkoutTables() {
    logger_1.logger.info("Workout 관련 테이블 마이그레이션 시작...");
    try {
        await databaseConfig_1.AppDataSource.query(`
      ALTER TABLE workout_goals 
      CHANGE COLUMN goal_type goalType ENUM('weight_loss', 'muscle_gain', 'endurance', 'strength', 'flexibility') NOT NULL,
      CHANGE COLUMN target_value targetValue DECIMAL(10,2) NULL,
      CHANGE COLUMN current_value currentValue DECIMAL(10,2) NULL,
      CHANGE COLUMN start_date startDate DATE NOT NULL,
      CHANGE COLUMN end_date endDate DATE NULL,
      CHANGE COLUMN created_at createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CHANGE COLUMN updated_at updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    `);
        logger_1.logger.info("WorkoutGoal 테이블 업데이트 완료");
        await databaseConfig_1.AppDataSource.query(`
      ALTER TABLE workout_sessions 
      CHANGE COLUMN session_date sessionDate DATE NOT NULL,
      CHANGE COLUMN start_time startTime TIME NULL,
      CHANGE COLUMN end_time endTime TIME NULL,
      CHANGE COLUMN total_duration totalDuration INT NULL,
      CHANGE COLUMN calories_burned caloriesBurned INT NULL,
      CHANGE COLUMN created_at createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CHANGE COLUMN updated_at updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    `);
        logger_1.logger.info("WorkoutSession 테이블 업데이트 완료");
        logger_1.logger.info("Workout 관련 테이블 마이그레이션 완료");
    }
    catch (error) {
        logger_1.logger.error("Workout 관련 테이블 마이그레이션 실패:", error);
        throw error;
    }
}
async function main() {
    logger_1.logger.info("최적화된 스키마 마이그레이션 시작...");
    try {
        await databaseConfig_1.AppDataSource.initialize();
        logger_1.logger.info("데이터베이스 연결 성공");
        await migrateUserTable();
        await migrateMachineTable();
        await migrateWorkoutTables();
        logger_1.logger.info("모든 마이그레이션 완료!");
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
