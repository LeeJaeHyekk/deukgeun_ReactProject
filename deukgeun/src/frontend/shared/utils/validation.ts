/**
 * 유효성 검사 유틸리티 함수들
 * 폼 데이터 및 API 응답 검증에 사용
 */

import { isString, isNumber, isBoolean, isObject, isArray, isDefined } from './typeGuards'

// ============================================================================
// 기본 유효성 검사
// ============================================================================

/**
 * 필수 필드 검증
 */
export function validateRequired(value: unknown, fieldName: string): string | null {
  if (!isDefined(value)) {
    return `${fieldName}은(는) 필수입니다.`
  }
  if (isString(value) && value.trim().length === 0) {
    return `${fieldName}은(는) 비어있을 수 없습니다.`
  }
  return null
}

/**
 * 문자열 길이 검증
 */
export function validateStringLength(
  value: unknown,
  minLength: number,
  maxLength: number,
  fieldName: string
): string | null {
  if (!isString(value)) {
    return `${fieldName}은(는) 문자열이어야 합니다.`
  }
  if (value.length < minLength) {
    return `${fieldName}은(는) 최소 ${minLength}자 이상이어야 합니다.`
  }
  if (value.length > maxLength) {
    return `${fieldName}은(는) 최대 ${maxLength}자 이하여야 합니다.`
  }
  return null
}

/**
 * 숫자 범위 검증
 */
export function validateNumberRange(
  value: unknown,
  min: number,
  max: number,
  fieldName: string
): string | null {
  if (!isNumber(value)) {
    return `${fieldName}은(는) 숫자여야 합니다.`
  }
  if (value < min) {
    return `${fieldName}은(는) ${min} 이상이어야 합니다.`
  }
  if (value > max) {
    return `${fieldName}은(는) ${max} 이하여야 합니다.`
  }
  return null
}

/**
 * 이메일 형식 검증
 */
export function validateEmail(value: unknown, fieldName: string = '이메일'): string | null {
  if (!isString(value)) {
    return `${fieldName}은(는) 문자열이어야 합니다.`
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(value)) {
    return `올바른 ${fieldName} 형식이 아닙니다.`
  }
  return null
}

/**
 * 비밀번호 강도 검증
 */
