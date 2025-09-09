// ============================================================================
// JWT 유틸리티
// ============================================================================

import jwt from "jsonwebtoken"
import { securityConfig } from "../../../shared/config/security.js"

interface TokenPayload {
  id: string
  userId: string
  email: string
  role: string
  iat?: number
  exp?: number
}

export function generateAccessToken(
  payload: Omit<TokenPayload, "iat" | "exp">
): string {
  const secret = securityConfig.jwt.accessSecret || "default-access-secret"
  return jwt.sign(payload, secret, {
    expiresIn: securityConfig.jwt.accessExpiresIn,
  } as jwt.SignOptions)
}

export function generateRefreshToken(
  payload: Omit<TokenPayload, "iat" | "exp">
): string {
  const secret = securityConfig.jwt.refreshSecret || "default-refresh-secret"
  return jwt.sign(payload, secret, {
    expiresIn: securityConfig.jwt.refreshExpiresIn,
  } as jwt.SignOptions)
}

export function verifyAccessToken(token: string): TokenPayload | null {
  try {
    const secret = securityConfig.jwt.accessSecret || "default-access-secret"
    return jwt.verify(token, secret) as TokenPayload
  } catch (error) {
    return null
  }
}

export function verifyRefreshToken(token: string): TokenPayload | null {
  try {
    const secret = securityConfig.jwt.refreshSecret || "default-refresh-secret"
    return jwt.verify(token, secret) as TokenPayload
  } catch (error) {
    return null
  }
}

export function decodeToken(token: string): TokenPayload | null {
  try {
    return jwt.decode(token) as TokenPayload
  } catch (error) {
    return null
  }
}

export function createTokens(payload: Omit<TokenPayload, "iat" | "exp">) {
  const accessToken = generateAccessToken(payload)
  const refreshToken = generateRefreshToken(payload)

  return {
    accessToken,
    refreshToken,
  }
}
