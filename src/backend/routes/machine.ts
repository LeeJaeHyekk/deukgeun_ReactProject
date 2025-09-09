// ============================================================================
// Machine Routes
// ============================================================================

import { Router } from "express"
import {
  getAllMachines,
  getMachineById,
  createMachine,
  updateMachine,
  deleteMachine,
} from "../domains/machine/controllers/machineController.js"
import { authMiddleware } from "../domains/middlewares/auth.js"
import { machineRateLimiter } from "../domains/middlewares/rateLimiter.js"

const router = Router()

// 머신 관련 라우트
router.get("/", machineRateLimiter, getAllMachines)
router.get("/:id", machineRateLimiter, getMachineById)
router.post("/", authMiddleware, machineRateLimiter, createMachine)
router.put("/:id", authMiddleware, machineRateLimiter, updateMachine)
router.delete("/:id", authMiddleware, machineRateLimiter, deleteMachine)

export default router
