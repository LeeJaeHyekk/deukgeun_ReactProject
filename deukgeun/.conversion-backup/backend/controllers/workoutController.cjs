"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkoutController = void 0;
const workoutService_1 = require('../services/workoutService.cjs');
const logger_1 = require('../utils/logger.cjs');
class WorkoutController {
    constructor() {
        this.workoutService = new workoutService_1.WorkoutService();
    }
    async getUserPlans(req, res, next) {
        try {
            if (!req.user?.userId) {
                res.status(401).json({ message: "인증이 필요합니다." });
                return;
            }
            const plans = await this.workoutService.getUserWorkoutPlans(req.user.userId);
            const planDTOs = Array.isArray(plans)
                ? plans.map(plan => typeof plan === "object" && plan !== null ? plan : plan)
                : plans;
            res.json(planDTOs);
        }
        catch (error) {
            logger_1.logger.error(`운동 계획 조회 실패: ${error}`);
            next(error);
        }
    }
    async createPlan(req, res, next) {
        try {
            if (!req.user?.userId) {
                res.status(401).json({ message: "인증이 필요합니다." });
                return;
            }
            const planData = {
                ...req.body,
                user_id: req.user.userId,
            };
            const plan = await this.workoutService.createWorkoutPlan(planData);
            const planDTO = typeof plan === "object" && plan !== null ? plan : plan;
            res.status(201).json(planDTO);
        }
        catch (error) {
            logger_1.logger.error(`운동 계획 생성 실패: ${error}`);
            next(error);
        }
    }
    async updatePlan(req, res, next) {
        try {
            if (!req.user?.userId) {
                res.status(401).json({ message: "인증이 필요합니다." });
                return;
            }
            const { id } = req.params;
            const plan = await this.workoutService.updateWorkoutPlan(parseInt(id || ""), req.body);
            const planDTO = typeof plan === "object" && plan !== null ? plan : plan;
            res.json(planDTO);
        }
        catch (error) {
            logger_1.logger.error(`운동 계획 수정 실패: ${error}`);
            next(error);
        }
    }
    async deletePlan(req, res, next) {
        try {
            if (!req.user?.userId) {
                res.status(401).json({ message: "인증이 필요합니다." });
                return;
            }
            const { id } = req.params;
            await this.workoutService.deleteWorkoutPlan(parseInt(id || ""));
            res.status(204).send();
        }
        catch (error) {
            logger_1.logger.error(`운동 계획 삭제 실패: ${error}`);
            next(error);
        }
    }
    async getUserSessions(req, res, next) {
        try {
            if (!req.user?.userId) {
                res.status(401).json({ message: "인증이 필요합니다." });
                return;
            }
            const sessions = await this.workoutService.getUserWorkoutSessions(req.user.userId);
            res.json(sessions);
        }
        catch (error) {
            logger_1.logger.error(`운동 세션 조회 실패: ${error}`);
            next(error);
        }
    }
    async startSession(req, res, next) {
        try {
            if (!req.user?.userId) {
                res.status(401).json({ message: "인증이 필요합니다." });
                return;
            }
            const sessionData = {
                ...req.body,
                user_id: req.user.userId,
                start_time: new Date(),
            };
            const session = await this.workoutService.startWorkoutSession(sessionData);
            res.status(201).json(session);
        }
        catch (error) {
            logger_1.logger.error(`운동 세션 시작 실패: ${error}`);
            next(error);
        }
    }
    async completeSession(req, res, next) {
        try {
            if (!req.user?.userId) {
                res.status(401).json({ message: "인증이 필요합니다." });
                return;
            }
            const { id } = req.params;
            const session = await this.workoutService.completeWorkoutSession(parseInt(id || ""), req.user.userId);
            res.json(session);
        }
        catch (error) {
            logger_1.logger.error(`운동 세션 완료 실패: ${error}`);
            next(error);
        }
    }
    async getUserGoals(req, res, next) {
        try {
            if (!req.user?.userId) {
                res.status(401).json({ message: "인증이 필요합니다." });
                return;
            }
            const goals = await this.workoutService.getUserWorkoutGoals(req.user.userId);
            res.json(goals);
        }
        catch (error) {
            logger_1.logger.error(`운동 목표 조회 실패: ${error}`);
            next(error);
        }
    }
    async createGoal(req, res, next) {
        try {
            if (!req.user?.userId) {
                res.status(401).json({ message: "인증이 필요합니다." });
                return;
            }
            const goalData = {
                ...req.body,
                user_id: req.user.userId,
            };
            const goal = await this.workoutService.createWorkoutGoal(goalData);
            res.status(201).json(goal);
        }
        catch (error) {
            logger_1.logger.error(`운동 목표 생성 실패: ${error}`);
            next(error);
        }
    }
    async updateGoal(req, res, next) {
        try {
            if (!req.user?.userId) {
                res.status(401).json({ message: "인증이 필요합니다." });
                return;
            }
            const { id } = req.params;
            const goal = await this.workoutService.updateWorkoutGoal(parseInt(id || ""), req.body);
            res.json(goal);
        }
        catch (error) {
            logger_1.logger.error(`운동 목표 수정 실패: ${error}`);
            next(error);
        }
    }
    async deleteGoal(req, res, next) {
        try {
            if (!req.user?.userId) {
                res.status(401).json({ message: "인증이 필요합니다." });
                return;
            }
            const { id } = req.params;
            await this.workoutService.deleteWorkoutGoal(parseInt(id || ""));
            res.status(204).send();
        }
        catch (error) {
            logger_1.logger.error(`운동 목표 삭제 실패: ${error}`);
            next(error);
        }
    }
    async getProgress(req, res, next) {
        try {
            if (!req.user?.userId) {
                res.status(401).json({ message: "인증이 필요합니다." });
                return;
            }
            const { machineId } = req.query;
            const progress = await this.workoutService.getWorkoutProgress(req.user.userId, machineId ? parseInt(machineId) : undefined);
            res.json(progress);
        }
        catch (error) {
            logger_1.logger.error(`운동 진행 상황 조회 실패: ${error}`);
            next(error);
        }
    }
}
exports.WorkoutController = WorkoutController;
