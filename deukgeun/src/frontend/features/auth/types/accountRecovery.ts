// ============================================================================
// 계정 복구 시스템 타입 정의 (JSON 구조 기반 최적화)
// ============================================================================

// 기본 요청/응답 타입
export interface BaseRecoveryRequest {
  recaptchaToken: string
}

export interface BaseRecoveryResponse {
  success: boolean
  message: string
  data?: any
}

// 사용자 검증을 위한 공통 필드
export interface UserVerificationFields {
  name: string
  phone: string
  gender?: "male" | "female" | "other"
  birthday?: string // YYYY-MM-DD 형식
}

// 아이디 찾기 관련 타입 (JSON 구조 기반)
export interface FindIdRequest
  extends BaseRecoveryRequest,
    UserVerificationFields {}

export interface FindIdResponse extends BaseRecoveryResponse {
  data?: {
    username: string // 마스킹된 아이디 (예: "abc****")
  }
}

// 향상된 다단계 아이디 찾기 (현재 구현)
export interface FindIdStep1Request extends BaseRecoveryRequest {
  name: string
  phone: string
  gender?: "male" | "female" | "other"
  birthday?: string
}

export interface FindIdStep1Response extends BaseRecoveryResponse {
  data?: {
    verificationId: string
    maskedEmail: string
    maskedPhone: string
  }
}

export interface FindIdStep2Request {
  verificationId: string
  verificationCode: string
}

export interface FindIdStep2Response extends BaseRecoveryResponse {
  data?: {
    username: string
    email: string
  }
}

// 비밀번호 재설정 관련 타입 (JSON 구조 기반) - Step 1: 사용자 인증
export interface ResetPasswordStep1Request {
  username: string
  name: string
  phone: string
  gender?: "male" | "female" | "other"
  birthday?: string
  recaptchaToken: string
}

// 비밀번호 재설정 관련 타입 (JSON 구조 기반) - Step 2: 비밀번호 재설정
export interface ResetPasswordStep2Request {
  username: string
  code: string
  newPassword: string
  confirmPassword: string
  recaptchaToken: string
}

export interface ResetPasswordStep2Response extends BaseRecoveryResponse {
  data?: {
    resetToken: string
  }
}

export interface ResetPasswordStep3Request {
  resetToken: string
  newPassword: string
  confirmPassword: string
}

export interface ResetPasswordStep3Response extends BaseRecoveryResponse {}

// 현재 구현된 이메일 기반 타입 (하위 호환성)
export interface EmailBasedFindIdRequest extends BaseRecoveryRequest {
  email: string
}

export interface EmailBasedFindPasswordRequest extends BaseRecoveryRequest {
  email: string
}

// UI 상태 관리 타입
export type RecoveryStep =
  | "initial"
  | "verification"
  | "code-input"
  | "result"
  | "password-reset"

export type RecoveryType = "find-id" | "reset-password"

export interface RecoveryState {
  step: RecoveryStep
  type: RecoveryType
  loading: boolean
  error: string | null
  verificationId: string | null
  resetToken: string | null
  data?: any // API 응답 데이터 저장용
}

// 비밀번호 강도 타입
export type PasswordStrength = "weak" | "medium" | "strong" | "very-strong"

export interface PasswordStrengthResult {
  strength: PasswordStrength
  score: number
  feedback: string[]
}

// 검증 관련 타입
export interface ValidationError {
  field: string
  message: string
}

export interface FormValidation {
  isValid: boolean
  errors: ValidationError[]
}

// 인증 코드 관련 타입
export interface VerificationCodeConfig {
  length: number
  expiryMinutes: number
  maxAttempts: number
}

// Rate Limiting 타입
export interface RateLimitInfo {
  remaining: number
  resetTime: number
  limit: number
}

// 보안 강화 설정 (JSON 구조 기반)
export interface SecurityConfig {
  rateLimiting: {
    findId: string // "5회/시간/IP"
    resetPasswordRequest: string // "3회/시간/IP"
    resetPasswordComplete: string // "5회/시간/IP"
  }
  dataProtection: {
    usernameMasking: string // "abc****"
    phoneMasking: string // "010-****-5678"
  }
  tokenManagement: {
    resetTokenExpiry: string // "10분"
    secureTokenStorage: string // "httpOnly 쿠키 또는 Authorization 헤더"
  }
}

// API 응답 예시 타입 (JSON 구조 기반)
export interface ApiResponseExamples {
  findId: {
    success: {
      message: string
      data: { username: string }
    }
    failure: {
      message: string
    }
  }
  resetPassword: {
    success: {
      message: string
    }
    resetSuccess: {
      message: string
    }
    failure: {
      message: string
    }
    recaptchaFailure: {
      message: string
    }
    tokenFailure: {
      message: string
    }
  }
}
