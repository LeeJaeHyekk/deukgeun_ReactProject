// ============================================================================
// 검증 관련 유틸리티 함수들
// ============================================================================

// 기본 검증 결과 타입
export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

// 필드 검증 결과 타입
export interface FieldValidationResult {
  field: string
  isValid: boolean
  errors: string[]
}

// 폼 검증 결과 타입
export interface FormValidationResult {
  isValid: boolean
  errors: Record<string, string[]>
  fieldErrors: FieldValidationResult[]
}

// 검증 규칙 타입
export interface ValidationRule {
  type: string
  value?: unknown
  message: string
}

// 필드 검증 스키마 타입
export interface FieldValidationSchema {
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  email?: boolean
  phone?: boolean
  url?: boolean
  number?: boolean
  integer?: boolean
  positive?: boolean
  negative?: boolean
  min?: number
  max?: number
  custom?: (value: unknown) => ValidationResult
}

// 폼 검증 스키마 타입
export interface FormValidationSchema {
  [field: string]: FieldValidationSchema
}

// 문자열 검증
export function validateString(value: unknown, rules: FieldValidationSchema): ValidationResult {
  const errors: string[] = []
  
  // 타입 검증
  if (typeof value !== "string") {
    errors.push("문자열이어야 합니다.")
    return { isValid: false, errors }
  }
  
  const str = value as string
  
  // 필수 검증
  if (rules.required && str.trim().length === 0) {
    errors.push("필수 입력 항목입니다.")
  }
  
  // 길이 검증
  if (rules.minLength && str.length < rules.minLength) {
    errors.push(`최소 ${rules.minLength}자 이상이어야 합니다.`)
  }
  
  if (rules.maxLength && str.length > rules.maxLength) {
    errors.push(`최대 ${rules.maxLength}자까지 가능합니다.`)
  }
  
  // 패턴 검증
  if (rules.pattern && !rules.pattern.test(str)) {
    errors.push("형식이 올바르지 않습니다.")
  }
  
  // 이메일 검증
  if (rules.email && !isValidEmail(str)) {
    errors.push("올바른 이메일 형식이 아닙니다.")
  }
  
  // 전화번호 검증
  if (rules.phone && !isValidPhone(str)) {
    errors.push("올바른 전화번호 형식이 아닙니다.")
  }
  
  // URL 검증
  if (rules.url && !isValidUrl(str)) {
    errors.push("올바른 URL 형식이 아닙니다.")
  }
  
  // 커스텀 검증
  if (rules.custom) {
    const customResult = rules.custom(str)
    if (!customResult.isValid) {
      errors.push(...customResult.errors)
    }
  }
  
  return { isValid: errors.length === 0, errors }
}

// 숫자 검증
export function validateNumber(value: unknown, rules: FieldValidationSchema): ValidationResult {
  const errors: string[] = []
  
  // 타입 검증
  if (typeof value !== "number" && isNaN(Number(value))) {
    errors.push("숫자여야 합니다.")
    return { isValid: false, errors }
  }
  
  const num = Number(value)
  
  // 정수 검증
  if (rules.integer && !Number.isInteger(num)) {
    errors.push("정수여야 합니다.")
  }
  
  // 양수/음수 검증
  if (rules.positive && num <= 0) {
    errors.push("양수여야 합니다.")
  }
  
  if (rules.negative && num >= 0) {
    errors.push("음수여야 합니다.")
  }
  
  // 범위 검증
  if (rules.min !== undefined && num < rules.min) {
    errors.push(`최소 ${rules.min} 이상이어야 합니다.`)
  }
  
  if (rules.max !== undefined && num > rules.max) {
    errors.push(`최대 ${rules.max} 이하여야 합니다.`)
  }
  
  // 커스텀 검증
  if (rules.custom) {
    const customResult = rules.custom(num)
    if (!customResult.isValid) {
      errors.push(...customResult.errors)
    }
  }
  
  return { isValid: errors.length === 0, errors }
}

