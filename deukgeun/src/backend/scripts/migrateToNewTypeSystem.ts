import { AppDataSource } from '@backend/config/databaseConfig'
import { Machine } from '@backend/entities/Machine'
import { WorkoutGoal } from "@backend/entities/WorkoutGoal"
import { logger } from '@backend/utils/logger'

/**
 * 기존 데이터베이스 스키마를 새로운 타입 시스템에 맞게 마이그레이션하는 스크립트
 *
 * 실행 방법:
 * npm run migrate:types
 *
 * 주의사항:
 * - 실행 전 반드시 데이터베이스 백업을 수행하세요
 * - 프로덕션 환경에서는 신중하게 실행하세요
 */

async function migrateMachineTable() {
  logger.info("Machine 테이블 마이그레이션 시작...")

  try {
    // 기존 테이블 백업 (선택사항)
    await AppDataSource.query(`
      CREATE TABLE IF NOT EXISTS machines_backup AS 
      SELECT * FROM machines
    `)

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

    logger.info("Machine 테이블 마이그레이션 완료")
  } catch (error) {
    logger.error("Machine 테이블 마이그레이션 실패:", error)
    throw error
  }
}

async function migrateWorkoutGoalTable() {
  logger.info("WorkoutGoal 테이블 마이그레이션 시작...")

  try {
    // 기존 테이블 백업 (선택사항)
    await AppDataSource.query(`
      CREATE TABLE IF NOT EXISTS workout_goals_backup AS 
      SELECT * FROM workout_goals
    `)

    // 외래 키 제약 조건 확인 및 임시 제거
    const foreignKeys = await AppDataSource.query(`
      SELECT CONSTRAINT_NAME 
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
      WHERE TABLE_SCHEMA = 'deukgeun_db' 
      AND TABLE_NAME = 'workout_goals' 
      AND REFERENCED_TABLE_NAME IS NOT NULL
    `)

    // 외래 키 제약 조건 임시 제거
    for (const fk of foreignKeys) {
      try {
        await AppDataSource.query(`
          ALTER TABLE workout_goals 
          DROP FOREIGN KEY ${fk.CONSTRAINT_NAME}
        `)
        logger.info(`외래 키 제약 조건 제거: ${fk.CONSTRAINT_NAME}`)
      } catch (error) {
        logger.warn(`외래 키 제약 조건 제거 실패: ${fk.CONSTRAINT_NAME}`, error)
      }
    }

    // 인덱스 제거 시도
    try {
      await AppDataSource.query(`
        DROP INDEX IDX_cad21d3812cb9a2b845092ee38 ON workout_goals
      `)
      logger.info("인덱스 제거 완료")
    } catch (error) {
      logger.warn("인덱스 제거 실패, 계속 진행:", error)
    }

    // WorkoutGoal 테이블 스키마 업데이트
    await AppDataSource.query(`
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
    `)

    // 기존 목표 타입 변환
    await AppDataSource.query(`
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
    `)

    // 완료된 목표들 처리
    await AppDataSource.query(`
      UPDATE workout_goals 
      SET isCompleted = TRUE, completedAt = updatedAt
      WHERE progress_percentage >= 100
    `)

    // 외래 키 제약 조건 재생성
    await AppDataSource.query(`
      ALTER TABLE workout_goals 
      ADD CONSTRAINT FK_workout_goals_user 
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    `)

    logger.info("WorkoutGoal 테이블 마이그레이션 완료")
  } catch (error) {
    logger.error("WorkoutGoal 테이블 마이그레이션 실패:", error)
    throw error
  }
}

async function migrateUserTable() {
  logger.info("User 테이블 마이그레이션 시작...")

  try {
    // 기존 테이블 백업 (선택사항)
    await AppDataSource.query(`
      CREATE TABLE IF NOT EXISTS users_backup AS 
      SELECT * FROM users
    `)

    // User 테이블 스키마 업데이트 (필요한 경우)
    await AppDataSource.query(`
      ALTER TABLE users 
      CHANGE COLUMN created_at createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CHANGE COLUMN updated_at updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    `)

    logger.info("User 테이블 마이그레이션 완료")
  } catch (error) {
    logger.error("User 테이블 마이그레이션 실패:", error)
    throw error
  }
}

async function migrateWorkoutPlanTable() {
  logger.info("WorkoutPlan 테이블 마이그레이션 시작...")

  try {
    // 기존 테이블 백업 (선택사항)
    await AppDataSource.query(`
      CREATE TABLE IF NOT EXISTS workout_plans_backup AS 
      SELECT * FROM workout_plans
    `)

    // WorkoutPlan 테이블 스키마 업데이트
    await AppDataSource.query(`
      ALTER TABLE workout_plans 
      CHANGE COLUMN plan_id id INT AUTO_INCREMENT PRIMARY KEY,
      CHANGE COLUMN user_id userId INT NOT NULL,
      CHANGE COLUMN plan_name name VARCHAR(255) NOT NULL,
      CHANGE COLUMN created_at createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CHANGE COLUMN updated_at updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    `)

    logger.info("WorkoutPlan 테이블 마이그레이션 완료")
  } catch (error) {
    logger.error("WorkoutPlan 테이블 마이그레이션 실패:", error)
    throw error
  }
}

async function migrateWorkoutSessionTable() {
  logger.info("WorkoutSession 테이블 마이그레이션 시작...")

  try {
    // 기존 테이블 백업 (선택사항)
    await AppDataSource.query(`
      CREATE TABLE IF NOT EXISTS workout_sessions_backup AS 
      SELECT * FROM workout_sessions
    `)

    // WorkoutSession 테이블 스키마 업데이트
    await AppDataSource.query(`
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
    `)

    logger.info("WorkoutSession 테이블 마이그레이션 완료")
  } catch (error) {
    logger.error("WorkoutSession 테이블 마이그레이션 실패:", error)
    throw error
  }
}

async function main() {
  logger.info("타입 시스템 마이그레이션 시작...")

  try {
    // 데이터베이스 연결
    await AppDataSource.initialize()
    logger.info("데이터베이스 연결 성공")

    // 마이그레이션 실행 (의존성 순서 고려)
    await migrateUserTable()
    await migrateMachineTable()
    await migrateWorkoutPlanTable()
    await migrateWorkoutSessionTable()
    await migrateWorkoutGoalTable()

    logger.info("모든 마이그레이션 완료!")

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

export { main as migrateToNewTypeSystem }
