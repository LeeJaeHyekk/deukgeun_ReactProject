import "reflect-metadata"
// TypeORM DataSource 클래스 import
import { DataSource } from "typeorm"
// 환경 변수 로드 라이브러리 import
import { appConfig } from "./env"

// 엔티티 클래스들 import - 데이터베이스 테이블과 매핑되는 클래스들
import { Post } from "../domains/community/entities/Post" // 게시글 엔티티
import { Gym } from "../domains/gym/entities/Gym" // 헬스장 엔티티
import { User } from "../domains/auth/entities/User" // 사용자 엔티티
import { Machine } from "../domains/machine/entities/Machine" // 운동 머신 엔티티
import { Comment } from "../domains/community/entities/Comment" // 댓글 엔티티
import { Like } from "../domains/community/entities/Like" // 게시글 좋아요 엔티티
import { UserLevel } from "../domains/level/entities/UserLevel" // 사용자 레벨 엔티티
import { ExpHistory } from "../domains/level/entities/ExpHistory" // 경험치 이력 엔티티
import { UserReward } from "../domains/level/entities/UserReward" // 사용자 보상 엔티티
import { Milestone } from "../entities/Milestone" // 마일스톤 엔티티
import { UserStreak } from "../entities/UserStreak" // 사용자 연속 활동 엔티티
import { WorkoutSession } from "../domains/workout/entities/WorkoutSession" // 운동 세션 엔티티
import { ExerciseSet } from "../domains/workout/entities/ExerciseSet" // 운동 세트 엔티티
import { WorkoutGoal } from "../entities/WorkoutGoal" // 운동 목표 엔티티
import { WorkoutPlan } from "../domains/workout/entities/WorkoutPlan" // 운동 계획 엔티티
import { WorkoutPlanExercise } from "../entities/WorkoutPlanExercise" // 운동 계획 운동 엔티티
import { WorkoutStats } from "../domains/workout/entities/WorkoutStats" // 운동 통계 엔티티
import { WorkoutProgress } from "../entities/WorkoutProgress" // 운동 진행 상황 엔티티
import { WorkoutReminder } from "../entities/WorkoutReminder" // 운동 알림 엔티티
import { VerificationToken } from "../domains/auth/entities/VerificationToken" // 이메일 인증 토큰 엔티티
import { PasswordResetToken } from "../domains/auth/entities/PasswordResetToken" // 비밀번호 재설정 토큰 엔티티

// TypeORM DataSource 설정을 위한 databaseConfig export
export const databaseConfig = {
  type: "mysql" as const,
  host: appConfig.database.host,
  port: appConfig.database.port,
  username: appConfig.database.username,
  password: appConfig.database.password,
  database: appConfig.database.database,
  extra: {
    driver: "mysql2",
  },
  synchronize: appConfig.database.synchronize,
  logging: appConfig.database.logging,
  entities: [
    Post, // 게시글 테이블
    Gym, // 헬스장 테이블
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
  ],
  subscribers: [],
  migrations: [],
}

/**
 * TypeORM DataSource 설정
 * 데이터베이스 연결 및 ORM 설정을 담당
 */
export const AppDataSource = new DataSource(databaseConfig)

/**
 * 데이터베이스 연결 함수
 * TypeORM DataSource를 초기화하고 연결을 설정
 * @returns 초기화된 DataSource 인스턴스
 */
export const connectDatabase = async () => {
  try {
    // DataSource 초기화
    await AppDataSource.initialize()
    console.log("✅ Database connection established successfully")
    console.log(
      `📊 Database: ${appConfig.database.database} on ${appConfig.database.host}:${appConfig.database.port}`
    )
    return AppDataSource
  } catch (error) {
    console.error("❌ Database connection failed:", error)
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
  try {
    const connection = getConnection()
    // 간단한 쿼리로 데이터베이스 응답성 확인
    await connection.query("SELECT 1")
    return {
      status: "healthy", // 정상 상태
      message: "Database is connected and responsive", // 연결됨 및 응답 가능
    }
  } catch (error) {
    return {
      status: "unhealthy", // 비정상 상태
      message: "Database connection failed", // 연결 실패
      error, // 에러 정보
    }
  }
}
