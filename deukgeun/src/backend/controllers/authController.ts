import { Request, Response } from "express"
import { User } from "../entities/User"
import { UserLevel } from "../entities/UserLevel"
import { UserStreak } from "../entities/UserStreak"
import bcrypt from "bcrypt"
import { verifyRecaptcha } from "../utils/recaptcha"
import { createTokens, verifyRefreshToken } from "../utils/jwt"
import { logger } from "../utils/logger"
import { AppDataSource } from "../config/database"
import { ApiResponse, ErrorResponse } from "../types/common"
import {
  LoginRequest,
  RegisterRequest,
  LoginResponse,
  RegisterResponse,
} from "../types/auth"
import { accountRecoveryService } from "../services/accountRecoveryService"
import { SecurityInfo } from "../types/accountRecovery"

export async function login(
  req: Request<Record<string, never>, Record<string, never>, LoginRequest>,
  res: Response<LoginResponse | ErrorResponse>
) {
  try {
    const { email, password, recaptchaToken } = req.body
    console.log("로그인 요청 body:", req.body)

    // 입력 검증
    if (!email || !password || !recaptchaToken) {
      return res.status(400).json({
        success: false,
        message: "모든 필드를 입력하세요.",
        error: "필수 필드 누락",
      })
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "유효한 이메일 주소를 입력하세요.",
        error: "이메일 형식 오류",
      })
    }

    // reCAPTCHA 검증
    const isHuman = await verifyRecaptcha(recaptchaToken)
    if (!isHuman) {
      logger.warn(`reCAPTCHA 실패 - IP: ${req.ip}, Email: ${email}`)
      return res.status(403).json({
        success: false,
        message: "reCAPTCHA 검증에 실패했습니다.",
        error: "reCAPTCHA 실패",
      })
    }

    const userRepo = AppDataSource.getRepository(User)
    const user = await userRepo.findOne({ where: { email } })

    if (!user || !(await bcrypt.compare(password, user.password))) {
      logger.warn(`로그인 실패 - IP: ${req.ip}, Email: ${email}`)
      return res.status(401).json({
        success: false,
        message: "이메일 또는 비밀번호가 틀렸습니다.",
        error: "인증 실패",
      })
    }

    const { accessToken, refreshToken } = createTokens(user.id, user.role)

    logger.info(`로그인 성공 - User ID: ${user.id}, Email: ${email}`)

    res
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7일
      })
      .json({
        success: true,
        message: "로그인 성공",
        accessToken,
        user: {
          id: user.id,
          email: user.email,
          nickname: user.nickname,
          phone: user.phone,
          gender: user.gender,
          birthday: user.birthday,
          profileImage: user.profileImage,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      })
  } catch (error) {
    logger.error("로그인 처리 중 오류:", error)
    return res.status(500).json({
      success: false,
      message: "서버 오류가 발생했습니다.",
      error: "서버 오류",
    })
  }
}

export async function refreshToken(
  req: Request,
  res: Response<ApiResponse<{ accessToken: string }> | ErrorResponse>
) {
  try {
    const token = req.cookies?.refreshToken

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Refresh token이 없습니다.",
        error: "토큰 없음",
      })
    }

    const payload = verifyRefreshToken(token)
    if (!payload) {
      logger.warn(`유효하지 않은 refresh token - IP: ${req.ip}`)
      return res.status(401).json({
        success: false,
        message: "Refresh token이 유효하지 않습니다.",
        error: "토큰 무효",
      })
    }

    const userRepo = AppDataSource.getRepository(User)
    const user = await userRepo.findOne({ where: { id: payload.userId } })

    if (!user) {
      logger.warn(
        `Refresh token으로 사용자를 찾을 수 없음 - User ID: ${payload.userId}`
      )
      return res.status(404).json({
        success: false,
        message: "사용자를 찾을 수 없습니다.",
        error: "사용자 없음",
      })
    }

    const { accessToken, refreshToken: newRefreshToken } = createTokens(
      user.id,
      user.role
    )

    logger.info(`Token 갱신 성공 - User ID: ${user.id}`)

    res
      .cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7일
      })
      .json({
        success: true,
        message: "Token 갱신 성공",
        data: { accessToken },
      })
  } catch (error) {
    logger.error("Token 갱신 중 오류:", error)
    return res.status(500).json({
      success: false,
      message: "서버 오류가 발생했습니다.",
      error: "서버 오류",
    })
  }
}

