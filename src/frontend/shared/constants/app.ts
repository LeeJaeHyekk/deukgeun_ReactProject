// ============================================================================
// Frontend 앱 상수들
// ============================================================================

// 앱 정보
export const APP_INFO = {
  NAME: "득근득근",
  VERSION: "1.0.0",
  DESCRIPTION: "과거의 나를 뛰어넘는 것이 진정한 성장이다",
  TAGLINE: "당신의 건강한 변화를 응원합니다",
  AUTHOR: "득근득근 팀",
  WEBSITE: "https://deukgeun.com",
  SUPPORT_EMAIL: "support@deukgeun.com",
  PRIVACY_POLICY_URL: "/privacy",
  TERMS_OF_SERVICE_URL: "/terms",
} as const

// 앱 테마
export const APP_THEMES = {
  LIGHT: "light",
  DARK: "dark",
  SYSTEM: "system",
} as const

export const APP_THEME_LABELS = {
  [APP_THEMES.LIGHT]: "라이트 모드",
  [APP_THEMES.DARK]: "다크 모드",
  [APP_THEMES.SYSTEM]: "시스템 설정",
} as const

// 앱 언어
export const APP_LANGUAGES = {
  KO: "ko",
  EN: "en",
} as const

export const APP_LANGUAGE_LABELS = {
  [APP_LANGUAGES.KO]: "한국어",
  [APP_LANGUAGES.EN]: "English",
} as const

// 앱 설정
export const APP_SETTINGS = {
  THEME: "theme",
  LANGUAGE: "language",
  NOTIFICATIONS: "notifications",
  SOUND: "sound",
  VIBRATION: "vibration",
  AUTO_SAVE: "auto_save",
  PRIVACY: "privacy",
} as const

// 앱 상태
export const APP_STATES = {
  IDLE: "idle",
  LOADING: "loading",
  SUCCESS: "success",
  ERROR: "error",
  OFFLINE: "offline",
} as const

// 앱 이벤트
export const APP_EVENTS = {
  THEME_CHANGED: "theme_changed",
  LANGUAGE_CHANGED: "language_changed",
  USER_LOGIN: "user_login",
  USER_LOGOUT: "user_logout",
  WORKOUT_STARTED: "workout_started",
  WORKOUT_COMPLETED: "workout_completed",
  GOAL_ACHIEVED: "goal_achieved",
  LEVEL_UP: "level_up",
  ACHIEVEMENT_UNLOCKED: "achievement_unlocked",
} as const

// 앱 메타데이터
export const APP_METADATA = {
  TITLE: "득근득근 - 헬스장 찾기 & 운동 기록",
  DESCRIPTION:
    "내 주변 헬스장을 찾고, 운동을 기록하며, 건강한 변화를 만들어보세요",
  KEYWORDS: "헬스장, 운동, 피트니스, 헬스, 운동기구, 운동일지, 커뮤니티",
  OG_TITLE: "득근득근 - 헬스장 찾기 & 운동 기록",
  OG_DESCRIPTION:
    "내 주변 헬스장을 찾고, 운동을 기록하며, 건강한 변화를 만들어보세요",
  OG_IMAGE: "/img/og-image.png",
  TWITTER_CARD: "summary_large_image",
  TWITTER_SITE: "@deukgeun",
} as const

// 앱 기능 플래그
export const APP_FEATURES = {
  GYM_FINDER: "gym_finder",
  MACHINE_GUIDE: "machine_guide",
  WORKOUT_JOURNAL: "workout_journal",
  COMMUNITY: "community",
  LEVEL_SYSTEM: "level_system",
  ACHIEVEMENTS: "achievements",
  NOTIFICATIONS: "notifications",
  OFFLINE_MODE: "offline_mode",
  DARK_MODE: "dark_mode",
  MULTI_LANGUAGE: "multi_language",
} as const

// 앱 권한
export const APP_PERMISSIONS = {
  LOCATION: "location",
  CAMERA: "camera",
  MICROPHONE: "microphone",
  NOTIFICATIONS: "notifications",
  STORAGE: "storage",
  CONTACTS: "contacts",
} as const

// 앱 권한 라벨
export const APP_PERMISSION_LABELS = {
  [APP_PERMISSIONS.LOCATION]: "위치 정보",
  [APP_PERMISSIONS.CAMERA]: "카메라",
  [APP_PERMISSIONS.MICROPHONE]: "마이크",
  [APP_PERMISSIONS.NOTIFICATIONS]: "알림",
  [APP_PERMISSIONS.STORAGE]: "저장소",
  [APP_PERMISSIONS.CONTACTS]: "연락처",
} as const

