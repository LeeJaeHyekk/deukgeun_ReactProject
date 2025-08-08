import { Request, Response, NextFunction } from "express"
import { WorkoutService } from "../services/workoutService"
import { authenticateToken } from "../middlewares/auth"
import { logger } from "../utils/logger"

export class WorkoutController {
  private workoutService: WorkoutService

  constructor() {
    this.workoutService = new WorkoutService()
  }

  // 운동 계획 관련
  async getUserPlans(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user?.userId) {
        return res.status(401).json({ message: "인증이 필요합니다." })
      }

      const plans = await this.workoutService.getUserWorkoutPlans(
        req.user.userId
      )
      res.json(plans)
    } catch (error) {
      logger.error(`운동 계획 조회 실패: ${error}`)
      next(error)
    }
  }

  async createPlan(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user?.userId) {
        return res.status(401).json({ message: "인증이 필요합니다." })
      }

      const planData = {
        ...req.body,
        user_id: req.user.userId,
      }

      const plan = await this.workoutService.createWorkoutPlan(planData)
      res.status(201).json(plan)
    } catch (error) {
      logger.error(`운동 계획 생성 실패: ${error}`)
      next(error)
    }
  }

  async updatePlan(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user?.userId) {
        return res.status(401).json({ message: "인증이 필요합니다." })
      }

      const { id } = req.params
      const plan = await this.workoutService.updateWorkoutPlan(
        parseInt(id),
        req.body
      )
      res.json(plan)
    } catch (error) {
      logger.error(`운동 계획 수정 실패: ${error}`)
      next(error)
    }
  }

  async deletePlan(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user?.userId) {
        return res.status(401).json({ message: "인증이 필요합니다." })
      }

      const { id } = req.params
      await this.workoutService.deleteWorkoutPlan(parseInt(id))
      res.status(204).send()
    } catch (error) {
      logger.error(`운동 계획 삭제 실패: ${error}`)
      next(error)
    }
  }

  // 운동 세션 관련
  async getUserSessions(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user?.userId) {
        return res.status(401).json({ message: "인증이 필요합니다." })
      }

      const sessions = await this.workoutService.getUserWorkoutSessions(
        req.user.userId
      )
      res.json(sessions)
    } catch (error) {
      logger.error(`운동 세션 조회 실패: ${error}`)
      next(error)
    }
  }

  async startSession(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user?.userId) {
        return res.status(401).json({ message: "인증이 필요합니다." })
      }

      const sessionData = {
        ...req.body,
        user_id: req.user.userId,
        start_time: new Date(),
      }

      const session = await this.workoutService.startWorkoutSession(sessionData)
      res.status(201).json(session)
    } catch (error) {
      logger.error(`운동 세션 시작 실패: ${error}`)
      next(error)
    }
  }

  async completeSession(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user?.userId) {
        return res.status(401).json({ message: "인증이 필요합니다." })
      }

      const { id } = req.params
      const session = await this.workoutService.completeWorkoutSession(
        parseInt(id),
        req.user.userId
      )
      res.json(session)
    } catch (error) {
      logger.error(`운동 세션 완료 실패: ${error}`)
      next(error)
    }
  }

  // 운동 목표 관련
  async getUserGoals(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user?.userId) {
        return res.status(401).json({ message: "인증이 필요합니다." })
      }

      const goals = await this.workoutService.getUserWorkoutGoals(
        req.user.userId
      )
      res.json(goals)
    } catch (error) {
      logger.error(`운동 목표 조회 실패: ${error}`)
      next(error)
    }
  }

  async createGoal(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user?.userId) {
        return res.status(401).json({ message: "인증이 필요합니다." })
      }

      const goalData = {
        ...req.body,
        user_id: req.user.userId,
      }

      const goal = await this.workoutService.createWorkoutGoal(goalData)
      res.status(201).json(goal)
    } catch (error) {
      logger.error(`운동 목표 생성 실패: ${error}`)
      next(error)
    }
  }

  async updateGoal(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user?.userId) {
        return res.status(401).json({ message: "인증이 필요합니다." })
      }

      const { id } = req.params
      const goal = await this.workoutService.updateWorkoutGoal(
        parseInt(id),
        req.body
      )
      res.json(goal)
    } catch (error) {
      logger.error(`운동 목표 수정 실패: ${error}`)
      next(error)
    }
  }

  async deleteGoal(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user?.userId) {
        return res.status(401).json({ message: "인증이 필요합니다." })
      }

      const { id } = req.params
      await this.workoutService.deleteWorkoutGoal(parseInt(id))
      res.status(204).send()
    } catch (error) {
      logger.error(`운동 목표 삭제 실패: ${error}`)
      next(error)
    }
  }

  // 운동 진행 상황
  async getProgress(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user?.userId) {
        return res.status(401).json({ message: "인증이 필요합니다." })
      }

      const { machineId } = req.query
      const progress = await this.workoutService.getWorkoutProgress(
        req.user.userId,
        machineId ? parseInt(machineId as string) : undefined
      )
      res.json(progress)
    } catch (error) {
      logger.error(`운동 진행 상황 조회 실패: ${error}`)
      next(error)
    }
  }
}
