import { Request, Response } from "express"
import { User } from '@backend/entities/User'
import { UserLevel } from '@backend/entities/UserLevel'
import { UserStreak } from "@backend/entities/UserStreak"
import bcrypt from "bcrypt"
import { verifyRecaptcha } from '@backend/utils/recaptcha'
import { createTokens, verifyRefreshToken, hashRefreshToken, compareRefreshToken } from '@backend/utils/jwt'
import { logger } from '@backend/utils/logger'
import { lazyLoadDatabase } from "@backend/modules/server/LazyLoader"
import { ApiResponse, ErrorResponse } from "@backend/types"
import {
  LoginRequest,
  RegisterRequest,
  LoginResponse,
  RegisterResponse,
} from "../types"
import { accountRecoveryService } from '@backend/services/accountRecoveryService'
import { SecurityInfo } from "@backend/types"
import { UserTransformer } from '@backend/transformers/userTransformer'

export async function login(
  req: Request<Record<string, never>, Record<string, never>, LoginRequest>,
  res: Response<ApiResponse<LoginResponse> | ErrorResponse>
): Promise<void> {
  try {
    const { email, password, recaptchaToken } = req.body
    logger.info(`로그인 요청 시작 - IP: ${req.ip}, Email: ${email}`, {
      email,
      hasPassword: !!password,
      hasRecaptchaToken: !!recaptchaToken,
      recaptchaTokenLength: recaptchaToken?.length || 0
    })

    // 입력 검증
    if (!email || !password || !recaptchaToken) {
      res.status(400).json({
        success: false,
        message: "모든 필드를 입력하세요.",
        error: "필수 필드 누락",
      })
      return
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      res.status(400).json({
        success: false,
        message: "유효한 이메일 주소를 입력하세요.",
        error: "이메일 형식 오류",
      })
      return
    }

    // reCAPTCHA 검증 (action: LOGIN)
    try {
      logger.info(`reCAPTCHA 검증 시작 - IP: ${req.ip}, Email: ${email}`)
      const isHuman = await verifyRecaptcha(recaptchaToken, "LOGIN", req)
      if (!isHuman) {
        logger.warn(`reCAPTCHA 실패 - IP: ${req.ip}, Email: ${email}`)
        res.status(403).json({
          success: false,
          message: "reCAPTCHA 검증에 실패했습니다. 페이지를 새로고침한 후 다시 시도해주세요.",
          error: "RECAPTCHA_VERIFICATION_FAILED",
        })
        return
      }
      logger.info(`reCAPTCHA 검증 통과 - IP: ${req.ip}, Email: ${email}`)
    } catch (recaptchaError: any) {
      // reCAPTCHA 검증 중 오류 발생 (네트워크 오류, 타임아웃 등)
      logger.error(`reCAPTCHA 검증 오류 - IP: ${req.ip}, Email: ${email}`, recaptchaError)
      
      // 개발 환경에서는 reCAPTCHA 오류를 무시하고 계속 진행
      if (process.env.NODE_ENV === 'development') {
        logger.warn('개발 환경: reCAPTCHA 검증 오류를 무시하고 계속 진행합니다.')
      } else {
        // 프로덕션 환경에서는 503 Service Unavailable 반환
        res.status(503).json({
          success: false,
          message: "reCAPTCHA 서비스에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.",
          error: "RECAPTCHA_SERVICE_UNAVAILABLE",
        })
        return
      }
    }

    logger.info(`데이터베이스 조회 시작 - Email: ${email}`)
    const dataSource = await lazyLoadDatabase()
    const userRepo = dataSource.getRepository(User)
    const user = await userRepo.findOne({ where: { email } })

    // 사용자 존재 여부 확인 및 로깅
    if (!user) {
      logger.warn(`로그인 실패 - 사용자 없음 - IP: ${req.ip}, Email: ${email}`)
      res.status(401).json({
        success: false,
        message: "이메일 또는 비밀번호가 틀렸습니다.",
        error: "인증 실패",
      })
      return
    }

    logger.info(`사용자 찾음 - User ID: ${user.id}, Email: ${email}`)

    // 비밀번호 비교 및 상세 로깅
    logger.info(`비밀번호 비교 시작 - User ID: ${user.id}`)
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      logger.warn(`로그인 실패 - 비밀번호 불일치 - IP: ${req.ip}, Email: ${email}, User ID: ${user.id}`)
      res.status(401).json({
        success: false,
        message: "이메일 또는 비밀번호가 틀렸습니다.",
        error: "인증 실패",
      })
      return
    }

    logger.info(`비밀번호 검증 통과 - User ID: ${user.id}`)

    const { accessToken, refreshToken } = createTokens(user.id, user.role)

    // refresh token 해시 저장 (토큰 로테이션)
    const refreshHash = await hashRefreshToken(refreshToken)
    user.refreshTokenHash = refreshHash
    await userRepo.save(user)

    logger.info(`로그인 성공 - User ID: ${user.id}, Email: ${email}`)

    // 쿠키 설정 검증 및 최적화
    const isProduction = process.env.NODE_ENV === "production"
    const isSecure = isProduction || process.env.FORCE_SECURE_COOKIES === "true"
    
    // CORS 설정 확인
    const origin = req.headers.origin
    const isHttps = origin?.startsWith('https://') || req.protocol === 'https'
    
    // sameSite 설정: 프로덕션에서 HTTPS면 "none", 그 외는 "lax"
    const sameSite: "none" | "lax" | "strict" = 
      (isProduction && isSecure && isHttps) ? "none" : "lax"
    
    logger.debug("쿠키 설정", {
      isProduction,
      isSecure,
      isHttps,
      sameSite,
      origin,
      protocol: req.protocol
    })
    
    res
      .cookie("refreshToken", refreshToken, {
        httpOnly: true, // XSS 방지
        secure: isSecure, // HTTPS에서만 전송
        sameSite, // CSRF 방지
        path: "/", // 모든 경로에서 사용 가능
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7일
        domain: isProduction ? process.env.COOKIE_DOMAIN : undefined, // 프로덕션에서만 도메인 설정
      })
      .json({
        success: true,
        message: "로그인 성공",
        data: {
          accessToken,
          user: UserTransformer.toDTO(user),
        }
      })
  } catch (error) {
    logger.error("로그인 처리 중 오류:", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      email: req.body?.email,
      ip: req.ip
    })
    res.status(500).json({
      success: false,
      message: "서버 오류가 발생했습니다.",
      error: "서버 오류",
    })
  }
}

