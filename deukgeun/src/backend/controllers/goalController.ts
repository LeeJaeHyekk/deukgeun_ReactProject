// ============================================================================
// Goal Controller - 목표 API 컨트롤러
// ============================================================================

import { Request, Response, NextFunction } from 'express'
import { Router } from 'express'
import { GoalService } from '../services/goalService'
import { LevelService } from '@backend/services/levelService'
import { authMiddleware } from '@backend/middlewares/auth'
import { rateLimiter } from '@backend/middlewares/rateLimiter'
import { logger } from '@backend/utils/logger'

export class GoalController {
  private goalService: GoalService
  private levelService: LevelService

  constructor() {
    this.goalService = new GoalService()
    this.levelService = new LevelService()
  }

  /**
   * 사용자의 모든 목표 조회
   * GET /api/workouts/goals?userId=...
   */
  async getGoals(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.query.userId ? Number(req.query.userId) : req.user?.userId
      
      if (!userId) {
        res.status(400).json({ error: 'userId required' })
        return
      }

      const goals = await this.goalService.listByUser(userId)
      
      // 엔티티를 JSON으로 변환 (JSON 필드 파싱)
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
      }))

      res.json(goalsData)
    } catch (error: any) {
      logger.error(`목표 조회 실패: ${error}`)
      res.status(500).json({ error: error.message || '목표 조회 실패' })
    }
  }

  /**
   * 특정 목표 조회
   * GET /api/workouts/goals/:id
   */
  async getGoal(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Number(req.params.id)
      if (!id) {
        res.status(400).json({ error: 'Invalid goal id' })
        return
      }

      const goal = await this.goalService.getById(id)
      if (!goal) {
        res.status(404).json({ error: 'Goal not found' })
        return
      }

      // 엔티티를 JSON으로 변환
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
      }

      res.json(goalData)
    } catch (error: any) {
      logger.error(`목표 조회 실패: ${error}`)
      res.status(500).json({ error: error.message || '목표 조회 실패' })
    }
  }

  /**
   * 새 목표 생성
   * POST /api/workouts/goals
   */
  async createGoal(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId || req.body.userId
      if (!userId) {
        res.status(401).json({ message: '인증이 필요합니다.' })
        return
      }

      const payload = {
        ...req.body,
        userId: Number(userId),
        title: req.body.goalTitle || req.body.title,
        type: req.body.goalType || req.body.type,
        status: req.body.status || 'planned',
        startDate: req.body.startDate ? new Date(req.body.startDate) : new Date(),
      }

      const goal = await this.goalService.create(payload)
      
      // 엔티티를 JSON으로 변환
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
      }

      res.status(201).json(goalData)
    } catch (error: any) {
      logger.error(`목표 생성 실패: ${error}`)
      res.status(500).json({ error: error.message || '목표 생성 실패' })
    }
  }

  /**
   * 목표 수정
   * PUT /api/workouts/goals/:id
   */
  async updateGoal(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Number(req.params.id)
      if (!id) {
        res.status(400).json({ error: 'Invalid goal id' })
        return
      }

      const userId = req.user?.userId
      if (!userId) {
        res.status(401).json({ message: '인증이 필요합니다.' })
        return
      }

      // Date 필드 변환
      const updateData: any = { ...req.body }
      if (updateData.startDate) updateData.startDate = new Date(updateData.startDate)
      if (updateData.endDate) updateData.endDate = new Date(updateData.endDate)
      if (updateData.deadline) updateData.deadline = new Date(updateData.deadline)
      if (updateData.targetDate) updateData.targetDate = new Date(updateData.targetDate)
      if (updateData.completedAt) updateData.completedAt = new Date(updateData.completedAt)

      // 필드명 변환 (goalTitle -> title)
      if (updateData.goalTitle && !updateData.title) {
        updateData.title = updateData.goalTitle
        delete updateData.goalTitle
      }
      if (updateData.goalType && !updateData.type) {
        updateData.type = updateData.goalType
        delete updateData.goalType
      }

      const goal = await this.goalService.update(id, updateData)
      
      if (!goal) {
        res.status(404).json({ error: 'Goal not found' })
        return
      }

      // 운동 완료 시 경험치 부여 (history에 expEarned가 있고 새로 추가된 경우)
      if (updateData.history && Array.isArray(updateData.history) && userId) {
        const newHistoryEntries = updateData.history.filter((h: any) => h.expEarned && h.expEarned > 0)
        if (newHistoryEntries.length > 0) {
          // 최신 히스토리 엔트리에서 경험치 부여
          const latestEntry = newHistoryEntries[newHistoryEntries.length - 1]
          try {
            await this.levelService.grantExp(
              userId,
              "workout",
              "workout_completion",
              {
                goalId: goal.id,
                goalTitle: goal.title,
                expEarned: latestEntry.expEarned,
                totalSets: latestEntry.totalSets,
                totalReps: latestEntry.totalReps,
              }
            )
          } catch (levelError) {
            // 경험치 부여 실패는 목표 업데이트에 영향을 주지 않음
            logger.error(`운동 완료 경험치 부여 실패: ${levelError}`)
          }
        }
      }
      
      // completedWorkouts에 expEarned가 있고 새로 추가된 경우
      if (updateData.completedWorkouts && Array.isArray(updateData.completedWorkouts) && userId) {
        const newCompletedWorkouts = updateData.completedWorkouts.filter(
          (cw: any) => cw.expEarned && cw.expEarned > 0
        )
        if (newCompletedWorkouts.length > 0) {
          // 최신 완료 운동에서 경험치 부여
          const latestCompleted = newCompletedWorkouts[newCompletedWorkouts.length - 1]
          try {
            await this.levelService.grantExp(
              userId,
              "workout",
              "workout_completion",
              {
                goalId: goal.id,
                goalTitle: goal.title,
                expEarned: latestCompleted.expEarned,
                totalSets: latestCompleted.totalSets,
                totalReps: latestCompleted.totalReps,
              }
            )
          } catch (levelError) {
            // 경험치 부여 실패는 목표 업데이트에 영향을 주지 않음
            logger.error(`운동 완료 경험치 부여 실패: ${levelError}`)
          }
        }
      }

      // 엔티티를 JSON으로 변환
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
      }

      res.json(goalData)
    } catch (error: any) {
      logger.error(`목표 수정 실패: ${error}`)
      res.status(500).json({ error: error.message || '목표 수정 실패' })
    }
  }

  /**
   * 목표 삭제
   * DELETE /api/workouts/goals/:id
   */
  async deleteGoal(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Number(req.params.id)
      if (!id) {
        res.status(400).json({ error: 'Invalid goal id' })
        return
      }

      const userId = req.user?.userId
      if (!userId) {
        res.status(401).json({ message: '인증이 필요합니다.' })
        return
      }

      const success = await this.goalService.remove(id)
      
      if (!success) {
        res.status(404).json({ error: 'Goal not found' })
        return
      }

      res.json({ success: true })
    } catch (error: any) {
      logger.error(`목표 삭제 실패: ${error}`)
      res.status(500).json({ error: error.message || '목표 삭제 실패' })
    }
  }
}

// 라우터 생성 (선택사항)
export function createGoalRouter(): Router {
  const router = Router()
  const controller = new GoalController()

  router.get('/', authMiddleware, rateLimiter(60000, 30), controller.getGoals.bind(controller))
  router.get('/:id', authMiddleware, rateLimiter(60000, 30), controller.getGoal.bind(controller))
  router.post('/', authMiddleware, rateLimiter(60000, 10), controller.createGoal.bind(controller))
  router.put('/:id', authMiddleware, rateLimiter(60000, 10), controller.updateGoal.bind(controller))
  router.delete('/:id', authMiddleware, rateLimiter(60000, 10), controller.deleteGoal.bind(controller))

  return router
}

