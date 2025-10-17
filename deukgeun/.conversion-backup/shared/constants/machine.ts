// ============================================================================
// 기계 관련 상수
// ============================================================================

// 기계 카테고리
export const MACHINE_CATEGORIES = {
  UPPER_BODY: "상체",
  LOWER_BODY: "하체",
  FULL_BODY: "전신",
  OTHER: "기타",
} as const

export type MachineCategory =
  (typeof MACHINE_CATEGORIES)[keyof typeof MACHINE_CATEGORIES]

// 기계 난이도
export const MACHINE_DIFFICULTIES = {
  BEGINNER: "초급",
  INTERMEDIATE: "중급",
  ADVANCED: "고급",
} as const

export type MachineDifficulty =
  (typeof MACHINE_DIFFICULTIES)[keyof typeof MACHINE_DIFFICULTIES]

// 타겟 근육
export const TARGET_MUSCLES = {
  TRICEPS: "삼두근",
  BICEPS: "이두근",
  PECTORALIS_MAJOR: "대흉근",
  LATISSIMUS_DORSI: "광배근",
  TRAPEZIUS: "승모근",
  DELTOID: "삼각근",
  QUADRICEPS: "대퇴사두근",
  HAMSTRINGS: "햄스트링",
  GLUTEUS: "둔근",
  GASTROCNEMIUS: "비복근",
  ABDOMINALS: "복근",
  ERECTOR_SPINAE: "척추기립근",
} as const

export type TargetMuscle = (typeof TARGET_MUSCLES)[keyof typeof TARGET_MUSCLES]

// 기계 상태
export const MACHINE_STATUS = {
  AVAILABLE: "available",
  IN_USE: "in_use",
  MAINTENANCE: "maintenance",
  OUT_OF_ORDER: "out_of_order",
} as const

export type MachineStatus = (typeof MACHINE_STATUS)[keyof typeof MACHINE_STATUS]

// 기계 타입
export const MACHINE_TYPES = {
  CARDIO: "cardio",
  STRENGTH: "strength",
  FUNCTIONAL: "functional",
  FLEXIBILITY: "flexibility",
  BALANCE: "balance",
} as const

export type MachineType = (typeof MACHINE_TYPES)[keyof typeof MACHINE_TYPES]

// 기계 브랜드
export const MACHINE_BRANDS = {
  LIFE_FITNESS: "Life Fitness",
  PRECOR: "Precor",
  CYBEX: "Cybex",
  MATRIX: "Matrix",
  HAMMER_STRENGTH: "Hammer Strength",
  NORDIC_TRACK: "NordicTrack",
  CONCEPT2: "Concept2",
  TRUE: "True",
  STAR_TRAC: "Star Trac",
  SCHWINN: "Schwinn",
  OTHER: "기타",
} as const

export type MachineBrand = (typeof MACHINE_BRANDS)[keyof typeof MACHINE_BRANDS]

// 기계 필터 옵션
export const MACHINE_FILTER_OPTIONS = {
  CATEGORY: "category",
  DIFFICULTY: "difficulty",
  TARGET_MUSCLE: "target_muscle",
  TYPE: "type",
  BRAND: "brand",
  STATUS: "status",
} as const

export type MachineFilterOption =
  (typeof MACHINE_FILTER_OPTIONS)[keyof typeof MACHINE_FILTER_OPTIONS]

// 기계 정렬 옵션
export const MACHINE_SORT_OPTIONS = {
  NAME: "name",
  CATEGORY: "category",
  DIFFICULTY: "difficulty",
  POPULARITY: "popularity",
  RATING: "rating",
  CREATED_AT: "created_at",
} as const

export type MachineSortOption =
  (typeof MACHINE_SORT_OPTIONS)[keyof typeof MACHINE_SORT_OPTIONS]

// 기계 API 엔드포인트
export const MACHINE_API_ENDPOINTS = {
  LIST: "/api/machines",
  DETAIL: "/api/machines/:id",
  SEARCH: "/api/machines/search",
  FILTER: "/api/machines/filter",
  CATEGORIES: "/api/machines/categories",
  DIFFICULTIES: "/api/machines/difficulties",
  TARGET_MUSCLES: "/api/machines/target-muscles",
  BRANDS: "/api/machines/brands",
  REVIEWS: "/api/machines/:id/reviews",
  PHOTOS: "/api/machines/:id/photos",
  VIDEOS: "/api/machines/:id/videos",
  WORKOUT_PROGRAMS: "/api/machines/:id/workout-programs",
  COMPARE: "/api/machines/compare",
} as const

// 기계 이미지 타입
export const MACHINE_IMAGE_TYPES = {
  MAIN: "main",
  DETAIL: "detail",
  USAGE: "usage",
  POSITION: "position",
  VARIATION: "variation",
} as const

export type MachineImageType =
  (typeof MACHINE_IMAGE_TYPES)[keyof typeof MACHINE_IMAGE_TYPES]

// 기계 리뷰 타입
export const MACHINE_REVIEW_TYPES = {
  GENERAL: "general",
  EFFECTIVENESS: "effectiveness",
  EASE_OF_USE: "ease_of_use",
  SAFETY: "safety",
  MAINTENANCE: "maintenance",
} as const

export type MachineReviewType =
  (typeof MACHINE_REVIEW_TYPES)[keyof typeof MACHINE_REVIEW_TYPES]

// 기계 알림 타입
export const MACHINE_NOTIFICATION_TYPES = {
  NEW_REVIEW: "new_review",
  MAINTENANCE_DUE: "maintenance_due",
  POPULARITY_CHANGE: "popularity_change",
  RECOMMENDATION: "recommendation",
  NEW_PROGRAM: "new_program",
} as const

export type MachineNotificationType =
  (typeof MACHINE_NOTIFICATION_TYPES)[keyof typeof MACHINE_NOTIFICATION_TYPES]

// 기계 페이지네이션
export const MACHINE_PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const

// 기계 검색 설정
export const MACHINE_SEARCH = {
  MIN_QUERY_LENGTH: 2,
  MAX_SUGGESTIONS: 10,
  DEBOUNCE_DELAY: 300,
} as const

// 기계 평가 기준
export const MACHINE_RATING_CRITERIA = {
  EFFECTIVENESS: "effectiveness",
  EASE_OF_USE: "ease_of_use",
  SAFETY: "safety",
  DURABILITY: "durability",
  VALUE: "value",
} as const

export type MachineRatingCriterion =
  (typeof MACHINE_RATING_CRITERIA)[keyof typeof MACHINE_RATING_CRITERIA]

// 기계 운동 프로그램 타입
export const MACHINE_WORKOUT_PROGRAM_TYPES = {
  BEGINNER: "beginner",
  INTERMEDIATE: "intermediate",
  ADVANCED: "advanced",
  CUSTOM: "custom",
} as const

export type MachineWorkoutProgramType =
  (typeof MACHINE_WORKOUT_PROGRAM_TYPES)[keyof typeof MACHINE_WORKOUT_PROGRAM_TYPES]

// 기계 운동 프로그램 난이도
export const MACHINE_WORKOUT_DIFFICULTIES = {
  EASY: "easy",
  MODERATE: "moderate",
  HARD: "hard",
  EXPERT: "expert",
} as const

export type MachineWorkoutDifficulty =
  (typeof MACHINE_WORKOUT_DIFFICULTIES)[keyof typeof MACHINE_WORKOUT_DIFFICULTIES]
