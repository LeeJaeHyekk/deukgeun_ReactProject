import { useState, useEffect } from "react"
import {
  WorkoutJournalApi,
  WorkoutGoal,
} from "../../../shared/api/workoutJournalApi"

export function useWorkoutGoals() {
  const [goals, setGoals] = useState<WorkoutGoal[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getUserGoals = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await WorkoutJournalApi.getWorkoutGoals()
      setGoals(data)
    } catch (err) {
      console.error("운동 목표 조회 실패:", err)
      setError("운동 목표를 불러오는데 실패했습니다.")
    } finally {
      setLoading(false)
    }
  }

  const createWorkoutGoal = async (goalData: Partial<WorkoutGoal>) => {
    try {
      setLoading(true)
      setError(null)
      const newGoal = await WorkoutJournalApi.createWorkoutGoal(goalData)
      setGoals(prev => [newGoal, ...prev])
      return newGoal
    } catch (err) {
      console.error("운동 목표 생성 실패:", err)
      setError("운동 목표 생성에 실패했습니다.")
      throw err
    } finally {
      setLoading(false)
    }
  }

  const updateWorkoutGoal = async (
    goalId: number,
    updateData: Partial<WorkoutGoal>
  ) => {
    try {
      setLoading(true)
      setError(null)
      const updatedGoal = await WorkoutJournalApi.updateWorkoutGoal(
        goalId,
        updateData
      )
      setGoals(prev =>
        prev.map(goal => (goal.goal_id === goalId ? updatedGoal : goal))
      )
      return updatedGoal
    } catch (err) {
      console.error("운동 목표 업데이트 실패:", err)
      setError("운동 목표 업데이트에 실패했습니다.")
      throw err
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getUserGoals()
  }, [])

  return {
    goals,
    loading,
    error,
    getUserGoals,
    createWorkoutGoal,
    updateWorkoutGoal,
  }
}
