"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.levelConfig = void 0;
exports.getLevelConfig = getLevelConfig;
exports.levelConfig = {
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
    cooldownTimes: {
        development: {
            post: 10 * 1000,
            comment: 5 * 1000,
            like: 2 * 1000,
            workout: 30 * 1000,
            gym_visit: 60 * 1000,
            mission: 60 * 1000,
        },
        production: {
            post: 5 * 60 * 1000,
            comment: 1 * 60 * 1000,
            like: 5 * 1000,
            workout: 60 * 60 * 1000,
            gym_visit: 24 * 60 * 60 * 1000,
            mission: 24 * 60 * 60 * 1000,
        },
    },
    dailyExpLimits: {
        development: 100,
        production: 500,
    },
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
    levelUpFormula: {
        baseExp: 100,
        multiplier: 1.5,
    },
};
function getLevelConfig() {
    const env = process.env.NODE_ENV || "development";
    return {
        expValues: exports.levelConfig.expValues,
        cooldownTimes: exports.levelConfig.cooldownTimes[env] || exports.levelConfig.cooldownTimes.development,
        dailyExpLimit: exports.levelConfig.dailyExpLimits[env] || exports.levelConfig.dailyExpLimits.development,
        levelRewards: exports.levelConfig.levelRewards,
        levelUpFormula: exports.levelConfig.levelUpFormula,
    };
}
