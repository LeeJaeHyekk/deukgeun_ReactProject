import { useState, useEffect, useCallback } from "react"
import {
  WorkoutJournalApi,
  WorkoutGoal,
} from "../../../shared/api/workoutJournalApi"

export function useWorkoutGoals() {
  const [goals, setGoals] = useState<WorkoutGoal[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getUserGoals = useCallback(async () => {
    console.log(`🔍 [useWorkoutGoals] getUserGoals 호출 시작`)
    try {
      setLoading(true)
      setError(null)
      console.log(`📡 [useWorkoutGoals] API 호출 중...`)
      const data = await WorkoutJournalApi.getWorkoutGoals()
      console.log(`✅ [useWorkoutGoals] 운동 목표 ${data.length}개 조회 성공`)
      setGoals(data)
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "운동 목표를 불러오는데 실패했습니다."
      console.error(`❌ [useWorkoutGoals] 운동 목표 조회 실패:`, err)
      setError(errorMessage)
    } finally {
      setLoading(false)
      console.log(`🏁 [useWorkoutGoals] getUserGoals 완료`)
    }
  }, [])

  const createGoal = useCallback(async (goalData: Partial<WorkoutGoal>) => {
    try {
      setLoading(true)
      setError(null)
      // userId는 백엔드에서 인증된 사용자 정보로 설정하므로 제거
      const { userId, ...createData } = goalData
      const newGoal = await WorkoutJournalApi.createWorkoutGoal(
        createData as any
      )
      setGoals(prev => [newGoal, ...prev])
      return newGoal
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "운동 목표 생성에 실패했습니다."
      console.error("운동 목표 생성 실패:", err)
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const updateGoal = useCallback(
    async (goalId: number, goalData: Partial<WorkoutGoal>) => {
      try {
        setLoading(true)
        setError(null)
        // goalId가 필수이므로 추가
        const updateData = {
          ...goalData,
          goalId,
        } as any
        const updatedGoal = await WorkoutJournalApi.updateWorkoutGoal(
          goalId,
          updateData
        )
        setGoals(prev =>
          prev.map(goal => (goal.goal_id === goalId ? updatedGoal : goal))
        )
        return updatedGoal
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "운동 목표 업데이트에 실패했습니다."
        console.error("운동 목표 업데이트 실패:", err)
        setError(errorMessage)
        throw err
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const deleteGoal = useCallback(async (goalId: number) => {
    try {
      setLoading(true)
      setError(null)
      await WorkoutJournalApi.deleteWorkoutGoal(goalId)
      setGoals(prev => prev.filter(goal => goal.goal_id !== goalId))
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "운동 목표 삭제에 실패했습니다."
      console.error("운동 목표 삭제 실패:", err)
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
    getUserGoals()
  }, [getUserGoals])

  return {
    goals,
    loading,
    error,
    getUserGoals,
    createGoal,
    updateGoal,
    deleteGoal,
    clearError,
  }
}