export async function refreshToken(
  req: Request,
  res: Response<ApiResponse<{ accessToken: string }> | ErrorResponse>
): Promise<void> {
  try {
    // httpOnly 쿠키에서 refresh token 읽기
    const token = req.cookies?.refreshToken

    console.log("🔄 [RefreshToken] 요청 시작")
    console.log("🔄 [RefreshToken] 쿠키에서 refreshToken:", token ? `${token.substring(0, 20)}...` : "없음")

    if (!token) {
      console.log("🔄 [RefreshToken] 토큰 없음 - 401 반환")
      res.status(401).json({
        success: false,
        message: "Refresh token이 없습니다.",
        error: "토큰 없음",
      })
      return
    }

    const payload = verifyRefreshToken(token)
    if (!payload) {
      logger.warn(`유효하지 않은 refresh token - IP: ${req.ip}`)
      // 리프레시 토큰 만료 시 쿠키 제거
      res.clearCookie("refreshToken", { path: "/" })
      res.status(401).json({
        success: false,
        message: "Refresh token이 만료되었습니다. 다시 로그인해주세요.",
        error: "REFRESH_TOKEN_EXPIRED",
      })
      return
    }

    const dataSource = await lazyLoadDatabase()
    const userRepo = dataSource.getRepository(User)
    const user = await userRepo.findOne({ where: { id: payload.userId } })

    if (!user || !user.refreshTokenHash) {
      logger.warn(
        `Refresh token으로 사용자를 찾을 수 없음 - User ID: ${payload.userId}`
      )
      res.status(404).json({
        success: false,
        message: "사용자를 찾을 수 없습니다.",
        error: "사용자 없음",
      })
      return
    }

    // 전달된 refreshToken과 DB에 저장된 해시 비교
    const isValid = await compareRefreshToken(token, user.refreshTokenHash)
    if (!isValid) {
      // 이상징후: 토큰 불일치 -> 강제 로그아웃(쿠키 제거)
      logger.warn(`Refresh token 불일치 - User ID: ${user.id}, IP: ${req.ip}`)
      res.clearCookie("refreshToken", { path: "/" })
      res.status(401).json({
        success: false,
        message: "리프레시 토큰 불일치",
        error: "토큰 불일치",
      })
      return
    }

    // rotation: 새 refresh token 발급 및 DB에 해시 저장
    const { accessToken, refreshToken: newRefreshToken } = createTokens(
      user.id,
      user.role
    )

    const newRefreshHash = await hashRefreshToken(newRefreshToken)
    user.refreshTokenHash = newRefreshHash
    await userRepo.save(user)

    logger.info(`Token 갱신 성공 - User ID: ${user.id}`)

    // 쿠키 설정 검증 및 최적화 (login과 동일한 로직)
    const isProduction = process.env.NODE_ENV === "production"
    const isSecure = isProduction || process.env.FORCE_SECURE_COOKIES === "true"
    
    // CORS 설정 확인
    const origin = req.headers.origin
    const isHttps = origin?.startsWith('https://') || req.protocol === 'https'
    
    // sameSite 설정: 프로덕션에서 HTTPS면 "none", 그 외는 "lax"
    const sameSite: "none" | "lax" | "strict" = 
      (isProduction && isSecure && isHttps) ? "none" : "lax"
    
    logger.debug("쿠키 설정 (refreshToken)", {
      isProduction,
      isSecure,
      isHttps,
      sameSite,
      origin,
      protocol: req.protocol
    })

    res
      .cookie("refreshToken", newRefreshToken, {
        httpOnly: true, // XSS 방지
        secure: isSecure, // HTTPS에서만 전송
        sameSite, // CSRF 방지
        path: "/", // 모든 경로에서 사용 가능
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7일
        domain: isProduction ? process.env.COOKIE_DOMAIN : undefined, // 프로덕션에서만 도메인 설정
      })
      .json({
        success: true,
        message: "Token 갱신 성공",
        data: { 
          accessToken
        },
      })
  } catch (error) {
    logger.error("Token 갱신 중 오류:", error)
    res.status(500).json({
      success: false,
      message: "서버 오류가 발생했습니다.",
      error: "서버 오류",
    })
  }
}