export function validatePassword(value: unknown, fieldName: string = '비밀번호'): string | null {
  if (!isString(value)) {
    return `${fieldName}은(는) 문자열이어야 합니다.`
  }
  if (value.length < 8) {
    return `${fieldName}은(는) 최소 8자 이상이어야 합니다.`
  }
  if (!/(?=.*[a-z])/.test(value)) {
    return `${fieldName}은(는) 소문자를 포함해야 합니다.`
  }
  if (!/(?=.*[A-Z])/.test(value)) {
    return `${fieldName}은(는) 대문자를 포함해야 합니다.`
  }
  if (!/(?=.*\d)/.test(value)) {
    return `${fieldName}은(는) 숫자를 포함해야 합니다.`
  }
  if (!/(?=.*[!@#$%^&*])/.test(value)) {
    return `${fieldName}은(는) 특수문자를 포함해야 합니다.`
  }
  return null
}

/**
 * 전화번호 형식 검증
 */
export function validatePhoneNumber(value: unknown, fieldName: string = '전화번호'): string | null {
  if (!isString(value)) {
    return `${fieldName}은(는) 문자열이어야 합니다.`
  }
  const phoneRegex = /^01[0-9]-?[0-9]{4}-?[0-9]{4}$/
  if (!phoneRegex.test(value.replace(/\s/g, ''))) {
    return `올바른 ${fieldName} 형식이 아닙니다. (예: 010-1234-5678)`
  }
  return null
}

/**
 * URL 형식 검증
 */
export function validateUrl(value: unknown, fieldName: string = 'URL'): string | null {
  if (!isString(value)) {
    return `${fieldName}은(는) 문자열이어야 합니다.`
  }
  try {
    new URL(value)
    return null
  } catch {
    return `올바른 ${fieldName} 형식이 아닙니다.`
  }
}

// ============================================================================
// 객체 유효성 검사
// ============================================================================

/**
 * 객체 필드 검증
 */
export function validateObjectFields<T extends Record<string, unknown>>(
  obj: unknown,
  validators: Partial<Record<keyof T, (value: unknown) => string | null>>
): { isValid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {}
  
  if (!isObject(obj)) {
    return { isValid: false, errors: { root: '객체가 아닙니다.' } }
  }

  for (const [field, validator] of Object.entries(validators)) {
    if (validator) {
      const error = validator(obj[field])
      if (error) {
        errors[field] = error
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

/**
 * 중첩 객체 검증
 */
export function validateNestedObject<T>(
  obj: unknown,
  fieldName: string,
  validator: (value: unknown) => string | null
): string | null {
  if (!isObject(obj)) {
    return `${fieldName}은(는) 객체여야 합니다.`
  }
  return validator(obj[fieldName])
}

// ============================================================================
// 배열 유효성 검사
// ============================================================================

/**
 * 배열 길이 검증
 */
export function validateArrayLength(
  value: unknown,
  minLength: number,
  maxLength: number,
  fieldName: string
): string | null {
  if (!isArray(value)) {
    return `${fieldName}은(는) 배열이어야 합니다.`
  }
  if (value.length < minLength) {
    return `${fieldName}은(는) 최소 ${minLength}개 이상의 항목이 필요합니다.`
  }
  if (value.length > maxLength) {
    return `${fieldName}은(는) 최대 ${maxLength}개 이하의 항목만 허용됩니다.`
  }
  return null
}

/**
 * 배열 요소 검증
 */
export function validateArrayItems<T>(
  value: unknown,
  itemValidator: (item: unknown) => string | null,
  fieldName: string
): string | null {
  if (!isArray(value)) {
    return `${fieldName}은(는) 배열이어야 합니다.`
  }
  
  for (let i = 0; i < value.length; i++) {
    const error = itemValidator(value[i])
    if (error) {
      return `${fieldName}[${i}]: ${error}`
    }
  }
  
  return null
}

// ============================================================================
// 복합 유효성 검사
// ============================================================================

/**
 * 폼 데이터 검증
 */
export function validateFormData<T extends Record<string, unknown>>(
  data: T,
  rules: Partial<Record<keyof T, ValidationRule[]>>
): ValidationResult {
  const errors: Record<string, string> = {}
  
  for (const [field, fieldRules] of Object.entries(rules)) {
    if (!fieldRules) continue
    
    for (const rule of fieldRules) {
      const error = rule(data[field], field)
      if (error) {
        errors[field] = error
        break // 첫 번째 에러만 표시
      }
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

/**
 * API 응답 검증
 */
export function validateApiResponse<T>(
  response: unknown,
  dataValidator?: (data: unknown) => string | null
): { isValid: boolean; data?: T; error?: string } {
  if (!isObject(response)) {
    return { isValid: false, error: '응답이 객체가 아닙니다.' }
  }
  
  if ('success' in response && response.success === false) {
    return { 
      isValid: false, 
      error: isString(response.error) ? response.error : '알 수 없는 오류가 발생했습니다.' 
    }
  }
  
  if ('data' in response) {
    if (dataValidator) {
      const error = dataValidator(response.data)
      if (error) {
        return { isValid: false, error }
      }
    }
    return { isValid: true, data: response.data as T }
  }
  
  return { isValid: false, error: '응답에 데이터가 없습니다.' }
}

// ============================================================================
// 타입 정의
// ============================================================================

export type ValidationRule = (value: unknown, fieldName: string) => string | null

export interface ValidationResult {
  isValid: boolean
  errors: Record<string, string>
}

// ============================================================================
// 미리 정의된 검증 규칙들
// ============================================================================

export const commonValidationRules = {
  required: (value: unknown, fieldName: string) => validateRequired(value, fieldName),
  email: (value: unknown, fieldName: string) => validateEmail(value, fieldName),
  password: (value: unknown, fieldName: string) => validatePassword(value, fieldName),
  phoneNumber: (value: unknown, fieldName: string) => validatePhoneNumber(value, fieldName),
  url: (value: unknown, fieldName: string) => validateUrl(value, fieldName),
  
  // 문자열 길이 규칙들
  name: (value: unknown, fieldName: string) => 
    validateStringLength(value, 2, 50, fieldName),
  title: (value: unknown, fieldName: string) => 
    validateStringLength(value, 1, 100, fieldName),
  description: (value: unknown, fieldName: string) => 
    validateStringLength(value, 0, 500, fieldName),
  
  // 숫자 범위 규칙들
  age: (value: unknown, fieldName: string) => 
    validateNumberRange(value, 1, 120, fieldName),
  rating: (value: unknown, fieldName: string) => 
    validateNumberRange(value, 1, 5, fieldName),
  price: (value: unknown, fieldName: string) => 
    validateNumberRange(value, 0, 1000000, fieldName),
}
