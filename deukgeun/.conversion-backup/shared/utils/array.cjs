// ============================================================================
// 배열 관련 유틸리티 함수들
// ============================================================================

// 배열이 비어있는지 확인
function isEmpty
module.exports.isEmpty = isEmpty<T>(arr: T[]): boolean {
  return arr.length === 0
}

// 배열이 유효한지 확인
function isValidArray
module.exports.isValidArray = isValidArray<T>(arr: unknown): arr is T[] {
  return Array.isArray(arr) && arr.length > 0
}

// 배열에서 중복 요소 제거
function removeDuplicates
module.exports.removeDuplicates = removeDuplicates<T>(arr: T[]): T[] {
  return [...new Set(arr)]
}

// 배열에서 중복 객체 제거 (키 기준)
function removeDuplicateObjects
module.exports.removeDuplicateObjects = removeDuplicateObjects<T extends Record<string, unknown>>(
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
function chunk
module.exports.chunk = chunk<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size))
  }
  return chunks
}

// 배열을 그룹으로 분할
function groupBy
module.exports.groupBy = groupBy<T>(
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
function sortBy
module.exports.sortBy = sortBy<T>(
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
function randomElement
module.exports.randomElement = randomElement<T>(arr: T[]): T | undefined {
  if (isEmpty(arr)) return undefined
  return arr[Math.floor(Math.random() * arr.length)]
}

// 배열에서 랜덤 요소들 선택
function randomElements
module.exports.randomElements = randomElements<T>(arr: T[], count: number): T[] {
  if (isEmpty(arr)) return []
  const shuffled = [...arr].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, Math.min(count, arr.length))
}

// 배열을 섞기
function shuffle
module.exports.shuffle = shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5)
}

