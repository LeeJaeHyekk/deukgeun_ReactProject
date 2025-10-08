// ============================================================================
// 문자열 관련 유틸리티 함수들
// ============================================================================

// 문자열이 비어있는지 확인
export function isEmpty(str: string): boolean {
  return str.trim().length === 0
}

// 문자열이 유효한지 확인
export function isValidString(str: unknown): str is string {
  return typeof str === "string" && str.length > 0
}

// 문자열 길이 제한
export function truncate(str: string, maxLength: number, suffix = "..."): string {
  if (str.length <= maxLength) return str
  return str.substring(0, maxLength - suffix.length) + suffix
}

// 문자열에서 HTML 태그 제거
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "")
}

// 문자열에서 특수문자 제거
export function removeSpecialChars(str: string): string {
  return str.replace(/[^a-zA-Z0-9가-힣\s]/g, "")
}

// 문자열에서 숫자만 추출
export function extractNumbers(str: string): string {
  return str.replace(/\D/g, "")
}

// 문자열에서 이메일 추출
export function extractEmails(str: string): string[] {
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g
  return str.match(emailRegex) || []
}

// 문자열에서 전화번호 추출
export function extractPhoneNumbers(str: string): string[] {
  const phoneRegex = /(\d{2,3}-\d{3,4}-\d{4}|\d{10,11})/g
  return str.match(phoneRegex) || []
}

// 문자열에서 URL 추출
export function extractUrls(str: string): string[] {
  const urlRegex = /https?:\/\/[^\s]+/g
  return str.match(urlRegex) || []
}

// 문자열을 카멜케이스로 변환
export function toCamelCase(str: string): string {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
      return index === 0 ? word.toLowerCase() : word.toUpperCase()
    })
    .replace(/\s+/g, "")
}

// 문자열을 파스칼케이스로 변환
export function toPascalCase(str: string): string {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, word => word.toUpperCase())
    .replace(/\s+/g, "")
}

// 문자열을 스네이크케이스로 변환
export function toSnakeCase(str: string): string {
  return str
    .replace(/([A-Z])/g, "_$1")
    .toLowerCase()
    .replace(/^_/, "")
    .replace(/\s+/g, "_")
}

// 문자열을 케밥케이스로 변환
export function toKebabCase(str: string): string {
  return str
    .replace(/([A-Z])/g, "-$1")
    .toLowerCase()
    .replace(/^-/, "")
    .replace(/\s+/g, "-")
}

// 문자열을 제목 케이스로 변환
export function toTitleCase(str: string): string {
  return str.replace(/\w\S*/g, word => {
    return word.charAt(0).toUpperCase() + word.substr(1).toLowerCase()
  })
}

