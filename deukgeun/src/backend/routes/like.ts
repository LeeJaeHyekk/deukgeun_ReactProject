import { Router } from "express"
import { LikeController } from "../controllers/likeController.js"
import { authMiddleware } from "../middlewares/auth.js"
import { rateLimiter } from "../middlewares/rateLimiter.js"

const router = Router()
const likeController = new LikeController()

// POST /api/likes/:id - 좋아요 토글 (추가/제거)
router.post("/:id", authMiddleware, likeController.toggleLike)

// DELETE /api/likes/:id - 좋아요 토글 (추가/제거) - 호환성을 위해 유지
router.delete("/:id", authMiddleware, likeController.toggleLike)

export default router
