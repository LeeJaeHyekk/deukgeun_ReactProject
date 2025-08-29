// ============================================================================
// Workout Feature Constants
// ============================================================================

import type { TabType } from "../types"

// ============================================================================
// Error & Success Messages
// ============================================================================

export const ERROR_MESSAGES = {
  // General
  NETWORK_ERROR: "네트워크 오류가 발생했습니다.",
  UNKNOWN_ERROR: "알 수 없는 오류가 발생했습니다.",
  VALIDATION_ERROR: "입력값을 확인해주세요.",

  // Authentication
  UNAUTHORIZED: "로그인이 필요합니다.",
  FORBIDDEN: "접근 권한이 없습니다.",
  AUTH_REQUIRED: "인증이 필요합니다.",

  // Workout Plans
  PLAN_NOT_FOUND: "운동 계획을 찾을 수 없습니다.",
  PLAN_CREATE_FAILED: "운동 계획 생성에 실패했습니다.",
  PLAN_UPDATE_FAILED: "운동 계획 수정에 실패했습니다.",
  PLAN_DELETE_FAILED: "운동 계획 삭제에 실패했습니다.",

  // Workout Sessions
  SESSION_NOT_FOUND: "운동 세션을 찾을 수 없습니다.",
  SESSION_CREATE_FAILED: "운동 세션 생성에 실패했습니다.",
  SESSION_UPDATE_FAILED: "운동 세션 수정에 실패했습니다.",
  SESSION_DELETE_FAILED: "운동 세션 삭제에 실패했습니다.",
  SESSION_ALREADY_STARTED: "이미 시작된 세션입니다.",
  SESSION_ALREADY_COMPLETED: "이미 완료된 세션입니다.",

  // Workout Goals
  GOAL_NOT_FOUND: "운동 목표를 찾을 수 없습니다.",
  GOAL_CREATE_FAILED: "운동 목표 생성에 실패했습니다.",
  GOAL_UPDATE_FAILED: "운동 목표 수정에 실패했습니다.",
  GOAL_DELETE_FAILED: "운동 목표 삭제에 실패했습니다.",

  // Machines
  MACHINE_NOT_FOUND: "운동 기구를 찾을 수 없습니다.",
  MACHINE_LOAD_FAILED: "운동 기구 정보를 불러올 수 없습니다.",

  // Validation
  INVALID_PLAN_NAME: "계획 이름은 1-100자 사이여야 합니다.",
  INVALID_GOAL_TITLE: "목표 제목은 1-100자 사이여야 합니다.",
  INVALID_SESSION_NAME: "세션 이름은 1-100자 사이여야 합니다.",
  INVALID_SETS: "세트 수는 1-20 사이여야 합니다.",
  INVALID_REPS: "횟수는 1-100 사이여야 합니다.",
  INVALID_WEIGHT: "무게는 0-1000 사이여야 합니다.",
  INVALID_DURATION: "시간은 1-300분 사이여야 합니다.",

  // Timer
  TIMER_ALREADY_RUNNING: "타이머가 이미 실행 중입니다.",
  TIMER_NOT_RUNNING: "타이머가 실행 중이 아닙니다.",
  INVALID_TIMER_STATE: "잘못된 타이머 상태입니다.",

  // Data
  DATA_LOAD_FAILED: "데이터를 불러올 수 없습니다.",
  DATA_SAVE_FAILED: "데이터 저장에 실패했습니다.",
  CACHE_LOAD_FAILED: "캐시된 데이터를 불러올 수 없습니다.",
} as const

