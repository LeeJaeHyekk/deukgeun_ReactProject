// Level 시스템 - 레벨 관련 타입 정의

// 레벨 진행 상황
export interface LevelProgress {
  level: number
  currentExp: number
  totalExp: number
  seasonExp: number
  expToNextLevel: number
  progressPercentage: number
}

// 레벨 정보
export interface LevelInfo {
  level: number
  name: string
  description: string
  requiredExp: number
  rewards: LevelReward[]
  badge?: string
  color?: string
}

// 레벨 보상
export interface LevelReward {
  id: number
  type: "badge" | "title" | "item" | "feature"
  name: string
  description: string
  icon?: string
}

// 경험치 획득 요청
export interface GrantExpRequest {
  userId: string
  expAmount: number
  source: string
  actionType: string
  metadata?: Record<string, any>
}

// 경험치 획득 응답
export interface GrantExpResponse {
  success: boolean
  newLevel: number
  expGained: number
  totalExp: number
  levelUp?: boolean
  rewards?: LevelReward[]
  cooldownInfo?: CooldownInfo
  dailyLimitInfo?: DailyLimitInfo
}

// 쿨다운 정보
export interface CooldownInfo {
  actionType: string
  remainingTime: number
  nextAvailableAt: Date
}

// 일일 제한 정보
export interface DailyLimitInfo {
  actionType: string
  currentCount: number
  maxCount: number
  resetAt: Date
}

// 레벨업 알림
export interface LevelUpNotification {
  userId: string
  oldLevel: number
  newLevel: number
  expGained: number
  rewards: LevelReward[]
  timestamp: Date
}

// 시즌 정보
export interface SeasonInfo {
  id: number
  name: string
  startDate: Date
  endDate: Date
  isActive: boolean
  theme?: string
  specialRewards?: LevelReward[]
}

// 레벨 통계
export interface LevelStats {
  userId: string
  totalExp: number
  currentLevel: number
  highestLevel: number
  totalLevelUps: number
  seasonExp: number
  achievements: Achievement[]
  lastUpdated: Date
}

// 업적
export interface Achievement {
  id: number
  name: string
  description: string
  icon: string
  category: string
  isUnlocked: boolean
  unlockedAt?: Date
  progress?: number
  maxProgress?: number
}

// DTO 타입 (백엔드와의 호환성을 위해)
export type LevelProgressDTO = LevelProgress
export type LevelInfoDTO = LevelInfo
export type LevelRewardDTO = LevelReward
export type GrantExpRequestDTO = GrantExpRequest
export type GrantExpResponseDTO = GrantExpResponse

// API 응답 타입
export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
}
