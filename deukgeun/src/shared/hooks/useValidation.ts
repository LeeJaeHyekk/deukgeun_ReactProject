// ============================================================================
// 폼 검증 훅
// ============================================================================

import { useState, useCallback, useMemo } from "react"

// 검증 규칙 타입
export type ValidationRule<T> = {
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  custom?: (value: T) => string | undefined
  message?: string
}

// 검증 스키마 타입
export type ValidationSchema<T> = {
  [K in keyof T]?: ValidationRule<T[K]>
}

// 검증 결과 타입
export type ValidationResult = {
  isValid: boolean
  errors: Record<string, string>
}

// 검증 훅 옵션
export interface UseValidationOptions<T> {
  schema: ValidationSchema<T>
  initialValues: T
  validateOnChange?: boolean
  validateOnBlur?: boolean
  validateOnSubmit?: boolean
}

// 검증 훅 반환 타입
export interface UseValidationReturn<T> {
  values: T
  errors: Record<string, string>
  touched: Record<string, boolean>
  isValid: boolean
  setValue: (field: keyof T, value: T[keyof T]) => void
  setValues: (values: Partial<T>) => void
  setError: (field: keyof T, error: string) => void
  setErrors: (errors: Record<string, string>) => void
  setTouched: (field: keyof T, touched: boolean) => void
  setTouchedAll: (touched: boolean) => void
  validate: (values?: Partial<T>) => ValidationResult
  validateField: (field: keyof T, value?: T[keyof T]) => string | undefined
  reset: () => void
  resetErrors: () => void
  resetTouched: () => void
}

// 검증 훅
export function useValidation<T extends Record<string, unknown>>(
  options: UseValidationOptions<T>
): UseValidationReturn<T> {
  const {
    schema,
    initialValues,
    validateOnChange = true,
    validateOnBlur = true,
    validateOnSubmit = true,
  } = options

  const [values, setValuesState] = useState<T>(initialValues)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  // 단일 필드 검증
  const validateField = useCallback(
    (field: keyof T, value?: T[keyof T]): string | undefined => {
      const fieldValue = value ?? values[field]
      const rules = schema[field]

      if (!rules) return undefined

      // 필수 검증
      if (rules.required && (!fieldValue || fieldValue === "")) {
        return rules.message || `${String(field)} is required`
      }

      // 문자열 길이 검증
      if (typeof fieldValue === "string") {
        if (rules.minLength && fieldValue.length < rules.minLength) {
          return (
            rules.message ||
            `${String(field)} must be at least ${rules.minLength} characters`
          )
        }

        if (rules.maxLength && fieldValue.length > rules.maxLength) {
          return (
            rules.message ||
            `${String(field)} must be at most ${rules.maxLength} characters`
          )
        }

        // 패턴 검증
        if (rules.pattern && !rules.pattern.test(fieldValue)) {
          return rules.message || `${String(field)} format is invalid`
        }
      }

      // 커스텀 검증
      if (rules.custom) {
        return rules.custom(fieldValue)
      }

      return undefined
    },
    [values, schema]
  )

  // 전체 폼 검증
  const validate = useCallback(
    (valuesToValidate: Partial<T> = values): ValidationResult => {
      const newErrors: Record<string, string> = {}

      Object.keys(schema).forEach(field => {
        const error = validateField(
          field as keyof T,
          valuesToValidate[field as keyof T]
        )
        if (error) {
          newErrors[field] = error
        }
      })

      return {
        isValid: Object.keys(newErrors).length === 0,
        errors: newErrors,
      }
    },
    [schema, validateField, values]
  )

  // 값 설정
  const setValue = useCallback(
    (field: keyof T, value: T[keyof T]) => {
      setValuesState(prev => ({ ...prev, [field]: value }))

      if (validateOnChange) {
        const error = validateField(field, value)
        setErrors(prev => ({
          ...prev,
          [field]: error || "",
        }))
      }
    },
    [validateOnChange, validateField]
  )

  // 여러 값 설정
  const setValuesMultiple = useCallback(
    (newValues: Partial<T>) => {
      setValuesState(prev => ({ ...prev, ...newValues }))

      if (validateOnChange) {
        const validationResult = validate({ ...values, ...newValues })
        setErrors(validationResult.errors)
      }
    },
    [validateOnChange, validate, values]
  )

  // 에러 설정
  const setErrorField = useCallback((field: keyof T, error: string) => {
    setErrors(prev => ({ ...prev, [field]: error }))
  }, [])

  const setErrorsMultiple = useCallback((newErrors: Record<string, string>) => {
    setErrors(prev => ({ ...prev, ...newErrors }))
  }, [])

  // 터치 상태 설정
  const setTouchedField = useCallback(
    (field: keyof T, touchedState: boolean) => {
      setTouched(prev => ({ ...prev, [field]: touchedState }))

      if (validateOnBlur && touchedState) {
        const error = validateField(field)
        setErrors(prev => ({
          ...prev,
          [field]: error || "",
        }))
      }
    },
    [validateOnBlur, validateField]
  )

  const setTouchedAll = useCallback(
    (touchedState: boolean) => {
      const allFields = Object.keys(schema)
      const newTouched: Record<string, boolean> = {}
      allFields.forEach(field => {
        newTouched[field] = touchedState
      })
      setTouched(newTouched)
    },
    [schema]
  )

  // 리셋 함수들
  const reset = useCallback(() => {
    setValuesState(initialValues)
    setErrors({})
    setTouched({})
  }, [initialValues])

  const resetErrors = useCallback(() => {
    setErrors({})
  }, [])

  const resetTouched = useCallback(() => {
    setTouched({})
  }, [])

  // 유효성 상태 계산
  const isValid = useMemo(() => {
    return Object.keys(errors).length === 0
  }, [errors])

  return {
    values,
    errors,
    touched,
    isValid,
    setValue,
    setValues: setValuesMultiple,
    setError: setErrorField,
    setErrors: setErrorsMultiple,
    setTouched: setTouchedField,
    setTouchedAll,
    validate,
    validateField,
    reset,
    resetErrors,
    resetTouched,
  }
}

// 간단한 검증 유틸리티 함수들
export const validationUtils = {
  // 이메일 검증
  isEmail: (value: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(value)
  },

  // 비밀번호 검증 (최소 8자, 영문+숫자+특수문자)
  isStrongPassword: (value: string): boolean => {
    const passwordRegex =
      /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
    return passwordRegex.test(value)
  },

  // 전화번호 검증
  isPhoneNumber: (value: string): boolean => {
    const phoneRegex = /^[0-9-+\s()]+$/
    return phoneRegex.test(value) && value.replace(/[^0-9]/g, "").length >= 10
  },

  // URL 검증
  isUrl: (value: string): boolean => {
    try {
      new URL(value)
      return true
    } catch {
      return false
    }
  },

  // 숫자 검증
  isNumber: (value: string): boolean => {
    return !isNaN(Number(value)) && !isNaN(parseFloat(value))
  },

  // 정수 검증
  isInteger: (value: string): boolean => {
    return Number.isInteger(Number(value))
  },

  // 최소값 검증
  min: (value: number, min: number): boolean => {
    return value >= min
  },

  // 최대값 검증
  max: (value: number, max: number): boolean => {
    return value <= max
  },

  // 범위 검증
  range: (value: number, min: number, max: number): boolean => {
    return value >= min && value <= max
  },
}
