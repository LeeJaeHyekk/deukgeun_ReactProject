// ============================================================================
// 에러 핸들러 미들웨어
// ============================================================================

import { Request, Response, NextFunction } from "express"
import { logger } from "../utils/logger.js"

interface CustomError extends Error {
  statusCode?: number
  isOperational?: boolean
}

export function errorHandler(
  error: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  let statusCode = error.statusCode || 500
  let message = error.message || "Internal Server Error"

  // 로그 기록
  logger.error("Error occurred", error, {
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
  })

  // 개발 환경에서는 스택 트레이스 포함
  if (process.env.NODE_ENV === "development") {
    return res.status(statusCode).json({
      success: false,
      error: message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    })
  }

  // 프로덕션 환경에서는 민감한 정보 제외
  if (statusCode === 500) {
    message = "Internal Server Error"
  }

  res.status(statusCode).json({
    success: false,
    error: message,
    timestamp: new Date().toISOString(),
  })
}

export function notFoundHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const error = new Error(`Not Found - ${req.originalUrl}`) as CustomError
  error.statusCode = 404
  next(error)
}

export function asyncHandler(fn: Function) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}
