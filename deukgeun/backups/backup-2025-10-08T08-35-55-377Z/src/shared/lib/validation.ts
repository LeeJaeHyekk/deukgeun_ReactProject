// ============================================================================
// Validation utilities
// ============================================================================

export const validation = {
  // Email validation
  isEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  },

  // Password validation
  isPassword: (password: string): boolean => {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/
    return passwordRegex.test(password)
  },

  // Phone number validation (Korean format)
  isPhoneNumber: (phone: string): boolean => {
    const phoneRegex = /^01[0-9]-?[0-9]{4}-?[0-9]{4}$/
    return phoneRegex.test(phone.replace(/\s/g, ''))
  },

  // Nickname validation
  isNickname: (nickname: string): boolean => {
    // 2-20 characters, Korean, English, numbers only
    const nicknameRegex = /^[가-힣a-zA-Z0-9]{2,20}$/
    return nicknameRegex.test(nickname)
  },

  // Required field validation
  isRequired: (value: any): boolean => {
    if (typeof value === 'string') {
      return value.trim().length > 0
    }
    return value !== null && value !== undefined
  },

  // Minimum length validation
  minLength: (value: string, min: number): boolean => {
    return value.length >= min
  },

  // Maximum length validation
  maxLength: (value: string, max: number): boolean => {
    return value.length <= max
  },

  // Number validation
  isNumber: (value: any): boolean => {
    return !isNaN(Number(value)) && isFinite(Number(value))
  },

  // Positive number validation
  isPositiveNumber: (value: any): boolean => {
    return validation.isNumber(value) && Number(value) > 0
  },

  // URL validation
  isUrl: (url: string): boolean => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  },

  // Date validation
  isDate: (date: any): boolean => {
    return date instanceof Date && !isNaN(date.getTime())
  },

  // Age validation
  isAge: (age: any): boolean => {
    return validation.isPositiveNumber(age) && Number(age) >= 0 && Number(age) <= 150
  },
}
