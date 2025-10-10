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
};
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
};
// 경험치 액션별 보상
const EXP_REWARDS
module.exports.EXP_REWARDS = EXP_REWARDS = {
    [EXP_ACTION_TYPES.WORKOUT_COMPLETE]: 50,
    [EXP_ACTION_TYPES.WORKOUT_STREAK]: 10,
    [EXP_ACTION_TYPES.MACHINE_USE]: 5,
    [EXP_ACTION_TYPES.POST_CREATE]: 20,
    [EXP_ACTION_TYPES.COMMENT_CREATE]: 10,
    [EXP_ACTION_TYPES.LIKE_GIVE]: 1,
    [EXP_ACTION_TYPES.LIKE_RECEIVE]: 5,
    [EXP_ACTION_TYPES.PROFILE_UPDATE]: 10,
    [EXP_ACTION_TYPES.GOAL_ACHIEVE]: 100,
    [EXP_ACTION_TYPES.MILESTONE_REACH]: 200,
    [EXP_ACTION_TYPES.DAILY_LOGIN]: 5,
    [EXP_ACTION_TYPES.WEEKLY_LOGIN]: 25,
    [EXP_ACTION_TYPES.MONTHLY_LOGIN]: 100,
    [EXP_ACTION_TYPES.GYM_VISIT]: 15,
    [EXP_ACTION_TYPES.MACHINE_REVIEW]: 30,
    [EXP_ACTION_TYPES.GYM_REVIEW]: 40,
    [EXP_ACTION_TYPES.WORKOUT_PLAN_CREATE]: 25,
    [EXP_ACTION_TYPES.WORKOUT_PLAN_COMPLETE]: 75,
    [EXP_ACTION_TYPES.CHALLENGE_PARTICIPATE]: 50,
    [EXP_ACTION_TYPES.CHALLENGE_COMPLETE]: 150,
};
// 레벨별 특별 보상
const LEVEL_REWARDS
module.exports.LEVEL_REWARDS = LEVEL_REWARDS = {
    10: { type: "badge", name: "초보 운동러", description: "첫 번째 레벨 달성" },
    25: { type: "badge", name: "열정 운동러", description: "25레벨 달성" },
    50: { type: "badge", name: "중급 운동러", description: "50레벨 달성" },
    75: { type: "badge", name: "고급 운동러", description: "75레벨 달성" },
    100: { type: "badge", name: "마스터 운동러", description: "최고 레벨 달성" },
};
// 스트릭 타입
const STREAK_TYPES
module.exports.STREAK_TYPES = STREAK_TYPES = {
    WORKOUT: "workout",
    LOGIN: "login",
    POST: "post",
    MACHINE_USE: "machine_use",
};
// 스트릭 보상
const STREAK_REWARDS
module.exports.STREAK_REWARDS = STREAK_REWARDS = {
    [STREAK_TYPES.WORKOUT]: {
        7: 50, // 7일 연속 운동
        14: 100, // 14일 연속 운동
        30: 250, // 30일 연속 운동
        60: 500, // 60일 연속 운동
        100: 1000, // 100일 연속 운동
    },
    [STREAK_TYPES.LOGIN]: {
        7: 25, // 7일 연속 로그인
        14: 50, // 14일 연속 로그인
        30: 125, // 30일 연속 로그인
        60: 250, // 60일 연속 로그인
        100: 500, // 100일 연속 로그인
    },
    [STREAK_TYPES.POST]: {
        7: 30, // 7일 연속 포스트
        14: 60, // 14일 연속 포스트
        30: 150, // 30일 연속 포스트
    },
    [STREAK_TYPES.MACHINE_USE]: {
        7: 40, // 7일 연속 기계 사용
        14: 80, // 14일 연속 기계 사용
        30: 200, // 30일 연속 기계 사용
    },
};
// 마일스톤 타입
const MILESTONE_TYPES
module.exports.MILESTONE_TYPES = MILESTONE_TYPES = {
    WORKOUT_COUNT: "workout_count",
    MACHINE_USE_COUNT: "machine_use_count",
    POST_COUNT: "post_count",
    COMMENT_COUNT: "comment_count",
    LIKE_COUNT: "like_count",
    GYM_VISIT_COUNT: "gym_visit_count",
    DAYS_ACTIVE: "days_active",
    TOTAL_EXP: "total_exp",
};
// 마일스톤 목표
const MILESTONE_GOALS
module.exports.MILESTONE_GOALS = MILESTONE_GOALS = {
    [MILESTONE_TYPES.WORKOUT_COUNT]: [10, 25, 50, 100, 250, 500, 1000],
    [MILESTONE_TYPES.MACHINE_USE_COUNT]: [50, 100, 250, 500, 1000, 2500, 5000],
    [MILESTONE_TYPES.POST_COUNT]: [5, 10, 25, 50, 100, 250, 500],
    [MILESTONE_TYPES.COMMENT_COUNT]: [10, 25, 50, 100, 250, 500, 1000],
    [MILESTONE_TYPES.LIKE_COUNT]: [25, 50, 100, 250, 500, 1000, 2500],
    [MILESTONE_TYPES.GYM_VISIT_COUNT]: [5, 10, 25, 50, 100, 250, 500],
    [MILESTONE_TYPES.DAYS_ACTIVE]: [7, 14, 30, 60, 100, 200, 365],
    [MILESTONE_TYPES.TOTAL_EXP]: [1000, 2500, 5000, 10000, 25000, 50000, 100000],
};
// 보상 타입
const REWARD_TYPES
module.exports.REWARD_TYPES = REWARD_TYPES = {
    BADGE: "badge",
    TITLE: "title",
    AVATAR_FRAME: "avatar_frame",
    BACKGROUND: "background",
    ANIMATION: "animation",
    FEATURE_UNLOCK: "feature_unlock",
};
// 레벨 시스템 API 엔드포인트
const LEVEL_API_ENDPOINTS
module.exports.LEVEL_API_ENDPOINTS = LEVEL_API_ENDPOINTS = {
    USER_LEVEL: "/api/level/user",
    EXP_HISTORY: "/api/level/exp-history",
    STREAKS: "/api/level/streaks",
    MILESTONES: "/api/level/milestones",
    REWARDS: "/api/level/rewards",
    LEADERBOARD: "/api/level/leaderboard",
    ADD_EXP: "/api/level/add-exp",
    RESET_STREAK: "/api/level/reset-streak",
};
// 레벨 시스템 페이지네이션
const LEVEL_PAGINATION
module.exports.LEVEL_PAGINATION = LEVEL_PAGINATION = {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100,
};
// 레벨 시스템 알림 타입
const LEVEL_NOTIFICATION_TYPES
module.exports.LEVEL_NOTIFICATION_TYPES = LEVEL_NOTIFICATION_TYPES = {
    LEVEL_UP: "level_up",
    STREAK_MILESTONE: "streak_milestone",
    MILESTONE_ACHIEVED: "milestone_achieved",
    REWARD_EARNED: "reward_earned",
    EXP_ADDED: "exp_added",
};
// 레벨 시스템 설정
const LEVEL_SETTINGS
module.exports.LEVEL_SETTINGS = LEVEL_SETTINGS = {
    MAX_DAILY_EXP: 1000,
    MAX_WEEKLY_EXP: 5000,
    MAX_MONTHLY_EXP: 20000,
    STREAK_RESET_HOURS: 24,
    MILESTONE_CHECK_INTERVAL: 3600000, // 1시간
};
