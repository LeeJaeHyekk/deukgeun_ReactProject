"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoalService = void 0;
const databaseConfig_1 = require('../config/databaseConfig.cjs');
const GoalEntity_1 = require('../entities/GoalEntity.cjs');
const GoalHistoryEntity_1 = require('../entities/GoalHistoryEntity.cjs');
class GoalService {
    async listByUser(userId) {
        try {
            const repo = databaseConfig_1.AppDataSource.getRepository(GoalEntity_1.GoalEntity);
            return await repo.find({
                where: { userId },
                relations: ['history'],
                order: { createdAt: 'DESC' }
            });
        }
        catch (error) {
            console.error('목표 목록 조회 오류:', error);
            throw error;
        }
    }
    async getById(id) {
        try {
            const repo = databaseConfig_1.AppDataSource.getRepository(GoalEntity_1.GoalEntity);
            return await repo.findOne({
                where: { id },
                relations: ['history']
            });
        }
        catch (error) {
            console.error('목표 조회 오류:', error);
            throw error;
        }
    }
    async create(payload) {
        try {
            const repo = databaseConfig_1.AppDataSource.getRepository(GoalEntity_1.GoalEntity);
            const goalData = {
                ...payload,
                status: payload.status || 'planned',
                isCompleted: payload.isCompleted || false,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            const entity = repo.create(goalData);
            const saved = await repo.save(entity);
            return Array.isArray(saved) ? saved[0] : saved;
        }
        catch (error) {
            console.error('목표 생성 오류:', error);
            throw error;
        }
    }
    async update(id, payload) {
        try {
            const repo = databaseConfig_1.AppDataSource.getRepository(GoalEntity_1.GoalEntity);
            const goal = await repo.findOne({ where: { id } });
            if (!goal) {
                return null;
            }
            Object.assign(goal, payload, {
                updatedAt: new Date()
            });
            return await repo.save(goal);
        }
        catch (error) {
            console.error('목표 수정 오류:', error);
            throw error;
        }
    }
    async remove(id) {
        try {
            const repo = databaseConfig_1.AppDataSource.getRepository(GoalEntity_1.GoalEntity);
            const result = await repo.delete(id);
            return (result.affected || 0) > 0;
        }
        catch (error) {
            console.error('목표 삭제 오류:', error);
            throw error;
        }
    }
    async addHistory(goalId, historyData) {
        try {
            const historyRepo = databaseConfig_1.AppDataSource.getRepository(GoalHistoryEntity_1.GoalHistoryEntity);
            const historyEntity = historyRepo.create({
                goalId,
                ...historyData,
                date: historyData.date || new Date()
            });
            const saved = await historyRepo.save(historyEntity);
            return Array.isArray(saved) ? saved[0] : saved;
        }
        catch (error) {
            console.error('히스토리 추가 오류:', error);
            throw error;
        }
    }
    async completeGoal(id) {
        try {
            const repo = databaseConfig_1.AppDataSource.getRepository(GoalEntity_1.GoalEntity);
            const goal = await repo.findOne({ where: { id } });
            if (!goal) {
                return null;
            }
            goal.isCompleted = true;
            goal.status = 'completed';
            goal.completedAt = new Date();
            goal.updatedAt = new Date();
            return await repo.save(goal);
        }
        catch (error) {
            console.error('목표 완료 처리 오류:', error);
            throw error;
        }
    }
}
exports.GoalService = GoalService;
