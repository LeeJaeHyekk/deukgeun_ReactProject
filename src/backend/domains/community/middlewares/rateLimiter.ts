import { Request, Response, NextFunction } from "express"

interface RateLimitConfig {
  windowMs: number
  max: number
}

export function rateLimiter(config: RateLimitConfig) {
  return (req: Request, res: Response, next: NextFunction) => {
    // TODO: 실제 rate limiting 로직 구현
    // 임시로 항상 통과하도록 설정
    next()
  }
}
