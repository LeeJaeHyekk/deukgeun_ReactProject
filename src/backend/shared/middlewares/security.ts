import { Request, Response, NextFunction } from "express"
import helmet from "helmet"
import cors from "cors"
import rateLimit from "express-rate-limit"

// CORS 설정
export const corsMiddleware = cors({
  origin: process.env.ALLOWED_ORIGINS?.split(",") || ["http://localhost:3000"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
})

// Helmet 보안 헤더 설정
export const helmetMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
})

// 기본 레이트 리미터
export const rateLimitMiddleware = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 100, // 최대 100 요청
  message: {
    success: false,
    message: "너무 많은 요청입니다. 잠시 후 다시 시도해주세요.",
  },
  standardHeaders: true,
  legacyHeaders: false,
})

// API 레이트 리미터
export const apiRateLimitMiddleware = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 50, // 최대 50 요청
  message: {
    success: false,
    message: "API 요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.",
  },
  standardHeaders: true,
  legacyHeaders: false,
})

// 인증 레이트 리미터
export const authRateLimitMiddleware = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 10, // 최대 10 요청
  message: {
    success: false,
    message: "인증 요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.",
  },
  standardHeaders: true,
  legacyHeaders: false,
})

// 보안 미들웨어 통합
export const securityMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // XSS 방지
  res.setHeader("X-Content-Type-Options", "nosniff")
  res.setHeader("X-Frame-Options", "DENY")
  res.setHeader("X-XSS-Protection", "1; mode=block")

  // 클릭재킹 방지
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin")

  // HSTS 설정 (HTTPS 환경에서만)
  if (req.secure || req.headers["x-forwarded-proto"] === "https") {
    res.setHeader(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains"
    )
  }

  next()
}

// 요청 크기 제한
export const requestSizeLimit = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const contentLength = parseInt(req.headers["content-length"] || "0")
  const maxSize = 10 * 1024 * 1024 // 10MB

  if (contentLength > maxSize) {
    return res.status(413).json({
      success: false,
      message: "요청 크기가 너무 큽니다.",
    })
  }

  next()
}

// SQL 인젝션 방지
export const sqlInjectionProtection = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/i,
    /(\b(OR|AND)\s+\d+\s*=\s*\d+)/i,
    /(\b(OR|AND)\s+['"]\s*=\s*['"])/i,
    /(\b(OR|AND)\s+['"]\s*LIKE\s*['"])/i,
    /(\b(OR|AND)\s+['"]\s*IN\s*\()/i,
    /(\b(OR|AND)\s+['"]\s*BETWEEN\s+)/i,
    /(\b(OR|AND)\s+['"]\s*IS\s+NULL)/i,
    /(\b(OR|AND)\s+['"]\s*IS\s+NOT\s+NULL)/i,
  ]

  const checkString = (str: string) => {
    return sqlPatterns.some(pattern => pattern.test(str))
  }

  const checkObject = (obj: any): boolean => {
    if (typeof obj === "string") {
      return checkString(obj)
    }

    if (Array.isArray(obj)) {
      return obj.some(checkObject)
    }

    if (obj && typeof obj === "object") {
      return Object.values(obj).some(checkObject)
    }

    return false
  }

  if (
    checkObject(req.body) ||
    checkObject(req.query) ||
    checkObject(req.params)
  ) {
    return res.status(400).json({
      success: false,
      message: "잘못된 요청입니다.",
    })
  }

  next()
}

// XSS 방지
export const xssProtection = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
    /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
    /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi,
    /<link\b[^<]*(?:(?!<\/link>)<[^<]*)*<\/link>/gi,
    /<meta\b[^<]*(?:(?!<\/meta>)<[^<]*)*<\/meta>/gi,
    /javascript:/gi,
    /vbscript:/gi,
    /onload\s*=/gi,
    /onerror\s*=/gi,
    /onclick\s*=/gi,
    /onmouseover\s*=/gi,
  ]

  const checkString = (str: string) => {
    return xssPatterns.some(pattern => pattern.test(str))
  }

  const checkObject = (obj: any): boolean => {
    if (typeof obj === "string") {
      return checkString(obj)
    }

    if (Array.isArray(obj)) {
      return obj.some(checkObject)
    }

    if (obj && typeof obj === "object") {
      return Object.values(obj).some(checkObject)
    }

    return false
  }

  if (
    checkObject(req.body) ||
    checkObject(req.query) ||
    checkObject(req.params)
  ) {
    return res.status(400).json({
      success: false,
      message: "잘못된 요청입니다.",
    })
  }

  next()
}

// 요청 로깅
export const requestLogging = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const start = Date.now()

  res.on("finish", () => {
    const duration = Date.now() - start
    const logData = {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get("User-Agent"),
      timestamp: new Date().toISOString(),
    }

    if (res.statusCode >= 400) {
      console.error("Request Error:", logData)
    } else {
      console.log("Request:", logData)
    }
  })

  next()
}
