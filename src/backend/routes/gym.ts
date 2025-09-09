// ============================================================================
// Gym Routes
// ============================================================================

import { Router } from "express"
import {
  getGyms,
  getGymById,
  createGym,
  updateGym,
  deleteGym,
} from "../domains/gym/controllers/gymController.js"
import { authMiddleware } from "../domains/middlewares/auth.js"
import { gymRateLimiter } from "../domains/middlewares/rateLimiter.js"

const router = Router()

// 헬스장 관련 라우트
router.get("/", gymRateLimiter, getGyms)
router.get("/:id", gymRateLimiter, getGymById)
router.post("/", authMiddleware, gymRateLimiter, createGym)
router.put("/:id", authMiddleware, gymRateLimiter, updateGym)
router.delete("/:id", authMiddleware, gymRateLimiter, deleteGym)

export default router
