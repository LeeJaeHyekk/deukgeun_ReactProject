import { Router } from "express"
import { WorkoutJournalController } from "../controllers/workoutJournalController"
import { authenticateToken } from "../middlewares/auth"
import { AuthenticatedRequest } from "../types/auth"

const router = Router()
const workoutJournalController = new WorkoutJournalController()

// 모든 라우트에 인증 미들웨어 적용
router.use(authenticateToken)

// 운동 계획 관련 라우트
router.get("/plans", (req, res) =>
  workoutJournalController.getWorkoutPlans(req as AuthenticatedRequest, res)
)
router.post("/plans", (req, res) =>
  workoutJournalController.createWorkoutPlan(req as AuthenticatedRequest, res)
)
router.put("/plans/:planId", (req, res) =>
  workoutJournalController.updateWorkoutPlan(req as AuthenticatedRequest, res)
)
router.delete("/plans/:planId", (req, res) =>
  workoutJournalController.deleteWorkoutPlan(req as AuthenticatedRequest, res)
)

// 운동 세션 관련 라우트
router.get("/sessions", (req, res) =>
  workoutJournalController.getWorkoutSessions(req as AuthenticatedRequest, res)
)
router.post("/sessions", (req, res) =>
  workoutJournalController.createWorkoutSession(
    req as AuthenticatedRequest,
    res
  )
)
router.put("/sessions/:sessionId", (req, res) =>
  workoutJournalController.updateWorkoutSession(
    req as AuthenticatedRequest,
    res
  )
)
router.delete("/sessions/:sessionId", (req, res) =>
  workoutJournalController.deleteWorkoutSession(
    req as AuthenticatedRequest,
    res
  )
)

// 실시간 세션 상태 업데이트 라우트
router.post("/sessions/:sessionId/start", (req, res) =>
  workoutJournalController.startWorkoutSession(req as AuthenticatedRequest, res)
)
router.post("/sessions/:sessionId/pause", (req, res) =>
  workoutJournalController.pauseWorkoutSession(req as AuthenticatedRequest, res)
)
router.post("/sessions/:sessionId/resume", (req, res) =>
  workoutJournalController.resumeWorkoutSession(
    req as AuthenticatedRequest,
    res
  )
)
router.post("/sessions/:sessionId/complete", (req, res) =>
  workoutJournalController.completeWorkoutSession(
    req as AuthenticatedRequest,
    res
  )
)

// 운동 세트 관련 라우트
router.get("/sets", (req, res) =>
  workoutJournalController.getExerciseSets(req as AuthenticatedRequest, res)
)
router.post("/sets", (req, res) =>
  workoutJournalController.createExerciseSet(req as AuthenticatedRequest, res)
)
router.put("/sets/:setId", (req, res) =>
  workoutJournalController.updateExerciseSet(req as AuthenticatedRequest, res)
)
router.delete("/sets/:setId", (req, res) =>
  workoutJournalController.deleteExerciseSet(req as AuthenticatedRequest, res)
)

// 운동 목표 관련 라우트
router.get("/goals", (req, res) =>
  workoutJournalController.getWorkoutGoals(req as AuthenticatedRequest, res)
)
router.post("/goals", (req, res) =>
  workoutJournalController.createWorkoutGoal(req as AuthenticatedRequest, res)
)
router.put("/goals/:goalId", (req, res) =>
  workoutJournalController.updateWorkoutGoal(req as AuthenticatedRequest, res)
)
router.delete("/goals/:goalId", (req, res) =>
  workoutJournalController.deleteWorkoutGoal(req as AuthenticatedRequest, res)
)

// 운동 통계 관련 라우트
router.get("/stats", (req, res) =>
  workoutJournalController.getWorkoutStats(req as AuthenticatedRequest, res)
)

// 운동 진행 상황 관련 라우트
router.get("/progress", (req, res) =>
  workoutJournalController.getWorkoutProgress(req as AuthenticatedRequest, res)
)

// 대시보드 데이터 라우트
router.get("/dashboard", (req, res) =>
  workoutJournalController.getDashboardData(req as AuthenticatedRequest, res)
)

export default router
