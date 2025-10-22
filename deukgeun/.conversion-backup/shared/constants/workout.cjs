// ============================================================================
// 운동 관련 상수들
// ============================================================================

// 운동 타입
const WORKOUT_TYPES
module.exports.WORKOUT_TYPES = WORKOUT_TYPES = {
  STRENGTH: "strength",
  CARDIO: "cardio",
  FLEXIBILITY: "flexibility",
  BALANCE: "balance",
  FUNCTIONAL: "functional",
  SPORTS: "sports",
  YOGA: "yoga",
  PILATES: "pilates",
  CROSSFIT: "crossfit",
  CALISTHENICS: "calisthenics",
} as const

// 운동 강도
const WORKOUT_INTENSITY
module.exports.WORKOUT_INTENSITY = WORKOUT_INTENSITY = {
  LOW: "low",
  MODERATE: "moderate",
  HIGH: "high",
  EXTREME: "extreme",
} as const

// 운동 상태
const WORKOUT_STATUS
module.exports.WORKOUT_STATUS = WORKOUT_STATUS = {
  NOT_STARTED: "not_started",
  IN_PROGRESS: "in_progress",
  PAUSED: "paused",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
} as const

// 운동 목표 타입
const GOAL_TYPES
module.exports.GOAL_TYPES = GOAL_TYPES = {
  WEIGHT: "weight",
  REPS: "reps",
  DURATION: "duration",
  FREQUENCY: "frequency",
  STREAK: "streak",
  DISTANCE: "distance",
  CALORIES: "calories",
  HEART_RATE: "heart_rate",
} as const

// 운동 목표 상태
const GOAL_STATUS
module.exports.GOAL_STATUS = GOAL_STATUS = {
  ACTIVE: "active",
  COMPLETED: "completed",
  PAUSED: "paused",
  CANCELLED: "cancelled",
  EXPIRED: "expired",
} as const

// 운동 계획 상태
const PLAN_STATUS
module.exports.PLAN_STATUS = PLAN_STATUS = {
  DRAFT: "draft",
  ACTIVE: "active",
  INACTIVE: "inactive",
  ARCHIVED: "archived",
} as const

// 운동 알림 타입
const REMINDER_TYPES
module.exports.REMINDER_TYPES = REMINDER_TYPES = {
  WORKOUT: "workout",
  GOAL: "goal",
  MILESTONE: "milestone",
  CUSTOM: "custom",
} as const

// 운동 알림 주기
const REMINDER_FREQUENCY
module.exports.REMINDER_FREQUENCY = REMINDER_FREQUENCY = {
  DAILY: "daily",
  WEEKLY: "weekly",
  MONTHLY: "monthly",
  CUSTOM: "custom",
} as const

// 운동 진행도 타입
const PROGRESS_TYPES
module.exports.PROGRESS_TYPES = PROGRESS_TYPES = {
  WEIGHT: "weight",
  REPS: "reps",
  DURATION: "duration",
  DISTANCE: "distance",
  CALORIES: "calories",
  HEART_RATE: "heart_rate",
  BODY_MEASUREMENTS: "body_measurements",
} as const

// 운동 통계 기간
const STATS_PERIODS
module.exports.STATS_PERIODS = STATS_PERIODS = {
  DAY: "day",
  WEEK: "week",
  MONTH: "month",
  QUARTER: "quarter",
  YEAR: "year",
  CUSTOM: "custom",
} as const

// 운동 단위
const WORKOUT_UNITS
module.exports.WORKOUT_UNITS = WORKOUT_UNITS = {
  KG: "kg",
  LBS: "lbs",
  REPS: "reps",
  SETS: "sets",
  MINUTES: "minutes",
  SECONDS: "seconds",
  KILOMETERS: "km",
  MILES: "miles",
  CALORIES: "calories",
  HEART_RATE: "bpm",
  PERCENTAGE: "%",
} as const

// 운동 부위
const BODY_PARTS
module.exports.BODY_PARTS = BODY_PARTS = {
  CHEST: "chest",
  BACK: "back",
  SHOULDERS: "shoulders",
  BICEPS: "biceps",
  TRICEPS: "triceps",
  FOREARMS: "forearms",
  ABS: "abs",
  OBLIQUES: "obliques",
  LOWER_BACK: "lower_back",
  GLUTES: "glutes",
  QUADS: "quads",
  HAMSTRINGS: "hamstrings",
  CALVES: "calves",
  FULL_BODY: "full_body",
  CARDIO: "cardio",
} as const

// 운동 난이도
const DIFFICULTY_LEVELS
module.exports.DIFFICULTY_LEVELS = DIFFICULTY_LEVELS = {
  BEGINNER: "beginner",
  INTERMEDIATE: "intermediate",
  ADVANCED: "advanced",
  EXPERT: "expert",
} as const

