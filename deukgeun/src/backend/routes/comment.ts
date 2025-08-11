import { Router } from "express"
import { authenticateToken } from "../middlewares/auth"
import { CommentController } from "../controllers/commentController"

const router = Router()
const commentController = new CommentController()

// GET /api/comments/:id (postId)
router.get("/:id", commentController.getCommentsByPostId)
// POST /api/comments/:id (postId)
router.post("/:id", authenticateToken, commentController.createComment)
// PUT /api/comments/:id (commentId)
router.put("/:id", authenticateToken, commentController.updateComment)
// DELETE /api/comments/:id (commentId)
router.delete("/:id", authenticateToken, commentController.deleteComment)

export default router
