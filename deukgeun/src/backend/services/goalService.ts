// ============================================================================
// Goal Service - 목표 비즈니스 로직
// ============================================================================

import { AppDataSource } from '@backend/config/databaseConfig'
import { GoalEntity } from '../entities/GoalEntity'
import { GoalHistoryEntity } from '../entities/GoalHistoryEntity'

export class GoalService {
  /**
   * 사용자의 모든 목표 조회
   */
  async listByUser(userId: number): Promise<GoalEntity[]> {
    try {
      const repo = AppDataSource.getRepository(GoalEntity)
      return await repo.find({
        where: { userId },
        relations: ['history'],
        order: { createdAt: 'DESC' }
      })
    } catch (error) {
      console.error('목표 목록 조회 오류:', error)
      throw error
    }
  }

  /**
   * 특정 목표 조회
   */
  async getById(id: number): Promise<GoalEntity | null> {
    try {
      const repo = AppDataSource.getRepository(GoalEntity)
      return await repo.findOne({
        where: { id },
        relations: ['history']
      })
    } catch (error) {
      console.error('목표 조회 오류:', error)
      throw error
    }
  }

  /**
   * 새 목표 생성
   */
  async create(payload: Partial<GoalEntity>): Promise<GoalEntity> {
    try {
      const repo = AppDataSource.getRepository(GoalEntity)
      
      // 기본값 설정
      const goalData = {
        ...payload,
        status: payload.status || 'planned',
        isCompleted: payload.isCompleted || false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      const entity = repo.create(goalData as any)
      const saved = await repo.save(entity)
      // save는 배열을 반환할 수 있으므로 단일 엔티티인 경우 첫 번째 요소 반환
      return Array.isArray(saved) ? saved[0] : saved
    } catch (error) {
      console.error('목표 생성 오류:', error)
      throw error
    }
  }

  /**
   * 목표 수정
   */
  async update(id: number, payload: Partial<GoalEntity>): Promise<GoalEntity | null> {
    try {
      const repo = AppDataSource.getRepository(GoalEntity)
      const goal = await repo.findOne({ where: { id } })
      
      if (!goal) {
        return null
      }
      
      // updatedAt 자동 업데이트
      Object.assign(goal, payload, {
        updatedAt: new Date()
      })
      
      return await repo.save(goal)
    } catch (error) {
      console.error('목표 수정 오류:', error)
      throw error
    }
  }

  /**
   * 목표 삭제
   */
  async remove(id: number): Promise<boolean> {
    try {
      const repo = AppDataSource.getRepository(GoalEntity)
      const result = await repo.delete(id)
      return (result.affected || 0) > 0
    } catch (error) {
      console.error('목표 삭제 오류:', error)
      throw error
    }
  }

  /**
   * 히스토리 엔트리 추가
   */
  async addHistory(goalId: number, historyData: Partial<GoalHistoryEntity>): Promise<GoalHistoryEntity> {
    try {
      const historyRepo = AppDataSource.getRepository(GoalHistoryEntity)
      
      const historyEntity = historyRepo.create({
        goalId,
        ...historyData,
        date: historyData.date || new Date()
      } as any)
      
      const saved = await historyRepo.save(historyEntity)
      // save는 배열을 반환할 수 있으므로 단일 엔티티인 경우 첫 번째 요소 반환
      return Array.isArray(saved) ? saved[0] : saved
    } catch (error) {
      console.error('히스토리 추가 오류:', error)
      throw error
    }
  }

  /**
   * 목표 완료 처리
   */
  async completeGoal(id: number): Promise<GoalEntity | null> {
    try {
      const repo = AppDataSource.getRepository(GoalEntity)
      const goal = await repo.findOne({ where: { id } })
      
      if (!goal) {
        return null
      }
      
      goal.isCompleted = true
      goal.status = 'completed'
      goal.completedAt = new Date()
      goal.updatedAt = new Date()
      
      return await repo.save(goal)
    } catch (error) {
      console.error('목표 완료 처리 오류:', error)
      throw error
    }
  }
}

