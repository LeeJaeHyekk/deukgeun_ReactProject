import "reflect-metadata"
// TypeORM DataSource 클래스 import
import { DataSource } from "typeorm"
// 환경 변수 로드 라이브러리 import
import { config } from "dotenv"
// MySQL 연결 테스트를 위한 mysql2 import
import mysql from "mysql2/promise"

// 엔티티 직접 import
import { User } from "@backend/entities/User"
import { UserLevel } from "@backend/entities/UserLevel"
import { UserStreak } from "@backend/entities/UserStreak"
import { ExpHistory } from "@backend/entities/ExpHistory"
import { UserReward } from "@backend/entities/UserReward"
import { Milestone } from "@backend/entities/Milestone"
import { Post } from "@backend/entities/Post"
import { Comment } from "@backend/entities/Comment"
import { Like } from "@backend/entities/Like"
import { Gym } from "@backend/entities/Gym"
import { Equipment } from "@backend/entities/Equipment"
import { Machine } from "@backend/entities/Machine"
import { HomePageConfig } from "@backend/entities/HomePageConfig"
import { WorkoutSession } from "@backend/entities/WorkoutSession"
import { WorkoutPlan } from "@backend/entities/WorkoutPlan"
import { WorkoutPlanExercise } from "@backend/entities/WorkoutPlanExercise"
import { ExerciseSet } from "@backend/entities/ExerciseSet"
import { WorkoutGoal } from "@backend/entities/WorkoutGoal"
import { GoalEntity } from "@backend/entities/GoalEntity"
import { GoalHistoryEntity } from "@backend/entities/GoalHistoryEntity"
import { VerificationToken } from "@backend/entities/VerificationToken"
import { PasswordResetToken } from "@backend/entities/PasswordResetToken"

// 환경 변수 로드 (.env 파일에서 환경 변수 읽기)
config()

// 현재 환경 설정 (기본값: development)
const environment = process.env.NODE_ENV || "development"

/**
 * 엔티티 목록 정의
 * 직접 import한 엔티티들을 배열로 반환
 */
function getEntities() {
  const entities = [
    // User 관련 엔티티
    User,
    UserLevel,
    UserStreak,
    ExpHistory,
    UserReward,
    Milestone,
    
    // Post 관련 엔티티
    Post,
    Comment,
    Like,
    
    // Gym 관련 엔티티
    Gym,
    Equipment,
    
    // Machine 관련 엔티티
    Machine,
    
    // HomePage 관련 엔티티
    HomePageConfig,
    
    // Workout 관련 엔티티
    WorkoutSession,
    WorkoutPlan,
    WorkoutPlanExercise,
    ExerciseSet,
    WorkoutGoal,
    
    // Goal 관련 엔티티 (새로운 구조)
    GoalEntity,
    GoalHistoryEntity,
    
    // Auth 관련 엔티티
    VerificationToken,
    PasswordResetToken,
  ]
  
  console.log(`✅ Loaded ${entities.length} entities`)
  return entities
}

/**
 * TypeORM DataSource 설정 (엔티티 포함)
 * 데이터베이스 연결 및 ORM 설정을 담당
 */
export const AppDataSource = new DataSource({
  // 데이터베이스 타입 설정
  type: "mysql", // MySQL 데이터베이스 사용

  // 데이터베이스 연결 설정 (환경 변수 사용)
  host: process.env.DB_HOST || "localhost", // 데이터베이스 호스트
  port: parseInt(process.env.DB_PORT || "3306"), // 데이터베이스 포트
  username: process.env.DB_USERNAME || "root", // 데이터베이스 사용자명
  password: process.env.DB_PASSWORD || "", // 데이터베이스 비밀번호
  database: process.env.DB_DATABASE || process.env.DB_NAME || "deukgeun_db", // 데이터베이스 이름

  // 연결 풀 설정
  extra: {
    connectionLimit: 10,
    charset: 'utf8mb4',
    timezone: '+09:00'
  },

  // 스키마 자동 동기화 설정 (개발 환경에서만 활성화)
  synchronize: environment === "development",

  // SQL 쿼리 로깅 설정 (개발 환경에서만 활성화)
  logging: environment === "development",

  // 엔티티 클래스 목록 - 직접 import한 엔티티들
  entities: getEntities(),

  // 구독자 목록 (현재 사용하지 않음)
  subscribers: [],

  // 마이그레이션 목록 (현재 사용하지 않음)
  migrations: [],
})

/**
 * MySQL 서버 상태 확인 함수
 * @returns Promise<boolean> 서버 접근 가능 여부
 */
export async function checkMySQLServer(): Promise<boolean> {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      port: parseInt(process.env.DB_PORT || "3306"),
      user: process.env.DB_USERNAME || "root",
      password: process.env.DB_PASSWORD || "",
    })
    
    await connection.ping()
    await connection.end()
    return true
  } catch (error) {
    console.error("❌ MySQL server check failed:", error)
    return false
  }
}

/**
 * 데이터베이스 재연결 함수 (재시도 로직 포함)
 * @param maxRetries 최대 재시도 횟수
 * @param retryDelay 재시도 간격 (밀리초)
 * @returns Promise<boolean> 연결 성공 여부
 */
