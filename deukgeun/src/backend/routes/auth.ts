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

router.post("/login", login)
router.post("/register", register)
router.post("/refresh", refreshToken)
router.post("/logout", logout)
router.get("/check", authenticateToken, checkAuth)

export default router
