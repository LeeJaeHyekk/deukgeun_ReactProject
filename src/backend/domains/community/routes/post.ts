import { Router } from "express"
import { authMiddleware } from "../middlewares/auth"
import { rateLimiter } from "../middlewares/rateLimiter"
import { PostController } from "../controllers/postController"
import { PostService } from "../services/postService"

const router = Router()
const postService = new PostService()
const postController = new PostController(postService)

// 포스트 생성
router.post("/", 
  authMiddleware, 
  rateLimiter({ windowMs: 60000, max: 10 }), 
  postController.createPost.bind(postController)
)

// 포스트 목록 조회
router.get("/", 
  rateLimiter({ windowMs: 60000, max: 30 }), 
  postController.getPosts.bind(postController)
)

// 특정 포스트 조회
router.get("/:id", 
  rateLimiter({ windowMs: 60000, max: 30 }), 
  postController.getPostById.bind(postController)
)

// 포스트 수정
router.put("/:id", 
  authMiddleware, 
  rateLimiter({ windowMs: 60000, max: 10 }), 
  postController.updatePost.bind(postController)
)

// 포스트 삭제
router.delete("/:id", 
  authMiddleware, 
  rateLimiter({ windowMs: 60000, max: 10 }), 
  postController.deletePost.bind(postController)
)

export default router