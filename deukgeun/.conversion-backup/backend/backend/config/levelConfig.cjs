// 레벨링 시스템 설정
const levelConfig
module.exports.levelConfig = levelConfig = {
    // 경험치 계산 설정
    expValues: {
        post: {
            post_creation: 20,
            post_like: 5,
            post_comment: 10,
        },
        comment: {
            comment_creation: 5,
            comment_like: 2,
        },
        like: {
            post_like: 2,
            comment_like: 1,
        },
        workout: {
            workout_log: 15,
            workout_completion: 100,
            workout_goal_achieved: 200,
            streak_maintained: 50,
        },
        gym_visit: {
            gym_visit: 25,
        },
        mission: {
            mission_completion: 30,
        },
        social: {
            profile_completion: 30,
            first_post: 100,
            first_comment: 50,
        },
    },
    // 쿨다운 설정 (밀리초)
    cooldownTimes: {
        development: {
            post: 10 * 1000, // 10초
            comment: 5 * 1000, // 5초
            like: 2 * 1000, // 2초
            workout: 30 * 1000, // 30초
            gym_visit: 60 * 1000, // 1분
            mission: 60 * 1000, // 1분
        },
        production: {
            post: 5 * 60 * 1000, // 5분
            comment: 1 * 60 * 1000, // 1분
            like: 5 * 1000, // 5초
            workout: 60 * 60 * 1000, // 1시간
            gym_visit: 24 * 60 * 60 * 1000, // 24시간
            mission: 24 * 60 * 60 * 1000, // 24시간
        },
    },
    // 일일 경험치 한도 설정
    dailyExpLimits: {
        development: 100,
        production: 500,
    },
    // 레벨업 보상 설정
    levelRewards: {
        5: {
            type: "badge",
            name: "초보자 뱃지",
            description: "🥉 레벨 5 달성!",
            metadata: { badgeType: "bronze" },
        },
        10: {
            type: "access",
            name: "프리미엄 게시판 접근",
            description: "프리미엄 게시판에 접근할 수 있습니다.",
            metadata: { accessType: "premium_board" },
        },
        20: {
            type: "badge",
            name: "중급자 뱃지",
            description: "🥈 레벨 20 달성!",
            metadata: { badgeType: "silver" },
        },
        30: {
            type: "points",
            name: "1000 포인트 보너스",
            description: "1000 포인트를 획득했습니다!",
            metadata: { points: 1000 },
        },
        50: {
            type: "badge",
            name: "전문가 뱃지",
            description: "🥇 레벨 50 달성!",
            metadata: { badgeType: "gold" },
        },
        100: {
            type: "badge",
            name: "마스터 뱃지",
            description: "👑 레벨 100 달성!",
            metadata: { badgeType: "master" },
        },
    },
    // 레벨업 필요 경험치 계산 공식
    levelUpFormula: {
        baseExp: 100,
        multiplier: 1.5,
    },
};
// 현재 환경에 따른 설정 반환
function getLevelConfig
module.exports.getLevelConfig = getLevelConfig() {
    const env = process.env.NODE_ENV || "development";
    return {
        expValues: levelConfig.expValues,
        cooldownTimes: levelConfig.cooldownTimes[env] || levelConfig.cooldownTimes.development,
        dailyExpLimit: levelConfig.dailyExpLimits[env] || levelConfig.dailyExpLimits.development,
        levelRewards: levelConfig.levelRewards,
        levelUpFormula: levelConfig.levelUpFormula,
    }
module.exports.getLevelConfig = getLevelConfig;
}
