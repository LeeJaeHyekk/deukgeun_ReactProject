import { useState, useEffect, useCallback } from "react"
import type { WorkoutPlan, CreatePlanRequest } from "../../../../shared/types"

export function usePlanForm(currentPlan: WorkoutPlan | null) {
  const [formData, setFormData] = useState<CreatePlanRequest>({
    name: "",
    description: "",
    difficulty: "beginner",
    estimatedDurationMinutes: 60,
    targetMuscleGroups: [],
    isTemplate: false,
    isPublic: false,
    exercises: [],
  })

  // 현재 계획이 변경되면 폼 데이터 초기화
  useEffect(() => {
    if (currentPlan) {
      setFormData({
        name: currentPlan.name,
        description: currentPlan.description || "",
        difficulty: currentPlan.difficulty,
        estimatedDurationMinutes: currentPlan.estimatedDurationMinutes,
        targetMuscleGroups: currentPlan.targetMuscleGroups || [],
        isTemplate: currentPlan.isTemplate,
        isPublic: currentPlan.isPublic,
        exercises: currentPlan.exercises.map(exercise => ({
          machineId: exercise.machineId,
          exerciseName: exercise.exerciseName,
          exerciseOrder: exercise.exerciseOrder,
          sets: exercise.sets,
          repsRange: exercise.repsRange,
          weightRange: exercise.weightRange,
          restSeconds: exercise.restSeconds,
          notes: exercise.notes,
        })),
      })
    } else {
      // 새 계획 생성 시 기본값으로 초기화
      setFormData({
        name: "",
        description: "",
        difficulty: "beginner",
        estimatedDurationMinutes: 60,
        targetMuscleGroups: [],
        isTemplate: false,
        isPublic: false,
        exercises: [],
      })
    }
  }, [currentPlan])

  const updateFormData = useCallback((updates: Partial<CreatePlanRequest>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }, [])

  const resetForm = useCallback(() => {
    setFormData({
      name: "",
      description: "",
      difficulty: "beginner",
      estimatedDurationMinutes: 60,
      targetMuscleGroups: [],
      isTemplate: false,
      isPublic: false,
      exercises: [],
    })
  }, [])

  return {
    formData,
    updateFormData,
    resetForm,
  }
}
