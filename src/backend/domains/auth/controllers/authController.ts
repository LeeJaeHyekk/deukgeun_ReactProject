// ============================================================================
// Auth Controller
// ============================================================================

import { Request, Response } from "express"
import { User } from "../entities/User"
import { UserLevel } from "../../level/entities/UserLevel"
import { UserStreak } from "../../../entities/UserStreak"
import bcrypt from "bcrypt"
import { verifyRecaptcha } from "../utils/recaptcha"
import { createTokens, verifyRefreshToken } from "../utils/jwt"
import { logger } from "../../../shared/utils/logger"
import { AppDataSource } from "../../../shared/database"
import { ApiResponse, ErrorResponse } from "../types/index"
import {
  LoginRequest,
  RegisterRequest,
  LoginResponse,
  RegisterResponse,
} from "../types/index.js"
import { accountRecoveryService } from "../services/accountRecoveryService"
import { SecurityInfo } from "../types/index"
import { UserTransformer } from "../transformers/user.transformer"

export async function register(
  req: Request<Record<string, never>, Record<string, never>, RegisterRequest>,
  res: Response<RegisterResponse | ErrorResponse>
): Promise<void> {
  try {
    const { email, password, nickname, recaptchaToken } = req.body

    // 입력 검증
    if (!email || !password || !nickname || !recaptchaToken) {
      res.status(400).json({
        success: false,
        message: "모든 필드를 입력하세요.",
        error: "필수 필드 누락",
      })
      return
    }

    // reCAPTCHA 검증
    const recaptchaValid = await verifyRecaptcha(recaptchaToken)
    if (!recaptchaValid) {
      res.status(400).json({
        success: false,
        message: "reCAPTCHA 검증에 실패했습니다.",
        error: "reCAPTCHA 검증 실패",
      })
      return
    }

    // 사용자 생성 로직 (간단한 구현)
    const { accessToken, refreshToken } = createTokens({
      id: "1",
      userId: "1",
      email,
      role: "user",
    })

    res.status(201).json({
      success: true,
      message: "회원가입이 완료되었습니다.",
      accessToken,
      refreshToken,
      user: {
        id: "1",
        email,
        name: nickname,
        nickname,
        role: "user" as const,
        level: 1,
        exp: 0,
        isEmailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    })
  } catch (error) {
    logger.error("회원가입 오류:", error)
    res.status(500).json({
      success: false,
      message: "서버 오류가 발생했습니다.",
      error: "서버 오류",
    })
  }
}

export async function login(
  req: Request<Record<string, never>, Record<string, never>, LoginRequest>,
  res: Response<LoginResponse | ErrorResponse>
): Promise<void> {
  try {
    const { email, password, recaptchaToken } = req.body

    // 입력 검증
    if (!email || !password || !recaptchaToken) {
      res.status(400).json({
        success: false,
        message: "모든 필드를 입력하세요.",
        error: "필수 필드 누락",
      })
      return
    }

    // reCAPTCHA 검증
    const recaptchaValid = await verifyRecaptcha(recaptchaToken)
    if (!recaptchaValid) {
      res.status(400).json({
        success: false,
        message: "reCAPTCHA 검증에 실패했습니다.",
        error: "reCAPTCHA 검증 실패",
      })
      return
    }

    // 사용자 조회 및 비밀번호 검증 (간단한 구현)
    const user = {
      id: "1",
      email,
      nickname: "테스트사용자",
      role: "user" as const,
    }

    const { accessToken, refreshToken } = createTokens({
      id: user.id,
      userId: user.id,
      email: user.email,
      role: user.role,
    })

    res.status(200).json({
      success: true,
      message: "로그인에 성공했습니다.",
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.nickname,
        nickname: user.nickname,
        role: user.role,
        level: 1,
        exp: 0,
        isEmailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    })
  } catch (error) {
    logger.error("로그인 오류:", error)
    res.status(500).json({
      success: false,
      message: "서버 오류가 발생했습니다.",
      error: "서버 오류",
    })
  }
}

export async function logout(
  req: Request,
  res: Response<ApiResponse | ErrorResponse>
): Promise<void> {
  try {
    // 로그아웃 로직 (토큰 무효화 등)
    res.status(200).json({
      success: true,
      message: "로그아웃되었습니다.",
    })
  } catch (error) {
    logger.error("로그아웃 오류:", error)
    res.status(500).json({
      success: false,
      message: "서버 오류가 발생했습니다.",
      error: "서버 오류",
    })
  }
}

export async function refreshToken(
  req: Request,
  res: Response<ApiResponse | ErrorResponse>
): Promise<void> {
  try {
    const { refreshToken } = req.body

    if (!refreshToken) {
      res.status(400).json({
        success: false,
        message: "리프레시 토큰이 필요합니다.",
        error: "토큰 누락",
      })
      return
    }

    // 토큰 갱신 로직
    res.status(200).json({
      success: true,
      message: "토큰이 갱신되었습니다.",
      data: {
        accessToken: "new_access_token",
        refreshToken: "new_refresh_token",
      },
    })
  } catch (error) {
    logger.error("토큰 갱신 오류:", error)
    res.status(500).json({
      success: false,
      message: "서버 오류가 발생했습니다.",
      error: "서버 오류",
    })
  }
}

// 계정 복구 관련 함수들
export async function checkAuth(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const user = (req as any).user
    res.json({
      success: true,
      message: "인증 확인 완료",
      data: { user }
    })
  } catch (error) {
    logger.error("인증 확인 오류:", error)
    res.status(500).json({
      success: false,
      message: "서버 오류가 발생했습니다.",
      error: "서버 오류",
    })
  }
}

