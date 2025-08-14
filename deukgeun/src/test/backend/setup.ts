// Backend 테스트 환경 설정
const dotenv = require("dotenv")
const path = require("path")
const { DataSource } = require("typeorm")

// 테스트 환경 변수 로드
dotenv.config({ path: path.resolve(process.cwd(), "env.test.example") })

// 테스트 환경 변수 설정
process.env.NODE_ENV = "test"
process.env.DB_HOST = "localhost"
process.env.DB_PORT = "3306"
process.env.DB_USERNAME = "root"
process.env.DB_PASSWORD = ""
process.env.DB_NAME = "deukgeun_test_db"
process.env.JWT_SECRET = "test-secret-key"
process.env.JWT_ACCESS_SECRET = "test-access-secret"
process.env.JWT_REFRESH_SECRET = "test-refresh-secret"
process.env.CORS_ORIGIN = "http://localhost:5173"
process.env.PORT = "5001"
process.env.EMAIL_HOST = "smtp.gmail.com"
process.env.EMAIL_PORT = "587"
process.env.EMAIL_USER = "test@example.com"
process.env.EMAIL_PASS = "test-password"
process.env.RECAPTCHA_SECRET = "test-recaptcha-secret"
process.env.RECAPTCHA_SITE_KEY = "test-recaptcha-site-key"
process.env.KAKAO_API_KEY = "test-kakao-api-key"
process.env.KAKAO_JAVASCRIPT_MAP_API_KEY = "test-kakao-javascript-key"
process.env.KAKAO_REST_MAP_API_KEY = "test-kakao-rest-key"
process.env.GOOGLE_PLACES_API_KEY = "test-google-places-key"
process.env.SEOUL_OPENAPI_KEY = "test-seoul-openapi-key"
process.env.VITE_GYM_API_KEY = "test-gym-api-key"
process.env.SMS_API_KEY = "test-sms-api-key"
process.env.SMS_API_SECRET = "test-sms-api-secret"
process.env.SMS_FROM = "test-sms-from"
process.env.UPLOAD_PATH = "./test-uploads"
process.env.MAX_FILE_SIZE = "5242880"
process.env.RATE_LIMIT_WINDOW = "900000"
process.env.RATE_LIMIT_MAX = "100"
process.env.AUTO_UPDATE_HOUR = "6"
process.env.AUTO_UPDATE_MINUTE = "0"
process.env.AUTO_UPDATE_ENABLED = "false"
process.env.AUTO_UPDATE_TYPE = "enhanced"
process.env.AUTO_UPDATE_INTERVAL_DAYS = "3"

// 테스트용 데이터베이스 설정
const testDataSource = new DataSource({
  type: "mysql",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "3306"),
  username: process.env.DB_USERNAME || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "deukgeun_test_db",
  synchronize: true,
  logging: false,
  entities: ["src/backend/entities/**/*.ts"],
  migrations: ["src/backend/migrations/**/*.ts"],
  subscribers: ["src/backend/subscribers/**/*.ts"],
})

// 테스트 타임아웃 설정
jest.setTimeout(30000)

// 테스트 실패 시 스택 트레이스 개선
Error.stackTraceLimit = Infinity

// 전역 테스트 설정
beforeAll(async () => {
  // 테스트 시작 시 로그
  console.log("🧪 Backend test environment initialized")

  // 데이터베이스 연결은 선택적으로만 시도
  try {
    if (!testDataSource.isInitialized) {
      await testDataSource.initialize()
    }

    // 테스트 데이터베이스 초기화
    await testDataSource.synchronize(true)
  } catch (error: any) {
    console.log(
      "⚠️ Database connection failed (this is expected for some tests):",
      error?.message || error
    )
  }
})

afterAll(async () => {
  // 테스트 데이터베이스 연결 종료
  try {
    if (testDataSource.isInitialized) {
      await testDataSource.destroy()
    }
  } catch (error: any) {
    console.log("⚠️ Database cleanup failed:", error?.message || error)
  }

  // 테스트 종료 시 로그
  console.log("✅ Backend tests completed")
})

// 각 테스트 후 데이터베이스 정리 (선택적)
afterEach(async () => {
  try {
    if (testDataSource.isInitialized) {
      // 모든 테이블 데이터 삭제
      const entities = testDataSource.entityMetadatas
      for (const entity of entities) {
        const repository = testDataSource.getRepository(entity.name)
        await repository.clear()
      }
    }
  } catch (error: any) {
    // 데이터베이스 정리 실패는 무시
  }
})

// 테스트 환경 확인
if (process.env.NODE_ENV !== "test") {
  throw new Error("Tests must be run in test environment")
}

// ES Module export
export { testDataSource }

// CommonJS export
module.exports = { testDataSource }
