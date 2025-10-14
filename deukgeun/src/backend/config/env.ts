// ============================================================================
// 환경 설정 - 백엔드 전용 설정 (ESM 최적화)
// ============================================================================

import * as dotenv from "dotenv"
import type {
  AppConfig,
  Environment,
  DatabaseConfig,
  JWTConfig,
  ApiKeyConfig,
  SecurityConfig,
  EmailConfig,
  SMSConfig,
  UploadConfig,
  SchedulerConfig,
} from "../types"

import * as path from 'path'
import * as fs from 'fs'
import { fileURLToPath } from 'url'

const nodeEnv = process.env.NODE_ENV || 'development'

// ESM에서 __dirname 안전하게 처리
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 프로젝트 루트 경로 계산
const projectRoot = path.resolve(__dirname, '../../..')

// 환경 변수 로딩 - 단순화된 단일 경로 방식
function loadEnvironmentVariables() {
  console.log("=".repeat(60))
  console.log("🔧 ENVIRONMENT VARIABLES LOADING DEBUG START")
  console.log("=".repeat(60))
  
  console.log(`🔧 Current environment: ${nodeEnv}`)
  console.log(`🔧 Project root: ${projectRoot}`)
  
  // 우선순위에 따른 단일 경로 선택
  const envPaths = [
    path.join(projectRoot, '.env.local'),
    path.join(projectRoot, '.env'),
    path.join(projectRoot, nodeEnv === 'production' ? 'env.production' : 'env.development'),
    '.env.local',
    '.env'
  ]

  console.log("🔄 Step 1: Checking environment file paths...")
  for (let i = 0; i < envPaths.length; i++) {
    const envPath = envPaths[i]
    const exists = fs.existsSync(envPath)
    console.log(`   ${i + 1}. ${envPath} - ${exists ? '✅ EXISTS' : '❌ NOT FOUND'}`)
  }

  console.log("🔄 Step 2: Attempting to load environment files...")
  for (let i = 0; i < envPaths.length; i++) {
    const envPath = envPaths[i]
    if (fs.existsSync(envPath)) {
      try {
        console.log(`   🔄 Loading: ${envPath}`)
        const result = dotenv.config({ path: envPath })
        if (result.parsed && Object.keys(result.parsed).length > 0) {
          console.log(`   ✅ Successfully loaded ${Object.keys(result.parsed).length} variables from ${envPath}`)
          console.log(`   📊 Loaded variables:`, Object.keys(result.parsed))
          
          console.log("=".repeat(60))
          console.log("✅ ENVIRONMENT VARIABLES LOADING SUCCESSFUL")
          console.log("=".repeat(60))
          console.log(`📁 File: ${envPath}`)
          console.log(`📊 Variables count: ${Object.keys(result.parsed).length}`)
          console.log("=".repeat(60))
          
          return { success: true, path: envPath, count: Object.keys(result.parsed).length }
        } else {
          console.log(`   ⚠️ File exists but no variables parsed: ${envPath}`)
        }
      } catch (error) {
        console.warn(`   ❌ Failed to load ${envPath}:`, error)
        continue
      }
    }
  }

  console.log("=".repeat(60))
  console.log("⚠️ ENVIRONMENT VARIABLES LOADING WARNING")
  console.log("=".repeat(60))
  console.log("⚠️ No environment file found. Using system environment variables only.")
  console.log("🔧 Available system environment variables:")
  
  // 시스템 환경 변수 중 중요한 것들만 표시
  const importantVars = [
    'NODE_ENV', 'PORT', 'DB_HOST', 'DB_PORT', 'DB_USERNAME', 'DB_PASSWORD', 
    'DB_NAME', 'JWT_SECRET', 'CORS_ORIGIN'
  ]
  
  importantVars.forEach(varName => {
    const value = process.env[varName]
    console.log(`   - ${varName}: ${value ? (varName.includes('PASSWORD') || varName.includes('SECRET') ? '***' : value) : 'NOT SET'}`)
  })
  
  console.log("=".repeat(60))
  console.log("⚠️ ENVIRONMENT VARIABLES LOADING DEBUG END")
  console.log("=".repeat(60))
  
  return { success: false, path: null, count: 0 }
}

