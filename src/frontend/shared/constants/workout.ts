// ============================================================================
// Frontend 워크아웃 상수들
// ============================================================================

// 운동 난이도
export const WORKOUT_DIFFICULTY = {
  BEGINNER: "beginner",
  INTERMEDIATE: "intermediate",
  ADVANCED: "advanced",
} as const

export const WORKOUT_DIFFICULTY_LABELS = {
  [WORKOUT_DIFFICULTY.BEGINNER]: "초급",
  [WORKOUT_DIFFICULTY.INTERMEDIATE]: "중급",
  [WORKOUT_DIFFICULTY.ADVANCED]: "고급",
} as const

// 운동 카테고리
export const WORKOUT_CATEGORIES = {
  UPPER_BODY: "upper_body",
  LOWER_BODY: "lower_body",
  FULL_BODY: "full_body",
  CARDIO: "cardio",
  FLEXIBILITY: "flexibility",
  STRENGTH: "strength",
} as const

export const WORKOUT_CATEGORY_LABELS = {
  [WORKOUT_CATEGORIES.UPPER_BODY]: "상체",
  [WORKOUT_CATEGORIES.LOWER_BODY]: "하체",
  [WORKOUT_CATEGORIES.FULL_BODY]: "전신",
  [WORKOUT_CATEGORIES.CARDIO]: "유산소",
  [WORKOUT_CATEGORIES.FLEXIBILITY]: "유연성",
  [WORKOUT_CATEGORIES.STRENGTH]: "근력",
} as const

// 운동 세션 상태
export const SESSION_STATUS = {
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  PAUSED: "paused",
  CANCELLED: "cancelled",
} as const

export const SESSION_STATUS_LABELS = {
  [SESSION_STATUS.IN_PROGRESS]: "진행 중",
  [SESSION_STATUS.COMPLETED]: "완료",
  [SESSION_STATUS.PAUSED]: "일시정지",
  [SESSION_STATUS.CANCELLED]: "취소",
} as const

// 운동 목표 타입
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

// 운동 목표 단위
export const GOAL_UNITS = {
  KG: "kg",
  LBS: "lbs",
  REPS: "회",
  MINUTES: "분",
  SECONDS: "초",
  DAYS: "일",
  WEEKS: "주",
  MONTHS: "개월",
} as const

// 운동 계획 상태
export const PLAN_STATUS = {
  ACTIVE: "active",
  ARCHIVED: "archived",
  DRAFT: "draft",
} as const

export const PLAN_STATUS_LABELS = {
  [PLAN_STATUS.ACTIVE]: "활성",
  [PLAN_STATUS.ARCHIVED]: "보관됨",
  [PLAN_STATUS.DRAFT]: "초안",
} as const

// 운동 세트 상태
export const SET_STATUS = {
  PENDING: "pending",
  COMPLETED: "completed",
  SKIPPED: "skipped",
} as const

export const SET_STATUS_LABELS = {
  [SET_STATUS.PENDING]: "대기",
  [SET_STATUS.COMPLETED]: "완료",
  [SET_STATUS.SKIPPED]: "건너뜀",
} as const

// RPE (Rate of Perceived Exertion) 스케일
export const RPE_SCALE = {
  1: "매우 쉬움",
  2: "쉬움",
  3: "약간 쉬움",
  4: "약간 힘듦",
  5: "보통",
  6: "약간 힘듦",
  7: "힘듦",
  8: "매우 힘듦",
  9: "극도로 힘듦",
  10: "최대",
} as const

// 운동 기분 평가
export const MOOD_RATINGS = {
  1: "매우 나쁨",
  2: "나쁨",
  3: "보통",
  4: "좋음",
  5: "매우 좋음",
} as const

// 에너지 레벨
export const ENERGY_LEVELS = {
  1: "매우 낮음",
  2: "낮음",
  3: "보통",
  4: "높음",
  5: "매우 높음",
} as const

// 기본 운동 시간
export const DEFAULT_DURATIONS = {
  WARM_UP: 5, // 분
  COOL_DOWN: 5, // 분
  REST_BETWEEN_SETS: 60, // 초
  REST_BETWEEN_EXERCISES: 120, // 초
} as const

