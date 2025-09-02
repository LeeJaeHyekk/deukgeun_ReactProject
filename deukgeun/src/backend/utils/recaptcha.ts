import axios from "axios"
import { logger } from "./logger.js"

// reCAPTCHA 검증 함수
export async function verifyRecaptcha(token: string): Promise<boolean> {
  try {
    if (!token) {
      logger.warn("reCAPTCHA 토큰이 없습니다.")
      return false
    }

    // 개발 환경에서 더미 토큰 허용
    if (process.env.NODE_ENV === "development") {
      if (token.includes("dummy-token") || token.includes("test-token")) {
        logger.info("개발 환경에서 더미 reCAPTCHA 토큰 허용")
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
        return true
      }
      logger.error("reCAPTCHA 시크릿 키가 설정되지 않았습니다.")
      return false
    }

    // 실제 reCAPTCHA 검증
    const response = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify`,
      null,
      {
        params: {
          secret,
          response: token,
        },
        timeout: 10000, // 10초 타임아웃
      }
    )

    if (!response.data.success) {
      logger.warn("reCAPTCHA 검증 실패:", {
        errorCodes: response.data["error-codes"],
        token: token.substring(0, 20) + "...",
      })
      return false
    }

    // 점수 기반 검증 (v3의 경우)
    if (response.data.score !== undefined) {
      const score = response.data.score
      const minScore = parseFloat(process.env.RECAPTCHA_MIN_SCORE || "0.5")

      if (score < minScore) {
        logger.warn("reCAPTCHA 점수가 너무 낮습니다:", { score, minScore })
        return false
      }

      logger.info("reCAPTCHA 검증 성공:", { score, minScore })
    } else {
      logger.info("reCAPTCHA 검증 성공")
    }

    return true
  } catch (error) {
    logger.error("reCAPTCHA 인증 실패:", error)

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
