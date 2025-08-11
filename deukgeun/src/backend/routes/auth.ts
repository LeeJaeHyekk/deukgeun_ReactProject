import { Router } from "express"
import {
  login,
  register,
  refreshToken,
  logout,
  checkAuth,
} from "../controllers/authController"
import { authenticateToken } from "../middlewares/auth"

const router = Router()

router.post("/login", login as any)
router.post("/register", register as any)
router.post("/refresh", refreshToken as any)
router.post("/logout", logout as any)
router.get("/check", authenticateToken, checkAuth as any)

export default router