export function logout(req: Request, res: Response<ApiResponse>): void {
  try {
    logger.info(`로그아웃 - User ID: ${req.user?.userId}`)

    res.clearCookie("refreshToken").json({
      success: true,
      message: "로그아웃 성공",
    })
  } catch (error) {
    logger.error("로그아웃 처리 중 오류:", error)
    res.status(500).json({
      success: false,
      message: "서버 오류가 발생했습니다.",
      error: "서버 오류",
    })
  }
}

export function checkAuth(
  req: Request,
  res: Response<ApiResponse<{ authenticated: boolean }> | ErrorResponse>
): void {
  try {
    // authenticateToken 미들웨어를 통해 이미 검증된 사용자 정보
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "인증되지 않은 사용자입니다.",
        error: "인증 필요",
      })
      return
    }

    logger.info(`인증 상태 확인 - User ID: ${req.user.userId}`)

    res.status(200).json({
      success: true,
      message: "인증된 사용자입니다.",
      data: { authenticated: true },
    })
  } catch (error) {
    logger.error("인증 상태 확인 중 오류:", error)
    res.status(500).json({
      success: false,
      message: "서버 오류가 발생했습니다.",
      error: "서버 오류",
    })
  }
}

export const register = async (
  req: Request<Record<string, never>, Record<string, never>, RegisterRequest>,
  res: Response<RegisterResponse | ErrorResponse>
) => {
  try {
    const {
      email,
      password,
      nickname,
      phone,
      gender,
      birthday,
      recaptchaToken,
    } = req.body

    // 필수 입력 검증
    if (!email || !password || !nickname || !recaptchaToken) {
      return res.status(400).json({
        success: false,
        message: "필수 필드를 모두 입력하세요.",
        error: "필수 필드 누락",
      })
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "유효한 이메일 주소를 입력하세요.",
        error: "이메일 형식 오류",
      })
    }

    // 비밀번호 강도 검증
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "비밀번호는 최소 8자 이상이어야 합니다.",
        error: "비밀번호 강도 부족",
      })
    }

    // 닉네임 검증
    if (nickname.length < 2 || nickname.length > 20) {
      return res.status(400).json({
        success: false,
        message: "닉네임은 2-20자 사이여야 합니다.",
        error: "닉네임 길이 오류",
      })
    }

    // 휴대폰 번호 검증 (선택사항이지만 입력된 경우)
    if (phone && !/^010-\d{4}-\d{4}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message: "올바른 휴대폰 번호 형식을 입력하세요. (010-xxxx-xxxx)",
        error: "휴대폰 번호 형식 오류",
      })
    }

    // reCAPTCHA 검증
    const isHuman = await verifyRecaptcha(recaptchaToken)
    if (!isHuman) {
      logger.warn(`회원가입 reCAPTCHA 실패 - IP: ${req.ip}, Email: ${email}`)
      return res.status(403).json({
        success: false,
        message: "reCAPTCHA 검증에 실패했습니다.",
        error: "reCAPTCHA 실패",
      })
    }

    const userRepo = AppDataSource.getRepository(User)
    const userLevelRepo = AppDataSource.getRepository(UserLevel)
    const userStreakRepo = AppDataSource.getRepository(UserStreak)

    // 이메일 중복 확인
    const existingUser = await userRepo.findOne({ where: { email } })
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "이미 가입된 이메일입니다.",
        error: "이메일 중복",
      })
    }

    // 닉네임 중복 확인
    const existingNickname = await userRepo.findOne({ where: { nickname } })
    if (existingNickname) {
      return res.status(409).json({
        success: false,
        message: "이미 사용 중인 닉네임입니다.",
        error: "닉네임 중복",
      })
    }

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, 12)

    // 사용자 생성
    const newUser = userRepo.create({
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      nickname: nickname.trim(),
      phone: phone?.trim(),
      gender: gender as "male" | "female" | "other" | undefined,
      birthday: birthday,
      role: "user",
    })

    await userRepo.save(newUser)

    // 레벨 시스템 초기화
    const userLevel = userLevelRepo.create({
      userId: newUser.id,
      level: 1,
      currentExp: 0,
      totalExp: 0,
      seasonExp: 0,
    })

    await userLevelRepo.save(userLevel)

    // 연속 활동 기록 초기화
    const userStreak = userStreakRepo.create({
      userId: newUser.id,
      currentCount: 0,
      lastActivity: new Date(),
              streakType: "login",
    })

    await userStreakRepo.save(userStreak)

    // 토큰 생성
    const { accessToken, refreshToken } = createTokens(newUser.id, newUser.role)

    logger.info(`회원가입 성공 - User ID: ${newUser.id}, Email: ${email}`)

    res
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7일
      })
      .status(201)
      .json({
        success: true,
        message: "회원가입 성공",
        accessToken,
        user: {
          id: newUser.id,
          email: newUser.email,
          nickname: newUser.nickname,
          phone: newUser.phone,
          gender: newUser.gender,
          birthday: newUser.birthday,
          profileImage: newUser.profileImage,
          createdAt: newUser.createdAt,
          updatedAt: newUser.updatedAt,
        },
      })
  } catch (error) {
    logger.error("회원가입 처리 중 오류:", error)
    return res.status(500).json({
      success: false,
      message: "서버 오류가 발생했습니다.",
      error: "서버 오류",
    })
  }
}

