import dotenv from "dotenv"

// 환경 변수 로드
dotenv.config()

// 앱 설정
export const appConfig = {
  environment: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT || "3000"),
  host: process.env.HOST || "localhost",

  // 데이터베이스 설정
  database: {
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432"),
    username: process.env.DB_USERNAME || "postgres",
    password: process.env.DB_PASSWORD || "password",
    database: process.env.DB_NAME || "deukgeun_db",
    synchronize: process.env.NODE_ENV === "development",
    logging: process.env.NODE_ENV === "development",
  },

  // JWT 설정
  jwt: {
    secret: process.env.JWT_SECRET || "default-secret-key",
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  },

  // API 키 설정
  apiKeys: {
    kakao: process.env.KAKAO_API_KEY,
    googlePlaces: process.env.GOOGLE_PLACES_API_KEY,
    seoulOpenApi: process.env.SEOUL_OPEN_API_KEY,
  },

  // 이메일 설정
  email: {
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || "587"),
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASSWORD,
  },

  // 파일 업로드 설정
  upload: {
    maxSize: parseInt(process.env.UPLOAD_MAX_SIZE || "10485760"), // 10MB
    allowedTypes: ["image/jpeg", "image/png", "image/gif"],
  },
}

// 데이터베이스 설정
export const databaseConfig = {
  type: "postgres" as const,
  host: appConfig.database.host,
  port: appConfig.database.port,
  username: appConfig.database.username,
  password: appConfig.database.password,
  database: appConfig.database.database,
  synchronize: appConfig.database.synchronize,
  logging: appConfig.database.logging,
  entities: ["src/**/*.entity.ts"],
  migrations: ["src/migrations/*.ts"],
  subscribers: ["src/subscribers/*.ts"],
}

// 레벨 시스템 설정
export const levelConfig = {
  // 레벨별 필요 경험치
  expRequirements: [
    0, 100, 250, 500, 800, 1200, 1700, 2300, 3000, 3800, 4700, 5700, 6800, 8000,
    9300, 10700, 12200, 13800, 15500, 17300, 19200, 21200, 23300, 25500, 27800,
    30200, 32700, 35300, 38000, 40800, 43700, 46700, 49800, 53000, 56300, 59700,
    63200, 66800, 70500, 74300, 78200, 82200, 86300, 90500, 94800, 99200,
    103700, 108300, 113000, 117800, 122700, 127700, 132800, 138000, 143300,
    148700, 154200, 159800, 165500, 171300, 177200, 183200, 189300, 195500,
    201800, 208200, 214700, 221300, 228000, 234800, 241700, 248700, 255800,
    263000, 270300, 277700, 285200, 292800, 300500, 308300, 316200, 324200,
    332300, 340500, 348800, 357200, 365700, 374300, 383000, 391800, 400700,
    409700, 418800, 428000, 437300, 446700, 456200, 465800, 475500, 485300,
    495200, 505200, 515300, 525500, 535800, 546200, 556700, 567300, 578000,
    588800,
  ],

  // 레벨별 보상
  levelRewards: {
    expBonus: 1.1, // 경험치 보너스
    badgeRewards: [5, 10, 15, 20, 25, 30, 35, 40, 45, 50], // 배지 보상 레벨
  },

  // 스트릭 보너스
  streakBonuses: {
    daily: 10,
    weekly: 50,
    monthly: 200,
  },
}

// AppDataSource 설정
export const AppDataSource = {
  type: "postgres" as const,
  host: appConfig.database.host,
  port: appConfig.database.port,
  username: appConfig.database.username,
  password: appConfig.database.password,
  database: appConfig.database.database,
  synchronize: appConfig.database.synchronize,
  logging: appConfig.database.logging,
  entities: ["src/**/*.entity.ts"],
  migrations: ["src/migrations/*.ts"],
  subscribers: ["src/subscribers/*.ts"],
}
