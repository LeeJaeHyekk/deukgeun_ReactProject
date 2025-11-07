"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSystemStats = exports.resetUserProgress = exports.updateLevelConfig = exports.getSeasonLeaderboard = exports.getGlobalLeaderboard = exports.checkCooldown = exports.grantExp = exports.getUserRewards = exports.getUserProgress = exports.getUserLevel = void 0;
const levelService_1 = require("../services/levelService.cjs");
const logger_1 = require("../utils/logger.cjs");
const levelService = new levelService_1.LevelService();
const getUserLevel = async (req, res) => {
    try {
        if (!req.user?.userId) {
            return res.status(401).json({ message: "인증이 필요합니다." });
        }
        const userId = parseInt(req.params.userId || "");
        if (isNaN(userId)) {
            return res.status(400).json({ message: "잘못된 사용자 ID입니다." });
        }
        if (req.user.userId !== userId && req.user.role !== "admin") {
            console.log(`🔐 권한 검사 실패: 요청된 사용자 ID: ${userId}, 토큰의 사용자 ID: ${req.user.userId}, 역할: ${req.user.role}`);
            return res.status(403).json({ message: "권한이 없습니다." });
        }
        console.log(`🔐 사용자 레벨 조회 시작: 사용자 ID ${userId}`);
        const userLevel = await levelService.getUserLevel(userId);
        const progress = await levelService.getLevelProgress(userId);
        console.log(`🔐 사용자 레벨 조회 성공: 사용자 ID ${userId}`);
        res.json({
            success: true,
            data: {
                userLevel,
                progress,
            },
        });
    }
    catch (error) {
        logger_1.logger.error("사용자 레벨 조회 실패:", error);
        res.status(500).json({ message: "서버 오류가 발생했습니다." });
    }
};
exports.getUserLevel = getUserLevel;
const getUserProgress = async (req, res) => {
    try {
        if (!req.user?.userId) {
            return res.status(401).json({ message: "인증이 필요합니다." });
        }
        const userId = parseInt(req.params.userId || "");
        if (isNaN(userId)) {
            return res.status(400).json({ message: "잘못된 사용자 ID입니다." });
        }
        if (req.user.userId !== userId && req.user.role !== "admin") {
            console.log(`🔐 권한 검사 실패: 요청된 사용자 ID: ${userId}, 토큰의 사용자 ID: ${req.user.userId}, 역할: ${req.user.role}`);
            return res.status(403).json({ message: "권한이 없습니다." });
        }
        console.log(`🔐 사용자 진행률 조회 시작: 사용자 ID ${userId}`);
        const progress = await levelService.getLevelProgress(userId);
        console.log(`🔐 사용자 진행률 조회 성공: 사용자 ID ${userId}`);
        res.json({
            success: true,
            data: progress,
        });
    }
    catch (error) {
        logger_1.logger.error("사용자 진행률 조회 실패:", error);
        res.status(500).json({ message: "서버 오류가 발생했습니다." });
    }
};
exports.getUserProgress = getUserProgress;
const getUserRewards = async (req, res) => {
    try {
        if (!req.user?.userId) {
            return res.status(401).json({ message: "인증이 필요합니다." });
        }
        const userId = parseInt(req.params.userId || "");
        if (isNaN(userId)) {
            return res.status(400).json({ message: "잘못된 사용자 ID입니다." });
        }
        if (req.user.userId !== userId && req.user.role !== "admin") {
            console.log(`🔐 권한 검사 실패: 요청된 사용자 ID: ${userId}, 토큰의 사용자 ID: ${req.user.userId}, 역할: ${req.user.role}`);
            return res.status(403).json({ message: "권한이 없습니다." });
        }
        console.log(`🔐 사용자 보상 조회 시작: 사용자 ID ${userId}`);
        const rewards = await levelService.getUserRewards(userId);
        console.log(`🔐 사용자 보상 조회 성공: 사용자 ID ${userId}`);
        res.json({
            success: true,
            data: rewards,
        });
    }
    catch (error) {
        logger_1.logger.error("사용자 보상 조회 실패:", error);
        res.status(500).json({ message: "서버 오류가 발생했습니다." });
    }
};
exports.getUserRewards = getUserRewards;
const grantExp = async (req, res) => {
    try {
        if (!req.user?.userId) {
            return res.status(401).json({ message: "인증이 필요합니다." });
        }
        const { actionType, source, metadata } = req.body;
        if (!actionType || !source) {
            return res.status(400).json({ message: "필수 필드가 누락되었습니다." });
        }
        const result = await levelService.grantExp(req.user.userId, actionType, source, metadata);
        if (result.success) {
            res.json({
                success: true,
                data: {
                    expGained: result.expGained,
                    levelUp: result.levelUp,
                    level: result.level,
                    currentExp: result.currentExp,
                    totalExp: result.totalExp,
                    leveledUp: result.leveledUp,
                    rewards: result.rewards,
                    cooldownInfo: result.cooldownInfo,
                    dailyLimitInfo: result.dailyLimitInfo,
                },
            });
        }
        else {
            let message = "경험치를 부여할 수 없습니다.";
            if (result.cooldownInfo?.isOnCooldown) {
                message = `쿨다운 중입니다. ${Math.ceil(result.cooldownInfo.remainingTime / 1000)}초 후 다시 시도해주세요.`;
            }
            else if (result.dailyLimitInfo && !result.dailyLimitInfo.withinLimit) {
                message = `일일 경험치 한도(${result.dailyLimitInfo.limit} EXP)를 초과했습니다.`;
            }
            res.status(400).json({
                success: false,
                message,
                data: {
                    cooldownInfo: result.cooldownInfo,
                    dailyLimitInfo: result.dailyLimitInfo,
                },
            });
        }
    }
    catch (error) {
        logger_1.logger.error("경험치 부여 실패:", error);
        res.status(500).json({ message: "서버 오류가 발생했습니다." });
    }
};
exports.grantExp = grantExp;
const checkCooldown = async (req, res) => {
    try {
        if (!req.user?.userId) {
            return res.status(401).json({ message: "인증이 필요합니다." });
        }
        const { actionType } = req.params;
        const userId = parseInt(req.params.userId || "");
        if (req.user.userId !== userId && req.user.role !== "admin") {
            return res.status(403).json({ message: "권한이 없습니다." });
        }
        res.json({
            success: true,
            data: {
                canPerform: true,
            },
        });
    }
    catch (error) {
        logger_1.logger.error("쿨다운 확인 실패:", error);
        res.status(500).json({ message: "서버 오류가 발생했습니다." });
    }
};
exports.checkCooldown = checkCooldown;
const getGlobalLeaderboard = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);
        res.json({
            success: true,
            data: {
                rankings: [],
                total: 0,
                page: parseInt(page),
                limit: parseInt(limit),
            },
        });
    }
    catch (error) {
        logger_1.logger.error("리더보드 조회 실패:", error);
        res.status(500).json({ message: "서버 오류가 발생했습니다." });
    }
};
exports.getGlobalLeaderboard = getGlobalLeaderboard;
const getSeasonLeaderboard = async (req, res) => {
    try {
        const { seasonId } = req.params;
        const { page = 1, limit = 20 } = req.query;
        res.json({
            success: true,
            data: {
                seasonId,
                rankings: [],
                total: 0,
                page: parseInt(page),
                limit: parseInt(limit),
            },
        });
    }
    catch (error) {
        logger_1.logger.error("시즌 리더보드 조회 실패:", error);
        res.status(500).json({ message: "서버 오류가 발생했습니다." });
    }
};
exports.getSeasonLeaderboard = getSeasonLeaderboard;
const updateLevelConfig = async (req, res) => {
    try {
        if (!req.user?.userId || req.user.role !== "admin") {
            return res.status(403).json({ message: "관리자만 접근할 수 있습니다." });
        }
        const { config } = req.body;
        logger_1.logger.info("레벨 설정 업데이트:", config);
        res.json({
            success: true,
            message: "설정이 업데이트되었습니다.",
        });
    }
    catch (error) {
        logger_1.logger.error("레벨 설정 업데이트 실패:", error);
        res.status(500).json({ message: "서버 오류가 발생했습니다." });
    }
};
exports.updateLevelConfig = updateLevelConfig;
const resetUserProgress = async (req, res) => {
    try {
        if (!req.user?.userId || req.user.role !== "admin") {
            return res.status(403).json({ message: "관리자만 접근할 수 있습니다." });
        }
        const { userId } = req.params;
        logger_1.logger.info(`사용자 진행률 리셋: User ID ${userId}`);
        res.json({
            success: true,
            message: "사용자 진행률이 리셋되었습니다.",
        });
    }
    catch (error) {
        logger_1.logger.error("사용자 진행률 리셋 실패:", error);
        res.status(500).json({ message: "서버 오류가 발생했습니다." });
    }
};
exports.resetUserProgress = resetUserProgress;
const getSystemStats = async (req, res) => {
    try {
        if (!req.user?.userId || req.user.role !== "admin") {
            return res.status(403).json({ message: "관리자만 접근할 수 있습니다." });
        }
        const stats = {
            totalUsers: 0,
            averageLevel: 0,
            totalExpGranted: 0,
            activeUsers: 0,
        };
        res.json({
            success: true,
            data: stats,
        });
    }
    catch (error) {
        logger_1.logger.error("시스템 통계 조회 실패:", error);
        res.status(500).json({ message: "서버 오류가 발생했습니다." });
    }
};
exports.getSystemStats = getSystemStats;
