import { useState, useCallback } from "react"
import { useAuthContext } from "../../../shared/contexts/AuthContext"
import { workoutApi, WorkoutPlan } from "../../../shared/api/workoutApi"

export function useWorkoutPlans() {
  const { user } = useAuthContext()
  const [plans, setPlans] = useState<WorkoutPlan[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getUserPlans = useCallback(async () => {
    if (!user) {
      setError("사용자 정보가 없습니다.")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const data = await workoutApi.getPlans(user.accessToken)
      setPlans(data)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다."
      )
    } finally {
      setLoading(false)
    }
  }, [user])

  const createWorkoutPlan = useCallback(
    async (planData: {
      name: string
      description?: string
      difficulty_level: "beginner" | "intermediate" | "advanced"
      estimated_duration_minutes: number
      target_muscle_groups?: string[]
      is_template?: boolean
      is_public?: boolean
      exercises: {
        machine_id: number
        exercise_order: number
        sets: number
        reps_range: { min: number; max: number }
        weight_range?: { min: number; max: number }
        rest_seconds?: number
        notes?: string
      }[]
    }) => {
      if (!user) {
        throw new Error("사용자 정보가 없습니다.")
      }

      try {
        const newPlan = await workoutApi.createPlan(user.accessToken, {
          ...planData,
          user_id: user.id,
        })
        setPlans(prev => [newPlan, ...prev])
        return newPlan
      } catch (err) {
        throw err instanceof Error
          ? err
          : new Error("알 수 없는 오류가 발생했습니다.")
      }
    },
    [user]
  )

  const updateWorkoutPlan = useCallback(
    async (planId: number, planData: Partial<WorkoutPlan>) => {
      if (!user) {
        throw new Error("사용자 정보가 없습니다.")
      }

      try {
        const updatedPlan = await workoutApi.updatePlan(
          user.accessToken,
          planId,
          planData
        )
        setPlans(prev =>
          prev.map(plan => (plan.plan_id === planId ? updatedPlan : plan))
        )
        return updatedPlan
      } catch (err) {
        throw err instanceof Error
          ? err
          : new Error("알 수 없는 오류가 발생했습니다.")
      }
    },
    [user]
  )

  const deleteWorkoutPlan = useCallback(
    async (planId: number) => {
      if (!user) {
        throw new Error("사용자 정보가 없습니다.")
      }

      try {
        await workoutApi.deletePlan(user.accessToken, planId)
        setPlans(prev => prev.filter(plan => plan.plan_id !== planId))
      } catch (err) {
        throw err instanceof Error
          ? err
          : new Error("알 수 없는 오류가 발생했습니다.")
      }
    },
    [user]
  )

  return {
    plans,
    loading,
    error,
    getUserPlans,
    createWorkoutPlan,
    updateWorkoutPlan,
    deleteWorkoutPlan,
  }
}
