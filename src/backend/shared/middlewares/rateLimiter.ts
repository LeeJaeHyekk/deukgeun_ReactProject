// ============================================================================
// 레이트 리미터 미들웨어
// ============================================================================

import { Request, Response, NextFunction } from "express"
import rateLimit from "express-rate-limit"
import { securityConfig } from "../config/security.js"

// 기본 레이트 리미터
export const defaultRateLimit = rateLimit({
  windowMs: securityConfig.rateLimit.window,
  max: securityConfig.rateLimit.max,
  message: {
    error: "Too many requests from this IP, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
})

// 로그인용 레이트 리미터 (더 엄격)
export const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 5, // 5회 시도
  message: {
    error: "Too many login attempts, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
})

// API 키 생성용 레이트 리미터
export const apiKeyRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1시간
  max: 3, // 3회 시도
  message: {
    error: "Too many API key generation attempts, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
})

// 파일 업로드용 레이트 리미터
export const uploadRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1분
  max: 10, // 10회 업로드
  message: {
    error: "Too many file uploads, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
})

// 이메일 전송용 레이트 리미터
export const emailRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1분
  max: 3, // 3회 전송
  message: {
    error: "Too many email requests, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
})
