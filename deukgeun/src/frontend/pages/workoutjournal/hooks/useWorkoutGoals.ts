import { useState, useCallback } from "react"
import { useAuthContext } from "../../../shared/contexts/AuthContext"

export interface WorkoutGoal {
  goal_id: number
  user_id: number
  goal_type:
    | "weight_lift"
    | "endurance"
    | "weight_loss"
    | "muscle_gain"
    | "strength"
    | "flexibility"
  target_value: number
  current_value: number
  unit: string
  target_date: string
  start_date: string
  status: "active" | "completed" | "paused" | "cancelled"
  progress_percentage: number
  created_at: string
  updated_at: string
}

export function useWorkoutGoals() {
  const { user } = useAuthContext()
  const [goals, setGoals] = useState<WorkoutGoal[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getUserGoals = useCallback(async () => {
    if (!user) {
      setError("사용자 정보가 없습니다.")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/workouts/goals`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.accessToken}`,
        },
      })

      if (!response.ok) {
        throw new Error("운동 목표를 불러오는데 실패했습니다.")
      }

      const data = await response.json()
      setGoals(data)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다."
      )
    } finally {
      setLoading(false)
    }
  }, [user])

  const createWorkoutGoal = useCallback(
    async (goalData: {
      goal_type:
        | "weight_lift"
        | "endurance"
        | "weight_loss"
        | "muscle_gain"
        | "strength"
        | "flexibility"
      target_value: number
      unit: string
      target_date: string
      start_date: string
    }) => {
      if (!user) {
        throw new Error("사용자 정보가 없습니다.")
      }

      try {
        const response = await fetch(`/api/workouts/goals`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.accessToken}`,
          },
          body: JSON.stringify({
            ...goalData,
            user_id: user.id,
          }),
        })

        if (!response.ok) {
          throw new Error("운동 목표 생성에 실패했습니다.")
        }

        const newGoal = await response.json()
        setGoals(prev => [newGoal, ...prev])
        return newGoal
      } catch (err) {
        throw err instanceof Error
          ? err
          : new Error("알 수 없는 오류가 발생했습니다.")
      }
    },
    [user]
  )

  const updateWorkoutGoal = useCallback(
    async (goalId: number, goalData: Partial<WorkoutGoal>) => {
      if (!user) {
        throw new Error("사용자 정보가 없습니다.")
      }

      try {
        const response = await fetch(`/api/workouts/goals/${goalId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.accessToken}`,
          },
          body: JSON.stringify(goalData),
        })

        if (!response.ok) {
          throw new Error("운동 목표 수정에 실패했습니다.")
        }

        const updatedGoal = await response.json()
        setGoals(prev =>
          prev.map(goal => (goal.goal_id === goalId ? updatedGoal : goal))
        )
        return updatedGoal
      } catch (err) {
        throw err instanceof Error
          ? err
          : new Error("알 수 없는 오류가 발생했습니다.")
      }
    },
    [user]
  )

  const deleteWorkoutGoal = useCallback(
    async (goalId: number) => {
      if (!user) {
        throw new Error("사용자 정보가 없습니다.")
      }

      try {
        const response = await fetch(`/api/workouts/goals/${goalId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${user.accessToken}`,
          },
        })

        if (!response.ok) {
          throw new Error("운동 목표 삭제에 실패했습니다.")
        }

        setGoals(prev => prev.filter(goal => goal.goal_id !== goalId))
      } catch (err) {
        throw err instanceof Error
          ? err
          : new Error("알 수 없는 오류가 발생했습니다.")
      }
    },
    [user]
  )

  const updateGoalProgress = useCallback(
    async (goalId: number, currentValue: number) => {
      if (!user) {
        throw new Error("사용자 정보가 없습니다.")
      }

      try {
        const goal = goals.find(g => g.goal_id === goalId)
        if (!goal) {
          throw new Error("목표를 찾을 수 없습니다.")
        }

        const progressPercentage = Math.min(
          (currentValue / goal.target_value) * 100,
          100
        )
        const status = progressPercentage >= 100 ? "completed" : goal.status

        const response = await fetch(`/api/workouts/goals/${goalId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.accessToken}`,
          },
          body: JSON.stringify({
            current_value: currentValue,
            progress_percentage: progressPercentage,
            status,
          }),
        })

        if (!response.ok) {
          throw new Error("목표 진행률 업데이트에 실패했습니다.")
        }

        const updatedGoal = await response.json()
        setGoals(prev =>
          prev.map(goal => (goal.goal_id === goalId ? updatedGoal : goal))
        )
        return updatedGoal
      } catch (err) {
        throw err instanceof Error
          ? err
          : new Error("알 수 없는 오류가 발생했습니다.")
      }
    },
    [user, goals]
  )

  const getActiveGoals = useCallback(() => {
    return goals.filter(goal => goal.status === "active")
  }, [goals])

  const getCompletedGoals = useCallback(() => {
    return goals.filter(goal => goal.status === "completed")
  }, [goals])

  return {
    goals,
    loading,
    error,
    getUserGoals,
    createWorkoutGoal,
    updateWorkoutGoal,
    deleteWorkoutGoal,
    updateGoalProgress,
    getActiveGoals,
    getCompletedGoals,
  }
}
