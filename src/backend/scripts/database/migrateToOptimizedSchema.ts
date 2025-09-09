import { AppDataSource } from "../../shared/database"
import { logger } from "../../shared/utils/logger"
import { User } from "../../domains/auth/entities/User"
import { Gym } from "../../domains/gym/entities/Gym"
import { Machine } from "../../domains/machine/entities/Machine"
import { Post } from "../../domains/community/entities/Post"
import { Comment } from "../../domains/community/entities/Comment"
import { Like } from "../../domains/community/entities/Like"
import { UserLevel } from "../../domains/level/entities/UserLevel"
import { ExpHistory } from "../../domains/level/entities/ExpHistory"
import { UserReward } from "../../domains/level/entities/UserReward"
import { Milestone } from "../../entities/Milestone"
import { UserStreak } from "../../entities/UserStreak"
import { WorkoutSession } from "../../domains/workout/entities/WorkoutSession"
import { ExerciseSet } from "../../domains/workout/entities/ExerciseSet"
import { WorkoutGoal } from "../../entities/WorkoutGoal"
import { WorkoutPlan } from "../../domains/workout/entities/WorkoutPlan"
import { WorkoutPlanExercise } from "../../entities/WorkoutPlanExercise"
import { WorkoutStats } from "../../domains/workout/entities/WorkoutStats"
import { WorkoutProgress } from "../../entities/WorkoutProgress"
import { WorkoutReminder } from "../../entities/WorkoutReminder"

/**
 * 최적화된 스키마로 전체 데이터베이스 마이그레이션
 *
 * 실행 방법:
 * npm run migrate:optimized
 *
 * 주의사항:
 * - 실행 전 반드시 데이터베이스 백업을 수행하세요
 * - 프로덕션 환경에서는 신중하게 실행하세요
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
    try {
      await AppDataSource.query(`
        ALTER TABLE users 
        ADD COLUMN name VARCHAR(100) NULL
      `)
      logger.info("name 필드 추가 완료")
    } catch (error) {
      logger.info("name 필드가 이미 존재합니다")
    }

    try {
      await AppDataSource.query(`
        ALTER TABLE users 
        ADD COLUMN username VARCHAR(100) NULL
      `)
      logger.info("username 필드 추가 완료")
    } catch (error) {
      logger.info("username 필드가 이미 존재합니다")
    }

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
      CHANGE COLUMN created_at createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CHANGE COLUMN updated_at updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    `)
    logger.info("Machine 테이블 스키마 업데이트 완료")

    // isActive 필드 추가
    try {
      await AppDataSource.query(`
        ALTER TABLE machines 
        ADD COLUMN isActive BOOLEAN DEFAULT TRUE
      `)
      logger.info("isActive 필드 추가 완료")
    } catch (error) {
      logger.info("isActive 필드가 이미 존재합니다")
    }

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

    logger.info("Machine 테이블 마이그레이션 완료")
  } catch (error) {
    logger.error("Machine 테이블 마이그레이션 실패:", error)
    throw error
  }
}

async function migrateWorkoutTables() {
  logger.info("Workout 관련 테이블 마이그레이션 시작...")

  try {
    // WorkoutGoal 테이블 업데이트
    await AppDataSource.query(`
      ALTER TABLE workout_goals 
      CHANGE COLUMN goal_type goalType ENUM('weight_loss', 'muscle_gain', 'endurance', 'strength', 'flexibility') NOT NULL,
      CHANGE COLUMN target_value targetValue DECIMAL(10,2) NULL,
      CHANGE COLUMN current_value currentValue DECIMAL(10,2) NULL,
      CHANGE COLUMN start_date startDate DATE NOT NULL,
      CHANGE COLUMN end_date endDate DATE NULL,
      CHANGE COLUMN created_at createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CHANGE COLUMN updated_at updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    `)
    logger.info("WorkoutGoal 테이블 업데이트 완료")

    // WorkoutSession 테이블 업데이트
    await AppDataSource.query(`
      ALTER TABLE workout_sessions 
      CHANGE COLUMN session_date sessionDate DATE NOT NULL,
      CHANGE COLUMN start_time startTime TIME NULL,
      CHANGE COLUMN end_time endTime TIME NULL,
      CHANGE COLUMN total_duration totalDuration INT NULL,
      CHANGE COLUMN calories_burned caloriesBurned INT NULL,
      CHANGE COLUMN created_at createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CHANGE COLUMN updated_at updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    `)
    logger.info("WorkoutSession 테이블 업데이트 완료")

    logger.info("Workout 관련 테이블 마이그레이션 완료")
  } catch (error) {
    logger.error("Workout 관련 테이블 마이그레이션 실패:", error)
    throw error
  }
}

async function main() {
  logger.info("최적화된 스키마 마이그레이션 시작...")

  try {
    // 데이터베이스 연결
    await AppDataSource.initialize()
    logger.info("데이터베이스 연결 성공")

    // 마이그레이션 실행 (의존성 순서 고려)
    await migrateUserTable()
    await migrateMachineTable()
    await migrateWorkoutTables()

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
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}
