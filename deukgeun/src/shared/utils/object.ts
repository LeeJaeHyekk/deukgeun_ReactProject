// ============================================================================
// 객체 관련 유틸리티 함수들
// ============================================================================

// 객체가 비어있는지 확인
export function isEmpty(obj: Record<string, unknown>): boolean {
  return Object.keys(obj).length === 0
}

// 객체가 유효한지 확인
export function isValidObject(obj: unknown): obj is Record<string, unknown> {
  return obj !== null && typeof obj === "object" && !Array.isArray(obj)
}

// 객체의 깊은 복사
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== "object") return obj
  if (obj instanceof Date) return new Date(obj.getTime()) as T
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as T
  if (typeof obj === "object") {
    const clonedObj = {} as T
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key])
      }
    }
    return clonedObj
  }
  return obj
}

// 객체의 얕은 복사
export function shallowClone<T>(obj: T): T {
  if (obj === null || typeof obj !== "object") return obj
  if (Array.isArray(obj)) return [...obj] as T
  return { ...obj }
}

// 객체에서 특정 키들만 선택
export function pick<T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> {
  const result = {} as Pick<T, K>
  for (const key of keys) {
    if (key in obj) {
      result[key] = obj[key]
    }
  }
  return result
}

// 객체에서 특정 키들 제외
export function omit<T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> {
  const result = { ...obj } as Omit<T, K>
  for (const key of keys) {
    delete (result as any)[key]
  }
  return result
}

// 객체의 키들을 가져오기
export function keys<T extends Record<string, unknown>>(obj: T): (keyof T)[] {
  return Object.keys(obj) as (keyof T)[]
}

// 객체의 값들을 가져오기
export function values<T extends Record<string, unknown>>(
  obj: T
): T[keyof T][] {
  return Object.values(obj) as T[keyof T][]
}

// 객체의 키-값 쌍들을 가져오기
export function entries<T extends Record<string, unknown>>(
  obj: T
): [keyof T, T[keyof T]][] {
  return Object.entries(obj) as [keyof T, T[keyof T]][]
}

// 객체를 Map으로 변환
export function toMap<T extends Record<string, unknown>>(
  obj: T
): Map<keyof T, T[keyof T]> {
  return new Map(entries(obj))
}

// Map을 객체로 변환
export function fromMap<K extends string, V>(map: Map<K, V>): Record<K, V> {
  const obj = {} as Record<K, V>
  for (const [key, value] of map) {
    obj[key] = value
  }
  return obj
}

// 객체 병합 (깊은 병합)
export function deepMerge<T extends Record<string, unknown>>(
  target: T,
  ...sources: Partial<T>[]
): T {
  if (!sources.length) return target

  const source = sources.shift()
  if (source === undefined) return target

  if (isValidObject(target) && isValidObject(source)) {
    for (const key in source) {
      if (isValidObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} })
        deepMerge(
          target[key] as Record<string, unknown>,
          source[key] as Record<string, unknown>
        )
      } else {
        Object.assign(target, { [key]: source[key] })
      }
    }
  }

  return deepMerge(target, ...sources)
}

// 객체 병합 (얕은 병합)
export function merge<T extends Record<string, unknown>>(
  target: T,
  ...sources: Partial<T>[]
): T {
  return Object.assign({}, target, ...sources)
}

// 객체의 중첩된 속성 값 가져오기
export function get<T>(
  obj: Record<string, unknown>,
  path: string | string[],
  defaultValue?: T
): T | undefined {
  const keys = Array.isArray(path) ? path : path.split(".")
  let result: unknown = obj

  for (const key of keys) {
    if (result === null || result === undefined || typeof result !== "object") {
      return defaultValue
    }
    result = (result as Record<string, unknown>)[key]
  }

  return result as T
}

// 객체의 중첩된 속성 값 설정
export function set<T extends Record<string, unknown>>(
  obj: T,
  path: string | string[],
  value: unknown
): T {
  const keys = Array.isArray(path) ? path : path.split(".")
  const result = deepClone(obj)
  let current: Record<string, unknown> = result

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i]
    if (!(key in current) || !isValidObject(current[key])) {
      current[key] = {}
    }
    current = current[key] as Record<string, unknown>
  }

  current[keys[keys.length - 1]] = value
  return result
}

// 객체의 중첩된 속성 값 삭제
export function unset<T extends Record<string, unknown>>(
  obj: T,
  path: string | string[]
): T {
  const keys = Array.isArray(path) ? path : path.split(".")
  const result = deepClone(obj)
  let current: Record<string, unknown> = result

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i]
    if (!(key in current) || !isValidObject(current[key])) {
      return result
    }
    current = current[key] as Record<string, unknown>
  }

  delete current[keys[keys.length - 1]]
  return result
}

// 객체에 특정 경로가 존재하는지 확인
export function has(
  obj: Record<string, unknown>,
  path: string | string[]
): boolean {
  const keys = Array.isArray(path) ? path : path.split(".")
  let current: unknown = obj

  for (const key of keys) {
    if (
      current === null ||
      current === undefined ||
      typeof current !== "object"
    ) {
      return false
    }
    if (!(key in current)) {
      return false
    }
    current = (current as Record<string, unknown>)[key]
  }

  return true
}

// 객체를 플랫하게 만들기
export function flatten(
  obj: Record<string, unknown>,
  prefix = "",
  separator = "."
): Record<string, unknown> {
  const result: Record<string, unknown> = {}

  for (const [key, value] of entries(obj)) {
    const newKey = prefix ? `${prefix}${separator}${String(key)}` : String(key)

    if (isValidObject(value) && !Array.isArray(value)) {
      Object.assign(
        result,
        flatten(value as Record<string, unknown>, newKey, separator)
      )
    } else {
      result[newKey] = value
    }
  }

  return result
}

