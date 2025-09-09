// ============================================================================
// Frontend 레벨 시스템 상수들
// ============================================================================

// 레벨 시스템 기본 설정
export const LEVEL_SYSTEM_CONFIG = {
  BASE_EXP: 100,
  EXP_MULTIPLIER: 1.2,
  MAX_LEVEL: 100,
  SEASON_DURATION_DAYS: 90,
} as const

// 경험치 획득 소스
export const EXP_SOURCES = {
  POST_CREATE: "post_create",
  POST_LIKE: "post_like",
  COMMENT_CREATE: "comment_create",
  COMMENT_LIKE: "comment_like",
  WORKOUT_SESSION: "workout_session",
  WORKOUT_GOAL_COMPLETE: "workout_goal_complete",
  DAILY_LOGIN: "daily_login",
  WEEKLY_STREAK: "weekly_streak",
  MONTHLY_STREAK: "monthly_streak",
  ACHIEVEMENT_UNLOCK: "achievement_unlock",
} as const

export const EXP_SOURCE_LABELS = {
  [EXP_SOURCES.POST_CREATE]: "게시글 작성",
  [EXP_SOURCES.POST_LIKE]: "게시글 좋아요",
  [EXP_SOURCES.COMMENT_CREATE]: "댓글 작성",
  [EXP_SOURCES.COMMENT_LIKE]: "댓글 좋아요",
  [EXP_SOURCES.WORKOUT_SESSION]: "운동 세션",
  [EXP_SOURCES.WORKOUT_GOAL_COMPLETE]: "운동 목표 달성",
  [EXP_SOURCES.DAILY_LOGIN]: "일일 로그인",
  [EXP_SOURCES.WEEKLY_STREAK]: "주간 연속",
  [EXP_SOURCES.MONTHLY_STREAK]: "월간 연속",
  [EXP_SOURCES.ACHIEVEMENT_UNLOCK]: "업적 달성",
} as const

// 경험치 획득량
export const EXP_AMOUNTS = {
  [EXP_SOURCES.POST_CREATE]: 10,
  [EXP_SOURCES.POST_LIKE]: 2,
  [EXP_SOURCES.COMMENT_CREATE]: 5,
  [EXP_SOURCES.COMMENT_LIKE]: 1,
  [EXP_SOURCES.WORKOUT_SESSION]: 20,
  [EXP_SOURCES.WORKOUT_GOAL_COMPLETE]: 50,
  [EXP_SOURCES.DAILY_LOGIN]: 5,
  [EXP_SOURCES.WEEKLY_STREAK]: 25,
  [EXP_SOURCES.MONTHLY_STREAK]: 100,
  [EXP_SOURCES.ACHIEVEMENT_UNLOCK]: 100,
} as const

// 레벨별 특별 보상
export const LEVEL_REWARDS = {
  5: { type: "badge", name: "첫 걸음", description: "첫 번째 레벨업!" },
  10: { type: "badge", name: "성장하는 새싹", description: "10레벨 달성!" },
  20: { type: "badge", name: "꾸준한 연습생", description: "20레벨 달성!" },
  30: { type: "badge", name: "헬스장 단골", description: "30레벨 달성!" },
  40: { type: "badge", name: "운동 마니아", description: "40레벨 달성!" },
  50: { type: "badge", name: "헬스장 마스터", description: "50레벨 달성!" },
  60: { type: "badge", name: "운동 전문가", description: "60레벨 달성!" },
  70: { type: "badge", name: "헬스장 레전드", description: "70레벨 달성!" },
  80: { type: "badge", name: "운동의 달인", description: "80레벨 달성!" },
  90: { type: "badge", name: "헬스장 신", description: "90레벨 달성!" },
  100: { type: "badge", name: "득근득근 마스터", description: "100레벨 달성!" },
} as const

// 업적 타입
export const ACHIEVEMENT_TYPES = {
  LEVEL: "level",
  STREAK: "streak",
  WORKOUT: "workout",
  COMMUNITY: "community",
  SPECIAL: "special",
} as const

export const ACHIEVEMENT_TYPE_LABELS = {
  [ACHIEVEMENT_TYPES.LEVEL]: "레벨",
  [ACHIEVEMENT_TYPES.STREAK]: "연속",
  [ACHIEVEMENT_TYPES.WORKOUT]: "운동",
  [ACHIEVEMENT_TYPES.COMMUNITY]: "커뮤니티",
  [ACHIEVEMENT_TYPES.SPECIAL]: "특별",
} as const

