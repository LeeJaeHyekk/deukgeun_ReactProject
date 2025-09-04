import { validation } from "@shared/lib"

// 폼 필드별 검증 규칙
export const AUTH_VALIDATION_RULES = {
  email: {
    required: (value: string) => validation.isRequired(value),
    format: (value: string) => validation.isEmail(value),
    message: {
      required: "이메일을 입력해주세요.",
      format: "유효한 이메일 주소를 입력해주세요.",
    },
  },
  password: {
    required: (value: string) => validation.isRequired(value),
    minLength: (value: string) => {
      // minLength 함수가 없으므로 직접 구현
      return value.length >= 8
    },
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
    required: (value: string) => validation.isRequired(value),
    match: (value: string, password: string) => value === password,
    message: {
      required: "비밀번호 확인을 입력해주세요.",
      match: "비밀번호가 일치하지 않습니다.",
    },
  },
  nickname: {
    required: (value: string) => validation.isRequired(value),
    minLength: (value: string) => {
      // minLength 함수가 없으므로 직접 구현
      return value.length >= 2
    },
    maxLength: (value: string) => {
      // maxLength 함수가 없으므로 직접 구현
      return value.length <= 20
    },
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
    required: (value: string) => validation.isRequired(value),
    format: (value: string) => /^01[0-9]-\d{3,4}-\d{4}$/.test(value),
    message: {
      required: "휴대폰 번호를 입력해주세요.",
      format: "올바른 휴대폰 번호 형식으로 입력해주세요. (예: 010-1234-5678)",
    },
  },
  name: {
    required: (value: string) => validation.isRequired(value),
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

  // 형식 검증 (타입 가드 추가)
  if ("format" in rules && rules.format && !rules.format(value)) {
    return { isValid: false, message: (rules.message as any).format }
  }

  // 길이 검증 (타입 가드 추가)
  if ("minLength" in rules && rules.minLength && !rules.minLength(value)) {
    return { isValid: false, message: (rules.message as any).minLength }
  }

  if ("maxLength" in rules && rules.maxLength && !rules.maxLength(value)) {
    return { isValid: false, message: (rules.message as any).maxLength }
  }

  // 복잡도 검증 (타입 가드 추가)
  if ("complexity" in rules && rules.complexity && !rules.complexity(value)) {
    return { isValid: false, message: (rules.message as any).complexity }
  }

  // 매칭 검증 (타입 가드 추가)
  if ("match" in rules && rules.match && additionalData?.password) {
    if (!rules.match(value, additionalData.password)) {
      return { isValid: false, message: (rules.message as any).match }
    }
  }

  return { isValid: true, message: "" }
}

// 전체 폼 검증 함수
export function validateForm(
  formData: Record<string, string>,
  additionalData?: Record<string, any>
): { isValid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {}

  Object.keys(formData).forEach((fieldName) => {
    if (fieldName in AUTH_VALIDATION_RULES) {
      const validation = validateFormField(
        fieldName as keyof typeof AUTH_VALIDATION_RULES,
        formData[fieldName],
        additionalData
      )
      if (!validation.isValid) {
        errors[fieldName] = validation.message
      }
    }
  })

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

// 특정 필드 검증 함수
export function validateField(
  fieldName: keyof typeof AUTH_VALIDATION_RULES,
  value: string,
  additionalData?: Record<string, any>
): { isValid: boolean; message: string } {
  return validateFormField(fieldName, value, additionalData)
}

// 에러 메시지 포맷팅
export function formatValidationError(
  fieldName: string,
  message: string
): string {
  return `${fieldName}: ${message}`
}

// 검증 규칙 가져오기
export function getValidationRules(fieldName: keyof typeof AUTH_VALIDATION_RULES) {
  return AUTH_VALIDATION_RULES[fieldName]
}

// 검증 메시지 가져오기
export function getValidationMessage(
  fieldName: keyof typeof AUTH_VALIDATION_RULES,
  messageType: keyof typeof AUTH_VALIDATION_RULES[keyof typeof AUTH_VALIDATION_RULES]["message"]
): string {
  const rules = AUTH_VALIDATION_RULES[fieldName]
  return (rules.message as any)[messageType] || ""
}
