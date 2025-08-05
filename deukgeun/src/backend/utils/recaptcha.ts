import axios from "axios";
import { config } from "../config/env";
import { logger } from "./logger";

export async function verifyRecaptcha(token: string): Promise<boolean> {
  try {
    if (!token) {
      logger.warn("reCAPTCHA 토큰이 없습니다.");
      return false;
    }

    // 개발 환경에서 더미 토큰 허용
    if (
      config.NODE_ENV === "development" &&
      token.includes("dummy-token-for-development")
    ) {
      logger.info("개발 환경에서 더미 reCAPTCHA 토큰 허용");
      return true;
    }

    const secret = config.RECAPTCHA_SECRET;
    if (!secret || secret === "your-secret-key") {
      logger.error("reCAPTCHA 시크릿 키가 설정되지 않았습니다.");
      return false;
    }

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
    );

    if (!response.data.success) {
      logger.warn("reCAPTCHA 검증 실패:", response.data["error-codes"]);
    }

    return response.data.success;
  } catch (error) {
    logger.error("reCAPTCHA 인증 실패:", error);
    return false;
  }
}
