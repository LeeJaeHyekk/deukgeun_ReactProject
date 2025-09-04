// ============================================================================
// 인증 관련 타입들
// ============================================================================

// 로그인 요청 타입
export interface LoginRequest {
  email: string
  password: string
  recaptchaToken?: string
}

// 회원가입 요청 타입
export interface SignUpRequest {
  email: string
  password: string
  confirmPassword: string
  name: string
  birthDate: string
  phone?: string
  recaptchaToken?: string
}

// 로그인 응답 타입
export interface LoginResponse {
  user: User
  token: string
  refreshToken?: string
  expiresIn: number
}

// 회원가입 응답 타입
export interface SignUpResponse {
  user: User
  message: string
}

// 비밀번호 재설정 요청 타입
export interface PasswordResetRequest {
  email: string
  recaptchaToken?: string
}

// 비밀번호 재설정 확인 타입
export interface PasswordResetConfirm {
  token: string
  newPassword: string
  confirmPassword: string
}

// 계정 복구 요청 타입
export interface AccountRecoveryRequest {
  email: string
  recoveryType: "id" | "password"
  recaptchaToken?: string
}

// 토큰 갱신 요청 타입
export interface TokenRefreshRequest {
  refreshToken: string
}

// 토큰 갱신 응답 타입
export interface TokenRefreshResponse {
  token: string
  refreshToken: string
  expiresIn: number
}

// 인증 상태 타입
export interface AuthState {
  isLoggedIn: boolean
  user: User | null
  token: string | null
  refreshToken: string | null
  isLoading: boolean
  error: string | null
}

// 사용자 타입 (기본)
export interface User {
  id: string
  email: string
  name: string
  role: "user" | "admin"
  birthDate: string
  phone?: string
  createdAt: Date
  updatedAt: Date
  lastLoginAt?: Date
  isActive: boolean
  isEmailVerified: boolean
}

// 인증 컨텍스트 타입
export interface AuthContextType {
  isLoggedIn: boolean
  user: User | null
  isLoading: boolean
  login: (user: User, token: string) => void
  logout: () => Promise<void>
  updateUser: (updatedUser: Partial<User>) => void
  checkAuthStatus: () => Promise<boolean>
}

// 누락된 타입들 추가
export interface RegisterRequest {
  email: string
  password: string
  confirmPassword: string
  name: string
  nickname: string
  birthDate: string
  phone?: string
  gender: "male" | "female" | "other"
  recaptchaToken?: string
}

export interface RegisterResponse {
  user: User
  accessToken: string
  message: string
}

export interface RefreshResponse {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

export interface LogoutResponse {
  message: string
  success: boolean
}
