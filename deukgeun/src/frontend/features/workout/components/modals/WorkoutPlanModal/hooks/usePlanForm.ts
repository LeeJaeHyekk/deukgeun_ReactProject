import { useState, useEffect, useCallback } from "react"
import type {
  WorkoutPlan,
  CreatePlanRequest,
  WorkoutPlanExercise,
} from "../../../../types"

// 폼에서 사용할 운동 타입 (BaseEntity 속성 제외)
interface FormExercise {
  machineId?: number
  exerciseName: string
  exerciseOrder: number
  sets: number
  repsRange: { min: number; max: number }
  weightRange?: { min: number; max: number }
  restSeconds: number
  notes?: string
}

// 폼 데이터 타입 (isPublic 제거)
interface FormData {
  name: string
  description?: string
  difficulty?: string
  estimatedDurationMinutes?: number
  targetMuscleGroups?: string[]
  isTemplate?: boolean
  exercises: FormExercise[]
  goals?: any[]
}

export function usePlanForm(currentPlan: WorkoutPlan | null) {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    difficulty: "beginner",
    estimatedDurationMinutes: 60,
    targetMuscleGroups: [],
    isTemplate: false,
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
        exercises: [],
      })
    }
  }, [currentPlan])

  const updateFormData = useCallback((updates: Partial<FormData>) => {
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
      exercises: [],
    })
  }, [])

  const addExercise = useCallback(() => {
    const newExercise: FormExercise = {
      machineId: undefined,
      exerciseName: "",
      exerciseOrder: formData.exercises.length + 1,
      sets: 3,
      repsRange: { min: 8, max: 12 },
      weightRange: { min: 0, max: 0 },
      restSeconds: 60,
      notes: "",
    }
    setFormData(prev => ({
      ...prev,
      exercises: [...prev.exercises, newExercise],
    }))
  }, [formData.exercises.length])

  const updateExercise = useCallback(
    (index: number, exercise: FormExercise) => {
      setFormData(prev => ({
        ...prev,
        exercises: prev.exercises.map((ex, i) => (i === index ? exercise : ex)),
      }))
    },
    []
  )

  const removeExercise = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      exercises: prev.exercises.filter((_, i) => i !== index),
    }))
  }, [])

  // CreatePlanRequest로 변환하는 함수
  const getCreatePlanRequest = useCallback((): CreatePlanRequest => {
    return {
      name: formData.name,
      description: formData.description,
      difficulty: formData.difficulty,
      estimatedDurationMinutes: formData.estimatedDurationMinutes,
      targetMuscleGroups: formData.targetMuscleGroups,
      isTemplate: formData.isTemplate,
      exercises: formData.exercises as WorkoutPlanExercise[], // 타입 캐스팅
      goals: formData.goals,
    }
  }, [formData])

  return {
    formData,
    updateFormData,
    resetForm,
    addExercise,
    updateExercise,
    removeExercise,
    getCreatePlanRequest,
  }
}
