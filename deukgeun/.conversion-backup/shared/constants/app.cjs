// ============================================================================
// 애플리케이션 관련 상수들
// ============================================================================
// 애플리케이션 정보
const APP_INFO
module.exports.APP_INFO = APP_INFO = {
    NAME: "Deukgeun",
    VERSION: "1.0.0",
    DESCRIPTION: "헬스장 찾기 및 운동 관리 플랫폼",
    AUTHOR: "Deukgeun Team",
    WEBSITE: "https://deukgeun.com",
};
// 환경 설정
const ENV
module.exports.ENV = ENV = {
    DEVELOPMENT: "development",
    PRODUCTION: "production",
    TEST: "test",
};
// 기본 설정
const DEFAULT_CONFIG
module.exports.DEFAULT_CONFIG = DEFAULT_CONFIG = {
    PORT: 5000,
    API_BASE_URL: "http://localhost:5000",
    FRONTEND_URL: "http://localhost:5173",
    DATABASE_HOST: "localhost",
    DATABASE_PORT: 3306,
    DATABASE_NAME: "deukgeun_db",
    JWT_EXPIRES_IN: "7d",
    CORS_ORIGIN: "http://localhost:5173",
    UPLOAD_PATH: "./uploads",
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
    RATE_LIMIT_WINDOW: 15 * 60 * 1000, // 15분
    RATE_LIMIT_MAX: 100,
};
// 파일 업로드 설정
const UPLOAD_CONFIG
module.exports.UPLOAD_CONFIG = UPLOAD_CONFIG = {
    ALLOWED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/gif", "image/webp"],
    ALLOWED_VIDEO_TYPES: ["video/mp4", "video/webm", "video/ogg"],
    MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
    MAX_VIDEO_SIZE: 50 * 1024 * 1024, // 50MB
    IMAGE_QUALITY: 0.8,
    THUMBNAIL_SIZE: 300,
};
// 보안 설정
const SECURITY_CONFIG
module.exports.SECURITY_CONFIG = SECURITY_CONFIG = {
    PASSWORD_MIN_LENGTH: 8,
    PASSWORD_MAX_LENGTH: 128,
    SESSION_TIMEOUT: 30 * 60 * 1000, // 30분
    MAX_LOGIN_ATTEMPTS: 5,
    LOCKOUT_DURATION: 15 * 60 * 1000, // 15분
    TOKEN_REFRESH_THRESHOLD: 5 * 60 * 1000, // 5분
};
// 페이지네이션 설정
const PAGINATION_CONFIG
module.exports.PAGINATION_CONFIG = PAGINATION_CONFIG = {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100,
    MIN_LIMIT: 1,
};
// 캐시 설정
const CACHE_CONFIG
module.exports.CACHE_CONFIG = CACHE_CONFIG = {
    DEFAULT_TTL: 5 * 60 * 1000, // 5분
    USER_PROFILE_TTL: 10 * 60 * 1000, // 10분
    GYM_LIST_TTL: 30 * 60 * 1000, // 30분
    MACHINE_LIST_TTL: 60 * 60 * 1000, // 1시간
    MAX_CACHE_SIZE: 100 * 1024 * 1024, // 100MB
};
// 알림 설정
const NOTIFICATION_CONFIG
module.exports.NOTIFICATION_CONFIG = NOTIFICATION_CONFIG = {
    MAX_NOTIFICATIONS: 100,
    NOTIFICATION_TTL: 30 * 24 * 60 * 60 * 1000, // 30일
    PUSH_ENABLED: true,
    EMAIL_ENABLED: true,
    SMS_ENABLED: false,
};
// 검색 설정
const SEARCH_CONFIG
module.exports.SEARCH_CONFIG = SEARCH_CONFIG = {
    MIN_QUERY_LENGTH: 2,
    MAX_QUERY_LENGTH: 100,
    MAX_SEARCH_RESULTS: 50,
    SEARCH_DELAY: 300, // 300ms
    FUZZY_SEARCH_THRESHOLD: 0.8,
};
// 지도 설정
const MAP_CONFIG
module.exports.MAP_CONFIG = MAP_CONFIG = {
    DEFAULT_ZOOM: 13,
    MIN_ZOOM: 10,
    MAX_ZOOM: 18,
    DEFAULT_CENTER: {
        lat: 37.5665,
        lng: 126.978,
    }, // 서울 시청
    SEARCH_RADIUS: 5000, // 5km
    MAX_SEARCH_RADIUS: 50000, // 50km
};
// 운동 설정
const WORKOUT_CONFIG
module.exports.WORKOUT_CONFIG = WORKOUT_CONFIG = {
    MAX_SESSION_DURATION: 4 * 60 * 60 * 1000, // 4시간
    MIN_SESSION_DURATION: 5 * 60 * 1000, // 5분
    MAX_SETS_PER_EXERCISE: 20,
    MAX_REPS_PER_SET: 1000,
    MAX_WEIGHT: 1000, // kg
    MAX_REST_TIME: 30 * 60, // 30분
    DEFAULT_REST_TIME: 60, // 1분
};
// 레벨 시스템 설정
const LEVEL_CONFIG
module.exports.LEVEL_CONFIG = LEVEL_CONFIG = {
    MAX_LEVEL: 100,
    BASE_EXP_REQUIRED: 100,
    EXP_MULTIPLIER: 1.5,
    MAX_DAILY_EXP: 1000,
    STREAK_BONUS: 0.1, // 10% 보너스
    MILESTONE_BONUS: 0.5, // 50% 보너스
};
// 커뮤니티 설정
const COMMUNITY_CONFIG
module.exports.COMMUNITY_CONFIG = COMMUNITY_CONFIG = {
    MAX_POST_LENGTH: 10000,
    MAX_COMMENT_LENGTH: 1000,
    MAX_TAGS_PER_POST: 10,
    MAX_IMAGES_PER_POST: 10,
    SPAM_THRESHOLD: 5,
    MODERATION_ENABLED: true,
};
// 헬스장 설정
const GYM_CONFIG
module.exports.GYM_CONFIG = GYM_CONFIG = {
    MAX_REVIEW_LENGTH: 2000,
    MAX_RATING: 5,
    MIN_RATING: 1,
    MAX_IMAGES_PER_GYM: 20,
    VERIFICATION_THRESHOLD: 3,
    AUTO_APPROVAL_ENABLED: false,
};
// 기계 설정
const MACHINE_CONFIG
module.exports.MACHINE_CONFIG = MACHINE_CONFIG = {
    MAX_NAME_LENGTH: 100,
    MAX_DESCRIPTION_LENGTH: 1000,
    MAX_INSTRUCTIONS_LENGTH: 2000,
    MAX_TARGET_MUSCLES: 10,
    MAX_IMAGES_PER_MACHINE: 10,
    MAX_VIDEOS_PER_MACHINE: 5,
};
// 통계 설정
const STATS_CONFIG
module.exports.STATS_CONFIG = STATS_CONFIG = {
    DATA_RETENTION_DAYS: 365,
    AGGREGATION_INTERVAL: 24 * 60 * 60 * 1000, // 24시간
    MAX_DATA_POINTS: 1000,
    AUTO_CLEANUP_ENABLED: true,
};
// 성능 설정
const PERFORMANCE_CONFIG
module.exports.PERFORMANCE_CONFIG = PERFORMANCE_CONFIG = {
    REQUEST_TIMEOUT: 30000, // 30초
    CONNECTION_TIMEOUT: 10000, // 10초
    MAX_CONCURRENT_REQUESTS: 100,
    RATE_LIMIT_ENABLED: true,
    COMPRESSION_ENABLED: true,
};
// 로깅 설정
const LOGGING_CONFIG
module.exports.LOGGING_CONFIG = LOGGING_CONFIG = {
    LEVEL: "info",
    MAX_LOG_SIZE: 10 * 1024 * 1024, // 10MB
    MAX_LOG_FILES: 5,
    LOG_TO_FILE: true,
    LOG_TO_CONSOLE: true,
    LOG_REQUESTS: true,
    LOG_ERRORS: true,
};
// 개발 도구 설정
const DEV_CONFIG
module.exports.DEV_CONFIG = DEV_CONFIG = {
    HOT_RELOAD_ENABLED: true,
    DEBUG_MODE: true,
    MOCK_DATA_ENABLED: false,
    API_DOCS_ENABLED: true,
    HEALTH_CHECK_ENABLED: true,
};