// 문자열을 문장 케이스로 변환
export function toSentenceCase(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

// 문자열을 역순으로 변환
export function reverse(str: string): string {
  return str.split("").reverse().join("")
}

// 문자열에서 중복 문자 제거
export function removeDuplicates(str: string): string {
  return [...new Set(str)].join("")
}

// 문자열에서 중복 단어 제거
export function removeDuplicateWords(str: string): string {
  const words = str.split(/\s+/)
  const uniqueWords = [...new Set(words)]
  return uniqueWords.join(" ")
}

// 문자열에서 공백 정규화
export function normalizeWhitespace(str: string): string {
  return str.replace(/\s+/g, " ").trim()
}

// 문자열에서 줄바꿈 정규화
export function normalizeLineBreaks(str: string): string {
  return str.replace(/\r\n/g, "\n").replace(/\r/g, "\n")
}

// 문자열을 단어 단위로 분할
export function splitWords(str: string): string[] {
  return str.split(/\s+/).filter(word => word.length > 0)
}

// 문자열을 문자 단위로 분할
export function splitChars(str: string): string[] {
  return str.split("")
}

// 문자열에서 특정 문자 개수 세기
export function countChar(str: string, char: string): number {
  return (str.match(new RegExp(char, "g")) || []).length
}

// 문자열에서 단어 개수 세기
export function countWords(str: string): number {
  return splitWords(str).length
}

// 문자열에서 줄 개수 세기
export function countLines(str: string): number {
  return str.split("\n").length
}

// 문자열에서 자음/모음 개수 세기 (한글)
export function countKoreanChars(str: string): { consonants: number; vowels: number } {
  const consonants = (str.match(/[ㄱ-ㅎㅏ-ㅣ]/g) || []).length
  const vowels = (str.match(/[ㅏ-ㅣ]/g) || []).length
  return { consonants, vowels }
}

// 문자열에서 한글/영문/숫자 개수 세기
export function countCharTypes(str: string): { korean: number; english: number; numbers: number; special: number } {
  const korean = (str.match(/[가-힣]/g) || []).length
  const english = (str.match(/[a-zA-Z]/g) || []).length
  const numbers = (str.match(/[0-9]/g) || []).length
  const special = str.length - korean - english - numbers
  return { korean, english, numbers, special }
}

// 문자열 마스킹 (개인정보 보호)
export function maskString(str: string, start: number, end: number, mask = "*"): string {
  if (start >= str.length || end <= 0 || start >= end) return str
  const before = str.substring(0, start)
  const after = str.substring(end)
  const masked = mask.repeat(Math.min(end - start, str.length - start))
  return before + masked + after
}

// 이메일 마스킹
export function maskEmail(email: string): string {
  const [local, domain] = email.split("@")
  if (local.length <= 2) return email
  const maskedLocal = local.charAt(0) + "*".repeat(local.length - 2) + local.charAt(local.length - 1)
  return `${maskedLocal}@${domain}`
}

// 전화번호 마스킹
export function maskPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, "")
  if (cleaned.length < 7) return phone
  const start = Math.floor(cleaned.length / 3)
  const end = Math.floor(cleaned.length * 2 / 3)
  return maskString(phone, start, end)
}

// 이름 마스킹
export function maskName(name: string): string {
  if (name.length <= 1) return name
  return name.charAt(0) + "*".repeat(name.length - 1)
}

// 문자열 유효성 검사
export function validateString(str: string, options: {
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  required?: boolean
} = {}): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  const { minLength, maxLength, pattern, required = true } = options

  if (required && isEmpty(str)) {
    errors.push("문자열이 비어있습니다.")
  }

  if (minLength && str.length < minLength) {
    errors.push(`최소 ${minLength}자 이상이어야 합니다.`)
  }

  if (maxLength && str.length > maxLength) {
    errors.push(`최대 ${maxLength}자까지 가능합니다.`)
  }

  if (pattern && !pattern.test(str)) {
    errors.push("형식이 올바르지 않습니다.")
  }

  return { isValid: errors.length === 0, errors }
}

// 이메일 유효성 검사
export function validateEmail(email: string): { isValid: boolean; errors: string[] } {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return validateString(email, { pattern: emailRegex, required: true })
}

// 전화번호 유효성 검사
export function validatePhone(phone: string): { isValid: boolean; errors: string[] } {
  const phoneRegex = /^(\d{2,3}-\d{3,4}-\d{4}|\d{10,11})$/
  return validateString(phone, { pattern: phoneRegex, required: true })
}

// 비밀번호 유효성 검사
export function validatePassword(password: string): { isValid: boolean; errors: string[] } {
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

// 문자열 생성기
export function generateString(length: number, options: {
  includeUppercase?: boolean
  includeLowercase?: boolean
  includeNumbers?: boolean
  includeSymbols?: boolean
  excludeSimilar?: boolean
} = {}): string {
  const {
    includeUppercase = true,
    includeLowercase = true,
    includeNumbers = true,
    includeSymbols = false,
    excludeSimilar = true
  } = options

  let chars = ""
  if (includeUppercase) chars += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
  if (includeLowercase) chars += "abcdefghijklmnopqrstuvwxyz"
  if (includeNumbers) chars += "0123456789"
  if (includeSymbols) chars += "!@#$%^&*()_+-=[]{}|;:,.<>?"

  if (excludeSimilar) {
    chars = chars.replace(/[0O1Il]/g, "")
  }

  let result = ""
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }

  return result
}

// 랜덤 ID 생성
export function generateId(prefix = "", length = 8): string {
  const id = generateString(length, { includeUppercase: true, includeNumbers: true })
  return prefix ? `${prefix}_${id}` : id
}

// 슬러그 생성
export function generateSlug(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
}
