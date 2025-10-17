import "reflect-metadata"
// TypeORM DataSource 클래스 import
import { DataSource } from "typeorm"
// 환경 변수 로드 라이브러리 import
import { config } from "dotenv"
// MySQL 연결 테스트를 위한 mysql2 import
import mysql from "mysql2/promise"
// 데이터베이스 진단 도구 import
import { runDatabaseDiagnostics, createDatabaseIfNotExists } from "../utils/databaseDiagnostics"

// 엔티티 클래스들 import - 데이터베이스 테이블과 매핑되는 클래스들
import { Post } from '@backend/entities/Post' // 게시글 엔티티
import { Gym } from '@backend/entities/Gym' // 헬스장 엔티티
import { Equipment } from '@backend/entities/Equipment' // 헬스장 기구 엔티티
import { User } from '@backend/entities/User' // 사용자 엔티티
import { Machine } from '@backend/entities/Machine' // 운동 머신 엔티티
import { Comment } from '@backend/entities/Comment' // 댓글 엔티티
import { Like } from '@backend/entities/Like' // 게시글 좋아요 엔티티
import { UserLevel } from '@backend/entities/UserLevel' // 사용자 레벨 엔티티
import { ExpHistory } from "../entities/ExpHistory" // 경험치 이력 엔티티
import { UserReward } from "../entities/UserReward" // 사용자 보상 엔티티
import { Milestone } from "../entities/Milestone" // 마일스톤 엔티티
import { UserStreak } from "../entities/UserStreak" // 사용자 연속 활동 엔티티
import { WorkoutSession } from '@backend/entities/WorkoutSession' // 운동 세션 엔티티
import { ExerciseSet } from "../entities/ExerciseSet" // 운동 세트 엔티티
import { WorkoutGoal } from "../entities/WorkoutGoal" // 운동 목표 엔티티
import { WorkoutPlan } from "../entities/WorkoutPlan" // 운동 계획 엔티티
import { WorkoutPlanExercise } from "../entities/WorkoutPlanExercise" // 운동 계획 운동 엔티티
import { WorkoutStats } from '@backend/entities/WorkoutStats' // 운동 통계 엔티티
import { WorkoutProgress } from "../entities/WorkoutProgress" // 운동 진행 상황 엔티티
import { WorkoutReminder } from "../entities/WorkoutReminder" // 운동 알림 엔티티
import { VerificationToken } from "../entities/VerificationToken" // 이메일 인증 토큰 엔티티
import { PasswordResetToken } from "../entities/PasswordResetToken" // 비밀번호 재설정 토큰 엔티티
import { HomePageConfig } from "../entities/HomePageConfig" // 홈페이지 설정 엔티티

// 환경 변수 로드 (.env 파일에서 환경 변수 읽기)
config()

// 현재 환경 설정 (기본값: development)
const environment = process.env.NODE_ENV || "development"

/**
 * TypeORM DataSource 설정
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
    acquireTimeout: 10000,
    timeout: 10000,
    reconnect: true,
    charset: 'utf8mb4',
    timezone: '+09:00'
  },

  // 스키마 자동 동기화 설정 (개발 환경에서만 활성화)
  synchronize: true, // 개발용으로 강제 활성화

  // SQL 쿼리 로깅 설정 (개발 환경에서만 활성화)
  logging: environment === "development",

  // 엔티티 클래스 목록 - 데이터베이스 테이블과 매핑될 클래스들
  entities: [
    Post, // 게시글 테이블
    Gym, // 헬스장 테이블
    Equipment, // 헬스장 기구 테이블
    User, // 사용자 테이블
    Machine, // 운동 머신 테이블
    Comment, // 댓글 테이블
    Like, // 게시글 좋아요 테이블
    UserLevel, // 사용자 레벨 테이블
    ExpHistory, // 경험치 이력 테이블
    UserReward, // 사용자 보상 테이블
    Milestone, // 마일스톤 테이블
    UserStreak, // 사용자 연속 활동 테이블
    WorkoutSession, // 운동 세션 테이블
    ExerciseSet, // 운동 세트 테이블
    WorkoutGoal, // 운동 목표 테이블
    WorkoutPlan, // 운동 계획 테이블
    WorkoutPlanExercise, // 운동 계획 운동 테이블
    WorkoutStats, // 운동 통계 테이블
    WorkoutProgress, // 운동 진행 상황 테이블
    WorkoutReminder, // 운동 알림 테이블
    VerificationToken, // 이메일 인증 토큰 테이블
    PasswordResetToken, // 비밀번호 재설정 토큰 테이블
    HomePageConfig, // 홈페이지 설정 테이블
  ],

  // 구독자 목록 (현재 사용하지 않음)
  subscribers: [],

  // 마이그레이션 목록 (현재 사용하지 않음)
  migrations: [],
})

/**
 * MySQL 서버 상태 확인 함수
 * @returns Promise<boolean> 서버 접근 가능 여부
 */
