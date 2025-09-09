// ============================================================================
// Auth Routes
// ============================================================================

import { Router } from "express"
import {
  login,
  register,
  logout,
  refreshToken,
} from "../domains/auth/controllers/authController.js"

const router = Router()

// 인증 관련 라우트
router.post("/login", (req, res) => login(req, res))
router.post("/register", (req, res) => register(req, res))
router.post("/logout", (req, res) => logout(req, res))
router.post("/refresh", (req, res) => refreshToken(req, res))

export default router
