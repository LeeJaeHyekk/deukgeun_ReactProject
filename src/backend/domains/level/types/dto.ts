// ============================================================================
// Level DTO Types
// ============================================================================

export type ExpActionType = 
  | "workout_completed"
  | "workout_streak"
  | "first_workout"
  | "level_up"
  | "post_created"
  | "comment_created"
  | "like_received"
  | "achievement_unlocked"
  | "daily_login"
  | "weekly_goal"
  | "monthly_goal"

export type RewardType = 
  | "exp_bonus"
  | "badge"
  | "title"
  | "item"

export type MilestoneType = 
  | "level"
  | "exp"
  | "streak"
  | "workouts"

export interface LevelConfig {
  levelUpFormula: (level: number) => number
  cooldownTimes: Record<string, number>
  levelRewards: Record<number, any>
  dailyExpLimit: number
  expValues: Record<string, number>
}

export interface UserLevelDTO {
  id: number
  userId: number
  level: number
  experience: number
  totalExperience: number
  currentExp: number
  totalExp: number
  seasonExp: number
  totalLevelUps: number
  lastLevelUpAt?: Date
  currentSeason: number
  seasonStartDate: Date
  seasonEndDate: Date
  createdAt: Date
  updatedAt: Date
  user?: {
    id: number
    nickname: string
    profileImage?: string
  }
}

export interface ExpHistoryDTO {
  id: number
  userId: number
  actionType: ExpActionType
  points: number
  description: string
  expGained: number
  source: string
  levelBefore: number
  levelAfter: number
  isLevelUp: boolean
  metadata?: Record<string, any>
  createdAt: Date
  user?: {
    id: number
    nickname: string
    profileImage?: string
  }
}

export interface UserRewardDTO {
  id: number
  userId: number
  rewardType: RewardType
  title: string
  description: string
  iconUrl?: string
  isClaimed: boolean
  claimedAt?: Date
  createdAt: Date
  user?: {
    id: number
    nickname: string
    profileImage?: string
  }
}

export interface MilestoneDTO {
  id: number
  userId: number
  milestoneType: MilestoneType
  title: string
  description: string
  iconUrl?: string
  achievedAt: Date
  user?: {
    id: number
    nickname: string
    profileImage?: string
  }
}

export interface CreateExpHistoryDTO {
  userId: number
  actionType: ExpActionType
  points: number
  description: string
  expGained: number
  source: string
  levelBefore: number
  levelAfter: number
  isLevelUp: boolean
  metadata?: Record<string, any>
}

export interface CreateUserRewardDTO {
  userId: number
  rewardType: RewardType
  title: string
  description: string
  iconUrl?: string
}

export interface CreateMilestoneDTO {
  userId: number
  milestoneType: MilestoneType
  title: string
  description: string
  iconUrl?: string
}
