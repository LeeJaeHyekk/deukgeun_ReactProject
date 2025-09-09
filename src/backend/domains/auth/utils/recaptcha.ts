// ============================================================================
// reCAPTCHA 유틸리티
// ============================================================================

import axios from "axios"
import { securityConfig } from "../../../shared/config/security.js"

interface RecaptchaResponse {
  success: boolean
  challenge_ts?: string
  hostname?: string
  "error-codes"?: string[]
}

export async function verifyRecaptcha(token: string): Promise<boolean> {
  try {
    const response = await axios.post<RecaptchaResponse>(
      "https://www.google.com/recaptcha/api/siteverify",
      null,
      {
        params: {
          secret: securityConfig.recaptcha.secret,
          response: token,
        },
      }
    )

    return response.data.success
  } catch (error) {
    console.error("reCAPTCHA verification failed:", error)
    return false
  }
}

export function validateRecaptchaToken(token: string): boolean {
  if (!token || typeof token !== "string") {
    return false
  }

  // 토큰이 비어있지 않은지 확인
  return token.trim().length > 0
}
