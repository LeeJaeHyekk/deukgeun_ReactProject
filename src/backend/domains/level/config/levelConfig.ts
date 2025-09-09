export interface LevelConfig {
  baseExp: number
  multiplier: number
  maxLevel: number
  seasonDuration: number
}

export const getLevelConfig = (): LevelConfig => {
  return {
    baseExp: 100,
    multiplier: 1.5,
    maxLevel: 100,
    seasonDuration: 30 * 24 * 60 * 60 * 1000 // 30 days in milliseconds
  }
}

export const EXP_ACTIONS = {
  WORKOUT_COMPLETED: "workout_completed",
  WORKOUT_STREAK: "workout_streak",
  FIRST_WORKOUT: "first_workout",
  LEVEL_UP: "level_up",
  POST_CREATED: "post_created",
  COMMENT_CREATED: "comment_created",
  LIKE_RECEIVED: "like_received",
  ACHIEVEMENT_UNLOCKED: "achievement_unlocked",
  DAILY_LOGIN: "daily_login",
  WEEKLY_GOAL: "weekly_goal",
  MONTHLY_GOAL: "monthly_goal"
} as const

export const REWARD_TYPES = {
  EXP_BONUS: "exp_bonus",
  BADGE: "badge",
  TITLE: "title",
  ITEM: "item"
} as const

export const MILESTONE_TYPES = {
  LEVEL: "level",
  EXP: "exp",
  STREAK: "streak",
  WORKOUTS: "workouts"
} as const
