// ============================================================================
// 레벨 시스템 관련 DTO 타입들
// ============================================================================

export interface UserLevelDTO {
  id: string
  userId: string
  level: number
  currentExp: number
  totalExp: number
  seasonExp: number
  expToNextLevel: number
  progressPercentage: number
  createdAt: Date
  updatedAt: Date
}

export interface UserRewardDTO {
  id: string
  userId: string
  rewardType: string
  rewardValue: any
  isClaimed: boolean
  claimedAt?: Date
  expiresAt?: Date
  createdAt: Date
  updatedAt: Date
}

export interface ExpHistoryDTO {
  id: string
  userId: string
  expAmount: number
  source: string
  metadata?: Record<string, any>
  createdAt: Date
}

export interface UserStreakDTO {
  id: string
  userId: string
  currentStreak: number
  longestStreak: number
  lastActivityDate: Date
  createdAt: Date
  updatedAt: Date
}

export interface MilestoneDTO {
  id: string
  userId: string
  milestoneType: string
  milestoneValue: any
  isAchieved: boolean
  achievedAt?: Date
  createdAt: Date
  updatedAt: Date
}

// 레벨 관련 응답 타입들
export interface LevelProgressDTO {
  level: number
  currentExp: number
  totalExp: number
  seasonExp: number
  expToNextLevel: number
  progressPercentage: number
}

export interface LevelUpResponseDTO {
  success: boolean
  newLevel: number
  expGained: number
  rewards?: UserRewardDTO[]
  message?: string
}

export interface ExpGainResponseDTO {
  success: boolean
  expGained: number
  newTotalExp: number
  levelUp?: LevelUpResponseDTO
  cooldownInfo?: {
    remainingTime: number
    message: string
  }
  dailyLimitInfo?: {
    remaining: number
    limit: number
    message: string
  }
}
