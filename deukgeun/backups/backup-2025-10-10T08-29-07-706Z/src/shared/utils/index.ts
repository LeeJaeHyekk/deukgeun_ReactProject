// ============================================================================
// 공유 유틸리티 함수들
// ============================================================================

// 날짜 관련 유틸리티
export * from "./date"

// 문자열 관련 유틸리티 (중복 함수 제외)
export {
  truncate,
  validateEmail,
  toTitleCase,
  generateSlug,
  maskPhone,
  stripHtml,
} from "./string"

// 문자열 유틸리티 별칭
export { toTitleCase as capitalize } from "./string"
export { generateSlug as slugify } from "./string"
export { maskPhone as formatPhoneNumber } from "./string"
export { validatePhone as validatePhoneNumber } from "./string"
export { stripHtml as sanitizeHtml } from "./string"
export { stripHtml as escapeHtml } from "./string"
export { stripHtml as unescapeHtml } from "./string"

// 배열 관련 유틸리티 (중복 함수 제외)
export {
  chunk,
  groupBy,
  sortBy,
  unique,
  shuffle,
  randomElement,
  slice,
} from "./array"

// 배열 유틸리티 별칭
export { randomElement as sample } from "./array"
export { slice as take } from "./array"

// 배열 유틸리티 함수들
export function drop(arr: unknown[], n: number) {
  return arr.slice(n)
}

export function zip(arr1: unknown[], arr2: unknown[]) {
  return arr1.map((item, index) => [item, arr2[index]])
}

export function unzip<T>(arr: T[][]) {
  return arr.reduce((acc, item) => {
    item.forEach((val, index) => {
      if (!acc[index]) acc[index] = []
      acc[index].push(val)
    })
    return acc
  }, [] as T[][])
}

// 객체 관련 유틸리티
export * from "./object"

// 검증 관련 유틸리티 (중복 함수 제외)
export {
  isValidEmail,
  isValidPhone,
  isValidUrl,
  isValidDate,
  validatePasswordStrength,
} from "./validation"

// 검증 유틸리티 별칭
export { isValidEmail as isEmail } from "./validation"
export { validatePasswordStrength as isPassword } from "./validation"
export { isValidPhone as isPhoneNumber } from "./validation"
export { isValidUrl as isUrl } from "./validation"
export { isValidDate as isDate } from "./validation"
export { isValidPhone as isValidPhoneNumber } from "./validation"
export { validatePasswordStrength as isValidPassword } from "./validation"

// 검증 유틸리티 함수들
export function isNickname(nickname: string): boolean {
  return /^[가-힣a-zA-Z0-9]{2,20}$/.test(nickname)
}

export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value)
}

export function isString(value: unknown): value is string {
  return typeof value === 'string'
}

export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean'
}

export function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value)
}

export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true
  if (typeof value === 'string') return value.trim().length === 0
  if (Array.isArray(value)) return value.length === 0
  if (typeof value === 'object') return Object.keys(value).length === 0
  return false
}

export function isNotEmpty(value: unknown): boolean {
  return !isEmpty(value)
}

export function isValidNickname(nickname: string): boolean {
  return /^[가-힣a-zA-Z0-9]{2,20}$/.test(nickname)
}

// 스토리지 관련 유틸리티
export * from "./storage"

// 환경 변수 관련 유틸리티
export * from "./env"
