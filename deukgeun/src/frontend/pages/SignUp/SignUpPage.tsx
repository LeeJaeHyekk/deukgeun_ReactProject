import { useState, useEffect } from "react"
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
import type { RegisterRequest } from "../../../shared/types"
import { validation, showToast, storage } from "@shared/lib"
import { useRecaptchaForRegister } from "@shared/hooks/useRecaptcha"
import {
  SIGNUP_VALIDATION_MESSAGES,
  ERROR_TOAST_TYPES,
} from "@shared/constants/validation"
import { useAuthContext } from "@shared/contexts/AuthContext"
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
  const { isLoggedIn } = useAuthContext()
  const {
    execute: executeRecaptcha,
    isLoading: recaptchaLoading,
    error: recaptchaError,
  } = useRecaptchaForRegister()

  // 로그인된 상태에서 접근 시 메인페이지로 리다이렉트
  useEffect(() => {
    if (isLoggedIn) {
      console.log("🧪 이미 로그인된 상태 - 메인페이지로 리다이렉트")
      navigate("/", { replace: true })
    }
  }, [isLoggedIn, navigate])

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

  // 이미 로그인된 상태라면 로딩 화면 표시
  if (isLoggedIn) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div style={{ textAlign: "center", color: "white" }}>
            <p>이미 로그인된 상태입니다.</p>
            <p>메인페이지로 이동 중...</p>
          </div>
        </div>
      </div>
    )
  }

  // 실시간 검증 함수
  const validateField = (
    field: keyof FormData,
    value: string
  ): ValidationState => {
    console.log(`🔍 실시간 검증 - ${field}:`, value)

    switch (field) {
      case "email":
        if (!value) {
          console.log(`❌ 이메일 빈 값`)
          return { isValid: false, message: "이메일을 입력해주세요." }
        } else if (!validation.email(value)) {
          console.log(`❌ 이메일 형식 오류:`, value)
          return {
            isValid: false,
            message:
              "올바른 이메일 형식으로 입력해주세요. (예: user@example.com)",
          }
        } else {
          console.log(`✅ 이메일 검증 통과`)
          return { isValid: true, message: "사용 가능한 이메일입니다." }
        }

      case "password":
        if (!value) {
          console.log(`❌ 비밀번호 빈 값`)
          return { isValid: false, message: "비밀번호를 입력해주세요." }
        } else if (value.length < 8) {
          console.log(`❌ 비밀번호 길이 부족:`, value.length, "자")
          return {
            isValid: false,
            message: "비밀번호는 최소 8자 이상이어야 합니다.",
          }
        } else if (!/(?=.*[a-zA-Z])(?=.*[0-9])/.test(value)) {
          console.log(`❌ 비밀번호 복잡도 부족`)
          return { isValid: false, message: "영문과 숫자를 포함해야 합니다." }
        } else {
          console.log(`✅ 비밀번호 검증 통과`)
          return { isValid: true, message: "안전한 비밀번호입니다." }
        }

      case "confirmPassword":
        if (!value) {
          console.log(`❌ 비밀번호 확인 빈 값`)
          return { isValid: false, message: "비밀번호 확인을 입력해주세요." }
        } else if (value !== formData.password) {
          console.log(`❌ 비밀번호 불일치`)
          return { isValid: false, message: "비밀번호가 일치하지 않습니다." }
        } else {
          console.log(`✅ 비밀번호 확인 검증 통과`)
          return { isValid: true, message: "비밀번호가 일치합니다." }
        }

      case "nickname":
        if (!value) {
          console.log(`❌ 닉네임 빈 값`)
          return { isValid: false, message: "닉네임을 입력해주세요." }
        } else if (value.length < 2 || value.length > 20) {
          console.log(`❌ 닉네임 길이 오류:`, value.length, "자")
          return {
            isValid: false,
            message: "닉네임은 2-20자 사이로 입력해주세요.",
          }
        } else if (!/^[a-zA-Z0-9가-힣_-]+$/.test(value)) {
          console.log(`❌ 닉네임 형식 오류:`, value)
          return {
            isValid: false,
            message:
              "닉네임에는 영문, 숫자, 한글, 언더스코어(_), 하이픈(-)만 사용 가능합니다.",
          }
        } else {
          console.log(`✅ 닉네임 검증 통과`)
          return { isValid: true, message: "사용 가능한 닉네임입니다." }
        }

      case "phone":
        if (!value) {
          console.log(`✅ 휴대폰 번호 빈 값 (선택사항)`)
          return { isValid: true, message: "" }
        } else if (
          !/^(010-\d{4}-\d{4}|(011|016|017|018|019)-\d{3}-\d{4})$/.test(value)
        ) {
          console.log(`❌ 휴대폰 번호 형식 오류:`, value)
          return {
            isValid: false,
            message:
              "올바른 형식으로 입력해주세요. (010-xxxx-xxxx 또는 011-xxx-xxxx)",
          }
        } else {
          console.log(`✅ 휴대폰 번호 검증 통과`)
          return { isValid: true, message: "올바른 휴대폰 번호입니다." }
        }

      default:
        console.log(`❌ 알 수 없는 필드:`, field)
        return { isValid: false, message: "" }
    }
  }

  // 전화번호 형식 변환 함수
  const formatPhoneNumber = (value: string): string => {
    console.log("📞 전화번호 형식 변환 시작:", value)

    // 숫자만 추출
    const numbers = value.replace(/[^\d]/g, "")
    console.log("📞 숫자만 추출:", numbers)

    // 3자리까지는 자유롭게 입력 허용
    if (numbers.length <= 3) {
      console.log("📞 3자리 이하, 자유 입력 허용:", numbers)
      return numbers
    }

    // 3자리 이후부터는 유효한 휴대폰 번호 형식인지 확인
    const validPrefixes = ["010", "011", "016", "017", "018", "019"]
    const prefix = numbers.slice(0, 3)

    if (!validPrefixes.includes(prefix)) {
      console.log("📞 유효하지 않은 휴대폰 번호 접두사:", prefix)
      return numbers.slice(0, 3) // 3자리까지만 유지
    }

    console.log("📞 유효한 휴대폰 번호 접두사:", prefix)

    let formatted = ""

    // 휴대폰 번호 형식에 따른 분기 처리
    if (prefix === "010") {
      console.log("📞 010 형식 처리 시작")
      // 010: 010-xxxx-xxxx (11자리)
      if (numbers.length <= 7) {
        formatted = `${numbers.slice(0, 3)}-${numbers.slice(3)}`
        console.log("📞 010 형식 - 첫 번째 하이픈 추가:", formatted)
      } else {
        formatted = `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`
        console.log("📞 010 형식 - 두 번째 하이픈 추가:", formatted)
      }
    } else {
      console.log("📞 기타 형식 처리 시작 (011, 016, 017, 018, 019)")
      // 011, 016, 017, 018, 019: 011-xxx-xxxx (10자리)
      if (numbers.length <= 6) {
        formatted = `${numbers.slice(0, 3)}-${numbers.slice(3)}`
        console.log("📞 기타 형식 - 첫 번째 하이픈 추가:", formatted)
      } else {
        formatted = `${numbers.slice(0, 3)}-${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`
        console.log("📞 기타 형식 - 두 번째 하이픈 추가:", formatted)
      }
    }

    console.log("📞 형식 변환 결과:", formatted)
    return formatted
  }

  // 전화번호 입력 핸들러
  const handlePhoneChange = (value: string) => {
    console.log("📞 전화번호 입력 핸들러 호출:", value)

    // 최대 13자까지만 허용 (010-xxxx-xxxx 형식)
    if (value.length > 13) {
      console.log("📞 최대 길이 초과, 입력 무시")
      return
    }

    const formattedValue = formatPhoneNumber(value)
    console.log("📞 형식 변환된 값:", formattedValue)

    setFormData(prev => ({ ...prev, phone: formattedValue }))

    // 실시간 검증
    console.log("🔍 전화번호 실시간 검증 시작")
    const validation = validateField("phone", formattedValue)
    console.log("🔍 전화번호 실시간 검증 결과:", validation)

    setValidationStates(prev => ({
      ...prev,
      phone: validation,
    }))

    // 에러 메시지 초기화
    if (errors.phone) {
      console.log("🧹 전화번호 에러 메시지 초기화")
      setErrors(prev => ({ ...prev, phone: undefined }))
    }
  }

  // 전화번호 키보드 이벤트 핸들러
  const handlePhoneKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    console.log("📞 전화번호 키보드 이벤트:", e.key)

    // 숫자, 백스페이스, 삭제, 탭, 화살표 키만 허용
    const allowedKeys = [
      "0",
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "Backspace",
      "Delete",
      "Tab",
      "ArrowLeft",
      "ArrowRight",
      "ArrowUp",
      "ArrowDown",
    ]

    if (!allowedKeys.includes(e.key)) {
      console.log("📞 허용되지 않은 키 입력 무시:", e.key)
      e.preventDefault()
    }
  }

  // 입력값 변경 핸들러
  const handleInputChange = (field: keyof FormData, value: string) => {
    console.log(`📝 입력값 변경 - ${field}:`, value)

    setFormData(prev => ({ ...prev, [field]: value }))

    // 실시간 검증
    console.log(`🔍 실시간 검증 시작 - ${field}`)
    const validation = validateField(field, value)
    console.log(`🔍 실시간 검증 결과 - ${field}:`, validation)

    setValidationStates(prev => ({
      ...prev,
      [field]: validation,
    }))

    // 에러 메시지 초기화
    if (errors[field]) {
      console.log(`🧹 에러 메시지 초기화 - ${field}`)
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  // 이미지 변경 핸들러
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log("🖼️ 이미지 변경 핸들러 호출")
    const file = event.target.files?.[0]

    if (file) {
      console.log("📁 선택된 파일:", {
        name: file.name,
        size: file.size,
        type: file.type,
      })

      // 파일 크기 검증 (5MB 이하)
      if (file.size > 5 * 1024 * 1024) {
        console.log("❌ 파일 크기 초과:", file.size, "bytes")
        showToast("파일 크기는 5MB 이하여야 합니다.", "error")
        return
      }
      console.log("✅ 파일 크기 검증 통과")

      // 파일 타입 검증
      if (!file.type.startsWith("image/")) {
        console.log("❌ 이미지 파일이 아님:", file.type)
        showToast("이미지 파일만 업로드 가능합니다.", "error")
        return
      }
      console.log("✅ 파일 타입 검증 통과")

      console.log("✅ 이미지 파일 설정 완료")
      setProfileImage(file)
    } else {
      console.log("📁 파일이 선택되지 않음")
    }
  }

  // 이미지 제거 핸들러
  const handleRemoveImage = () => {
    console.log("🗑️ 이미지 제거 핸들러 호출")
    setProfileImage(null)
    const fileInput = document.getElementById(
      "profileImage"
    ) as HTMLInputElement
    if (fileInput) {
      fileInput.value = ""
      console.log("✅ 파일 입력 필드 초기화 완료")
    } else {
      console.log("⚠️ 파일 입력 필드를 찾을 수 없음")
    }
    console.log("✅ 이미지 제거 완료")
  }

  // 폼 검증 함수
  const validateForm = (): boolean => {
    console.log("🔍 폼 검증 시작")
    const newErrors: FormErrors = {}

    // 이메일 검증
    console.log("🔍 이메일 검증:", formData.email)
    if (!validation.required(formData.email)) {
      newErrors.email = "이메일을 입력해주세요."
      console.log("❌ 이메일 필수 입력 오류")
    } else if (!validation.email(formData.email)) {
      newErrors.email =
        "올바른 이메일 형식으로 입력해주세요. (예: user@example.com)"
      console.log("❌ 이메일 형식 오류")
    } else {
      console.log("✅ 이메일 검증 통과")
    }

    // 비밀번호 검증
    console.log("🔍 비밀번호 검증:", formData.password ? "입력됨" : "입력안됨")
    if (!validation.required(formData.password)) {
      newErrors.password = "비밀번호를 입력해주세요."
      console.log("❌ 비밀번호 필수 입력 오류")
    } else if (!validation.password(formData.password)) {
      newErrors.password = "비밀번호는 최소 8자 이상이어야 합니다."
      console.log("❌ 비밀번호 형식 오류")
    } else {
      console.log("✅ 비밀번호 검증 통과")
    }

    // 비밀번호 확인 검증
    console.log("🔍 비밀번호 확인 검증")
    if (!validation.required(formData.confirmPassword)) {
      newErrors.confirmPassword = "비밀번호 확인을 입력해주세요."
      console.log("❌ 비밀번호 확인 필수 입력 오류")
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "비밀번호가 일치하지 않습니다."
      console.log("❌ 비밀번호 불일치 오류")
    } else {
      console.log("✅ 비밀번호 확인 검증 통과")
    }

    // 닉네임 검증
    console.log("🔍 닉네임 검증:", formData.nickname)
    if (!validation.required(formData.nickname)) {
      newErrors.nickname = "닉네임을 입력해주세요."
      console.log("❌ 닉네임 필수 입력 오류")
    } else if (formData.nickname.length < 2 || formData.nickname.length > 20) {
      newErrors.nickname = "닉네임은 2-20자 사이로 입력해주세요."
      console.log("❌ 닉네임 길이 오류:", formData.nickname.length, "자")
    } else if (!/^[a-zA-Z0-9가-힣_-]+$/.test(formData.nickname)) {
      newErrors.nickname =
        "닉네임에는 영문, 숫자, 한글, 언더스코어(_), 하이픈(-)만 사용 가능합니다."
      console.log("❌ 닉네임 형식 오류")
    } else {
      console.log("✅ 닉네임 검증 통과")
    }

    // 휴대폰 번호 검증 (선택사항이지만 입력된 경우)
    console.log("🔍 휴대폰 번호 검증:", formData.phone)
    if (
      formData.phone &&
      !/^(010-\d{4}-\d{4}|(011|016|017|018|019)-\d{3}-\d{4})$/.test(
        formData.phone
      )
    ) {
      newErrors.phone =
        "올바른 휴대폰 번호 형식을 입력해주세요. (010-xxxx-xxxx 또는 011-xxx-xxxx)"
      console.log("❌ 휴대폰 번호 형식 오류")
    } else if (formData.phone) {
      console.log("✅ 휴대폰 번호 검증 통과")
    } else {
      console.log("✅ 휴대폰 번호 빈 값 (선택사항)")
    }

    // 성별 검증
    console.log("🔍 성별 검증:", gender)
    if (!gender) {
      newErrors.gender = "성별을 선택해주세요."
      console.log("❌ 성별 선택 오류")
    } else if (!["male", "female", "other"].includes(gender)) {
      newErrors.gender = "유효한 성별을 선택해주세요."
      console.log("❌ 성별 값 오류:", gender)
    } else {
      console.log("✅ 성별 검증 통과")
    }

    // 생년월일 검증
    console.log("🔍 생년월일 검증:", birthday)
    if (!birthday.year || !birthday.month || !birthday.day) {
      newErrors.birthday = "생년월일을 선택해주세요."
      console.log("❌ 생년월일 선택 오류")
    } else {
      console.log("✅ 생년월일 검증 통과")
    }

    console.log("📋 검증 결과:", {
      errorCount: Object.keys(newErrors).length,
      errors: Object.keys(newErrors),
    })

    setErrors(newErrors)
    const isValid = Object.keys(newErrors).length === 0
    console.log("🔍 최종 검증 결과:", isValid ? "통과" : "실패")
    return isValid
  }

  // 회원가입 처리 함수
  const handleSignUp = async () => {
    console.log("🚀 회원가입 시작")

    if (!validateForm()) {
      console.log("❌ 폼 검증 실패")
      return
    }

    console.log("✅ 폼 검증 통과")
    setLoading(true)

    try {
      console.log("🔄 reCAPTCHA 토큰 생성 시작")
      // reCAPTCHA 토큰 생성
      const recaptchaToken = await executeRecaptcha()
      console.log(
        "✅ reCAPTCHA 토큰 생성 성공:",
        recaptchaToken ? recaptchaToken.substring(0, 20) + "..." : "토큰 없음"
      )

      console.log("🔄 생년월일 변환 시작")
      // 생년월일을 Date 객체로 변환
      const birthdayDate =
        birthday.year && birthday.month && birthday.day
          ? new Date(
              parseInt(birthday.year),
              parseInt(birthday.month) - 1,
              parseInt(birthday.day)
            )
          : null

      console.log("📅 생년월일 변환 결과:", birthdayDate)

      const registerData: RegisterRequest = {
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        nickname: formData.nickname.trim(),
        phone: formData.phone.trim() || undefined,
        gender: (gender as "male" | "female" | "other") || undefined,
        birthday: birthdayDate
          ? birthdayDate.toISOString().split("T")[0]
          : undefined,
        recaptchaToken,
      }

      console.log("📤 회원가입 데이터 준비 완료:", {
        email: registerData.email,
        nickname: registerData.nickname,
        phone: registerData.phone,
        gender: registerData.gender,
        birthday: registerData.birthday,
        recaptchaToken: registerData.recaptchaToken
          ? registerData.recaptchaToken.substring(0, 20) + "..."
          : "없음",
      })

      console.log("🔄 API 호출 시작")
      const response = await authApi.register(registerData)
      console.log("✅ API 응답 성공:", response)

      console.log("🔄 토큰 저장 시작")
      // 토큰 저장
      storage.set("accessToken", response.accessToken)
      storage.set("user", response.user)
      console.log("✅ 토큰 저장 완료")

      showToast(SIGNUP_VALIDATION_MESSAGES.SUCCESS, "success")
      console.log("🎉 회원가입 완료 - 메인페이지로 이동")
      navigate("/")
    } catch (error: unknown) {
      console.error("❌ 회원가입 실패:", error)
      console.error("❌ 에러 상세:", {
        name: error instanceof Error ? error.name : "Unknown",
        message: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      })

      let errorMessage = "회원가입에 실패했습니다. 다시 시도해주세요."
      let errorType: "error" | "warning" = "error"

      if (error instanceof Error) {
        errorMessage = error.message

        // 특정 에러 메시지에 따라 토스트 타입 변경
        if (
          errorMessage.includes("이미 가입된") ||
          errorMessage.includes("이미 사용 중인")
        ) {
          errorType = ERROR_TOAST_TYPES.DUPLICATE
        } else if (
          errorMessage.includes("입력 정보") ||
          errorMessage.includes("형식")
        ) {
          errorType = ERROR_TOAST_TYPES.VALIDATION
        }
      } else if (
        typeof error === "object" &&
        error !== null &&
        "response" in error
      ) {
        const axiosError = error as any
        if (axiosError.response?.data?.message) {
          errorMessage = axiosError.response.data.message
        } else if (axiosError.response?.data?.error) {
          errorMessage = axiosError.response.data.error
        }

        // HTTP 상태 코드에 따라 토스트 타입 변경
        if (axiosError.response?.status === 409) {
          errorType = ERROR_TOAST_TYPES.DUPLICATE
        } else if (axiosError.response?.status === 400) {
          errorType = ERROR_TOAST_TYPES.VALIDATION
        }
      }

      showToast(errorMessage, errorType)
    } finally {
      console.log("🏁 회원가입 프로세스 종료")
      setLoading(false)
    }
  }

  // 취소 처리 함수
  const handleCancel = () => {
    console.log("❌ 회원가입 취소 - 로그인 페이지로 이동")
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
          <div className={styles.inputGroup}>
            <div className={styles.inputWrapper}>
              <input
                type="tel"
                value={formData.phone}
                onChange={e => handlePhoneChange(e.target.value)}
                onKeyDown={handlePhoneKeyDown}
                placeholder="휴대폰 번호 (선택사항) - 010-xxxx-xxxx 또는 011-xxx-xxxx"
                className={`${styles.input} ${
                  errors.phone ? styles.inputError : ""
                } ${validationStates.phone.isValid ? styles.inputValid : ""}`}
                autoComplete="tel"
                aria-describedby={errors.phone ? "phone-error" : undefined}
                maxLength={13}
                inputMode="numeric"
              />
              {validationStates.phone.isValid && (
                <FaCheck className={styles.validIcon} />
              )}
              {errors.phone && (
                <FaExclamationTriangle className={styles.errorIcon} />
              )}
            </div>
            {validationStates.phone.message && (
              <span
                className={`${styles.validationMessage} ${
                  validationStates.phone.isValid
                    ? styles.validationSuccess
                    : styles.validationError
                }`}
              >
                {validationStates.phone.message}
              </span>
            )}
            {errors.phone && (
              <span id="phone-error" className={styles.errorText}>
                {errors.phone}
              </span>
            )}
          </div>

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
