// ============================================================================
// 공통 인증 타입 정의
// ============================================================================

import { Request } from "express"

export interface AuthRequest extends Request {
  user?: {
    userId: number
    email?: string
    role: "user" | "admin" | "moderator"
  }
}

export interface TokenPayload {
  userId: number
  email: string
  role: "user" | "admin" | "moderator"
  iat?: number
  exp?: number
}

export interface AuthResponse {
  success: boolean
  message: string
  data?: {
    user: {
      id: number
      email: string
      name: string
      nickname: string
      level: number
      exp: number
      isEmailVerified: boolean
      createdAt: string
      updatedAt: string
    }
    tokens: {
      accessToken: string
      refreshToken: string
    }
  }
}

export interface ApiResponse<T = any> {
  success: boolean
  message: string
  data?: T
  error?: string
}