// 배열 검증
export function validateArray(value: unknown, rules: FieldValidationSchema): ValidationResult {
  const errors: string[] = []
  
  // 타입 검증
  if (!Array.isArray(value)) {
    errors.push("배열이어야 합니다.")
    return { isValid: false, errors }
  }
  
  const arr = value as unknown[]
  
  // 길이 검증
  if (rules.minLength && arr.length < rules.minLength) {
    errors.push(`최소 ${rules.minLength}개 이상이어야 합니다.`)
  }
  
  if (rules.maxLength && arr.length > rules.maxLength) {
    errors.push(`최대 ${rules.maxLength}개까지 가능합니다.`)
  }
  
  // 커스텀 검증
  if (rules.custom) {
    const customResult = rules.custom(arr)
    if (!customResult.isValid) {
      errors.push(...customResult.errors)
    }
  }
  
  return { isValid: errors.length === 0, errors }
}

// 객체 검증
export function validateObject(value: unknown, rules: FieldValidationSchema): ValidationResult {
  const errors: string[] = []
  
  // 타입 검증
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    errors.push("객체여야 합니다.")
    return { isValid: false, errors }
  }
  
  // 커스텀 검증
  if (rules.custom) {
    const customResult = rules.custom(value)
    if (!customResult.isValid) {
      errors.push(...customResult.errors)
    }
  }
  
  return { isValid: errors.length === 0, errors }
}

// 폼 검증
export function validateForm(
  data: Record<string, unknown>,
  schema: FormValidationSchema
): FormValidationResult {
  const errors: Record<string, string[]> = {}
  const fieldErrors: FieldValidationResult[] = []
  let isValid = true
  
  for (const [field, fieldSchema] of Object.entries(schema)) {
    const value = data[field]
    let fieldResult: ValidationResult
    
    // 필드 타입에 따른 검증
    if (fieldSchema.number) {
      fieldResult = validateNumber(value, fieldSchema)
    } else if (fieldSchema.pattern || fieldSchema.email || fieldSchema.phone || fieldSchema.url) {
      fieldResult = validateString(value, fieldSchema)
    } else if (Array.isArray(value)) {
      fieldResult = validateArray(value, fieldSchema)
    } else if (typeof value === "object" && value !== null) {
      fieldResult = validateObject(value, fieldSchema)
    } else {
      fieldResult = validateString(value, fieldSchema)
    }
    
    if (!fieldResult.isValid) {
      isValid = false
      errors[field] = fieldResult.errors
      fieldErrors.push({
        field,
        isValid: false,
        errors: fieldResult.errors
      })
    } else {
      fieldErrors.push({
        field,
        isValid: true,
        errors: []
      })
    }
  }
  
  return { isValid, errors, fieldErrors }
}

// 이메일 유효성 검사
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// 전화번호 유효성 검사
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^(\d{2,3}-\d{3,4}-\d{4}|\d{10,11})$/
  return phoneRegex.test(phone)
}

// URL 유효성 검사
export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

// 비밀번호 강도 검사
export function validatePasswordStrength(password: string): ValidationResult {
  const errors: string[] = []
  
  if (password.length < 8) {
    errors.push("비밀번호는 최소 8자 이상이어야 합니다.")
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push("대문자가 포함되어야 합니다.")
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push("소문자가 포함되어야 합니다.")
  }
  
  if (!/\d/.test(password)) {
    errors.push("숫자가 포함되어야 합니다.")
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push("특수문자가 포함되어야 합니다.")
  }
  
  return { isValid: errors.length === 0, errors }
}

// 비밀번호 확인 검사
export function validatePasswordConfirm(password: string, confirmPassword: string): ValidationResult {
  if (password !== confirmPassword) {
    return { isValid: false, errors: ["비밀번호가 일치하지 않습니다."] }
  }
  return { isValid: true, errors: [] }
}

