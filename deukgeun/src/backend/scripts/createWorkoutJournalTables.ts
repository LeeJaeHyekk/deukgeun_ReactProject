// ============================================================================
// 운동 일지 테이블 생성 스크립트 (개선 버전)
// ============================================================================
// 운동 일지 관련 테이블을 생성합니다.
// 안전장치 및 검증 로직 포함
// ============================================================================

import { AppDataSource } from '@backend/config/databaseConfig'
import { logger } from '@backend/utils/logger'
import { config } from 'dotenv'

// 환경 변수 로드
config({ path: 'src/backend/env.production' })
config({ path: '.env.production' })
config()

// ============================================================================
// 타입 정의
// ============================================================================

interface TableCreationResult {
  tableName: string
  success: boolean
  error?: string
}

// ============================================================================
// 안전장치 함수
// ============================================================================

/**
 * 프로덕션 환경 확인
 */
function isProductionEnvironment(): boolean {
  const nodeEnv = process.env.NODE_ENV || process.env.MODE || 'development'
  return nodeEnv === 'production'
}

/**
 * 데이터베이스 연결 검증
 */
async function validateDatabaseConnection(): Promise<boolean> {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize()
    }

    // 간단한 쿼리로 연결 확인
    await AppDataSource.query('SELECT 1 as health_check')
    logger.info('✅ 데이터베이스 연결 검증 성공')
    return true
  } catch (error) {
    logger.error('❌ 데이터베이스 연결 검증 실패:', error)
    return false
  }
}

/**
 * 테이블 존재 여부 확인
 */
