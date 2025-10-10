import { useState, useEffect, useCallback } from "react"
import type {
  WorkoutPlanDTO,
  WorkoutPlanExercise,
  WorkoutPlanExerciseForm,
} from "@/shared/types/dto"
import type { WorkoutPlan, CreatePlanRequest } from "@/shared/types/common"
import { createEmptyWorkoutPlanExerciseForm } from "@/shared/utils/transform/workoutPlanExercise"

// 폼에서 사용할 운동 타입 (새로운 구조 사용)
export type FormExercise = WorkoutPlanExerciseForm

// 폼 데이터 타입 (CreatePlanRequest와 호환)
interface FormData {
  name: string
  description?: string
  difficulty: "beginner" | "intermediate" | "advanced"
  estimatedDurationMinutes: number
  targetMuscleGroups?: string[]
  isTemplate?: boolean
  exercises: Array<{
    machineId?: number
    exerciseName: string
    exerciseOrder: number
    sets: number
    repsRange: { min: number; max: number }
    weightRange?: { min: number; max: number }
    restSeconds: number
    notes?: string
  }>
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
        exercises: currentPlan.exercises.map((exercise) => ({
          id: exercise.id,
          planId: exercise.planId,
          exerciseId: exercise.exerciseId,
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
      exercises: [],
    })
  }, [])

  const addExercise = useCallback(() => {
    const newExercise = createEmptyWorkoutPlanExerciseForm(currentPlan?.id || 0)
    newExercise.exerciseId = 0 // 새 운동이므로 0으로 설정
    newExercise.exerciseOrder = formData.exercises.length + 1
    newExercise.sets = 3
    newExercise.repsRange = { min: 8, max: 12 }
    newExercise.weightRange = { min: 0, max: 0 }
    newExercise.restSeconds = 60
    
    setFormData(prev => ({
      ...prev,
      exercises: [...prev.exercises, newExercise],
    }))
  }, [formData.exercises.length, currentPlan?.id])

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

  // exercises를 WorkoutPlanExerciseForm[]로 변환하는 함수
  const getExercisesAsForm = useCallback((): WorkoutPlanExerciseForm[] => {
    return formData.exercises.map((exercise, index) => ({
      id: 0, // 새 운동이므로 0으로 설정
      planId: currentPlan?.id || 0,
      exerciseId: 0, // 새 운동이므로 0으로 설정
      machineId: exercise.machineId,
      exerciseName: exercise.exerciseName,
      exerciseOrder: exercise.exerciseOrder || index + 1,
      sets: exercise.sets,
      repsRange: exercise.repsRange,
      weightRange: exercise.weightRange,
      restSeconds: exercise.restSeconds,
      notes: exercise.notes,
    }))
  }, [formData.exercises, currentPlan?.id])

  // CreatePlanRequest로 변환하는 함수
  const getCreatePlanRequest = useCallback((): CreatePlanRequest => {
    return {
      name: formData.name || "",
      description: formData.description || "",
      difficulty: (formData.difficulty || "beginner") as
        | "beginner"
        | "intermediate"
        | "advanced",
      estimatedDurationMinutes: formData.estimatedDurationMinutes || 60,
      targetMuscleGroups: formData.targetMuscleGroups || [],
      isTemplate: formData.isTemplate || false,
      exercises: formData.exercises as WorkoutPlanExercise[], // 타입 캐스팅

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
    getExercisesAsForm,
  }
}
