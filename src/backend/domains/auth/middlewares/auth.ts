// ============================================================================
// Auth Middleware
// ============================================================================

import { Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
import { appConfig } from "../../../shared/config/app.js"
import { AuthRequest } from "../../../shared/types/auth.js"

export function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "")

    if (!token) {
      return res.status(401).json({
        success: false,
        error: "Access denied. No token provided.",
      })
    }

    const decoded = jwt.verify(token, appConfig.jwt.secret) as any
    req.user = {
      userId: decoded.userId,
      role: decoded.role,
    }

    next()
  } catch (error) {
    res.status(401).json({
      success: false,
      error: "Invalid token.",
    })
  }
}
