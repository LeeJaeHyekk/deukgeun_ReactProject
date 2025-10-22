// ============================================================================
// 레벨 시스템 관련 상수
// ============================================================================

// 레벨 시스템 설정
const LEVEL_SYSTEM
module.exports.LEVEL_SYSTEM = LEVEL_SYSTEM = {
  MAX_LEVEL: 100,
  BASE_EXP: 100,
  EXP_MULTIPLIER: 1.5,
  MAX_EXP_PER_ACTION: 1000,
} as const

// 경험치 액션 타입
const EXP_ACTION_TYPES
module.exports.EXP_ACTION_TYPES = EXP_ACTION_TYPES = {
  WORKOUT_COMPLETE: "workout_complete",
  WORKOUT_STREAK: "workout_streak",
  MACHINE_USE: "machine_use",
  POST_CREATE: "post_create",
  COMMENT_CREATE: "comment_create",
  LIKE_GIVE: "like_give",
  LIKE_RECEIVE: "like_receive",
  PROFILE_UPDATE: "profile_update",
  GOAL_ACHIEVE: "goal_achieve",
  MILESTONE_REACH: "milestone_reach",
  DAILY_LOGIN: "daily_login",
  WEEKLY_LOGIN: "weekly_login",
  MONTHLY_LOGIN: "monthly_login",
  GYM_VISIT: "gym_visit",
  MACHINE_REVIEW: "machine_review",
  GYM_REVIEW: "gym_review",
  WORKOUT_PLAN_CREATE: "workout_plan_create",
  WORKOUT_PLAN_COMPLETE: "workout_plan_complete",
  CHALLENGE_PARTICIPATE: "challenge_participate",
  CHALLENGE_COMPLETE: "challenge_complete",
} as const