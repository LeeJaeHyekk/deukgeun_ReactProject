import jwt from "jsonwebtoken"
import { logger } from "./logger"

const ACCESS_TOKEN_SECRET =
  process.env.JWT_ACCESS_SECRET || "your-access-secret"
const REFRESH_TOKEN_SECRET =
  process.env.JWT_REFRESH_SECRET || "your-refresh-secret"

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
    return jwt.verify(token, ACCESS_TOKEN_SECRET) as JwtPayload
  } catch (error) {
    logger.warn("Access token 검증 실패:", error)
    return null
  }
}
