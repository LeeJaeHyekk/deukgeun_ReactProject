// ============================================================================
// Level Configuration
// ============================================================================

export interface LevelConfig {
  level: number
  requiredExp: number
  title: string
  description: string
  benefits: string[]
  color: string
}

// 레벨별 설정
export const LEVEL_CONFIGS: LevelConfig[] = [
  {
    level: 1,
    requiredExp: 0,
    title: "초보자",
    description: "운동을 시작하는 단계입니다",
    benefits: ["기본 운동 기록", "간단한 통계"],
    color: "#6B7280"
  },
  {
    level: 2,
    requiredExp: 100,
    title: "입문자",
    description: "운동에 익숙해지는 단계입니다",
    benefits: ["운동 계획 생성", "목표 설정"],
    color: "#10B981"
  },
  {
    level: 3,
    requiredExp: 300,
    title: "중급자",
    description: "체계적인 운동을 하는 단계입니다",
    benefits: ["고급 통계", "운동 분석"],
    color: "#3B82F6"
  },
  {
    level: 4,
    requiredExp: 600,
    title: "고급자",
    description: "운동을 마스터하는 단계입니다",
    benefits: ["커스텀 기능", "우선 지원"],
    color: "#8B5CF6"
  },
  {
    level: 5,
    requiredExp: 1000,
    title: "전문가",
    description: "운동의 달인입니다",
    benefits: ["모든 기능", "VIP 지원"],
    color: "#F59E0B"
  }
]

// 레벨별 경험치 계산 (백엔드와 동일한 공식 사용)
// 백엔드 공식: baseExp * multiplier^(level-1)
import { calculateLevelFromTotalExp } from '../utils/levelUtils'

export const calculateLevel = (totalExp: number): { level: number; currentExp: number; nextLevelExp: number } => {
  const result = calculateLevelFromTotalExp(totalExp)
  return {
    level: result.level,
    currentExp: result.currentExp,
    nextLevelExp: result.nextLevelExp,
  }
}

// 레벨 정보 가져오기
export const getLevelConfig = (level: number): LevelConfig | undefined => {
  return LEVEL_CONFIGS.find(config => config.level === level)
}

// 다음 레벨 정보 가져오기
export const getNextLevelConfig = (currentLevel: number): LevelConfig | undefined => {
  return LEVEL_CONFIGS.find(config => config.level === currentLevel + 1)
}

// 레벨 진행률 계산
export const calculateLevelProgress = (totalExp: number): number => {
  const { level, currentExp, nextLevelExp } = calculateLevel(totalExp)
  
  if (nextLevelExp === 0) return 100 // 최고 레벨
  
  const currentLevelConfig = getLevelConfig(level)
  const nextLevelConfig = getNextLevelConfig(level)
  
  if (!currentLevelConfig || !nextLevelConfig) return 0
  
  const expNeeded = nextLevelConfig.requiredExp - currentLevelConfig.requiredExp
  const progress = (currentExp / expNeeded) * 100
  
  return Math.min(progress, 100)
}

// API 상태 관리 인터페이스 - 개선된 타입 정의
export interface LevelApiState {
  isLoading: boolean
  error: string | null
  data: unknown
  isApiEnabled: boolean
  consecutiveErrors: number
  lastErrorTime: number | null
  shouldSkipApiCall: () => boolean
  recordSuccess: () => void
  recordError: () => void
  enableApi: () => void
  disableApi: () => void
  getConsecutiveErrors: () => number
  getIsApiEnabled: () => boolean
}

// API 상태 관리 타입 가드
export interface LevelApiStateManager {
  readonly state: LevelApiState
  isEnabled: () => boolean
  enable: () => void
  disable: () => void
  getConsecutiveErrors: () => number
  shouldSkip: () => boolean
  reset: () => void
}

// API 응답 타입 정의
export interface LevelApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  statusCode?: number
}

// API 에러 타입
export interface LevelApiError {
  message: string
  statusCode?: number
  response?: {
    status: number
    data?: unknown
  }
}

// API 상태 관리 구현
export const levelApiState: LevelApiState = {
  isLoading: false,
  error: null,
  data: null,
  isApiEnabled: true,
  consecutiveErrors: 0,
  lastErrorTime: null,

  shouldSkipApiCall: function() {
    return !this.isApiEnabled || this.consecutiveErrors >= 5
  },

  recordSuccess: function() {
    this.consecutiveErrors = 0
    this.error = null
    this.lastErrorTime = null
  },

  recordError: function() {
    this.consecutiveErrors++
    this.lastErrorTime = Date.now()
  },

  enableApi: function() {
    this.isApiEnabled = true
    this.consecutiveErrors = 0
    this.error = null
  },

  disableApi: function() {
    this.isApiEnabled = false
  },

  getConsecutiveErrors: function() {
    return this.consecutiveErrors
  },

  getIsApiEnabled: function() {
    return this.isApiEnabled
  }
}

// 레벨 설정 상수
export const LEVEL_CONFIG = {
  DEFAULT_LEVEL: 1,
  DEFAULT_EXP: 0,
  DEFAULT_EXP_TO_NEXT: 100,
  AUTO_DISABLE_ON_403: true,
  SUPPRESS_ERROR_LOGS: false,
  FEATURES: {
    EXP_GRANTING: true,
    LEADERBOARD: true,
    REWARDS: true,
  }
}

export default LEVEL_CONFIGS
