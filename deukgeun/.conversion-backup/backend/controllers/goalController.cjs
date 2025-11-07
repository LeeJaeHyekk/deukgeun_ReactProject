"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoalController = void 0;
exports.createGoalRouter = createGoalRouter;
const express_1 = require("express");
const goalService_1 = require('../services/goalService.cjs.cjs');
const levelService_1 = require('../services/levelService.cjs');
const auth_1 = require('../middlewares/auth.cjs');
const rateLimiter_1 = require('../middlewares/rateLimiter.cjs');
const logger_1 = require('../utils/logger.cjs');
class GoalController {
    constructor() {
        this.goalService = new goalService_1.GoalService();
        this.levelService = new levelService_1.LevelService();
    }
    async getGoals(req, res, next) {
        try {
            const userId = req.query.userId ? Number(req.query.userId) : req.user?.userId;
            if (!userId) {
                res.status(400).json({ error: 'userId required' });
                return;
            }
            const goals = await this.goalService.listByUser(userId);
            const goalsData = goals.map(goal => ({
                userId: goal.userId,
                goalId: goal.id,
                goalTitle: goal.title,
                goalType: goal.type,
                description: goal.description,
                category: goal.category,
                targetMetrics: goal.targetMetrics,
                progress: goal.progress,
                status: goal.status,
                isCompleted: goal.isCompleted,
                completedAt: goal.completedAt ? goal.completedAt.toISOString() : undefined,
                startDate: goal.startDate ? goal.startDate.toISOString() : undefined,
                endDate: goal.endDate ? goal.endDate.toISOString() : undefined,
                deadline: goal.deadline ? goal.deadline.toISOString() : undefined,
                targetDate: goal.targetDate ? goal.targetDate.toISOString() : undefined,
                notes: goal.notes,
                difficulty: goal.difficulty,
                expReward: goal.expReward,
                planId: goal.planId,
                exerciseId: goal.exerciseId,
                gymId: goal.gymId,
                tasks: goal.tasks,
                activeWorkout: goal.activeWorkout,
                completedWorkouts: goal.completedWorkouts,
                history: goal.history?.map(h => ({
                    date: h.date.toISOString(),
                    sessionId: h.sessionId,
                    sessionName: h.sessionName,
                    completedAt: h.completedAt ? h.completedAt.toISOString() : undefined,
                    totalDurationMinutes: h.totalDurationMinutes,
                    totalSets: h.totalSets,
                    totalReps: h.totalReps,
                    expEarned: h.expEarned,
                    avgIntensity: h.avgIntensity,
                    moodRating: h.moodRating,
                    energyLevel: h.energyLevel,
                    notes: h.notes,
                    summary: h.summary,
                    actions: h.actions
                })),
                createdAt: goal.createdAt.toISOString(),
                updatedAt: goal.updatedAt.toISOString()
            }));
            res.json(goalsData);
        }
        catch (error) {
            logger_1.logger.error(`목표 조회 실패: ${error}`);
            res.status(500).json({ error: error.message || '목표 조회 실패' });
        }
    }
    async getGoal(req, res, next) {
        try {
            const id = Number(req.params.id);
            if (!id) {
                res.status(400).json({ error: 'Invalid goal id' });
                return;
            }
            const goal = await this.goalService.getById(id);
            if (!goal) {
                res.status(404).json({ error: 'Goal not found' });
                return;
            }
            const goalData = {
                userId: goal.userId,
                goalId: goal.id,
                goalTitle: goal.title,
                goalType: goal.type,
                description: goal.description,
                category: goal.category,
                targetMetrics: goal.targetMetrics,
                progress: goal.progress,
                status: goal.status,
                isCompleted: goal.isCompleted,
                completedAt: goal.completedAt ? goal.completedAt.toISOString() : undefined,
                startDate: goal.startDate ? goal.startDate.toISOString() : undefined,
                endDate: goal.endDate ? goal.endDate.toISOString() : undefined,
                deadline: goal.deadline ? goal.deadline.toISOString() : undefined,
                targetDate: goal.targetDate ? goal.targetDate.toISOString() : undefined,
                notes: goal.notes,
                difficulty: goal.difficulty,
                expReward: goal.expReward,
                planId: goal.planId,
                exerciseId: goal.exerciseId,
                gymId: goal.gymId,
                tasks: goal.tasks,
                activeWorkout: goal.activeWorkout,
                completedWorkouts: goal.completedWorkouts,
                history: goal.history?.map(h => ({
                    date: h.date.toISOString(),
                    sessionId: h.sessionId,
                    sessionName: h.sessionName,
                    completedAt: h.completedAt ? h.completedAt.toISOString() : undefined,
                    totalDurationMinutes: h.totalDurationMinutes,
                    totalSets: h.totalSets,
                    totalReps: h.totalReps,
                    expEarned: h.expEarned,
                    avgIntensity: h.avgIntensity,
                    moodRating: h.moodRating,
                    energyLevel: h.energyLevel,
                    notes: h.notes,
                    summary: h.summary,
                    actions: h.actions
                })),
                createdAt: goal.createdAt.toISOString(),
                updatedAt: goal.updatedAt.toISOString()
            };
            res.json(goalData);
        }
        catch (error) {
            logger_1.logger.error(`목표 조회 실패: ${error}`);
            res.status(500).json({ error: error.message || '목표 조회 실패' });
        }
    }
    async createGoal(req, res, next) {
        try {
            const userId = req.user?.userId || req.body.userId;
            if (!userId) {
                res.status(401).json({ message: '인증이 필요합니다.' });
                return;
            }
            const payload = {
                ...req.body,
                userId: Number(userId),
                title: req.body.goalTitle || req.body.title,
                type: req.body.goalType || req.body.type,
                status: req.body.status || 'planned',
                startDate: req.body.startDate ? new Date(req.body.startDate) : new Date(),
            };
            const goal = await this.goalService.create(payload);
            const goalData = {
                userId: goal.userId,
                goalId: goal.id,
                goalTitle: goal.title,
                goalType: goal.type,
                description: goal.description,
                category: goal.category,
                targetMetrics: goal.targetMetrics,
                progress: goal.progress,
                status: goal.status,
                isCompleted: goal.isCompleted,
                completedAt: goal.completedAt ? goal.completedAt.toISOString() : undefined,
                startDate: goal.startDate ? goal.startDate.toISOString() : undefined,
                endDate: goal.endDate ? goal.endDate.toISOString() : undefined,
                deadline: goal.deadline ? goal.deadline.toISOString() : undefined,
                targetDate: goal.targetDate ? goal.targetDate.toISOString() : undefined,
                notes: goal.notes,
                difficulty: goal.difficulty,
                expReward: goal.expReward,
                planId: goal.planId,
                exerciseId: goal.exerciseId,
                gymId: goal.gymId,
                tasks: goal.tasks,
                activeWorkout: goal.activeWorkout,
                completedWorkouts: goal.completedWorkouts,
                createdAt: goal.createdAt.toISOString(),
                updatedAt: goal.updatedAt.toISOString()
            };
            res.status(201).json(goalData);
        }
        catch (error) {
            logger_1.logger.error(`목표 생성 실패: ${error}`);
            res.status(500).json({ error: error.message || '목표 생성 실패' });
        }
    }
    async updateGoal(req, res, next) {
        try {
            const id = Number(req.params.id);
            if (!id) {
                res.status(400).json({ error: 'Invalid goal id' });
                return;
            }
            const userId = req.user?.userId;
            if (!userId) {
                res.status(401).json({ message: '인증이 필요합니다.' });
                return;
            }
            const updateData = { ...req.body };
            if (updateData.startDate)
                updateData.startDate = new Date(updateData.startDate);
            if (updateData.endDate)
                updateData.endDate = new Date(updateData.endDate);
            if (updateData.deadline)
                updateData.deadline = new Date(updateData.deadline);
            if (updateData.targetDate)
                updateData.targetDate = new Date(updateData.targetDate);
            if (updateData.completedAt)
                updateData.completedAt = new Date(updateData.completedAt);
            if (updateData.goalTitle && !updateData.title) {
                updateData.title = updateData.goalTitle;
                delete updateData.goalTitle;
            }
            if (updateData.goalType && !updateData.type) {
                updateData.type = updateData.goalType;
                delete updateData.goalType;
            }
            const goal = await this.goalService.update(id, updateData);
            if (!goal) {
                res.status(404).json({ error: 'Goal not found' });
                return;
            }
            if (updateData.history && Array.isArray(updateData.history) && userId) {
                const newHistoryEntries = updateData.history.filter((h) => h.expEarned && h.expEarned > 0);
                if (newHistoryEntries.length > 0) {
                    const latestEntry = newHistoryEntries[newHistoryEntries.length - 1];
                    try {
                        await this.levelService.grantExp(userId, "workout", "workout_completion", {
                            goalId: goal.id,
                            goalTitle: goal.title,
                            expEarned: latestEntry.expEarned,
                            totalSets: latestEntry.totalSets,
                            totalReps: latestEntry.totalReps,
                        });
                    }
                    catch (levelError) {
                        logger_1.logger.error(`운동 완료 경험치 부여 실패: ${levelError}`);
                    }
                }
            }
            if (updateData.completedWorkouts && Array.isArray(updateData.completedWorkouts) && userId) {
                const newCompletedWorkouts = updateData.completedWorkouts.filter((cw) => cw.expEarned && cw.expEarned > 0);
                if (newCompletedWorkouts.length > 0) {
                    const latestCompleted = newCompletedWorkouts[newCompletedWorkouts.length - 1];
                    try {
                        await this.levelService.grantExp(userId, "workout", "workout_completion", {
                            goalId: goal.id,
                            goalTitle: goal.title,
                            expEarned: latestCompleted.expEarned,
                            totalSets: latestCompleted.totalSets,
                            totalReps: latestCompleted.totalReps,
                        });
                    }
                    catch (levelError) {
                        logger_1.logger.error(`운동 완료 경험치 부여 실패: ${levelError}`);
                    }
                }
            }
            const goalData = {
                userId: goal.userId,
                goalId: goal.id,
                goalTitle: goal.title,
                goalType: goal.type,
                description: goal.description,
                category: goal.category,
                targetMetrics: goal.targetMetrics,
                progress: goal.progress,
                status: goal.status,
                isCompleted: goal.isCompleted,
                completedAt: goal.completedAt ? goal.completedAt.toISOString() : undefined,
                startDate: goal.startDate ? goal.startDate.toISOString() : undefined,
                endDate: goal.endDate ? goal.endDate.toISOString() : undefined,
                deadline: goal.deadline ? goal.deadline.toISOString() : undefined,
                targetDate: goal.targetDate ? goal.targetDate.toISOString() : undefined,
                notes: goal.notes,
                difficulty: goal.difficulty,
                expReward: goal.expReward,
                planId: goal.planId,
                exerciseId: goal.exerciseId,
                gymId: goal.gymId,
                tasks: goal.tasks,
                activeWorkout: goal.activeWorkout,
                completedWorkouts: goal.completedWorkouts,
                history: goal.history?.map(h => ({
                    date: h.date.toISOString(),
                    sessionId: h.sessionId,
                    sessionName: h.sessionName,
                    completedAt: h.completedAt ? h.completedAt.toISOString() : undefined,
                    totalDurationMinutes: h.totalDurationMinutes,
                    totalSets: h.totalSets,
                    totalReps: h.totalReps,
                    expEarned: h.expEarned,
                    avgIntensity: h.avgIntensity,
                    moodRating: h.moodRating,
                    energyLevel: h.energyLevel,
                    notes: h.notes,
                    summary: h.summary,
                    actions: h.actions
                })),
                createdAt: goal.createdAt.toISOString(),
                updatedAt: goal.updatedAt.toISOString()
            };
            res.json(goalData);
        }
        catch (error) {
            logger_1.logger.error(`목표 수정 실패: ${error}`);
            res.status(500).json({ error: error.message || '목표 수정 실패' });
        }
    }
    async deleteGoal(req, res, next) {
        try {
            const id = Number(req.params.id);
            if (!id) {
                res.status(400).json({ error: 'Invalid goal id' });
                return;
            }
            const userId = req.user?.userId;
            if (!userId) {
                res.status(401).json({ message: '인증이 필요합니다.' });
                return;
            }
            const success = await this.goalService.remove(id);
            if (!success) {
                res.status(404).json({ error: 'Goal not found' });
                return;
            }
            res.json({ success: true });
        }
        catch (error) {
            logger_1.logger.error(`목표 삭제 실패: ${error}`);
            res.status(500).json({ error: error.message || '목표 삭제 실패' });
        }
    }
}
exports.GoalController = GoalController;
function createGoalRouter() {
    const router = (0, express_1.Router)();
    const controller = new GoalController();
    router.get('/', auth_1.authMiddleware, (0, rateLimiter_1.rateLimiter)(60000, 30), controller.getGoals.bind(controller));
    router.get('/:id', auth_1.authMiddleware, (0, rateLimiter_1.rateLimiter)(60000, 30), controller.getGoal.bind(controller));
    router.post('/', auth_1.authMiddleware, (0, rateLimiter_1.rateLimiter)(60000, 10), controller.createGoal.bind(controller));
    router.put('/:id', auth_1.authMiddleware, (0, rateLimiter_1.rateLimiter)(60000, 10), controller.updateGoal.bind(controller));
    router.delete('/:id', auth_1.authMiddleware, (0, rateLimiter_1.rateLimiter)(60000, 10), controller.deleteGoal.bind(controller));
    return router;
}
