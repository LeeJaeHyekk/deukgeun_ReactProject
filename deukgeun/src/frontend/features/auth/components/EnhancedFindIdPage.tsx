import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import ReCAPTCHA from "react-google-recaptcha"
import { validation, showToast } from "@shared/lib"
import { useAuthContext } from "@shared/contexts/AuthContext"
import { useAccountRecovery } from "../hooks/useAccountRecovery"
import { AccountRecoveryLayout } from "./AccountRecoveryLayout"
import { ProgressIndicator } from "./ProgressIndicator"
import { CodeInput } from "./CodeInput"
import { config } from "@shared/config"
import styles from "./EnhancedFindIdPage.module.css"

export function EnhancedFindIdPage() {
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [useEnhancedMode, setUseEnhancedMode] = useState(false)

  const navigate = useNavigate()
  const { isLoggedIn } = useAuthContext()
  const { state, findIdByEmail, findIdStep1, findIdStep2, reset, goBack } =
    useAccountRecovery()

  // 로그인된 상태에서 접근 시 메인페이지로 리다이렉트
  useEffect(() => {
    if (isLoggedIn) {
      navigate("/", { replace: true })
    }
  }, [isLoggedIn, navigate])

  // 컴포넌트 마운트 시 아이디 찾기 모드로 초기화
  useEffect(() => {
    reset("find-id")
  }, [reset])

  const validateEmailForm = (): boolean => {
    const newErrors: { [key: string]: string } = {}

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

  const validateEnhancedForm = (): boolean => {
    const newErrors: { [key: string]: string } = {}

    if (!validation.required(name)) {
      newErrors.name = "이름을 입력해주세요."
    }

    if (!validation.required(phone)) {
      newErrors.phone = "전화번호를 입력해주세요."
    } else if (!/^010-\d{4}-\d{4}$/.test(phone)) {
      newErrors.phone =
        "올바른 전화번호 형식을 입력해주세요. (예: 010-1234-5678)"
    }

    if (!recaptchaToken) {
      newErrors.recaptcha = "보안 인증을 완료해주세요."
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleEmailSubmit = async () => {
    if (!validateEmailForm()) return

    await findIdByEmail({
      email: email.trim().toLowerCase(),
      recaptchaToken: recaptchaToken!,
    })
  }

  const handleEnhancedStep1 = async () => {
    if (!validateEnhancedForm()) return

    await findIdStep1({
      name: name.trim(),
      phone: phone.trim(),
      recaptchaToken: recaptchaToken!,
    })
  }

  const handleCodeSubmit = async (code: string) => {
    if (!state.verificationId) return

    await findIdStep2({
      verificationId: state.verificationId,
      verificationCode: code,
    })
  }

  const handleRecaptchaChange = (token: string | null) => {
    const finalToken = import.meta.env.DEV
      ? "dummy-token-for-development"
      : token
    setRecaptchaToken(finalToken)

    if (finalToken && errors.recaptcha) {
      setErrors(prev => ({ ...prev, recaptcha: undefined }))
    }
  }

  const handleModeToggle = () => {
    setUseEnhancedMode(!useEnhancedMode)
    setErrors({})
    setEmail("")
    setName("")
    setPhone("")
    setRecaptchaToken(null)
  }

  // 이미 로그인된 상태라면 로딩 화면 표시
  if (isLoggedIn) {
    return (
      <AccountRecoveryLayout
        title="아이디 찾기"
        description="이미 로그인된 상태입니다."
        showBackButton={false}
      >
        <div style={{ textAlign: "center", color: "#f1f3f5" }}>
          <p>메인페이지로 이동 중...</p>
        </div>
      </AccountRecoveryLayout>
    )
  }

  // 단계별 렌더링
  if (state.step === "code-input") {
    return (
      <AccountRecoveryLayout
        title="인증 코드 입력"
        description="휴대폰으로 발송된 6자리 인증 코드를 입력해주세요."
        onBackClick={goBack}
      >
        <ProgressIndicator
          currentStep={2}
          totalSteps={2}
          stepLabels={["정보 입력", "인증 완료"]}
        />

        <CodeInput
          onComplete={handleCodeSubmit}
          onResend={() => handleEnhancedStep1()}
          disabled={state.loading}
          loading={state.loading}
          error={state.error}
        />
      </AccountRecoveryLayout>
    )
  }

  if (state.step === "result") {
    return (
      <AccountRecoveryLayout
        title="아이디 찾기 완료"
        description="아이디 정보를 확인해주세요."
        onBackClick={() => navigate("/login")}
      >
        <ProgressIndicator
          currentStep={2}
          totalSteps={2}
          stepLabels={["정보 입력", "인증 완료"]}
        />

        <div className={styles.resultContainer}>
          <div className={styles.resultItem}>
            <span className={styles.label}>아이디:</span>
            <span className={styles.value}>abc****</span>
          </div>
          <div className={styles.resultItem}>
            <span className={styles.label}>이메일:</span>
            <span className={styles.value}>a***@example.com</span>
          </div>
        </div>

        <div className={styles.buttonGroup}>
          <button
            onClick={() => navigate("/login")}
            className={styles.primaryButton}
          >
            로그인하기
          </button>
        </div>
      </AccountRecoveryLayout>
    )
  }

  // 초기 화면
  return (
    <AccountRecoveryLayout
      title="아이디 찾기"
      description="가입 시 등록한 정보를 입력하여 아이디를 찾을 수 있습니다."
    >
      <div className={styles.modeToggle}>
        <button
          type="button"
          onClick={handleModeToggle}
          className={styles.toggleButton}
        >
          {useEnhancedMode ? "이메일로 찾기" : "이름+전화번호로 찾기"}
        </button>
      </div>

      {useEnhancedMode ? (
        // 향후 구현될 강화된 모드
        <div className={styles.enhancedForm}>
          <ProgressIndicator
            currentStep={1}
            totalSteps={2}
            stepLabels={["정보 입력", "인증 완료"]}
          />

          <div className={styles.inputGroup}>
            <input
              type="text"
              value={name}
              onChange={e => {
                setName(e.target.value)
                if (errors.name)
                  setErrors(prev => ({ ...prev, name: undefined }))
              }}
              placeholder="이름"
              className={`${styles.input} ${errors.name ? styles.inputError : ""}`}
            />
            {errors.name && (
              <span className={styles.errorText}>{errors.name}</span>
            )}
          </div>

          <div className={styles.inputGroup}>
            <input
              type="tel"
              value={phone}
              onChange={e => {
                setPhone(e.target.value)
                if (errors.phone)
                  setErrors(prev => ({ ...prev, phone: undefined }))
              }}
              placeholder="전화번호 (010-1234-5678)"
              className={`${styles.input} ${errors.phone ? styles.inputError : ""}`}
            />
            {errors.phone && (
              <span className={styles.errorText}>{errors.phone}</span>
            )}
          </div>

          <div className={styles.recaptchaContainer}>
            <ReCAPTCHA
              sitekey={config.RECAPTCHA_SITE_KEY}
              onChange={handleRecaptchaChange}
              className={styles.recaptchaWidget}
            />
            {errors.recaptcha && (
              <span className={styles.errorText}>{errors.recaptcha}</span>
            )}
          </div>

          <button
            onClick={handleEnhancedStep1}
            className={styles.submitButton}
            disabled={state.loading}
          >
            {state.loading ? "처리 중..." : "인증 코드 발송"}
          </button>
        </div>
      ) : (
        // 현재 구현된 이메일 기반 모드
        <div className={styles.emailForm}>
          <div className={styles.inputGroup}>
            <input
              type="email"
              value={email}
              onChange={e => {
                setEmail(e.target.value)
                if (errors.email)
                  setErrors(prev => ({ ...prev, email: undefined }))
              }}
              onKeyDown={e => {
                if (e.key === "Enter" && !state.loading) {
                  e.preventDefault()
                  handleEmailSubmit()
                }
              }}
              placeholder="이메일 주소"
              className={`${styles.input} ${errors.email ? styles.inputError : ""}`}
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
            />
            {errors.recaptcha && (
              <span className={styles.errorText}>{errors.recaptcha}</span>
            )}
          </div>

          <button
            onClick={handleEmailSubmit}
            className={styles.submitButton}
            disabled={state.loading}
          >
            {state.loading ? "처리 중..." : "아이디 찾기"}
          </button>
        </div>
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
    </AccountRecoveryLayout>
  )
}
