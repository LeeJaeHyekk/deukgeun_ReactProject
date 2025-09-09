// ============================================================================
// Post Routes
// ============================================================================

import { Router } from "express"
import { PostController } from "../domains/community/controllers/post.controller.js"
import { authMiddleware } from "../domains/middlewares/auth.js"
import { rateLimiter } from "../domains/middlewares/rateLimiter.js"

const router = Router()
const postController = new PostController()

// 게시글 관련 라우트
router.get("/", rateLimiter, postController.getAllPosts)
router.get("/my", authMiddleware, rateLimiter, postController.getMyPosts)
router.get("/:id", rateLimiter, postController.getPostById)
router.post("/", authMiddleware, rateLimiter, postController.createPost)
router.put("/:id", authMiddleware, rateLimiter, postController.updatePost)
router.delete("/:id", authMiddleware, rateLimiter, postController.deletePost)

export default router
