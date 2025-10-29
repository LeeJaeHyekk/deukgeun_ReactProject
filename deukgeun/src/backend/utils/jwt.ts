import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import { logger } from "@backend/utils/logger"

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
    console.log("🔐 토큰 길이:", token.length)
    console.log("🔐 토큰 시작:", token.substring(0, 20) + "...")
    console.log("🔐 토큰 끝:", "..." + token.substring(token.length - 20))
    console.log("🔐 토큰 부분 수:", token.split('.').length)
    console.log("🔐 시크릿 키 길이:", ACCESS_TOKEN_SECRET?.length || 0)
    console.log("🔐 시크릿 키 시작:", ACCESS_TOKEN_SECRET?.substring(0, 10) + "...")

    const result = jwt.verify(token, ACCESS_TOKEN_SECRET) as JwtPayload
    console.log("🔐 토큰 검증 성공:", result)
    return result
  } catch (error: any) {
    console.error("🔐 Access token 검증 실패:", error.message)
    console.error("🔐 에러 타입:", error.name)
    console.error("🔐 에러 스택:", error.stack)
    
    if (error.name === "TokenExpiredError") {
      console.error("🔐 토큰 만료됨 - 만료 시간:", error.expiredAt)
    } else if (error.name === "JsonWebTokenError") {
      console.error("🔐 JWT 형식 오류 - 잘못된 토큰 구조")
    } else if (error.name === "NotBeforeError") {
      console.error("🔐 토큰이 아직 유효하지 않음 - 활성화 시간:", error.date)
    } else if (error.name === "SyntaxError") {
      console.error("🔐 토큰 파싱 오류 - JSON 형식 문제")
    }
    
    logger.warn("Access token 검증 실패:", error)
    return null
  }
}

// refresh token 해시 관련 함수들
const REFRESH_TOKEN_HASH_ROUNDS = 10

export async function hashRefreshToken(token: string): Promise<string> {
  return bcrypt.hash(token, REFRESH_TOKEN_HASH_ROUNDS)
}

export async function compareRefreshToken(token: string, hash: string): Promise<boolean> {
  return bcrypt.compare(token, hash)
}
