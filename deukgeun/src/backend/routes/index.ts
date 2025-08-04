import { Router } from "express";
import postRoutes from "./post";
import schedulerRoutes from "./scheduler";
// import gymRoutes from "./gym";

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

/**
 * 스케줄러 관련 라우트 등록
 * /api/scheduler 경로로 들어오는 모든 요청을 schedulerRoutes로 전달합니다.
 */
router.use("/scheduler", schedulerRoutes);

export default router;
