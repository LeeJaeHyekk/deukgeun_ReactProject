// ============================================================================
// 타입 안정성을 위한 유틸리티 함수들
// ============================================================================

import { 
  isString, 
  isNumber, 
  isBoolean, 
  isObject, 
  isArray,
  isDate,
  isDateString 
} from '../types/guards'

// ============================================================================
// 안전한 객체 접근 함수들
// ============================================================================

/**
 * 안전하게 객체의 속성에 접근합니다
 */
export function safeGet<T>(obj: unknown, path: string, defaultValue: T): T {
  if (!isObject(obj)) return defaultValue
  
  const keys = path.split('.')
  let current: unknown = obj
  
  for (const key of keys) {
    if (!isObject(current) || !(key in current)) {
      return defaultValue
    }
    current = (current as Record<string, unknown>)[key]
  }
  
  return current as T
}

/**
 * 안전하게 배열의 요소에 접근합니다
 */
export function safeGetArrayItem<T>(arr: unknown, index: number, defaultValue: T): T {
  if (!isArray(arr) || index < 0 || index >= arr.length) {
    return defaultValue
  }
  return arr[index] as T
}

/**
 * 안전하게 문자열을 추출합니다
 */
export function safeGetString(obj: unknown, path: string, defaultValue: string = ''): string {
  const value = safeGet(obj, path, defaultValue)
  return isString(value) ? value : defaultValue
}

/**
 * 안전하게 숫자를 추출합니다
 */
export function safeGetNumber(obj: unknown, path: string, defaultValue: number = 0): number {
  const value = safeGet(obj, path, defaultValue)
  return isNumber(value) ? value : defaultValue
}

/**
 * 안전하게 불린 값을 추출합니다
 */
export function safeGetBoolean(obj: unknown, path: string, defaultValue: boolean = false): boolean {
  const value = safeGet(obj, path, defaultValue)
  return isBoolean(value) ? value : defaultValue
}

/**
 * 안전하게 날짜를 추출합니다
 */
export function safeGetDate(obj: unknown, path: string, defaultValue: Date = new Date()): Date {
  const value = safeGet(obj, path, defaultValue)
  
  if (isDate(value)) return value
  if (isDateString(value)) return new Date(value)
  
  return defaultValue
}

// ============================================================================
// 배열 안전 처리 함수들
// ============================================================================

/**
 * 안전하게 배열을 필터링합니다
 */
export function safeFilter<T>(
  arr: unknown, 
  predicate: (item: unknown) => item is T
): T[] {
  if (!isArray(arr)) return []
  return arr.filter(predicate)
}

/**
 * 안전하게 배열을 매핑합니다
 */
export function safeMap<T, U>(
  arr: unknown, 
  mapper: (item: T, index: number) => U,
  itemGuard?: (item: unknown) => item is T
): U[] {
  if (!isArray(arr)) return []
  
  if (itemGuard) {
    return arr.filter(itemGuard).map(mapper)
  }
  
  return arr.map((item, index) => mapper(item as T, index))
}

/**
 * 안전하게 배열의 길이를 가져옵니다
 */
export function safeGetArrayLength(arr: unknown): number {
  return isArray(arr) ? arr.length : 0
}

// ============================================================================
// 객체 안전 처리 함수들
// ============================================================================

/**
 * 안전하게 객체의 키들을 가져옵니다
 */
export function safeGetKeys(obj: unknown): string[] {
  if (!isObject(obj)) return []
  return Object.keys(obj)
}

/**
 * 안전하게 객체의 값들을 가져옵니다
 */
export function safeGetValues<T>(obj: unknown): T[] {
  if (!isObject(obj)) return []
  return Object.values(obj) as T[]
}

/**
 * 안전하게 객체를 병합합니다
 */
