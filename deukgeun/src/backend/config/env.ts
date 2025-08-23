// ============================================================================
// 환경 설정 - 백엔드 전용 설정
// ============================================================================

import dotenv from "dotenv"
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

// 환경 변수 로드
dotenv.config()

// 환경 설정
const environment: Environment =
  (process.env.NODE_ENV as Environment) || "development"

// 데이터베이스 설정
const databaseConfig: DatabaseConfig = {
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "3306"),
  username: process.env.DB_USERNAME || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "deukgeun_db",
  dialect: "mysql",
  synchronize: environment === "development",
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
  rateLimitWindow: parseInt(process.env.RATE_LIMIT_WINDOW || "900000"), // 15분
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || "100"),
}

// 이메일 설정
const emailConfig: EmailConfig = {
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: parseInt(process.env.EMAIL_PORT || "587"),
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
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || "5242880"), // 5MB
}

// 스케줄러 설정
const schedulerConfig: SchedulerConfig = {
  enabled: process.env.AUTO_UPDATE_ENABLED === "true",
  jobs: [],
}

// 애플리케이션 설정
export const appConfig: AppConfig = {
  environment,
  port: parseInt(process.env.PORT || "5000"),
  jwt: jwtConfig,
  corsOrigin: process.env.CORS_ORIGIN?.split(",") || ["http://localhost:5173"],
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
  DB_NAME,
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
  DB_PORT: parseInt(process.env.DB_PORT || "3306"),
  DB_USERNAME: process.env.DB_USERNAME || "root",
  DB_PASSWORD: process.env.DB_PASSWORD || "",
  DB_NAME: process.env.DB_NAME || "deukgeun_db",
  JWT_SECRET: process.env.JWT_SECRET || "your-secret-key",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || "your-access-secret",
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || "your-refresh-secret",
  CORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:5173",
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
  EMAIL_PORT: parseInt(process.env.EMAIL_PORT || "587"),
  EMAIL_USER: process.env.EMAIL_USER || "",
  EMAIL_PASS: process.env.EMAIL_PASS || "",
  SMS_API_KEY: process.env.SMS_API_KEY || "",
  SMS_API_SECRET: process.env.SMS_API_SECRET || "",
  SMS_FROM: process.env.SMS_FROM || "",
  UPLOAD_PATH: process.env.UPLOAD_PATH || "./uploads",
  MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE || "5242880"),
  RATE_LIMIT_WINDOW: parseInt(process.env.RATE_LIMIT_WINDOW || "900000"),
  RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX || "100"),
  AUTO_UPDATE_HOUR: parseInt(process.env.AUTO_UPDATE_HOUR || "6"),
  AUTO_UPDATE_MINUTE: parseInt(process.env.AUTO_UPDATE_MINUTE || "0"),
  AUTO_UPDATE_ENABLED: process.env.AUTO_UPDATE_ENABLED === "true",
  AUTO_UPDATE_TYPE: process.env.AUTO_UPDATE_TYPE || "enhanced",
  AUTO_UPDATE_INTERVAL_DAYS: parseInt(
    process.env.AUTO_UPDATE_INTERVAL_DAYS || "3"
  ),
}

// 기존 코드와의 호환성을 위해 config 별칭 제공
export const config = appConfig
