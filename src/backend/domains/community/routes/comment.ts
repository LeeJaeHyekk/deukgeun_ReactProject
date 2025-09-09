import { Router } from "express"
import { authMiddleware } from "../middlewares/auth"
import { CommentController } from "../controllers/commentController"
import { CommentService } from "../services/commentService"

const router = Router()
const commentService = new CommentService()
const commentController = new CommentController(commentService)

// 댓글 생성
router.post("/:postId", 
  authMiddleware, 
  commentController.createComment.bind(commentController)
)

// 댓글 목록 조회
router.get("/:postId", 
  commentController.getComments.bind(commentController)
)

// 댓글 수정
router.put("/:id", 
  authMiddleware, 
  commentController.updateComment.bind(commentController)
)

// 댓글 삭제
router.delete("/:id", 
  authMiddleware, 
  commentController.deleteComment.bind(commentController)
)

export default router