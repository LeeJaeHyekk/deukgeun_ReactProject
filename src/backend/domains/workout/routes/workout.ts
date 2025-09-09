import { Router } from "express"
import { WorkoutController } from "../controllers/workoutController"
import { authMiddleware } from "../middlewares/auth"
import { workoutRateLimiter } from "../middlewares/rateLimiter"

const router = Router()
const workoutController = new WorkoutController()

/**
 * Workout API Routes
 *
 * 운동 계획 관련
 * GET    /api/workouts/plans              - 사용자 운동 계획 목록
 * POST   /api/workouts/plans              - 새 운동 계획 생성
 * PUT    /api/workouts/plans/:id          - 운동 계획 수정
 * DELETE /api/workouts/plans/:id          - 운동 계획 삭제
 *
 * 운동 세션 관련
 * GET    /api/workouts/sessions           - 사용자 운동 세션 목록
 * POST   /api/workouts/sessions           - 새 운동 세션 시작
 * POST   /api/workouts/sessions/:id/complete - 운동 세션 완료
 *
 * 운동 목표 관련
 * GET    /api/workouts/goals              - 사용자 운동 목표 목록
 * POST   /api/workouts/goals              - 새 운동 목표 생성
 * PUT    /api/workouts/goals/:id          - 운동 목표 수정
 * DELETE /api/workouts/goals/:id          - 운동 목표 삭제
 *
 * 운동 진행 상황
 * GET    /api/workouts/progress           - 운동 진행 상황 조회
 */

// 운동 계획 라우트
router.get(
  "/plans",
  authMiddleware,
  workoutRateLimiter,
  workoutController.getUserPlans
)
router.post(
  "/plans",
  authMiddleware,
  workoutRateLimiter,
  workoutController.createPlan
)
router.put(
  "/plans/:id",
  authMiddleware,
  workoutRateLimiter,
  workoutController.updatePlan
)
router.delete(
  "/plans/:id",
  authMiddleware,
  workoutRateLimiter,
  workoutController.deletePlan
)

// 운동 세션 라우트
router.get(
  "/sessions",
  authMiddleware,
  workoutRateLimiter,
  workoutController.getUserSessions
)
router.post(
  "/sessions",
  authMiddleware,
  workoutRateLimiter,
  workoutController.startSession
)
router.post(
  "/sessions/:id/complete",
  authMiddleware,
  workoutRateLimiter,
  workoutController.completeSession
)

// 운동 목표 라우트
router.get(
  "/goals",
  authMiddleware,
  workoutRateLimiter,
  workoutController.getUserGoals
)
router.post(
  "/goals",
  authMiddleware,
  workoutRateLimiter,
  workoutController.createGoal
)
router.put(
  "/goals/:id",
  authMiddleware,
  workoutRateLimiter,
  workoutController.updateGoal
)
router.delete(
  "/goals/:id",
  authMiddleware,
  workoutRateLimiter,
  workoutController.deleteGoal
)

// 운동 진행 상황 라우트
router.get(
  "/progress",
  authMiddleware,
  workoutRateLimiter,
  workoutController.getProgress
)

export default router
