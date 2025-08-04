import { Router } from "express";
import {
  login,
  register,
  refreshToken,
  logout,
} from "../controllers/authController";

const router = Router();

router.post("/login", login);
router.post("/register", register);
router.post("/refresh", refreshToken);
router.post("/logout", logout);

export default router;
