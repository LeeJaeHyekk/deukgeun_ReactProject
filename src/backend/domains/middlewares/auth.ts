// ============================================================================
// Auth Middleware
// ============================================================================

import { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
import { appConfig } from "../../shared/config/app.js"

interface AuthRequest extends Request {
  user?: {
    userId: number
    role: "user" | "admin" | "moderator"
  }
}

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

export function isAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      error: "Access denied. Admin privileges required.",
    })
  }
  next()
}

export function isModerator(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  if (
    !req.user ||
    (req.user.role !== "admin" && req.user.role !== "moderator")
  ) {
    return res.status(403).json({
      success: false,
      error: "Access denied. Moderator privileges required.",
    })
  }
  next()
}