export async function findId(
  req: Request<
    Record<string, never>,
    Record<string, never>,
    { email: string; recaptchaToken: string }
  >,
  res: Response<ApiResponse | ErrorResponse>
) {
  try {
    const { email, recaptchaToken } = req.body
    console.log("아이디 찾기 요청:", { email })

    // 입력 검증
    if (!email || !recaptchaToken) {
      return res.status(400).json({
        success: false,
        message: "모든 필드를 입력하세요.",
        error: "필수 필드 누락",
      })
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "유효한 이메일 주소를 입력하세요.",
        error: "이메일 형식 오류",
      })
    }

    // reCAPTCHA 검증
    const isHuman = await verifyRecaptcha(recaptchaToken)
    if (!isHuman) {
      logger.warn(
        `reCAPTCHA 실패 (아이디 찾기) - IP: ${req.ip}, Email: ${email}`
      )
      return res.status(403).json({
        success: false,
        message: "reCAPTCHA 검증에 실패했습니다.",
        error: "reCAPTCHA 실패",
      })
    }

    // Security info for logging and rate limiting
    const securityInfo: SecurityInfo = {
      ipAddress: req.ip || "unknown",
      userAgent: req.get("User-Agent") || "unknown",
      timestamp: new Date(),
    }

    // Use account recovery service
    const result = await accountRecoveryService.findIdByEmail(
      email,
      securityInfo
    )

    if (!result.success) {
      return res.status(404).json({
        success: false,
        message: result.error || "아이디 찾기에 실패했습니다.",
        error: "아이디 찾기 실패",
      })
    }

    logger.info(`아이디 찾기 성공 - Email: ${email}`)

    return res.json({
      success: true,
      message: "입력하신 이메일로 아이디 정보를 발송했습니다.",
      data: result.data,
    })
  } catch (error) {
    logger.error("아이디 찾기 처리 중 오류:", error)
    return res.status(500).json({
      success: false,
      message: "서버 오류가 발생했습니다.",
      error: "서버 오류",
    })
  }
}

