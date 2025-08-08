import { Router } from "express";
import {
  getPlatformStats,
  getDetailedStats,
} from "../controllers/statsController";
import { rateLimiter } from "../middlewares/rateLimiter";
import { isAdmin } from "../middlewares/auth";

const router = Router();

// 플랫폼 기본 통계 (공개)
router.get("/platform", rateLimiter, getPlatformStats);

// 상세 통계 (관리자만)
router.get("/detailed", rateLimiter, isAdmin, getDetailedStats);

export default router;
