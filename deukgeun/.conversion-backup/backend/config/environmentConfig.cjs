"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = exports.AUTO_UPDATE_INTERVAL_DAYS = exports.AUTO_UPDATE_TYPE = exports.AUTO_UPDATE_ENABLED = exports.AUTO_UPDATE_MINUTE = exports.AUTO_UPDATE_HOUR = exports.RATE_LIMIT_MAX = exports.RATE_LIMIT_WINDOW = exports.MAX_FILE_SIZE = exports.UPLOAD_PATH = exports.SMS_FROM = exports.SMS_API_SECRET = exports.SMS_API_KEY = exports.EMAIL_PASS = exports.EMAIL_USER = exports.EMAIL_PORT = exports.EMAIL_HOST = exports.REFRESH_TOKEN_SECRET = exports.ACCESS_TOKEN_SECRET = exports.RECAPTCHA_SITE_KEY = exports.RECAPTCHA_SECRET = exports.VITE_GYM_API_KEY = exports.SEOUL_OPENAPI_KEY = exports.GOOGLE_secure_secret_generator = exports.GOOGLE_PLACES_API_KEY = exports.KAKAO_Location_AdminMapKey = exports.KAKAO_REST_MAP_API_KEY = exports.KAKAO_Location_MobileMapApiKey = exports.KAKAO_JAVASCRIPT_MAP_API_KEY = exports.KAKAO_API_KEY = exports.CORS_ORIGIN = exports.JWT_REFRESH_SECRET = exports.JWT_ACCESS_SECRET = exports.JWT_EXPIRES_IN = exports.JWT_SECRET = exports.DB_DATABASE = exports.DB_PASSWORD = exports.DB_USERNAME = exports.DB_PORT = exports.DB_HOST = exports.NODE_ENV = exports.PORT = exports.appConfig = void 0;
exports.validateEnvironmentVariables = validateEnvironmentVariables;
exports.logConfigInfo = logConfigInfo;
const dotenv = __importStar(require("dotenv"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const pathUtils_1 = require("../utils/pathUtils.cjs");
const nodeEnv = process.env.NODE_ENV || 'development';
// __dirname is automatically available in CommonJS
const backendDir = path.resolve(__dirname, '..');
const projectRoot = path.resolve(__dirname, '../../..');
function loadEnvironmentVariables() {
    console.log("=".repeat(60));
    console.log("🔧 ENVIRONMENT VARIABLES LOADING DEBUG START");
    console.log("=".repeat(60));
    console.log(`🔧 Current environment: ${nodeEnv}`);
    console.log(`🔧 Backend directory: ${backendDir}`);
    console.log(`🔧 Project root: ${projectRoot}`);
    const envPaths = [
        path.join(backendDir, '.env.local'),
        path.join(backendDir, '.env'),
        path.join(backendDir, nodeEnv === 'production' ? 'env.production' : 'env.development'),
        path.join(projectRoot, '.env.local'),
        path.join(projectRoot, '.env'),
        path.join(projectRoot, nodeEnv === 'production' ? 'env.production' : 'env.development'),
        '.env.local',
        '.env'
    ];
    console.log("🔄 Step 1: Checking environment file paths...");
    for (let i = 0; i < envPaths.length; i++) {
        const envPath = envPaths[i];
        const exists = fs.existsSync(envPath);
        console.log(`   ${i + 1}. ${envPath} - ${exists ? '✅ EXISTS' : '❌ NOT FOUND'}`);
    }
    console.log("🔄 Step 2: Attempting to load environment files...");
    for (let i = 0; i < envPaths.length; i++) {
        const envPath = envPaths[i];
        if (fs.existsSync(envPath)) {
            try {
                console.log(`   🔄 Loading: ${envPath}`);
                const result = dotenv.config({ path: envPath });
                if (result.parsed && Object.keys(result.parsed).length > 0) {
                    console.log(`   ✅ Successfully loaded ${Object.keys(result.parsed).length} variables from ${envPath}`);
                    console.log(`   📊 Loaded variables:`, Object.keys(result.parsed));
                    console.log("=".repeat(60));
                    console.log("✅ ENVIRONMENT VARIABLES LOADING SUCCESSFUL");
                    console.log("=".repeat(60));
                    console.log(`📁 File: ${envPath}`);
                    console.log(`📊 Variables count: ${Object.keys(result.parsed).length}`);
                    console.log("=".repeat(60));
                    return { success: true, path: envPath, count: Object.keys(result.parsed).length };
                }
                else {
                    console.log(`   ⚠️ File exists but no variables parsed: ${envPath}`);
                }
            }
            catch (error) {
                console.warn(`   ❌ Failed to load ${envPath}:`, error);
                continue;
            }
        }
    }
    console.log("=".repeat(60));
    console.log("⚠️ ENVIRONMENT VARIABLES LOADING WARNING");
    console.log("=".repeat(60));
    console.log("⚠️ No environment file found. Using system environment variables and defaults.");
    console.log("🔧 Available system environment variables:");
    const importantVars = [
        'NODE_ENV', 'PORT', 'DB_HOST', 'DB_PORT', 'DB_USERNAME', 'DB_PASSWORD',
        'DB_NAME', 'JWT_SECRET', 'CORS_ORIGIN'
    ];
    importantVars.forEach(varName => {
        const value = process.env[varName];
        console.log(`   - ${varName}: ${value ? (varName.includes('PASSWORD') || varName.includes('SECRET') ? '***' : value) : 'NOT SET'}`);
    });
    console.log("💡 Using default values for missing environment variables");
    console.log("=".repeat(60));
    console.log("⚠️ ENVIRONMENT VARIABLES LOADING DEBUG END");
    console.log("=".repeat(60));
    return { success: false, path: null, count: 0 };
}
const envLoadResult = loadEnvironmentVariables();
console.log(`🔧 Environment: ${nodeEnv}`);
console.log(`📊 Database config: ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '3306'}`);
console.log(`👤 Database user: ${process.env.DB_USERNAME || 'root'}`);
console.log(`🔑 Database password: ${process.env.DB_PASSWORD ? '***' : 'NOT SET'}`);
function safeParseInt(value, defaultValue, name) {
    if (!value)
        return defaultValue;
    const parsed = parseInt(value, 10);
    if (isNaN(parsed)) {
        console.warn(`⚠️ Invalid ${name} value: "${value}". Using default: ${defaultValue}`);
        return defaultValue;
    }
    return parsed;
}
const environment = process.env.NODE_ENV || "development";
const databaseConfig = {
    host: process.env.DB_HOST || "localhost",
    port: safeParseInt(process.env.DB_PORT, 3306, "DB_PORT"),
    username: process.env.DB_USERNAME || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_DATABASE || process.env.DB_NAME || "deukgeun_db",
    dialect: "mysql",
    synchronize: false,
    logging: environment === "development",
};
const jwtConfig = {
    secret: process.env.JWT_SECRET || "",
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    accessSecret: process.env.JWT_ACCESS_SECRET || "",
    refreshSecret: process.env.JWT_REFRESH_SECRET || "",
};
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
    naverClientId: process.env.NAVER_CLIENT_ID || "",
    naverClientSecret: process.env.NAVER_CLIENT_SECRET || "",
    daumApiKey: process.env.DAUM_API_KEY || "",
    facebookAccessToken: process.env.FACEBOOK_ACCESS_TOKEN || "",
    instagramAccessToken: process.env.INSTAGRAM_ACCESS_TOKEN || "",
    twitterBearerToken: process.env.TWITTER_BEARER_TOKEN || "",
    sportsDataApiKey: process.env.SPORTS_DATA_API_KEY || "",
};
const securityConfig = {
    recaptchaSecret: process.env.RECAPTCHA_SECRET || "",
    recaptchaSiteKey: process.env.RECAPTCHA_SITE_KEY || "",
    accessTokenSecret: process.env.ACCESS_TOKEN_SECRET || "",
    refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET || "",
    rateLimitWindow: safeParseInt(process.env.RATE_LIMIT_WINDOW, 900000, "RATE_LIMIT_WINDOW"),
    rateLimitMax: safeParseInt(process.env.RATE_LIMIT_MAX, 100, "RATE_LIMIT_MAX"),
};
const emailConfig = {
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: safeParseInt(process.env.EMAIL_PORT, 587, "EMAIL_PORT"),
    user: process.env.EMAIL_USER || "",
    pass: process.env.EMAIL_PASS || "",
};
const smsConfig = {
    apiKey: process.env.SMS_API_KEY || "",
    apiSecret: process.env.SMS_API_SECRET || "",
    from: process.env.SMS_FROM || "",
};
const uploadConfig = {
    path: process.env.UPLOAD_PATH || "./uploads",
    maxFileSize: safeParseInt(process.env.MAX_FILE_SIZE, 5242880, "MAX_FILE_SIZE"),
};
const schedulerConfig = {
    enabled: process.env.AUTO_UPDATE_ENABLED === "true",
    jobs: [],
};
exports.appConfig = {
    environment,
    port: safeParseInt(process.env.PORT, 5000, "PORT"),
    jwt: jwtConfig,
    corsOrigin: process.env.CORS_ORIGIN?.split(",").filter(origin => origin.trim() !== "") || [
        "https://devtrail.net",
        "https://www.devtrail.net",
        "http://43.203.30.167:3000",
        "http://43.203.30.167:5000",
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
};
_a = {
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
}, exports.PORT = _a.PORT, exports.NODE_ENV = _a.NODE_ENV, exports.DB_HOST = _a.DB_HOST, exports.DB_PORT = _a.DB_PORT, exports.DB_USERNAME = _a.DB_USERNAME, exports.DB_PASSWORD = _a.DB_PASSWORD, exports.DB_DATABASE = _a.DB_DATABASE, exports.JWT_SECRET = _a.JWT_SECRET, exports.JWT_EXPIRES_IN = _a.JWT_EXPIRES_IN, exports.JWT_ACCESS_SECRET = _a.JWT_ACCESS_SECRET, exports.JWT_REFRESH_SECRET = _a.JWT_REFRESH_SECRET, exports.CORS_ORIGIN = _a.CORS_ORIGIN, exports.KAKAO_API_KEY = _a.KAKAO_API_KEY, exports.KAKAO_JAVASCRIPT_MAP_API_KEY = _a.KAKAO_JAVASCRIPT_MAP_API_KEY, exports.KAKAO_Location_MobileMapApiKey = _a.KAKAO_Location_MobileMapApiKey, exports.KAKAO_REST_MAP_API_KEY = _a.KAKAO_REST_MAP_API_KEY, exports.KAKAO_Location_AdminMapKey = _a.KAKAO_Location_AdminMapKey, exports.GOOGLE_PLACES_API_KEY = _a.GOOGLE_PLACES_API_KEY, exports.GOOGLE_secure_secret_generator = _a.GOOGLE_secure_secret_generator, exports.SEOUL_OPENAPI_KEY = _a.SEOUL_OPENAPI_KEY, exports.VITE_GYM_API_KEY = _a.VITE_GYM_API_KEY, exports.RECAPTCHA_SECRET = _a.RECAPTCHA_SECRET, exports.RECAPTCHA_SITE_KEY = _a.RECAPTCHA_SITE_KEY, exports.ACCESS_TOKEN_SECRET = _a.ACCESS_TOKEN_SECRET, exports.REFRESH_TOKEN_SECRET = _a.REFRESH_TOKEN_SECRET, exports.EMAIL_HOST = _a.EMAIL_HOST, exports.EMAIL_PORT = _a.EMAIL_PORT, exports.EMAIL_USER = _a.EMAIL_USER, exports.EMAIL_PASS = _a.EMAIL_PASS, exports.SMS_API_KEY = _a.SMS_API_KEY, exports.SMS_API_SECRET = _a.SMS_API_SECRET, exports.SMS_FROM = _a.SMS_FROM, exports.UPLOAD_PATH = _a.UPLOAD_PATH, exports.MAX_FILE_SIZE = _a.MAX_FILE_SIZE, exports.RATE_LIMIT_WINDOW = _a.RATE_LIMIT_WINDOW, exports.RATE_LIMIT_MAX = _a.RATE_LIMIT_MAX, exports.AUTO_UPDATE_HOUR = _a.AUTO_UPDATE_HOUR, exports.AUTO_UPDATE_MINUTE = _a.AUTO_UPDATE_MINUTE, exports.AUTO_UPDATE_ENABLED = _a.AUTO_UPDATE_ENABLED, exports.AUTO_UPDATE_TYPE = _a.AUTO_UPDATE_TYPE, exports.AUTO_UPDATE_INTERVAL_DAYS = _a.AUTO_UPDATE_INTERVAL_DAYS;
exports.config = exports.appConfig;
async function validateEnvironmentVariables() {
    console.log("=".repeat(60));
    console.log("🔧 ENVIRONMENT VARIABLES VALIDATION DEBUG START");
    console.log("=".repeat(60));
    try {
        console.log("🔄 Step 1: Validating critical environment variables...");
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
        };
        console.log("📊 Critical variables status:");
        Object.entries(criticalVars).forEach(([key, value]) => {
            const isSet = value && value !== '';
            const displayValue = key.includes('PASSWORD') || key.includes('SECRET') ?
                (isSet ? '***' : 'NOT SET') :
                (isSet ? value : 'NOT SET');
            console.log(`   - ${key}: ${displayValue} ${isSet ? '✅' : '⚠️'}`);
        });
        console.log("🔄 Step 2: Checking optional environment variables...");
        const optionalVars = {
            KAKAO_API_KEY: process.env.KAKAO_API_KEY || '',
            GOOGLE_PLACES_API_KEY: process.env.GOOGLE_PLACES_API_KEY || '',
            EMAIL_HOST: process.env.EMAIL_HOST || '',
            EMAIL_USER: process.env.EMAIL_USER || '',
            SMS_API_KEY: process.env.SMS_API_KEY || ''
        };
        console.log("📊 Optional variables status:");
        Object.entries(optionalVars).forEach(([key, value]) => {
            const isSet = value && value !== '';
            console.log(`   - ${key}: ${isSet ? 'SET ✅' : 'NOT SET ⚠️'}`);
        });
        console.log("🔄 Step 3: Validating database configuration...");
        const dbConfig = {
            host: criticalVars.DB_HOST,
            port: parseInt(criticalVars.DB_PORT),
            username: criticalVars.DB_USERNAME,
            password: criticalVars.DB_PASSWORD,
            database: criticalVars.DB_DATABASE
        };
        console.log("📊 Database configuration:");
        console.log(`   - Host: ${dbConfig.host}`);
        console.log(`   - Port: ${dbConfig.port}`);
        console.log(`   - Username: ${dbConfig.username}`);
        console.log(`   - Password: ${dbConfig.password ? '***' : 'NOT SET'}`);
        console.log(`   - Database: ${dbConfig.database}`);
        console.log("🔄 Step 4: Validating JWT configuration...");
        const jwtConfig = {
            secret: criticalVars.JWT_SECRET,
            hasSecret: !!criticalVars.JWT_SECRET
        };
        console.log("📊 JWT configuration:");
        console.log(`   - Secret: ${jwtConfig.hasSecret ? 'SET ✅' : 'NOT SET ⚠️'}`);
        if (!jwtConfig.hasSecret) {
            console.warn("⚠️ WARNING: JWT_SECRET is not set. This may cause authentication issues.");
        }
        console.log("🔄 Step 5: Validating CORS configuration...");
        const corsOrigins = criticalVars.CORS_ORIGIN ?
            criticalVars.CORS_ORIGIN.split(',').filter(origin => origin.trim() !== '') :
            [];
        console.log("📊 CORS configuration:");
        console.log(`   - Origins: ${corsOrigins.length > 0 ? corsOrigins.join(', ') : 'DEFAULT (localhost ports)'}`);
        console.log("=".repeat(60));
        console.log("✅ ENVIRONMENT VARIABLES VALIDATION SUCCESSFUL");
        console.log("=".repeat(60));
        console.log(`📊 Database: ${criticalVars.DB_HOST}:${criticalVars.DB_PORT}`);
        console.log(`🔑 JWT Secret: ${jwtConfig.hasSecret ? 'Set' : 'Not set'}`);
        console.log(`🌐 Port: ${criticalVars.PORT}`);
        console.log(`🌍 Environment: ${criticalVars.NODE_ENV}`);
        console.log("=".repeat(60));
    }
    catch (error) {
        console.log("=".repeat(60));
        console.log("❌ ENVIRONMENT VARIABLES VALIDATION FAILED");
        console.log("=".repeat(60));
        console.warn('⚠️ Environment validation failed:', error);
        console.log("=".repeat(60));
    }
}
function logConfigInfo() {
    console.log(`🔧 Backend 환경 설정 로드 완료:`);
    console.log(`   - 환경: ${exports.config.environment}`);
    console.log(`   - 포트: ${exports.config.port}`);
    console.log(`   - CORS Origins: ${exports.config.corsOrigin.length > 0 ? exports.config.corsOrigin.join(', ') : '설정되지 않음'}`);
    console.log(`   - 데이터베이스: ${exports.config.database.host}:${exports.config.database.port}`);
    console.log(`   - JWT 만료시간: ${exports.config.jwt.expiresIn}`);
    console.log(`🔧 환경 설정 로드 완료 - startServer() 호출 준비`);
}