const retryDatabaseConnection = async (maxRetries: number = 3, retryDelay: number = 1000): Promise<boolean> => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 Database connection attempt ${attempt}/${maxRetries}...`)
      
      if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize()
        console.log("✅ Database connection established")
      } else {
        console.log("✅ Database already connected")
      }
      
      return true
    } catch (error) {
      console.error(`❌ Database connection attempt ${attempt} failed:`, error)
      
      if (attempt < maxRetries) {
        console.log(`⏳ Waiting ${retryDelay}ms before retry...`)
        await new Promise(resolve => setTimeout(resolve, retryDelay))
      }
    }
  }
  
  console.error(`❌ Failed to connect to database after ${maxRetries} attempts`)
  return false
}

/**
 * 데이터베이스 연결 함수 (엔티티 포함)
 * TypeORM DataSource를 초기화하고 연결을 설정
 * @returns 초기화된 DataSource 인스턴스
 */
export const connectDatabase = async () => {
  console.log("=".repeat(60))
  console.log("🔧 DATABASE CONNECTION WITH ENTITIES DEBUG START")
  console.log("=".repeat(60))
  
  try {
    console.log("🔄 Step 1: Loading entities...")
    const entities = getEntities()
    
    console.log(`✅ Step 1: Loaded ${entities.length} entities`)
    console.log(`📊 Step 1.1: Connection details:`)
    console.log(`   - Host: ${process.env.DB_HOST || "localhost"}`)
    console.log(`   - Port: ${process.env.DB_PORT || "3306"}`)
    console.log(`   - Database: ${process.env.DB_DATABASE || process.env.DB_NAME || "deukgeun_db"}`)
    console.log(`   - Username: ${process.env.DB_USERNAME || "root"}`)
    console.log(`   - Password: ${process.env.DB_PASSWORD ? "***" : "NOT SET"}`)
    console.log(`   - Environment: ${process.env.NODE_ENV || "development"}`)
    
    console.log("🔄 Step 2: Checking AppDataSource configuration...")
    console.log(`   - Type: ${AppDataSource.options.type}`)
    console.log(`   - Synchronize: ${AppDataSource.options.synchronize}`)
    console.log(`   - Logging: ${AppDataSource.options.logging}`)
    console.log(`   - Entities count: ${AppDataSource.options.entities?.length || 0}`)
    
    console.log("🔄 Step 3: Attempting AppDataSource.initialize() with retry logic...")
    const startTime = Date.now()
    
    // DataSource 초기화 (재시도 로직 포함)
    const connectionSuccess = await retryDatabaseConnection(3, 500)
    
    if (!connectionSuccess) {
      throw new Error("Failed to connect to database after 3 attempts")
    }
    
    const endTime = Date.now()
    console.log(`✅ Step 3: Database connection successful in ${endTime - startTime}ms`)
    
    console.log("🔄 Step 4: Verifying connection status...")
    console.log(`   - Is Initialized: ${AppDataSource.isInitialized}`)
    console.log(`   - Connection Name: ${AppDataSource.name}`)
    
    console.log("🔄 Step 5: Testing database query...")
    const queryStartTime = Date.now()
    const result = await AppDataSource.query("SELECT 1 as test, NOW() as `current_time`")
    const queryEndTime = Date.now()
    
    console.log(`✅ Step 5: Database query test successful in ${queryEndTime - queryStartTime}ms`)
    console.log(`   - Query result:`, result)
    
    console.log("=".repeat(60))
    console.log("✅ DATABASE CONNECTION WITH ENTITIES SUCCESSFUL")
    console.log("=".repeat(60))
    console.log(`📊 Database: ${process.env.DB_DATABASE || process.env.DB_NAME || "deukgeun_db"} on ${process.env.DB_HOST || "localhost"}:${process.env.DB_PORT || "3306"}`)
    console.log(`⏱️ Total connection time: ${endTime - startTime}ms`)
    console.log(`📊 Entities loaded: ${entities.length}`)
    console.log("=".repeat(60))
    
    return AppDataSource
  } catch (error) {
    console.log("=".repeat(60))
    console.log("❌ DATABASE CONNECTION WITH ENTITIES FAILED")
    console.log("=".repeat(60))
    
    console.error("❌ Error occurred during database connection:")
    console.error("   - Error type:", error?.constructor?.name || "Unknown")
    console.error("   - Error message:", error instanceof Error ? error.message : String(error))
    
    if (error instanceof Error) {
      console.error("   - Error stack:", error.stack)
    }
    
    console.log("=".repeat(60))
    console.log("❌ DATABASE CONNECTION WITH ENTITIES DEBUG END")
    console.log("=".repeat(60))
    
    throw error
  }
}

/**
 * 현재 데이터베이스 연결 가져오기
 * @returns 현재 활성화된 DataSource 인스턴스
 * @throws Error 연결이 초기화되지 않은 경우
 */
export const getDatabase = () => {
  if (!AppDataSource.isInitialized) {
    throw new Error("Database not initialized. Call connectDatabase() first.")
  }
  return AppDataSource
}

/**
 * 데이터베이스 연결 종료
 * @returns Promise<void>
 */
export const closeDatabase = async () => {
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy()
    console.log("✅ Database connection closed")
  }
}