export function safeMerge<T extends Record<string, unknown>>(
  target: T, 
  source: unknown
): T {
  if (!isObject(source)) return target
  
  const result = { ...target } as Record<string, unknown>
  const sourceObj = source as Record<string, unknown>
  
  for (const [key, value] of Object.entries(sourceObj)) {
    if (value !== undefined) {
      result[key] = value
    }
  }
  
  return result as T
}

// ============================================================================
// 조건부 안전 처리 함수들
// ============================================================================

/**
 * 조건에 따라 안전하게 값을 반환합니다
 */
export function safeConditional<T>(
  condition: unknown,
  trueValue: T,
  falseValue: T
): T {
  return condition ? trueValue : falseValue
}

/**
 * 안전하게 null/undefined를 체크합니다
 */
export function safeIsNullish(value: unknown): value is null | undefined {
  return value === null || value === undefined
}

/**
 * 안전하게 null/undefined가 아닌지 체크합니다
 */
export function safeIsNotNullish<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined
}

// ============================================================================
// 에러 안전 처리 함수들
// ============================================================================

/**
 * 안전하게 함수를 실행하고 에러를 캐치합니다
 */
export function safeExecute<T>(
  fn: () => T,
  fallback: T,
  onError?: (error: unknown) => void
): T {
  try {
    return fn()
  } catch (error) {
    if (onError) {
      onError(error)
    }
    return fallback
  }
}

/**
 * 안전하게 비동기 함수를 실행하고 에러를 캐치합니다
 */
export async function safeExecuteAsync<T>(
  fn: () => Promise<T>,
  fallback: T,
  onError?: (error: unknown) => void
): Promise<T> {
  try {
    return await fn()
  } catch (error) {
    if (onError) {
      onError(error)
    }
    return fallback
  }
}

// ============================================================================
// 타입 변환 안전 처리 함수들
// ============================================================================

/**
 * 안전하게 문자열로 변환합니다
 */
export function safeToString(value: unknown, defaultValue: string = ''): string {
  if (isString(value)) return value
  if (isNumber(value)) return value.toString()
  if (isBoolean(value)) return value.toString()
  if (value === null) return 'null'
  if (value === undefined) return 'undefined'
  
  try {
    return String(value)
  } catch {
    return defaultValue
  }
}

/**
 * 안전하게 숫자로 변환합니다
 */
export function safeToNumber(value: unknown, defaultValue: number = 0): number {
  if (isNumber(value)) return value
  if (isString(value)) {
    const parsed = parseFloat(value)
    return isNaN(parsed) ? defaultValue : parsed
  }
  if (isBoolean(value)) return value ? 1 : 0
  
  return defaultValue
}

/**
 * 안전하게 불린으로 변환합니다
 */
export function safeToBoolean(value: unknown, defaultValue: boolean = false): boolean {
  if (isBoolean(value)) return value
  if (isString(value)) {
    const lower = value.toLowerCase()
    return lower === 'true' || lower === '1' || lower === 'yes'
  }
  if (isNumber(value)) return value !== 0
  
  return defaultValue
}

// ============================================================================
// 유효성 검사 함수들
// ============================================================================

/**
 * 값이 유효한지 검사합니다
 */
export function isValidValue(value: unknown): boolean {
  return value !== null && value !== undefined
}

/**
 * 문자열이 유효한지 검사합니다
 */
export function isValidString(value: unknown): value is string {
  return isString(value) && value.length > 0
}

/**
 * 숫자가 유효한지 검사합니다
 */
export function isValidNumber(value: unknown): value is number {
  return isNumber(value) && !isNaN(value) && isFinite(value)
}

/**
 * 배열이 유효한지 검사합니다
 */
export function isValidArray<T>(value: unknown, itemGuard?: (item: unknown) => item is T): value is T[] {
  if (!isArray(value)) return false
  if (itemGuard) {
    return value.every(itemGuard)
  }
  return value.length > 0
}

/**
 * 객체가 유효한지 검사합니다
 */
export function isValidObject(value: unknown): value is Record<string, unknown> {
  return isObject(value) && Object.keys(value).length > 0
}