export async function logout(
  req: Request,
  res: Response<ApiResponse<{ message: string }> | ErrorResponse>
): Promise<void> {
  try {
    // 쿠키에서 refresh token 가져오기
    const refreshToken = req.cookies?.refreshToken

    if (refreshToken) {
      try {
        const payload = verifyRefreshToken(refreshToken)
        if (payload) {
          const dataSource = await lazyLoadDatabase()
          const userRepo = dataSource.getRepository(User)
          const user = await userRepo.findOne({ where: { id: payload.userId } })
          
          if (user) {
            // DB에서 refresh token 해시 제거
            user.refreshTokenHash = null
            await userRepo.save(user)
            logger.info(`로그아웃 - User ID: ${user.id}, refresh token 해시 제거`)
          }
        }
      } catch (error) {
        // refresh token이 유효하지 않아도 로그아웃은 성공으로 처리
        logger.warn("로그아웃 시 refresh token 검증 실패:", error)
      }
    }

    // 쿠키 제거
    res.clearCookie("refreshToken", { 
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
    })

    res.json({
      success: true,
      message: "로그아웃 완료",
      data: { message: "로그아웃이 완료되었습니다." }
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
): Promise<void> => {
  try {
    console.log("🚀 회원가입 요청 시작")
    console.log("📥 요청 IP:", req.ip)
    console.log("📥 User-Agent:", req.get("User-Agent"))

    const {
      email,
      password,
      nickname,
      phone,
      gender,
      birthday,
      recaptchaToken,
    } = req.body

    console.log("📥 요청 데이터:", {
      email,
      nickname,
      phone,
      gender,
      birthday,
      recaptchaToken: recaptchaToken
        ? recaptchaToken.substring(0, 20) + "..."
        : "없음",
    })

    // 필수 입력 검증
    if (!email || !password || !nickname || !recaptchaToken) {
      const missingFields = []
      if (!email) missingFields.push("이메일")
      if (!password) missingFields.push("비밀번호")
      if (!nickname) missingFields.push("닉네임")
      if (!recaptchaToken) missingFields.push("보안 인증")

      console.log("❌ 필수 필드 누락:", {
        email: !!email,
        password: !!password,
        nickname: !!nickname,
        recaptchaToken: !!recaptchaToken,
      })
      res.status(400).json({
        success: false,
        message: `다음 필드를 입력해주세요: ${missingFields.join(", ")}`,
        error: "필수 필드 누락",
      })
      return
    }

    // recaptchaToken이 빈 문자열인 경우 처리
    if (recaptchaToken === "") {
      console.log("❌ reCAPTCHA 토큰이 빈 문자열")
      res.status(400).json({
        success: false,
        message: "보안 인증이 필요합니다. 다시 시도해주세요.",
        error: "reCAPTCHA 토큰 누락",
      })
      return
    }

    console.log("✅ 필수 필드 검증 통과")


    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      console.log("❌ 이메일 형식 오류:", email)
      res.status(400).json({
        success: false,
        message: "올바른 이메일 형식으로 입력해주세요. (예: user@example.com)",
        error: "이메일 형식 오류",
      })
      return
    }
    console.log("✅ 이메일 형식 검증 통과")

    // 비밀번호 강도 검증
    if (password.length < 8) {
      console.log("❌ 비밀번호 강도 부족:", password.length, "자")
      res.status(400).json({
        success: false,
        message: "비밀번호는 최소 8자 이상이어야 합니다.",
        error: "비밀번호 강도 부족",
      })
      return
    }

    // 비밀번호 복잡성 검증 (선택사항)
    const hasUpperCase = /[A-Z]/.test(password)
    const hasLowerCase = /[a-z]/.test(password)
    const hasNumbers = /\d/.test(password)
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)

    if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
      res.status(400).json({
        success: false,
        message: "비밀번호는 영문 대소문자와 숫자를 포함해야 합니다.",
        error: "비밀번호 복잡성 부족",
      })
      return
    }
    console.log("✅ 비밀번호 강도 검증 통과")

    // 닉네임 검증
    if (nickname.length < 2 || nickname.length > 20) {
      console.log("❌ 닉네임 길이 오류:", nickname.length, "자")
      res.status(400).json({
        success: false,
        message: "닉네임은 2-20자 사이로 입력해주세요.",
        error: "닉네임 길이 오류",
      })
      return
    }

    // 닉네임 특수문자 검증
    const nicknameRegex = /^[a-zA-Z0-9가-힣_-]+$/
    if (!nicknameRegex.test(nickname)) {
      res.status(400).json({
        success: false,
        message:
          "닉네임에는 영문, 숫자, 한글, 언더스코어(_), 하이픈(-)만 사용 가능합니다.",
        error: "닉네임 형식 오류",
      })
      return
    }
    console.log("✅ 닉네임 검증 통과")

    // 휴대폰 번호 검증 (선택사항이지만 입력된 경우)
    console.log("🔍 백엔드 휴대폰 번호 검증:", phone)
    if (phone) {
      const phoneRegex = /^(010-\d{4}-\d{4}|(011|016|017|018|019)-\d{3}-\d{4})$/
      const isValid = phoneRegex.test(phone)
      console.log("🔍 휴대폰 번호 정규식 테스트 결과:", isValid)

      if (!isValid) {
        console.log("❌ 휴대폰 번호 형식 오류:", phone)
        res.status(400).json({
          success: false,
          message:
            "올바른 휴대폰 번호 형식을 입력하세요. (010-xxxx-xxxx 또는 011-xxx-xxxx)",
          error: "휴대폰 번호 형식 오류",
        })
        return
      }
      console.log("✅ 휴대폰 번호 검증 통과")
    } else {
      console.log("✅ 휴대폰 번호 빈 값 (선택사항)")
    }

    console.log("🔄 reCAPTCHA 검증 시작")
    // reCAPTCHA 토큰 검증 (토큰 존재 여부 확인)
    if (!recaptchaToken || typeof recaptchaToken !== 'string' || recaptchaToken.trim() === '') {
      console.log("❌ reCAPTCHA 토큰이 없거나 유효하지 않음")
      logger.warn(`회원가입 reCAPTCHA 토큰 누락 - IP: ${req.ip}, Email: ${email}`)
      res.status(400).json({
        success: false,
        message: "보안 인증 토큰이 필요합니다. 페이지를 새로고침하고 다시 시도해주세요.",
        error: "reCAPTCHA 토큰 누락",
      })
      return
    }

    console.log("✅ reCAPTCHA 토큰 수신:", {
      tokenLength: recaptchaToken.length,
      tokenPreview: recaptchaToken.substring(0, 20) + '...',
    })

    // reCAPTCHA 검증 (action: REGISTER)
    const isHuman = await verifyRecaptcha(recaptchaToken, "REGISTER", req)
    if (!isHuman) {
      console.log("❌ reCAPTCHA 검증 실패")
      logger.warn(`회원가입 reCAPTCHA 실패 - IP: ${req.ip}, Email: ${email}`)
      res.status(403).json({
        success: false,
        message: "보안 인증에 실패했습니다. 페이지를 새로고침하고 다시 시도해주세요.",
        error: "reCAPTCHA 검증 실패",
      })
      return
    }
    console.log("✅ reCAPTCHA 검증 통과")

    console.log("🔄 데이터베이스 연결 및 중복 확인 시작")
    const dataSource = await lazyLoadDatabase()
    const userRepo = dataSource.getRepository(User)
    const userLevelRepo = dataSource.getRepository(UserLevel)
    const userStreakRepo = dataSource.getRepository(UserStreak)

    // 이메일 중복 확인
    console.log("🔍 이메일 중복 확인:", email)
    const existingUser = await userRepo.findOne({ where: { email } })
    if (existingUser) {
      // 개발 환경에서 테스트용 이메일은 기존 사용자 삭제 후 재가입 허용
      if (process.env.NODE_ENV === "development" && email === "test@test.com") {
        console.log("🔄 개발 환경에서 테스트 이메일 기존 사용자 삭제:", email)
        await userRepo.remove(existingUser)
        console.log("✅ 기존 테스트 사용자 삭제 완료")
      } else {
        console.log("❌ 이메일 중복 발견:", email)
        res.status(409).json({
          success: false,
          message: "이미 가입된 이메일입니다.",
          error: "이메일 중복",
        })
        return
      }
    }
    console.log("✅ 이메일 중복 없음")

    // 닉네임 중복 확인
    console.log("🔍 닉네임 중복 확인:", nickname)
    const existingNickname = await userRepo.findOne({ where: { nickname } })
    if (existingNickname) {
      // 개발 환경에서 테스트용 닉네임은 기존 사용자 삭제 후 재가입 허용
      if (process.env.NODE_ENV === "development" && nickname === "tset") {
        console.log(
          "🔄 개발 환경에서 테스트 닉네임 기존 사용자 삭제:",
          nickname
        )
        await userRepo.remove(existingNickname)
        console.log("✅ 기존 테스트 사용자 삭제 완료")
      } else {
        console.log("❌ 닉네임 중복 발견:", nickname)
        res.status(409).json({
          success: false,
          message: "이미 사용 중인 닉네임입니다.",
          error: "닉네임 중복",
        })
        return
      }
    }
    console.log("✅ 닉네임 중복 없음")

    console.log("🔄 비밀번호 해싱 시작")
    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, 12)
    console.log("✅ 비밀번호 해싱 완료")

    // 날짜 형식 변환 (ISO 문자열을 Date 객체로 변환)
    console.log("🔄 생년월일 변환 시작:", birthday)
    let birthdayDate: Date | undefined
    if (birthday) {
      try {
        // birthday가 이미 Date 객체인 경우
        if (birthday && typeof birthday === "object" && "getTime" in birthday) {
          birthdayDate = birthday as Date
          console.log("📅 Date 객체로 인식됨")
        } else if (typeof birthday === "string") {
          // ISO 문자열인 경우
          birthdayDate = new Date(birthday)
          console.log("📅 문자열에서 Date 변환:", birthday)
        } else if (typeof birthday === "object" && birthday !== null) {
          // {year, month, day} 형태인 경우
          const { year, month, day } = birthday as any
          console.log("📅 객체 형태 생년월일:", { year, month, day })
          if (year && month && day) {
            birthdayDate = new Date(
              parseInt(year),
              parseInt(month) - 1,
              parseInt(day)
            )
            console.log("📅 객체에서 Date 변환 완료:", birthdayDate)
          }
        }

        // 유효한 날짜인지 확인
        if (!birthdayDate || isNaN(birthdayDate.getTime())) {
          console.log("❌ 유효하지 않은 날짜:", birthdayDate)
          res.status(400).json({
            success: false,
            message: "올바른 생년월일을 입력하세요.",
            error: "날짜 형식 오류",
          })
          return
        }
        console.log("✅ 생년월일 변환 완료:", birthdayDate)
      } catch (error) {
        console.log("❌ 생년월일 변환 오류:", error)
        res.status(400).json({
          success: false,
          message: "올바른 생년월일을 입력하세요.",
          error: "날짜 형식 오류",
        })
        return
      }
    } else {
      console.log("📅 생년월일 없음")
    }

    console.log("🔄 사용자 생성 시작")
    // 사용자 생성
    const newUser = userRepo.create({
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      nickname: nickname.trim(),
      ...(phone?.trim() && { phone: phone.trim() }),
      ...(gender && { gender: gender as "male" | "female" | "other" }),
      ...(birthdayDate && { birthday: birthdayDate }),
      role: "user",
    })

    console.log("📝 사용자 객체 생성 완료:", {
      email: newUser.email,
      nickname: newUser.nickname,
      phone: newUser.phone,
      gender: newUser.gender,
      birthday: newUser.birthday,
      role: newUser.role,
    })

    await userRepo.save(newUser)
    console.log("✅ 사용자 저장 완료 - ID:", newUser.id)

    console.log("🔄 레벨 시스템 초기화 시작")
    // 레벨 시스템 초기화
    const userLevel = userLevelRepo.create({
      userId: newUser.id,
      level: 1,
      currentExp: 0,
      totalExp: 0,
      seasonExp: 0,
    })

    await userLevelRepo.save(userLevel)
    console.log("✅ 레벨 시스템 초기화 완료")

    console.log("🔄 연속 활동 기록 초기화 시작")
    // 연속 활동 기록 초기화
    const userStreak = userStreakRepo.create({
      userId: newUser.id,
      currentCount: 0,
      lastActivity: new Date(),
      streakType: "login",
    })

    await userStreakRepo.save(userStreak)
    console.log("✅ 연속 활동 기록 초기화 완료")

    console.log("🔄 토큰 생성 시작")
    // 토큰 생성
    const { accessToken, refreshToken } = createTokens(newUser.id, newUser.role)
    console.log("✅ 토큰 생성 완료")

    logger.info(`회원가입 성공 - User ID: ${newUser.id}, Email: ${email}`)
    console.log("🎉 회원가입 성공 - 응답 전송 시작")

    const responseData = {
      success: true,
      message: "회원가입 성공",
      accessToken,
      refreshToken,
      user: UserTransformer.toDTO(newUser),
    }

    console.log("📤 응답 데이터:", {
      success: responseData.success,
      message: responseData.message,
      userId: responseData.user.id,
      userEmail: responseData.user.email,
      userNickname: responseData.user.nickname,
    })

    // 쿠키 설정 검증 및 최적화 (login과 동일한 로직)
    const isProduction = process.env.NODE_ENV === "production"
    const isSecure = isProduction || process.env.FORCE_SECURE_COOKIES === "true"
    
    // CORS 설정 확인
    const origin = req.headers.origin
    const isHttps = origin?.startsWith('https://') || req.protocol === 'https'
    
    // sameSite 설정: 프로덕션에서 HTTPS면 "none", 그 외는 "lax"
    const sameSite: "none" | "lax" | "strict" = 
      (isProduction && isSecure && isHttps) ? "none" : "lax"
    
    logger.debug("쿠키 설정 (register)", {
      isProduction,
      isSecure,
      isHttps,
      sameSite,
      origin,
      protocol: req.protocol
    })

    res
      .cookie("refreshToken", refreshToken, {
        httpOnly: true, // XSS 방지
        secure: isSecure, // HTTPS에서만 전송
        sameSite, // CSRF 방지
        path: "/", // 모든 경로에서 사용 가능
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7일
        domain: isProduction ? process.env.COOKIE_DOMAIN : undefined, // 프로덕션에서만 도메인 설정
      })
      .status(201)
      .json(responseData)

    console.log("✅ 회원가입 완료 - 응답 전송 완료")
  } catch (error) {
    console.error("❌ 회원가입 처리 중 오류:", error)
    console.error("❌ 에러 상세:", {
      name: error instanceof Error ? error.name : "Unknown",
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    })

    logger.error("회원가입 처리 중 오류:", error)
    res.status(500).json({
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
): Promise<void> {
  try {
    const { email, recaptchaToken } = req.body
    console.log("아이디 찾기 요청:", { email })

    // 입력 검증
    if (!email || !recaptchaToken) {
      res.status(400).json({
        success: false,
        message: "모든 필드를 입력하세요.",
        error: "필수 필드 누락",
      })
      return
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      res.status(400).json({
        success: false,
        message: "유효한 이메일 주소를 입력하세요.",
        error: "이메일 형식 오류",
      })
      return
    }

    // reCAPTCHA 검증 (action: FIND_ACCOUNT)
    const isHuman = await verifyRecaptcha(recaptchaToken, "FIND_ACCOUNT", req)
    if (!isHuman) {
      logger.warn(
        `reCAPTCHA 실패 (아이디 찾기) - IP: ${req.ip}, Email: ${email}`
      )
      res.status(403).json({
        success: false,
        message: "reCAPTCHA 검증에 실패했습니다.",
        error: "reCAPTCHA 실패",
      })
      return
    }

    // Security info for logging and rate limiting
    const userAgent = req.get("User-Agent")
    const securityInfo: SecurityInfo = {
      ipAddress: req.ip || "unknown",
      ...(userAgent && { userAgent }),
      timestamp: new Date(),
    }

    // Use account recovery service
    const result = await accountRecoveryService.findIdByEmail(
      email,
      securityInfo
    )

    if (!result.success) {
      res.status(404).json({
        success: false,
        message: result.error || "아이디 찾기에 실패했습니다.",
        error: "아이디 찾기 실패",
      })
      return
    }

    logger.info(`아이디 찾기 성공 - Email: ${email}`)

    res.json({
      success: true,
      message: "입력하신 이메일로 아이디 정보를 발송했습니다.",
      data: result.data,
    })
  } catch (error) {
    logger.error("아이디 찾기 처리 중 오류:", error)
    res.status(500).json({
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
): Promise<void> {
  try {
    const { email, recaptchaToken } = req.body
    console.log("비밀번호 찾기 요청:", { email })

    // 입력 검증
    if (!email || !recaptchaToken) {
      res.status(400).json({
        success: false,
        message: "모든 필드를 입력하세요.",
        error: "필수 필드 누락",
      })
      return
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      res.status(400).json({
        success: false,
        message: "유효한 이메일 주소를 입력하세요.",
        error: "이메일 형식 오류",
      })
      return
    }

    // reCAPTCHA 검증 (action: FIND_PASSWORD)
    const isHuman = await verifyRecaptcha(recaptchaToken, "FIND_PASSWORD", req)
    if (!isHuman) {
      logger.warn(
        `reCAPTCHA 실패 (비밀번호 찾기) - IP: ${req.ip}, Email: ${email}`
      )
      res.status(403).json({
        success: false,
        message: "reCAPTCHA 검증에 실패했습니다.",
        error: "reCAPTCHA 실패",
      })
      return
    }

    // Security info for logging and rate limiting
    const userAgent = req.get("User-Agent")
    const securityInfo: SecurityInfo = {
      ipAddress: req.ip || "unknown",
      ...(userAgent && { userAgent }),
      timestamp: new Date(),
    }

    // Use account recovery service
    const result = await accountRecoveryService.findPasswordByEmail(
      email,
      securityInfo
    )

    if (!result.success) {
      res.status(404).json({
        success: false,
        message: result.error || "비밀번호 찾기에 실패했습니다.",
        error: "비밀번호 찾기 실패",
      })
      return
    }

    logger.info(`비밀번호 찾기 성공 - Email: ${email}`)

    res.json({
      success: true,
      message: "입력하신 이메일로 비밀번호 재설정 링크를 발송했습니다.",
      data: result.data,
    })
  } catch (error) {
    logger.error("비밀번호 찾기 처리 중 오류:", error)
    res.status(500).json({
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
): Promise<void> {
  try {
    const { name, phone, recaptchaToken } = req.body
    console.log("아이디 찾기 Step 1 요청:", { name, phone })

    // 입력 검증
    if (!name || !phone || !recaptchaToken) {
      res.status(400).json({
        success: false,
        message: "모든 필드를 입력하세요.",
        error: "필수 필드 누락",
      })
      return
    }

    // reCAPTCHA 검증 (action: FIND_ACCOUNT)
    const isHuman = await verifyRecaptcha(recaptchaToken, "FIND_ACCOUNT", req)
    if (!isHuman) {
      logger.warn(`reCAPTCHA 실패 (아이디 찾기 Step 1) - IP: ${req.ip}`)
      res.status(403).json({
        success: false,
        message: "reCAPTCHA 검증에 실패했습니다.",
        error: "reCAPTCHA 실패",
      })
      return
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
      res.status(400).json({
        success: false,
        message: result.error || "사용자 확인에 실패했습니다.",
        error: "사용자 확인 실패",
      })
      return
    }

    logger.info(`아이디 찾기 Step 1 성공 - Name: ${name}`)

    res.json({
      success: true,
      message: "인증 코드를 이메일로 발송했습니다.",
      data: result.data,
    })
  } catch (error) {
    logger.error("아이디 찾기 Step 1 처리 중 오류:", error)
    res.status(500).json({
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
): Promise<void> {
  try {
    const { email, code, recaptchaToken } = req.body
    console.log("아이디 찾기 Step 2 요청:", { email })

    // 입력 검증
    if (!email || !code || !recaptchaToken) {
      res.status(400).json({
        success: false,
        message: "모든 필드를 입력하세요.",
        error: "필수 필드 누락",
      })
      return
    }

    // reCAPTCHA 검증 (action: FIND_ACCOUNT)
    const isHuman = await verifyRecaptcha(recaptchaToken, "FIND_ACCOUNT", req)
    if (!isHuman) {
      logger.warn(`reCAPTCHA 실패 (아이디 찾기 Step 2) - IP: ${req.ip}`)
      res.status(403).json({
        success: false,
        message: "reCAPTCHA 검증에 실패했습니다.",
        error: "reCAPTCHA 실패",
      })
      return
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
      res.status(400).json({
        success: false,
        message: result.error || "인증 코드 확인에 실패했습니다.",
        error: "인증 코드 확인 실패",
      })
      return
    }

    logger.info(`아이디 찾기 Step 2 성공 - Email: ${email}`)

    res.json({
      success: true,
      message: "아이디 찾기가 완료되었습니다.",
      data: result.data,
    })
  } catch (error) {
    logger.error("아이디 찾기 Step 2 처리 중 오류:", error)
    res.status(500).json({
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
): Promise<void> {
  try {
    const { name, phone, recaptchaToken } = req.body
    console.log("비밀번호 재설정 Step 1 요청:", { name, phone })

    // 입력 검증
    if (!name || !phone || !recaptchaToken) {
      res.status(400).json({
        success: false,
        message: "모든 필드를 입력하세요.",
        error: "필수 필드 누락",
      })
      return
    }

    // reCAPTCHA 검증 (action: FIND_ACCOUNT)
    const isHuman = await verifyRecaptcha(recaptchaToken, "FIND_ACCOUNT", req)
    if (!isHuman) {
      logger.warn(`reCAPTCHA 실패 (비밀번호 재설정 Step 1) - IP: ${req.ip}`)
      res.status(403).json({
        success: false,
        message: "reCAPTCHA 검증에 실패했습니다.",
        error: "reCAPTCHA 실패",
      })
      return
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
      res.status(400).json({
        success: false,
        message: result.error || "사용자 확인에 실패했습니다.",
        error: "사용자 확인 실패",
      })
      return
    }

    logger.info(`비밀번호 재설정 Step 1 성공 - Name: ${name}`)

    res.json({
      success: true,
      message: "인증 코드를 이메일로 발송했습니다.",
      data: result.data,
    })
  } catch (error) {
    logger.error("비밀번호 재설정 Step 1 처리 중 오류:", error)
    res.status(500).json({
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
): Promise<void> {
  try {
    const { email, code, recaptchaToken } = req.body
    console.log("비밀번호 재설정 Step 2 요청:", { email })

    // 입력 검증
    if (!email || !code || !recaptchaToken) {
      res.status(400).json({
        success: false,
        message: "모든 필드를 입력하세요.",
        error: "필수 필드 누락",
      })
      return
    }

    // reCAPTCHA 검증 (action: FIND_ACCOUNT)
    const isHuman = await verifyRecaptcha(recaptchaToken, "FIND_ACCOUNT", req)
    if (!isHuman) {
      logger.warn(`reCAPTCHA 실패 (비밀번호 재설정 Step 2) - IP: ${req.ip}`)
      res.status(403).json({
        success: false,
        message: "reCAPTCHA 검증에 실패했습니다.",
        error: "reCAPTCHA 실패",
      })
      return
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
      res.status(400).json({
        success: false,
        message: result.error || "인증 코드 확인에 실패했습니다.",
        error: "인증 코드 확인 실패",
      })
      return
    }

    logger.info(`비밀번호 재설정 Step 2 성공 - Email: ${email}`)

    res.json({
      success: true,
      message: "비밀번호 재설정 토큰이 생성되었습니다.",
      data: result.data,
    })
  } catch (error) {
    logger.error("비밀번호 재설정 Step 2 처리 중 오류:", error)
    res.status(500).json({
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
): Promise<void> {
  try {
    const { resetToken, newPassword, confirmPassword, recaptchaToken } =
      req.body
    console.log("비밀번호 재설정 Step 3 요청")

    // 입력 검증
    if (!resetToken || !newPassword || !confirmPassword || !recaptchaToken) {
      res.status(400).json({
        success: false,
        message: "모든 필드를 입력하세요.",
        error: "필수 필드 누락",
      })
      return
    }

    // reCAPTCHA 검증 (action: FIND_ACCOUNT)
    const isHuman = await verifyRecaptcha(recaptchaToken, "FIND_ACCOUNT", req)
    if (!isHuman) {
      logger.warn(`reCAPTCHA 실패 (비밀번호 재설정 Step 3) - IP: ${req.ip}`)
      res.status(403).json({
        success: false,
        message: "reCAPTCHA 검증에 실패했습니다.",
        error: "reCAPTCHA 실패",
      })
      return
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
      res.status(400).json({
        success: false,
        message: result.error || "비밀번호 재설정에 실패했습니다.",
        error: "비밀번호 재설정 실패",
      })
      return
    }

    logger.info("비밀번호 재설정 Step 3 성공")

    res.json({
      success: true,
      message: "비밀번호가 성공적으로 재설정되었습니다.",
      data: null
    })
  } catch (error) {
    logger.error("비밀번호 재설정 Step 3 처리 중 오류:", error)
    res.status(500).json({
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
      birthday?: Date | string | null
      recaptchaToken: string
    }
  >,
  res: Response<ApiResponse | ErrorResponse>
): Promise<void> {
  try {
    const { name, phone, gender, birthday, recaptchaToken } = req.body
    console.log("단순 아이디 찾기 요청:", { name, phone, gender, birthday })

    // 입력 검증
    if (!name || !phone || !recaptchaToken) {
      res.status(400).json({
        success: false,
        message: "필수 필드를 모두 입력하세요.",
        error: "필수 필드 누락",
      })
      return
    }

    // reCAPTCHA 검증 (action: FIND_ACCOUNT)
    const isHuman = await verifyRecaptcha(recaptchaToken, "FIND_ACCOUNT", req)
    if (!isHuman) {
      logger.warn(`reCAPTCHA 실패 (단순 아이디 찾기) - IP: ${req.ip}`)
      res.status(403).json({
        success: false,
        message: "reCAPTCHA 검증에 실패했습니다.",
        error: "reCAPTCHA 실패",
      })
      return
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
      birthday ?? null
    )

    if (!result.success) {
      res.status(404).json({
        success: false,
        message:
          result.error || "입력하신 정보와 일치하는 계정을 찾을 수 없습니다.",
        error: "계정 찾기 실패",
      })
      return
    }

    logger.info(`단순 아이디 찾기 성공 - Name: ${name}`)

    res.json({
      success: true,
      message: "아이디 조회 성공",
      data: result.data,
    })
  } catch (error) {
    logger.error("단순 아이디 찾기 처리 중 오류:", error)
    res.status(500).json({
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
      birthday?: Date | string | null
      recaptchaToken: string
    }
  >,
  res: Response<ApiResponse | ErrorResponse>
): Promise<void> {
  try {
    const { username, name, phone, gender, birthday, recaptchaToken } = req.body
    console.log("단순 비밀번호 재설정 Step 1 요청:", {
      username,
      name,
      phone,
      gender,
      birthday,
    })

    // reCAPTCHA 검증 (action: FIND_ACCOUNT 또는 FIND_PASSWORD)
    const recaptchaValid = await verifyRecaptcha(recaptchaToken, "FIND_ACCOUNT", req)
    if (!recaptchaValid) {
      res.status(400).json({
        success: false,
        message: "reCAPTCHA 검증에 실패했습니다.",
        error: "reCAPTCHA 검증 실패",
      })
      return
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
      birthday ?? null
    )

    if (result.success) {
      res.status(200).json({
        success: true,
        message: "사용자 인증이 완료되었습니다. 인증 코드를 확인하세요.",
        data: result.data,
      })
      return
    } else {
      res.status(400).json({
        success: false,
        message: result.error || "사용자 인증에 실패했습니다.",
        error: result.error || "사용자 인증 실패",
      } as ErrorResponse)
      return
    }
  } catch (error) {
    logger.error("단순 비밀번호 재설정 Step 1 처리 중 오류:", error)
    res.status(500).json({
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
): Promise<void> {
  try {
    const { username, code, newPassword, confirmPassword, recaptchaToken } =
      req.body
    console.log("단순 비밀번호 재설정 Step 2 요청:", { username, code })

    // reCAPTCHA 검증 (action: FIND_ACCOUNT 또는 FIND_PASSWORD)
    const recaptchaValid = await verifyRecaptcha(recaptchaToken, "FIND_ACCOUNT", req)
    if (!recaptchaValid) {
      res.status(400).json({
        success: false,
        message: "reCAPTCHA 검증에 실패했습니다.",
        error: "reCAPTCHA 검증 실패",
      })
      return
    }

    // 보안 정보 수집
    const securityInfo: SecurityInfo = {
      ipAddress: req.ip || req.connection.remoteAddress || "unknown",
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
      res.status(200).json({
        success: true,
        message:
          result.data?.message || "비밀번호가 성공적으로 재설정되었습니다.",
        data: result.data,
      })
      return
    } else {
      res.status(400).json({
        success: false,
        message: result.error || "비밀번호 재설정에 실패했습니다.",
        error: result.error || "비밀번호 재설정 실패",
      } as ErrorResponse)
      return
    }
  } catch (error) {
    logger.error("단순 비밀번호 재설정 Step 2 처리 중 오류:", error)
    res.status(500).json({
      success: false,
      message: "서버 오류가 발생했습니다.",
      error: "서버 오류",
    })
  }
}

// 회원정보 수정
export async function updateProfile(
  req: Request<Record<string, never>, Record<string, never>, {
    nickname?: string
    phone?: string
    currentPassword?: string
    newPassword?: string
  }>,
  res: Response<ApiResponse<{ user: any }> | ErrorResponse>
): Promise<void> {
  try {
    const userId = (req.user as any)?.userId

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "인증이 필요합니다.",
        error: "인증 실패",
      })
      return
    }

    const { nickname, phone, currentPassword, newPassword } = req.body

    const dataSource = await lazyLoadDatabase()
    const userRepo = dataSource.getRepository(User)

    const user = await userRepo.findOne({ where: { id: userId } })

    if (!user) {
      res.status(404).json({
        success: false,
        message: "사용자를 찾을 수 없습니다.",
        error: "사용자 없음",
      })
      return
    }

    // 닉네임 업데이트
    if (nickname !== undefined) {
      if (!nickname.trim() || nickname.trim().length < 2 || nickname.trim().length > 20) {
        res.status(400).json({
          success: false,
          message: "닉네임은 2자 이상 20자 이하여야 합니다.",
          error: "유효성 검증 실패",
        })
        return
      }
      user.nickname = nickname.trim()
    }

    // 전화번호 업데이트
    if (phone !== undefined) {
      if (phone && !/^010-\d{4}-\d{4}$/.test(phone)) {
        res.status(400).json({
          success: false,
          message: "전화번호는 010-XXXX-XXXX 형식이어야 합니다.",
          error: "유효성 검증 실패",
        })
        return
      }
      user.phone = phone?.trim() || undefined
    }

    // 비밀번호 변경 (newPassword가 있고 비어있지 않은 경우에만)
    if (newPassword && newPassword.trim()) {
      if (!currentPassword || !currentPassword.trim()) {
        res.status(400).json({
          success: false,
          message: "현재 비밀번호를 입력해주세요.",
          error: "유효성 검증 실패",
        })
        return
      }

      // 현재 비밀번호 확인
      const isPasswordValid = await bcrypt.compare(currentPassword.trim(), user.password)
      if (!isPasswordValid) {
        logger.warn(`회원정보 수정 실패 - 비밀번호 불일치: User ID: ${user.id}`)
        res.status(401).json({
          success: false,
          message: "현재 비밀번호가 일치하지 않습니다.",
          error: "비밀번호 불일치",
        })
        return
      }

      // 새 비밀번호 유효성 검증
      const trimmedNewPassword = newPassword.trim()
      if (trimmedNewPassword.length < 8 || !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(trimmedNewPassword)) {
        res.status(400).json({
          success: false,
          message: "비밀번호는 8자 이상이며 영문 대소문자와 숫자를 포함해야 합니다.",
          error: "유효성 검증 실패",
        })
        return
      }

      // 새 비밀번호 해시화
      const saltRounds = 10
      user.password = await bcrypt.hash(trimmedNewPassword, saltRounds)
      logger.info(`비밀번호 변경 성공 - User ID: ${user.id}`)
    }

    // 업데이트 시간 설정
    user.updatedAt = new Date()

    // 저장
    await userRepo.save(user)

    logger.info(`회원정보 수정 성공 - User ID: ${user.id}`)

    res.json({
      success: true,
      message: "회원정보가 성공적으로 수정되었습니다.",
      data: {
        user: UserTransformer.toDTO(user),
      },
    })
  } catch (error: any) {
    logger.error(`회원정보 수정 실패: ${error.message}`, error)
    res.status(500).json({
      success: false,
      message: "회원정보 수정 중 오류가 발생했습니다.",
      error: error.message || "서버 오류",
    })
  }
}