import { Router } from 'express'
import { WorkoutController } from '../controllers/workoutController'
import { authMiddleware } from '../middlewares/auth'
import { rateLimiter, workoutRateLimiter } from '../middlewares/rateLimiter'

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
  '/plans',
  authMiddleware,
  workoutRateLimiter, // 1분에 200회
  workoutController.getUserPlans.bind(workoutController)
)
router.post(
  '/plans',
  authMiddleware,
  rateLimiter(60000, 10),
  workoutController.createPlan.bind(workoutController)
)
router.put(
  '/plans/:id',
  authMiddleware,
  rateLimiter(60000, 10),
  workoutController.updatePlan.bind(workoutController)
)
router.delete(
  '/plans/:id',
  authMiddleware,
  rateLimiter(60000, 10),
  workoutController.deletePlan.bind(workoutController)
)

// 운동 세션 라우트
router.get(
  '/sessions',
  authMiddleware,
  workoutRateLimiter, // 1분에 200회
  workoutController.getUserSessions.bind(workoutController)
)
router.post(
  '/sessions',
  authMiddleware,
  rateLimiter(60000, 10),
  workoutController.startSession.bind(workoutController)
)
router.post(
  '/sessions/:id/complete',
  authMiddleware,
  rateLimiter(60000, 10),
  workoutController.completeSession.bind(workoutController)
)

// 운동 목표 라우트
router.get(
  '/goals',
  authMiddleware,
  workoutRateLimiter, // 1분에 200회
  workoutController.getUserGoals.bind(workoutController)
)
router.post(
  '/goals',
  authMiddleware,
  rateLimiter(60000, 10),
  workoutController.createGoal.bind(workoutController)
)
router.put(
  '/goals/:id',
  authMiddleware,
  rateLimiter(60000, 10),
  workoutController.updateGoal.bind(workoutController)
)
router.delete(
  '/goals/:id',
  authMiddleware,
  rateLimiter(60000, 10),
  workoutController.deleteGoal.bind(workoutController)
)

// 운동 진행 상황 라우트
router.get(
  '/progress',
  authMiddleware,
  workoutRateLimiter, // 1분에 200회
  workoutController.getProgress.bind(workoutController)
)

// 대시보드 라우트
router.get(
  '/dashboard',
  authMiddleware,
  workoutRateLimiter, // 1분에 200회
  workoutController.getDashboard.bind(workoutController)
)

export default router
