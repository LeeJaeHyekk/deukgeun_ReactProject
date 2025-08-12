import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { FaArrowLeft } from "react-icons/fa"
import ReCAPTCHA from "react-google-recaptcha"
import { validation, showToast } from "@shared/lib"
import { useAuthContext } from "@shared/contexts/AuthContext"
import { authApi } from "@features/auth/api/authApi"
import { config } from "@shared/config"
import styles from "./FindIdPage.module.css"

export default function FindIdPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null)
  const [errors, setErrors] = useState<{ email?: string; recaptcha?: string }>(
    {}
  )
  const navigate = useNavigate()
  const { isLoggedIn } = useAuthContext()

  // 로그인된 상태에서 접근 시 메인페이지로 리다이렉트
  useEffect(() => {
    if (isLoggedIn) {
      console.log("🧪 이미 로그인된 상태 - 메인페이지로 리다이렉트")
      navigate("/", { replace: true })
    }
  }, [isLoggedIn, navigate])

  const validateForm = (): boolean => {
    const newErrors: { email?: string; recaptcha?: string } = {}

    if (!validation.required(email)) {
      newErrors.email = "이메일을 입력해주세요."
    } else if (!validation.email(email)) {
      newErrors.email = "유효한 이메일 주소를 입력해주세요."
    }

    if (!recaptchaToken) {
      newErrors.recaptcha = "보안 인증을 완료해주세요."
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleFindId = async () => {
    if (!validateForm()) {
      return
    }

    setLoading(true)
    try {
      const findIdData = {
        email: email.trim().toLowerCase(),
        recaptchaToken: recaptchaToken!,
      }

      console.log("🧪 아이디 찾기 요청:", findIdData)

      const response = await authApi.findId(findIdData)

      console.log("🧪 아이디 찾기 응답:", response)

      if (response.success) {
        showToast(response.message, "success")
        navigate("/login")
      } else {
        showToast(response.message || "아이디 찾기에 실패했습니다.", "error")
      }
    } catch (error: any) {
      console.log("🧪 아이디 찾기 에러:", error)
      const errorMessage =
        error.response?.data?.message || "아이디 찾기에 실패했습니다."
      showToast(errorMessage, "error")
    } finally {
      setLoading(false)
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
  }

  // 이미 로그인된 상태라면 로딩 화면 표시
  if (isLoggedIn) {
    return (
      <div className={styles.pageWrapper}>
        <div className={styles.findIdBox}>
          <div style={{ textAlign: "center", color: "#f1f3f5" }}>
            <p>이미 로그인된 상태입니다.</p>
            <p>메인페이지로 이동 중...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.findIdBox}>
        <button
          onClick={() => navigate("/login")}
          className={styles.backButton}
          aria-label="뒤로 가기"
        >
          <FaArrowLeft />
        </button>

        <h1 className={styles.title}>아이디 찾기</h1>
        <p className={styles.description}>
          가입 시 등록한 이메일 주소를 입력하시면
          <br />
          해당 이메일로 아이디 정보를 발송해드립니다.
        </p>

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
                handleFindId()
              }
            }}
            placeholder="이메일 주소"
            className={`${styles.input} ${
              errors.email ? styles.inputError : ""
            }`}
          />
          {errors.email && (
            <span className={styles.errorText}>{errors.email}</span>
          )}
        </div>

        <div className={styles.recaptchaContainer}>
          <ReCAPTCHA
            sitekey={config.RECAPTCHA_SITE_KEY}
            onChange={handleRecaptchaChange}
            className={styles.recaptchaWidget}
            aria-describedby={errors.recaptcha ? "recaptcha-error" : undefined}
          />
          {errors.recaptcha && (
            <span id="recaptcha-error" className={styles.errorText}>
              {errors.recaptcha}
            </span>
          )}
        </div>

        <button
          onClick={handleFindId}
          className={styles.findButton}
          disabled={loading}
          aria-describedby={loading ? "loading-description" : undefined}
        >
          {loading ? "처리 중..." : "아이디 찾기"}
        </button>
        {loading && (
          <span id="loading-description" className="sr-only">
            아이디 찾기 처리 중입니다.
          </span>
        )}

        <div className={styles.linkRow}>
          <button onClick={() => navigate("/login")} className={styles.linkBtn}>
            로그인으로 돌아가기
          </button>
          <button
            onClick={() => navigate("/find-password")}
            className={styles.linkBtn}
          >
            비밀번호 찾기
          </button>
        </div>
      </div>
    </div>
  )
}
