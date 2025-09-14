import { Request, Response, NextFunction } from 'express'

// 간단한 메모리 기반 Rate Limiter
interface RateLimitInfo {
  count: number
  resetTime: number
}

const rateLimitStore = new Map<string, RateLimitInfo>()

/**
 * Rate Limiting 미들웨어
 * @param windowMs 시간 윈도우 (밀리초)
 * @param maxRequests 최대 요청 수
 */
export const rateLimiter = (
  windowMs: number = 15 * 60 * 1000,
  maxRequests: number = 100
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const clientId = req.ip || req.connection.remoteAddress || 'unknown'
    const now = Date.now()

    // 기존 정보 가져오기
    const existing = rateLimitStore.get(clientId)

    if (!existing || now > existing.resetTime) {
      // 새로운 윈도우 시작
      rateLimitStore.set(clientId, {
        count: 1,
        resetTime: now + windowMs,
      })
    } else {
      // 기존 윈도우에서 카운트 증가
      existing.count++

      if (existing.count > maxRequests) {
        return res.status(429).json({
          message: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
          retryAfter: Math.ceil((existing.resetTime - now) / 1000),
        })
      }
    }

    // Rate limit 헤더 추가
    const current = rateLimitStore.get(clientId)!
    res.set({
      'X-RateLimit-Limit': maxRequests.toString(),
      'X-RateLimit-Remaining': Math.max(
        0,
        maxRequests - current.count
      ).toString(),
      'X-RateLimit-Reset': new Date(current.resetTime).toISOString(),
    })

    next()
  }
}

/**
 * Machine API 전용 Rate Limiter (개발 환경에서는 관대하게)
 */
export const machineRateLimiter = rateLimiter(15 * 60 * 1000, 1000) // 15분에 1000회

/**
 * Admin API 전용 Rate Limiter (개발 환경에서는 관대하게)
 */
export const adminRateLimiter = rateLimiter(15 * 60 * 1000, 500) // 15분에 500회

/**
 * Workout API 전용 Rate Limiter (개발 환경에서는 관대하게)
 */
export const workoutRateLimiter = rateLimiter(60 * 1000, 200) // 1분에 200회

/**
 * 개발 환경용 관대한 Rate Limiter
 */
export const devRateLimiter = rateLimiter(60 * 1000, 1000) // 1분에 1000회