export async function findPassword(
  req: Request<
    Record<string, never>,
    Record<string, never>,
    { email: string; recaptchaToken: string }
  >,
  res: Response<ApiResponse | ErrorResponse>
) {
  try {
    const { email, recaptchaToken } = req.body
    console.log("비밀번호 찾기 요청:", { email })

    // 입력 검증
    if (!email || !recaptchaToken) {
      return res.status(400).json({
        success: false,
        message: "모든 필드를 입력하세요.",
        error: "필수 필드 누락",
      })
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "유효한 이메일 주소를 입력하세요.",
        error: "이메일 형식 오류",
      })
    }

    // reCAPTCHA 검증
    const isHuman = await verifyRecaptcha(recaptchaToken)
    if (!isHuman) {
      logger.warn(
        `reCAPTCHA 실패 (비밀번호 찾기) - IP: ${req.ip}, Email: ${email}`
      )
      return res.status(403).json({
        success: false,
        message: "reCAPTCHA 검증에 실패했습니다.",
        error: "reCAPTCHA 실패",
      })
    }

    // Security info for logging and rate limiting
    const securityInfo: SecurityInfo = {
      ipAddress: req.ip || "unknown",
      userAgent: req.get("User-Agent") || "unknown",
      timestamp: new Date(),
    }

    // Use account recovery service
    const result = await accountRecoveryService.findPasswordByEmail(
      email,
      securityInfo
    )

    if (!result.success) {
      return res.status(404).json({
        success: false,
        message: result.error || "비밀번호 찾기에 실패했습니다.",
        error: "비밀번호 찾기 실패",
      })
    }

    logger.info(`비밀번호 찾기 성공 - Email: ${email}`)

    return res.json({
      success: true,
      message: "입력하신 이메일로 비밀번호 재설정 링크를 발송했습니다.",
      data: result.data,
    })
  } catch (error) {
    logger.error("비밀번호 찾기 처리 중 오류:", error)
    return res.status(500).json({
      success: false,
      message: "서버 오류가 발생했습니다.",
      error: "서버 오류",
    })
  }
}

// Enhanced Account Recovery Controllers

export async function findIdStep1(
  req: Request<
    Record<string, never>,
    Record<string, never>,
    { name: string; phone: string; recaptchaToken: string }
  >,
  res: Response<ApiResponse | ErrorResponse>
) {
  try {
    const { name, phone, recaptchaToken } = req.body
    console.log("아이디 찾기 Step 1 요청:", { name, phone })

    // 입력 검증
    if (!name || !phone || !recaptchaToken) {
      return res.status(400).json({
        success: false,
        message: "모든 필드를 입력하세요.",
        error: "필수 필드 누락",
      })
    }

    // reCAPTCHA 검증
    const isHuman = await verifyRecaptcha(recaptchaToken)
    if (!isHuman) {
      logger.warn(`reCAPTCHA 실패 (아이디 찾기 Step 1) - IP: ${req.ip}`)
      return res.status(403).json({
        success: false,
        message: "reCAPTCHA 검증에 실패했습니다.",
        error: "reCAPTCHA 실패",
      })
    }

    // Security info for logging and rate limiting
    const securityInfo: SecurityInfo = {
      ipAddress: req.ip || "unknown",
      userAgent: req.get("User-Agent") || "unknown",
      timestamp: new Date(),
    }

    // Use account recovery service
    const result = await accountRecoveryService.findIdStep1(
      name,
      phone,
      securityInfo
    )

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error || "사용자 확인에 실패했습니다.",
        error: "사용자 확인 실패",
      })
    }

    logger.info(`아이디 찾기 Step 1 성공 - Name: ${name}`)

    return res.json({
      success: true,
      message: "인증 코드를 이메일로 발송했습니다.",
      data: result.data,
    })
  } catch (error) {
    logger.error("아이디 찾기 Step 1 처리 중 오류:", error)
    return res.status(500).json({
      success: false,
      message: "서버 오류가 발생했습니다.",
      error: "서버 오류",
    })
  }
}

export async function findIdStep2(
  req: Request<
    Record<string, never>,
    Record<string, never>,
    { email: string; code: string; recaptchaToken: string }
  >,
  res: Response<ApiResponse | ErrorResponse>
) {
  try {
    const { email, code, recaptchaToken } = req.body
    console.log("아이디 찾기 Step 2 요청:", { email })

    // 입력 검증
    if (!email || !code || !recaptchaToken) {
      return res.status(400).json({
        success: false,
        message: "모든 필드를 입력하세요.",
        error: "필수 필드 누락",
      })
    }

    // reCAPTCHA 검증
    const isHuman = await verifyRecaptcha(recaptchaToken)
    if (!isHuman) {
      logger.warn(`reCAPTCHA 실패 (아이디 찾기 Step 2) - IP: ${req.ip}`)
      return res.status(403).json({
        success: false,
        message: "reCAPTCHA 검증에 실패했습니다.",
        error: "reCAPTCHA 실패",
      })
    }

    // Security info for logging and rate limiting
    const securityInfo: SecurityInfo = {
      ipAddress: req.ip || "unknown",
      userAgent: req.get("User-Agent") || "unknown",
      timestamp: new Date(),
    }

    // Use account recovery service
    const result = await accountRecoveryService.findIdStep2(
      email,
      code,
      securityInfo
    )

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error || "인증 코드 확인에 실패했습니다.",
        error: "인증 코드 확인 실패",
      })
    }

    logger.info(`아이디 찾기 Step 2 성공 - Email: ${email}`)

    return res.json({
      success: true,
      message: "아이디 찾기가 완료되었습니다.",
      data: result.data,
    })
  } catch (error) {
    logger.error("아이디 찾기 Step 2 처리 중 오류:", error)
    return res.status(500).json({
      success: false,
      message: "서버 오류가 발생했습니다.",
      error: "서버 오류",
    })
  }
}

