import { Request, Response, NextFunction } from "express"

interface RateLimitConfig {
  windowMs: number
  max: number
  message: string
}

const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

export const rateLimiter = (config: RateLimitConfig) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = req.ip || "unknown"
    const now = Date.now()
    const windowStart = now - config.windowMs

    // Clean up expired entries
    for (const [k, v] of rateLimitStore.entries()) {
      if (v.resetTime < now) {
        rateLimitStore.delete(k)
      }
    }

    const current = rateLimitStore.get(key)
    
    if (!current || current.resetTime < now) {
      rateLimitStore.set(key, { count: 1, resetTime: now + config.windowMs })
      return next()
    }

    if (current.count >= config.max) {
      return res.status(429).json({ message: config.message })
    }

    current.count++
    next()
  }
}

export const machineRateLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // 200 requests per window
  message: "기구 관련 요청이 너무 많습니다. 잠시 후 다시 시도해주세요."
})
