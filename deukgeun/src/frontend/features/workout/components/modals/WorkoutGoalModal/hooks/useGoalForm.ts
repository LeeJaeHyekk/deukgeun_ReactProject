import { useState, useEffect, useCallback } from "react"
import type { WorkoutGoal } from "../../../../shared/types"

export function useGoalForm(goal?: WorkoutGoal | null) {
  const [formData, setFormData] = useState<Partial<WorkoutGoal>>({
    title: "",
    description: "",
    type: "weight",
    targetValue: 0,
    currentValue: 0,
    unit: "kg",
    deadline: undefined,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // 기존 목표가 있으면 폼 데이터 초기화
  useEffect(() => {
    if (goal) {
      setFormData({
        title: goal.title || "",
        description: goal.description || "",
        type: goal.type,
        targetValue: goal.targetValue,
        currentValue: goal.currentValue || 0,
        unit: goal.unit,
        deadline: goal.deadline,
      })
    } else {
      setFormData({
        title: "",
        description: "",
        type: "weight",
        targetValue: 0,
        currentValue: 0,
        unit: "kg",
        deadline: undefined,
      })
    }
    setErrors({})
  }, [goal])

  // 입력 필드 변경 핸들러
  const handleInputChange = useCallback(
    (field: keyof WorkoutGoal, value: any) => {
      setFormData(prev => ({ ...prev, [field]: value }))
      // 에러 제거
      if (errors[field]) {
        setErrors(prev => ({ ...prev, [field]: "" }))
      }
    },
    [errors]
  )

  // 목표 타입 변경 시 단위 자동 설정
  const handleTypeChange = useCallback(
    (type: WorkoutGoal["type"]) => {
      const goalTypes = [
        { value: "weight", unit: "kg" },
        { value: "reps", unit: "회" },
        { value: "duration", unit: "분" },
        { value: "frequency", unit: "회/주" },
        { value: "streak", unit: "일" },
      ]
      const goalType = goalTypes.find(t => t.value === type)

      setFormData(prev => ({
        ...prev,
        type,
        unit: goalType?.unit || "kg",
      }))
      if (errors.type) {
        setErrors(prev => ({ ...prev, type: "" }))
      }
    },
    [errors.type]
  )

  // 폼 검증
  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.title?.trim()) {
      newErrors.title = "목표 제목을 입력해주세요."
    }

    if (!formData.targetValue || formData.targetValue <= 0) {
      newErrors.targetValue = "목표값을 입력해주세요."
    }

    if (formData.currentValue && formData.currentValue < 0) {
      newErrors.currentValue = "현재값은 0 이상이어야 합니다."
    }

    if (formData.deadline && new Date(formData.deadline) <= new Date()) {
      newErrors.deadline = "마감일은 오늘 이후로 설정해주세요."
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData])

  return {
    formData,
    errors,
    handleInputChange,
    handleTypeChange,
    validateForm,
  }
}
