// ============================================================================
// 인증 미들웨어
// ============================================================================

import { Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
import { securityConfig } from "../config/security.js"
import { AuthRequest } from "../types/auth.js"

export function authenticateToken(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers["authorization"]
  const token = authHeader && authHeader.split(" ")[1]

  if (!token) {
    return res.status(401).json({ error: "Access token required" })
  }

  try {
    const decoded = jwt.verify(token, securityConfig.jwt.accessSecret) as any
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    }
    next()
  } catch (error) {
    return res.status(403).json({ error: "Invalid or expired token" })
  }
}

export function requireRole(role: string) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" })
    }

    if (req.user.role !== role && req.user.role !== "admin") {
      return res.status(403).json({ error: "Insufficient permissions" })
    }

    next()
  }
}

export function optionalAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers["authorization"]
  const token = authHeader && authHeader.split(" ")[1]

  if (!token) {
    return next()
  }

  try {
    const decoded = jwt.verify(token, securityConfig.jwt.accessSecret) as any
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    }
  } catch (error) {
    // 토큰이 유효하지 않아도 계속 진행
  }

  next()
}
