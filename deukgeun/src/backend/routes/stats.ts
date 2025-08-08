import { Router } from "express"
import {
  getPlatformStats,
  getDetailedStats,
  getUserStats,
} from "../controllers/statsController"
import { rateLimiter } from "../middlewares/rateLimiter"
import { isAdmin, authenticateToken } from "../middlewares/auth"

const router = Router()

// 플랫폼 기본 통계 (공개)
router.get("/platform", rateLimiter, getPlatformStats)

// 상세 통계 (관리자만)
router.get("/detailed", rateLimiter, isAdmin, getDetailedStats)

// 사용자 개인 통계 (인증된 사용자만)
router.get("/user", rateLimiter, authenticateToken, getUserStats)

export default router
