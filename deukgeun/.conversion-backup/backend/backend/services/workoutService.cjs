"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkoutService = void 0;
const databaseConfig_1 = require('config/databaseConfig');
const WorkoutPlan_1 = require('entities/WorkoutPlan');
const WorkoutSession_1 = require('entities/WorkoutSession');
const ExerciseSet_1 = require('entities/ExerciseSet');
const WorkoutGoal_1 = require('entities/WorkoutGoal');
const typeorm_1 = require("typeorm");
class WorkoutService {
    async createWorkoutPlan(planData) {
        try {
            const workoutPlanRepo = databaseConfig_1.AppDataSource.getRepository(WorkoutPlan_1.WorkoutPlan);
            const plan = workoutPlanRepo.create(planData);
            return await workoutPlanRepo.save(plan);
        }
        catch (error) {
            console.error("워크아웃 플랜 생성 오류:", error);
            return null;
        }
    }
    async getUserWorkoutPlans(userId) {
        try {
            const workoutPlanRepo = databaseConfig_1.AppDataSource.getRepository(WorkoutPlan_1.WorkoutPlan);
            return await workoutPlanRepo.find({
                where: { userId: userId },
                order: { createdAt: "DESC" },
            });
        }
        catch (error) {
            console.error("워크아웃 플랜 조회 오류:", error);
            return [];
        }
    }
    async getWorkoutPlanWithExercises(planId) {
        try {
            const workoutPlanRepo = databaseConfig_1.AppDataSource.getRepository(WorkoutPlan_1.WorkoutPlan);
            return await workoutPlanRepo.findOne({
                where: { id: planId },
                relations: ["exercises"],
            });
        }
        catch (error) {
            console.error("워크아웃 플랜 상세 조회 오류:", error);
            return null;
        }
    }
    async updateWorkoutPlan(planId, updateData) {
        try {
            const workoutPlanRepo = databaseConfig_1.AppDataSource.getRepository(WorkoutPlan_1.WorkoutPlan);
            const plan = await workoutPlanRepo.findOne({ where: { id: planId } });
            if (!plan)
                return null;
            Object.assign(plan, updateData);
            return await workoutPlanRepo.save(plan);
        }
        catch (error) {
            console.error("워크아웃 플랜 수정 오류:", error);
            return null;
        }
    }
    async deleteWorkoutPlan(planId) {
        try {
            const workoutPlanRepo = databaseConfig_1.AppDataSource.getRepository(WorkoutPlan_1.WorkoutPlan);
            const plan = await workoutPlanRepo.findOne({ where: { id: planId } });
            if (!plan)
                return false;
            await workoutPlanRepo.remove(plan);
            return true;
        }
        catch (error) {
            console.error("워크아웃 플랜 삭제 오류:", error);
            return false;
        }
    }
    async startWorkoutSession(sessionData) {
        try {
            const workoutSessionRepo = databaseConfig_1.AppDataSource.getRepository(WorkoutSession_1.WorkoutSession);
            const session = workoutSessionRepo.create({
                ...sessionData,
                startTime: new Date(),
                status: "in_progress",
            });
            return await workoutSessionRepo.save(session);
        }
        catch (error) {
            console.error("워크아웃 세션 시작 오류:", error);
            return null;
        }
    }
    async endWorkoutSession(sessionId) {
        try {
            const workoutSessionRepo = databaseConfig_1.AppDataSource.getRepository(WorkoutSession_1.WorkoutSession);
            const session = await workoutSessionRepo.findOne({
                where: { id: sessionId },
            });
            if (!session)
                return null;
            session.endTime = new Date();
            session.status = "completed";
            session.totalDurationMinutes = Math.round((session.endTime.getTime() - session.startTime.getTime()) / (1000 * 60));
            return await workoutSessionRepo.save(session);
        }
        catch (error) {
            console.error("워크아웃 세션 종료 오류:", error);
            return null;
        }
    }
    async completeWorkoutSession(sessionId, userId) {
        try {
            const workoutSessionRepo = databaseConfig_1.AppDataSource.getRepository(WorkoutSession_1.WorkoutSession);
            const session = await workoutSessionRepo.findOne({
                where: { id: sessionId, userId: userId },
            });
            if (!session)
                return null;
            session.endTime = new Date();
            session.status = "completed";
            session.totalDurationMinutes = Math.round((session.endTime.getTime() - session.startTime.getTime()) / (1000 * 60));
            return await workoutSessionRepo.save(session);
        }
        catch (error) {
            console.error("워크아웃 세션 완료 오류:", error);
            return null;
        }
    }
    async getUserWorkoutSessions(userId, limit = 20) {
        try {
            const workoutSessionRepo = databaseConfig_1.AppDataSource.getRepository(WorkoutSession_1.WorkoutSession);
            return await workoutSessionRepo.find({
                where: { userId: userId },
                order: { startTime: "DESC" },
                take: limit,
            });
        }
        catch (error) {
            console.error("워크아웃 세션 조회 오류:", error);
            return [];
        }
    }
    async addExerciseSet(setData) {
        try {
            const exerciseSetRepo = databaseConfig_1.AppDataSource.getRepository(ExerciseSet_1.ExerciseSet);
            const set = exerciseSetRepo.create(setData);
            return await exerciseSetRepo.save(set);
        }
        catch (error) {
            console.error("운동 세트 추가 오류:", error);
            return null;
        }
    }
    async getSessionExerciseSets(sessionId) {
        try {
            const exerciseSetRepo = databaseConfig_1.AppDataSource.getRepository(ExerciseSet_1.ExerciseSet);
            return await exerciseSetRepo.find({
                where: { sessionId: sessionId },
                order: { createdAt: "ASC" },
            });
        }
        catch (error) {
            console.error("운동 세트 조회 오류:", error);
            return [];
        }
    }
    async createWorkoutGoal(goalData) {
        try {
            const workoutGoalRepo = databaseConfig_1.AppDataSource.getRepository(WorkoutGoal_1.WorkoutGoal);
            const goal = workoutGoalRepo.create(goalData);
            return await workoutGoalRepo.save(goal);
        }
        catch (error) {
            console.error("워크아웃 목표 생성 오류:", error);
            return null;
        }
    }
    async getUserWorkoutGoals(userId) {
        try {
            const workoutGoalRepo = databaseConfig_1.AppDataSource.getRepository(WorkoutGoal_1.WorkoutGoal);
            return await workoutGoalRepo.find({
                where: { userId: userId },
                order: { createdAt: "DESC" },
            });
        }
        catch (error) {
            console.error("워크아웃 목표 조회 오류:", error);
            return [];
        }
    }
    async updateWorkoutGoal(goalId, updateData) {
        try {
            const workoutGoalRepo = databaseConfig_1.AppDataSource.getRepository(WorkoutGoal_1.WorkoutGoal);
            const goal = await workoutGoalRepo.findOne({ where: { id: goalId } });
            if (!goal)
                return null;
            Object.assign(goal, updateData);
            return await workoutGoalRepo.save(goal);
        }
        catch (error) {
            console.error("워크아웃 목표 수정 오류:", error);
            return null;
        }
    }
    async deleteWorkoutGoal(goalId) {
        try {
            const workoutGoalRepo = databaseConfig_1.AppDataSource.getRepository(WorkoutGoal_1.WorkoutGoal);
            const goal = await workoutGoalRepo.findOne({ where: { id: goalId } });
            if (!goal)
                return false;
            await workoutGoalRepo.remove(goal);
            return true;
        }
        catch (error) {
            console.error("워크아웃 목표 삭제 오류:", error);
            return false;
        }
    }
    async getWorkoutProgress(userId, machineId) {
        try {
            const workoutSessionRepo = databaseConfig_1.AppDataSource.getRepository(WorkoutSession_1.WorkoutSession);
            const exerciseSetRepo = databaseConfig_1.AppDataSource.getRepository(ExerciseSet_1.ExerciseSet);
            const sessionWhere = { userId: userId, status: "completed" };
            const setWhere = {};
            if (machineId) {
                setWhere.machineId = machineId;
            }
            const sessions = await workoutSessionRepo.find({
                where: sessionWhere,
                order: { endTime: "DESC" },
                take: 10,
            });
            const sessionIds = sessions.map(s => s.id);
            const sets = sessionIds.length > 0
                ? await exerciseSetRepo.find({
                    where: machineId
                        ? { sessionId: (0, typeorm_1.In)(sessionIds), machineId: machineId }
                        : { sessionId: (0, typeorm_1.In)(sessionIds) },
                    order: { createdAt: "DESC" },
                })
                : [];
            return {
                sessions,
                sets,
                totalSessions: sessions.length,
                totalSets: sets.length,
            };
        }
        catch (error) {
            console.error("운동 진행 상황 조회 오류:", error);
            return {
                sessions: [],
                sets: [],
                totalSessions: 0,
                totalSets: 0,
            };
        }
    }
    async deleteExerciseSet(setId) {
        try {
            const exerciseSetRepo = databaseConfig_1.AppDataSource.getRepository(ExerciseSet_1.ExerciseSet);
            const set = await exerciseSetRepo.findOne({ where: { id: setId } });
            if (!set)
                return false;
            await exerciseSetRepo.remove(set);
            return true;
        }
        catch (error) {
            console.error("운동 세트 삭제 오류:", error);
            return false;
        }
    }
}
exports.WorkoutService = WorkoutService;
