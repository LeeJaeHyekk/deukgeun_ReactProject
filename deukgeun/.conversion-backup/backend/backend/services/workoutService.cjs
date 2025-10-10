const { AppDataSource  } = require('../config/database');
const { WorkoutPlan  } = require('../entities/WorkoutPlan');
const { WorkoutSession  } = require('../entities/WorkoutSession');
const { ExerciseSet  } = require('../entities/ExerciseSet');
const { WorkoutGoal  } = require('../entities/WorkoutGoal');
const { In  } = require('typeorm');
class WorkoutService
module.exports.WorkoutService = WorkoutService {
    // 워크아웃 플랜 생성
    async createWorkoutPlan(planData) {
        try {
            const workoutPlanRepo = AppDataSource.getRepository(WorkoutPlan);
            const plan = workoutPlanRepo.create(planData);
            return await workoutPlanRepo.save(plan);
        }
        catch (error) {
            console.error("워크아웃 플랜 생성 오류:", error);
            return null;
        }
    }
    // 사용자의 워크아웃 플랜 조회
    async getUserWorkoutPlans(userId) {
        try {
            const workoutPlanRepo = AppDataSource.getRepository(WorkoutPlan);
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
    // 워크아웃 플랜 상세 조회 (운동 포함)
    async getWorkoutPlanWithExercises(planId) {
        try {
            const workoutPlanRepo = AppDataSource.getRepository(WorkoutPlan);
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
    // 워크아웃 플랜 수정
    async updateWorkoutPlan(planId, updateData) {
        try {
            const workoutPlanRepo = AppDataSource.getRepository(WorkoutPlan);
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
    // 워크아웃 플랜 삭제
    async deleteWorkoutPlan(planId) {
        try {
            const workoutPlanRepo = AppDataSource.getRepository(WorkoutPlan);
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
    // 워크아웃 세션 시작
    async startWorkoutSession(sessionData) {
        try {
            const workoutSessionRepo = AppDataSource.getRepository(WorkoutSession);
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
    // 워크아웃 세션 종료
    async endWorkoutSession(sessionId) {
        try {
            const workoutSessionRepo = AppDataSource.getRepository(WorkoutSession);
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
    // 워크아웃 세션 완료 (completeWorkoutSession)
    async completeWorkoutSession(sessionId, userId) {
        try {
            const workoutSessionRepo = AppDataSource.getRepository(WorkoutSession);
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
    // 사용자의 워크아웃 세션 조회
    async getUserWorkoutSessions(userId, limit = 20) {
        try {
            const workoutSessionRepo = AppDataSource.getRepository(WorkoutSession);
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
    // 운동 세트 추가
    async addExerciseSet(setData) {
        try {
            const exerciseSetRepo = AppDataSource.getRepository(ExerciseSet);
            const set = exerciseSetRepo.create(setData);
            return await exerciseSetRepo.save(set);
        }
        catch (error) {
            console.error("운동 세트 추가 오류:", error);
            return null;
        }
    }
    // 세션의 운동 세트 조회
    async getSessionExerciseSets(sessionId) {
        try {
            const exerciseSetRepo = AppDataSource.getRepository(ExerciseSet);
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
    // 워크아웃 목표 생성
    async createWorkoutGoal(goalData) {
        try {
            const workoutGoalRepo = AppDataSource.getRepository(WorkoutGoal);
            const goal = workoutGoalRepo.create(goalData);
            return await workoutGoalRepo.save(goal);
        }
        catch (error) {
            console.error("워크아웃 목표 생성 오류:", error);
            return null;
        }
    }
    // 사용자의 워크아웃 목표 조회
    async getUserWorkoutGoals(userId) {
        try {
            const workoutGoalRepo = AppDataSource.getRepository(WorkoutGoal);
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
    // 워크아웃 목표 수정
    async updateWorkoutGoal(goalId, updateData) {
        try {
            const workoutGoalRepo = AppDataSource.getRepository(WorkoutGoal);
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
    // 워크아웃 목표 삭제
    async deleteWorkoutGoal(goalId) {
        try {
            const workoutGoalRepo = AppDataSource.getRepository(WorkoutGoal);
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
    // 운동 진행 상황 조회 (getWorkoutProgress)
    async getWorkoutProgress(userId, machineId) {
        try {
            const workoutSessionRepo = AppDataSource.getRepository(WorkoutSession);
            const exerciseSetRepo = AppDataSource.getRepository(ExerciseSet);
            // 기본 쿼리 조건
            const sessionWhere = { userId: userId, status: "completed" };
            const setWhere = {};
            if (machineId) {
                setWhere.machineId = machineId;
            }
            // 완료된 세션 조회
            const sessions = await workoutSessionRepo.find({
                where: sessionWhere,
                order: { endTime: "DESC" },
                take: 10,
            });
            // 운동 세트 조회
            const sessionIds = sessions.map(s => s.id);
            const sets = sessionIds.length > 0
                ? await exerciseSetRepo.find({
                    where: machineId
                        ? { sessionId: In(sessionIds), machineId: machineId }
                        : { sessionId: In(sessionIds) },
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
    // 운동 세트 삭제
    async deleteExerciseSet(setId) {
        try {
            const exerciseSetRepo = AppDataSource.getRepository(ExerciseSet);
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
