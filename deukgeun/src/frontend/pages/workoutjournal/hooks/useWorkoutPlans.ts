import { useState, useEffect } from "react"
import {
  WorkoutJournalApi,
  WorkoutPlan,
} from "../../../shared/api/workoutJournalApi"

export function useWorkoutPlans() {
  const [plans, setPlans] = useState<WorkoutPlan[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getUserPlans = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await WorkoutJournalApi.getWorkoutPlans()
      setPlans(data)
    } catch (err) {
      console.error("운동 계획 조회 실패:", err)
      setError("운동 계획을 불러오는데 실패했습니다.")
    } finally {
      setLoading(false)
    }
  }

  const createWorkoutPlan = async (planData: Partial<WorkoutPlan>) => {
    try {
      setLoading(true)
      setError(null)
      const newPlan = await WorkoutJournalApi.createWorkoutPlan(planData)
      setPlans(prev => [newPlan, ...prev])
      return newPlan
    } catch (err) {
      console.error("운동 계획 생성 실패:", err)
      setError("운동 계획 생성에 실패했습니다.")
      throw err
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getUserPlans()
  }, [])

  return {
    plans,
    loading,
    error,
    getUserPlans,
    createWorkoutPlan,
  }
}
