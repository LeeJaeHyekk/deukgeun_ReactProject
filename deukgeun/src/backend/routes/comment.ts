import { Router } from "express"
import { authMiddleware } from "../middlewares/auth.js"
import { CommentController } from "../controllers/commentController.js"

const router = Router()
const commentController = new CommentController()

// GET /api/comments/:id (postId)
router.get("/:id", commentController.getCommentsByPostId)
// POST /api/comments/:id (postId)
router.post("/:id", authMiddleware, commentController.createComment)
// PUT /api/comments/:id (commentId)
router.put("/:id", authMiddleware, commentController.updateComment)
// DELETE /api/comments/:id (commentId)
router.delete("/:id", authMiddleware, commentController.deleteComment)

export default router
