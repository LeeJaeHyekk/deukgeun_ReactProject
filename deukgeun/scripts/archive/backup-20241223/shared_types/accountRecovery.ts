// ============================================================================
// 계정 복구 관련 타입 정의
// ============================================================================

// 계정 복구 요청 상태
export type RecoveryStatus = "pending" | "verified" | "completed" | "expired" | "failed"

// 계정 복구 방법
export type RecoveryMethod = "email" | "phone" | "security_questions"

// 계정 복구 토큰
export interface RecoveryToken {
  id: number
  userId: number
  token: string
  method: RecoveryMethod
  status: RecoveryStatus
  expiresAt: Date
  verifiedAt?: Date
  completedAt?: Date
  createdAt: Date
  updatedAt: Date
}

// 계정 복구 요청
export interface RecoveryRequest {
  email: string
  method: RecoveryMethod
  phone?: string
}

// 계정 복구 인증
export interface RecoveryVerification {
  token: string
  code: string
  method: RecoveryMethod
}

// 계정 복구 비밀번호 재설정
export interface RecoveryPasswordReset {
  token: string
  newPassword: string
  confirmPassword: string
}

// 계정 복구 응답
export interface RecoveryResponse {
  success: boolean
  message: string
  token?: string
  expiresAt?: Date
  method?: RecoveryMethod
}

// 보안 질문
export interface SecurityQuestion {
  id: number
  question: string
  answer: string
  userId: number
  createdAt: Date
  updatedAt: Date
}

// 계정 복구 설정
export interface RecoverySettings {
  userId: number
  emailEnabled: boolean
  phoneEnabled: boolean
  securityQuestionsEnabled: boolean
  backupEmail?: string
  backupPhone?: string
  createdAt: Date
  updatedAt: Date
}

// ============================================================================
// 백엔드 전용 타입 (API 요청/응답)
// ============================================================================

// ID 찾기 Step 1 요청
export interface FindIdStep1Request {
  name: string
  phone: string
  recaptchaToken: string
}

// ID 찾기 Step 1 응답
export interface FindIdStep1Response {
  success: boolean
  message: string
  data?: {
    email: string
    nickname: string
    maskedEmail: string
    maskedPhone: string
  }
  error?: string
}

// ID 찾기 Step 2 요청
export interface FindIdStep2Request {
  email: string
  code: string
  recaptchaToken: string
}

// ID 찾기 Step 2 응답
export interface FindIdStep2Response {
  success: boolean
  message: string
  data?: {
    email: string
    nickname: string
  }
  error?: string
}

// 비밀번호 재설정 Step 1 요청
export interface ResetPasswordStep1Request {
  name: string
  phone: string
  recaptchaToken: string
}

// 비밀번호 재설정 Step 1 응답
export interface ResetPasswordStep1Response {
  success: boolean
  message: string
  data?: {
    email: string
    nickname: string
    maskedEmail: string
    maskedPhone: string
  }
  error?: string
}

// 비밀번호 재설정 Step 2 요청
export interface ResetPasswordStep2Request {
  email: string
  code: string
  recaptchaToken: string
}

// 비밀번호 재설정 Step 2 응답
export interface ResetPasswordStep2Response {
  success: boolean
  message: string
  data?: {
    resetToken: string
  }
  error?: string
}

// 비밀번호 재설정 Step 3 요청
export interface ResetPasswordStep3Request {
  resetToken: string
  newPassword: string
  confirmPassword: string
  recaptchaToken: string
}

// 비밀번호 재설정 Step 3 응답
export interface ResetPasswordStep3Response {
  success: boolean
  message: string
  error?: string
}

// 레거시 이메일 기반 타입 (하위 호환성)
export interface FindIdEmailRequest {
  email: string
  recaptchaToken: string
}

export interface FindPasswordEmailRequest {
  email: string
  recaptchaToken: string
}

export interface EmailResponse {
  success: boolean
  message: string
  data?: {
    email: string
    nickname: string
  }
  error?: string
}

// ============================================================================
// 서비스 관련 타입
// ============================================================================

// 속도 제한 정보
export interface RateLimitInfo {
  remaining: number
  resetTime: Date
  limit: number
}

// 인증 토큰 데이터
export interface VerificationTokenData {
  token: string
  email: string
  type: "find_id" | "reset_password"
  code: string
  expiresAt: Date
  phone?: string
  name?: string
  ipAddress?: string
  userAgent?: string
}

// 비밀번호 재설정 토큰 데이터
export interface PasswordResetTokenData {
  token: string
  email: string
  expiresAt: Date
  ipAddress?: string
  userAgent?: string
}

// 이메일 서비스 설정
export interface EmailServiceConfig {
  host: string
  port: number
  secure: boolean
  auth: {
    user: string
    pass: string
  }
}

// 이메일 내용
export interface EmailContent {
  to: string
  subject: string
  html: string
  text?: string
}

// SMS 서비스 설정
export interface SMSServiceConfig {
  apiKey: string
  apiSecret: string
  from: string
}

// SMS 내용
export interface SMSContent {
  to: string
  message: string
}

// 검증 결과
export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

// 보안 정보
export interface SecurityInfo {
  ipAddress: string
  userAgent: string
  timestamp: Date
}

// 복구 로그
export interface RecoveryLog {
  action: string
  email: string
  type: "find_id" | "reset_password"
  status: "success" | "failure"
  ipAddress: string
  userAgent: string
  timestamp: Date
  error?: string
}