// 운동 기록 제한
export const WORKOUT_LIMITS = {
  MAX_SESSION_DURATION: 300, // 5시간 (분)
  MAX_SETS_PER_EXERCISE: 20,
  MAX_EXERCISES_PER_SESSION: 50,
  MAX_WEIGHT: 999, // kg
  MAX_REPS: 999,
  MAX_DURATION: 3600, // 1시간 (초)
} as const

// 운동 통계 기간
export const STATS_PERIODS = {
  WEEK: "week",
  MONTH: "month",
  QUARTER: "quarter",
  YEAR: "year",
  ALL_TIME: "all_time",
} as const

export const STATS_PERIOD_LABELS = {
  [STATS_PERIODS.WEEK]: "주간",
  [STATS_PERIODS.MONTH]: "월간",
  [STATS_PERIODS.QUARTER]: "분기",
  [STATS_PERIODS.YEAR]: "연간",
  [STATS_PERIODS.ALL_TIME]: "전체",
} as const

// 운동 추천 설정
export const WORKOUT_RECOMMENDATIONS = {
  MIN_SESSIONS_PER_WEEK: 3,
  MAX_SESSIONS_PER_WEEK: 6,
  IDEAL_SESSION_DURATION: 60, // 분
  REST_DAYS_BETWEEN_SESSIONS: 1,
} as const

// 운동 알림 설정
export const WORKOUT_REMINDERS = {
  DEFAULT_TIMES: ["09:00", "18:00"],
  DEFAULT_DAYS: ["monday", "wednesday", "friday"],
  ADVANCE_NOTICE: 30, // 분
} as const

// 운동 성과 지표
export const PERFORMANCE_METRICS = {
  VOLUME: "volume", // 총 무게 × 횟수
  INTENSITY: "intensity", // 평균 무게
  FREQUENCY: "frequency", // 운동 빈도
  CONSISTENCY: "consistency", // 일관성
  PROGRESS: "progress", // 진전
} as const

export const PERFORMANCE_METRIC_LABELS = {
  [PERFORMANCE_METRICS.VOLUME]: "볼륨",
  [PERFORMANCE_METRICS.INTENSITY]: "강도",
  [PERFORMANCE_METRICS.FREQUENCY]: "빈도",
  [PERFORMANCE_METRICS.CONSISTENCY]: "일관성",
  [PERFORMANCE_METRICS.PROGRESS]: "진전",
} as const

// 운동 기록 정렬 옵션
export const WORKOUT_SORT_OPTIONS = {
  DATE_DESC: "date_desc",
  DATE_ASC: "date_asc",
  DURATION_DESC: "duration_desc",
  DURATION_ASC: "duration_asc",
  VOLUME_DESC: "volume_desc",
  VOLUME_ASC: "volume_asc",
} as const

export const WORKOUT_SORT_LABELS = {
  [WORKOUT_SORT_OPTIONS.DATE_DESC]: "최신순",
  [WORKOUT_SORT_OPTIONS.DATE_ASC]: "오래된순",
  [WORKOUT_SORT_OPTIONS.DURATION_DESC]: "시간 긴순",
  [WORKOUT_SORT_OPTIONS.DURATION_ASC]: "시간 짧은순",
  [WORKOUT_SORT_OPTIONS.VOLUME_DESC]: "볼륨 높은순",
  [WORKOUT_SORT_OPTIONS.VOLUME_ASC]: "볼륨 낮은순",
} as const

// 운동 필터 옵션
export const WORKOUT_FILTER_OPTIONS = {
  ALL: "all",
  THIS_WEEK: "this_week",
  THIS_MONTH: "this_month",
  LAST_3_MONTHS: "last_3_months",
  THIS_YEAR: "this_year",
} as const

export const WORKOUT_FILTER_LABELS = {
  [WORKOUT_FILTER_OPTIONS.ALL]: "전체",
  [WORKOUT_FILTER_OPTIONS.THIS_WEEK]: "이번 주",
  [WORKOUT_FILTER_OPTIONS.THIS_MONTH]: "이번 달",
  [WORKOUT_FILTER_OPTIONS.LAST_3_MONTHS]: "최근 3개월",
  [WORKOUT_FILTER_OPTIONS.THIS_YEAR]: "올해",
} as const
