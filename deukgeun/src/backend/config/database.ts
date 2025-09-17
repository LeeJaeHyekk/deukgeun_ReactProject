import 'reflect-metadata'
// TypeORM DataSource 클래스 import
import { DataSource } from 'typeorm'
// 환경 변수는 이미 다른 설정 파일에서 로드됨
import dotenv from 'dotenv'
import path from 'path'
import fs from 'fs'

// 엔티티 클래스들 import - 데이터베이스 테이블과 매핑되는 클래스들
import { Post } from '../entities/Post' // 게시글 엔티티
import { Gym } from '../entities/Gym' // 헬스장 엔티티
import { User } from '../entities/User' // 사용자 엔티티
import { Machine } from '../entities/Machine' // 운동 머신 엔티티
import { Comment } from '../entities/Comment' // 댓글 엔티티
import { Like } from '../entities/Like' // 게시글 좋아요 엔티티
import { UserLevel } from '../entities/UserLevel' // 사용자 레벨 엔티티
import { ExpHistory } from '../entities/ExpHistory' // 경험치 이력 엔티티
import { UserReward } from '../entities/UserReward' // 사용자 보상 엔티티
import { Milestone } from '../entities/Milestone' // 마일스톤 엔티티
import { UserStreak } from '../entities/UserStreak' // 사용자 연속 활동 엔티티
import { WorkoutSession } from '../entities/WorkoutSession' // 운동 세션 엔티티
import { ExerciseSet } from '../entities/ExerciseSet' // 운동 세트 엔티티
import { WorkoutGoal } from '../entities/WorkoutGoal' // 운동 목표 엔티티
import { WorkoutPlan } from '../entities/WorkoutPlan' // 운동 계획 엔티티
import { WorkoutPlanExercise } from '../entities/WorkoutPlanExercise' // 운동 계획 운동 엔티티
import { WorkoutStats } from '../entities/WorkoutStats' // 운동 통계 엔티티
import { WorkoutProgress } from '../entities/WorkoutProgress' // 운동 진행 상황 엔티티
import { WorkoutReminder } from '../entities/WorkoutReminder' // 운동 알림 엔티티
import { VerificationToken } from '../entities/VerificationToken' // 이메일 인증 토큰 엔티티
import { PasswordResetToken } from '../entities/PasswordResetToken' // 비밀번호 재설정 토큰 엔티티

// 환경 변수 로드 - 데이터베이스 연결을 위해 직접 로드
const nodeEnv = process.env.NODE_ENV || 'development'

// 현재 파일의 디렉토리에서 시작하여 프로젝트 루트를 찾음
const currentDir = __dirname
const projectRoot = path.resolve(currentDir, '../../..') // src/backend/config에서 프로젝트 루트로

// 환경 변수 로딩 순서
const envPaths = [
  path.join(projectRoot, '.env.local'),
  path.join(
    projectRoot,
    nodeEnv === 'production' ? 'env.production' : '.env.development'
  ),
  path.join(projectRoot, '.env'),
  path.join(projectRoot, 'env.example'),
  // 상대 경로도 시도
  '.env.local',
  nodeEnv === 'production' ? 'env.production' : '.env.development',
  '.env',
  'env.example',
  '../env.production',
  '../env.example',
  '../../env.production',
  '../../env.example',
]

// 각 경로에서 환경 변수 로드 시도 (여러 파일을 순차적으로 로드)
let totalLoaded = 0
const loadedFiles: string[] = []

for (const envPath of envPaths) {
  try {
    if (fs.existsSync(envPath)) {
      const result = dotenv.config({ path: envPath })
      if (result.parsed && Object.keys(result.parsed).length > 0) {
        console.log(
          `✅ Database config: Environment variables loaded from ${envPath} (${Object.keys(result.parsed).length} variables)`
        )
        totalLoaded += Object.keys(result.parsed).length
        loadedFiles.push(envPath)
      }
    }
  } catch (error) {
    continue
  }
}

if (totalLoaded > 0) {
  console.log(
    `📊 Database config: Total environment variables loaded: ${totalLoaded} from ${loadedFiles.length} file(s)`
  )
} else {
  console.warn(
    '⚠️  Database config: No environment file found. Using system environment variables only.'
  )
}

// 현재 환경 설정 (기본값: development)
const environment = process.env.NODE_ENV || 'development'

