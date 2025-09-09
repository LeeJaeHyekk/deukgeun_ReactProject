// ============================================================================
// 환경 설정 파일 - 타입 오류 수정
// ============================================================================

import dotenv from "dotenv"
import type {
  Environment,
  AppConfig,
  DatabaseConfig,
  JWTConfig,
  ApiKeyConfig,
  SecurityConfig,
  EmailConfig,
  SMSConfig,
  UploadConfig,
  SchedulerConfig,
} from "../types/index.js"

// 환경 변수 로드
dotenv.config({ path: ".env.production" })
dotenv.config({ path: ".env" })

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
  synchronize: false, // 프로덕션에서는 false
  logging: environment === "development",
  entities: ["src/entities/**/*.ts"],
  migrations: ["src/migrations/**/*.ts"],
  subscribers: ["src/subscribers/**/*.ts"],
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
  secure: false,
  auth: {
    user: process.env.EMAIL_USER || "",
    pass: process.env.EMAIL_PASS || "",
  },
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
  interval: parseInt(process.env.AUTO_UPDATE_INTERVAL || "86400000"), // 24시간
  jobs: [],
}

// 애플리케이션 설정
export const appConfig: AppConfig = {
  environment,
  port: parseInt(process.env.PORT || "5000"),
  jwt: jwtConfig,
  corsOrigin: process.env.CORS_ORIGIN?.split(",") || [
    "http://localhost:3000",
    "http://localhost:5173",
    "https://yourdomain.com",
    "https://www.yourdomain.com",
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
  DB_NAME,
  JWT_SECRET,
  JWT_EXPIRES_IN,
  JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET,
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
  RATE_LIMIT_WINDOW,
  RATE_LIMIT_MAX,
  EMAIL_HOST,
  EMAIL_PORT,
  EMAIL_USER,
  EMAIL_PASS,
  SMS_API_KEY,
  SMS_API_SECRET,
  SMS_FROM,
  UPLOAD_PATH,
  MAX_FILE_SIZE,
  AUTO_UPDATE_ENABLED,
  AUTO_UPDATE_INTERVAL,
} = process.env

// 환경별 설정
export const isDevelopment = environment === "development"
export const isProduction = environment === "production"
export const isTest = environment === "test"

// 데이터베이스 연결 문자열
export const databaseUrl = `mysql://${databaseConfig.username}:${databaseConfig.password}@${databaseConfig.host}:${databaseConfig.port}/${databaseConfig.database}`

// CORS 설정
export const corsOptions = {
  origin: appConfig.corsOrigin,
  credentials: true,
  optionsSuccessStatus: 200,
}

// JWT 토큰 설정
export const jwtOptions = {
  expiresIn: jwtConfig.expiresIn,
  issuer: "deukgeun-app",
  audience: "deukgeun-users",
}

// 보안 설정
export const securityOptions = {
  rateLimit: {
    windowMs: securityConfig.rateLimitWindow,
    max: securityConfig.rateLimitMax,
    message: "너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.",
  },
  helmet: {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
  },
}

// 로깅 설정
export const logConfig = {
  level: isDevelopment ? "debug" : "info",
  format: isDevelopment ? "dev" : "combined",
  transports: ["console", "file"],
}

// 파일 업로드 설정
export const uploadOptions = {
  dest: uploadConfig.path,
  limits: {
    fileSize: uploadConfig.maxFileSize,
    files: 10,
  },
  fileFilter: (req: any, file: any, cb: any) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "video/mp4"]
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error("지원하지 않는 파일 형식입니다."), false)
    }
  },
}

// 이메일 설정
export const emailOptions = {
  host: emailConfig.host,
  port: emailConfig.port,
  secure: emailConfig.secure,
  auth: emailConfig.auth,
  tls: {
    rejectUnauthorized: false,
  },
}

// SMS 설정
export const smsOptions = {
  apiKey: smsConfig.apiKey,
  apiSecret: smsConfig.apiSecret,
  from: smsConfig.from,
}

// 스케줄러 설정
export const schedulerOptions = {
  enabled: schedulerConfig.enabled,
  interval: schedulerConfig.interval,
  jobs: schedulerConfig.jobs,
}

// 환경 변수 검증
export const validateEnvironment = () => {
  const requiredVars = [
    "DB_HOST",
    "DB_USERNAME",
    "DB_PASSWORD",
    "DB_NAME",
    "JWT_SECRET",
    "JWT_ACCESS_SECRET",
    "JWT_REFRESH_SECRET",
  ]

  const missingVars = requiredVars.filter(varName => !process.env[varName])

  if (missingVars.length > 0) {
    throw new Error(
      `필수 환경 변수가 누락되었습니다: ${missingVars.join(", ")}`
    )
  }

  return true
}

// TypeORM DataSource 설정
import { DataSource } from "typeorm"

export const AppDataSource = new DataSource({
  type: "mysql",
  host: appConfig.database.host,
  port: appConfig.database.port,
  username: appConfig.database.username,
  password: appConfig.database.password,
  database: appConfig.database.database,
  synchronize: appConfig.database.synchronize,
  logging: appConfig.database.logging,
  entities: ["src/domains/**/entities/*.ts", "src/entities/*.ts"],
  migrations: ["src/migrations/*.ts"],
  subscribers: ["src/subscribers/*.ts"],
})

// 설정 내보내기
export default appConfig
