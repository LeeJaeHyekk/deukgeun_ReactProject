// ============================================================================
// 인증 관련 타입
// ============================================================================

// 사용자 프로필 타입
export interface UserProfile {
  id: number
  email: string
  nickname: string
  phone?: string
  gender?: Gender
  birthday?: Date
  profileImage?: string
  createdAt: Date
  updatedAt: Date
}

// 성별 타입
export type Gender = "male" | "female" | "other"

// 로그인 요청 타입
export interface LoginRequest {
  email: string
  password: string
  recaptchaToken: string
}

// 회원가입 요청 타입
export interface RegisterRequest {
  email: string
  password: string
  nickname: string
  phone?: string
  gender?: Gender
  birthday?: Date
  recaptchaToken: string
}

// 로그인 응답 타입
export interface LoginResponse {
  success: true
  message: string
  accessToken: string
  user: UserProfile
}

// 회원가입 응답 타입
export interface RegisterResponse {
  success: true
  message: string
  accessToken: string
  user: UserProfile
}

// 토큰 갱신 응답 타입
export interface RefreshResponse {
  success: true
  accessToken: string
}

// 로그아웃 응답 타입
export interface LogoutResponse {
  success: true
  message: string
}

// 인증된 요청 타입
export interface AuthenticatedRequest extends Request {
  user?: {
    userId: number
    role: "user" | "admin" | "moderator"
  }
}

// 비밀번호 재설정 요청 타입
export interface PasswordResetRequest {
  email: string
  recaptchaToken: string
}

// 비밀번호 재설정 확인 타입
export interface PasswordResetConfirm {
  token: string
  newPassword: string
  recaptchaToken: string
}

// 이메일 인증 타입
export interface EmailVerification {
  token: string
}

// 계정 복구 요청 타입
export interface AccountRecoveryRequest {
  email: string
  recoveryMethod: "email" | "phone"
  recaptchaToken: string
}

// 계정 복구 응답 타입
export interface AccountRecoveryResponse {
  success: boolean
  message: string
  maskedEmail?: string
  maskedPhone?: string
  verificationCode?: string
}

// 아이디 찾기 요청 타입
export interface FindIdRequest {
  name: string
  phone: string
  recaptchaToken: string
}

// 비밀번호 재설정 요청 타입
export interface ResetPasswordRequest {
  username: string
  name: string
  phone: string
  gender?: Gender
  birthday?: string
  recaptchaToken: string
}

// 비밀번호 재설정 확인 타입
export interface ResetPasswordConfirmRequest {
  username: string
  code: string
  newPassword: string
  confirmPassword: string
  recaptchaToken: string
}

// 아이디 찾기 요청 타입
export interface FindIdRequest {
  name: string
  phone: string
  recaptchaToken: string
}

// 비밀번호 재설정 요청 타입
export interface ResetPasswordRequest {
  username: string
  name: string
  phone: string
  gender?: Gender
  birthday?: string
  recaptchaToken: string
}

// 비밀번호 재설정 확인 타입
export interface ResetPasswordConfirmRequest {
  username: string
  code: string
  newPassword: string
  confirmPassword: string
  recaptchaToken: string
}
