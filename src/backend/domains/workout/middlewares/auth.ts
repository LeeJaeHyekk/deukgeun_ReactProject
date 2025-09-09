import { Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
import { AuthRequest } from "../../../shared/types/auth.js"

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "")
    
    if (!token) {
      return res.status(401).json({ message: "토큰이 필요합니다" })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback-secret") as any
    req.user = {
      userId: decoded.userId,
      role: decoded.role
    }
    
    next()
  } catch (error) {
    return res.status(401).json({ message: "유효하지 않은 토큰입니다" })
  }
}
