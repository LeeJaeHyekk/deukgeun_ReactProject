import { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  FaEye,
  FaEyeSlash,
  FaUpload,
  FaTimes,
  FaCheck,
  FaExclamationTriangle,
} from "react-icons/fa"
import { authApi } from "@features/auth/api/authApi"
import type { RegisterRequest } from "../../../types"
import { validation, showToast, storage } from "@shared/lib"
import { executeRecaptcha, getDummyRecaptchaToken } from "@shared/lib/recaptcha"
import styles from "./SignUpPage.module.css"
import { GenderSelect } from "./GenderSelect/GenderSelect"
import { BirthdaySelect } from "./BirthDateSelect/BirthDateSelect"

// 타입 정의
interface FormData {
  email: string
  password: string
  confirmPassword: string
  nickname: string
  phone: string
}

interface ValidationState {
  isValid: boolean
  message: string
}

interface ValidationStates {
  email: ValidationState
  password: ValidationState
  confirmPassword: ValidationState
  nickname: ValidationState
  phone: ValidationState
}

interface FormErrors {
  email?: string
  password?: string
  confirmPassword?: string
  nickname?: string
  phone?: string
  gender?: string
  birthday?: string
}

export default function SignUpPage() {
  const navigate = useNavigate()

  // 폼 상태
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    confirmPassword: "",
    nickname: "",
    phone: "",
  })

  // UI 상태
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [profileImage, setProfileImage] = useState<File | null>(null)
  const [gender, setGender] = useState<string>("")
  const [birthday, setBirthday] = useState({ year: "", month: "", day: "" })

  // 실시간 검증 상태
  const [validationStates, setValidationStates] = useState<ValidationStates>({
    email: { isValid: false, message: "" },
    password: { isValid: false, message: "" },
    confirmPassword: { isValid: false, message: "" },
    nickname: { isValid: false, message: "" },
    phone: { isValid: false, message: "" },
  })

  // 에러 상태
  const [errors, setErrors] = useState<FormErrors>({})

  // 실시간 검증 함수
  const validateField = (
    field: keyof FormData,
    value: string
  ): ValidationState => {
    switch (field) {
      case "email":
        if (!value) {
          return { isValid: false, message: "이메일을 입력해주세요." }
        } else if (!validation.email(value)) {
          return {
            isValid: false,
            message: "유효한 이메일 주소를 입력해주세요.",
          }
        } else {
          return { isValid: true, message: "사용 가능한 이메일입니다." }
        }

      case "password":
        if (!value) {
          return { isValid: false, message: "비밀번호를 입력해주세요." }
        } else if (value.length < 8) {
          return {
            isValid: false,
            message: "비밀번호는 최소 8자 이상이어야 합니다.",
          }
        } else if (!/(?=.*[a-zA-Z])(?=.*[0-9])/.test(value)) {
          return { isValid: false, message: "영문과 숫자를 포함해야 합니다." }
        } else {
          return { isValid: true, message: "안전한 비밀번호입니다." }
        }

      case "confirmPassword":
        if (!value) {
          return { isValid: false, message: "비밀번호 확인을 입력해주세요." }
        } else if (value !== formData.password) {
          return { isValid: false, message: "비밀번호가 일치하지 않습니다." }
        } else {
          return { isValid: true, message: "비밀번호가 일치합니다." }
        }

      case "nickname":
        if (!value) {
          return { isValid: false, message: "닉네임을 입력해주세요." }
        } else if (value.length < 2 || value.length > 20) {
          return {
            isValid: false,
            message: "닉네임은 2-20자 사이여야 합니다.",
          }
        } else {
          return { isValid: true, message: "사용 가능한 닉네임입니다." }
        }

      case "phone":
        if (!value) {
          return { isValid: false, message: "휴대폰 번호를 입력해주세요." }
        } else if (!/^010-\d{4}-\d{4}$/.test(value)) {
          return {
            isValid: false,
            message: "올바른 형식으로 입력해주세요. (010-xxxx-xxxx)",
          }
        } else {
          return { isValid: true, message: "올바른 휴대폰 번호입니다." }
        }

      default:
        return { isValid: false, message: "" }
    }
  }

  // 입력값 변경 핸들러
  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))

    // 실시간 검증
    const validation = validateField(field, value)
    setValidationStates(prev => ({
      ...prev,
      [field]: validation,
    }))

    // 에러 메시지 초기화
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  // 이미지 변경 핸들러
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // 파일 크기 검증 (5MB 이하)
      if (file.size > 5 * 1024 * 1024) {
        showToast("파일 크기는 5MB 이하여야 합니다.", "error")
        return
      }

      // 파일 타입 검증
      if (!file.type.startsWith("image/")) {
        showToast("이미지 파일만 업로드 가능합니다.", "error")
        return
      }

      setProfileImage(file)
    }
  }

  // 이미지 제거 핸들러
  const handleRemoveImage = () => {
    setProfileImage(null)
    const fileInput = document.getElementById(
      "profileImage"
    ) as HTMLInputElement
    if (fileInput) {
      fileInput.value = ""
    }
  }

  // 폼 검증 함수
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    // 이메일 검증
    if (!validation.required(formData.email)) {
      newErrors.email = "이메일을 입력해주세요."
    } else if (!validation.email(formData.email)) {
      newErrors.email = "유효한 이메일 주소를 입력해주세요."
    }

    // 비밀번호 검증
    if (!validation.required(formData.password)) {
      newErrors.password = "비밀번호를 입력해주세요."
    } else if (!validation.password(formData.password)) {
      newErrors.password = "비밀번호는 최소 8자 이상이어야 합니다."
    }

    // 비밀번호 확인 검증
    if (!validation.required(formData.confirmPassword)) {
      newErrors.confirmPassword = "비밀번호 확인을 입력해주세요."
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "비밀번호가 일치하지 않습니다."
    }

    // 닉네임 검증
    if (!validation.required(formData.nickname)) {
      newErrors.nickname = "닉네임을 입력해주세요."
    } else if (formData.nickname.length < 2 || formData.nickname.length > 20) {
      newErrors.nickname = "닉네임은 2-20자 사이여야 합니다."
    }

    // 휴대폰 번호 검증 (선택사항이지만 입력된 경우)
    if (formData.phone && !/^010-\d{4}-\d{4}$/.test(formData.phone)) {
      newErrors.phone =
        "올바른 휴대폰 번호 형식을 입력해주세요. (010-xxxx-xxxx)"
    }

    // 성별 검증
    if (!gender) {
      newErrors.gender = "성별을 선택해주세요."
    }

    // 생년월일 검증
    if (!birthday.year || !birthday.month || !birthday.day) {
      newErrors.birthday = "생년월일을 선택해주세요."
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // 회원가입 처리 함수
  const handleSignUp = async () => {
    if (!validateForm()) {
      return
    }

    setLoading(true)
    try {
      // reCAPTCHA 토큰 생성
      let recaptchaToken: string
      try {
        recaptchaToken = await executeRecaptcha("register")
      } catch {
        recaptchaToken = getDummyRecaptchaToken()
      }

      // 생년월일을 Date 객체로 변환
      const birthdayDate =
        birthday.year && birthday.month && birthday.day
          ? new Date(
              parseInt(birthday.year),
              parseInt(birthday.month) - 1,
              parseInt(birthday.day)
            )
          : null

      const registerData: RegisterRequest = {
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        nickname: formData.nickname.trim(),
        phone: formData.phone.trim() || undefined,
        gender: (gender as "male" | "female" | "other") || undefined,
        birthday: birthdayDate || undefined,
        recaptchaToken,
      }

      const response = await authApi.register(registerData)

      // 토큰 저장
      storage.set("accessToken", response.accessToken)
      storage.set("user", response.user)

      showToast("회원가입 성공! 환영합니다!", "success")
      navigate("/")
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "회원가입에 실패했습니다."
      showToast(errorMessage, "error")
    } finally {
      setLoading(false)
    }
  }

  // 취소 처리 함수
  const handleCancel = () => {
    navigate("/login")
  }

  // 입력 필드 렌더링 함수
  const renderInputField = (
    field: keyof FormData,
    type: string,
    placeholder: string,
    autoComplete?: string
  ) => {
    const value = formData[field]
    const error = errors[field]
    const validation = validationStates[field]

    return (
      <div className={styles.inputGroup}>
        <div className={styles.inputWrapper}>
          <input
            type={type}
            value={value}
            onChange={e => handleInputChange(field, e.target.value)}
            placeholder={placeholder}
            className={`${styles.input} ${
              error ? styles.inputError : ""
            } ${validation.isValid ? styles.inputValid : ""}`}
            autoComplete={autoComplete}
            aria-describedby={error ? `${field}-error` : undefined}
          />
          {validation.isValid && <FaCheck className={styles.validIcon} />}
          {error && <FaExclamationTriangle className={styles.errorIcon} />}
        </div>
        {validation.message && (
          <span
            className={`${styles.validationMessage} ${
              validation.isValid
                ? styles.validationSuccess
                : styles.validationError
            }`}
          >
            {validation.message}
          </span>
        )}
        {error && (
          <span id={`${field}-error`} className={styles.errorText}>
            {error}
          </span>
        )}
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>회원가입</h1>
          <p className={styles.subtitle}>
            득근득근과 함께 건강한 변화를 시작하세요
          </p>
        </div>

        <form
          onSubmit={e => {
            e.preventDefault()
            handleSignUp()
          }}
          className={styles.form}
        >
          {/* 이메일 입력 */}
          {renderInputField("email", "email", "이메일 *", "email")}

          {/* 비밀번호 입력 */}
          <div className={styles.inputGroup}>
            <div className={styles.passwordWrapper}>
              <input
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={e => handleInputChange("password", e.target.value)}
                placeholder="비밀번호 * (8자 이상, 영문+숫자)"
                className={`${styles.passwordInput} ${
                  errors.password ? styles.inputError : ""
                } ${validationStates.password.isValid ? styles.inputValid : ""}`}
                autoComplete="new-password"
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
              {validationStates.password.isValid && (
                <FaCheck className={styles.validIcon} />
              )}
              {errors.password && (
                <FaExclamationTriangle className={styles.errorIcon} />
              )}
            </div>
            {validationStates.password.message && (
              <span
                className={`${styles.validationMessage} ${
                  validationStates.password.isValid
                    ? styles.validationSuccess
                    : styles.validationError
                }`}
              >
                {validationStates.password.message}
              </span>
            )}
            {errors.password && (
              <span id="password-error" className={styles.errorText}>
                {errors.password}
              </span>
            )}
          </div>

          {/* 비밀번호 확인 입력 */}
          <div className={styles.inputGroup}>
            <div className={styles.passwordWrapper}>
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={e =>
                  handleInputChange("confirmPassword", e.target.value)
                }
                placeholder="비밀번호 확인 *"
                className={`${styles.passwordInput} ${
                  errors.confirmPassword ? styles.inputError : ""
                } ${validationStates.confirmPassword.isValid ? styles.inputValid : ""}`}
                autoComplete="new-password"
                aria-describedby={
                  errors.confirmPassword ? "confirm-password-error" : undefined
                }
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className={styles.eyeButton}
                aria-label={
                  showConfirmPassword ? "비밀번호 숨기기" : "비밀번호 보기"
                }
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
              {validationStates.confirmPassword.isValid && (
                <FaCheck className={styles.validIcon} />
              )}
              {errors.confirmPassword && (
                <FaExclamationTriangle className={styles.errorIcon} />
              )}
            </div>
            {validationStates.confirmPassword.message && (
              <span
                className={`${styles.validationMessage} ${
                  validationStates.confirmPassword.isValid
                    ? styles.validationSuccess
                    : styles.validationError
                }`}
              >
                {validationStates.confirmPassword.message}
              </span>
            )}
            {errors.confirmPassword && (
              <span id="confirm-password-error" className={styles.errorText}>
                {errors.confirmPassword}
              </span>
            )}
          </div>

          {/* 닉네임 입력 */}
          {renderInputField(
            "nickname",
            "text",
            "닉네임 * (2-20자)",
            "nickname"
          )}

          {/* 휴대폰 번호 입력 */}
          {renderInputField("phone", "tel", "휴대폰 번호 (선택사항)", "tel")}

          {/* 생년월일 선택 */}
          <div className={styles.inputGroup}>
            <BirthdaySelect
              value={birthday}
              onChange={setBirthday}
              error={errors.birthday}
            />
            {errors.birthday && (
              <span className={styles.errorText}>{errors.birthday}</span>
            )}
          </div>

          {/* 성별 선택 */}
          <div className={styles.inputGroup}>
            <GenderSelect
              value={gender}
              onChange={setGender}
              error={errors.gender}
            />
            {errors.gender && (
              <span className={styles.errorText}>{errors.gender}</span>
            )}
          </div>

          {/* 프로필 이미지 선택 */}
          <div className={styles.fileWrapper}>
            <label htmlFor="profileImage" className={styles.fileLabel}>
              <FaUpload /> 프로필 이미지 선택 (선택사항)
            </label>
            <input
              id="profileImage"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className={styles.hiddenFileInput}
            />
            {profileImage && (
              <div className={styles.fileInfo}>
                <span>업로드된 이미지: {profileImage.name}</span>
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className={styles.removeButton}
                  aria-label="이미지 제거"
                >
                  <FaTimes />
                </button>
              </div>
            )}
          </div>

          {/* reCAPTCHA */}
          <div className={styles.recaptcha}>
            <p className={styles.recaptchaText}>
              이 사이트는 reCAPTCHA 및 Google 개인정보처리방침과 서비스 약관의
              적용을 받습니다.
            </p>
          </div>

          {/* 제출 버튼 */}
          <button
            type="submit"
            className={styles.submitButton}
            disabled={loading}
            aria-describedby={loading ? "loading-description" : undefined}
          >
            {loading ? "가입 중..." : "가입하기"}
          </button>
          {loading && (
            <span id="loading-description" className="sr-only">
              회원가입 처리 중입니다.
            </span>
          )}
        </form>

        {/* 취소 버튼 */}
        <button
          type="button"
          onClick={handleCancel}
          className={styles.cancelButton}
          disabled={loading}
        >
          취소
        </button>

        {/* 로그인 링크 */}
        <div className={styles.loginLink}>
          <span>이미 계정이 있으신가요? </span>
          <button
            type="button"
            onClick={() => navigate("/login")}
            className={styles.linkButton}
            disabled={loading}
          >
            로그인하기
          </button>
        </div>
      </div>
    </div>
  )
}
