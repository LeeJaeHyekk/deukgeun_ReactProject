import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { FaArrowLeft } from "react-icons/fa"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { useAccountRecovery } from "@features/auth/hooks/useAccountRecovery"
import { useAuthContext } from "@shared/contexts/AuthContext"
import { RecaptchaWidget } from "@shared/components/RecaptchaWidget"
import { showToast } from "@shared/lib"
import styles from "./FindIdPage.module.css"

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

export default function FindIdPage() {
  const navigate = useNavigate()
  const { isLoggedIn, isLoading } = useAuthContext()
  const { state, findIdSimple, reset } = useAccountRecovery()

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    gender: "",
    birthday: "",
  })
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null)
  const [errors, setErrors] = useState<{
    name?: string
    phone?: string
    recaptcha?: string
  }>({})

  // 로그인된 상태에서 접근 시 메인페이지로 리다이렉트
  useEffect(() => {
    if (isLoggedIn) {
      console.log("🧪 이미 로그인된 상태 - 메인페이지로 리다이렉트")
      navigate("/", { replace: true })
    }
  }, [isLoggedIn, navigate])

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
    setFormData(prev => ({ ...prev, phone: formattedPhone }))
    if (errors.phone) {
      setErrors(prev => ({ ...prev, phone: undefined }))
    }
  }

  // 생년월일 변경 핸들러
  const handleBirthdayChange = (date: Date | null) => {
    if (date) {
      const formattedDate = date.toISOString().split("T")[0]
      setFormData(prev => ({ ...prev, birthday: formattedDate }))
    } else {
      setFormData(prev => ({ ...prev, birthday: "" }))
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

    setFormData(prev => ({ ...prev, birthday: inputValue }))
  }

  const validateForm = (): boolean => {
    const newErrors: { name?: string; phone?: string; recaptcha?: string } = {}

    if (!formData.name.trim()) {
      newErrors.name = "이름을 입력해주세요."
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "휴대폰 번호를 입력해주세요."
    } else if (
      !/^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/.test(formData.phone.replace(/-/g, ""))
    ) {
      newErrors.phone = "유효한 휴대폰 번호를 입력해주세요."
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

    const submitData = {
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      gender: (formData.gender as "male" | "female" | "other") || undefined,
      birthday: formData.birthday || undefined,
      recaptchaToken: recaptchaToken!,
    }

    console.log("🧪 아이디 찾기 요청:", submitData)

    await findIdSimple(submitData)
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

  // 로딩 중일 때 스피너 표시
  if (isLoading) {
    return (
      <div className={styles.pageWrapper}>
        <div className={styles.findIdBox}>
          <div style={{ textAlign: "center", color: "#f1f3f5" }}>
            <p>인증 확인 중...</p>
          </div>
        </div>
      </div>
    )
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

  // 결과 화면
  if (state.step === "result") {
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

          <h1 className={styles.title}>아이디 찾기 완료</h1>
          <p className={styles.description}>
            입력하신 정보로 찾은 아이디입니다.
          </p>

          <div className={styles.resultContainer}>
            <div className={styles.successMessage}>
              <strong>찾은 아이디:</strong>
              <br />
              <span className={styles.foundId}>
                {state.data?.username || "아이디를 찾을 수 없습니다."}
              </span>
            </div>
          </div>

          <div className={styles.linkRow}>
            <button onClick={() => reset("find-id")} className={styles.linkBtn}>
              다시 시도
            </button>
            <button
              onClick={() => navigate("/login")}
              className={styles.linkBtn}
            >
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
          가입 시 입력한 정보로 아이디를 찾을 수 있습니다.
        </p>

        <div className={styles.inputGroup}>
          <input
            type="text"
            value={formData.name}
            onChange={e => {
              setFormData(prev => ({ ...prev, name: e.target.value }))
              if (errors.name) {
                setErrors(prev => ({ ...prev, name: undefined }))
              }
            }}
            onKeyDown={e => {
              if (e.key === "Enter" && !state.loading) {
                e.preventDefault()
                handleFindId()
              }
            }}
            placeholder="이름"
            className={`${styles.input} ${
              errors.name ? styles.inputError : ""
            }`}
          />
          {errors.name && (
            <span className={styles.errorText}>{errors.name}</span>
          )}
        </div>

        <div className={styles.inputGroup}>
          <input
            type="tel"
            value={formData.phone}
            onChange={handlePhoneChange}
            onKeyDown={e => {
              if (e.key === "Enter" && !state.loading) {
                e.preventDefault()
                handleFindId()
              }
            }}
            placeholder="휴대폰 번호 (010-0000-0000)"
            className={`${styles.input} ${
              errors.phone ? styles.inputError : ""
            }`}
            maxLength={13}
          />
          {errors.phone && (
            <span className={styles.errorText}>{errors.phone}</span>
          )}
        </div>

        <div className={styles.inputGroup}>
          <select
            value={formData.gender}
            onChange={e =>
              setFormData(prev => ({ ...prev, gender: e.target.value }))
            }
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

        <div className={styles.inputGroup}>
          <DatePicker
            selected={formData.birthday ? new Date(formData.birthday) : null}
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
                value={formData.birthday}
                onChange={handleBirthdayInputChange}
              />
            }
          />
        </div>

        <div className={styles.recaptchaContainer}>
          <RecaptchaWidget
            onVerify={handleRecaptchaChange}
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

        {state.error && (
          <div className={styles.errorMessage}>{state.error}</div>
        )}

        <button
          onClick={handleFindId}
          className={styles.findButton}
          disabled={state.loading}
          aria-describedby={state.loading ? "loading-description" : undefined}
        >
          {state.loading ? "처리 중..." : "아이디 찾기"}
        </button>
        {state.loading && (
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
