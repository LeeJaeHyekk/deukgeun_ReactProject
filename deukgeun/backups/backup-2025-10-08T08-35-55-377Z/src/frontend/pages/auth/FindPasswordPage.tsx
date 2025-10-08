import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { FaArrowLeft } from "react-icons/fa"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { useAuthContext } from "@frontend/shared/contexts/AuthContext"
import { useAccountRecovery } from "@features/auth/hooks/useAccountRecovery"
import { RecaptchaWidget } from "@frontend/shared/components/RecaptchaWidget"
import type {
  ResetPasswordStep1Request,
  ResetPasswordStep2Request,
} from "@features/auth/types/accountRecovery"
import styles from "./FindPasswordPage.module.css"

// 전화번호 포맷팅 유틸리티 함수
function formatPhoneNumber(value: string): string {
  // 숫자만 추출
  const numbers = value.replace(/[^\d]/g, "")

  // 길이에 따라 포맷팅
  if (numbers.length <= 3) {
    return numbers
  } else if (numbers.length <= 7) {
    return `${numbers.slice(0, 3)}-${numbers.slice(3)}`
  } else {
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`
  }
}

export default function FindPasswordPage() {
  const navigate = useNavigate()
  const { isAuthenticated, isLoading } = useAuthContext()
  const { state, resetPasswordSimpleStep1, resetPasswordSimpleStep2, reset } =
    useAccountRecovery()

  // Step 1: 사용자 인증 폼 데이터
  const [step1Data, setStep1Data] = useState({
    username: "",
    name: "",
    phone: "",
    gender: "",
    birthday: "",
  })

  // Step 2: 비밀번호 재설정 폼 데이터
  const [step2Data, setStep2Data] = useState({
    newPassword: "",
    confirmPassword: "",
  })

  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null)
  const [errors, setErrors] = useState<{
    username?: string
    name?: string
    phone?: string
    newPassword?: string
    confirmPassword?: string
    recaptcha?: string
  }>({})

  // 로그인 상태 확인
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate("/")
    }
  }, [isAuthenticated, isLoading, navigate])

  // DatePicker 네비게이션 아이콘 스타일 직접 적용
  useEffect(() => {
    const applyDatePickerStyles = () => {
      const navigationIcons = document.querySelectorAll(
        ".react-datepicker__navigation-icon"
      )
      const previousIcons = document.querySelectorAll(
        ".react-datepicker__navigation-icon--previous"
      )
      const nextIcons = document.querySelectorAll(
        ".react-datepicker__navigation-icon--next"
      )

      navigationIcons.forEach(icon => {
        ;(icon as HTMLElement).style.position = "absolute"
        ;(icon as HTMLElement).style.top = "50%"
        ;(icon as HTMLElement).style.left = "50%"
      })

      previousIcons.forEach(icon => {
        ;(icon as HTMLElement).style.transform =
          "translate(-50%, -50%) rotate(180deg)"
      })

      nextIcons.forEach(icon => {
        ;(icon as HTMLElement).style.transform =
          "translate(-50%, -50%) rotate(0deg)"
      })
    }

    // 초기 적용
    applyDatePickerStyles()

    // MutationObserver로 DatePicker가 동적으로 생성될 때마다 스타일 적용
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.type === "childList") {
          const datepicker = document.querySelector(".react-datepicker")
          if (datepicker) {
            applyDatePickerStyles()
          }
        }
      })
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    })

    return () => observer.disconnect()
  }, [])

  // 전화번호 입력 핸들러
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedPhone = formatPhoneNumber(e.target.value)
    setStep1Data(prev => ({ ...prev, phone: formattedPhone }))
    if (errors.phone) {
      setErrors(prev => ({ ...prev, phone: undefined }))
    }
  }

  // 생년월일 변경 핸들러
  const handleBirthdayChange = (date: Date | null) => {
    if (date) {
      const formattedDate = date.toISOString().split("T")[0]
      setStep1Data(prev => ({ ...prev, birthday: formattedDate }))
    } else {
      setStep1Data(prev => ({ ...prev, birthday: "" }))
    }
  }

  // 생년월일 직접 입력 핸들러
  const handleBirthdayInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    let inputValue = e.target.value.replace(/[^\d]/g, "") // 숫자만 추출

    // 길이에 따라 포맷팅
    if (inputValue.length <= 4) {
      // 4자 이하일 때는 그대로 유지
    } else if (inputValue.length <= 6) {
      inputValue = `${inputValue.slice(0, 4)}-${inputValue.slice(4)}`
    } else {
      inputValue = `${inputValue.slice(0, 4)}-${inputValue.slice(4, 6)}-${inputValue.slice(6, 8)}`
    }

    setStep1Data(prev => ({ ...prev, birthday: inputValue }))
  }

  // reCAPTCHA 변경 핸들러
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
    if (errors.recaptcha) {
      setErrors(prev => ({ ...prev, recaptcha: undefined }))
    }
  }

  // Step 1 검증
  const validateStep1 = () => {
    const newErrors: typeof errors = {}

    if (!step1Data.username.trim()) {
      newErrors.username = "아이디를 입력하세요."
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(step1Data.username)) {
      newErrors.username = "유효한 이메일 주소를 입력하세요."
    }

    if (!step1Data.name.trim()) {
      newErrors.name = "이름을 입력하세요."
    } else if (step1Data.name.trim().length < 2) {
      newErrors.name = "이름은 2자 이상이어야 합니다."
    }

    if (!step1Data.phone.trim()) {
      newErrors.phone = "휴대폰 번호를 입력하세요."
    } else if (
      !/^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/.test(step1Data.phone.replace(/-/g, ""))
    ) {
      newErrors.phone = "유효한 휴대폰 번호를 입력하세요."
    }

    if (!recaptchaToken) {
      newErrors.recaptcha = "reCAPTCHA를 완료해주세요."
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Step 2 검증
  const validateStep2 = () => {
    const newErrors: typeof errors = {}

    if (!step2Data.newPassword) {
      newErrors.newPassword = "새 비밀번호를 입력하세요."
    } else if (step2Data.newPassword.length < 8) {
      newErrors.newPassword = "비밀번호는 최소 8자 이상이어야 합니다."
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(step2Data.newPassword)) {
      newErrors.newPassword =
        "비밀번호는 영문 대소문자와 숫자를 포함해야 합니다."
    }

    if (!step2Data.confirmPassword) {
      newErrors.confirmPassword = "비밀번호 확인을 입력하세요."
    } else if (step2Data.newPassword !== step2Data.confirmPassword) {
      newErrors.confirmPassword = "비밀번호가 일치하지 않습니다."
    }

    if (!recaptchaToken) {
      newErrors.recaptcha = "reCAPTCHA를 완료해주세요."
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Step 1 제출
  const handleStep1Submit = async () => {
    if (!validateStep1()) return

    try {
      await resetPasswordSimpleStep1({
        username: step1Data.username,
        name: step1Data.name,
        phone: step1Data.phone,
        gender: step1Data.gender as "male" | "female" | "other",
        birthday: step1Data.birthday,
        recaptchaToken: recaptchaToken!,
      })
    } catch (error) {
      console.error("Step 1 오류:", error)
    }
  }

  // Step 2 제출
  const handleStep2Submit = async () => {
    if (!validateStep2()) return

    try {
      await resetPasswordSimpleStep2({
        username: step1Data.username,
        code: "000000", // 더미 인증 코드
        newPassword: step2Data.newPassword,
        confirmPassword: step2Data.confirmPassword,
        recaptchaToken: recaptchaToken!,
      })
    } catch (error) {
      console.error("Step 2 오류:", error)
    }
  }

  // 로딩 중이거나 로그인 상태 확인 중
  if (isLoading) {
    return (
      <div className={styles.pageWrapper}>
        <div className={styles.findPasswordBox}>
          <div className={styles.loadingMessage}>로딩 중...</div>
        </div>
      </div>
    )
  }

  // 결과 화면
  if (state.step === "result") {
    return (
      <div className={styles.pageWrapper}>
        <div className={styles.findPasswordBox}>
          <button
            onClick={() => navigate("/login")}
            className={styles.backButton}
            aria-label="뒤로 가기"
          >
            <FaArrowLeft />
          </button>

          <h1 className={styles.title}>비밀번호 재설정 완료</h1>
          <p className={styles.description}>
            비밀번호가 성공적으로 재설정되었습니다.
          </p>

          <div className={styles.resultContainer}>
            <div className={styles.successMessage}>
              <strong>비밀번호 재설정 완료!</strong>
              <br />
              <span className={styles.foundId}>
                새로운 비밀번호로 로그인하실 수 있습니다.
              </span>
            </div>
          </div>

          <div className={styles.linkRow}>
            <button
              onClick={() => reset("reset-password")}
              className={styles.linkBtn}
            >
              다시 시도
            </button>
            <button
              onClick={() => navigate("/login")}
              className={styles.linkBtn}
            >
              로그인으로 돌아가기
            </button>
            <button
              onClick={() => navigate("/find-id")}
              className={styles.linkBtn}
            >
              아이디 찾기
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Step 2: 비밀번호 재설정 화면
  if (state.step === "verification") {
    return (
      <div className={styles.pageWrapper}>
        <div className={styles.findPasswordBox}>
          <button
            onClick={() => reset("reset-password")}
            className={styles.backButton}
            aria-label="뒤로 가기"
          >
            <FaArrowLeft />
          </button>

          <h1 className={styles.title}>비밀번호 재설정</h1>
          <p className={styles.description}>새 비밀번호를 설정하세요.</p>

          {/* 새 비밀번호 입력 */}
          <div className={styles.inputGroup}>
            <input
              type="password"
              value={step2Data.newPassword}
              onChange={e => {
                setStep2Data(prev => ({ ...prev, newPassword: e.target.value }))
                if (errors.newPassword) {
                  setErrors(prev => ({ ...prev, newPassword: undefined }))
                }
              }}
              className={styles.input}
              placeholder="새 비밀번호"
            />
            {errors.newPassword && (
              <span className={styles.errorText}>{errors.newPassword}</span>
            )}
          </div>

          {/* 비밀번호 확인 입력 */}
          <div className={styles.inputGroup}>
            <input
              type="password"
              value={step2Data.confirmPassword}
              onChange={e => {
                setStep2Data(prev => ({
                  ...prev,
                  confirmPassword: e.target.value,
                }))
                if (errors.confirmPassword) {
                  setErrors(prev => ({ ...prev, confirmPassword: undefined }))
                }
              }}
              className={styles.input}
              placeholder="비밀번호 확인"
            />
            {errors.confirmPassword && (
              <span className={styles.errorText}>{errors.confirmPassword}</span>
            )}
          </div>

          {/* reCAPTCHA */}
          <div className={styles.inputGroup}>
            <RecaptchaWidget
              onChange={handleRecaptchaChange}
              className={styles.recaptchaWidget}
            />
            {errors.recaptcha && (
              <span className={styles.errorText}>{errors.recaptcha}</span>
            )}
          </div>

          {state.error && (
            <div className={styles.errorMessage}>{state.error}</div>
          )}

          <button
            onClick={handleStep2Submit}
            className={styles.findButton}
            disabled={state.loading}
          >
            {state.loading ? "처리 중..." : "비밀번호 재설정"}
          </button>
        </div>
      </div>
    )
  }

  // Step 1: 사용자 인증 화면 (기본)
  return (
    <div className={styles.pageWrapper}>
      <div className={styles.findPasswordBox}>
        <button
          onClick={() => navigate("/login")}
          className={styles.backButton}
          aria-label="뒤로 가기"
        >
          <FaArrowLeft />
        </button>

        <h1 className={styles.title}>비밀번호 찾기</h1>
        <p className={styles.description}>가입 시 입력한 정보를 입력하세요.</p>

        {/* 아이디 입력 */}
        <div className={styles.inputGroup}>
          <input
            type="email"
            value={step1Data.username}
            onChange={e => {
              setStep1Data(prev => ({ ...prev, username: e.target.value }))
              if (errors.username) {
                setErrors(prev => ({ ...prev, username: undefined }))
              }
            }}
            className={styles.input}
            placeholder="아이디 (이메일)"
          />
          {errors.username && (
            <span className={styles.errorText}>{errors.username}</span>
          )}
        </div>

        {/* 이름 입력 */}
        <div className={styles.inputGroup}>
          <input
            type="text"
            value={step1Data.name}
            onChange={e => {
              setStep1Data(prev => ({ ...prev, name: e.target.value }))
              if (errors.name) {
                setErrors(prev => ({ ...prev, name: undefined }))
              }
            }}
            className={styles.input}
            placeholder="이름"
          />
          {errors.name && (
            <span className={styles.errorText}>{errors.name}</span>
          )}
        </div>

        {/* 휴대폰 번호 입력 */}
        <div className={styles.inputGroup}>
          <input
            type="tel"
            value={step1Data.phone}
            onChange={handlePhoneChange}
            className={styles.input}
            placeholder="휴대폰 번호 (010-1234-5678)"
            maxLength={13}
          />
          {errors.phone && (
            <span className={styles.errorText}>{errors.phone}</span>
          )}
        </div>

        {/* 성별 선택 */}
        <div className={styles.inputGroup}>
          <select
            value={step1Data.gender}
            onChange={e => {
              setStep1Data(prev => ({ ...prev, gender: e.target.value }))
            }}
            className={styles.input}
          >
            <option value="" disabled>
              성별 선택 (선택사항)
            </option>
            <option value="male">남성</option>
            <option value="female">여성</option>
            <option value="other">기타</option>
          </select>
        </div>

        {/* 생년월일 입력 */}
        <div className={styles.inputGroup}>
          <DatePicker
            selected={step1Data.birthday ? new Date(step1Data.birthday) : null}
            onChange={handleBirthdayChange}
            dateFormat="yyyy-MM-dd"
            placeholderText="생년월일 (선택사항)"
            className={styles.input}
            maxDate={new Date()}
            showYearDropdown
            showMonthDropdown
            dropdownMode="select"
            yearDropdownItemNumber={100}
            scrollableYearDropdown
            isClearable
            customInput={
              <input
                className={styles.input}
                placeholder="생년월일 (선택사항)"
                value={step1Data.birthday}
                onChange={handleBirthdayInputChange}
              />
            }
          />
        </div>

        {/* reCAPTCHA */}
        <div className={styles.inputGroup}>
          <RecaptchaWidget
            onChange={handleRecaptchaChange}
            className={styles.recaptchaWidget}
          />
          {errors.recaptcha && (
            <span className={styles.errorText}>{errors.recaptcha}</span>
          )}
        </div>

        {state.error && (
          <div className={styles.errorMessage}>{state.error}</div>
        )}

        <button
          onClick={handleStep1Submit}
          className={styles.findButton}
          disabled={state.loading}
        >
          {state.loading ? "처리 중..." : "사용자 인증"}
        </button>

        <div className={styles.linkRow}>
          <button onClick={() => navigate("/login")} className={styles.linkBtn}>
            로그인으로 돌아가기
          </button>
          <button
            onClick={() => navigate("/find-id")}
            className={styles.linkBtn}
          >
            아이디 찾기
          </button>
        </div>
      </div>
    </div>
  )
}
