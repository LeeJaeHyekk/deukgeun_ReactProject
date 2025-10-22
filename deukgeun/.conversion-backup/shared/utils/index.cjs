// ============================================================================
// 공유 유틸리티 함수들
// ============================================================================

// 날짜 관련 유틸리티
Object.assign(module.exports, require('./date'))

// 문자열 관련 유틸리티 (중복 함수 제외)
module.exports.truncate = truncate
module.exports.validateEmail = validateEmail
module.exports.toTitleCase = toTitleCase
module.exports.generateSlug = generateSlug
module.exports.maskPhone = maskPhone
module.exports.stripHtml = stripHtml
module.exports. =  from "./string"

// 문자열 유틸리티 별칭
module.exports.capitalize = toTitleCase from "./string"
module.exports.slugify = generateSlug from "./string"
module.exports.formatPhoneNumber = maskPhone from "./string"
module.exports.validatePhoneNumber = validatePhone from "./string"
module.exports.sanitizeHtml = stripHtml from "./string"
module.exports.escapeHtml = stripHtml from "./string"
module.exports.unescapeHtml = stripHtml from "./string"

// 배열 관련 유틸리티 (중복 함수 제외)
module.exports.chunk = chunk
module.exports.groupBy = groupBy
module.exports.sortBy = sortBy
module.exports.unique = unique
module.exports.shuffle = shuffle
module.exports.randomElement = randomElement
module.exports.slice = slice
module.exports. =  from "./array"

// 배열 유틸리티 별칭
module.exports.sample = randomElement from "./array"
module.exports.take = slice from "./array"

// 배열 유틸리티 함수들
function drop
module.exports.drop = drop(arr: unknown[], n: number) {
  return arr.slice(n)
}

function zip
module.exports.zip = zip(arr1: unknown[], arr2: unknown[]) {
  return arr1.map((item, index) => [item, arr2[index]])
}

function unzip
module.exports.unzip = unzip<T>(arr: T[][]) {
  return arr.reduce((acc, item) => {
    item.forEach((val, index) => {
      if (!acc[index]) acc[index] = []
      acc[index].push(val)
    })
    return acc
  }, [] as T[][])
}

// 객체 관련 유틸리티
Object.assign(module.exports, require('./object'))

// 검증 관련 유틸리티 (중복 함수 제외)
module.exports.isValidEmail = isValidEmail
module.exports.isValidPhone = isValidPhone
module.exports.isValidUrl = isValidUrl
module.exports.isValidDate = isValidDate
module.exports.validatePasswordStrength = validatePasswordStrength
module.exports. =  from "./validation"

// 검증 유틸리티 별칭
module.exports.isEmail = isValidEmail from "./validation"
module.exports.isPassword = validatePasswordStrength from "./validation"
module.exports.isPhoneNumber = isValidPhone from "./validation"
module.exports.isUrl = isValidUrl from "./validation"
module.exports.isDate = isValidDate from "./validation"
module.exports.isValidPhoneNumber = isValidPhone from "./validation"
module.exports.isValidPassword = validatePasswordStrength from "./validation"

// 검증 유틸리티 함수들
function isNickname
module.exports.isNickname = isNickname(nickname: string): boolean {
  return /^[가-힣a-zA-Z0-9]{2,20}$/.test(nickname)
}

function isNumber
module.exports.isNumber = isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value)
}

function isString
module.exports.isString = isString(value: unknown): value is string {
  return typeof value === 'string'
}

function isBoolean
module.exports.isBoolean = isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean'
}

function isArray
module.exports.isArray = isArray(value: unknown): value is unknown[] {
  return Array.isArray(value)
}

function isObject
module.exports.isObject = isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isEmpty
module.exports.isEmpty = isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true
  if (typeof value === 'string') return value.trim().length === 0
  if (Array.isArray(value)) return value.length === 0
  if (typeof value === 'object') return Object.keys(value).length === 0
  return false
}

function isNotEmpty
module.exports.isNotEmpty = isNotEmpty(value: unknown): boolean {
  return !isEmpty(value)
}

function isValidNickname
module.exports.isValidNickname = isValidNickname(nickname: string): boolean {
  return /^[가-힣a-zA-Z0-9]{2,20}$/.test(nickname)
}

// 스토리지 관련 유틸리티
Object.assign(module.exports, require('./storage'))

// 환경 변수 관련 유틸리티
Object.assign(module.exports, require('./env'))