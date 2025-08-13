import { useState, useEffect, useCallback } from "react"
import {
  WorkoutJournalApi,
  WorkoutPlan,
} from "../../../shared/api/workoutJournalApi"

export function useWorkoutPlans() {
  const [plans, setPlans] = useState<WorkoutPlan[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getUserPlans = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await WorkoutJournalApi.getWorkoutPlans()
      setPlans(data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "운동 계획을 불러오는데 실패했습니다."
      console.error("운동 계획 조회 실패:", err)
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  const createPlan = useCallback(async (planData: Partial<WorkoutPlan>) => {
    try {
      setLoading(true)
      setError(null)
      const newPlan = await WorkoutJournalApi.createWorkoutPlan(planData)
      setPlans(prev => [newPlan, ...prev])
      return newPlan
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "운동 계획 생성에 실패했습니다."
      console.error("운동 계획 생성 실패:", err)
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const updatePlan = useCallback(async (planId: number, planData: Partial<WorkoutPlan>) => {
    try {
      setLoading(true)
      setError(null)
      const updatedPlan = await WorkoutJournalApi.updateWorkoutPlan(planId, planData)
      setPlans(prev =>
        prev.map(plan =>
          plan.plan_id === planId ? updatedPlan : plan
        )
      )
      return updatedPlan
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "운동 계획 업데이트에 실패했습니다."
      console.error("운동 계획 업데이트 실패:", err)
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const deletePlan = useCallback(async (planId: number) => {
    try {
      setLoading(true)
      setError(null)
      await WorkoutJournalApi.deleteWorkoutPlan(planId)
      setPlans(prev => prev.filter(plan => plan.plan_id !== planId))
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "운동 계획 삭제에 실패했습니다."
      console.error("운동 계획 삭제 실패:", err)
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  useEffect(() => {
    getUserPlans()
  }, [getUserPlans])

  return {
    plans,
    loading,
    error,
    getUserPlans,
    createPlan,
    updatePlan,
    deletePlan,
    clearError,
  }
}
