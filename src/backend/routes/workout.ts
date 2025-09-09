// ============================================================================
// Workout Routes
// ============================================================================

import { Router } from "express"
import {
  getWorkoutSessions,
  getWorkoutSessionById,
  createWorkoutSession,
  updateWorkoutSession,
  deleteWorkoutSession,
} from "../domains/workout/controllers/workoutController.js"
import { authMiddleware } from "../domains/middlewares/auth.js"
import { workoutRateLimiter } from "../domains/middlewares/rateLimiter.js"

const router = Router()

// 워크아웃 관련 라우트
router.get("/", authMiddleware, workoutRateLimiter, getWorkoutSessions)
router.get("/:id", authMiddleware, workoutRateLimiter, getWorkoutSessionById)
router.post("/", authMiddleware, workoutRateLimiter, createWorkoutSession)
router.put("/:id", authMiddleware, workoutRateLimiter, updateWorkoutSession)
router.delete("/:id", authMiddleware, workoutRateLimiter, deleteWorkoutSession)

export default router
