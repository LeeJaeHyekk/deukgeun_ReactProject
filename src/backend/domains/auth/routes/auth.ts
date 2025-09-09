import { Router } from "express"
import {
  login,
  register,
  refreshToken,
  logout,
  checkAuth,
  findId,
  findPassword,
  findIdStep1,
  findIdStep2,
  resetPasswordStep1,
  resetPasswordStep2,
  resetPasswordStep3,
  findIdSimple,
  resetPasswordSimpleStep1,
  resetPasswordSimpleStep2,
} from "../controllers/authController.js"
import { authMiddleware } from "../middlewares/auth"

const router = Router()

router.post("/login", login as any)
router.post("/register", register as any)
router.post("/refresh", refreshToken as any)
router.post("/logout", logout as any)
router.get("/check", authMiddleware, checkAuth as any)
router.post("/find-id", findId as any)
router.post("/find-password", findPassword as any)

// JSON 구조 기반 단순 계정 복구 라우트
router.post("/find-id-simple", findIdSimple as any)
// JSON 구조 기반 단순 비밀번호 재설정 (2단계)
router.post("/reset-password-simple-step1", resetPasswordSimpleStep1 as any)
router.post("/reset-password-simple-step2", resetPasswordSimpleStep2 as any)

// Enhanced Account Recovery Routes
router.post("/find-id/verify-user", findIdStep1 as any)
router.post("/find-id/verify-code", findIdStep2 as any)
router.post("/reset-password/verify-user", resetPasswordStep1 as any)
router.post("/reset-password/verify-code", resetPasswordStep2 as any)
router.post("/reset-password/complete", resetPasswordStep3 as any)

export default router
