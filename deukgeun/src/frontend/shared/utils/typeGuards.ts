/**
 * 타입 가드 유틸리티 함수들
 * 런타임에서 타입 안전성을 보장하는 함수들
 */

// ============================================================================
// 기본 타입 가드
// ============================================================================

/**
 * 값이 null이 아닌지 확인
 */
export function isNotNull<T>(value: T | null): value is T {
  return value !== null
}

/**
 * 값이 undefined가 아닌지 확인
 */
export function isNotUndefined<T>(value: T | undefined): value is T {
  return value !== undefined
}

/**
 * 값이 null이나 undefined가 아닌지 확인
 */
export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined
}

/**
 * 값이 문자열인지 확인
 */
export function isString(value: unknown): value is string {
  return typeof value === 'string'
}

/**
 * 값이 숫자인지 확인
 */
export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value)
}

/**
 * 값이 불린인지 확인
 */
export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean'
}

/**
 * 값이 객체인지 확인 (null 제외)
 */
export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/**
 * 값이 배열인지 확인
 */
export function isArray<T>(value: unknown): value is T[] {
  return Array.isArray(value)
}

/**
 * 값이 함수인지 확인
 */
export function isFunction(value: unknown): value is (...args: any[]) => any {
  return typeof value === 'function'
}

// ============================================================================
// 고급 타입 가드
// ============================================================================

/**
 * 값이 빈 문자열이 아닌지 확인
 */
export function isNonEmptyString(value: unknown): value is string {
  return isString(value) && value.trim().length > 0
}

/**
 * 값이 양수인지 확인
 */
export function isPositiveNumber(value: unknown): value is number {
  return isNumber(value) && value > 0
}

/**
 * 값이 음수가 아닌지 확인 (0 포함)
 */
export function isNonNegativeNumber(value: unknown): value is number {
  return isNumber(value) && value >= 0
}

/**
 * 값이 정수인지 확인
 */
export function isInteger(value: unknown): value is number {
  return isNumber(value) && Number.isInteger(value)
}

/**
 * 값이 유효한 이메일 형식인지 확인
 */
export function isValidEmail(value: unknown): value is string {
  if (!isString(value)) return false
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(value)
}

/**
 * 값이 유효한 URL인지 확인
 */
export function isValidUrl(value: unknown): value is string {
  if (!isString(value)) return false
  try {
    new URL(value)
    return true
  } catch {
    return false
  }
}

/**
 * 값이 유효한 날짜인지 확인
 */
export function isValidDate(value: unknown): value is Date {
  return value instanceof Date && !isNaN(value.getTime())
}

/**
 * 값이 유효한 날짜 문자열인지 확인
 */
export function isValidDateString(value: unknown): value is string {
  if (!isString(value)) return false
  const date = new Date(value)
  return isValidDate(date) && date.toISOString().startsWith(value.split('T')[0])
}

// ============================================================================
// 객체 타입 가드
// ============================================================================

/**
 * 객체가 특정 키를 가지고 있는지 확인
 */
export function hasKey<K extends string>(
  obj: unknown,
  key: K
): obj is Record<K, unknown> {
  return isObject(obj) && key in obj
}

/**
 * 객체가 모든 필수 키를 가지고 있는지 확인
 */
export function hasAllKeys<K extends string>(
  obj: unknown,
  keys: K[]
): obj is Record<K, unknown> {
  if (!isObject(obj)) return false
  return keys.every(key => key in obj)
}

/**
 * 객체가 특정 키의 값이 특정 타입인지 확인
 */
export function hasKeyOfType<K extends string, T>(
  obj: unknown,
  key: K,
  typeGuard: (value: unknown) => value is T
): obj is Record<K, T> {
  return isObject(obj) && key in obj && typeGuard(obj[key])
}

// ============================================================================
// 배열 타입 가드
// ============================================================================

/**
 * 배열이 비어있지 않은지 확인
 */
export function isNonEmptyArray<T>(value: unknown): value is T[] {
  return isArray(value) && value.length > 0
}

/**
 * 배열의 모든 요소가 특정 타입인지 확인
 */
export function isArrayOfType<T>(
  value: unknown,
  typeGuard: (item: unknown) => item is T
): value is T[] {
  return isArray(value) && value.every(typeGuard)
}

// ============================================================================
// API 응답 타입 가드
// ============================================================================

/**
 * API 응답이 성공적인지 확인
 */
export function isApiSuccess<T>(response: unknown): response is { data: T; success: true } {
  return (
    isObject(response) &&
    'success' in response &&
    response.success === true &&
    'data' in response
  )
}

/**
 * API 응답이 에러인지 확인
 */
export function isApiError(response: unknown): response is { error: string; success: false } {
  return (
    isObject(response) &&
    'success' in response &&
    response.success === false &&
    'error' in response &&
    isString(response.error)
  )
}

// ============================================================================
// React 관련 타입 가드
// ============================================================================

/**
 * 값이 React 노드인지 확인
 */
export function isReactNode(value: unknown): value is React.ReactNode {
  return (
    value === null ||
    value === undefined ||
    isString(value) ||
    isNumber(value) ||
    isBoolean(value) ||
    (isObject(value) && '$$typeof' in value)
  )
}

/**
 * 값이 React 요소인지 확인
 */
export function isReactElement(value: unknown): value is React.ReactElement {
  return (
    isObject(value) &&
    '$$typeof' in value &&
    'type' in value &&
    'props' in value
  )
}

// ============================================================================
// 유틸리티 함수
// ============================================================================

/**
 * 안전한 타입 변환
 */
export function safeCast<T>(
  value: unknown,
  typeGuard: (value: unknown) => value is T,
  fallback: T
): T {
  return typeGuard(value) ? value : fallback
}

/**
 * 안전한 객체 접근
 */
export function safeGet<T>(
  obj: unknown,
  key: string,
  typeGuard: (value: unknown) => value is T,
  fallback: T
): T {
  if (!isObject(obj) || !(key in obj)) return fallback
  return typeGuard(obj[key]) ? obj[key] : fallback
}

/**
 * 안전한 배열 접근
 */
export function safeGetArrayItem<T>(
  arr: unknown,
  index: number,
  typeGuard: (value: unknown) => value is T,
  fallback: T
): T {
  if (!isArray(arr) || index < 0 || index >= arr.length) return fallback
  return typeGuard(arr[index]) ? arr[index] : fallback
}