/**
 * TypeORM DataSource 설정
 * 데이터베이스 연결 및 ORM 설정을 담당
 */
export const AppDataSource = new DataSource({
  // 데이터베이스 타입 설정
  type: 'mysql', // MySQL 데이터베이스 사용

  // 데이터베이스 연결 설정
  host: process.env.DB_HOST || 'localhost', // 데이터베이스 호스트
  port: parseInt(process.env.DB_PORT || '3306'), // 데이터베이스 포트
  username: process.env.DB_USERNAME || 'root', // 데이터베이스 사용자명
  password: process.env.DB_PASSWORD || '', // 데이터베이스 비밀번호
  database: process.env.DB_NAME || 'deukgeun_db', // 데이터베이스 이름

  // 스키마 자동 동기화 설정 (외래키 제약조건 문제로 인해 비활성화)
  synchronize: false,

  // SQL 쿼리 로깅 설정 (개발 환경에서만 활성화)
  logging: environment === 'development',

  // 엔티티 클래스 목록 - 데이터베이스 테이블과 매핑될 클래스들
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

  // 구독자 목록 (현재 사용하지 않음)
  subscribers: [],

  // 마이그레이션 목록 (현재 사용하지 않음)
  migrations: [],
})

/**
 * 데이터베이스 연결 함수
 * TypeORM DataSource를 초기화하고 연결을 설정
 * @returns 초기화된 DataSource 인스턴스
 */
export const connectDatabase = async () => {
  try {
    // 연결 설정 정보 로깅
    console.log('🔍 Database connection attempt:')
    console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`)
    console.log(`   Host: ${process.env.DB_HOST || 'localhost'}`)
    console.log(`   Port: ${process.env.DB_PORT || '3306'}`)
    console.log(`   Username: ${process.env.DB_USERNAME || 'root'}`)
    console.log(`   Password: ${process.env.DB_PASSWORD ? '***' : 'NOT SET'}`)
    console.log(`   Database: ${process.env.DB_NAME || 'deukgeun_db'}`)

    // 환경 변수 검증
    const requiredEnvVars = ['DB_HOST', 'DB_USERNAME', 'DB_NAME']
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName])

    if (missingVars.length > 0) {
      console.warn(
        `⚠️  Missing environment variables: ${missingVars.join(', ')}`
      )
      console.warn('   Using default values for missing variables')
    }

    // DataSource 초기화
    console.log('🔄 Initializing database connection...')
    await AppDataSource.initialize()

    console.log('✅ Database connection established successfully')
    console.log(
      `📊 Connected to: ${process.env.DB_NAME || 'deukgeun_db'} on ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '3306'}`
    )

    // 연결 상태 확인
    const connection = AppDataSource.manager.connection
    console.log(
      `🔗 Connection status: ${connection.isConnected ? 'Connected' : 'Disconnected'}`
    )

    return AppDataSource
  } catch (error) {
    console.error('❌ Database connection failed:')
    console.error('   Error details:', error)

    // 환경 변수 상태 확인
    console.error('🔍 Environment variables check:')
    console.error(`   NODE_ENV: ${process.env.NODE_ENV || 'NOT SET'}`)
    console.error(`   DB_HOST: ${process.env.DB_HOST || 'NOT SET'}`)
    console.error(`   DB_PORT: ${process.env.DB_PORT || 'NOT SET'}`)
    console.error(`   DB_USERNAME: ${process.env.DB_USERNAME || 'NOT SET'}`)
    console.error(
      `   DB_PASSWORD: ${process.env.DB_PASSWORD ? 'SET' : 'NOT SET'}`
    )
    console.error(`   DB_NAME: ${process.env.DB_NAME || 'NOT SET'}`)

    // 일반적인 연결 실패 원인 제안
    console.error('💡 Common solutions:')
    console.error('   1. Check if MySQL server is running')
    console.error('   2. Verify database credentials')
    console.error('   3. Ensure database exists')
    console.error('   4. Check network connectivity')
    console.error('   5. Verify environment variables are loaded correctly')

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
    throw new Error('Database connection is not initialized')
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
    await connection.query('SELECT 1')
    return {
      status: 'healthy', // 정상 상태
      message: 'Database is connected and responsive', // 연결됨 및 응답 가능
    }
  } catch (error) {
    return {
      status: 'unhealthy', // 비정상 상태
      message: 'Database connection failed', // 연결 실패
      error, // 에러 정보
    }
  }
}
