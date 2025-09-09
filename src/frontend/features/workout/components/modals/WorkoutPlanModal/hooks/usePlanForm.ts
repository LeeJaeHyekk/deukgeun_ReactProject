import { useState, useEffect, useCallback } from "react"
import type {
  WorkoutPlan,
  CreatePlanRequest,
  WorkoutPlanExercise,
} from "../../../../types"

// 폼에서 사용할 운동 타입 (BaseEntity 속성 제외)
interface FormExercise {
  exerciseId?: number // WorkoutPlanExercise와 호환성을 위해 추가
  machineId?: number
  machine: { id: number; name: string; imageUrl?: string; category: string; difficulty: "beginner" | "intermediate" | "advanced"; muscleGroups: string[]; gymId: number }
  order: number
  sets: number
  reps: number
  weight: number
  restSeconds: number
  notes?: string
}

// 폼 데이터 타입
interface FormData {
  name: string
  description: string
  difficulty: "beginner" | "intermediate" | "advanced"
  estimatedDurationMinutes: number
  targetMuscleGroups: string[]
  isTemplate: boolean
  isPublic: boolean
  exercises: FormExercise[]
}

export function usePlanForm(currentPlan: WorkoutPlan | null) {
  const [formData, setFormData] = useState<FormData>({
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
          exerciseId: exercise.exerciseId,
          machineId: exercise.machineId,
          order: exercise.order,
          sets: exercise.sets,
          reps: exercise.reps,
          weight: exercise.weight,
          restSeconds: exercise.restSeconds,
          notes: exercise.notes,
          machine: exercise.machine,
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
      isPublic: false,
      exercises: [],
    })
  }, [])

  const addExercise = useCallback(() => {
    const newExercise: FormExercise = {
      exerciseId: undefined,
      machineId: undefined,
      machine: { id: 0, name: "", imageUrl: "", category: "기타", difficulty: "beginner", muscleGroups: [], gymId: 1 },
      order: formData.exercises.length + 1,
      sets: 3,
      reps: 10,
      weight: 0,
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
      name: formData.name || "",
      description: formData.description || "",
      difficulty: (formData.difficulty || "beginner") as
        | "beginner"
        | "intermediate"
        | "advanced",
      estimatedDurationMinutes: formData.estimatedDurationMinutes || 60,
      targetMuscleGroups: formData.targetMuscleGroups || [],
      isTemplate: formData.isTemplate || false,
      isPublic: formData.isPublic || false,
      exercises: formData.exercises.map(exercise => ({
        exerciseId: exercise.exerciseId || 0,
        machineId: exercise.machineId || 0,
        order: exercise.order,
        sets: exercise.sets,
        reps: exercise.reps,
        weight: exercise.weight,
        restSeconds: exercise.restSeconds,
        notes: exercise.notes,
        machine: exercise.machine,
      })),
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
