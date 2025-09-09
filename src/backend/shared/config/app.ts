// ============================================================================
// 백엔드 애플리케이션 설정
// ============================================================================

import { config as dotenvConfig } from "dotenv"

type Environment = "development" | "production" | "test"

interface DatabaseConfig {
  host: string
  port: number
  username: string
  password: string
  database: string
  synchronize: boolean
  logging: boolean
}

interface AppConfig {
  environment: Environment
  port: number
  jwt: {
    secret: string
    expiresIn: string
    accessSecret: string
    refreshSecret: string
  }
  corsOrigin: string[]
  database: DatabaseConfig
  apiKeys: {
    kakao: string
    kakaoJavascript: string
    kakaoLocation: string
    kakaoRest: string
    kakaoLocationAdmin: string
    googlePlaces: string
    googleSecureSecret: string
    seoulOpenApi: string
    gymApi: string
  }
  security: {
    recaptchaSecret: string
    recaptchaSiteKey: string
    accessTokenSecret: string
    refreshTokenSecret: string
    rateLimitWindow: number
    rateLimitMax: number
  }
  email: {
    host: string
    port: number
    user: string
    pass: string
  }
  sms: {
    apiKey: string
    apiSecret: string
    from: string
  }
  upload: {
    path: string
    maxFileSize: number
  }
  scheduler: {
    autoUpdateHour: number
    autoUpdateMinute: number
    autoUpdateEnabled: boolean
    autoUpdateType: string
    autoUpdateIntervalDays: number
  }
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
  corsOrigin: process.env.CORS_ORIGIN?.split(",") || [
    "https://yourdomain.com",
    "https://www.yourdomain.com",
  ],
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

export default appConfig
