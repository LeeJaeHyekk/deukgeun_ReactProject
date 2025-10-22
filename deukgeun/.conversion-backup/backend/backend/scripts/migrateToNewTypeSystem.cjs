"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.migrateToNewTypeSystem = main;
const databaseConfig_1 = require('config/databaseConfig');
const logger_1 = require('utils/logger');
async function migrateMachineTable() {
    logger_1.logger.info("Machine 테이블 마이그레이션 시작...");
    try {
        await databaseConfig_1.AppDataSource.query(`
      CREATE TABLE IF NOT EXISTS machines_backup AS 
      SELECT * FROM machines
    `);
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
        await databaseConfig_1.AppDataSource.query(`
      UPDATE machines 
      SET difficulty = CASE 
        WHEN difficulty = '초급' THEN 'beginner'
        WHEN difficulty = '중급' THEN 'intermediate'
        WHEN difficulty = '고급' THEN 'advanced'
        ELSE 'beginner'
      END
    `);
        logger_1.logger.info("Machine 테이블 마이그레이션 완료");
    }
    catch (error) {
        logger_1.logger.error("Machine 테이블 마이그레이션 실패:", error);
        throw error;
    }
}
async function migrateWorkoutGoalTable() {
    logger_1.logger.info("WorkoutGoal 테이블 마이그레이션 시작...");
    try {
        await databaseConfig_1.AppDataSource.query(`
      CREATE TABLE IF NOT EXISTS workout_goals_backup AS 
      SELECT * FROM workout_goals
    `);
        const foreignKeys = await databaseConfig_1.AppDataSource.query(`
      SELECT CONSTRAINT_NAME 
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
      WHERE TABLE_SCHEMA = 'deukgeun_db' 
      AND TABLE_NAME = 'workout_goals' 
      AND REFERENCED_TABLE_NAME IS NOT NULL
    `);
        for (const fk of foreignKeys) {
            try {
                await databaseConfig_1.AppDataSource.query(`
          ALTER TABLE workout_goals 
          DROP FOREIGN KEY ${fk.CONSTRAINT_NAME}
        `);
                logger_1.logger.info(`외래 키 제약 조건 제거: ${fk.CONSTRAINT_NAME}`);
            }
            catch (error) {
                logger_1.logger.warn(`외래 키 제약 조건 제거 실패: ${fk.CONSTRAINT_NAME}`, error);
            }
        }
        try {
            await databaseConfig_1.AppDataSource.query(`
        DROP INDEX IDX_cad21d3812cb9a2b845092ee38 ON workout_goals
      `);
            logger_1.logger.info("인덱스 제거 완료");
        }
        catch (error) {
            logger_1.logger.warn("인덱스 제거 실패, 계속 진행:", error);
        }
        await databaseConfig_1.AppDataSource.query(`
      ALTER TABLE workout_goals 
      CHANGE COLUMN goal_id id INT AUTO_INCREMENT PRIMARY KEY,
      CHANGE COLUMN user_id userId INT NOT NULL,
      ADD COLUMN title VARCHAR(255) NOT NULL DEFAULT '운동 목표',
      ADD COLUMN description TEXT NULL,
      CHANGE COLUMN goal_type type ENUM('weight', 'reps', 'duration', 'frequency', 'streak') NOT NULL,
      CHANGE COLUMN target_value targetValue DECIMAL(10,2) NOT NULL,
      CHANGE COLUMN current_value currentValue DECIMAL(10,2) DEFAULT 0,
      CHANGE COLUMN target_date deadline DATE NULL,
      DROP COLUMN start_date,
      DROP COLUMN status,
      DROP COLUMN progress_percentage,
      ADD COLUMN isCompleted BOOLEAN DEFAULT FALSE,
      ADD COLUMN completedAt DATETIME NULL,
      CHANGE COLUMN created_at createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CHANGE COLUMN updated_at updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    `);
        await databaseConfig_1.AppDataSource.query(`
      UPDATE workout_goals 
      SET type = CASE 
        WHEN type = 'weight_lift' THEN 'weight'
        WHEN type = 'endurance' THEN 'duration'
        WHEN type = 'weight_loss' THEN 'weight'
        WHEN type = 'muscle_gain' THEN 'weight'
        WHEN type = 'strength' THEN 'weight'
        WHEN type = 'flexibility' THEN 'duration'
        ELSE 'weight'
      END
    `);
        await databaseConfig_1.AppDataSource.query(`
      UPDATE workout_goals 
      SET isCompleted = TRUE, completedAt = updatedAt
      WHERE progress_percentage >= 100
    `);
        await databaseConfig_1.AppDataSource.query(`
      ALTER TABLE workout_goals 
      ADD CONSTRAINT FK_workout_goals_user 
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    `);
        logger_1.logger.info("WorkoutGoal 테이블 마이그레이션 완료");
    }
    catch (error) {
        logger_1.logger.error("WorkoutGoal 테이블 마이그레이션 실패:", error);
        throw error;
    }
}
async function migrateUserTable() {
    logger_1.logger.info("User 테이블 마이그레이션 시작...");
    try {
        await databaseConfig_1.AppDataSource.query(`
      CREATE TABLE IF NOT EXISTS users_backup AS 
      SELECT * FROM users
    `);
        await databaseConfig_1.AppDataSource.query(`
      ALTER TABLE users 
      CHANGE COLUMN created_at createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CHANGE COLUMN updated_at updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    `);
        logger_1.logger.info("User 테이블 마이그레이션 완료");
    }
    catch (error) {
        logger_1.logger.error("User 테이블 마이그레이션 실패:", error);
        throw error;
    }
}
async function migrateWorkoutPlanTable() {
    logger_1.logger.info("WorkoutPlan 테이블 마이그레이션 시작...");
    try {
        await databaseConfig_1.AppDataSource.query(`
      CREATE TABLE IF NOT EXISTS workout_plans_backup AS 
      SELECT * FROM workout_plans
    `);
        await databaseConfig_1.AppDataSource.query(`
      ALTER TABLE workout_plans 
      CHANGE COLUMN plan_id id INT AUTO_INCREMENT PRIMARY KEY,
      CHANGE COLUMN user_id userId INT NOT NULL,
      CHANGE COLUMN plan_name name VARCHAR(255) NOT NULL,
      CHANGE COLUMN created_at createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CHANGE COLUMN updated_at updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    `);
        logger_1.logger.info("WorkoutPlan 테이블 마이그레이션 완료");
    }
    catch (error) {
        logger_1.logger.error("WorkoutPlan 테이블 마이그레이션 실패:", error);
        throw error;
    }
}
async function migrateWorkoutSessionTable() {
    logger_1.logger.info("WorkoutSession 테이블 마이그레이션 시작...");
    try {
        await databaseConfig_1.AppDataSource.query(`
      CREATE TABLE IF NOT EXISTS workout_sessions_backup AS 
      SELECT * FROM workout_sessions
    `);
        await databaseConfig_1.AppDataSource.query(`
      ALTER TABLE workout_sessions 
      CHANGE COLUMN session_id id INT AUTO_INCREMENT PRIMARY KEY,
      CHANGE COLUMN user_id userId INT NOT NULL,
      CHANGE COLUMN plan_id planId INT NULL,
      CHANGE COLUMN session_name name VARCHAR(255) NOT NULL,
      CHANGE COLUMN start_time startTime DATETIME NOT NULL,
      CHANGE COLUMN end_time endTime DATETIME NULL,
      CHANGE COLUMN total_duration_minutes duration INT NULL,
      CHANGE COLUMN created_at createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CHANGE COLUMN updated_at updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    `);
        logger_1.logger.info("WorkoutSession 테이블 마이그레이션 완료");
    }
    catch (error) {
        logger_1.logger.error("WorkoutSession 테이블 마이그레이션 실패:", error);
        throw error;
    }
}
async function main() {
    logger_1.logger.info("타입 시스템 마이그레이션 시작...");
    try {
        await databaseConfig_1.AppDataSource.initialize();
        logger_1.logger.info("데이터베이스 연결 성공");
        await migrateUserTable();
        await migrateMachineTable();
        await migrateWorkoutPlanTable();
        await migrateWorkoutSessionTable();
        await migrateWorkoutGoalTable();
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
