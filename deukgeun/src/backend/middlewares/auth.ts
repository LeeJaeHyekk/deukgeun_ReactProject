import { Request, Response, NextFunction } from "express"
import { verifyAccessToken } from "../utils/jwt"
import { logger } from "../utils/logger"

// Request 인터페이스 확장
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: number
        role: "user" | "admin" | "moderator"
      }
    }
  }
}

export function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers["authorization"]
    const token = authHeader && authHeader.split(" ")[1] // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ message: "액세스 토큰이 필요합니다." })
    }

    const payload = verifyAccessToken(token)
    if (!payload) {
      return res.status(403).json({ message: "유효하지 않은 토큰입니다." })
    }

    req.user = payload
    next()
  } catch (error) {
    logger.error("토큰 인증 중 오류:", error)
    return res.status(500).json({ message: "서버 오류가 발생했습니다." })
  }
}

// 선택적 인증 미들웨어 (토큰이 있으면 검증, 없으면 통과)
export function optionalAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers["authorization"]
    const token = authHeader && authHeader.split(" ")[1]

    if (token) {
      const payload = verifyAccessToken(token)
      if (payload) {
        req.user = payload
      }
    }

    next()
  } catch (error) {
    logger.error("선택적 인증 중 오류:", error)
    next() // 오류가 발생해도 계속 진행
  }
}

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "관리자만 접근할 수 있습니다." })
  }
  next()
}