export const SUCCESS_MESSAGES = {
  // General
  SAVE_SUCCESS: "저장되었습니다.",
  DELETE_SUCCESS: "삭제되었습니다.",
  UPDATE_SUCCESS: "수정되었습니다.",

  // Workout Plans
  PLAN_CREATED: "운동 계획이 생성되었습니다.",
  PLAN_UPDATED: "운동 계획이 수정되었습니다.",
  PLAN_DELETED: "운동 계획이 삭제되었습니다.",
  PLAN_ACTIVATED: "운동 계획이 활성화되었습니다.",
  PLAN_ARCHIVED: "운동 계획이 보관되었습니다.",

  // Workout Sessions
  SESSION_CREATED: "운동 세션이 생성되었습니다.",
  SESSION_UPDATED: "운동 세션이 수정되었습니다.",
  SESSION_DELETED: "운동 세션이 삭제되었습니다.",
  SESSION_STARTED: "운동 세션이 시작되었습니다.",
  SESSION_PAUSED: "운동 세션이 일시정지되었습니다.",
  SESSION_RESUMED: "운동 세션이 재개되었습니다.",
  SESSION_COMPLETED: "운동 세션이 완료되었습니다.",

  // Workout Goals
  GOAL_CREATED: "운동 목표가 생성되었습니다.",
  GOAL_UPDATED: "운동 목표가 수정되었습니다.",
  GOAL_DELETED: "운동 목표가 삭제되었습니다.",
  GOAL_ACHIEVED: "목표를 달성했습니다!",
  GOAL_PROGRESS_UPDATED: "목표 진행상황이 업데이트되었습니다.",

  // Timer
  TIMER_STARTED: "타이머가 시작되었습니다.",
  TIMER_PAUSED: "타이머가 일시정지되었습니다.",
  TIMER_RESUMED: "타이머가 재개되었습니다.",
  TIMER_STOPPED: "타이머가 중지되었습니다.",
  REST_TIME_STARTED: "휴식 시간이 시작되었습니다.",

  // Data
  DATA_LOADED: "데이터가 로드되었습니다.",
  DATA_SAVED: "데이터가 저장되었습니다.",
  CACHE_UPDATED: "캐시가 업데이트되었습니다.",

  // Level & Experience
  LEVEL_UP: "레벨업했습니다!",
  EXP_GAINED: "경험치를 획득했습니다.",
  MILESTONE_ACHIEVED: "새로운 마일스톤을 달성했습니다!",
  REWARD_EARNED: "보상을 획득했습니다!",
} as const

// ============================================================================
// Tab Configuration
// ============================================================================

export const TAB_CONFIG = [
  {
    key: "overview" as TabType,
    label: "개요",
    icon: "📊",
    description: "현재 진행중인 운동 계획과 주요 통계",
  },
  {
    key: "goals" as TabType,
    label: "목표",
    icon: "🎯",
    description: "운동 목표와 달성 상태",
  },
  {
    key: "plans" as TabType,
    label: "계획",
    icon: "📋",
    description: "새 계획 생성 및 운동 추가",
  },
  {
    key: "sessions" as TabType,
    label: "세션",
    icon: "⏱️",
    description: "운동 세션 관리",
  },
  {
    key: "workoutProgress" as TabType,
    label: "진행상황",
    icon: "📈",
    description: "월/년 단위 진행 상황 시각화",
  },
]

// ============================================================================
// Goal Types
// ============================================================================

export const GOAL_TYPES = {
  WEIGHT: "weight",
  REPS: "reps",
  DURATION: "duration",
  FREQUENCY: "frequency",
  STREAK: "streak",
} as const

export const GOAL_TYPE_LABELS = {
  [GOAL_TYPES.WEIGHT]: "무게",
  [GOAL_TYPES.REPS]: "횟수",
  [GOAL_TYPES.DURATION]: "시간",
  [GOAL_TYPES.FREQUENCY]: "빈도",
  [GOAL_TYPES.STREAK]: "연속",
} as const

export const GOAL_TYPE_ICONS = {
  [GOAL_TYPES.WEIGHT]: "🏋️",
  [GOAL_TYPES.REPS]: "🔢",
  [GOAL_TYPES.DURATION]: "⏱️",
  [GOAL_TYPES.FREQUENCY]: "📅",
  [GOAL_TYPES.STREAK]: "🔥",
} as const

// ============================================================================
// Session Status
// ============================================================================

export const SESSION_STATUS = {
  NOT_STARTED: "not_started",
  IN_PROGRESS: "in_progress",
  PAUSED: "paused",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
} as const

export const SESSION_STATUS_LABELS = {
  [SESSION_STATUS.NOT_STARTED]: "시작 전",
  [SESSION_STATUS.IN_PROGRESS]: "진행 중",
  [SESSION_STATUS.PAUSED]: "일시정지",
  [SESSION_STATUS.COMPLETED]: "완료",
  [SESSION_STATUS.CANCELLED]: "취소",
} as const

// ============================================================================
// Plan Status
// ============================================================================

export const PLAN_STATUS = {
  ACTIVE: "active",
  ARCHIVED: "archived",
  DRAFT: "draft",
} as const

export const PLAN_STATUS_LABELS = {
  [PLAN_STATUS.ACTIVE]: "활성",
  [PLAN_STATUS.ARCHIVED]: "보관",
  [PLAN_STATUS.DRAFT]: "임시저장",
} as const

// ============================================================================
// Difficulty Levels
// ============================================================================

export const DIFFICULTY_LEVELS = {
  BEGINNER: "beginner",
  INTERMEDIATE: "intermediate",
  ADVANCED: "advanced",
} as const

