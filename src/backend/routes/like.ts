// ============================================================================
// Like Routes
// ============================================================================

import { Router } from "express"
import { LikeController } from "../domains/community/controllers/likeController.js"
import { LikeService } from "../domains/community/services/likeService.js"
import { authMiddleware } from "../domains/middlewares/auth.js"
import { rateLimiter } from "../domains/middlewares/rateLimiter.js"

const router = Router()
const likeService = new LikeService()
const likeController = new LikeController(likeService)

// 좋아요 관련 라우트
router.post("/toggle", authMiddleware, rateLimiter, likeController.toggleLike)
router.get("/", rateLimiter, likeController.getLikes)

export default router