const checkMySQLServerStatus = async (): Promise<boolean> => {
  try {
    console.log("🔄 Checking MySQL server status...")
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      port: parseInt(process.env.DB_PORT || "3306"),
      user: process.env.DB_USERNAME || "root",
      password: process.env.DB_PASSWORD || "",
    })
    
    await connection.ping()
    await connection.end()
    console.log("✅ MySQL server is accessible")
    return true
  } catch (error) {
    console.warn("❌ MySQL server is not accessible:", error instanceof Error ? error.message : String(error))
    return false
  }
}

/**
 * 데이터베이스 연결 재시도 함수
 * @param maxRetries 최대 재시도 횟수
 * @param delay 재시도 간격 (ms)
 * @returns Promise<boolean> 연결 성공 여부
 */
const retryDatabaseConnection = async (maxRetries: number = 3, delay: number = 500): Promise<boolean> => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 Database connection attempt ${attempt}/${maxRetries}`)
      
      // 이미 초기화된 경우 스킵
      if (AppDataSource.isInitialized) {
        console.log(`✅ Database already initialized`)
        return true
      }
      
      await AppDataSource.initialize()
      console.log(`✅ Database connected successfully on attempt ${attempt}`)
      return true
    } catch (error) {
      console.warn(`❌ Database connection attempt ${attempt} failed:`, error instanceof Error ? error.message : String(error))
      
      if (attempt < maxRetries) {
        console.log(`⏳ Waiting ${delay}ms before retry...`)
        await new Promise(resolve => setTimeout(resolve, delay))
        delay *= 1.5 // 더 빠른 백오프
      }
    }
  }
  return false
}

/**
 * 데이터베이스 연결 함수
 * TypeORM DataSource를 초기화하고 연결을 설정
 * @returns 초기화된 DataSource 인스턴스
 */
export const connectDatabase = async () => {
  console.log("=".repeat(60))
  console.log("🔧 DATABASE CONNECTION DEBUG START")
  console.log("=".repeat(60))
  
  try {
    console.log("🔄 Step 1: Initializing database connection...")
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
    
    console.log("🔄 Step 2.1: Skipping comprehensive diagnostics for faster startup...")
    // await runDatabaseDiagnostics() // 주석 처리하여 빠른 시작
    
    console.log("🔄 Step 2.2: Attempting to create database if it doesn't exist...")
    const dbCreated = await createDatabaseIfNotExists()
    if (dbCreated) {
      console.log("✅ Database creation/verification completed")
    } else {
      console.warn("⚠️ Database creation failed, but continuing with connection attempt...")
    }
    
    console.log("🔄 Step 3: Attempting AppDataSource.initialize() with retry logic...")
    const startTime = Date.now()
    
    // DataSource 초기화 (재시도 로직 포함)
    const connectionSuccess = await retryDatabaseConnection(3, 500)
    
    if (!connectionSuccess) {
      throw new Error("Failed to connect to database after 3 attempts")
    }
    
    const endTime = Date.now()
    console.log(`✅ Step 3: AppDataSource.initialize() completed in ${endTime - startTime}ms`)
    
    console.log("🔄 Step 4: Verifying connection status...")
    console.log(`   - Is Initialized: ${AppDataSource.isInitialized}`)
    console.log(`   - Connection Name: ${AppDataSource.name}`)
    
    console.log("🔄 Step 5: Testing database query...")
    const queryStartTime = Date.now()
    const result = await AppDataSource.query("SELECT 1 as test, NOW() as `current_time`")
    const queryEndTime = Date.now()
    
    console.log(`✅ Step 5: Database query test successful in ${queryEndTime - queryStartTime}ms`)
    console.log(`   - Query result:`, result)
    
    console.log("🔄 Step 6: Getting connection info...")
    const connection = AppDataSource.manager.connection
    console.log(`   - Connection name: ${connection.name}`)
    console.log(`   - Connection options:`, {
      host: (connection.options as any).host,
      port: (connection.options as any).port,
      database: (connection.options as any).database,
      username: (connection.options as any).username
    })
    
    console.log("=".repeat(60))
    console.log("✅ DATABASE CONNECTION SUCCESSFUL")
    console.log("=".repeat(60))
    console.log(`📊 Database: ${process.env.DB_DATABASE || process.env.DB_NAME || "deukgeun_db"} on ${process.env.DB_HOST || "localhost"}:${process.env.DB_PORT || "3306"}`)
    console.log(`⏱️ Total connection time: ${endTime - startTime}ms`)
    console.log("=".repeat(60))
    
    return AppDataSource
  } catch (error) {
    console.log("=".repeat(60))
    console.log("❌ DATABASE CONNECTION FAILED")
    console.log("=".repeat(60))
    
    console.error("❌ Error occurred during database connection:")
    console.error("   - Error type:", error?.constructor?.name || "Unknown")
    console.error("   - Error message:", error instanceof Error ? error.message : String(error))
    
    if (error instanceof Error) {
      console.error("   - Error stack:", error.stack)
      
      // 상세한 에러 분석
      console.log("🔍 Error Analysis:")
      if (error.message.includes('ECONNREFUSED')) {
        console.error("   - Issue: Connection refused")
        console.error("   - Cause: MySQL 서버가 실행되지 않았거나 연결을 거부했습니다.")
        console.error("   - Solution: MySQL 서버 상태를 확인해주세요.")
        console.error("   - Check: netstat -an | grep 3306")
      } else if (error.message.includes('ER_ACCESS_DENIED_ERROR')) {
        console.error("   - Issue: Access denied")
        console.error("   - Cause: 데이터베이스 인증 정보가 잘못되었습니다.")
        console.error("   - Solution: 사용자명과 비밀번호를 확인해주세요.")
        console.error("   - Check: DB_USERNAME, DB_PASSWORD 환경변수")
      } else if (error.message.includes('ER_BAD_DB_ERROR')) {
        console.error("   - Issue: Database not found")
        console.error("   - Cause: 데이터베이스가 존재하지 않습니다.")
        console.error("   - Solution: 데이터베이스를 생성해주세요.")
        console.error("   - Check: CREATE DATABASE deukgeun_db;")
      } else if (error.message.includes('ETIMEDOUT')) {
        console.error("   - Issue: Connection timeout")
        console.error("   - Cause: 데이터베이스 서버 응답 시간 초과")
        console.error("   - Solution: 네트워크 연결 및 서버 상태 확인")
      } else if (error.message.includes('ENOTFOUND')) {
        console.error("   - Issue: Host not found")
        console.error("   - Cause: 데이터베이스 호스트를 찾을 수 없습니다.")
        console.error("   - Solution: DB_HOST 환경변수 확인")
      }
    }
    
    console.log("=".repeat(60))
    console.log("❌ DATABASE CONNECTION DEBUG END")
    console.log("=".repeat(60))
    
    throw error
  }
}

/**
 * 현재 데이터베이스 연결 가져오기
 * @returns 현재 활성화된 DataSource 인스턴스
 * @throws Error 연결이 초기화되지 않은 경우
 */
export const getConnection = () => {
  if (!AppDataSource.isInitialized) {
    throw new Error("Database connection is not initialized")
  }
  return AppDataSource
}

/**
 * 데이터베이스 상태 확인 함수
 * 데이터베이스 연결 상태와 응답성을 확인
 * @returns 데이터베이스 상태 정보 객체
 */
export const checkDatabaseHealth = async () => {
  console.log("🔍 DATABASE HEALTH CHECK START")
  
  try {
    console.log("🔄 Step 1: Getting database connection...")
    const connection = getConnection()
    console.log(`   - Connection name: ${connection.name}`)
    console.log(`   - Is initialized: ${connection.isInitialized}`)
    
    console.log("🔄 Step 2: Testing database query...")
    const startTime = Date.now()
    const result = await connection.query("SELECT 1 as health_check, NOW() as `timestamp`, VERSION() as mysql_version")
    const endTime = Date.now()
    
    console.log(`✅ Step 2: Database query successful in ${endTime - startTime}ms`)
    console.log(`   - Query result:`, result)
    
    console.log("🔄 Step 3: Getting connection statistics...")
    const stats = {
      isInitialized: connection.isInitialized,
      name: connection.name,
      options: {
        host: (connection.options as any).host,
        port: (connection.options as any).port,
        database: (connection.options as any).database,
        username: (connection.options as any).username
      }
    }
    console.log(`   - Connection stats:`, stats)
    
    console.log("✅ DATABASE HEALTH CHECK SUCCESSFUL")
    
    return {
      status: "healthy", // 정상 상태
      message: "Database is connected and responsive", // 연결됨 및 응답 가능
      responseTime: endTime - startTime,
      timestamp: new Date().toISOString(),
      connectionInfo: stats,
      queryResult: result
    }
  } catch (error) {
    console.log("❌ DATABASE HEALTH CHECK FAILED")
    console.error("   - Error:", error instanceof Error ? error.message : String(error))
    
    return {
      status: "unhealthy", // 비정상 상태
      message: "Database connection failed", // 연결 실패
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    }
  }
}
