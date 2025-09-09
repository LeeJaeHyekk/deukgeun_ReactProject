// ============================================================================
// Level Routes
// ============================================================================

import { Router } from "express"
import {
  getUserLevel,
  getUserProgress,
  getUserRewards,
  grantExp,
} from "../domains/level/controllers/levelController.js"
import { authMiddleware, isAdmin } from "../domains/middlewares/auth.js"
import { rateLimiter } from "../domains/middlewares/rateLimiter.js"

const router = Router()

// 레벨 관련 라우트
router.get("/user/:userId", authMiddleware, rateLimiter, getUserLevel)
router.get("/progress/:userId", authMiddleware, rateLimiter, getUserProgress)
router.get("/rewards/:userId", authMiddleware, rateLimiter, getUserRewards)
router.post("/grant-exp", authMiddleware, isAdmin, rateLimiter, grantExp)

export default router
