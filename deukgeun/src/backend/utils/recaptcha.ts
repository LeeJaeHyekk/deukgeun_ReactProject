import axios from "axios"
import { Request } from "express"
import { logger } from "@backend/utils/logger"
import * as fs from "fs"
import * as path from "path"

// reCAPTCHA 검증 컨텍스트
export interface RecaptchaVerificationContext {
  userAgent?: string
  userIpAddress?: string
  requestUrl?: string
}

// 프로덕션 로깅 함수
function writeRecaptchaLog(
  level: "info" | "warn" | "error",
  message: string,
  data?: any
): void {
  const logDir = path.join(process.cwd(), "logs")
  const logFile = path.join(logDir, "recaptcha.log")

  // 로그 디렉토리 생성
  if (!fs.existsSync(logDir)) {
    try {
      fs.mkdirSync(logDir, { recursive: true })
    } catch (error) {
      logger.warn("로그 디렉토리 생성 실패:", error)
      return
    }
  }

  const logEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    data: data || {},
    environment: process.env.NODE_ENV || "development",
    mode: process.env.MODE || "development",
  }

  try {
    fs.appendFileSync(logFile, JSON.stringify(logEntry) + "\n", "utf-8")
  } catch (error) {
    logger.warn("reCAPTCHA 로그 파일 기록 실패:", error)
  }
}

// Request 객체에서 컨텍스트 추출
function extractContext(req?: Request | RecaptchaVerificationContext): RecaptchaVerificationContext {
  if (!req) {
    return {}
  }

  // Request 객체인지 확인
  if ("headers" in req && "ip" in req) {
    const request = req as Request
    return {
      userAgent: request.headers["user-agent"] || request.get("user-agent") || undefined,
      userIpAddress: request.ip || request.socket.remoteAddress || undefined,
      requestUrl: request.url || request.originalUrl || undefined,
    }
  }

  // 이미 컨텍스트 객체인 경우
  return req as RecaptchaVerificationContext
}

