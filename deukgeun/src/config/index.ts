// ============================================================================
// 중앙 설정 관리 시스템
// ============================================================================

import { config as dotenvConfig } from "dotenv"

interface AppConfig {
  // 임시 타입 정의
  [key: string]: any
}

type Environment = "development" | "production" | "test"

interface DatabaseConfig {
  // 임시 타입 정의
  [key: string]: any
}

// 환경 변수 로드 - 프로덕션 우선
dotenvConfig({ path: ".env.production" })
dotenvConfig()

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
  synchronize: environment === "development",
  logging: environment === "development",
}

// 애플리케이션 설정
export const appConfig: AppConfig = {
  environment,
  port: parseInt(process.env.PORT || "3000"),
  jwt: {
    secret: process.env.JWT_SECRET || "",
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    accessSecret: process.env.JWT_ACCESS_SECRET || "",
    refreshSecret: process.env.JWT_REFRESH_SECRET || "",
  },
  corsOrigin: process.env.CORS_ORIGIN?.split(",") || [],
  database: databaseConfig,
  apiKeys: {
    kakao: process.env.KAKAO_API_KEY || "",
    kakaoJavascript: process.env.KAKAO_JAVASCRIPT_KEY || "",
    kakaoLocation: process.env.KAKAO_LOCATION_KEY || "",
    kakaoRest: process.env.KAKAO_REST_API_KEY || "",
    kakaoLocationAdmin: process.env.KAKAO_LOCATION_ADMIN_KEY || "",
    googlePlaces: process.env.GOOGLE_PLACES_API_KEY || "",
    googleSecureSecret: process.env.GOOGLE_SECURE_SECRET || "",
    seoulOpenApi: process.env.SEOUL_OPENAPI_KEY || "",
    gymApi: process.env.GYM_API_KEY || "",
  },
  security: {
    recaptchaSecret: process.env.RECAPTCHA_SECRET || "",
    recaptchaSiteKey: process.env.RECAPTCHA_SITE_KEY || "",
    accessTokenSecret: process.env.JWT_ACCESS_SECRET || "",
    refreshTokenSecret: process.env.JWT_REFRESH_SECRET || "",
    rateLimitWindow: parseInt(process.env.RATE_LIMIT_WINDOW || "900000"),
    rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || "100"),
  },
  email: {
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: parseInt(process.env.EMAIL_PORT || "587"),
    user: process.env.EMAIL_USER || "",
    pass: process.env.EMAIL_PASS || "",
  },
  sms: {
    apiKey: process.env.SMS_API_KEY || "",
    apiSecret: process.env.SMS_API_SECRET || "",
    from: process.env.SMS_FROM || "",
  },
  upload: {
    path: process.env.UPLOAD_PATH || "./uploads",
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || "5242880"),
  },
  scheduler: {
    autoUpdateHour: parseInt(process.env.AUTO_UPDATE_HOUR || "2"),
    autoUpdateMinute: parseInt(process.env.AUTO_UPDATE_MINUTE || "0"),
    autoUpdateEnabled: process.env.AUTO_UPDATE_ENABLED === "true",
    autoUpdateType: process.env.AUTO_UPDATE_TYPE || "daily",
    autoUpdateIntervalDays: parseInt(
      process.env.AUTO_UPDATE_INTERVAL_DAYS || "1"
    ),
  },
}

// 레벨 시스템 설정
export const levelConfig = {
  // 레벨별 필요 경험치 (기본 공식: level * 100)
  getRequiredExp: (level: number): number => level * 100,

  // 최대 레벨
  maxLevel: 100,

  // 경험치 획득 설정
  expGains: {
    login: 10,
    post: 50,
    comment: 20,
    like: 5,
    workout: 100,
    milestone: 200,
  },

  // 보상 설정
  rewards: {
    levelUp: {
      type: "badge",
      name: "Level Up",
      description: "레벨업 달성!",
    },
    milestone: {
      type: "achievement",
      name: "Milestone",
      description: "목표 달성!",
    },
  },
}

// 워크아웃 설정
export const workoutConfig = {
  // 기본 워크아웃 설정
  defaultSets: 3,
  defaultReps: 10,
  defaultWeight: 0,

  // 목표 설정
  goals: {
    strength: "strength",
    endurance: "endurance",
    muscle: "muscle",
    weightLoss: "weightLoss",
  },

  // 운동 강도 설정
  intensity: {
    low: 0.6,
    medium: 0.8,
    high: 1.0,
  },
}

// 커뮤니티 설정
export const communityConfig = {
  // 게시글 설정
  posts: {
    maxLength: 1000,
    maxImages: 5,
    maxTags: 10,
  },

  // 댓글 설정
  comments: {
    maxLength: 500,
    maxDepth: 3,
  },

  // 좋아요 설정
  likes: {
    maxPerUser: 100,
    cooldown: 1000, // 1초
  },
}

// 보안 설정
export const securityConfig = {
  // JWT 설정
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || "",
    refreshSecret: process.env.JWT_REFRESH_SECRET || "",
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  },

  // reCAPTCHA 설정
  recaptcha: {
    secret: process.env.RECAPTCHA_SECRET || "",
    siteKey: process.env.RECAPTCHA_SITE_KEY || "",
  },

  // 레이트 리미팅 설정
  rateLimit: {
    window: parseInt(process.env.RATE_LIMIT_WINDOW || "900000"), // 15분
    max: parseInt(process.env.RATE_LIMIT_MAX || "100"),
  },

  // 비밀번호 설정
  password: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: false,
  },
}

// 이메일 설정
export const emailConfig = {
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: parseInt(process.env.EMAIL_PORT || "587"),
  user: process.env.EMAIL_USER || "",
  pass: process.env.EMAIL_PASS || "",
  from: process.env.EMAIL_FROM || "noreply@deukgeun.com",
  replyTo: process.env.EMAIL_REPLY_TO || "support@deukgeun.com",
}

// 푸시 알림 설정
export const pushConfig = {
  vapidPublicKey: process.env.VAPID_PUBLIC_KEY || "",
  vapidPrivateKey: process.env.VAPID_PRIVATE_KEY || "",
}

// API 키 설정
export const apiKeyConfig = {
  kakao: {
    apiKey: process.env.KAKAO_API_KEY || "",
    restApiKey: process.env.KAKAO_REST_API_KEY || "",
  },
  google: {
    placesApiKey: process.env.GOOGLE_PLACES_API_KEY || "",
  },
  seoul: {
    openApiKey: process.env.SEOUL_OPENAPI_KEY || "",
  },
}

// 로깅 설정
export const loggingConfig = {
  level: process.env.LOG_LEVEL || "info",
  enableDebug: process.env.ENABLE_DEBUG === "true",
  enablePerformanceMonitoring:
    process.env.ENABLE_PERFORMANCE_MONITORING === "true",
}

// 개발 도구 설정
export const devConfig = {
  enableDebug: process.env.ENABLE_DEBUG === "true",
  enablePerformanceMonitoring:
    process.env.ENABLE_PERFORMANCE_MONITORING === "true",
  enableHotReload: false, // 프로덕션에서는 비활성화
}

// 전체 설정 내보내기
export const appSettings = {
  app: appConfig,
  level: levelConfig,
  workout: workoutConfig,
  community: communityConfig,
  security: securityConfig,
  email: emailConfig,
  push: pushConfig,
  apiKeys: apiKeyConfig,
  logging: loggingConfig,
  dev: devConfig,
}

// 레거시 호환성을 위한 config 별칭
export const config = appSettings