// 환경 변수 로딩 실행
const envLoadResult = loadEnvironmentVariables()

// 환경 변수 로딩 상태 확인
console.log(`🔧 Environment: ${nodeEnv}`)
console.log(
  `📊 Database config: ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '3306'}`
)
console.log(`👤 Database user: ${process.env.DB_USERNAME || 'root'}`)
console.log(
  `🔑 Database password: ${process.env.DB_PASSWORD ? '***' : 'NOT SET'}`
)

// 안전한 환경 변수 파싱 함수
function safeParseInt(value: string | undefined, defaultValue: number, name: string): number {
  if (!value) return defaultValue
  const parsed = parseInt(value, 10)
  if (isNaN(parsed)) {
    console.warn(`⚠️ Invalid ${name} value: "${value}". Using default: ${defaultValue}`)
    return defaultValue
  }
  return parsed
}

// 환경 설정 - 실제 환경 변수 기반 설정
const environment: Environment = (process.env.NODE_ENV as Environment) || "development"

// 데이터베이스 설정
const databaseConfig: DatabaseConfig = {
  host: process.env.DB_HOST || "localhost",
  port: safeParseInt(process.env.DB_PORT, 3306, "DB_PORT"),
  username: process.env.DB_USERNAME || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_DATABASE || process.env.DB_NAME || "deukgeun_db",
  dialect: "mysql",
  synchronize: false, // 프로덕션에서는 false
  logging: environment === "development",
}

// JWT 설정
const jwtConfig: JWTConfig = {
  secret: process.env.JWT_SECRET || "",
  expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  accessSecret: process.env.JWT_ACCESS_SECRET || "",
  refreshSecret: process.env.JWT_REFRESH_SECRET || "",
}

// API 키 설정
const apiKeyConfig: ApiKeyConfig = {
  kakao: process.env.KAKAO_API_KEY || "",
  kakaoJavascript: process.env.KAKAO_JAVASCRIPT_MAP_API_KEY || "",
  kakaoLocation: process.env.KAKAO_Location_MobileMapApiKey || "",
  kakaoRest: process.env.KAKAO_REST_MAP_API_KEY || "",
  kakaoLocationAdmin: process.env.KAKAO_Location_AdminMapKey || "",
  googlePlaces: process.env.GOOGLE_PLACES_API_KEY || "",
  googleSecureSecret: process.env.GOOGLE_secure_secret_generator || "",
  seoulOpenApi: process.env.SEOUL_OPENAPI_KEY || "",
  gymApi: process.env.VITE_GYM_API_KEY || "",
}

// 보안 설정
const securityConfig: SecurityConfig = {
  recaptchaSecret: process.env.RECAPTCHA_SECRET || "",
  recaptchaSiteKey: process.env.RECAPTCHA_SITE_KEY || "",
  accessTokenSecret: process.env.ACCESS_TOKEN_SECRET || "",
  refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET || "",
  rateLimitWindow: safeParseInt(process.env.RATE_LIMIT_WINDOW, 900000, "RATE_LIMIT_WINDOW"), // 15분
  rateLimitMax: safeParseInt(process.env.RATE_LIMIT_MAX, 100, "RATE_LIMIT_MAX"),
}

// 이메일 설정
const emailConfig: EmailConfig = {
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: safeParseInt(process.env.EMAIL_PORT, 587, "EMAIL_PORT"),
  user: process.env.EMAIL_USER || "",
  pass: process.env.EMAIL_PASS || "",
}

// SMS 설정
const smsConfig: SMSConfig = {
  apiKey: process.env.SMS_API_KEY || "",
  apiSecret: process.env.SMS_API_SECRET || "",
  from: process.env.SMS_FROM || "",
}

// 파일 업로드 설정
const uploadConfig: UploadConfig = {
  path: process.env.UPLOAD_PATH || "./uploads",
  maxFileSize: safeParseInt(process.env.MAX_FILE_SIZE, 5242880, "MAX_FILE_SIZE"), // 5MB
}

