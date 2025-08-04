import { Router } from "express";
import { PostController } from "../controllers/post.controller";
import { authenticateToken } from "../middlewares/auth";

/**
 * Express 라우터 인스턴스 생성
 * 포스트 관련 API 엔드포인트를 정의합니다.
 */
const router = Router();

/**
 * PostController 인스턴스 생성
 * 포스트 관련 비즈니스 로직을 처리하는 컨트롤러입니다.
 */
const postController = new PostController();

/**
 * 포스트 관련 API 라우트 정의
 *
 * GET /api/posts - 모든 포스트 목록 조회 (인증 불필요)
 * GET /api/posts/:id - 특정 포스트 조회 (인증 불필요)
 * POST /api/posts - 새 포스트 생성 (인증 필요)
 * PUT /api/posts/:id - 포스트 수정 (인증 필요)
 * DELETE /api/posts/:id - 포스트 삭제 (인증 필요)
 */
router.get("/", postController.getAllPosts);
router.get("/:id", postController.getPostById);
router.post("/", authenticateToken, postController.createPost);
router.put("/:id", authenticateToken, postController.updatePost);
router.delete("/:id", authenticateToken, postController.deletePost);

export default router;