export const DIFFICULTY_LABELS = {
  [DIFFICULTY_LEVELS.BEGINNER]: "초급",
  [DIFFICULTY_LEVELS.INTERMEDIATE]: "중급",
  [DIFFICULTY_LEVELS.ADVANCED]: "고급",
} as const

export const DIFFICULTY_ICONS = {
  [DIFFICULTY_LEVELS.BEGINNER]: "🌱",
  [DIFFICULTY_LEVELS.INTERMEDIATE]: "🔥",
  [DIFFICULTY_LEVELS.ADVANCED]: "💪",
} as const

// ============================================================================
// Muscle Groups
// ============================================================================

export const MUSCLE_GROUPS = [
  "가슴",
  "등",
  "어깨",
  "팔",
  "복근",
  "하체",
  "전신",
] as const

export const MUSCLE_GROUP_ICONS = {
  가슴: "💪",
  등: "🏋️",
  어깨: "💪",
  팔: "💪",
  복근: "🏃",
  하체: "🦵",
  전신: "🏃‍♂️",
} as const

// ============================================================================
// Exercise Categories
// ============================================================================

export const EXERCISE_CATEGORIES = [
  "스트렝스",
  "카디오",
  "플렉서빌리티",
  "밸런스",
  "파워리프팅",
  "올림픽리프팅",
] as const

// ============================================================================
// View Modes
// ============================================================================

export const VIEW_MODES = {
  GRID: "grid",
  LIST: "list",
  CALENDAR: "calendar",
  PROGRESS: "progress",
} as const

// ============================================================================
// Chart Types
// ============================================================================

export const CHART_TYPES = {
  LINE: "line",
  BAR: "bar",
  PIE: "pie",
  AREA: "area",
  RADAR: "radar",
} as const

// ============================================================================
// Time Ranges
// ============================================================================

export const TIME_RANGES = {
  DAY: "day",
  WEEK: "week",
  MONTH: "month",
  QUARTER: "quarter",
  YEAR: "year",
} as const

export const TIME_RANGE_LABELS = {
  [TIME_RANGES.DAY]: "일",
  [TIME_RANGES.WEEK]: "주",
  [TIME_RANGES.MONTH]: "월",
  [TIME_RANGES.QUARTER]: "분기",
  [TIME_RANGES.YEAR]: "년",
} as const

// ============================================================================
// Sort Options
// ============================================================================

export const SORT_OPTIONS = {
  NAME_ASC: "name_asc",
  NAME_DESC: "name_desc",
  DATE_ASC: "date_asc",
  DATE_DESC: "date_desc",
  DURATION_ASC: "duration_asc",
  DURATION_DESC: "duration_desc",
  DIFFICULTY_ASC: "difficulty_asc",
  DIFFICULTY_DESC: "difficulty_desc",
} as const

export const SORT_LABELS = {
  [SORT_OPTIONS.NAME_ASC]: "이름 (오름차순)",
  [SORT_OPTIONS.NAME_DESC]: "이름 (내림차순)",
  [SORT_OPTIONS.DATE_ASC]: "날짜 (오름차순)",
  [SORT_OPTIONS.DATE_DESC]: "날짜 (내림차순)",
  [SORT_OPTIONS.DURATION_ASC]: "시간 (오름차순)",
  [SORT_OPTIONS.DURATION_DESC]: "시간 (내림차순)",
  [SORT_OPTIONS.DIFFICULTY_ASC]: "난이도 (오름차순)",
  [SORT_OPTIONS.DIFFICULTY_DESC]: "난이도 (내림차순)",
} as const

// ============================================================================
// Filter Options
// ============================================================================

export const FILTER_STATUS_OPTIONS = {
  ALL: "all",
  ACTIVE: "active",
  COMPLETED: "completed",
  ARCHIVED: "archived",
  DRAFT: "draft",
} as const

export const FILTER_TYPE_OPTIONS = {
  ALL: "all",
  WEIGHT: "weight",
  REPS: "reps",
  DURATION: "duration",
  FREQUENCY: "frequency",
  STREAK: "streak",
} as const

// ============================================================================
// Timer Settings
// ============================================================================

export const TIMER_SETTINGS = {
  DEFAULT_REST_TIME: 60, // seconds
  MIN_REST_TIME: 10,
  MAX_REST_TIME: 300,
  REST_TIME_STEP: 5,
  AUTO_START_REST: true,
  REST_NOTIFICATION: true,
} as const

// ============================================================================
// Progress Settings
// ============================================================================