// 파일 크기 검사
export function validateFileSize(file: File, maxSize: number): ValidationResult {
  if (file.size > maxSize) {
    const maxSizeMB = Math.round(maxSize / (1024 * 1024))
    return { isValid: false, errors: [`파일 크기는 최대 ${maxSizeMB}MB까지 가능합니다.`] }
  }
  return { isValid: true, errors: [] }
}

// 파일 타입 검사
export function validateFileType(file: File, allowedTypes: string[]): ValidationResult {
  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, errors: [`지원하지 않는 파일 형식입니다. (${allowedTypes.join(", ")})`] }
  }
  return { isValid: true, errors: [] }
}

// 날짜 유효성 검사
export function isValidDate(date: unknown): boolean {
  if (date instanceof Date) {
    return !isNaN(date.getTime())
  }
  if (typeof date === "string") {
    const parsed = new Date(date)
    return !isNaN(parsed.getTime())
  }
  return false
}

// 날짜 범위 검사
export function validateDateRange(
  startDate: Date | string,
  endDate: Date | string
): ValidationResult {
  const start = startDate instanceof Date ? startDate : new Date(startDate)
  const end = endDate instanceof Date ? endDate : new Date(endDate)
  
  if (start > end) {
    return { isValid: false, errors: ["시작일은 종료일보다 이전이어야 합니다."] }
  }
  
  return { isValid: true, errors: [] }
}

// 숫자 범위 검사
export function validateNumberRange(value: number, min: number, max: number): ValidationResult {
  if (value < min || value > max) {
    return { isValid: false, errors: [`값은 ${min}에서 ${max} 사이여야 합니다.`] }
  }
  return { isValid: true, errors: [] }
}

// 문자열 길이 검사
export function validateStringLength(str: string, min: number, max: number): ValidationResult {
  if (str.length < min || str.length > max) {
    return { isValid: false, errors: [`길이는 ${min}에서 ${max} 사이여야 합니다.`] }
  }
  return { isValid: true, errors: [] }
}

// 필수 값 검사
export function validateRequired(value: unknown): ValidationResult {
  if (value === null || value === undefined || value === "") {
    return { isValid: false, errors: ["필수 입력 항목입니다."] }
  }
  if (typeof value === "string" && value.trim().length === 0) {
    return { isValid: false, errors: ["필수 입력 항목입니다."] }
  }
  return { isValid: true, errors: [] }
}

// 정규식 패턴 검사
export function validatePattern(value: string, pattern: RegExp, message?: string): ValidationResult {
  if (!pattern.test(value)) {
    return { isValid: false, errors: [message || "형식이 올바르지 않습니다."] }
  }
  return { isValid: true, errors: [] }
}

// 커스텀 검증 함수 생성기
export function createCustomValidator<T>(
  validator: (value: T) => boolean | ValidationResult,
  message?: string
): (value: T) => ValidationResult {
  return (value: T) => {
    const result = validator(value)
    if (typeof result === "boolean") {
      return result ? { isValid: true, errors: [] } : { isValid: false, errors: [message || "유효하지 않은 값입니다."] }
    }
    return result
  }
}

// 검증 결과 병합
export function mergeValidationResults(...results: ValidationResult[]): ValidationResult {
  const allErrors: string[] = []
  let isValid = true
  
  for (const result of results) {
    if (!result.isValid) {
      isValid = false
      allErrors.push(...result.errors)
    }
  }
  
  return { isValid, errors: allErrors }
}

// 검증 에러 메시지 포맷팅
export function formatValidationErrors(errors: Record<string, string[]>): string {
  const messages: string[] = []
  
  for (const [field, fieldErrors] of Object.entries(errors)) {
    if (fieldErrors.length > 0) {
      messages.push(`${field}: ${fieldErrors.join(", ")}`)
    }
  }
  
  return messages.join("\n")
}
