import { useState, useCallback } from "react"
import {
  validateForm as validateAuthForm,
  validateField as getFieldValidationState,
  AUTH_VALIDATION_RULES,
} from "../utils/validation"

interface UseAuthFormOptions<T> {
  initialData: T
  validationFields: (keyof typeof AUTH_VALIDATION_RULES)[]
  onSubmit: (data: T) => Promise<void>
  onError?: (errors: Record<string, string>) => void
}

interface UseAuthFormReturn<T> {
  formData: T
  errors: Record<string, string>
  loading: boolean
  updateField: (field: keyof T, value: any) => void
  validateField: (field: keyof T) => void
  validateForm: () => boolean
  handleSubmit: (e: React.FormEvent) => Promise<void>
  resetForm: () => void
  clearErrors: () => void
}

export function useAuthForm<T extends Record<string, any>>({
  initialData,
  validationFields,
  onSubmit,
  onError,
}: UseAuthFormOptions<T>): UseAuthFormReturn<T> {
  const [formData, setFormData] = useState<T>(initialData)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  // 필드 업데이트
  const updateField = useCallback(
    (field: keyof T, value: any) => {
      setFormData(prev => ({ ...prev, [field]: value }))

      // 에러가 있으면 자동으로 검증
      if (errors[field as string]) {
        validateField(field)
      }
    },
    [errors]
  )

  // 개별 필드 검증
  const validateField = useCallback(
    (field: keyof T) => {
      const fieldName = field as keyof typeof AUTH_VALIDATION_RULES
      const value = formData[field]

      if (validationFields.includes(fieldName)) {
        const result = getFieldValidationState(fieldName, value, formData)

        setErrors(prev => ({
          ...prev,
          [field]: result.isValid ? "" : result.message,
        }))
      }
    },
    [formData, validationFields]
  )

  // 전체 폼 검증
  const validateForm = useCallback(() => {
    const validationResult = validateAuthForm(formData, validationFields)
    
    // validateAuthForm이 { isValid, errors } 구조로 반환하는 경우
    if (typeof validationResult === 'object' && validationResult !== null && 'errors' in validationResult) {
      const { errors: newErrors } = validationResult as { isValid: boolean; errors: Record<string, string> }
      setErrors(newErrors)
      
      const isValid = Object.keys(newErrors).length === 0
      
      if (!isValid && onError) {
        onError(newErrors)
      }
      
      return isValid
    } else {
      // validateAuthForm이 직접 errors 객체를 반환하는 경우
      const newErrors = validationResult as unknown as Record<string, string>
      setErrors(newErrors)
      
      const isValid = Object.keys(newErrors).length === 0
      
      if (!isValid && onError) {
        onError(newErrors)
      }
      
      return isValid
    }
  }, [formData, validationFields, onError])

  // 폼 제출
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()

      if (!validateForm()) {
        return
      }

      setLoading(true)

      try {
        await onSubmit(formData)
      } catch (error) {
        console.error("Form submission error:", error)
      } finally {
        setLoading(false)
      }
    },
    [formData, validateForm, onSubmit]
  )

  // 폼 초기화
  const resetForm = useCallback(() => {
    setFormData(initialData)
    setErrors({})
  }, [initialData])

  // 에러 초기화
  const clearErrors = useCallback(() => {
    setErrors({})
  }, [])

  return {
    formData,
    errors,
    loading,
    updateField,
    validateField,
    validateForm,
    handleSubmit,
    resetForm,
    clearErrors,
  }
}
