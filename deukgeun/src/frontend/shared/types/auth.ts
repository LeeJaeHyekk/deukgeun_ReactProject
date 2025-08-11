// 프론트엔드 인증 관련 타입 정의
import type { UserProfile, Gender } from "../../../types/common"

export interface LoginRequest {
  email: string
  password: string
  recaptchaToken: string
}

export interface RegisterRequest {
  email: string
  password: string
  nickname: string
  phone?: string
  gender?: Gender
  birthday?: Date
  recaptchaToken: string
}

export interface LoginResponse {
  success: true
  message: string
  accessToken: string
  user: UserProfile
}

export interface RegisterResponse {
  success: true
  message: string
  accessToken: string
  user: UserProfile
}

export interface RefreshResponse {
  success: true
  accessToken: string
}

export interface LogoutResponse {
  success: true
  message: string
}

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: number
    email: string
    role: string
  }
}