// 운동 장비
const EQUIPMENT_TYPES
module.exports.EQUIPMENT_TYPES = EQUIPMENT_TYPES = {
  NONE: "none",
  DUMBBELLS: "dumbbells",
  BARBELL: "barbell",
  KETTLEBELL: "kettlebell",
  RESISTANCE_BANDS: "resistance_bands",
  CABLE_MACHINE: "cable_machine",
  SMITH_MACHINE: "smith_machine",
  LEG_PRESS: "leg_press",
  LAT_PULLDOWN: "lat_pulldown",
  CHEST_PRESS: "chest_press",
  SHOULDER_PRESS: "shoulder_press",
  TREADMILL: "treadmill",
  ELLIPTICAL: "elliptical",
  ROWING_MACHINE: "rowing_machine",
  STATIONARY_BIKE: "stationary_bike",
  YOGA_MAT: "yoga_mat",
  FOAM_ROLLER: "foam_roller",
  MEDICINE_BALL: "medicine_ball",
  STABILITY_BALL: "stability_ball",
  PULL_UP_BAR: "pull_up_bar",
} as const

// 운동 효과
const EXERCISE_EFFECTS
module.exports.EXERCISE_EFFECTS = EXERCISE_EFFECTS = {
  STRENGTH: "strength",
  ENDURANCE: "endurance",
  FLEXIBILITY: "flexibility",
  BALANCE: "balance",
  POWER: "power",
  SPEED: "speed",
  AGILITY: "agility",
  COORDINATION: "coordination",
  CARDIOVASCULAR: "cardiovascular",
  WEIGHT_LOSS: "weight_loss",
  MUSCLE_GAIN: "muscle_gain",
  TONING: "toning",
  RECOVERY: "recovery",
  REHABILITATION: "rehabilitation",
} as const

// 운동 시간대
const WORKOUT_TIMES
module.exports.WORKOUT_TIMES = WORKOUT_TIMES = {
  EARLY_MORNING: "early_morning", // 5-8시
  MORNING: "morning", // 8-12시
  AFTERNOON: "afternoon", // 12-17시
  EVENING: "evening", // 17-21시
  NIGHT: "night", // 21-24시
  LATE_NIGHT: "late_night", // 24-5시
} as const

// 운동 요일
const WORKOUT_DAYS
module.exports.WORKOUT_DAYS = WORKOUT_DAYS = {
  MONDAY: "monday",
  TUESDAY: "tuesday",
  WEDNESDAY: "wednesday",
  THURSDAY: "thursday",
  FRIDAY: "friday",
  SATURDAY: "saturday",
  SUNDAY: "sunday",
} as const

// 운동 계절
const WORKOUT_SEASONS
module.exports.WORKOUT_SEASONS = WORKOUT_SEASONS = {
  SPRING: "spring",
  SUMMER: "summer",
  FALL: "fall",
  WINTER: "winter",
  ALL_YEAR: "all_year",
} as const

// 운동 환경
const WORKOUT_ENVIRONMENTS
module.exports.WORKOUT_ENVIRONMENTS = WORKOUT_ENVIRONMENTS = {
  GYM: "gym",
  HOME: "home",
  OUTDOOR: "outdoor",
  POOL: "pool",
  STUDIO: "studio",
  PARK: "park",
  BEACH: "beach",
  MOUNTAIN: "mountain",
} as const

// 운동 동반자
const WORKOUT_COMPANIONS
module.exports.WORKOUT_COMPANIONS = WORKOUT_COMPANIONS = {
  ALONE: "alone",
  FRIEND: "friend",
  PARTNER: "partner",
  FAMILY: "family",
  GROUP: "group",
  TRAINER: "trainer",
  CLASS: "class",
} as const

// 운동 기분
const WORKOUT_MOODS
module.exports.WORKOUT_MOODS = WORKOUT_MOODS = {
  ENERGETIC: "energetic",
  TIRED: "tired",
  STRESSED: "stressed",
  RELAXED: "relaxed",
  MOTIVATED: "motivated",
  UNMOTIVATED: "unmotivated",
  FOCUSED: "focused",
  DISTRACTED: "distracted",
  HAPPY: "happy",
  SAD: "sad",
  ANGRY: "angry",
  CALM: "calm",
} as const

// 운동 성과
const WORKOUT_PERFORMANCE
module.exports.WORKOUT_PERFORMANCE = WORKOUT_PERFORMANCE = {
  EXCELLENT: "excellent",
  GOOD: "good",
  AVERAGE: "average",
  POOR: "poor",
  TERRIBLE: "terrible",
} as const

// 운동 만족도
const WORKOUT_SATISFACTION
module.exports.WORKOUT_SATISFACTION = WORKOUT_SATISFACTION = {
  VERY_SATISFIED: "very_satisfied",
  SATISFIED: "satisfied",
  NEUTRAL: "neutral",
  DISSATISFIED: "dissatisfied",
  VERY_DISSATISFIED: "very_dissatisfied",
} as const

// 운동 기록 타입
const WORKOUT_LOG_TYPES
module.exports.WORKOUT_LOG_TYPES = WORKOUT_LOG_TYPES = {
  SESSION: "session",
  EXERCISE: "exercise",
  SET: "set",
  NOTE: "note",
  PHOTO: "photo",
  VIDEO: "video",
  MEASUREMENT: "measurement",
} as const

// 운동 분석 지표
const WORKOUT_METRICS
module.exports.WORKOUT_METRICS = WORKOUT_METRICS = {
  VOLUME: "volume",
  INTENSITY: "intensity",
  FREQUENCY: "frequency",
  DURATION: "duration",
  CONSISTENCY: "consistency",
  PROGRESS: "progress",
  EFFICIENCY: "efficiency",
  RECOVERY: "recovery",
} as const