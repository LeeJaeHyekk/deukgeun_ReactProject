import crypto from "crypto"
import bcrypt from "bcrypt"

// 비밀번호 해싱
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12
  return await bcrypt.hash(password, saltRounds)
}

// 비밀번호 검증
export const verifyPassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword)
}

// 랜덤 토큰 생성
export const generateRandomToken = (length: number = 32): string => {
  return crypto.randomBytes(length).toString("hex")
}

// JWT 시크릿 생성
export const generateJWTSecret = (): string => {
  return crypto.randomBytes(64).toString("hex")
}

// API 키 생성
export const generateApiKey = (): string => {
  const prefix = "dk_"
  const randomPart = crypto.randomBytes(32).toString("hex")
  return `${prefix}${randomPart}`
}

// 해시 생성
export const generateHash = (
  data: string,
  algorithm: string = "sha256"
): string => {
  return crypto.createHash(algorithm).update(data).digest("hex")
}

// HMAC 서명 생성
export const generateHMAC = (
  data: string,
  secret: string,
  algorithm: string = "sha256"
): string => {
  return crypto.createHmac(algorithm, secret).update(data).digest("hex")
}

// HMAC 서명 검증
export const verifyHMAC = (
  data: string,
  signature: string,
  secret: string,
  algorithm: string = "sha256"
): boolean => {
  const expectedSignature = generateHMAC(data, secret, algorithm)
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  )
}

// 암호화
export const encrypt = (text: string, key: string): string => {
  const algorithm = "aes-256-gcm"
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipher(algorithm, key)

  let encrypted = cipher.update(text, "utf8", "hex")
  encrypted += cipher.final("hex")

  const authTag = cipher.getAuthTag()

  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted}`
}

// 복호화
export const decrypt = (encryptedText: string, key: string): string => {
  const algorithm = "aes-256-gcm"
  const [ivHex, authTagHex, encrypted] = encryptedText.split(":")

  const iv = Buffer.from(ivHex, "hex")
  const authTag = Buffer.from(authTagHex, "hex")

  const decipher = crypto.createDecipher(algorithm, key)
  decipher.setAuthTag(authTag)

  let decrypted = decipher.update(encrypted, "hex", "utf8")
  decrypted += decipher.final("utf8")

  return decrypted
}

// 입력값 정제
export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, "") // HTML 태그 제거
    .replace(/javascript:/gi, "") // JavaScript 제거
    .replace(/vbscript:/gi, "") // VBScript 제거
    .replace(/on\w+\s*=/gi, "") // 이벤트 핸들러 제거
}

// 이메일 정제
export const sanitizeEmail = (email: string): string => {
  return email.toLowerCase().trim()
}

// URL 정제
export const sanitizeUrl = (url: string): string => {
  try {
    const urlObj = new URL(url)
    return urlObj.toString()
  } catch {
    return ""
  }
}

// 파일명 정제
export const sanitizeFilename = (filename: string): string => {
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, "_")
    .replace(/_{2,}/g, "_")
    .replace(/^_|_$/g, "")
}

// SQL 인젝션 방지
export const escapeSql = (str: string): string => {
  return str
    .replace(/'/g, "''")
    .replace(/\\/g, "\\\\")
    .replace(/\0/g, "\\0")
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r")
    .replace(/\x1a/g, "\\Z")
}

// XSS 방지
export const escapeHtml = (str: string): string => {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;")
}

// CSRF 토큰 생성
export const generateCSRFToken = (): string => {
  return crypto.randomBytes(32).toString("hex")
}

// CSRF 토큰 검증
export const verifyCSRFToken = (
  token: string,
  sessionToken: string
): boolean => {
  return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(sessionToken))
}

// 세션 ID 생성
export const generateSessionId = (): string => {
  return crypto.randomBytes(32).toString("hex")
}

// 비밀번호 강도 검사
export const checkPasswordStrength = (
  password: string
): {
  score: number
  feedback: string[]
} => {
  const feedback: string[] = []
  let score = 0

  if (password.length >= 8) {
    score += 1
  } else {
    feedback.push("비밀번호는 최소 8자 이상이어야 합니다")
  }

  if (/[a-z]/.test(password)) {
    score += 1
  } else {
    feedback.push("소문자를 포함해야 합니다")
  }

  if (/[A-Z]/.test(password)) {
    score += 1
  } else {
    feedback.push("대문자를 포함해야 합니다")
  }

  if (/[0-9]/.test(password)) {
    score += 1
  } else {
    feedback.push("숫자를 포함해야 합니다")
  }

  if (/[^a-zA-Z0-9]/.test(password)) {
    score += 1
  } else {
    feedback.push("특수문자를 포함해야 합니다")
  }

  if (password.length >= 12) {
    score += 1
  }

  return { score, feedback }
}

// IP 주소 검증
export const isValidIP = (ip: string): boolean => {
  const ipv4Regex =
    /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
  const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/

  return ipv4Regex.test(ip) || ipv6Regex.test(ip)
}

// 도메인 검증
export const isValidDomain = (domain: string): boolean => {
  const domainRegex =
    /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)*[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$/
  return domainRegex.test(domain)
}

// 이메일 검증
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// 전화번호 검증
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^010-\d{4}-\d{4}$/
  return phoneRegex.test(phone)
}
