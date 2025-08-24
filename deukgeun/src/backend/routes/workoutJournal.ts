import { Router, Request, Response } from "express"
import { WorkoutJournalController } from "../controllers/workoutJournalController"
import { authMiddleware } from "../middlewares/auth"
import { AuthenticatedRequest } from "../types"

const router = Router()
const workoutJournalController = new WorkoutJournalController()

// 개발 환경에서 인증 우회 (테스트용)
const isDevelopment = process.env.NODE_ENV === "development"

// 개발 환경에서 더미 사용자 정보를 설정하는 미들웨어
const developmentAuthMiddleware = (
  req: Request,
  res: Response,
  next: Function
) => {
  if (isDevelopment) {
    // 개발 환경에서 더미 사용자 정보 설정
    ;(req as any).user = {
      userId: 2, // 테스트 사용자 ID
      role: "user" as const,
    }
    console.log("🔧 [Development] 더미 사용자 정보 설정:", (req as any).user)
  }
  next()
}

// 모든 라우트에 개발 환경 미들웨어 적용
router.use(developmentAuthMiddleware)

// 프로덕션 환경에서만 인증 미들웨어 적용
if (!isDevelopment) {
  router.use(authMiddleware)
}

// 운동 계획 관련 라우트
router.get("/plans", (req: Request, res: Response) =>
  workoutJournalController.getWorkoutPlans(
    req as unknown as AuthenticatedRequest,
    res
  )
)
router.post("/plans", (req: Request, res: Response) =>
  workoutJournalController.createWorkoutPlan(
    req as unknown as AuthenticatedRequest,
    res
  )
)
router.put("/plans/:planId", (req: Request, res: Response) =>
  workoutJournalController.updateWorkoutPlan(
    req as unknown as AuthenticatedRequest,
    res
  )
)
router.delete("/plans/:planId", (req: Request, res: Response) =>
  workoutJournalController.deleteWorkoutPlan(
    req as unknown as AuthenticatedRequest,
    res
  )
)

// 운동 세션 관련 라우트
router.get("/sessions", (req: Request, res: Response) =>
  workoutJournalController.getWorkoutSessions(
    req as unknown as AuthenticatedRequest,
    res
  )
)
router.post("/sessions", (req: Request, res: Response) =>
  workoutJournalController.createWorkoutSession(
    req as unknown as AuthenticatedRequest,
    res
  )
)
router.put("/sessions/:sessionId", (req: Request, res: Response) =>
  workoutJournalController.updateWorkoutSession(
    req as unknown as AuthenticatedRequest,
    res
  )
)
router.delete("/sessions/:sessionId", (req: Request, res: Response) =>
  workoutJournalController.deleteWorkoutSession(
    req as unknown as AuthenticatedRequest,
    res
  )
)

// 실시간 세션 상태 업데이트 라우트
router.post("/sessions/:sessionId/start", (req: Request, res: Response) =>
  workoutJournalController.startWorkoutSession(
    req as unknown as AuthenticatedRequest,
    res
  )
)
router.post("/sessions/:sessionId/pause", (req: Request, res: Response) =>
  workoutJournalController.pauseWorkoutSession(
    req as unknown as AuthenticatedRequest,
    res
  )
)
router.post("/sessions/:sessionId/resume", (req: Request, res: Response) =>
  workoutJournalController.resumeWorkoutSession(
    req as unknown as AuthenticatedRequest,
    res
  )
)
router.post("/sessions/:sessionId/complete", (req: Request, res: Response) =>
  workoutJournalController.completeWorkoutSession(
    req as unknown as AuthenticatedRequest,
    res
  )
)

// 운동 세트 관련 라우트
router.get("/sets", (req: Request, res: Response) =>
  workoutJournalController.getExerciseSets(
    req as unknown as AuthenticatedRequest,
    res
  )
)
router.post("/sets", (req: Request, res: Response) =>
  workoutJournalController.createExerciseSet(
    req as unknown as AuthenticatedRequest,
    res
  )
)
router.put("/sets/:setId", (req: Request, res: Response) =>
  workoutJournalController.updateExerciseSet(
    req as unknown as AuthenticatedRequest,
    res
  )
)
router.delete("/sets/:setId", (req: Request, res: Response) =>
  workoutJournalController.deleteExerciseSet(
    req as unknown as AuthenticatedRequest,
    res
  )
)

// 운동 목표 관련 라우트
router.get("/goals", (req: Request, res: Response) =>
  workoutJournalController.getWorkoutGoals(
    req as unknown as AuthenticatedRequest,
    res
  )
)
router.post("/goals", (req: Request, res: Response) =>
  workoutJournalController.createWorkoutGoal(
    req as unknown as AuthenticatedRequest,
    res
  )
)
router.put("/goals/:goalId", (req: Request, res: Response) =>
  workoutJournalController.updateWorkoutGoal(
    req as unknown as AuthenticatedRequest,
    res
  )
)
router.delete("/goals/:goalId", (req: Request, res: Response) =>
  workoutJournalController.deleteWorkoutGoal(
    req as unknown as AuthenticatedRequest,
    res
  )
)

// 운동 통계 관련 라우트
router.get("/stats", (req: Request, res: Response) =>
  workoutJournalController.getWorkoutStats(
    req as unknown as AuthenticatedRequest,
    res
  )
)

// 운동 진행 상황 관련 라우트
router.get("/progress", (req: Request, res: Response) =>
  workoutJournalController.getWorkoutProgress(
    req as unknown as AuthenticatedRequest,
    res
  )
)

// 대시보드 데이터 라우트
router.get("/dashboard", (req: Request, res: Response) =>
  workoutJournalController.getDashboardData(
    req as unknown as AuthenticatedRequest,
    res
  )
)

export default router
