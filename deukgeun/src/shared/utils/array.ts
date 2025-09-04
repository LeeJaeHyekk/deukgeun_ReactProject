// ============================================================================
// 배열 관련 유틸리티 함수들
// ============================================================================

// 배열이 비어있는지 확인
export function isEmpty<T>(arr: T[]): boolean {
  return arr.length === 0
}

// 배열이 유효한지 확인
export function isValidArray<T>(arr: unknown): arr is T[] {
  return Array.isArray(arr) && arr.length > 0
}

// 배열에서 중복 요소 제거
export function removeDuplicates<T>(arr: T[]): T[] {
  return [...new Set(arr)]
}

// 배열에서 중복 객체 제거 (키 기준)
export function removeDuplicateObjects<T extends Record<string, unknown>>(
  arr: T[],
  key: keyof T
): T[] {
  const seen = new Set()
  return arr.filter(item => {
    const value = item[key]
    if (seen.has(value)) {
      return false
    }
    seen.add(value)
    return true
  })
}

// 배열을 청크로 분할
export function chunk<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size))
  }
  return chunks
}

// 배열을 그룹으로 분할
export function groupBy<T>(
  arr: T[],
  key: keyof T | ((item: T) => string)
): Record<string, T[]> {
  return arr.reduce(
    (groups, item) => {
      const groupKey = typeof key === "function" ? key(item) : String(item[key])
      if (!groups[groupKey]) {
        groups[groupKey] = []
      }
      groups[groupKey].push(item)
      return groups
    },
    {} as Record<string, T[]>
  )
}

// 배열을 정렬 (다중 키 지원)
export function sortBy<T>(
  arr: T[],
  keys: Array<keyof T | { key: keyof T; order: "asc" | "desc" }>
): T[] {
  return [...arr].sort((a, b) => {
    for (const keyConfig of keys) {
      const key = typeof keyConfig === "object" ? keyConfig.key : keyConfig
      const order = typeof keyConfig === "object" ? keyConfig.order : "asc"

      const aVal = a[key]
      const bVal = b[key]

      if (aVal < bVal) return order === "asc" ? -1 : 1
      if (aVal > bVal) return order === "asc" ? 1 : -1
    }
    return 0
  })
}

// 배열에서 랜덤 요소 선택
export function randomElement<T>(arr: T[]): T | undefined {
  if (isEmpty(arr)) return undefined
  return arr[Math.floor(Math.random() * arr.length)]
}

// 배열에서 랜덤 요소들 선택
export function randomElements<T>(arr: T[], count: number): T[] {
  if (isEmpty(arr)) return []
  const shuffled = [...arr].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, Math.min(count, arr.length))
}

// 배열을 섞기
export function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5)
}

// 배열에서 최대값 찾기
export function max<T>(
  arr: T[],
  selector?: (item: T) => number
): T | undefined {
  if (isEmpty(arr)) return undefined
  if (selector) {
    return arr.reduce((max, item) =>
      selector(item) > selector(max) ? item : max
    )
  }
  // 숫자 배열인 경우에만 Math.max 사용
  if (arr.every(item => typeof item === "number")) {
    return Math.max(...(arr as number[])) as T
  }
  return undefined
}

// 배열에서 최소값 찾기
export function min<T>(
  arr: T[],
  selector?: (item: T) => number
): T | undefined {
  if (isEmpty(arr)) return undefined
  if (selector) {
    return arr.reduce((min, item) =>
      selector(item) < selector(min) ? item : min
    )
  }
  // 숫자 배열인 경우에만 Math.min 사용
  if (arr.every(item => typeof item === "number")) {
    return Math.min(...(arr as number[])) as T
  }
  return undefined
}

// 배열의 평균값 계산
export function average(arr: number[]): number {
  if (isEmpty(arr)) return 0
  return arr.reduce((sum, val) => sum + val, 0) / arr.length
}

// 배열의 합계 계산
export function sum(arr: number[]): number {
  return arr.reduce((sum, val) => sum + val, 0)
}

// 배열에서 조건에 맞는 첫 번째 요소 찾기
export function find<T>(
  arr: T[],
  predicate: (item: T, index: number) => boolean
): T | undefined {
  return arr.find(predicate)
}

// 배열에서 조건에 맞는 모든 요소 찾기
export function findAll<T>(
  arr: T[],
  predicate: (item: T, index: number) => boolean
): T[] {
  return arr.filter(predicate)
}

// 배열에서 조건에 맞는 요소의 인덱스 찾기
export function findIndex<T>(
  arr: T[],
  predicate: (item: T, index: number) => boolean
): number {
  return arr.findIndex(predicate)
}

// 배열에서 조건에 맞는 요소의 개수 세기
export function count<T>(
  arr: T[],
  predicate: (item: T, index: number) => boolean
): number {
  return arr.filter(predicate).length
}

// 배열에서 특정 요소의 개수 세기
export function countOccurrences<T>(arr: T[], item: T): number {
  return arr.filter(x => x === item).length
}

// 배열에서 조건에 맞는 요소가 있는지 확인
export function has<T>(
  arr: T[],
  predicate: (item: T, index: number) => boolean
): boolean {
  return arr.some(predicate)
}

// 배열에서 특정 요소가 포함되어 있는지 확인
export function includes<T>(arr: T[], item: T): boolean {
  return arr.includes(item)
}

// 배열을 뒤집기
export function reverse<T>(arr: T[]): T[] {
  return [...arr].reverse()
}

// 배열의 첫 번째 요소 가져오기
export function first<T>(arr: T[]): T | undefined {
  return arr[0]
}

// 배열의 마지막 요소 가져오기
export function last<T>(arr: T[]): T | undefined {
  return arr[arr.length - 1]
}