// reCAPTCHA 검증 함수 (v3 표준)
export async function verifyRecaptcha(
  token: string,
  expectedAction?: string,
  context?: Request | RecaptchaVerificationContext
): Promise<boolean> {
  logger.info(`[verifyRecaptcha] 검증 시작`, {
    tokenLength: token.length,
    tokenPreview: token.substring(0, 20) + '...',
    expectedAction,
    hasContext: !!context
  })
  const requestId = `recaptcha-${Date.now()}-${Math.random().toString(36).substring(7)}`
  const startTime = Date.now()
  
  try {
    if (!token) {
      logger.warn("reCAPTCHA 토큰이 없습니다.")
      writeRecaptchaLog("warn", "reCAPTCHA 토큰 없음", {
        requestId,
        expectedAction,
      })
      return false
    }

    // 개발 환경에서 더미 토큰 허용
    if (process.env.NODE_ENV === "development") {
      if (token.includes("dummy-token") || token.includes("test-token")) {
        logger.info("개발 환경에서 더미 reCAPTCHA 토큰 허용")
        writeRecaptchaLog("info", "개발 환경 더미 토큰 허용", {
          requestId,
          expectedAction,
          token: token.substring(0, 20) + "...",
        })
        return true
      }
    }

    const secret =
      process.env.RECAPTCHA_SECRET_KEY || process.env.RECAPTCHA_SECRET
    if (!secret || secret === "") {
      // 개발 환경에서는 시크릿 키가 없어도 더미 토큰 허용
      if (process.env.NODE_ENV === "development") {
        logger.warn(
          "개발 환경에서 reCAPTCHA 시크릿 키가 설정되지 않았지만 더미 토큰 허용"
        )
        writeRecaptchaLog("warn", "개발 환경 시크릿 키 없음", {
          requestId,
          expectedAction,
        })
        return true
      }
      logger.error("reCAPTCHA 시크릿 키가 설정되지 않았습니다.")
      writeRecaptchaLog("error", "reCAPTCHA 시크릿 키 없음", {
        requestId,
        expectedAction,
      })
      return false
    }

    // 컨텍스트 추출
    const verificationContext = extractContext(context)
    const { userAgent, userIpAddress, requestUrl } = verificationContext

    // 실제 reCAPTCHA 검증 (v3 표준 API)
    const response = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify`,
      null,
      {
        params: {
          secret,
          response: token,
          remoteip: userIpAddress, // IP 주소 전달 (선택사항)
        },
        timeout: 10000, // 10초 타임아웃
      }
    )

    const duration = Date.now() - startTime

    if (!response.data.success) {
      const errorCodes = response.data["error-codes"] || []
      logger.warn("reCAPTCHA 검증 실패:", {
        errorCodes,
        token: token.substring(0, 20) + "...",
      })
      
      writeRecaptchaLog("warn", "reCAPTCHA v3 검증 실패", {
        requestId,
        expectedAction,
        errorCodes,
        hostname: response.data.hostname,
        challenge_ts: response.data.challenge_ts,
        duration: `${duration}ms`,
        userAgent,
        userIpAddress,
        requestUrl,
      })
      
      return false
    }

    // action 검증 (v3의 경우)
    if (expectedAction && response.data.action) {
      if (response.data.action !== expectedAction) {
        logger.warn("reCAPTCHA action 불일치:", {
          expected: expectedAction,
          actual: response.data.action,
        })
        
        writeRecaptchaLog("warn", "reCAPTCHA action 불일치", {
          requestId,
          expectedAction,
          actualAction: response.data.action,
          score: response.data.score,
          hostname: response.data.hostname,
          challenge_ts: response.data.challenge_ts,
          duration: `${duration}ms`,
          userAgent,
          userIpAddress,
          requestUrl,
        })
        
        return false
      }
    }

    // 점수 기반 검증 (v3의 경우)
    if (response.data.score !== undefined) {
      const score = response.data.score
      const minScore = parseFloat(process.env.RECAPTCHA_MIN_SCORE || "0.5")

      if (score < minScore) {
        logger.warn("reCAPTCHA 점수가 너무 낮습니다:", { score, minScore })
        
        writeRecaptchaLog("warn", "reCAPTCHA 점수 낮음", {
          requestId,
          expectedAction,
          score,
          minScore,
          action: response.data.action,
          hostname: response.data.hostname,
          challenge_ts: response.data.challenge_ts,
          duration: `${duration}ms`,
          userAgent,
          userIpAddress,
          requestUrl,
        })
        
        return false
      }

      logger.info("reCAPTCHA 검증 성공:", { score, minScore, action: response.data.action })
      
      writeRecaptchaLog("info", "reCAPTCHA v3 검증 성공", {
        requestId,
        expectedAction,
        score,
        action: response.data.action,
        hostname: response.data.hostname,
        challenge_ts: response.data.challenge_ts,
        duration: `${duration}ms`,
        userAgent,
        userIpAddress,
        requestUrl,
      })
    } else {
      logger.info("reCAPTCHA 검증 성공")
      
      writeRecaptchaLog("info", "reCAPTCHA 검증 성공", {
        requestId,
        expectedAction,
        action: response.data.action,
        hostname: response.data.hostname,
        challenge_ts: response.data.challenge_ts,
        duration: `${duration}ms`,
        userAgent,
        userIpAddress,
        requestUrl,
      })
    }

    return true
  } catch (error) {
    const duration = Date.now() - startTime
    logger.error("reCAPTCHA 인증 실패:", error)
    
    const verificationContext = extractContext(context)
    const { userAgent, userIpAddress, requestUrl } = verificationContext

    writeRecaptchaLog("error", "reCAPTCHA 검증 오류", {
      requestId,
      expectedAction,
      error: error instanceof Error ? error.message : String(error),
      duration: `${duration}ms`,
      userAgent,
      userIpAddress,
      requestUrl,
    })

    // 개발 환경에서는 네트워크 오류 시에도 더미 토큰 허용
    if (process.env.NODE_ENV === "development") {
      logger.warn("개발 환경에서 네트워크 오류 시 더미 토큰 허용")
      return true
    }

    return false
  }
}

// reCAPTCHA 설정 검증
export function validateRecaptchaConfig(): boolean {
  const secret =
    process.env.RECAPTCHA_SECRET_KEY || process.env.RECAPTCHA_SECRET

  if (!secret || secret === "") {
    if (process.env.NODE_ENV === "development") {
      logger.warn(
        "개발 환경: reCAPTCHA 시크릿 키가 설정되지 않음 (더미 토큰 사용)"
      )
      return true
    }
    logger.error("프로덕션 환경: reCAPTCHA 시크릿 키가 설정되지 않음")
    return false
  }

  return true
}