// 플랫한 객체를 중첩된 객체로 변환
export function unflatten(
  obj: Record<string, unknown>,
  separator = "."
): Record<string, unknown> {
  const result: Record<string, unknown> = {}

  for (const [key, value] of entries(obj)) {
    const keys = key.split(separator)
    let current = result

    for (let i = 0; i < keys.length - 1; i++) {
      const k = keys[i]
      if (!(k in current) || !isValidObject(current[k])) {
        current[k] = {}
      }
      current = current[k] as Record<string, unknown>
    }

    current[keys[keys.length - 1]] = value
  }

  return result
}

// 객체의 크기 (키의 개수)
export function size(obj: Record<string, unknown>): number {
  return Object.keys(obj).length
}

// 객체가 특정 키를 가지고 있는지 확인
export function hasKey<T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  key: K
): boolean {
  return key in obj
}

// 객체에서 조건에 맞는 키-값 쌍들만 필터링
export function filter<T extends Record<string, unknown>>(
  obj: T,
  predicate: (value: T[keyof T], key: keyof T) => boolean
): Partial<T> {
  const result: Partial<T> = {}

  for (const [key, value] of entries(obj)) {
    if (predicate(value, key)) {
      result[key] = value
    }
  }

  return result
}

// 객체의 각 값에 함수를 적용하여 새 객체 생성
export function mapValues<T extends Record<string, unknown>, U>(
  obj: T,
  fn: (value: T[keyof T], key: keyof T) => U
): Record<keyof T, U> {
  const result = {} as Record<keyof T, U>

  for (const [key, value] of entries(obj)) {
    result[key] = fn(value, key)
  }

  return result
}

// 객체의 각 키에 함수를 적용하여 새 객체 생성
export function mapKeys<T extends Record<string, unknown>>(
  obj: T,
  fn: (key: keyof T, value: T[keyof T]) => string
): Record<string, T[keyof T]> {
  const result: Record<string, T[keyof T]> = {}

  for (const [key, value] of entries(obj)) {
    result[fn(key, value)] = value
  }

  return result
}

// 객체를 순회하면서 각 키-값 쌍에 함수 적용
export function forEach<T extends Record<string, unknown>>(
  obj: T,
  fn: (value: T[keyof T], key: keyof T) => void
): void {
  for (const [key, value] of entries(obj)) {
    fn(value, key)
  }
}

// 객체를 순회하면서 누적값 계산
export function reduce<T extends Record<string, unknown>, U>(
  obj: T,
  fn: (accumulator: U, value: T[keyof T], key: keyof T) => U,
  initialValue: U
): U {
  let result = initialValue

  for (const [key, value] of entries(obj)) {
    result = fn(result, value, key)
  }

  return result
}

// 객체를 JSON 문자열로 변환
export function toJson(obj: Record<string, unknown>, space?: number): string {
  return JSON.stringify(obj, null, space)
}

// JSON 문자열을 객체로 변환
export function fromJson<T extends Record<string, unknown>>(json: string): T {
  return JSON.parse(json) as T
}

// 객체를 URL 쿼리 문자열로 변환
export function toQueryString(obj: Record<string, unknown>): string {
  const params = new URLSearchParams()

  for (const [key, value] of entries(obj)) {
    if (value !== null && value !== undefined) {
      params.append(String(key), String(value))
    }
  }

  return params.toString()
}

// URL 쿼리 문자열을 객체로 변환
export function fromQueryString(queryString: string): Record<string, string> {
  const params = new URLSearchParams(queryString)
  const result: Record<string, string> = {}

  for (const [key, value] of params) {
    result[key] = value
  }

  return result
}

// 객체를 FormData로 변환
export function toFormData(obj: Record<string, unknown>): FormData {
  const formData = new FormData()

  for (const [key, value] of entries(obj)) {
    if (value !== null && value !== undefined) {
      formData.append(String(key), String(value))
    }
  }

  return formData
}

// 객체의 모든 값이 조건을 만족하는지 확인
export function every<T extends Record<string, unknown>>(
  obj: T,
  predicate: (value: T[keyof T], key: keyof T) => boolean
): boolean {
  for (const [key, value] of entries(obj)) {
    if (!predicate(value, key)) {
      return false
    }
  }
  return true
}

// 객체의 일부 값이 조건을 만족하는지 확인
export function some<T extends Record<string, unknown>>(
  obj: T,
  predicate: (value: T[keyof T], key: keyof T) => boolean
): boolean {
  for (const [key, value] of entries(obj)) {
    if (predicate(value, key)) {
      return true
    }
  }
  return false
}

// 객체에서 조건에 맞는 첫 번째 키-값 쌍 찾기
export function find<T extends Record<string, unknown>>(
  obj: T,
  predicate: (value: T[keyof T], key: keyof T) => boolean
): [keyof T, T[keyof T]] | undefined {
  for (const [key, value] of entries(obj)) {
    if (predicate(value, key)) {
      return [key, value]
    }
  }
  return undefined
}

// 객체에서 조건에 맞는 모든 키-값 쌍 찾기
export function findAll<T extends Record<string, unknown>>(
  obj: T,
  predicate: (value: T[keyof T], key: keyof T) => boolean
): Array<[keyof T, T[keyof T]]> {
  const result: Array<[keyof T, T[keyof T]]> = []

  for (const [key, value] of entries(obj)) {
    if (predicate(value, key)) {
      result.push([key, value])
    }
  }

  return result
}
