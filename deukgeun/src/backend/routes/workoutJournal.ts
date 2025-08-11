import { Router } from "express"
import { WorkoutJournalController } from "../controllers/workoutJournalController"
import { authenticateToken } from "../middlewares/auth"

const router = Router()
const workoutJournalController = new WorkoutJournalController()

// 모든 라우트에 인증 미들웨어 적용
router.use(authenticateToken)

// 운동 계획 관련 라우트
router.get(
  "/plans",
  workoutJournalController.getWorkoutPlans.bind(workoutJournalController)
)
router.post(
  "/plans",
  workoutJournalController.createWorkoutPlan.bind(workoutJournalController)
)

// 운동 세션 관련 라우트
router.get(
  "/sessions",
  workoutJournalController.getWorkoutSessions.bind(workoutJournalController)
)
router.post(
  "/sessions",
  workoutJournalController.createWorkoutSession.bind(workoutJournalController)
)
router.put(
  "/sessions/:sessionId",
  workoutJournalController.updateWorkoutSession.bind(workoutJournalController)
)

// 운동 목표 관련 라우트
router.get(
  "/goals",
  workoutJournalController.getWorkoutGoals.bind(workoutJournalController)
)
router.post(
  "/goals",
  workoutJournalController.createWorkoutGoal.bind(workoutJournalController)
)
router.put(
  "/goals/:goalId",
  workoutJournalController.updateWorkoutGoal.bind(workoutJournalController)
)

// 운동 통계 관련 라우트
router.get(
  "/stats",
  workoutJournalController.getWorkoutStats.bind(workoutJournalController)
)

// 운동 진행 상황 관련 라우트
router.get(
  "/progress",
  workoutJournalController.getWorkoutProgress.bind(workoutJournalController)
)

// 대시보드 데이터
router.get(
  "/dashboard",
  workoutJournalController.getDashboardData.bind(workoutJournalController)
)

export default router