export const PROGRESS_SETTINGS = {
  MIN_PROGRESS: 0,
  MAX_PROGRESS: 100,
  PROGRESS_STEP: 1,
  SHOW_PERCENTAGE: true,
  ANIMATION_DURATION: 300,
} as const

// ============================================================================
// Validation Rules
// ============================================================================

export const VALIDATION_RULES = {
  PLAN_NAME: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 100,
    PATTERN: /^[a-zA-Z0-9가-힣\s\-_]+$/,
  },
  PLAN_DESCRIPTION: {
    MAX_LENGTH: 500,
  },
  GOAL_TITLE: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 100,
  },
  GOAL_DESCRIPTION: {
    MAX_LENGTH: 300,
  },
  SESSION_NAME: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 100,
  },
  SESSION_NOTES: {
    MAX_LENGTH: 1000,
  },
  EXERCISE_NAME: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 50,
  },
  SETS: {
    MIN: 1,
    MAX: 20,
  },
  REPS: {
    MIN: 1,
    MAX: 100,
  },
  WEIGHT: {
    MIN: 0,
    MAX: 1000,
  },
  DURATION: {
    MIN: 1,
    MAX: 300,
  },
} as const

// ============================================================================
// API Endpoints
// ============================================================================

export const API_ENDPOINTS = {
  DASHBOARD: "/api/workout/dashboard",
  PLANS: "/api/workout/plans",
  SESSIONS: "/api/workout/sessions",
  GOALS: "/api/workout/goals",
  MACHINES: "/api/machines",
  GYMS: "/api/gyms",
  STATS: "/api/workout/stats",
  PROGRESS: "/api/workout/progress",
  REMINDERS: "/api/workout/reminders",
  USER_LEVEL: "/api/user/level",
  EXP_HISTORY: "/api/user/exp-history",
  MILESTONES: "/api/user/milestones",
  STREAKS: "/api/user/streaks",
  REWARDS: "/api/user/rewards",
} as const

// ============================================================================
// Cache Settings
// ============================================================================

export const CACHE_SETTINGS = {
  MACHINES: 24 * 60 * 60 * 1000, // 24 hours
  GYMS: 7 * 24 * 60 * 60 * 1000, // 7 days
  USER_LEVEL: 60 * 60 * 1000, // 1 hour
  STATS: 60 * 60 * 1000, // 1 hour
  PROGRESS: 30 * 60 * 1000, // 30 minutes
  SESSIONS: 0, // No cache (real-time)
  PLANS: 0, // No cache (real-time)
  GOALS: 0, // No cache (real-time)
} as const

// ============================================================================
// UI Settings
// ============================================================================

export const UI_SETTINGS = {
  MODAL_ANIMATION_DURATION: 200,
  TOAST_DURATION: 3000,
  LOADING_DELAY: 300,
  DEBOUNCE_DELAY: 300,
  INFINITE_SCROLL_THRESHOLD: 100,
  VIRTUAL_SCROLL_ITEM_HEIGHT: 60,
} as const

// ============================================================================
// Color Schemes
// ============================================================================

export const COLORS = {
  PRIMARY: "#3b82f6",
  SECONDARY: "#6b7280",
  SUCCESS: "#10b981",
  WARNING: "#f59e0b",
  DANGER: "#ef4444",
  INFO: "#06b6d4",
  BACKGROUND: "#ffffff",
  BORDER: "#e5e7eb",
  TEXT_PRIMARY: "#111827",
  TEXT_SECONDARY: "#6b7280",
  TEXT_MUTED: "#9ca3af",
} as const

// ============================================================================
// Spacing
// ============================================================================

export const SPACING = {
  XS: "4px",
  SM: "8px",
  MD: "16px",
  LG: "24px",
  XL: "32px",
  XXL: "48px",
} as const

// ============================================================================
// Typography
// ============================================================================

export const TYPOGRAPHY = {
  HEADING: {
    fontSize: "1.25rem",
    fontWeight: 600,
    lineHeight: 1.5,
  },
  BODY: {
    fontSize: "1rem",
    lineHeight: 1.5,
  },
  CAPTION: {
    fontSize: "0.875rem",
    color: COLORS.TEXT_SECONDARY,
  },
} as const

// ============================================================================
// Breakpoints
// ============================================================================

export const BREAKPOINTS = {
  MOBILE: "480px",
  TABLET: "768px",
  DESKTOP: "1024px",
  WIDE: "1280px",
} as const

// ============================================================================
// Z-Index
// ============================================================================

export const Z_INDEX = {
  MODAL_BACKDROP: 1000,
  MODAL: 1001,
  TOOLTIP: 1002,
  DROPDOWN: 1003,
  TOAST: 1004,
} as const
