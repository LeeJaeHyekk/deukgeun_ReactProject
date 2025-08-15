import { Request, Response } from "express"
import { WorkoutJournalService } from "../services/workoutJournalService"
import { AuthenticatedRequest } from "../../shared/types/auth"

export class WorkoutJournalController {
  private workoutJournalService: WorkoutJournalService

  constructor() {
    this.workoutJournalService = new WorkoutJournalService()
  }

  // 운동 계획 관련
  async getWorkoutPlans(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const userId = req.user?.userId
      if (!userId) {
        res.status(401).json({ error: "인증이 필요합니다." })
        return
      }

      const plans = await this.workoutJournalService.getUserPlans(userId)
      res.json({ success: true, data: plans })
    } catch (error) {
      console.error("운동 계획 조회 실패:", error)
      res.status(500).json({ error: "운동 계획 조회에 실패했습니다." })
    }
  }

  async createWorkoutPlan(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const userId = req.user?.userId
      if (!userId) {
        res.status(401).json({ error: "인증이 필요합니다." })
        return
      }

      const planData = req.body as any
      console.log("컨트롤러에서 받은 데이터:", planData)
      console.log("exercises 배열:", planData.exercises)

      const plan = await this.workoutJournalService.createWorkoutPlan(
        userId,
        planData
      )
      res.status(201).json({ success: true, data: plan })
    } catch (error) {
      console.error("운동 계획 생성 실패:", error)
      res.status(500).json({ error: "운동 계획 생성에 실패했습니다." })
    }
  }

  async updateWorkoutPlan(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const userId = req.user?.userId
      const { planId } = req.params
      if (!userId) {
        res.status(401).json({ error: "인증이 필요합니다." })
        return
      }

      const updateData = req.body as any
      console.log("컨트롤러에서 받은 업데이트 데이터:", updateData)
      console.log("요청 본문:", req.body)

      const plan = await this.workoutJournalService.updateWorkoutPlan(
        parseInt(planId),
        userId,
        updateData
      )
      res.json({ success: true, data: plan })
    } catch (error) {
      console.error("운동 계획 업데이트 실패:", error)
      res.status(500).json({ error: "운동 계획 업데이트에 실패했습니다." })
    }
  }

  async deleteWorkoutPlan(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const userId = req.user?.userId
      const { planId } = req.params
      if (!userId) {
        res.status(401).json({ error: "인증이 필요합니다." })
        return
      }

      await this.workoutJournalService.deleteWorkoutPlan(
        parseInt(planId),
        userId
      )
      res.json({ success: true, message: "운동 계획이 삭제되었습니다." })
    } catch (error) {
      console.error("운동 계획 삭제 실패:", error)
      res.status(500).json({ error: "운동 계획 삭제에 실패했습니다." })
    }
  }

  // 운동 세션 관련
  async getWorkoutSessions(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const userId = req.user?.userId
      if (!userId) {
        res.status(401).json({ error: "인증이 필요합니다." })
        return
      }

      const sessions = await this.workoutJournalService.getUserSessions(userId)
      res.json({ success: true, data: sessions })
    } catch (error) {
      console.error("운동 세션 조회 실패:", error)
      res.status(500).json({ error: "운동 세션 조회에 실패했습니다." })
    }
  }

  async createWorkoutSession(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const userId = req.user?.userId
      if (!userId) {
        res.status(401).json({ error: "인증이 필요합니다." })
        return
      }

      const sessionData = req.body as any

      // 필수 필드 검증 - name 또는 session_name 중 하나는 있어야 함
      if (!sessionData.name && !sessionData.session_name) {
        res.status(400).json({ error: "세션 이름은 필수입니다." })
        return
      }

      console.log(
        `세션 생성 시도 - User ID: ${userId}, Session Name: ${sessionData.name || sessionData.session_name}`
      )

      const session = await this.workoutJournalService.createWorkoutSession(
        userId,
        sessionData
      )

      console.log(
        `세션 생성 성공 - User ID: ${userId}, Session ID: ${session.id}`
      )
      res.status(201).json({ success: true, data: session })
    } catch (error) {
      console.error("운동 세션 생성 실패:", error)
      const errorMessage =
        error instanceof Error
          ? error.message
          : "운동 세션 생성에 실패했습니다."
      res.status(500).json({ error: errorMessage })
    }
  }

  async updateWorkoutSession(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const userId = req.user?.userId
      const { sessionId } = req.params
      if (!userId) {
        res.status(401).json({ error: "인증이 필요합니다." })
        return
      }

      const updateData = req.body as any
      const session = await this.workoutJournalService.updateWorkoutSession(
        parseInt(sessionId),
        userId,
        updateData
      )
      res.json({ success: true, data: session })
    } catch (error) {
      console.error("운동 세션 업데이트 실패:", error)
      res.status(500).json({ error: "운동 세션 업데이트에 실패했습니다." })
    }
  }

  async deleteWorkoutSession(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const userId = req.user?.userId
      const { sessionId } = req.params
      if (!userId) {
        res.status(401).json({ error: "인증이 필요합니다." })
        return
      }

      await this.workoutJournalService.deleteWorkoutSession(
        parseInt(sessionId),
        userId
      )
      res.json({ success: true, message: "운동 세션이 삭제되었습니다." })
    } catch (error) {
      console.error("운동 세션 삭제 실패:", error)
      res.status(500).json({ error: "운동 세션 삭제에 실패했습니다." })
    }
  }

  // 운동 목표 관련
  async getWorkoutGoals(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const userId = req.user?.userId
      if (!userId) {
        res.status(401).json({ error: "인증이 필요합니다." })
        return
      }

      const goals = await this.workoutJournalService.getUserGoals(userId)
      res.json({ success: true, data: goals })
    } catch (error) {
      console.error("운동 목표 조회 실패:", error)
      res.status(500).json({ error: "운동 목표 조회에 실패했습니다." })
    }
  }

  async createWorkoutGoal(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const userId = req.user?.userId
      if (!userId) {
        res.status(401).json({ error: "인증이 필요합니다." })
        return
      }

      const goalData = req.body as any
      const goal = await this.workoutJournalService.createWorkoutGoal(
        userId,
        goalData
      )
      res.status(201).json({ success: true, data: goal })
    } catch (error) {
      console.error("운동 목표 생성 실패:", error)
      res.status(500).json({ error: "운동 목표 생성에 실패했습니다." })
    }
  }

  async updateWorkoutGoal(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const userId = req.user?.userId
      const { goalId } = req.params
      if (!userId) {
        res.status(401).json({ error: "인증이 필요합니다." })
        return
      }

      const updateData = req.body as any
      const goal = await this.workoutJournalService.updateWorkoutGoal(
        parseInt(goalId),
        userId,
        updateData
      )
      res.json({ success: true, data: goal })
    } catch (error) {
      console.error("운동 목표 업데이트 실패:", error)
      res.status(500).json({ error: "운동 목표 업데이트에 실패했습니다." })
    }
  }

  async deleteWorkoutGoal(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const userId = req.user?.userId
      const { goalId } = req.params

      if (!userId) {
        res.status(401).json({ error: "인증이 필요합니다." })
        return
      }

      if (!goalId || isNaN(parseInt(goalId))) {
        res.status(400).json({ error: "유효하지 않은 목표 ID입니다." })
        return
      }

      console.log(`목표 삭제 시도 - User ID: ${userId}, Goal ID: ${goalId}`)

      await this.workoutJournalService.deleteWorkoutGoal(
        parseInt(goalId),
        userId
      )

      console.log(`목표 삭제 성공 - User ID: ${userId}, Goal ID: ${goalId}`)
      res.json({ success: true, message: "운동 목표가 삭제되었습니다." })
    } catch (error) {
      console.error("운동 목표 삭제 실패:", error)
      const errorMessage =
        error instanceof Error
          ? error.message
          : "운동 목표 삭제에 실패했습니다."
      res.status(500).json({ error: errorMessage })
    }
  }

  // 운동 통계 관련
  async getWorkoutStats(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const userId = req.user?.userId
      if (!userId) {
        res.status(401).json({ error: "인증이 필요합니다." })
        return
      }

      const stats = await this.workoutJournalService.getUserStats(userId)
      res.json({ success: true, data: stats })
    } catch (error) {
      console.error("운동 통계 조회 실패:", error)
      res.status(500).json({ error: "운동 통계 조회에 실패했습니다." })
    }
  }

  // 운동 진행 상황 관련
  async getWorkoutProgress(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const userId = req.user?.userId
      if (!userId) {
        res.status(401).json({ error: "인증이 필요합니다." })
        return
      }

      const progress = await this.workoutJournalService.getUserProgress(userId)
      res.json({ success: true, data: progress })
    } catch (error) {
      console.error("운동 진행 상황 조회 실패:", error)
      res.status(500).json({ error: "운동 진행 상황 조회에 실패했습니다." })
    }
  }

  // 대시보드 데이터
  async getDashboardData(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const userId = req.user?.userId
      if (!userId) {
        res.status(401).json({ error: "인증이 필요합니다." })
        return
      }

      const dashboardData =
        await this.workoutJournalService.getDashboardData(userId)
      res.json({ success: true, data: dashboardData })
    } catch (error) {
      console.error("대시보드 데이터 조회 실패:", error)
      res.status(500).json({ error: "대시보드 데이터 조회에 실패했습니다." })
    }
  }
}
