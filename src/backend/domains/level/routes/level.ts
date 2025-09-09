import { Router } from "express"
import {
  getUserLevel,
  getUserProgress,
  getUserRewards,
  grantExp,
  checkCooldown,
  getGlobalLeaderboard,
  getSeasonLeaderboard,
  updateLevelConfig,
  resetUserProgress,
  getSystemStats,
} from "../controllers/levelController.js"
import { authMiddleware, isAdmin } from "../middlewares/auth"
import { rateLimiter } from "../middlewares/rateLimiter"

const router = Router()

/**
 * 레벨 시스템 API Routes
 *
 * 사용자 진행률 관련
 * GET    /api/level/user/:userId              - 사용자 레벨 정보 조회
 * GET    /api/level/user/:userId/progress     - 사용자 진행률 조회
 * GET    /api/level/user/:userId/rewards      - 사용자 보상 목록 조회
 *
 * 경험치 관련
 * POST   /api/level/exp/grant                 - 경험치 부여
 * GET    /api/level/cooldown/:actionType/:userId - 쿨다운 상태 확인
 *
 * 리더보드 관련
 * GET    /api/level/leaderboard/global        - 전체 리더보드
 * GET    /api/level/leaderboard/season/:seasonId - 시즌 리더보드
 *
 * 관리자 기능
 * PUT    /api/admin/level/config              - 레벨 설정 업데이트
 * POST   /api/admin/level/reset/:userId       - 사용자 진행률 리셋
 * GET    /api/admin/level/stats               - 시스템 통계 조회
 */

// 사용자 레벨 관련 라우트
router.get(
  "/user/:userId",
  authMiddleware,
  rateLimiter({ windowMs: 60000, max: 30, message: "요청이 너무 많습니다." }),
  getUserLevel
)
router.get(
  "/user/:userId/progress",
  authMiddleware,
  rateLimiter({ windowMs: 60000, max: 30, message: "요청이 너무 많습니다." }),
  getUserProgress
)
router.get(
  "/user/:userId/rewards",
  authMiddleware,
  rateLimiter({ windowMs: 60000, max: 30, message: "요청이 너무 많습니다." }),
  getUserRewards
)

// 경험치 관련 라우트
router.post("/exp/grant", authMiddleware, rateLimiter({ windowMs: 60000, max: 10, message: "경험치 부여 요청이 너무 많습니다." }), grantExp)
router.get(
  "/cooldown/:actionType/:userId",
  authMiddleware,
  rateLimiter({ windowMs: 60000, max: 30, message: "요청이 너무 많습니다." }),
  checkCooldown
)

// 리더보드 관련 라우트
router.get("/leaderboard/global", rateLimiter({ windowMs: 60000, max: 30, message: "리더보드 요청이 너무 많습니다." }), getGlobalLeaderboard)
router.get(
  "/leaderboard/season/:seasonId",
  rateLimiter({ windowMs: 60000, max: 30, message: "요청이 너무 많습니다." }),
  getSeasonLeaderboard
)

// 관리자 전용 라우트
router.put(
  "/admin/config",
  authMiddleware,
  isAdmin,
  rateLimiter({ windowMs: 60000, max: 5, message: "요청이 너무 많습니다." }),
  updateLevelConfig
)
router.post(
  "/admin/reset/:userId",
  authMiddleware,
  isAdmin,
  rateLimiter({ windowMs: 60000, max: 5, message: "요청이 너무 많습니다." }),
  resetUserProgress
)
router.get(
  "/admin/stats",
  authMiddleware,
  isAdmin,
  rateLimiter({ windowMs: 60000, max: 10, message: "시스템 통계 요청이 너무 많습니다." }),
  getSystemStats
)

export default router
