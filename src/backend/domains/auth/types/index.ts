// ============================================================================
// 인증 도메인 타입 정의
// ============================================================================

export type UserRole = "user" | "admin" | "moderator"
export type Gender = "male" | "female" | "other"

export interface User {
  id: string
  email: string
  password: string
  name: string
  nickname: string
  role: string
  level: number
  exp: number
  avatar?: string
  bio?: string
  isEmailVerified: boolean
  lastLoginAt?: Date
  createdAt: Date
  updatedAt: Date
}

export interface UserLevel {
  id: string
  userId: string
  level: number
  exp: number
  totalExp: number
  createdAt: Date
  updatedAt: Date
}

export interface ExpHistory {
  id: string
  userId: string
  type: string
  amount: number
  description: string
  createdAt: Date
}

export interface UserReward {
  id: string
  userId: string
  type: string
  name: string
  description: string
  earnedAt: Date
}

export interface Milestone {
  id: string
  userId: string
  type: string
  title: string
  description: string
  achievedAt: Date
}

export interface LoginRequest {
  email: string
  password: string
  recaptchaToken?: string
}

export interface RegisterRequest {
  email: string
  password: string
  name: string
  nickname?: string
  phone?: string
  birthday?: string
  gender?: string
  recaptchaToken?: string
}

export interface AuthResponse {
  success: boolean
  message: string
  accessToken?: string
  refreshToken?: string
  user?: Omit<User, "password">
}

export interface TokenPayload {
  id: string
  userId: string
  email: string
  role: string
  iat?: number
  exp?: number
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface ErrorResponse {
  success: false
  error: string
  message?: string
  details?: any
}

export interface LoginResponse extends AuthResponse {
  accessToken: string
  refreshToken: string
}

export interface RegisterResponse extends AuthResponse {
  accessToken: string
  refreshToken: string
}

export interface SecurityInfo {
  recaptchaToken?: string
  ipAddress?: string
  userAgent?: string
  timestamp?: Date
}

export interface VerificationTokenData {
  token: string
  expiresAt: Date
  userId: number
}

export interface PasswordResetTokenData {
  token: string
  expiresAt: Date
  userId: number
}

export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

export interface RecoveryLog {
  id?: number
  userId?: number
  email: string
  type: string
  status: string
  action: string
  ip?: string
  ipAddress: string
  userAgent: string
  timestamp: Date
  error?: string
  success?: boolean
}

export interface UserDTO {
  id: number
  email: string
  username?: string
  nickname: string
  phone?: string
  gender?: Gender
  birthday?: Date | null
  role: UserRole
  profileImage?: string
  createdAt: Date
  updatedAt: Date
  lastLoginAt?: Date
  isActive: boolean
  isVerified: boolean
  level?: number
  experience?: number
  streak?: number
}