export async function resetPasswordStep1(
  req: Request<
    Record<string, never>,
    Record<string, never>,
    { name: string; phone: string; recaptchaToken: string }
  >,
  res: Response<ApiResponse | ErrorResponse>
) {
  try {
    const { name, phone, recaptchaToken } = req.body
    console.log("비밀번호 재설정 Step 1 요청:", { name, phone })

    // 입력 검증
    if (!name || !phone || !recaptchaToken) {
      return res.status(400).json({
        success: false,
        message: "모든 필드를 입력하세요.",
        error: "필수 필드 누락",
      })
    }

    // reCAPTCHA 검증
    const isHuman = await verifyRecaptcha(recaptchaToken)
    if (!isHuman) {
      logger.warn(`reCAPTCHA 실패 (비밀번호 재설정 Step 1) - IP: ${req.ip}`)
      return res.status(403).json({
        success: false,
        message: "reCAPTCHA 검증에 실패했습니다.",
        error: "reCAPTCHA 실패",
      })
    }

    // Security info for logging and rate limiting
    const securityInfo: SecurityInfo = {
      ipAddress: req.ip || "unknown",
      userAgent: req.get("User-Agent") || "unknown",
      timestamp: new Date(),
    }

    // Use account recovery service
    const result = await accountRecoveryService.resetPasswordStep1(
      name,
      phone,
      securityInfo
    )

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error || "사용자 확인에 실패했습니다.",
        error: "사용자 확인 실패",
      })
    }

    logger.info(`비밀번호 재설정 Step 1 성공 - Name: ${name}`)

    return res.json({
      success: true,
      message: "인증 코드를 이메일로 발송했습니다.",
      data: result.data,
    })
  } catch (error) {
    logger.error("비밀번호 재설정 Step 1 처리 중 오류:", error)
    return res.status(500).json({
      success: false,
      message: "서버 오류가 발생했습니다.",
      error: "서버 오류",
    })
  }
}

export async function resetPasswordStep2(
  req: Request<
    Record<string, never>,
    Record<string, never>,
    { email: string; code: string; recaptchaToken: string }
  >,
  res: Response<ApiResponse | ErrorResponse>
) {
  try {
    const { email, code, recaptchaToken } = req.body
    console.log("비밀번호 재설정 Step 2 요청:", { email })

    // 입력 검증
    if (!email || !code || !recaptchaToken) {
      return res.status(400).json({
        success: false,
        message: "모든 필드를 입력하세요.",
        error: "필수 필드 누락",
      })
    }

    // reCAPTCHA 검증
    const isHuman = await verifyRecaptcha(recaptchaToken)
    if (!isHuman) {
      logger.warn(`reCAPTCHA 실패 (비밀번호 재설정 Step 2) - IP: ${req.ip}`)
      return res.status(403).json({
        success: false,
        message: "reCAPTCHA 검증에 실패했습니다.",
        error: "reCAPTCHA 실패",
      })
    }

    // Security info for logging and rate limiting
    const securityInfo: SecurityInfo = {
      ipAddress: req.ip || "unknown",
      userAgent: req.get("User-Agent") || "unknown",
      timestamp: new Date(),
    }

    // Use account recovery service
    const result = await accountRecoveryService.resetPasswordStep2(
      email,
      code,
      securityInfo
    )

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error || "인증 코드 확인에 실패했습니다.",
        error: "인증 코드 확인 실패",
      })
    }

    logger.info(`비밀번호 재설정 Step 2 성공 - Email: ${email}`)

    return res.json({
      success: true,
      message: "비밀번호 재설정 토큰이 생성되었습니다.",
      data: result.data,
    })
  } catch (error) {
    logger.error("비밀번호 재설정 Step 2 처리 중 오류:", error)
    return res.status(500).json({
      success: false,
      message: "서버 오류가 발생했습니다.",
      error: "서버 오류",
    })
  }
}

