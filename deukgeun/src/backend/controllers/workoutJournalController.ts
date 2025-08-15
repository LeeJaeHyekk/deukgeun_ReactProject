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
      const errorMessage =
        error instanceof Error
          ? error.message
          : "운동 계획 조회에 실패했습니다."
      res.status(500).json({ error: errorMessage })
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
      const errorMessage =
        error instanceof Error
          ? error.message
          : "운동 계획 생성에 실패했습니다."
      res.status(500).json({ error: errorMessage })
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
      const errorMessage =
        error instanceof Error
          ? error.message
          : "운동 계획 업데이트에 실패했습니다."
      res.status(500).json({ error: errorMessage })
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
      const errorMessage =
        error instanceof Error
          ? error.message
          : "운동 계획 삭제에 실패했습니다."
      res.status(500).json({ error: errorMessage })
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

  // 실시간 세션 상태 업데이트 메서드들
  async startWorkoutSession(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const userId = req.user?.userId
      if (!userId) {
        res.status(401).json({ error: "인증이 필요합니다." })
        return
      }

      const sessionId = parseInt(req.params.sessionId)
      const sessionData = req.body

      console.log(`세션 시작 - User ID: ${userId}, Session ID: ${sessionId}`)

      const session = await this.workoutJournalService.startWorkoutSession(
        userId,
        sessionId,
        sessionData
      )

      console.log(`세션 시작 성공 - Session ID: ${session.id}`)
      res.status(200).json({ success: true, data: session })
    } catch (error) {
      console.error("운동 세션 시작 실패:", error)
      const errorMessage =
        error instanceof Error
          ? error.message
          : "운동 세션 시작에 실패했습니다."
      res.status(500).json({ error: errorMessage })
    }
  }

  async pauseWorkoutSession(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const userId = req.user?.userId
      if (!userId) {
        res.status(401).json({ error: "인증이 필요합니다." })
        return
      }

      const sessionId = parseInt(req.params.sessionId)

      console.log(
        `세션 일시정지 - User ID: ${userId}, Session ID: ${sessionId}`
      )

      const session = await this.workoutJournalService.pauseWorkoutSession(
        userId,
        sessionId
      )

      console.log(`세션 일시정지 성공 - Session ID: ${session.id}`)
      res.status(200).json({ success: true, data: session })
    } catch (error) {
      console.error("운동 세션 일시정지 실패:", error)
      const errorMessage =
        error instanceof Error
          ? error.message
          : "운동 세션 일시정지에 실패했습니다."
      res.status(500).json({ error: errorMessage })
    }
  }

  async resumeWorkoutSession(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const userId = req.user?.userId
      if (!userId) {
        res.status(401).json({ error: "인증이 필요합니다." })
        return
      }

      const sessionId = parseInt(req.params.sessionId)

      console.log(`세션 재개 - User ID: ${userId}, Session ID: ${sessionId}`)

      const session = await this.workoutJournalService.resumeWorkoutSession(
        userId,
        sessionId
      )

      console.log(`세션 재개 성공 - Session ID: ${session.id}`)
      res.status(200).json({ success: true, data: session })
    } catch (error) {
      console.error("운동 세션 재개 실패:", error)
      const errorMessage =
        error instanceof Error
          ? error.message
          : "운동 세션 재개에 실패했습니다."
      res.status(500).json({ error: errorMessage })
    }
  }

  async completeWorkoutSession(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const userId = req.user?.userId
      if (!userId) {
        res.status(401).json({ error: "인증이 필요합니다." })
        return
      }

      const sessionId = parseInt(req.params.sessionId)
      const completionData = req.body

      console.log(`세션 완료 - User ID: ${userId}, Session ID: ${sessionId}`)

      const session = await this.workoutJournalService.completeWorkoutSession(
        userId,
        sessionId,
        completionData
      )

      console.log(`세션 완료 성공 - Session ID: ${session.id}`)
      res.status(200).json({ success: true, data: session })
    } catch (error) {
      console.error("운동 세션 완료 실패:", error)
      const errorMessage =
        error instanceof Error
          ? error.message
          : "운동 세션 완료에 실패했습니다."
      res.status(500).json({ error: errorMessage })
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

  // 운동 세트 관련 메서드들
  async getExerciseSets(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const userId = req.user?.userId
      if (!userId) {
        res.status(401).json({ error: "인증이 필요합니다." })
        return
      }

      const sessionId = req.query.sessionId
        ? parseInt(req.query.sessionId as string)
        : undefined

      const sets = await this.workoutJournalService.getExerciseSets(sessionId)
      res.status(200).json({ success: true, data: sets })
    } catch (error) {
      console.error("운동 세트 조회 실패:", error)
      const errorMessage =
        error instanceof Error
          ? error.message
          : "운동 세트 조회에 실패했습니다."
      res.status(500).json({ error: errorMessage })
    }
  }

  async createExerciseSet(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const userId = req.user?.userId
      if (!userId) {
        res.status(401).json({ error: "인증이 필요합니다." })
        return
      }

      const setData = req.body

      const exerciseSet =
        await this.workoutJournalService.createExerciseSet(setData)

      res.status(201).json({ success: true, data: exerciseSet })
    } catch (error) {
      console.error("운동 세트 생성 실패:", error)
      const errorMessage =
        error instanceof Error
          ? error.message
          : "운동 세트 생성에 실패했습니다."
      res.status(500).json({ error: errorMessage })
    }
  }

  async updateExerciseSet(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const userId = req.user?.userId
      if (!userId) {
        res.status(401).json({ error: "인증이 필요합니다." })
        return
      }

      const setId = parseInt(req.params.setId)
      const updateData = req.body

      const exerciseSet = await this.workoutJournalService.updateExerciseSet(
        setId,
        updateData
      )

      res.status(200).json({ success: true, data: exerciseSet })
    } catch (error) {
      console.error("운동 세트 업데이트 실패:", error)
      const errorMessage =
        error instanceof Error
          ? error.message
          : "운동 세트 업데이트에 실패했습니다."
      res.status(500).json({ error: errorMessage })
    }
  }

  async deleteExerciseSet(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const userId = req.user?.userId
      if (!userId) {
        res.status(401).json({ error: "인증이 필요합니다." })
        return
      }

      const setId = parseInt(req.params.setId)

      await this.workoutJournalService.deleteExerciseSet(setId)

      res
        .status(200)
        .json({ success: true, message: "운동 세트가 삭제되었습니다." })
    } catch (error) {
      console.error("운동 세트 삭제 실패:", error)
      const errorMessage =
        error instanceof Error
          ? error.message
          : "운동 세트 삭제에 실패했습니다."
      res.status(500).json({ error: errorMessage })
    }
  }
}
