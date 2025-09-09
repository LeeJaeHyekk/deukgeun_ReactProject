// 레벨 시스템 관련 타입 정의

export interface LevelProgress {
  currentLevel: number
  currentExp: number
  maxExp: number
  progressPercentage: number
  nextLevelExp: number
  totalExp: number
}

export interface Achievement {
  id: number
  name: string
  description: string
  icon: string
  category: AchievementCategory
  requirement: number
  reward: AchievementReward
  unlockedAt?: Date
  isUnlocked: boolean
}

export interface AchievementCategory {
  id: number
  name: string
  description: string
  icon: string
  color: string
}

export interface AchievementReward {
  exp: number
  title?: string
  badge?: string
  item?: string
}

export interface LevelConfig {
  level: number
  requiredExp: number
  title: string
  color: string
  benefits: string[]
}

export interface ExpHistory {
  id: number
  userId: number
  amount: number
  source: ExpSource
  description: string
  createdAt: Date
}

export interface ExpSource {
  type: 'workout' | 'achievement' | 'daily_login' | 'community' | 'admin'
  id?: number
  name: string
}

export interface UserLevel {
  id: number
  userId: number
  level: number
  exp: number
  totalExp: number
  achievements: Achievement[]
  lastUpdated: Date
}

export interface LevelUpNotification {
  newLevel: number
  newTitle: string
  rewards: AchievementReward[]
  benefits: string[]
}

export interface ExpMultiplier {
  source: ExpSource['type']
  multiplier: number
  description: string
  validUntil?: Date
}

export interface LeaderboardEntry {
  rank: number
  userId: number
  userName: string
  userAvatar?: string
  level: number
  exp: number
  achievements: number
}

export interface LevelStats {
  totalUsers: number
  averageLevel: number
  topLevel: number
  totalExp: number
  recentLevelUps: number
}
