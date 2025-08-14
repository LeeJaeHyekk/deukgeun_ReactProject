import { useState } from "react"
import { FaEye, FaEyeSlash } from "react-icons/fa"
import ReCAPTCHA from "react-google-recaptcha"
import { validation } from "@shared/lib"
import { config } from "@shared/config"

interface LoginFormProps {
  onSubmit: (
    email: string,
    password: string,
    recaptchaToken: string
  ) => Promise<void>
  loading?: boolean
}

export function LoginForm({ onSubmit, loading = false }: LoginFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<{
    email?: string
    password?: string
    recaptcha?: string
  }>({})

  // 폼 검증
  const validateForm = (): boolean => {
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
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit(email.trim().toLowerCase(), password, recaptchaToken!)
    } catch (error) {
      console.error("Login form submission error:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRecaptchaChange = (token: string | null) => {
    // 개발 환경에서는 더미 토큰 사용
    const finalToken =
      process.env.NODE_ENV === "development"
        ? "dummy-token-for-development"
        : token

    setRecaptchaToken(finalToken)
    // reCAPTCHA 완료 시 해당 에러 초기화
    if (finalToken && errors.recaptcha) {
      setErrors(prev => ({ ...prev, recaptcha: undefined }))
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="email" className="sr-only">
          이메일
        </label>
        <input
          id="email"
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
              handleSubmit(e)
            }
          }}
          placeholder="이메일"
          className={errors.email ? "error" : ""}
          autoComplete="email"
          aria-describedby={errors.email ? "email-error" : undefined}
        />
        {errors.email && (
          <span id="email-error" role="alert">
            {errors.email}
          </span>
        )}
      </div>

      <div>
        <label htmlFor="password" className="sr-only">
          비밀번호
        </label>
        <div>
          <input
            id="password"
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
                handleSubmit(e)
              }
            }}
            placeholder="비밀번호"
            className={errors.password ? "error" : ""}
            autoComplete="current-password"
            aria-describedby={errors.password ? "password-error" : undefined}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>
        {errors.password && (
          <span id="password-error" role="alert">
            {errors.password}
          </span>
        )}
      </div>

      <div>
        <ReCAPTCHA
          sitekey={config.RECAPTCHA_SITE_KEY}
          onChange={handleRecaptchaChange}
          aria-describedby={errors.recaptcha ? "recaptcha-error" : undefined}
        />
        {errors.recaptcha && (
          <span id="recaptcha-error" role="alert">
            {errors.recaptcha}
          </span>
        )}
      </div>

      <button
        type="submit"
        disabled={loading || isSubmitting}
        aria-describedby={
          loading || isSubmitting ? "loading-description" : undefined
        }
      >
        {loading || isSubmitting ? "로그인 중..." : "로그인"}
      </button>
      {(loading || isSubmitting) && (
        <span id="loading-description" className="sr-only">
          로그인 처리 중입니다.
        </span>
      )}
    </form>
  )
}
