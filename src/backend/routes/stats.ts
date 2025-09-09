// ============================================================================
// Stats Routes
// ============================================================================

import { Router } from "express"
import { StatsController } from "../domains/stats/controllers/statsController.js"
import { authMiddleware, isAdmin } from "../domains/middlewares/auth.js"
import { statsRateLimiter } from "../domains/middlewares/rateLimiter.js"

const router = Router()
const statsController = new StatsController()

// 통계 관련 라우트
router.get(
  "/overall",
  authMiddleware,
  statsRateLimiter,
  statsController.getOverallStats
)
router.get(
  "/user/:userId",
  authMiddleware,
  statsRateLimiter,
  statsController.getUserStats
)
router.get(
  "/level-distribution",
  authMiddleware,
  statsRateLimiter,
  statsController.getLevelDistribution
)

export default router