export async function resetPasswordStep3(
  req: Request<
    Record<string, never>,
    Record<string, never>,
    {
      resetToken: string
      newPassword: string
      confirmPassword: string
      recaptchaToken: string
    }
  >,
  res: Response<ApiResponse | ErrorResponse>
) {
  try {
    const { resetToken, newPassword, confirmPassword, recaptchaToken } =
      req.body
    console.log("비밀번호 재설정 Step 3 요청")

    // 입력 검증
    if (!resetToken || !newPassword || !confirmPassword || !recaptchaToken) {
      return res.status(400).json({
        success: false,
        message: "모든 필드를 입력하세요.",
        error: "필수 필드 누락",
      })
    }

    // reCAPTCHA 검증
    const isHuman = await verifyRecaptcha(recaptchaToken)
    if (!isHuman) {
      logger.warn(`reCAPTCHA 실패 (비밀번호 재설정 Step 3) - IP: ${req.ip}`)
      return res.status(403).json({
        success: false,
        message: "reCAPTCHA 검증에 실패했습니다.",
        error: "reCAPTCHA 실패",
      })
    }

    // Security info for logging and rate limiting
    const securityInfo: SecurityInfo = {
      ipAddress: req.ip || "unknown",
      userAgent: req.get("User-Agent") || "unknown",
      timestamp: new Date(),
    }

    // Use account recovery service
    const result = await accountRecoveryService.resetPasswordStep3(
      resetToken,
      newPassword,
      confirmPassword,
      securityInfo
    )

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error || "비밀번호 재설정에 실패했습니다.",
        error: "비밀번호 재설정 실패",
      })
    }

    logger.info("비밀번호 재설정 Step 3 성공")

    return res.json({
      success: true,
      message: "비밀번호가 성공적으로 재설정되었습니다.",
    })
  } catch (error) {
    logger.error("비밀번호 재설정 Step 3 처리 중 오류:", error)
    return res.status(500).json({
      success: false,
      message: "서버 오류가 발생했습니다.",
      error: "서버 오류",
    })
  }
}

// JSON 구조 기반 단순 계정 복구 컨트롤러

export async function findIdSimple(
  req: Request<
    Record<string, never>,
    Record<string, never>,
    {
      name: string
      phone: string
      gender?: string
      birthday?: string
      recaptchaToken: string
    }
  >,
  res: Response<ApiResponse | ErrorResponse>
) {
  try {
    const { name, phone, gender, birthday, recaptchaToken } = req.body
    console.log("단순 아이디 찾기 요청:", { name, phone, gender, birthday })

    // 입력 검증
    if (!name || !phone || !recaptchaToken) {
      return res.status(400).json({
        success: false,
        message: "필수 필드를 모두 입력하세요.",
        error: "필수 필드 누락",
      })
    }

    // reCAPTCHA 검증
    const isHuman = await verifyRecaptcha(recaptchaToken)
    if (!isHuman) {
      logger.warn(`reCAPTCHA 실패 (단순 아이디 찾기) - IP: ${req.ip}`)
      return res.status(403).json({
        success: false,
        message: "reCAPTCHA 검증에 실패했습니다.",
        error: "reCAPTCHA 실패",
      })
    }

    // Security info for logging and rate limiting
    const securityInfo: SecurityInfo = {
      ipAddress: req.ip || "unknown",
      userAgent: req.get("User-Agent") || "unknown",
      timestamp: new Date(),
    }

    // Use account recovery service with enhanced verification
    const result = await accountRecoveryService.findIdSimple(
      name,
      phone,
      securityInfo,
      gender,
      birthday
    )

    if (!result.success) {
      return res.status(404).json({
        success: false,
        message:
          result.error || "입력하신 정보와 일치하는 계정을 찾을 수 없습니다.",
        error: "계정 찾기 실패",
      })
    }

    logger.info(`단순 아이디 찾기 성공 - Name: ${name}`)

    return res.json({
      success: true,
      message: "아이디 조회 성공",
      data: result.data,
    })
  } catch (error) {
    logger.error("단순 아이디 찾기 처리 중 오류:", error)
    return res.status(500).json({
      success: false,
      message: "서버 오류가 발생했습니다.",
      error: "서버 오류",
    })
  }
}

