import { AppDataSource } from '@backend/config/database'
import { User } from '@backend/entities/User'
import { VerificationToken } from "../entities/VerificationToken"
import { PasswordResetToken } from "../entities/PasswordResetToken"
import { emailService } from "./emailService"
import { logger } from '@backend/utils/logger'
import {
  VerificationTokenData,
  PasswordResetTokenData,
  ValidationResult,
  SecurityInfo,
  RecoveryLog,
} from "../types"
import bcrypt from "bcrypt"
import crypto from "crypto"

class AccountRecoveryService {
  private userRepo = AppDataSource.getRepository(User)
  private verificationTokenRepo = AppDataSource.getRepository(VerificationToken)
  private passwordResetTokenRepo =
    AppDataSource.getRepository(PasswordResetToken)

  // Rate limiting storage (in production, use Redis)
  private rateLimitStore = new Map<string, { count: number; resetTime: Date }>()

  /**
   * Generate a random 6-digit verification code
   */
  private generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString()
  }

  /**
   * Generate a secure random token
   */
  private generateSecureToken(): string {
    return crypto.randomBytes(32).toString("hex")
  }

  /**
   * Mask sensitive data for display
   */
  private maskData(data: string, type: "email" | "phone"): string {
    if (type === "email") {
      const [local, domain] = data.split("@")
      if (!local || !domain || local.length <= 2) return data
      return `${local.substring(0, 2)}***@${domain}`
    } else if (type === "phone") {
      return data.replace(/(\d{3})-(\d{4})-\d{4}/, "$1-$2-****")
    }
    return data
  }

  /**
   * Check rate limiting for an IP address
   */
  private checkRateLimit(
    ipAddress: string,
    action: string
  ): { allowed: boolean; remaining: number; resetTime: Date } {
    const key = `${ipAddress}:${action}`
    const now = new Date()
    const limit = this.getRateLimit(action)

    const current = this.rateLimitStore.get(key)

    if (!current || now > current.resetTime) {
      // Reset or create new rate limit entry
      const resetTime = new Date(now.getTime() + 60 * 60 * 1000) // 1 hour
      this.rateLimitStore.set(key, { count: 1, resetTime })
      return { allowed: true, remaining: limit - 1, resetTime }
    }

    if (current.count >= limit) {
      return { allowed: false, remaining: 0, resetTime: current.resetTime }
    }

    current.count++
    return {
      allowed: true,
      remaining: limit - current.count,
      resetTime: current.resetTime,
    }
  }

  /**
   * Get rate limit for different actions
   */
  private getRateLimit(action: string): number {
    const limits: Record<string, number> = {
      find_id_step1: 5, // 5 attempts per hour
      find_id_step2: 10, // 10 attempts per hour
      reset_password_step1: 5,
      reset_password_step2: 10,
      reset_password_step3: 5,
      email_verification: 3, // 3 emails per hour
    }
    return limits[action] || 5
  }

  /**
   * JSON 구조 기반 단순 아이디 찾기
   */
  async findIdSimple(
    name: string,
    phone: string,
    securityInfo: SecurityInfo,
    gender?: string,
    birthday?: Date | string | null
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      // Rate limiting
      const rateLimit = this.checkRateLimit(
        securityInfo.ipAddress,
        "find_id_simple"
      )
      if (!rateLimit.allowed) {
        this.logRecoveryAction({
          action: "find_id_simple_rate_limited",
          email: "unknown",
          type: "find_id",
          status: "failure",
          ipAddress: securityInfo.ipAddress,
          userAgent: securityInfo.userAgent || null,
          timestamp: securityInfo.timestamp,
          error: "Rate limit exceeded",
          success: false,
        })
        return {
          success: false,
          error: "요청이 너무 많습니다. 1시간 후에 다시 시도해주세요.",
        } as const
      }

      // Input validation
      const validation = this.validateUserInput(
        {
          name,
          phone,
          ...(gender && { gender }),
          ...(birthday && { birthday }),
        },
        "find_id_simple"
      )
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.errors[0] || "Validation failed",
        } as const
      }

      // Build where clause based on provided fields
      const whereClause: any = {
        nickname: name.trim(),
        phone: phone.trim(),
      }

      if (gender) {
        whereClause.gender = gender
      }

      if (birthday) {
        whereClause.birthday = birthday
      }

      // Find user by provided fields
      const user = await this.userRepo.findOne({
        where: whereClause,
      })

      if (!user) {
        this.logRecoveryAction({
          action: "find_id_simple_user_not_found",
          email: "unknown",
          type: "find_id",
          status: "failure",
          ipAddress: securityInfo.ipAddress,
          userAgent: securityInfo.userAgent || null,
          timestamp: securityInfo.timestamp,
          error: "User not found",
          success: false,
        })
        return {
          success: false,
          error: "입력하신 정보와 일치하는 계정을 찾을 수 없습니다.",
        }
      }

      // Mask username for security
      const maskedUsername = this.maskUsername(user.email)

      this.logRecoveryAction({
        action: "find_id_simple_success",
        email: user.email,
        type: "find_id",
        status: "success",
        ipAddress: securityInfo.ipAddress,
        userAgent: securityInfo.userAgent || null,
        timestamp: securityInfo.timestamp,
        success: true,
      })

      return {
        success: true,
        data: { username: maskedUsername },
      }
    } catch (error) {
      logger.error("단순 아이디 찾기 처리 중 오류:", error)
      return {
        success: false,
        error: "서버 오류가 발생했습니다.",
      }
    }
  }

  /**
   * JSON 구조 기반 단순 비밀번호 재설정 Step 1: 사용자 인증
   */
  async resetPasswordSimpleStep1(
    username: string,
    name: string,
    phone: string,
    securityInfo: SecurityInfo,
    gender?: string,
    birthday?: Date | string | null
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      // Rate limiting
      const rateLimit = this.checkRateLimit(
        securityInfo.ipAddress,
        "reset_password_simple_step1"
      )
      if (!rateLimit.allowed) {
        this.logRecoveryAction({
          action: "reset_password_simple_step1_rate_limited",
          email: "unknown",
          type: "reset_password",
          status: "failure",
          ipAddress: securityInfo.ipAddress,
          userAgent: securityInfo.userAgent || null,
          timestamp: securityInfo.timestamp,
          error: "Rate limit exceeded",
          success: false,
        })
        return {
          success: false,
          error: "요청이 너무 많습니다. 1시간 후에 다시 시도해주세요.",
        }
      }

      // Input validation
      const validation = this.validateUserInput(
        {
          username,
          name,
          phone,
          ...(gender && { gender }),
          ...(birthday && { birthday }),
        },
        "reset_password_simple_step1"
      )
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.errors[0] || "Validation failed",
        }
      }

      // Build where clause based on provided fields
      const whereClause: any = {
        email: username.trim(),
        nickname: name.trim(),
        phone: phone.trim(),
      }

      if (gender) {
        whereClause.gender = gender
      }

      if (birthday) {
        whereClause.birthday = birthday
      }

      // Find user by provided fields
      const user = await this.userRepo.findOne({
        where: whereClause,
      })

      if (!user) {
        this.logRecoveryAction({
          action: "reset_password_simple_step1_user_not_found",
          email: username,
          type: "reset_password",
          status: "failure",
          ipAddress: securityInfo.ipAddress,
          userAgent: securityInfo.userAgent || null,
          timestamp: securityInfo.timestamp,
          error: "User not found",
          success: false,
        })
        return {
          success: false,
          error: "입력하신 정보와 일치하는 계정을 찾을 수 없습니다.",
        }
      }

      // Generate verification code
      const code = this.generateVerificationCode()
      const token = this.generateSecureToken()
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

      // Save verification token
      const verificationToken = this.verificationTokenRepo.create({
        token,
        email: user.email,
        type: "reset_password",
        code,
        expiresAt,
        ...(user.phone && { phone: user.phone }),
        name: user.nickname,
        ipAddress: securityInfo.ipAddress,
        ...(securityInfo.userAgent && { userAgent: securityInfo.userAgent }),
      })

      await this.verificationTokenRepo.save(verificationToken)

      this.logRecoveryAction({
        action: "reset_password_simple_step1_success",
        email: user.email,
        type: "reset_password",
        status: "success",
        ipAddress: securityInfo.ipAddress,
        userAgent: securityInfo.userAgent || null,
        timestamp: securityInfo.timestamp,
        success: true,
      })

      return {
        success: true,
        data: {
          email: user.email,
          nickname: user.nickname,
          maskedEmail: this.maskData(user.email, "email"),
          maskedPhone: this.maskData(user.phone || "", "phone"),
          verificationCode: code, // 인증 코드 직접 반환
        },
      }
    } catch (error) {
      logger.error("단순 비밀번호 재설정 Step 1 처리 중 오류:", error)
      return {
        success: false,
        error: "서버 오류가 발생했습니다.",
      }
    }
  }

  /**
   * JSON 구조 기반 단순 비밀번호 재설정 Step 2: 비밀번호 재설정
   */
  async resetPasswordSimpleStep2(
    username: string,
    code: string,
    newPassword: string,
    confirmPassword: string,
    securityInfo: SecurityInfo
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      // Rate limiting
      const rateLimit = this.checkRateLimit(
        securityInfo.ipAddress,
        "reset_password_simple_step2"
      )
      if (!rateLimit.allowed) {
        this.logRecoveryAction({
          action: "reset_password_simple_step2_rate_limited",
          email: "unknown",
          type: "reset_password",
          status: "failure",
          ipAddress: securityInfo.ipAddress,
          userAgent: securityInfo.userAgent || null,
          timestamp: securityInfo.timestamp,
          error: "Rate limit exceeded",
          success: false,
        })
        return {
          success: false,
          error: "요청이 너무 많습니다. 1시간 후에 다시 시도해주세요.",
        }
      }

      // Input validation
      const validation = this.validateUserInput(
        { username, newPassword, confirmPassword },
        "reset_password_simple_step2"
      )
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.errors[0] || "Validation failed",
        } as const
      }

      // 개발 환경에서는 인증 코드 검증 건너뛰기
      if (process.env.NODE_ENV === "development" && code === "000000") {
        logger.info("개발 환경에서 인증 코드 검증 건너뛰기")
      } else {
        // Find verification token
        const verificationToken = await this.verificationTokenRepo.findOne({
          where: {
            email: username.toLowerCase().trim(),
            type: "reset_password",
            code,
            isUsed: false,
            expiresAt: new Date(), // Not expired
          },
        })

        if (!verificationToken) {
          this.logRecoveryAction({
            action: "reset_password_simple_step2_invalid_code",
            email: username,
            type: "reset_password",
            status: "failure",
            ipAddress: securityInfo.ipAddress,
            userAgent: securityInfo.userAgent || null,
            timestamp: securityInfo.timestamp,
            error: "Invalid or expired code",
            success: false,
          })
          return {
            success: false,
            error: "인증 코드가 유효하지 않거나 만료되었습니다.",
          }
        }

        // Mark verification token as used
        verificationToken.isUsed = true
        verificationToken.usedAt = new Date()
        await this.verificationTokenRepo.save(verificationToken)
      }

      // Find user
      const user = await this.userRepo.findOne({
        where: { email: username.toLowerCase().trim() },
      })

      if (!user) {
        return { success: false, error: "사용자를 찾을 수 없습니다." }
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 12)

      // Update user password
      user.password = hashedPassword
      await this.userRepo.save(user)

      this.logRecoveryAction({
        action: "reset_password_simple_step2_success",
        email: user.email,
        type: "reset_password",
        status: "success",
        ipAddress: securityInfo.ipAddress,
        userAgent: securityInfo.userAgent || null,
        timestamp: securityInfo.timestamp,
        success: true,
      })

      return {
        success: true,
        data: { message: "비밀번호가 성공적으로 재설정되었습니다." },
      }
    } catch (error) {
      logger.error("단순 비밀번호 재설정 Step 2 처리 중 오류:", error)
      return {
        success: false,
        error: "서버 오류가 발생했습니다.",
      }
    }
  }

  /**
   * Username 마스킹 처리
   */
  private maskUsername(email: string): string {
    if (!email || email.length < 3) return "***"

    const atIndex = email.indexOf("@")
    if (atIndex === -1) {
      // @가 없는 경우 (username만 있는 경우)
      const visiblePart = email.substring(0, Math.min(3, email.length))
      return `${visiblePart}****`
    }

    const username = email.substring(0, atIndex)
    const domain = email.substring(atIndex)

    if (username.length <= 3) {
      return `${username}****${domain}`
    }

    const visiblePart = username.substring(0, 3)
    return `${visiblePart}****${domain}`
  }

  /**
   * 향상된 사용자 입력 검증 (gender, birthday 포함)
   */
  private validateUserInput(
    data: {
      name?: string
      phone?: string
      email?: string
      username?: string
      gender?: string
      birthday?: Date | string | null
      newPassword?: string
      confirmPassword?: string
    },
    type: string
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    // Name validation
    if (data.name) {
      if (data.name.trim().length < 2) {
        errors.push("이름은 2자 이상이어야 합니다.")
      }
      if (data.name.trim().length > 20) {
        errors.push("이름은 20자 이하여야 합니다.")
      }
    }

    // Phone validation
    if (data.phone) {
      const phoneRegex = /^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/
      if (!phoneRegex.test(data.phone.replace(/-/g, ""))) {
        errors.push("유효한 휴대폰 번호를 입력하세요.")
      }
    }

    // Email/Username validation
    if (data.email || data.username) {
      const email = data.email || data.username
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email!)) {
        errors.push("유효한 이메일 주소를 입력하세요.")
      }
    }

    // Gender validation
    if (data.gender && !["male", "female", "other"].includes(data.gender)) {
      errors.push("유효한 성별을 선택하세요.")
    }

    // Birthday validation
    if (data.birthday) {
      let birthdayStr: string
      if (data.birthday instanceof Date) {
        birthdayStr = data.birthday.toISOString().split("T")[0]
      } else if (typeof data.birthday === "string") {
        birthdayStr = data.birthday
      } else {
        errors.push("유효한 생년월일을 입력하세요.")
        return { isValid: false, errors }
      }

      const birthdayRegex = /^\d{4}-\d{2}-\d{2}$/
      if (!birthdayRegex.test(birthdayStr)) {
        errors.push("생년월일은 YYYY-MM-DD 형식으로 입력하세요.")
      } else {
        const date = new Date(birthdayStr)
        if (isNaN(date.getTime())) {
          errors.push("유효한 생년월일을 입력하세요.")
        }
      }
    }

    // Password validation (for reset password)
    if (data.newPassword) {
      if (data.newPassword.length < 8) {
        errors.push("비밀번호는 최소 8자 이상이어야 합니다.")
      }
      if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(data.newPassword)) {
        errors.push("비밀번호는 영문 대소문자와 숫자를 포함해야 합니다.")
      }
      if (data.newPassword !== data.confirmPassword) {
        errors.push("비밀번호가 일치하지 않습니다.")
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  }

  /**
   * Log recovery action
   */
  private logRecoveryAction(log: RecoveryLog): void {
    logger.info(`Account Recovery: ${log.action}`, {
      email: log.email,
      type: log.type,
      status: log.status,
      ipAddress: log.ipAddress,
      userAgent: log.userAgent,
      error: log.error,
    })
  }

  /**
   * Find ID Step 1: Verify user by name and phone
   */
  async findIdStep1(
    name: string,
    phone: string,
    securityInfo: SecurityInfo
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      // Rate limiting
      const rateLimit = this.checkRateLimit(
        securityInfo.ipAddress,
        "find_id_step1"
      )
      if (!rateLimit.allowed) {
        this.logRecoveryAction({
          action: "find_id_step1_rate_limited",
          email: "unknown",
          type: "find_id",
          status: "failure",
          ipAddress: securityInfo.ipAddress,
          userAgent: securityInfo.userAgent || null,
          timestamp: securityInfo.timestamp,
          error: "Rate limit exceeded",
          success: false,
        })
        return {
          success: false,
          error: "요청이 너무 많습니다. 1시간 후에 다시 시도해주세요.",
        }
      }

      // Input validation
      const validation = this.validateUserInput({ name, phone }, "find_id")
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.errors[0] || "Validation failed",
        }
      }

      // Find user by name and phone
      const user = await this.userRepo.findOne({
        where: {
          nickname: name.trim(),
          phone: phone.trim(),
        },
      })

      if (!user) {
        this.logRecoveryAction({
          action: "find_id_step1_user_not_found",
          email: "unknown",
          type: "find_id",
          status: "failure",
          ipAddress: securityInfo.ipAddress,
          userAgent: securityInfo.userAgent || null,
          timestamp: securityInfo.timestamp,
          error: "User not found",
          success: false,
        })
        return {
          success: false,
          error: "입력하신 정보와 일치하는 계정을 찾을 수 없습니다.",
        }
      }

      // Generate verification code
      const code = this.generateVerificationCode()
      const token = this.generateSecureToken()
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

      // Save verification token
      const verificationToken = this.verificationTokenRepo.create({
        token,
        email: user.email,
        type: "find_id",
        code,
        expiresAt,
        ...(user.phone && { phone: user.phone }),
        name: user.nickname,
        ipAddress: securityInfo.ipAddress,
        ...(securityInfo.userAgent && { userAgent: securityInfo.userAgent }),
      })

      await this.verificationTokenRepo.save(verificationToken)

      this.logRecoveryAction({
        action: "find_id_step1_success",
        email: user.email,
        type: "find_id",
        status: "success",
        ipAddress: securityInfo.ipAddress,
        userAgent: securityInfo.userAgent || null,
        timestamp: securityInfo.timestamp,
        success: true,
      })

      return {
        success: true,
        data: {
          email: user.email,
          nickname: user.nickname,
          maskedEmail: this.maskData(user.email, "email"),
          maskedPhone: this.maskData(user.phone || "", "phone"),
          verificationCode: code, // 인증 코드 직접 반환
        },
      }
    } catch (error) {
      logger.error("Find ID Step 1 error:", error)
      return { success: false, error: "서버 오류가 발생했습니다." }
    }
  }

  /**
   * Find ID Step 2: Verify code and return user info
   */
  async findIdStep2(
    email: string,
    code: string,
    securityInfo: SecurityInfo
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      // Rate limiting
      const rateLimit = this.checkRateLimit(
        securityInfo.ipAddress,
        "find_id_step2"
      )
      if (!rateLimit.allowed) {
        return {
          success: false,
          error: "요청이 너무 많습니다. 1시간 후에 다시 시도해주세요.",
        }
      }

      // Find verification token
      const verificationToken = await this.verificationTokenRepo.findOne({
        where: {
          email: email.toLowerCase().trim(),
          type: "find_id",
          code,
          isUsed: false,
          expiresAt: new Date(), // Not expired
        },
      })

      if (!verificationToken) {
        this.logRecoveryAction({
          action: "find_id_step2_invalid_code",
          email,
          type: "find_id",
          status: "failure",
          ipAddress: securityInfo.ipAddress,
          userAgent: securityInfo.userAgent || null,
          timestamp: securityInfo.timestamp,
          error: "Invalid or expired code",
          success: false,
        })
        return {
          success: false,
          error: "인증 코드가 유효하지 않거나 만료되었습니다.",
        }
      }

      // Mark token as used
      verificationToken.isUsed = true
      verificationToken.usedAt = new Date()
      await this.verificationTokenRepo.save(verificationToken)

      // Find user
      const user = await this.userRepo.findOne({
        where: { email: email.toLowerCase().trim() },
      })

      if (!user) {
        return { success: false, error: "사용자를 찾을 수 없습니다." }
      }

      this.logRecoveryAction({
        action: "find_id_step2_success",
        email: user.email,
        type: "find_id",
        status: "success",
        ipAddress: securityInfo.ipAddress,
        userAgent: securityInfo.userAgent || null,
        timestamp: securityInfo.timestamp,
        success: true,
      })

      return {
        success: true,
        data: {
          email: user.email,
          nickname: user.nickname,
        },
      }
    } catch (error) {
      logger.error("Find ID Step 2 error:", error)
      return { success: false, error: "서버 오류가 발생했습니다." }
    }
  }

  /**
   * Reset Password Step 1: Verify user by name and phone
   */
  async resetPasswordStep1(
    name: string,
    phone: string,
    securityInfo: SecurityInfo
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      // Rate limiting
      const rateLimit = this.checkRateLimit(
        securityInfo.ipAddress,
        "reset_password_step1"
      )
      if (!rateLimit.allowed) {
        return {
          success: false,
          error: "요청이 너무 많습니다. 1시간 후에 다시 시도해주세요.",
        }
      }

      // Input validation
      const validation = this.validateUserInput(
        { name, phone },
        "reset_password"
      )
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.errors[0] || "Validation failed",
        }
      }

      // Find user by name and phone
      const user = await this.userRepo.findOne({
        where: {
          nickname: name.trim(),
          phone: phone.trim(),
        },
      })

      if (!user) {
        this.logRecoveryAction({
          action: "reset_password_step1_user_not_found",
          email: "unknown",
          type: "reset_password",
          status: "failure",
          ipAddress: securityInfo.ipAddress,
          userAgent: securityInfo.userAgent || null,
          timestamp: securityInfo.timestamp,
          error: "User not found",
          success: false,
        })
        return {
          success: false,
          error: "입력하신 정보와 일치하는 계정을 찾을 수 없습니다.",
        }
      }

      // Generate verification code
      const code = this.generateVerificationCode()
      const token = this.generateSecureToken()
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

      // Save verification token
      const verificationToken = this.verificationTokenRepo.create({
        token,
        email: user.email,
        type: "reset_password",
        code,
        expiresAt,
        ...(user.phone && { phone: user.phone }),
        name: user.nickname,
        ipAddress: securityInfo.ipAddress,
        ...(securityInfo.userAgent && { userAgent: securityInfo.userAgent }),
      })

      await this.verificationTokenRepo.save(verificationToken)

      this.logRecoveryAction({
        action: "reset_password_step1_success",
        email: user.email,
        type: "reset_password",
        status: "success",
        ipAddress: securityInfo.ipAddress,
        userAgent: securityInfo.userAgent || null,
        timestamp: securityInfo.timestamp,
        success: true,
      })

      return {
        success: true,
        data: {
          email: user.email,
          nickname: user.nickname,
          maskedEmail: this.maskData(user.email, "email"),
          maskedPhone: this.maskData(user.phone || "", "phone"),
          verificationCode: code, // 인증 코드 직접 반환
        },
      }
    } catch (error) {
      logger.error("Reset Password Step 1 error:", error)
      return { success: false, error: "서버 오류가 발생했습니다." }
    }
  }

  /**
   * Reset Password Step 2: Verify code and generate reset token
   */
  async resetPasswordStep2(
    email: string,
    code: string,
    securityInfo: SecurityInfo
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      // Rate limiting
      const rateLimit = this.checkRateLimit(
        securityInfo.ipAddress,
        "reset_password_step2"
      )
      if (!rateLimit.allowed) {
        return {
          success: false,
          error: "요청이 너무 많습니다. 1시간 후에 다시 시도해주세요.",
        }
      }

      // Find verification token
      const verificationToken = await this.verificationTokenRepo.findOne({
        where: {
          email: email.toLowerCase().trim(),
          type: "reset_password",
          code,
          isUsed: false,
          expiresAt: new Date(), // Not expired
        },
      })

      if (!verificationToken) {
        this.logRecoveryAction({
          action: "reset_password_step2_invalid_code",
          email,
          type: "reset_password",
          status: "failure",
          ipAddress: securityInfo.ipAddress,
          userAgent: securityInfo.userAgent || null,
          timestamp: securityInfo.timestamp,
          error: "Invalid or expired code",
          success: false,
        })
        return {
          success: false,
          error: "인증 코드가 유효하지 않거나 만료되었습니다.",
        }
      }

      // Mark verification token as used
      verificationToken.isUsed = true
      verificationToken.usedAt = new Date()
      await this.verificationTokenRepo.save(verificationToken)

      // Generate password reset token
      const resetToken = this.generateSecureToken()
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

      // Save password reset token
      const passwordResetToken = this.passwordResetTokenRepo.create({
        token: resetToken,
        email: email.toLowerCase().trim(),
        expiresAt,
        ipAddress: securityInfo.ipAddress,
        ...(securityInfo.userAgent && { userAgent: securityInfo.userAgent }),
      })

      await this.passwordResetTokenRepo.save(passwordResetToken)

      this.logRecoveryAction({
        action: "reset_password_step2_success",
        email,
        type: "reset_password",
        status: "success",
        ipAddress: securityInfo.ipAddress,
        userAgent: securityInfo.userAgent || null,
        timestamp: securityInfo.timestamp,
        success: true,
      })

      return {
        success: true,
        data: {
          resetToken,
        },
      }
    } catch (error) {
      logger.error("Reset Password Step 2 error:", error)
      return { success: false, error: "서버 오류가 발생했습니다." }
    }
  }

  /**
   * Reset Password Step 3: Complete password reset
   */
  async resetPasswordStep3(
    resetToken: string,
    newPassword: string,
    confirmPassword: string,
    securityInfo: SecurityInfo
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Rate limiting
      const rateLimit = this.checkRateLimit(
        securityInfo.ipAddress,
        "reset_password_step3"
      )
      if (!rateLimit.allowed) {
        return {
          success: false,
          error: "요청이 너무 많습니다. 1시간 후에 다시 시도해주세요.",
        }
      }

      // Input validation
      const validation = this.validateUserInput(
        { newPassword, confirmPassword },
        "reset_password"
      )
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.errors[0] || "Validation failed",
        }
      }

      // Find password reset token
      const passwordResetToken = await this.passwordResetTokenRepo.findOne({
        where: {
          token: resetToken,
          isUsed: false,
          expiresAt: new Date(), // Not expired
        },
      })

      if (!passwordResetToken) {
        this.logRecoveryAction({
          action: "reset_password_step3_invalid_token",
          email: "unknown",
          type: "reset_password",
          status: "failure",
          ipAddress: securityInfo.ipAddress,
          userAgent: securityInfo.userAgent || null,
          timestamp: securityInfo.timestamp,
          error: "Invalid or expired token",
          success: false,
        })
        return {
          success: false,
          error: "비밀번호 재설정 토큰이 유효하지 않거나 만료되었습니다.",
        }
      }

      // Find user
      const user = await this.userRepo.findOne({
        where: { email: passwordResetToken.email },
      })

      if (!user) {
        return { success: false, error: "사용자를 찾을 수 없습니다." }
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 12)

      // Update user password
      user.password = hashedPassword
      await this.userRepo.save(user)

      // Mark password reset token as used
      passwordResetToken.isUsed = true
      passwordResetToken.usedAt = new Date()
      await this.passwordResetTokenRepo.save(passwordResetToken)

      this.logRecoveryAction({
        action: "reset_password_step3_success",
        email: user.email,
        type: "reset_password",
        status: "success",
        ipAddress: securityInfo.ipAddress,
        userAgent: securityInfo.userAgent || null,
        timestamp: securityInfo.timestamp,
        success: true,
      })

      return { success: true }
    } catch (error) {
      logger.error("Reset Password Step 3 error:", error)
      return { success: false, error: "서버 오류가 발생했습니다." }
    }
  }

  /**
   * Legacy email-based find ID (for backward compatibility)
   */
  async findIdByEmail(
    email: string,
    securityInfo: SecurityInfo
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      // Rate limiting
      const rateLimit = this.checkRateLimit(
        securityInfo.ipAddress,
        "email_verification"
      )
      if (!rateLimit.allowed) {
        return {
          success: false,
          error: "요청이 너무 많습니다. 1시간 후에 다시 시도해주세요.",
        }
      }

      // Find user
      const user = await this.userRepo.findOne({
        where: { email: email.toLowerCase().trim() },
      })

      if (!user) {
        this.logRecoveryAction({
          action: "find_id_email_user_not_found",
          email,
          type: "find_id",
          status: "failure",
          ipAddress: securityInfo.ipAddress,
          userAgent: securityInfo.userAgent || null,
          timestamp: securityInfo.timestamp,
          error: "User not found",
          success: false,
        })
        return {
          success: false,
          error: "해당 이메일로 가입된 계정을 찾을 수 없습니다.",
        }
      }

      this.logRecoveryAction({
        action: "find_id_email_success",
        email: user.email,
        type: "find_id",
        status: "success",
        ipAddress: securityInfo.ipAddress,
        userAgent: securityInfo.userAgent || null,
        timestamp: securityInfo.timestamp,
        success: true,
      })

      return {
        success: true,
        data: {
          email: user.email,
          nickname: user.nickname,
        },
      }
    } catch (error) {
      logger.error("Find ID by email error:", error)
      return { success: false, error: "서버 오류가 발생했습니다." }
    }
  }

  /**
   * Legacy email-based find password (for backward compatibility)
   */
  async findPasswordByEmail(
    email: string,
    securityInfo: SecurityInfo
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      // Rate limiting
      const rateLimit = this.checkRateLimit(
        securityInfo.ipAddress,
        "email_verification"
      )
      if (!rateLimit.allowed) {
        return {
          success: false,
          error: "요청이 너무 많습니다. 1시간 후에 다시 시도해주세요.",
        }
      }

      // Find user
      const user = await this.userRepo.findOne({
        where: { email: email.toLowerCase().trim() },
      })

      if (!user) {
        this.logRecoveryAction({
          action: "find_password_email_user_not_found",
          email,
          type: "reset_password",
          status: "failure",
          ipAddress: securityInfo.ipAddress,
          userAgent: securityInfo.userAgent || null,
          timestamp: securityInfo.timestamp,
          error: "User not found",
          success: false,
        })
        return {
          success: false,
          error: "해당 이메일로 가입된 계정을 찾을 수 없습니다.",
        }
      }

      // Generate password reset token
      const resetToken = this.generateSecureToken()
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

      // Save password reset token
      const passwordResetToken = this.passwordResetTokenRepo.create({
        token: resetToken,
        email: user.email,
        expiresAt,
        ipAddress: securityInfo.ipAddress,
        ...(securityInfo.userAgent && { userAgent: securityInfo.userAgent }),
      })

      await this.passwordResetTokenRepo.save(passwordResetToken)

      this.logRecoveryAction({
        action: "find_password_email_success",
        email: user.email,
        type: "reset_password",
        status: "success",
        ipAddress: securityInfo.ipAddress,
        userAgent: securityInfo.userAgent || null,
        timestamp: securityInfo.timestamp,
        success: true,
      })

      return {
        success: true,
        data: {
          email: user.email,
          nickname: user.nickname,
          resetToken: resetToken, // 토큰 직접 반환
        },
      }
    } catch (error) {
      logger.error("Find password by email error:", error)
      return { success: false, error: "서버 오류가 발생했습니다." }
    }
  }

  /**
   * Clean up expired tokens (should be called by a scheduled job)
   */
  async cleanupExpiredTokens(): Promise<void> {
    try {
      const now = new Date()

      // Delete expired verification tokens
      await this.verificationTokenRepo.delete({
        expiresAt: now,
      })

      // Delete expired password reset tokens
      await this.passwordResetTokenRepo.delete({
        expiresAt: now,
      })

      logger.info("Expired tokens cleaned up successfully")
    } catch (error) {
      logger.error("Error cleaning up expired tokens:", error)
    }
  }
}

export const accountRecoveryService = new AccountRecoveryService()
