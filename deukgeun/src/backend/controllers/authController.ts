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
          role: user.role,
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
      streakType: "daily_login",
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
          role: newUser.role,
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
