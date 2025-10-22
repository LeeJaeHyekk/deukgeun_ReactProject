"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LevelService = void 0;
const databaseConfig_1 = require('config/databaseConfig');
const UserLevel_1 = require('entities/UserLevel');
const ExpHistory_1 = require('entities/ExpHistory');
const UserReward_1 = require('entities/UserReward');
const Milestone_1 = require('entities/Milestone');
const typeorm_1 = require("typeorm");
const levelConfig_1 = require('config/levelConfig');
class LevelService {
    calculateRequiredExp(level) {
        const config = (0, levelConfig_1.getLevelConfig)();
        return Math.floor(config.levelUpFormula.baseExp *
            Math.pow(config.levelUpFormula.multiplier, level - 1));
    }
    async getUserLevel(userId) {
        try {
            const userLevelRepo = databaseConfig_1.AppDataSource.getRepository(UserLevel_1.UserLevel);
            return await userLevelRepo.findOne({ where: { userId } });
        }
        catch (error) {
            console.error("사용자 레벨 조회 오류:", error);
            return null;
        }
    }
    async createUserLevel(userId) {
        try {
            const userLevelRepo = databaseConfig_1.AppDataSource.getRepository(UserLevel_1.UserLevel);
            const userLevel = userLevelRepo.create({
                userId,
                level: 1,
                currentExp: 0,
                totalExp: 0,
                seasonExp: 0,
            });
            return await userLevelRepo.save(userLevel);
        }
        catch (error) {
            console.error("사용자 레벨 생성 오류:", error);
            throw error;
        }
    }
    async getLevelProgress(userId) {
        try {
            const userLevel = await this.getUserLevel(userId);
            if (!userLevel) {
                return null;
            }
            const requiredExp = this.calculateRequiredExp(userLevel.level);
            const progressPercentage = (userLevel.currentExp / requiredExp) * 100;
            return {
                level: userLevel.level,
                currentExp: userLevel.currentExp,
                totalExp: userLevel.totalExp,
                requiredExp,
                progressPercentage,
            };
        }
        catch (error) {
            console.error("레벨 진행률 조회 오류:", error);
            return null;
        }
    }
    async checkCooldown(userId, action) {
        try {
            const expHistoryRepo = databaseConfig_1.AppDataSource.getRepository(ExpHistory_1.ExpHistory);
            const config = (0, levelConfig_1.getLevelConfig)();
            const cooldownTimes = config.cooldownTimes;
            const cooldownTime = cooldownTimes[action] || 0;
            if (cooldownTime === 0) {
                return { isOnCooldown: false, remainingTime: 0 };
            }
            const recentAction = await expHistoryRepo.findOne({
                where: { userId, actionType: action },
                order: { createdAt: "DESC" },
            });
            if (!recentAction) {
                return { isOnCooldown: false, remainingTime: 0 };
            }
            const timeSinceLastAction = Date.now() - recentAction.createdAt.getTime();
            const isOnCooldown = timeSinceLastAction < cooldownTime;
            const remainingTime = Math.max(0, cooldownTime - timeSinceLastAction);
            return { isOnCooldown, remainingTime };
        }
        catch (error) {
            console.error("쿨다운 검증 오류:", error);
            return { isOnCooldown: false, remainingTime: 0 };
        }
    }
    async grantLevelUpRewards(userId, newLevel) {
        try {
            const rewards = [];
            const config = (0, levelConfig_1.getLevelConfig)();
            const levelRewards = config.levelRewards;
            const reward = levelRewards[newLevel];
            if (reward) {
                const userReward = await this.grantReward(userId, reward.type, {
                    name: reward.name,
                    description: reward.description,
                    level: newLevel,
                    ...reward.metadata,
                });
                if (userReward) {
                    rewards.push(userReward);
                }
            }
            return rewards;
        }
        catch (error) {
            console.error("레벨업 보상 지급 오류:", error);
            return [];
        }
    }
    async checkDailyExpLimit(userId, expToAdd) {
        try {
            const expHistoryRepo = databaseConfig_1.AppDataSource.getRepository(ExpHistory_1.ExpHistory);
            const config = (0, levelConfig_1.getLevelConfig)();
            const DAILY_EXP_LIMIT = config.dailyExpLimit;
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            const todayExpHistory = await expHistoryRepo.find({
                where: {
                    userId,
                    createdAt: (0, typeorm_1.Between)(today, tomorrow),
                },
            });
            const dailyExp = todayExpHistory.reduce((sum, history) => sum + history.expGained, 0);
            const withinLimit = dailyExp + expToAdd <= DAILY_EXP_LIMIT;
            return {
                withinLimit,
                dailyExp,
                limit: DAILY_EXP_LIMIT,
            };
        }
        catch (error) {
            console.error("일일 경험치 한도 검증 오류:", error);
            return { withinLimit: true, dailyExp: 0, limit: 500 };
        }
    }
    async grantExp(userId, action, reason, data) {
        try {
            const cooldownInfo = await this.checkCooldown(userId, action);
            if (cooldownInfo.isOnCooldown) {
                return {
                    success: false,
                    level: 0,
                    currentExp: 0,
                    totalExp: 0,
                    leveledUp: false,
                    expGained: 0,
                    cooldownInfo,
                };
            }
            const expAmount = this.calculateExpAmount(action, reason);
            const dailyLimitInfo = await this.checkDailyExpLimit(userId, expAmount);
            if (!dailyLimitInfo.withinLimit) {
                return {
                    success: false,
                    level: 0,
                    currentExp: 0,
                    totalExp: 0,
                    leveledUp: false,
                    expGained: 0,
                    dailyLimitInfo,
                };
            }
            const userLevelRepo = databaseConfig_1.AppDataSource.getRepository(UserLevel_1.UserLevel);
            const expHistoryRepo = databaseConfig_1.AppDataSource.getRepository(ExpHistory_1.ExpHistory);
            let userLevel = await userLevelRepo.findOne({ where: { userId } });
            if (!userLevel) {
                userLevel = await this.createUserLevel(userId);
            }
            const expHistory = expHistoryRepo.create({
                userId,
                actionType: action,
                source: reason,
                expGained: expAmount,
                metadata: data,
            });
            await expHistoryRepo.save(expHistory);
            const oldLevel = userLevel.level;
            userLevel.currentExp += expAmount;
            userLevel.totalExp += expAmount;
            userLevel.seasonExp += expAmount;
            let leveledUp = false;
            let rewards = [];
            while (userLevel.currentExp >= this.calculateRequiredExp(userLevel.level)) {
                userLevel.currentExp -= this.calculateRequiredExp(userLevel.level);
                userLevel.level += 1;
                leveledUp = true;
                const levelRewards = await this.grantLevelUpRewards(userId, userLevel.level);
                rewards.push(...levelRewards);
            }
            await userLevelRepo.save(userLevel);
            return {
                success: true,
                level: userLevel.level,
                currentExp: userLevel.currentExp,
                totalExp: userLevel.totalExp,
                leveledUp,
                expGained: expAmount,
                levelUp: leveledUp ? userLevel.level : undefined,
                cooldownInfo,
                rewards: rewards.length > 0 ? rewards : undefined,
                dailyLimitInfo,
            };
        }
        catch (error) {
            console.error("경험치 부여 오류:", error);
            throw error;
        }
    }
    calculateExpAmount(action, reason) {
        const config = (0, levelConfig_1.getLevelConfig)();
        return config.expValues[action]?.[reason] || 10;
    }
    async getExpHistory(userId, limit = 20) {
        try {
            const expHistoryRepo = databaseConfig_1.AppDataSource.getRepository(ExpHistory_1.ExpHistory);
            return await expHistoryRepo.find({
                where: { userId },
                order: { createdAt: "DESC" },
                take: limit,
            });
        }
        catch (error) {
            console.error("경험치 히스토리 조회 오류:", error);
            return [];
        }
    }
    async grantReward(userId, rewardType, rewardData) {
        try {
            const rewardRepo = databaseConfig_1.AppDataSource.getRepository(UserReward_1.UserReward);
            const reward = rewardRepo.create({
                userId,
                rewardType: rewardType,
                rewardId: `reward_${Date.now()}`,
                metadata: rewardData,
            });
            return await rewardRepo.save(reward);
        }
        catch (error) {
            console.error("리워드 부여 오류:", error);
            return null;
        }
    }
    async getUserRewards(userId) {
        try {
            const rewardRepo = databaseConfig_1.AppDataSource.getRepository(UserReward_1.UserReward);
            return await rewardRepo.find({
                where: { userId },
                order: { createdAt: "DESC" },
            });
        }
        catch (error) {
            console.error("사용자 리워드 조회 오류:", error);
            return [];
        }
    }
    async claimReward(rewardId, userId) {
        try {
            const rewardRepo = databaseConfig_1.AppDataSource.getRepository(UserReward_1.UserReward);
            const reward = await rewardRepo.findOne({
                where: { id: rewardId, userId },
            });
            if (!reward || reward.claimedAt) {
                return false;
            }
            reward.claimedAt = new Date();
            await rewardRepo.save(reward);
            return true;
        }
        catch (error) {
            console.error("리워드 수령 오류:", error);
            return false;
        }
    }
    async checkMilestones(userId) {
        try {
            const userLevelRepo = databaseConfig_1.AppDataSource.getRepository(UserLevel_1.UserLevel);
            const milestoneRepo = databaseConfig_1.AppDataSource.getRepository(Milestone_1.Milestone);
            const userLevel = await userLevelRepo.findOne({ where: { userId } });
            if (!userLevel)
                return [];
            const achievableMilestones = await milestoneRepo.find({
                where: {
                    userId,
                    achieved: false,
                },
            });
            const achievedMilestones = [];
            for (const milestone of achievableMilestones) {
                milestone.achieved = true;
                milestone.achievedAt = new Date();
                milestone.userId = userId;
                await milestoneRepo.save(milestone);
                achievedMilestones.push(milestone);
            }
            return achievedMilestones;
        }
        catch (error) {
            console.error("마일스톤 체크 오류:", error);
            return [];
        }
    }
    async getUserMilestones(userId) {
        try {
            const milestoneRepo = databaseConfig_1.AppDataSource.getRepository(Milestone_1.Milestone);
            return await milestoneRepo.find({
                where: { userId },
                order: { achievedAt: "DESC" },
            });
        }
        catch (error) {
            console.error("사용자 마일스톤 조회 오류:", error);
            return [];
        }
    }
}
exports.LevelService = LevelService;
