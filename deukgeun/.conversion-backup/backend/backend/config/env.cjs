// ============================================================================
// 환경 설정 - 백엔드 전용 설정
// ============================================================================
const dotenv = require('dotenv');
// 환경 변수 로드 - 여러 경로에서 시도
const path = require('path');
const fs = require('fs');
const nodeEnv = process.env.NODE_ENV || 'development';
// 현재 파일의 디렉토리에서 시작하여 프로젝트 루트를 찾음
const currentDir = __dirname;
const projectRoot = path.resolve(currentDir, '../../..'); // src/backend/config에서 프로젝트 루트로
// 환경 변수 로딩 순서: .env.local -> .env.production/.env.development -> .env -> .env.example -> env.ec2
const envPaths = [
    path.join(projectRoot, '.env.local'),
    path.join(projectRoot, nodeEnv === 'production' ? 'env.production' : '.env.development'),
    path.join(projectRoot, '.env'),
    path.join(projectRoot, 'env.example'),
    path.join(projectRoot, 'env.ec2'), // EC2 환경 변수 파일 추가
    // 상대 경로도 시도
    '.env.local',
    nodeEnv === 'production' ? 'env.production' : '.env.development',
    '.env',
    'env.example',
    'env.ec2', // EC2 환경 변수 파일 추가
    '../env.production',
    '../env.example',
    '../env.ec2', // EC2 환경 변수 파일 추가
    '../../env.production',
    '../../env.example',
    '../../env.ec2', // EC2 환경 변수 파일 추가
];
// 각 경로에서 환경 변수 로드 시도 (여러 파일을 순차적으로 로드)
let totalLoaded = 0;
const loadedFiles = [];
// 이미 로드된 환경 변수 추적
const loadedVars = new Set();
// 환경 변수 로딩 순서: .env.local -> .env.production/.env.development -> .env
for (const envPath of envPaths) {
    try {
        // 파일 존재 여부 확인
        if (fs.existsSync(envPath)) {
            const result = dotenv.config({ path: envPath, override: false });
            if (result.parsed && Object.keys(result.parsed).length > 0) {
                const newVars = Object.keys(result.parsed).filter(key => !loadedVars.has(key));
                if (newVars.length > 0) {
                    console.log(`✅ Environment variables loaded from ${envPath} (${newVars.length} new variables)`);
                    totalLoaded += newVars.length;
                    loadedFiles.push(envPath);
                    newVars.forEach(key => loadedVars.add(key));
                }
            }
        }
    }
    catch (error) {
        // 파일이 없거나 읽기 실패하면 무시하고 다음 경로 시도
        continue;
    }
}
if (totalLoaded > 0) {
    console.log(`📊 Total environment variables loaded: ${totalLoaded} from ${loadedFiles.length} file(s)`);
}
else {
    console.warn('⚠️  No environment file found. Using system environment variables only.');
}
// 환경 변수 로딩 상태 확인
console.log(`🔧 Environment: ${nodeEnv}`);
console.log(`📊 Database config: ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '3306'}`);
console.log(`👤 Database user: ${process.env.DB_USERNAME || 'root'}`);
console.log(`🔑 Database password: ${process.env.DB_PASSWORD ? '***' : 'NOT SET'}`);
// 환경 설정
const environment = process.env.NODE_ENV || "development";
// 데이터베이스 설정
const databaseConfig = {
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "3306"),
    username: process.env.DB_USERNAME || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "deukgeun_db",
    dialect: "mysql",
    synchronize: false, // 프로덕션에서는 false
    logging: environment === "development",
};
// JWT 설정
const jwtConfig = {
    secret: process.env.JWT_SECRET || "",
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    accessSecret: process.env.JWT_ACCESS_SECRET || "",
    refreshSecret: process.env.JWT_REFRESH_SECRET || "",
};
// API 키 설정
const apiKeyConfig = {
    kakao: process.env.KAKAO_API_KEY || "",
    kakaoJavascript: process.env.KAKAO_JAVASCRIPT_MAP_API_KEY || "",
    kakaoLocation: process.env.KAKAO_Location_MobileMapApiKey || "",
    kakaoRest: process.env.KAKAO_REST_MAP_API_KEY || "",
    kakaoLocationAdmin: process.env.KAKAO_Location_AdminMapKey || "",
    googlePlaces: process.env.GOOGLE_PLACES_API_KEY || "",
    googleSecureSecret: process.env.GOOGLE_secure_secret_generator || "",
    seoulOpenApi: process.env.SEOUL_OPENAPI_KEY || "",
    gymApi: process.env.VITE_GYM_API_KEY || "",
};
// 보안 설정
const securityConfig = {
    recaptchaSecret: process.env.RECAPTCHA_SECRET || "",
    recaptchaSiteKey: process.env.RECAPTCHA_SITE_KEY || "",
    accessTokenSecret: process.env.ACCESS_TOKEN_SECRET || "",
    refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET || "",
    rateLimitWindow: parseInt(process.env.RATE_LIMIT_WINDOW || "900000"), // 15분
    rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || "100"),
};
// 이메일 설정
const emailConfig = {
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: parseInt(process.env.EMAIL_PORT || "587"),
    user: process.env.EMAIL_USER || "",
    pass: process.env.EMAIL_PASS || "",
};
// SMS 설정
const smsConfig = {
    apiKey: process.env.SMS_API_KEY || "",
    apiSecret: process.env.SMS_API_SECRET || "",
    from: process.env.SMS_FROM || "",
};
// 파일 업로드 설정
const uploadConfig = {
    path: process.env.UPLOAD_PATH || "./uploads",
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || "5242880"), // 5MB
};
// 스케줄러 설정
const schedulerConfig = {
    enabled: process.env.AUTO_UPDATE_ENABLED === "true",
    jobs: [],
};
// 애플리케이션 설정
const appConfig
module.exports.appConfig = appConfig = {
    environment,
    port: parseInt(process.env.PORT || "5000"),
    jwt: jwtConfig,
    corsOrigin: process.env.CORS_ORIGIN?.split(",") || ["http://localhost:3000", "http://localhost:5173", "https://yourdomain.com", "https://www.yourdomain.com"],
    database: databaseConfig,
    apiKeys: apiKeyConfig,
    security: securityConfig,
    email: emailConfig,
    sms: smsConfig,
    upload: uploadConfig,
    scheduler: schedulerConfig,
};
// 레거시 호환성을 위한 개별 설정 내보내기
export const { PORT, NODE_ENV, DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_NAME, JWT_SECRET, JWT_EXPIRES_IN, JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, CORS_ORIGIN, KAKAO_API_KEY, KAKAO_JAVASCRIPT_MAP_API_KEY, KAKAO_Location_MobileMapApiKey, KAKAO_REST_MAP_API_KEY, KAKAO_Location_AdminMapKey, GOOGLE_PLACES_API_KEY, GOOGLE_secure_secret_generator, SEOUL_OPENAPI_KEY, VITE_GYM_API_KEY, RECAPTCHA_SECRET, RECAPTCHA_SITE_KEY, ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET, EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS, SMS_API_KEY, SMS_API_SECRET, SMS_FROM, UPLOAD_PATH, MAX_FILE_SIZE, RATE_LIMIT_WINDOW, RATE_LIMIT_MAX, AUTO_UPDATE_HOUR, AUTO_UPDATE_MINUTE, AUTO_UPDATE_ENABLED, AUTO_UPDATE_TYPE, AUTO_UPDATE_INTERVAL_DAYS, } = {
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
    CORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:3000,http://localhost:5173",
    KAKAO_API_KEY: process.env.KAKAO_API_KEY || "",
    KAKAO_JAVASCRIPT_MAP_API_KEY: process.env.KAKAO_JAVASCRIPT_MAP_API_KEY || "",
    KAKAO_Location_MobileMapApiKey: process.env.KAKAO_Location_MobileMapApiKey || "",
    KAKAO_REST_MAP_API_KEY: process.env.KAKAO_REST_MAP_API_KEY || "",
    KAKAO_Location_AdminMapKey: process.env.KAKAO_Location_AdminMapKey || "",
    GOOGLE_PLACES_API_KEY: process.env.GOOGLE_PLACES_API_KEY || "",
    GOOGLE_secure_secret_generator: process.env.GOOGLE_secure_secret_generator || "",
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
    AUTO_UPDATE_INTERVAL_DAYS: parseInt(process.env.AUTO_UPDATE_INTERVAL_DAYS || "3"),
};
// 기존 코드와의 호환성을 위해 config 별칭 제공
const config
module.exports.config = config = appConfig;