export async function resetPasswordSimpleStep1(
  req: Request<
    Record<string, never>,
    Record<string, never>,
    {
      username: string
      name: string
      phone: string
      gender?: string
      birthday?: string
      recaptchaToken: string
    }
  >,
  res: Response<ApiResponse | ErrorResponse>
) {
  try {
    const { username, name, phone, gender, birthday, recaptchaToken } = req.body
    console.log("단순 비밀번호 재설정 Step 1 요청:", {
      username,
      name,
      phone,
      gender,
      birthday,
    })

    // reCAPTCHA 검증
    const recaptchaValid = await verifyRecaptcha(recaptchaToken)
    if (!recaptchaValid) {
      return res.status(400).json({
        success: false,
        message: "reCAPTCHA 검증에 실패했습니다.",
        error: "reCAPTCHA 검증 실패",
      })
    }

    // 보안 정보 수집
    const securityInfo = {
      ipAddress: req.ip || req.connection.remoteAddress || "unknown",
      userAgent: req.get("User-Agent") || "unknown",
      timestamp: new Date(),
    }

    // 계정 복구 서비스 호출
    const result = await accountRecoveryService.resetPasswordSimpleStep1(
      username,
      name,
      phone,
      securityInfo,
      gender,
      birthday
    )

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: "사용자 인증이 완료되었습니다. 인증 코드를 확인하세요.",
        data: result.data,
      })
    } else {
      return res.status(400).json({
        success: false,
        message: result.error || "사용자 인증에 실패했습니다.",
        error: result.error,
      })
    }
  } catch (error) {
    logger.error("단순 비밀번호 재설정 Step 1 처리 중 오류:", error)
    return res.status(500).json({
      success: false,
      message: "서버 오류가 발생했습니다.",
      error: "서버 오류",
    })
  }
}

export async function resetPasswordSimpleStep2(
  req: Request<
    Record<string, never>,
    Record<string, never>,
    {
      username: string
      code: string
      newPassword: string
      confirmPassword: string
      recaptchaToken: string
    }
  >,
  res: Response<ApiResponse | ErrorResponse>
) {
  try {
    const { username, code, newPassword, confirmPassword, recaptchaToken } =
      req.body
    console.log("단순 비밀번호 재설정 Step 2 요청:", { username, code })

    // reCAPTCHA 검증
    const recaptchaValid = await verifyRecaptcha(recaptchaToken)
    if (!recaptchaValid) {
      return res.status(400).json({
        success: false,
        message: "reCAPTCHA 검증에 실패했습니다.",
        error: "reCAPTCHA 검증 실패",
      })
    }

    // 보안 정보 수집
    const securityInfo = {
      ipAddress: req.ip || req.connection.remoteAddress || "unknown",
      userAgent: req.get("User-Agent") || "unknown",
      timestamp: new Date(),
    }

    // 계정 복구 서비스 호출
    const result = await accountRecoveryService.resetPasswordSimpleStep2(
      username,
      code,
      newPassword,
      confirmPassword,
      securityInfo
    )

    if (result.success) {
      return res.status(200).json({
        success: true,
        message:
          result.data?.message || "비밀번호가 성공적으로 재설정되었습니다.",
        data: result.data,
      })
    } else {
      return res.status(400).json({
        success: false,
        message: result.error || "비밀번호 재설정에 실패했습니다.",
        error: result.error,
      })
    }
  } catch (error) {
    logger.error("단순 비밀번호 재설정 Step 2 처리 중 오류:", error)
    return res.status(500).json({
      success: false,
      message: "서버 오류가 발생했습니다.",
      error: "서버 오류",
    })
  }
}