// 스케줄러 설정
const schedulerConfig: SchedulerConfig = {
  enabled: process.env.AUTO_UPDATE_ENABLED === "true",
  jobs: [],
}

// 애플리케이션 설정
export const appConfig: AppConfig = {
  environment,
  port: safeParseInt(process.env.PORT, 5000, "PORT"),
  jwt: jwtConfig,
  corsOrigin: process.env.CORS_ORIGIN?.split(",").filter(origin => origin.trim() !== "") || [
    "http://localhost:3000",
    "http://localhost:5173", 
    "http://localhost:5000",
    "http://localhost:5001",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5000",
    "http://127.0.0.1:5001",
  ],
  database: databaseConfig,
  apiKeys: apiKeyConfig,
  security: securityConfig,
  email: emailConfig,
  sms: smsConfig,
  upload: uploadConfig,
  scheduler: schedulerConfig,
}

// 레거시 호환성을 위한 개별 설정 내보내기
export const {
  PORT,
  NODE_ENV,
  DB_HOST,
  DB_PORT,
  DB_USERNAME,
  DB_PASSWORD,
  DB_DATABASE,
  JWT_SECRET,
  JWT_EXPIRES_IN,
  JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET,
  CORS_ORIGIN,
  KAKAO_API_KEY,
  KAKAO_JAVASCRIPT_MAP_API_KEY,
  KAKAO_Location_MobileMapApiKey,
  KAKAO_REST_MAP_API_KEY,
  KAKAO_Location_AdminMapKey,
  GOOGLE_PLACES_API_KEY,
  GOOGLE_secure_secret_generator,
  SEOUL_OPENAPI_KEY,
  VITE_GYM_API_KEY,
  RECAPTCHA_SECRET,
  RECAPTCHA_SITE_KEY,
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET,
  EMAIL_HOST,
  EMAIL_PORT,
  EMAIL_USER,
  EMAIL_PASS,
  SMS_API_KEY,
  SMS_API_SECRET,
  SMS_FROM,
  UPLOAD_PATH,
  MAX_FILE_SIZE,
  RATE_LIMIT_WINDOW,
  RATE_LIMIT_MAX,
  AUTO_UPDATE_HOUR,
  AUTO_UPDATE_MINUTE,
  AUTO_UPDATE_ENABLED,
  AUTO_UPDATE_TYPE,
  AUTO_UPDATE_INTERVAL_DAYS,
} = {
  PORT: process.env.PORT || "5000",
  NODE_ENV: process.env.NODE_ENV || "development",
  DB_HOST: process.env.DB_HOST || "localhost",
  DB_PORT: safeParseInt(process.env.DB_PORT, 3306, "DB_PORT"),
  DB_USERNAME: process.env.DB_USERNAME || "root",
  DB_PASSWORD: process.env.DB_PASSWORD || "",
  DB_DATABASE: process.env.DB_DATABASE || process.env.DB_NAME || "deukgeun_db",
  JWT_SECRET: process.env.JWT_SECRET || "your-secret-key",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || "your-access-secret",
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || "your-refresh-secret",
  CORS_ORIGIN: process.env.CORS_ORIGIN || "",
  KAKAO_API_KEY: process.env.KAKAO_API_KEY || "",
  KAKAO_JAVASCRIPT_MAP_API_KEY: process.env.KAKAO_JAVASCRIPT_MAP_API_KEY || "",
  KAKAO_Location_MobileMapApiKey:
    process.env.KAKAO_Location_MobileMapApiKey || "",
  KAKAO_REST_MAP_API_KEY: process.env.KAKAO_REST_MAP_API_KEY || "",
  KAKAO_Location_AdminMapKey: process.env.KAKAO_Location_AdminMapKey || "",
  GOOGLE_PLACES_API_KEY: process.env.GOOGLE_PLACES_API_KEY || "",
  GOOGLE_secure_secret_generator:
    process.env.GOOGLE_secure_secret_generator || "",
  SEOUL_OPENAPI_KEY: process.env.SEOUL_OPENAPI_KEY || "",
  VITE_GYM_API_KEY: process.env.VITE_GYM_API_KEY || "",
  RECAPTCHA_SECRET: process.env.RECAPTCHA_SECRET || "",
  RECAPTCHA_SITE_KEY: process.env.RECAPTCHA_SITE_KEY || "",
  ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET || "yourAccessSecret",
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET || "yourRefreshSecret",
  EMAIL_HOST: process.env.EMAIL_HOST || "smtp.gmail.com",
  EMAIL_PORT: safeParseInt(process.env.EMAIL_PORT, 587, "EMAIL_PORT"),
  EMAIL_USER: process.env.EMAIL_USER || "",
  EMAIL_PASS: process.env.EMAIL_PASS || "",
  SMS_API_KEY: process.env.SMS_API_KEY || "",
  SMS_API_SECRET: process.env.SMS_API_SECRET || "",
  SMS_FROM: process.env.SMS_FROM || "",
  UPLOAD_PATH: process.env.UPLOAD_PATH || "./uploads",
  MAX_FILE_SIZE: safeParseInt(process.env.MAX_FILE_SIZE, 5242880, "MAX_FILE_SIZE"),
  RATE_LIMIT_WINDOW: safeParseInt(process.env.RATE_LIMIT_WINDOW, 900000, "RATE_LIMIT_WINDOW"),
  RATE_LIMIT_MAX: safeParseInt(process.env.RATE_LIMIT_MAX, 100, "RATE_LIMIT_MAX"),
  AUTO_UPDATE_HOUR: safeParseInt(process.env.AUTO_UPDATE_HOUR, 6, "AUTO_UPDATE_HOUR"),
  AUTO_UPDATE_MINUTE: safeParseInt(process.env.AUTO_UPDATE_MINUTE, 0, "AUTO_UPDATE_MINUTE"),
  AUTO_UPDATE_ENABLED: process.env.AUTO_UPDATE_ENABLED === "true",
  AUTO_UPDATE_TYPE: process.env.AUTO_UPDATE_TYPE || "enhanced",
  AUTO_UPDATE_INTERVAL_DAYS: safeParseInt(process.env.AUTO_UPDATE_INTERVAL_DAYS, 3, "AUTO_UPDATE_INTERVAL_DAYS"),
}

