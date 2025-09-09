import { Router } from "express"
import { authMiddleware } from "../middlewares/auth"
import { rateLimiter } from "../middlewares/rateLimiter"
import { LikeController } from "../controllers/likeController"
import { LikeService } from "../services/likeService"

const router = Router()
const likeService = new LikeService()
const likeController = new LikeController(likeService)

// 좋아요 토글
router.post("/toggle", 
  authMiddleware, 
  rateLimiter({ windowMs: 60000, max: 30 }), 
  likeController.toggleLike.bind(likeController)
)

// 좋아요 목록 조회
router.get("/", 
  rateLimiter({ windowMs: 60000, max: 30 }), 
  likeController.getLikes.bind(likeController)
)

export default router