async function tableExists(tableName: string): Promise<boolean> {
  try {
    const result = await AppDataSource.query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = ?
    `, [tableName])
    
    return Array.isArray(result) && result.length > 0
  } catch (error) {
    logger.error(`❌ 테이블 존재 여부 확인 실패 (${tableName}):`, error)
    return false
  }
}

// ============================================================================
// 테이블 생성 함수
// ============================================================================

/**
 * 운동 일지 관련 테이블 생성
 */
async function createWorkoutJournalTables(): Promise<TableCreationResult[]> {
  const results: TableCreationResult[] = []
  let isInitialized = false

  try {
    logger.info('🔄 운동 일지 관련 테이블 생성 시작...')
    logger.info('='.repeat(60))

    // 프로덕션 환경 확인
    if (isProductionEnvironment()) {
      logger.warn('⚠️ 프로덕션 환경에서 실행 중입니다.')
      logger.warn('⚠️ 이 스크립트는 데이터베이스 스키마를 변경합니다.')
      logger.warn('⚠️ 실행 전 반드시 백업을 수행하세요.')
    }

    // 데이터베이스 연결 검증
    const isValid = await validateDatabaseConnection()
    if (!isValid) {
      throw new Error('데이터베이스 연결 검증 실패')
    }

    isInitialized = AppDataSource.isInitialized

    // 테이블 생성 SQL 정의
    const tableDefinitions = [
      {
        name: 'workout_sessions',
        sql: `
          CREATE TABLE IF NOT EXISTS workout_sessions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            userId INT NOT NULL,
            planId INT NULL,
            gymId INT NULL,
            sessionName VARCHAR(100) NOT NULL,
            startTime DATETIME NOT NULL,
            endTime DATETIME NULL,
            totalDurationMinutes INT NULL,
            moodRating INT NULL,
            energyLevel INT NULL,
            notes TEXT NULL,
            status ENUM('in_progress', 'completed', 'paused', 'cancelled') DEFAULT 'in_progress',
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_userId (userId),
            INDEX idx_planId (planId),
            INDEX idx_gymId (gymId),
            FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (planId) REFERENCES workout_plans(id) ON DELETE SET NULL,
            FOREIGN KEY (gymId) REFERENCES gym(id) ON DELETE SET NULL
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `
      },
      {
        name: 'exercise_sets',
        sql: `
          CREATE TABLE IF NOT EXISTS exercise_sets (
            id INT AUTO_INCREMENT PRIMARY KEY,
            sessionId INT NOT NULL,
            machineId INT NOT NULL,
            setNumber INT NOT NULL,
            repsCompleted INT NOT NULL,
            weightKg DECIMAL(5,2) NULL,
            durationSeconds INT NULL,
            distanceMeters DECIMAL(8,2) NULL,
            rpeRating INT NULL,
            notes TEXT NULL,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_sessionId (sessionId),
            INDEX idx_machineId (machineId),
            FOREIGN KEY (sessionId) REFERENCES workout_sessions(id) ON DELETE CASCADE,
            FOREIGN KEY (machineId) REFERENCES machines(id) ON DELETE CASCADE
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `
      },
      {
        name: 'workout_goals',
        sql: `
          CREATE TABLE IF NOT EXISTS workout_goals (
            id INT AUTO_INCREMENT PRIMARY KEY,
            userId INT NOT NULL,
            goalType ENUM('weight_lift', 'endurance', 'weight_loss', 'muscle_gain', 'strength', 'flexibility') NOT NULL,
            targetValue DECIMAL(10,2) NOT NULL,
            currentValue DECIMAL(10,2) DEFAULT 0,
            unit VARCHAR(50) NOT NULL,
            targetDate DATE NOT NULL,
            startDate DATE NOT NULL,
            status ENUM('active', 'completed', 'paused', 'cancelled') DEFAULT 'active',
            progressPercentage DECIMAL(5,2) DEFAULT 0,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_userId (userId),
            FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `
      },
      {
        name: 'workout_plans',
        sql: `
          CREATE TABLE IF NOT EXISTS workout_plans (
            id INT AUTO_INCREMENT PRIMARY KEY,
            userId INT NOT NULL,
            name VARCHAR(100) NOT NULL,
            description TEXT NULL,
            difficultyLevel ENUM('beginner', 'intermediate', 'advanced') DEFAULT 'beginner',
            estimatedDurationMinutes INT NOT NULL,
            targetMuscleGroups JSON NULL,
            isTemplate BOOLEAN DEFAULT FALSE,
            isPublic BOOLEAN DEFAULT FALSE,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_userId (userId),
            FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `
      },
      {
        name: 'workout_plan_exercises',
        sql: `
          CREATE TABLE IF NOT EXISTS workout_plan_exercises (
            id INT AUTO_INCREMENT PRIMARY KEY,
            planId INT NOT NULL,
            machineId INT NOT NULL,
            exerciseOrder INT NOT NULL,
            sets INT NOT NULL,
            repsRange JSON NOT NULL,
            weightRange JSON NULL,
            restSeconds INT DEFAULT 90,
            notes TEXT NULL,
            INDEX idx_planId (planId),
            INDEX idx_machineId (machineId),
            FOREIGN KEY (planId) REFERENCES workout_plans(id) ON DELETE CASCADE,
            FOREIGN KEY (machineId) REFERENCES machines(id) ON DELETE CASCADE
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `
      },
      {
        name: 'workout_stats',
        sql: `
          CREATE TABLE IF NOT EXISTS workout_stats (
            id INT AUTO_INCREMENT PRIMARY KEY,
            userId INT NOT NULL,
            machineId INT NULL,
            workoutDate DATE NOT NULL,
            totalSessions INT DEFAULT 0,
            totalDurationMinutes INT DEFAULT 0,
            totalSets INT DEFAULT 0,
            totalReps INT DEFAULT 0,
            totalWeightKg DECIMAL(10,2) DEFAULT 0,
            totalDistanceMeters DECIMAL(8,2) DEFAULT 0,
            averageMood DECIMAL(5,2) DEFAULT 0,
            averageEnergy DECIMAL(5,2) DEFAULT 0,
            averageRpe DECIMAL(5,2) DEFAULT 0,
            caloriesBurned INT DEFAULT 0,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_userId (userId),
            INDEX idx_machineId (machineId),
            INDEX idx_workoutDate (workoutDate),
            FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (machineId) REFERENCES machines(id) ON DELETE CASCADE
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `
      },
      {
        name: 'workout_progress',
        sql: `
          CREATE TABLE IF NOT EXISTS workout_progress (
            id INT AUTO_INCREMENT PRIMARY KEY,
            userId INT NOT NULL,
            machineId INT NOT NULL,
            progressDate DATE NOT NULL,
            setNumber INT NOT NULL,
            repsCompleted INT NOT NULL,
            weightKg DECIMAL(5,2) NULL,
            durationSeconds INT NULL,
            distanceMeters DECIMAL(8,2) NULL,
            rpeRating INT NULL,
            notes TEXT NULL,
            isPersonalBest BOOLEAN DEFAULT FALSE,
            improvementPercentage DECIMAL(5,2) NULL,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_userId (userId),
            INDEX idx_machineId (machineId),
            INDEX idx_progressDate (progressDate),
            FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (machineId) REFERENCES machines(id) ON DELETE CASCADE
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `
      },
      {
        name: 'workout_reminders',
        sql: `
          CREATE TABLE IF NOT EXISTS workout_reminders (
            id INT AUTO_INCREMENT PRIMARY KEY,
            userId INT NOT NULL,
            title VARCHAR(100) NOT NULL,
            description TEXT NULL,
            reminderTime TIME NOT NULL,
            repeatDays JSON NOT NULL,
            isActive BOOLEAN DEFAULT TRUE,
            isSent BOOLEAN DEFAULT FALSE,
            lastSentAt DATETIME NULL,
            nextSendAt DATETIME NULL,
            notificationType ENUM('push', 'email', 'sms') DEFAULT 'push',
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_userId (userId),
            FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `
      }
    ]

    // 테이블 생성
    logger.info(`🔄 ${tableDefinitions.length}개 테이블 생성 중...`)
    let successCount = 0
    let skipCount = 0
    let errorCount = 0

    for (const { name, sql } of tableDefinitions) {
      try {
        // 테이블 존재 여부 확인
        const exists = await tableExists(name)
        if (exists) {
          logger.info(`ℹ️ ${name} 테이블이 이미 존재합니다 (건너뜀)`)
          results.push({ tableName: name, success: true })
          skipCount++
          continue
        }

        // 테이블 생성
        await AppDataSource.query(sql)
        logger.info(`✅ ${name} 테이블 생성 완료`)
        results.push({ tableName: name, success: true })
        successCount++
      } catch (error: any) {
        const errorMessage = error?.message || String(error)
        logger.error(`❌ ${name} 테이블 생성 실패:`, errorMessage)
        results.push({ 
          tableName: name, 
          success: false, 
          error: errorMessage 
        })
        errorCount++
      }
    }

    logger.info('='.repeat(60))
    logger.info('🎉 운동 일지 관련 테이블 생성 완료!')
    logger.info(`📊 생성 결과:`)
    logger.info(`   - 성공: ${successCount}개`)
    logger.info(`   - 건너뜀: ${skipCount}개`)
    logger.info(`   - 실패: ${errorCount}개`)
    logger.info('='.repeat(60))

    return results

  } catch (error) {
    logger.error('❌ 테이블 생성 중 오류 발생:', error)
    throw error
  } finally {
    // 연결 종료
    if (isInitialized && AppDataSource.isInitialized) {
      try {
        await AppDataSource.destroy()
        logger.info('✅ 데이터베이스 연결 종료')
      } catch (error) {
        logger.error('❌ 데이터베이스 연결 종료 실패:', error)
      }
    }
  }
}

// ============================================================================
// 스크립트 실행
// ============================================================================

if (require.main === module) {
  createWorkoutJournalTables()
    .then((results) => {
      const failed = results.filter(r => !r.success)
      if (failed.length > 0) {
        logger.warn(`⚠️ ${failed.length}개 테이블 생성 실패`)
        process.exit(1)
      } else {
        logger.info('✅ 운동 일지 테이블 생성이 완료되었습니다.')
        process.exit(0)
      }
    })
    .catch(error => {
      logger.error('❌ 스크립트 실행 중 오류 발생:', error)
      process.exit(1)
    })
}

export { createWorkoutJournalTables }
export type { TableCreationResult }