// 앱 권한 설명
export const APP_PERMISSION_DESCRIPTIONS = {
  [APP_PERMISSIONS.LOCATION]:
    "내 주변 헬스장을 찾기 위해 위치 정보가 필요합니다",
  [APP_PERMISSIONS.CAMERA]: "프로필 사진 촬영을 위해 카메라 접근이 필요합니다",
  [APP_PERMISSIONS.MICROPHONE]:
    "음성 메모 기능을 위해 마이크 접근이 필요합니다",
  [APP_PERMISSIONS.NOTIFICATIONS]:
    "운동 알림을 받기 위해 알림 권한이 필요합니다",
  [APP_PERMISSIONS.STORAGE]: "앱 데이터 저장을 위해 저장소 접근이 필요합니다",
  [APP_PERMISSIONS.CONTACTS]: "친구 초대 기능을 위해 연락처 접근이 필요합니다",
} as const

// 앱 에러 코드
export const APP_ERROR_CODES = {
  NETWORK_ERROR: "NETWORK_ERROR",
  AUTH_ERROR: "AUTH_ERROR",
  PERMISSION_ERROR: "PERMISSION_ERROR",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  SERVER_ERROR: "SERVER_ERROR",
  UNKNOWN_ERROR: "UNKNOWN_ERROR",
} as const

// 앱 에러 메시지
export const APP_ERROR_MESSAGES = {
  [APP_ERROR_CODES.NETWORK_ERROR]: "네트워크 연결을 확인해주세요",
  [APP_ERROR_CODES.AUTH_ERROR]: "인증에 실패했습니다",
  [APP_ERROR_CODES.PERMISSION_ERROR]: "권한이 필요합니다",
  [APP_ERROR_CODES.VALIDATION_ERROR]: "입력값을 확인해주세요",
  [APP_ERROR_CODES.SERVER_ERROR]: "서버 오류가 발생했습니다",
  [APP_ERROR_CODES.UNKNOWN_ERROR]: "알 수 없는 오류가 발생했습니다",
} as const

// 앱 성능 지표
export const APP_PERFORMANCE = {
  LOAD_TIME: "load_time",
  RENDER_TIME: "render_time",
  API_RESPONSE_TIME: "api_response_time",
  MEMORY_USAGE: "memory_usage",
  CPU_USAGE: "cpu_usage",
} as const

// 앱 분석 이벤트
export const APP_ANALYTICS_EVENTS = {
  PAGE_VIEW: "page_view",
  BUTTON_CLICK: "button_click",
  FORM_SUBMIT: "form_submit",
  SEARCH: "search",
  FILTER: "filter",
  SORT: "sort",
  SHARE: "share",
  DOWNLOAD: "download",
  UPLOAD: "upload",
  ERROR: "error",
} as const

// 앱 캐시 설정
export const APP_CACHE = {
  API_CACHE_DURATION: 5 * 60 * 1000, // 5분
  IMAGE_CACHE_DURATION: 24 * 60 * 60 * 1000, // 24시간
  STATIC_CACHE_DURATION: 7 * 24 * 60 * 60 * 1000, // 7일
  USER_DATA_CACHE_DURATION: 30 * 60 * 1000, // 30분
} as const

// 앱 스토리지 키
export const APP_STORAGE_KEYS = {
  USER_PREFERENCES: "user_preferences",
  THEME: "theme",
  LANGUAGE: "language",
  NOTIFICATIONS: "notifications",
  WORKOUT_DATA: "workout_data",
  GYM_DATA: "gym_data",
  MACHINE_DATA: "machine_data",
  CACHE: "cache",
  OFFLINE_DATA: "offline_data",
} as const

// 앱 업데이트 설정
export const APP_UPDATE = {
  CHECK_INTERVAL: 24 * 60 * 60 * 1000, // 24시간
  FORCE_UPDATE_VERSION: "1.0.0",
  MIN_SUPPORTED_VERSION: "1.0.0",
} as const

// 앱 보안 설정
export const APP_SECURITY = {
  SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24시간
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 15 * 60 * 1000, // 15분
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 128,
} as const

// 앱 접근성 설정
export const APP_ACCESSIBILITY = {
  HIGH_CONTRAST: "high_contrast",
  LARGE_TEXT: "large_text",
  SCREEN_READER: "screen_reader",
  KEYBOARD_NAVIGATION: "keyboard_navigation",
  REDUCED_MOTION: "reduced_motion",
} as const

// 앱 접근성 라벨
export const APP_ACCESSIBILITY_LABELS = {
  [APP_ACCESSIBILITY.HIGH_CONTRAST]: "고대비 모드",
  [APP_ACCESSIBILITY.LARGE_TEXT]: "큰 글씨",
  [APP_ACCESSIBILITY.SCREEN_READER]: "스크린 리더",
  [APP_ACCESSIBILITY.KEYBOARD_NAVIGATION]: "키보드 탐색",
  [APP_ACCESSIBILITY.REDUCED_MOTION]: "움직임 줄이기",
} as const

// 앱 개발 설정
export const APP_DEVELOPMENT = {
  ENABLE_LOGGING: import.meta.env.DEV,
  ENABLE_DEBUG_TOOLS: import.meta.env.DEV,
  ENABLE_PERFORMANCE_MONITORING: import.meta.env.DEV,
  ENABLE_ERROR_REPORTING: !import.meta.env.DEV,
} as const
