import { useState, useEffect, useCallback } from 'react'
import { workoutApi } from '../api/workoutApi'
import type { WorkoutGoal } from '../types'

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
      const data = await workoutApi.getGoals()
      console.log(`✅ [useWorkoutGoals] 운동 목표 ${data.length}개 조회 성공`)
      setGoals(data)
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : '운동 목표를 불러오는데 실패했습니다.'
      console.error(`❌ [useWorkoutGoals] 운동 목표 조회 실패:`, err)
      setError(errorMessage)
    } finally {
      setLoading(false)
      console.log(`🏁 [useWorkoutGoals] getUserGoals 완료`)
    }
  }, [])

  const createGoal = useCallback(async (goalData: Partial<WorkoutGoal>) => {
    const requestId = Math.random().toString(36).substring(2, 15)
    console.log(`🔍 [useWorkoutGoals:${requestId}] createGoal 시작`, {
      goalData,
    })

    try {
      setLoading(true)
      setError(null)
      // userId는 백엔드에서 인증된 사용자 정보로 설정하므로 제거
      const { userId, ...createData } = goalData
      console.log(
        `📝 [useWorkoutGoals:${requestId}] API 호출용 데이터:`,
        createData
      )

      console.log(
        `📡 [useWorkoutGoals:${requestId}] workoutApi.createGoal 호출`
      )
      const newGoal = await workoutApi.createGoal(createData as any)

      console.log(`✅ [useWorkoutGoals:${requestId}] 목표 생성 성공:`, newGoal)
      setGoals(prev => {
        const updated = [newGoal, ...prev]
        console.log(
          `📝 [useWorkoutGoals:${requestId}] 목표 목록 업데이트:`,
          updated
        )
        return updated
      })
      return newGoal
    } catch (err) {
      console.error(
        `❌ [useWorkoutGoals:${requestId}] 운동 목표 생성 실패:`,
        err
      )
      const errorMessage =
        err instanceof Error ? err.message : '운동 목표 생성에 실패했습니다.'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
      console.log(`🏁 [useWorkoutGoals:${requestId}] createGoal 완료`)
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
        const updatedGoal = await workoutApi.updateGoal(goalId, updateData)
        setGoals(prev =>
          prev.map(goal => (goal.goal_id === goalId ? updatedGoal : goal))
        )
        return updatedGoal
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : '운동 목표 업데이트에 실패했습니다.'
        console.error('운동 목표 업데이트 실패:', err)
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

      // 개발 환경에서 더미 데이터 처리
      if (
        import.meta.env.MODE === 'development' &&
        (goalId === 1 || goalId === 2)
      ) {
        console.log(`🔧 개발 환경 - 더미 목표 삭제 처리: ${goalId}`)
        setGoals(prev => prev.filter(goal => goal.goal_id !== goalId))
        return
      }

      await workoutApi.deleteGoal(goalId)
      setGoals(prev => prev.filter(goal => goal.goal_id !== goalId))
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : '운동 목표 삭제에 실패했습니다.'
      console.error('운동 목표 삭제 실패:', err)
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
