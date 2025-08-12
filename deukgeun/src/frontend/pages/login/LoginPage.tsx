import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { FaEye, FaEyeSlash, FaArrowLeft } from "react-icons/fa"
import ReCAPTCHA from "react-google-recaptcha"
import { authApi } from "@features/auth/api/authApi"
import type { LoginRequest } from "../../../types"
import { validation, showToast } from "@shared/lib"
import { useAuthContext } from "@shared/contexts/AuthContext"
import { config } from "@shared/config"

import styles from "./LoginPage.module.css"

export default function LoginPage() {
  console.log("🧪 LoginPage 렌더링 시작")

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null)
  const [errors, setErrors] = useState<{
    email?: string
    password?: string
    recaptcha?: string
  }>({})
  const [error, setError] = useState<string>("")
  const navigate = useNavigate()
  const { login, isLoggedIn } = useAuthContext()

  // 로그인된 상태에서 접근 시 메인페이지로 리다이렉트
  useEffect(() => {
    if (isLoggedIn) {
      console.log("🧪 이미 로그인된 상태 - 메인페이지로 리다이렉트")
      navigate("/", { replace: true })
    }
  }, [isLoggedIn, navigate])

  // 🧪 디버깅용 로그 (기존 코드에 영향 없음)
  console.log("🧪 LoginPage 렌더링")
  console.log("🧪 현재 상태:", {
    email,
    password: password ? "***" : "",
    loading,
    recaptchaToken: recaptchaToken ? "있음" : "없음",
    errors,
    error,
    isLoggedIn,
  })

  // 폼 검증
  const validateForm = (): boolean => {
    console.log("🧪 LoginPage - 폼 검증 시작")

    const newErrors: {
      email?: string
      password?: string
      recaptcha?: string
    } = {}

    if (!validation.required(email)) {
      newErrors.email = "이메일을 입력해주세요."
    } else if (!validation.email(email)) {
      newErrors.email = "유효한 이메일 주소를 입력해주세요."
    }

    if (!validation.required(password)) {
      newErrors.password = "비밀번호를 입력해주세요."
    } else if (!validation.password(password)) {
      newErrors.password = "비밀번호는 최소 8자 이상이어야 합니다."
    }

    if (!recaptchaToken) {
      newErrors.recaptcha = "보안 인증을 완료해주세요."
    }

    setErrors(newErrors)
    const isValid = Object.keys(newErrors).length === 0
    console.log("🧪 LoginPage - 폼 검증 결과:", { isValid, errors: newErrors })
    return isValid
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("🧪 LoginPage - 로그인 폼 제출")

    if (!validateForm()) {
      console.log("🧪 폼 검증 실패")
      return
    }

    console.log("🧪 로그인 시도 시작")
    setLoading(true)
    setError("")

    try {
      const loginData: LoginRequest = {
        email: email.trim().toLowerCase(),
        password,
        recaptchaToken: recaptchaToken!,
      }

      console.log("🧪 로그인 데이터:", { ...loginData, password: "***" })

      const response = await authApi.login(loginData)

      console.log("🧪 로그인 응답:", response)

      if (!response || !response.user) {
        console.log("🧪 로그인 실패: 사용자 정보 없음")
        showToast("로그인에 실패했습니다.", "error")
        setLoading(false)
        return
      }

      // AuthContext의 login 함수 사용 (Zustand + storage 모두 업데이트)
      console.log("🧪 AuthContext login 호출")

      // 백엔드 응답을 새로운 타입 시스템과 호환되도록 변환
      const userWithToken = {
        id: response.user.id,
        email: response.user.email,
        nickname: response.user.nickname,
        accessToken: response.accessToken,
        // 새로운 타입 시스템에서 요구하는 필드들에 기본값 설정
        role: "user" as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      login(userWithToken, response.accessToken)

      console.log("🧪 로그인 성공!")
      showToast("로그인 성공!", "success")

      // 자동 리다이렉트는 App.tsx의 RedirectIfLoggedIn에서 처리
    } catch (error: unknown) {
      console.log("🧪 로그인 에러:", error)
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || "로그인에 실패했습니다."
      setError(errorMessage)
      showToast(errorMessage, "error")
    } finally {
      setLoading(false)
      console.log("🧪 로그인 처리 완료")
    }
  }

  const handleRecaptchaChange = (token: string | null) => {
    // 개발 환경에서는 더미 토큰 사용
    const finalToken = import.meta.env.DEV
      ? "dummy-token-for-development"
      : token

    console.log("🧪 reCAPTCHA 토큰 변경:", {
      originalToken: token,
      finalToken,
    })
    setRecaptchaToken(finalToken)
    // reCAPTCHA 완료 시 해당 에러 초기화
    if (finalToken && errors.recaptcha) {
      setErrors(prev => ({ ...prev, recaptcha: undefined }))
    }
    setError("") // 전체 에러 메시지도 초기화
  }

  // 이미 로그인된 상태라면 로딩 화면 표시
  if (isLoggedIn) {
    return (
      <div className={styles.pageWrapper}>
        <div className={styles.loginBox}>
          <div style={{ textAlign: "center", color: "#f1f3f5" }}>
            <p>이미 로그인된 상태입니다.</p>
            <p>메인페이지로 이동 중...</p>
          </div>
        </div>
      </div>
    )
  }

  console.log("🧪 LoginPage - 렌더링 완료")

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.loginBox}>
        <button
          onClick={() => navigate("/")}
          className={styles.backButton}
          aria-label="뒤로 가기"
        >
          <FaArrowLeft />
        </button>

        <h1 className={styles.logo}>득근 득근</h1>

        <form
          onSubmit={e => {
            e.preventDefault()
            handleLogin(e)
          }}
        >
          <div className={styles.inputGroup}>
            <input
              type="email"
              value={email}
              onChange={e => {
                setEmail(e.target.value)
                if (errors.email) {
                  setErrors(prev => ({ ...prev, email: undefined }))
                }
              }}
              onKeyDown={e => {
                if (e.key === "Enter" && !loading) {
                  e.preventDefault()
                  handleLogin(e)
                }
              }}
              placeholder="이메일"
              className={`${styles.input} ${
                errors.email ? styles.inputError : ""
              }`}
              autoComplete="email"
              aria-describedby={errors.email ? "email-error" : undefined}
            />
            {errors.email && (
              <span id="email-error" className={styles.errorText}>
                {errors.email}
              </span>
            )}
          </div>

          <div className={styles.inputGroup}>
            <div className={styles.passwordWrapper}>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={e => {
                  setPassword(e.target.value)
                  if (errors.password) {
                    setErrors(prev => ({ ...prev, password: undefined }))
                  }
                }}
                onKeyDown={e => {
                  if (e.key === "Enter" && !loading) {
                    e.preventDefault()
                    handleLogin(e)
                  }
                }}
                placeholder="비밀번호"
                className={`${styles.passwordInput} ${
                  errors.password ? styles.inputError : ""
                }`}
                autoComplete="current-password"
                aria-describedby={
                  errors.password ? "password-error" : undefined
                }
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={styles.eyeButton}
                aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errors.password && (
              <span id="password-error" className={styles.errorText}>
                {errors.password}
              </span>
            )}
          </div>

          <div className={styles.recaptchaContainer}>
            <ReCAPTCHA
              sitekey={config.RECAPTCHA_SITE_KEY}
              onChange={handleRecaptchaChange}
              className={styles.recaptchaWidget}
              aria-describedby={
                errors.recaptcha ? "recaptcha-error" : undefined
              }
            />
            {errors.recaptcha && (
              <span id="recaptcha-error" className={styles.errorText}>
                {errors.recaptcha}
              </span>
            )}
          </div>

          <button
            type="submit"
            className={styles.loginButton}
            disabled={loading}
            aria-describedby={loading ? "loading-description" : undefined}
          >
            {loading ? "로그인 중..." : "로그인"}
          </button>
          {loading && (
            <span id="loading-description" className="sr-only">
              로그인 처리 중입니다.
            </span>
          )}
        </form>

        <div className={styles.divider}>또는</div>

        <div className={styles.socialWrapper}>
          <button
            type="button"
            className={styles.kakaoBtn}
            disabled={loading}
            onClick={() => showToast("카카오 로그인은 준비 중입니다.", "info")}
          >
            🟡 카카오로 로그인
          </button>
          <button
            type="button"
            className={styles.googleBtn}
            disabled={loading}
            onClick={() => showToast("Google 로그인은 준비 중입니다.", "info")}
          >
            🔵 Google로 로그인
          </button>
        </div>

        <div className={styles.linkRow}>
          <button
            type="button"
            onClick={() => navigate("/signup")}
            className={styles.linkBtn}
            disabled={loading}
          >
            회원가입
          </button>
          <button
            type="button"
            onClick={() => navigate("/find-id")}
            className={styles.linkBtn}
            disabled={loading}
          >
            아이디 찾기
          </button>
          <button
            type="button"
            onClick={() => navigate("/find-password")}
            className={styles.linkBtn}
            disabled={loading}
          >
            비밀번호 찾기
          </button>
        </div>

        <div className={styles.recaptcha}>
          <p className={styles.recaptchaText}>
            이 사이트는 reCAPTCHA 및 Google 개인정보처리방침과 서비스 약관의
            적용을 받습니다.
          </p>
        </div>
        {error && <p className={styles.errorMessage}>{error}</p>}
      </div>
    </div>
  )
}