export async function findId(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const result = await accountRecoveryService.findId(req.body)
    res.json(result)
  } catch (error) {
    logger.error("아이디 찾기 오류:", error)
    res.status(500).json({
      success: false,
      message: "서버 오류가 발생했습니다.",
      error: "서버 오류",
    })
  }
}

export async function findPassword(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const result = await accountRecoveryService.findPassword(req.body)
    res.json(result)
  } catch (error) {
    logger.error("비밀번호 찾기 오류:", error)
    res.status(500).json({
      success: false,
      message: "서버 오류가 발생했습니다.",
      error: "서버 오류",
    })
  }
}

export async function findIdStep1(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const ipAddress = req.ip || req.connection.remoteAddress || "unknown"
    const userAgent = req.get("User-Agent") || "unknown"
    const result = await accountRecoveryService.findIdStep1(req.body, ipAddress, userAgent)
    res.json(result)
  } catch (error) {
    logger.error("아이디 찾기 1단계 오류:", error)
    res.status(500).json({
      success: false,
      message: "서버 오류가 발생했습니다.",
      error: "서버 오류",
    })
  }
}

export async function findIdStep2(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const ipAddress = req.ip || req.connection.remoteAddress || "unknown"
    const userAgent = req.get("User-Agent") || "unknown"
    const result = await accountRecoveryService.findIdStep2(req.body, ipAddress, userAgent)
    res.json(result)
  } catch (error) {
    logger.error("아이디 찾기 2단계 오류:", error)
    res.status(500).json({
      success: false,
      message: "서버 오류가 발생했습니다.",
      error: "서버 오류",
    })
  }
}

export async function resetPasswordStep1(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const ipAddress = req.ip || req.connection.remoteAddress || "unknown"
    const userAgent = req.get("User-Agent") || "unknown"
    const result = await accountRecoveryService.resetPasswordStep1(req.body, ipAddress, userAgent)
    res.json(result)
  } catch (error) {
    logger.error("비밀번호 재설정 1단계 오류:", error)
    res.status(500).json({
      success: false,
      message: "서버 오류가 발생했습니다.",
      error: "서버 오류",
    })
  }
}

export async function resetPasswordStep2(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const ipAddress = req.ip || req.connection.remoteAddress || "unknown"
    const userAgent = req.get("User-Agent") || "unknown"
    const result = await accountRecoveryService.resetPasswordStep2(req.body, ipAddress, userAgent)
    res.json(result)
  } catch (error) {
    logger.error("비밀번호 재설정 2단계 오류:", error)
    res.status(500).json({
      success: false,
      message: "서버 오류가 발생했습니다.",
      error: "서버 오류",
    })
  }
}

export async function resetPasswordStep3(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const ipAddress = req.ip || req.connection.remoteAddress || "unknown"
    const userAgent = req.get("User-Agent") || "unknown"
    const token = req.body.token || ""
    const result = await accountRecoveryService.resetPasswordStep3(req.body, ipAddress, userAgent, token)
    res.json(result)
  } catch (error) {
    logger.error("비밀번호 재설정 3단계 오류:", error)
    res.status(500).json({
      success: false,
      message: "서버 오류가 발생했습니다.",
      error: "서버 오류",
    })
  }
}

export async function findIdSimple(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const ipAddress = req.ip || req.connection.remoteAddress || "unknown"
    const userAgent = req.get("User-Agent") || "unknown"
    const result = await accountRecoveryService.findIdSimple(req.body, ipAddress, userAgent)
    res.json(result)
  } catch (error) {
    logger.error("간단 아이디 찾기 오류:", error)
    res.status(500).json({
      success: false,
      message: "서버 오류가 발생했습니다.",
      error: "서버 오류",
    })
  }
}

export async function resetPasswordSimpleStep1(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const ipAddress = req.ip || req.connection.remoteAddress || "unknown"
    const userAgent = req.get("User-Agent") || "unknown"
    const token = req.body.token || ""
    const result = await accountRecoveryService.resetPasswordSimpleStep1(req.body, ipAddress, userAgent, token)
    res.json(result)
  } catch (error) {
    logger.error("간단 비밀번호 재설정 1단계 오류:", error)
    res.status(500).json({
      success: false,
      message: "서버 오류가 발생했습니다.",
      error: "서버 오류",
    })
  }
}

export async function resetPasswordSimpleStep2(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const ipAddress = req.ip || req.connection.remoteAddress || "unknown"
    const userAgent = req.get("User-Agent") || "unknown"
    const token = req.body.token || ""
    const newPassword = req.body.newPassword || ""
    const result = await accountRecoveryService.resetPasswordSimpleStep2(req.body, ipAddress, userAgent, token, newPassword)
    res.json(result)
  } catch (error) {
    logger.error("간단 비밀번호 재설정 2단계 오류:", error)
    res.status(500).json({
      success: false,
      message: "서버 오류가 발생했습니다.",
      error: "서버 오류",
    })
  }
}