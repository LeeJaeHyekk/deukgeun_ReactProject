// ============================================================================
// 레벨 시스템 관련 타입
// ============================================================================

// 경험치 액션 타입
export type ExpActionType = 
  | "workout_complete"
  | "goal_achieved"
  | "streak_milestone"
  | "post_created"
  | "comment_created"
  | "like_received"
  | "daily_login"
  | "weekly_challenge"
  | "monthly_challenge"
  | "achievement_unlocked"

// 스트릭 타입
export type StreakType = 
  | "daily_workout"
  | "weekly_goal"
  | "monthly_challenge"
  | "consecutive_login"

// 리워드 타입
export type RewardType = 
  | "badge"
  | "title"
  | "avatar_frame"
  | "profile_background"
  | "special_emote"
  | "premium_feature"

// 마일스톤 타입
export type MilestoneType = 
  | "workout_count"
  | "total_weight"
  | "streak_days"
  | "goal_achievements"
  | "community_engagement"
  | "level_reached"

// 사용자 레벨 정보
export interface UserLevel {
  id: number
  userId: number
  level: number
  currentExp: number
  totalExp: number
  createdAt: Date
  updatedAt: Date
}

// 경험치 히스토리
export interface ExpHistory {
  id: number
  userId: number
  action: ExpActionType
  expGained: number
  description: string
  metadata?: Record<string, unknown>
  createdAt: Date
}

// 사용자 스트릭
export interface UserStreak {
  id: number
  userId: number
  type: StreakType
  currentStreak: number
  longestStreak: number
  lastActivityDate: Date
  createdAt: Date
  updatedAt: Date
}

// 사용자 리워드
export interface UserReward {
  id: number
  userId: number
  type: RewardType
  name: string
  description: string
  iconUrl?: string
  unlockedAt: Date
  createdAt: Date
}

// 마일스톤
export interface Milestone {
  id: number
  userId: number
  type: MilestoneType
  name: string
  description: string
  targetValue: number
  currentValue: number
  isCompleted: boolean
  completedAt?: Date
  createdAt: Date
  updatedAt: Date
}

// 레벨 설정
export interface LevelConfig {
  level: number
  requiredExp: number
  title: string
  description: string
  rewards: RewardType[]
}

// 레벨 시스템 응답 타입
export interface LevelResponse {
  success: boolean
  message: string
  data?: {
    userLevel: UserLevel
    nextLevel?: LevelConfig
    recentExpHistory: ExpHistory[]
    currentStreaks: UserStreak[]
    recentRewards: UserReward[]
    activeMilestones: Milestone[]
  }
  error?: string
}

// 경험치 획득 요청 타입
export interface GainExpRequest {
  userId: number
  action: ExpActionType
  expAmount: number
  description: string
  metadata?: Record<string, unknown>
}

// 스트릭 업데이트 요청 타입
export interface UpdateStreakRequest {
  userId: number
  type: StreakType
  activityDate: Date
}

// 마일스톤 진행도 업데이트 요청 타입
export interface UpdateMilestoneRequest {
  userId: number
  type: MilestoneType
  value: number
}
