import { validation } from "@shared/lib"

// 폼 필드별 검증 규칙
export const AUTH_VALIDATION_RULES = {
  email: {
    required: (value: string) => validation.required(value),
    format: (value: string) => validation.email(value),
    message: {
      required: "이메일을 입력해주세요.",
      format: "유효한 이메일 주소를 입력해주세요.",
    },
  },
  password: {
    required: (value: string) => validation.required(value),
    minLength: (value: string) => validation.minLength(value, 8),
    complexity: (value: string) => {
      const hasUpperCase = /[A-Z]/.test(value)
      const hasLowerCase = /[a-z]/.test(value)
      const hasNumbers = /\d/.test(value)
      return hasUpperCase && hasLowerCase && hasNumbers
    },
    message: {
      required: "비밀번호를 입력해주세요.",
      minLength: "비밀번호는 최소 8자 이상이어야 합니다.",
      complexity: "비밀번호는 영문 대소문자와 숫자를 포함해야 합니다.",
    },
  },
  confirmPassword: {
    required: (value: string) => validation.required(value),
    match: (value: string, password: string) => value === password,
    message: {
      required: "비밀번호 확인을 입력해주세요.",
      match: "비밀번호가 일치하지 않습니다.",
    },
  },
  nickname: {
    required: (value: string) => validation.required(value),
    minLength: (value: string) => validation.minLength(value, 2),
    maxLength: (value: string) => validation.maxLength(value, 20),
    format: (value: string) => /^[a-zA-Z0-9가-힣_-]+$/.test(value),
    message: {
      required: "닉네임을 입력해주세요.",
      minLength: "닉네임은 최소 2자 이상이어야 합니다.",
      maxLength: "닉네임은 최대 20자까지 가능합니다.",
      format:
        "닉네임에는 영문, 숫자, 한글, 언더스코어(_), 하이픈(-)만 사용 가능합니다.",
    },
  },
  phone: {
    required: (value: string) => validation.required(value),
    format: (value: string) => /^01[0-9]-\d{3,4}-\d{4}$/.test(value),
    message: {
      required: "휴대폰 번호를 입력해주세요.",
      format: "올바른 휴대폰 번호 형식으로 입력해주세요. (예: 010-1234-5678)",
    },
  },
  name: {
    required: (value: string) => validation.required(value),
    message: {
      required: "이름을 입력해주세요.",
    },
  },
  recaptcha: {
    required: (value: string | null) => !!value,
    message: {
      required: "보안 인증을 완료해주세요.",
    },
  },
} as const

// 폼 검증 함수
export function validateFormField(
  fieldName: keyof typeof AUTH_VALIDATION_RULES,
  value: string,
  additionalData?: Record<string, any>
): { isValid: boolean; message: string } {
  const rules = AUTH_VALIDATION_RULES[fieldName]

  // 필수 검증
  if (rules.required && !rules.required(value)) {
    return { isValid: false, message: rules.message.required }
  }

  // 형식 검증
  if (rules.format && !rules.format(value)) {
    return { isValid: false, message: rules.message.format }
  }

  // 길이 검증
  if (rules.minLength && !rules.minLength(value)) {
    return { isValid: false, message: rules.message.minLength }
  }

  if (rules.maxLength && !rules.maxLength(value)) {
    return { isValid: false, message: rules.message.maxLength }
  }

  // 복잡도 검증
  if (rules.complexity && !rules.complexity(value)) {
    return { isValid: false, message: rules.message.complexity }
  }

  // 일치 검증
  if (rules.match && additionalData?.password) {
    if (!rules.match(value, additionalData.password)) {
      return { isValid: false, message: rules.message.match }
    }
  }

  return { isValid: true, message: "" }
}

// 전체 폼 검증
export function validateAuthForm(
  formData: Record<string, any>,
  fields: (keyof typeof AUTH_VALIDATION_RULES)[]
): Record<string, string> {
  const errors: Record<string, string> = {}

  fields.forEach(fieldName => {
    const value = formData[fieldName]
    const result = validateFormField(fieldName, value, formData)

    if (!result.isValid) {
      errors[fieldName] = result.message
    }
  })

  return errors
}

// 실시간 검증을 위한 함수
export function getFieldValidationState(
  fieldName: keyof typeof AUTH_VALIDATION_RULES,
  value: string,
  additionalData?: Record<string, any>
): { isValid: boolean; message: string } {
  if (!value) {
    return { isValid: true, message: "" } // 빈 값은 실시간 검증에서 허용
  }

  return validateFormField(fieldName, value, additionalData)
}