// 배열에서 특정 인덱스의 요소 가져오기 (음수 인덱스 지원)
export function at<T>(arr: T[], index: number): T | undefined {
  if (index < 0) {
    index = arr.length + index
  }
  return arr[index]
}

// 배열에서 특정 범위의 요소들 가져오기
export function slice<T>(arr: T[], start: number, end?: number): T[] {
  return arr.slice(start, end)
}

// 배열에서 특정 요소 제거
export function remove<T>(arr: T[], item: T): T[] {
  return arr.filter(x => x !== item)
}

// 배열에서 특정 인덱스의 요소 제거
export function removeAt<T>(arr: T[], index: number): T[] {
  if (index < 0 || index >= arr.length) return arr
  return [...arr.slice(0, index), ...arr.slice(index + 1)]
}

// 배열에서 조건에 맞는 요소들 제거
export function removeWhere<T>(
  arr: T[],
  predicate: (item: T, index: number) => boolean
): T[] {
  return arr.filter((item, index) => !predicate(item, index))
}

// 배열에 요소 추가 (중복 방지)
export function addUnique<T>(arr: T[], item: T): T[] {
  if (arr.includes(item)) return arr
  return [...arr, item]
}

// 배열에 요소들 추가 (중복 방지)
export function addUniqueAll<T>(arr: T[], items: T[]): T[] {
  const result = [...arr]
  for (const item of items) {
    if (!result.includes(item)) {
      result.push(item)
    }
  }
  return result
}

// 배열을 플랫하게 만들기
export function flatten<T>(arr: T[][]): T[] {
  return arr.flat()
}

// 배열을 깊게 플랫하게 만들기
export function flattenDeep<T>(arr: unknown[]): T[] {
  return arr.reduce<T[]>((flat, item) => {
    return flat.concat(Array.isArray(item) ? flattenDeep<T>(item) : (item as T))
  }, [])
}

// 배열에서 중복 요소들의 개수 세기
export function countDuplicates<T>(arr: T[]): Record<string, number> {
  return arr.reduce(
    (counts, item) => {
      const key = String(item)
      counts[key] = (counts[key] || 0) + 1
      return counts
    },
    {} as Record<string, number>
  )
}

// 배열에서 가장 많이 나타나는 요소 찾기
export function mostFrequent<T>(arr: T[]): T | undefined {
  if (isEmpty(arr)) return undefined

  const counts = countDuplicates(arr)
  const maxCount = Math.max(...Object.values(counts))
  const mostFrequentKey = Object.keys(counts).find(
    key => counts[key] === maxCount
  )

  return mostFrequentKey
    ? (arr.find(item => String(item) === mostFrequentKey) as T)
    : undefined
}

// 배열에서 고유한 요소들만 가져오기
export function unique<T>(arr: T[]): T[] {
  return removeDuplicates(arr)
}

// 배열에서 고유한 객체들만 가져오기 (키 기준)
export function uniqueBy<T extends Record<string, unknown>>(
  arr: T[],
  key: keyof T
): T[] {
  return removeDuplicateObjects(arr, key)
}

// 배열을 문자열로 변환
export function join<T>(arr: T[], separator = ","): string {
  return arr.join(separator)
}

// 배열을 객체로 변환
export function toObject<T>(
  arr: T[],
  keySelector: (item: T) => string,
  valueSelector?: (item: T) => unknown
): Record<string, unknown> {
  return arr.reduce(
    (obj, item) => {
      const key = keySelector(item)
      const value = valueSelector ? valueSelector(item) : item
      obj[key] = value
      return obj
    },
    {} as Record<string, unknown>
  )
}

// 배열을 Map으로 변환
export function toMap<T, K, V>(
  arr: T[],
  keySelector: (item: T) => K,
  valueSelector: (item: T) => V
): Map<K, V> {
  return new Map(arr.map(item => [keySelector(item), valueSelector(item)]))
}

// 배열을 Set으로 변환
export function toSet<T>(arr: T[]): Set<T> {
  return new Set(arr)
}

// 배열의 모든 요소가 조건을 만족하는지 확인
export function every<T>(
  arr: T[],
  predicate: (item: T, index: number) => boolean
): boolean {
  return arr.every(predicate)
}

// 배열의 일부 요소가 조건을 만족하는지 확인
export function some<T>(
  arr: T[],
  predicate: (item: T, index: number) => boolean
): boolean {
  return arr.some(predicate)
}

// 배열을 순회하면서 각 요소에 함수 적용
export function forEach<T>(
  arr: T[],
  fn: (item: T, index: number) => void
): void {
  arr.forEach(fn)
}

// 배열의 각 요소에 함수를 적용하여 새 배열 생성
export function map<T, U>(arr: T[], fn: (item: T, index: number) => U): U[] {
  return arr.map(fn)
}

// 배열에서 조건에 맞는 요소들만 필터링
export function filter<T>(
  arr: T[],
  predicate: (item: T, index: number) => boolean
): T[] {
  return arr.filter(predicate)
}

// 배열을 순회하면서 누적값 계산
export function reduce<T, U>(
  arr: T[],
  fn: (accumulator: U, item: T, index: number) => U,
  initialValue: U
): U {
  return arr.reduce(fn, initialValue)
}

// 배열을 순회하면서 누적값 계산 (초기값 없음)
export function reduceRight<T>(
  arr: T[],
  fn: (accumulator: T, item: T, index: number) => T
): T {
  return arr.reduceRight(fn)
}

// 배열을 순회하면서 누적값 계산 (오른쪽에서 왼쪽으로)
export function reduceRightWithInitial<T, U>(
  arr: T[],
  fn: (accumulator: U, item: T, index: number) => U,
  initialValue: U
): U {
  return arr.reduceRight(fn, initialValue)
}
