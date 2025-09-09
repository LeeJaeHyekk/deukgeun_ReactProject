// ============================================================================
// Comment Routes
// ============================================================================

import { Router } from "express"
import { CommentController } from "../domains/community/controllers/commentController.js"
import { CommentService } from "../domains/community/services/commentService.js"
import { authMiddleware } from "../domains/middlewares/auth.js"
import { rateLimiter } from "../domains/middlewares/rateLimiter.js"

const router = Router()
const commentService = new CommentService()
const commentController = new CommentController(commentService)

// 댓글 관련 라우트
router.get("/", rateLimiter, commentController.getComments)
router.get("/:id", rateLimiter, commentController.getComments)
router.post("/", authMiddleware, rateLimiter, commentController.createComment)
router.put("/:id", authMiddleware, rateLimiter, commentController.updateComment)
router.delete(
  "/:id",
  authMiddleware,
  rateLimiter,
  commentController.deleteComment
)

export default router
