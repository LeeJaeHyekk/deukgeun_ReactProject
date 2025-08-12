// Enhanced Account Recovery Types

export interface FindIdStep1Request {
  name: string
  phone: string
  recaptchaToken: string
}

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

export interface FindIdStep2Request {
  email: string
  code: string
  recaptchaToken: string
}

export interface FindIdStep2Response {
  success: boolean
  message: string
  data?: {
    email: string
    nickname: string
  }
  error?: string
}

export interface ResetPasswordStep1Request {
  name: string
  phone: string
  recaptchaToken: string
}

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

export interface ResetPasswordStep2Request {
  email: string
  code: string
  recaptchaToken: string
}

export interface ResetPasswordStep2Response {
  success: boolean
  message: string
  data?: {
    resetToken: string
  }
  error?: string
}

export interface ResetPasswordStep3Request {
  resetToken: string
  newPassword: string
  confirmPassword: string
  recaptchaToken: string
}

export interface ResetPasswordStep3Response {
  success: boolean
  message: string
  error?: string
}

// Legacy email-based types (for backward compatibility)
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

// Rate limiting types
export interface RateLimitInfo {
  remaining: number
  resetTime: Date
  limit: number
}

// Verification token types
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

// Password reset token types
export interface PasswordResetTokenData {
  token: string
  email: string
  expiresAt: Date
  ipAddress?: string
  userAgent?: string
}

// Email service types
export interface EmailServiceConfig {
  host: string
  port: number
  secure: boolean
  auth: {
    user: string
    pass: string
  }
}

export interface EmailContent {
  to: string
  subject: string
  html: string
  text?: string
}

// SMS service types
export interface SMSServiceConfig {
  apiKey: string
  apiSecret: string
  from: string
}

export interface SMSContent {
  to: string
  message: string
}

// Validation types
export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

// Security types
export interface SecurityInfo {
  ipAddress: string
  userAgent: string
  timestamp: Date
}

// Logging types
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