// 기존 코드와의 호환성을 위해 config 별칭 제공
export const config = appConfig

// 환경 변수 검증 함수 (async 처리)
export async function validateEnvironmentVariables() {
  console.log("=".repeat(60))
  console.log("🔧 ENVIRONMENT VARIABLES VALIDATION DEBUG START")
  console.log("=".repeat(60))
  
  try {
    console.log("🔄 Step 1: Validating critical environment variables...")
    
    const criticalVars = {
      NODE_ENV: process.env.NODE_ENV || 'development',
      PORT: process.env.PORT || '5000',
      DB_HOST: process.env.DB_HOST || 'localhost',
      DB_PORT: process.env.DB_PORT || '3306',
      DB_USERNAME: process.env.DB_USERNAME || 'root',
      DB_PASSWORD: process.env.DB_PASSWORD || '',
      DB_DATABASE: process.env.DB_DATABASE || process.env.DB_NAME || 'deukgeun_db',
      JWT_SECRET: process.env.JWT_SECRET || '',
      CORS_ORIGIN: process.env.CORS_ORIGIN || ''
    }
    
    console.log("📊 Critical variables status:")
    Object.entries(criticalVars).forEach(([key, value]) => {
      const isSet = value && value !== ''
      const displayValue = key.includes('PASSWORD') || key.includes('SECRET') ? 
        (isSet ? '***' : 'NOT SET') : 
        (isSet ? value : 'NOT SET')
      console.log(`   - ${key}: ${displayValue} ${isSet ? '✅' : '⚠️'}`)
    })
    
    console.log("🔄 Step 2: Checking optional environment variables...")
    const optionalVars = {
      KAKAO_API_KEY: process.env.KAKAO_API_KEY || '',
      GOOGLE_PLACES_API_KEY: process.env.GOOGLE_PLACES_API_KEY || '',
      EMAIL_HOST: process.env.EMAIL_HOST || '',
      EMAIL_USER: process.env.EMAIL_USER || '',
      SMS_API_KEY: process.env.SMS_API_KEY || ''
    }
    
    console.log("📊 Optional variables status:")
    Object.entries(optionalVars).forEach(([key, value]) => {
      const isSet = value && value !== ''
      console.log(`   - ${key}: ${isSet ? 'SET ✅' : 'NOT SET ⚠️'}`)
    })
    
    console.log("🔄 Step 3: Validating database configuration...")
    const dbConfig = {
      host: criticalVars.DB_HOST,
      port: parseInt(criticalVars.DB_PORT),
      username: criticalVars.DB_USERNAME,
      password: criticalVars.DB_PASSWORD,
      database: criticalVars.DB_DATABASE
    }
    
    console.log("📊 Database configuration:")
    console.log(`   - Host: ${dbConfig.host}`)
    console.log(`   - Port: ${dbConfig.port}`)
    console.log(`   - Username: ${dbConfig.username}`)
    console.log(`   - Password: ${dbConfig.password ? '***' : 'NOT SET'}`)
    console.log(`   - Database: ${dbConfig.database}`)
    
    console.log("🔄 Step 4: Validating JWT configuration...")
    const jwtConfig = {
      secret: criticalVars.JWT_SECRET,
      hasSecret: !!criticalVars.JWT_SECRET
    }
    
    console.log("📊 JWT configuration:")
    console.log(`   - Secret: ${jwtConfig.hasSecret ? 'SET ✅' : 'NOT SET ⚠️'}`)
    
    if (!jwtConfig.hasSecret) {
      console.warn("⚠️ WARNING: JWT_SECRET is not set. This may cause authentication issues.")
    }
    
    console.log("🔄 Step 5: Validating CORS configuration...")
    const corsOrigins = criticalVars.CORS_ORIGIN ? 
      criticalVars.CORS_ORIGIN.split(',').filter(origin => origin.trim() !== '') : 
      []
    
    console.log("📊 CORS configuration:")
    console.log(`   - Origins: ${corsOrigins.length > 0 ? corsOrigins.join(', ') : 'DEFAULT (localhost ports)'}`)
    
    console.log("=".repeat(60))
    console.log("✅ ENVIRONMENT VARIABLES VALIDATION SUCCESSFUL")
    console.log("=".repeat(60))
    console.log(`📊 Database: ${criticalVars.DB_HOST}:${criticalVars.DB_PORT}`)
    console.log(`🔑 JWT Secret: ${jwtConfig.hasSecret ? 'Set' : 'Not set'}`)
    console.log(`🌐 Port: ${criticalVars.PORT}`)
    console.log(`🌍 Environment: ${criticalVars.NODE_ENV}`)
    console.log("=".repeat(60))
    
  } catch (error) {
    console.log("=".repeat(60))
    console.log("❌ ENVIRONMENT VARIABLES VALIDATION FAILED")
    console.log("=".repeat(60))
    console.warn('⚠️ Environment validation failed:', error)
    console.log("=".repeat(60))
    // 검증 실패해도 서버는 계속 실행
  }
}

// 환경 설정 로드 완료 로깅을 함수로 분리
export function logConfigInfo() {
  console.log(`🔧 Backend 환경 설정 로드 완료:`)
  console.log(`   - 환경: ${config.environment}`)
  console.log(`   - 포트: ${config.port}`)
  console.log(`   - CORS Origins: ${config.corsOrigin.length > 0 ? config.corsOrigin.join(', ') : '설정되지 않음'}`)
  console.log(`   - 데이터베이스: ${config.database.host}:${config.database.port}`)
  console.log(`   - JWT 만료시간: ${config.jwt.expiresIn}`)
  console.log(`🔧 환경 설정 로드 완료 - startServer() 호출 준비`)
}