// 배열에서 최대값 찾기
function max
module.exports.max = max<T>(
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
function min
module.exports.min = min<T>(
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
function average
module.exports.average = average(arr: number[]): number {
  if (isEmpty(arr)) return 0
  return arr.reduce((sum, val) => sum + val, 0) / arr.length
}

// 배열의 합계 계산
function sum
module.exports.sum = sum(arr: number[]): number {
  return arr.reduce((sum, val) => sum + val, 0)
}

// 배열에서 조건에 맞는 첫 번째 요소 찾기
function find
module.exports.find = find<T>(
  arr: T[],
  predicate: (item: T, index: number) => boolean
): T | undefined {
  return arr.find(predicate)
}

// 배열에서 조건에 맞는 모든 요소 찾기
function findAll
module.exports.findAll = findAll<T>(
  arr: T[],
  predicate: (item: T, index: number) => boolean
): T[] {
  return arr.filter(predicate)
}

// 배열에서 조건에 맞는 요소의 인덱스 찾기
function findIndex
module.exports.findIndex = findIndex<T>(
  arr: T[],
  predicate: (item: T, index: number) => boolean
): number {
  return arr.findIndex(predicate)
}

// 배열에서 조건에 맞는 요소의 개수 세기
function count
module.exports.count = count<T>(
  arr: T[],
  predicate: (item: T, index: number) => boolean
): number {
  return arr.filter(predicate).length
}

// 배열에서 특정 요소의 개수 세기
function countOccurrences
module.exports.countOccurrences = countOccurrences<T>(arr: T[], item: T): number {
  return arr.filter(x => x === item).length
}

// 배열에서 조건에 맞는 요소가 있는지 확인
function has
module.exports.has = has<T>(
  arr: T[],
  predicate: (item: T, index: number) => boolean
): boolean {
  return arr.some(predicate)
}

// 배열에서 특정 요소가 포함되어 있는지 확인
function includes
module.exports.includes = includes<T>(arr: T[], item: T): boolean {
  return arr.includes(item)
}

// 배열을 뒤집기
function reverse
module.exports.reverse = reverse<T>(arr: T[]): T[] {
  return [...arr].reverse()
}

// 배열의 첫 번째 요소 가져오기
function first
module.exports.first = first<T>(arr: T[]): T | undefined {
  return arr[0]
}

// 배열의 마지막 요소 가져오기
function last
module.exports.last = last<T>(arr: T[]): T | undefined {
  return arr[arr.length - 1]
}

// 배열에서 특정 인덱스의 요소 가져오기 (음수 인덱스 지원)
function at
module.exports.at = at<T>(arr: T[], index: number): T | undefined {
  if (index < 0) {
    index = arr.length + index
  }
  return arr[index]
}

// 배열에서 특정 범위의 요소들 가져오기
function slice
module.exports.slice = slice<T>(arr: T[], start: number, end?: number): T[] {
  return arr.slice(start, end)
}

// 배열에서 특정 요소 제거
function remove
module.exports.remove = remove<T>(arr: T[], item: T): T[] {
  return arr.filter(x => x !== item)
}

// 배열에서 특정 인덱스의 요소 제거
function removeAt
module.exports.removeAt = removeAt<T>(arr: T[], index: number): T[] {
  if (index < 0 || index >= arr.length) return arr
  return [...arr.slice(0, index), ...arr.slice(index + 1)]
}

// 배열에서 조건에 맞는 요소들 제거
function removeWhere
module.exports.removeWhere = removeWhere<T>(
  arr: T[],
  predicate: (item: T, index: number) => boolean
): T[] {
  return arr.filter((item, index) => !predicate(item, index))
}

// 배열에 요소 추가 (중복 방지)
function addUnique
module.exports.addUnique = addUnique<T>(arr: T[], item: T): T[] {
  if (arr.includes(item)) return arr
  return [...arr, item]
}

// 배열에 요소들 추가 (중복 방지)
function addUniqueAll
module.exports.addUniqueAll = addUniqueAll<T>(arr: T[], items: T[]): T[] {
  const result = [...arr]
  for (const item of items) {
    if (!result.includes(item)) {
      result.push(item)
    }
  }
  return result
}

// 배열을 플랫하게 만들기
function flatten
module.exports.flatten = flatten<T>(arr: T[][]): T[] {
  return arr.flat()
}

// 배열을 깊게 플랫하게 만들기
function flattenDeep
module.exports.flattenDeep = flattenDeep<T>(arr: unknown[]): T[] {
  return arr.reduce((flat: T[], item) => {
    return flat.concat(Array.isArray(item) ? flattenDeep<T>(item) : (item as T))
  }, [] as T[])
}

// 배열에서 중복 요소들의 개수 세기
function countDuplicates
module.exports.countDuplicates = countDuplicates<T>(arr: T[]): Record<string, number> {
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
function mostFrequent
module.exports.mostFrequent = mostFrequent<T>(arr: T[]): T | undefined {
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
function unique
module.exports.unique = unique<T>(arr: T[]): T[] {
  return removeDuplicates(arr)
}

// 배열에서 고유한 객체들만 가져오기 (키 기준)
function uniqueBy
module.exports.uniqueBy = uniqueBy<T extends Record<string, unknown>>(
  arr: T[],
  key: keyof T
): T[] {
  return removeDuplicateObjects(arr, key)
}

// 배열을 문자열로 변환
function join
module.exports.join = join<T>(arr: T[], separator = ","): string {
  return arr.join(separator)
}

// 배열을 객체로 변환
function toObject
module.exports.toObject = toObject<T>(
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
function toMap
module.exports.toMap = toMap<T, K, V>(
  arr: T[],
  keySelector: (item: T) => K,
  valueSelector: (item: T) => V
): Map<K, V> {
  return new Map(arr.map(item => [keySelector(item), valueSelector(item)]))
}

// 배열을 Set으로 변환
function toSet
module.exports.toSet = toSet<T>(arr: T[]): Set<T> {
  return new Set(arr)
}

// 배열의 모든 요소가 조건을 만족하는지 확인
function every
module.exports.every = every<T>(
  arr: T[],
  predicate: (item: T, index: number) => boolean
): boolean {
  return arr.every(predicate)
}

// 배열의 일부 요소가 조건을 만족하는지 확인
function some
module.exports.some = some<T>(
  arr: T[],
  predicate: (item: T, index: number) => boolean
): boolean {
  return arr.some(predicate)
}

// 배열을 순회하면서 각 요소에 함수 적용
function forEach
module.exports.forEach = forEach<T>(
  arr: T[],
  fn: (item: T, index: number) => void
): void {
  arr.forEach(fn)
}

// 배열의 각 요소에 함수를 적용하여 새 배열 생성
function map
module.exports.map = map<T, U>(arr: T[], fn: (item: T, index: number) => U): U[] {
  return arr.map(fn)
}

// 배열에서 조건에 맞는 요소들만 필터링
function filter
module.exports.filter = filter<T>(
  arr: T[],
  predicate: (item: T, index: number) => boolean
): T[] {
  return arr.filter(predicate)
}

// 배열을 순회하면서 누적값 계산
function reduce
module.exports.reduce = reduce<T, U>(
  arr: T[],
  fn: (accumulator: U, item: T, index: number) => U,
  initialValue: U
): U {
  return arr.reduce(fn, initialValue)
}

// 배열을 순회하면서 누적값 계산 (초기값 없음)
function reduceRight
module.exports.reduceRight = reduceRight<T>(
  arr: T[],
  fn: (accumulator: T, item: T, index: number) => T
): T {
  return arr.reduceRight(fn)
}

// 배열을 순회하면서 누적값 계산 (오른쪽에서 왼쪽으로)
function reduceRightWithInitial
module.exports.reduceRightWithInitial = reduceRightWithInitial<T, U>(
  arr: T[],
  fn: (accumulator: U, item: T, index: number) => U,
  initialValue: U
): U {
  return arr.reduceRight(fn, initialValue)
}