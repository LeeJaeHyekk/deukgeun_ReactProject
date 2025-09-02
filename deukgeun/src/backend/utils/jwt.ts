import jwt from "jsonwebtoken"
import { logger } from "./logger.js"

// Default secrets for development (should be overridden in production)
const ACCESS_TOKEN_SECRET =
  process.env.JWT_ACCESS_SECRET ||
  "default-access-secret-key-2024-development-only"
const REFRESH_TOKEN_SECRET =
  process.env.JWT_REFRESH_SECRET ||
  "default-refresh-secret-key-2024-development-only"

// Warn if using default secrets
if (!process.env.JWT_ACCESS_SECRET || !process.env.JWT_REFRESH_SECRET) {
  console.warn(
    "⚠️  JWT secrets not set in environment variables. Using default secrets for development."
  )
  console.warn(
    "⚠️  Please set JWT_ACCESS_SECRET and JWT_REFRESH_SECRET in your .env file for production."
  )
}

interface JwtPayload {
  userId: number
  role: "user" | "admin" | "moderator"
}

export function createTokens(
  userId: number,
  role: "user" | "admin" | "moderator"
) {
  try {
    const accessToken = jwt.sign({ userId, role }, ACCESS_TOKEN_SECRET, {
      expiresIn: "15m",
    })

    const refreshToken = jwt.sign({ userId }, REFRESH_TOKEN_SECRET, {
      expiresIn: "7d",
    })

    return { accessToken, refreshToken }
  } catch (error) {
    logger.error("토큰 생성 실패:", error)
    throw new Error("토큰 생성에 실패했습니다.")
  }
}

export function verifyRefreshToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, REFRESH_TOKEN_SECRET) as JwtPayload
  } catch (error) {
    logger.warn("Refresh token 검증 실패:", error)
    return null
  }
}

export function verifyAccessToken(token: string): JwtPayload | null {
  try {
    console.log("🔐 Access token 검증 시작")
    console.log("🔐 토큰:", token.substring(0, 20) + "...")
    console.log(
      "🔐 시크릿 키:",
      ACCESS_TOKEN_SECRET ? "설정됨" : "설정되지 않음"
    )

    const result = jwt.verify(token, ACCESS_TOKEN_SECRET) as JwtPayload
    console.log("🔐 토큰 검증 성공:", result)
    return result
  } catch (error: any) {
    console.error("🔐 Access token 검증 실패:", error.message)
    if (error.name === "TokenExpiredError") {
      console.error("🔐 토큰 만료됨")
    } else if (error.name === "JsonWebTokenError") {
      console.error("🔐 JWT 형식 오류")
    } else if (error.name === "NotBeforeError") {
      console.error("🔐 토큰이 아직 유효하지 않음")
    }
    logger.warn("Access token 검증 실패:", error)
    return null
  }
}
