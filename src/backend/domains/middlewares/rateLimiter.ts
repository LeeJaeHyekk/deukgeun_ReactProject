// ============================================================================
// Rate Limiter Middleware
// ============================================================================

import { Request, Response, NextFunction } from "express"
import rateLimit from "express-rate-limit"

// 일반 API 레이트 리미터
export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 100, // 최대 100 요청
  message: {
    success: false,
    error: "Too many requests from this IP, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
})

// 인증 관련 레이트 리미터 (더 엄격)
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 5, // 최대 5 요청
  message: {
    success: false,
    error: "Too many authentication attempts, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
})

// 머신 관련 레이트 리미터
export const machineRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1분
  max: 30, // 최대 30 요청
  message: {
    success: false,
    error: "Too many machine requests, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
})

// 헬스장 관련 레이트 리미터
export const gymRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1분
  max: 20, // 최대 20 요청
  message: {
    success: false,
    error: "Too many gym requests, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
})

// 워크아웃 관련 레이트 리미터
export const workoutRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1분
  max: 50, // 최대 50 요청
  message: {
    success: false,
    error: "Too many workout requests, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
})

// 통계 관련 레이트 리미터
export const statsRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1분
  max: 10, // 최대 10 요청
  message: {
    success: false,
    error: "Too many stats requests, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
})
