// ============================================================================
// 레벨 시스템 관련 타입 정의
// ============================================================================

// 사용자 레벨 정보
export interface UserLevel {
  id: number
  userId: number
  level: number
  currentExp: number
  totalExp: number
  seasonExp: number
  createdAt: Date
  updatedAt: Date
}

// 경험치 히스토리
export interface ExpHistory {
  id: number
  userId: number
  actionType: ExpActionType
  expGained: number
  source: string
  metadata?: Record<string, unknown>
  createdAt: Date
}

// 경험치 액션 타입
export type ExpActionType = 
  | "workout_complete"
  | "workout_streak"
  | "goal_achieved"
  | "post_created"
  | "comment_created"
  | "like_received"
  | "daily_login"
  | "weekly_challenge"
  | "monthly_milestone"

// 보상 타입
export type RewardType = "badge" | "achievement" | "item" | "title"

// 사용자 보상
export interface UserReward {
  id: number
  userId: number
  rewardType: RewardType
  rewardId: string
  rewardName: string
  rewardDescription?: string
  claimedAt?: Date
  expiresAt?: Date
  metadata?: Record<string, unknown>
  createdAt: Date
}

// 마일스톤
export interface Milestone {
  id: number
  userId: number
  milestoneType: MilestoneType
  milestoneName: string
  milestoneDescription?: string
  achievedAt: Date
  metadata?: Record<string, unknown>
  createdAt: Date
}

// 마일스톤 타입
export type MilestoneType = 
  | "workout_count"
  | "streak_days"
  | "total_exp"
  | "level_reached"
  | "goal_completed"
  | "community_engagement"

// 사용자 스트릭
export interface UserStreak {
  id: number
  userId: number
  streakType: StreakType
  currentCount: number
  maxCount: number
  lastActivity: Date
  createdAt: Date
  updatedAt: Date
}

// 스트릭 타입
export type StreakType = 
  | "workout"
  | "login"
  | "post"
  | "goal"

// 레벨 설정
export interface LevelConfig {
  level: number
  requiredExp: number
  title?: string
  badge?: string
  rewards?: string[]
}

// 레벨 시스템 응답 타입
export interface LevelSystemResponse {
  userLevel: UserLevel
  nextLevelExp: number
  progressPercentage: number
  recentExpHistory: ExpHistory[]
  rewards: UserReward[]
  milestones: Milestone[]
  streaks: UserStreak[]
}

// 경험치 획득 요청
export interface AddExpRequest {
  userId: number
  actionType: ExpActionType
  expAmount: number
  source: string
  metadata?: Record<string, unknown>
}

// 레벨업 이벤트
export interface LevelUpEvent {
  userId: number
  oldLevel: number
  newLevel: number
  expGained: number
  rewards?: UserReward[]
}
