import { Router } from "express";
import postRoutes from "./post.route";

/**
 * Express 라우터 인스턴스 생성
 * 애플리케이션의 모든 API 라우트를 관리합니다.
 */
const router = Router();

/**
 * 포스트 관련 라우트 등록
 * /api/posts 경로로 들어오는 모든 요청을 postRoutes로 전달합니다.
 */
router.use("/posts", postRoutes);

export default router;
