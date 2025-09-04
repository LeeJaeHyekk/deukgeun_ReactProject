import { useState, useCallback } from "react"
import type { CreatePlanRequest } from "../../../../types"

export function usePlanValidation() {
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = useCallback((formData: CreatePlanRequest): boolean => {
    const newErrors: Record<string, string> = {}

    // 계획 이름 검증
    if (!formData.name?.trim()) {
      newErrors.name = "계획 이름을 입력해주세요"
    }

    // 계획 설명 검증
    if (!formData.description?.trim()) {
      newErrors.description = "계획 설명을 입력해주세요"
    }

    // 예상 소요시간 검증
    if (
      !formData.estimatedDurationMinutes ||
      formData.estimatedDurationMinutes <= 0
    ) {
      newErrors.estimatedDurationMinutes = "예상 소요시간을 입력해주세요"
    }

    // 운동 목록 검증
    if (!formData.exercises || formData.exercises.length === 0) {
      newErrors.exercises = "최소 하나의 운동을 추가해주세요"
    } else {
      // 각 운동의 유효성 검사
      formData.exercises.forEach((exercise, index) => {
        if (!exercise.machine?.name?.trim()) {
          newErrors[`exercise_${index}_name`] = "운동 이름을 입력해주세요"
        }
        if (!exercise.sets || exercise.sets <= 0) {
          newErrors[`exercise_${index}_sets`] = "세트 수를 입력해주세요"
        }
        if (!exercise.reps || exercise.reps <= 0) {
          newErrors[`exercise_${index}_reps`] = "반복 횟수를 입력해주세요"
        }
      })
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [])

  const clearErrors = useCallback(() => {
    setErrors({})
  }, [])

  const setFieldError = useCallback((field: string, message: string) => {
    setErrors(prev => ({ ...prev, [field]: message }))
  }, [])

  const clearFieldError = useCallback((field: string) => {
    setErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors[field]
      return newErrors
    })
  }, [])

  return {
    errors,
    validateForm,
    clearErrors,
    setFieldError,
    clearFieldError,
  }
}