// 업적 목록
export const ACHIEVEMENTS = {
  // 레벨 업적
  FIRST_LEVEL: {
    id: "first_level",
    type: ACHIEVEMENT_TYPES.LEVEL,
    name: "첫 걸음",
    description: "첫 번째 레벨업을 달성하세요",
    requirement: { level: 1 },
    reward: { exp: 50, badge: "first_level" },
  },

  LEVEL_10: {
    id: "level_10",
    type: ACHIEVEMENT_TYPES.LEVEL,
    name: "성장하는 새싹",
    description: "10레벨에 도달하세요",
    requirement: { level: 10 },
    reward: { exp: 100, badge: "level_10" },
  },

  LEVEL_50: {
    id: "level_50",
    type: ACHIEVEMENT_TYPES.LEVEL,
    name: "헬스장 마스터",
    description: "50레벨에 도달하세요",
    requirement: { level: 50 },
    reward: { exp: 500, badge: "level_50" },
  },

  // 연속 업적
  STREAK_7: {
    id: "streak_7",
    type: ACHIEVEMENT_TYPES.STREAK,
    name: "일주일의 기적",
    description: "7일 연속으로 운동하세요",
    requirement: { streak: 7 },
    reward: { exp: 100, badge: "streak_7" },
  },

  STREAK_30: {
    id: "streak_30",
    type: ACHIEVEMENT_TYPES.STREAK,
    name: "한 달의 결심",
    description: "30일 연속으로 운동하세요",
    requirement: { streak: 30 },
    reward: { exp: 500, badge: "streak_30" },
  },

  // 운동 업적
  WORKOUT_100: {
    id: "workout_100",
    type: ACHIEVEMENT_TYPES.WORKOUT,
    name: "백전노장",
    description: "100번의 운동을 완료하세요",
    requirement: { workoutCount: 100 },
    reward: { exp: 300, badge: "workout_100" },
  },

  WORKOUT_1000: {
    id: "workout_1000",
    type: ACHIEVEMENT_TYPES.WORKOUT,
    name: "천전노장",
    description: "1000번의 운동을 완료하세요",
    requirement: { workoutCount: 1000 },
    reward: { exp: 1000, badge: "workout_1000" },
  },

  // 커뮤니티 업적
  POST_10: {
    id: "post_10",
    type: ACHIEVEMENT_TYPES.COMMUNITY,
    name: "활발한 소통자",
    description: "10개의 게시글을 작성하세요",
    requirement: { postCount: 10 },
    reward: { exp: 100, badge: "post_10" },
  },

  COMMENT_100: {
    id: "comment_100",
    type: ACHIEVEMENT_TYPES.COMMUNITY,
    name: "댓글 마스터",
    description: "100개의 댓글을 작성하세요",
    requirement: { commentCount: 100 },
    reward: { exp: 200, badge: "comment_100" },
  },

  // 특별 업적
  EARLY_BIRD: {
    id: "early_bird",
    type: ACHIEVEMENT_TYPES.SPECIAL,
    name: "일찍 일어나는 새",
    description: "오전 6시 이전에 운동을 시작하세요",
    requirement: { time: "06:00" },
    reward: { exp: 50, badge: "early_bird" },
  },

  NIGHT_OWL: {
    id: "night_owl",
    type: ACHIEVEMENT_TYPES.SPECIAL,
    name: "올빼미",
    description: "오후 10시 이후에 운동을 시작하세요",
    requirement: { time: "22:00" },
    reward: { exp: 50, badge: "night_owl" },
  },
} as const

// 시즌 정보
export const SEASONS = {
  SPRING: { name: "봄", months: [3, 4, 5] },
  SUMMER: { name: "여름", months: [6, 7, 8] },
  AUTUMN: { name: "가을", months: [9, 10, 11] },
  WINTER: { name: "겨울", months: [12, 1, 2] },
} as const

// 레벨별 색상
export const LEVEL_COLORS = {
  BRONZE: { min: 1, max: 20, color: "#cd7f32" },
  SILVER: { min: 21, max: 50, color: "#c0c0c0" },
  GOLD: { min: 51, max: 80, color: "#ffd700" },
  PLATINUM: { min: 81, max: 100, color: "#e5e4e2" },
} as const

// 레벨별 칭호
export const LEVEL_TITLES = {
  BRONZE: "브론즈",
  SILVER: "실버",
  GOLD: "골드",
  PLATINUM: "플래티넘",
} as const

// 레벨 진행률 계산
export const calculateLevelProgress = (
  currentExp: number,
  level: number
): number => {
  const baseExp = LEVEL_SYSTEM_CONFIG.BASE_EXP
  const multiplier = LEVEL_SYSTEM_CONFIG.EXP_MULTIPLIER

  const currentLevelExp = Math.floor(baseExp * Math.pow(multiplier, level - 1))
  const nextLevelExp = Math.floor(baseExp * Math.pow(multiplier, level))

  const progress =
    ((currentExp - currentLevelExp) / (nextLevelExp - currentLevelExp)) * 100
  return Math.max(0, Math.min(100, progress))
}

// 다음 레벨까지 필요한 경험치
export const getExpToNextLevel = (
  currentExp: number,
  level: number
): number => {
  const baseExp = LEVEL_SYSTEM_CONFIG.BASE_EXP
  const multiplier = LEVEL_SYSTEM_CONFIG.EXP_MULTIPLIER

  const currentLevelExp = Math.floor(baseExp * Math.pow(multiplier, level - 1))
  const nextLevelExp = Math.floor(baseExp * Math.pow(multiplier, level))

  return nextLevelExp - currentExp
}

// 레벨별 색상 가져오기
export const getLevelColor = (level: number): string => {
  for (const [tier, config] of Object.entries(LEVEL_COLORS)) {
    if (level >= config.min && level <= config.max) {
      return config.color
    }
  }
  return LEVEL_COLORS.BRONZE.color
}

// 레벨별 칭호 가져오기
export const getLevelTitle = (level: number): string => {
  for (const [tier, config] of Object.entries(LEVEL_COLORS)) {
    if (level >= config.min && level <= config.max) {
      return LEVEL_TITLES[tier as keyof typeof LEVEL_TITLES]
    }
  }
  return LEVEL_TITLES.BRONZE
}
