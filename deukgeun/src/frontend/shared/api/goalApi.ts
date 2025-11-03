// ============================================================================
// Goal API Client - 백엔드 API 래퍼
// ============================================================================

import apiClient from './index'
import type { WorkoutGoal } from '../types/goal'

export const goalApi = {
  /**
   * 사용자의 모든 목표 조회
   */
  fetchGoals: async (userId: number | string): Promise<WorkoutGoal[]> => {
    const res = await apiClient.get<WorkoutGoal[]>(`/api/workouts/goals`, {
      params: { userId }
    })
    return res.data
  },

  /**
   * 특정 목표 조회
   */
  fetchGoal: async (goalId: number | string): Promise<WorkoutGoal> => {
    const res = await apiClient.get<WorkoutGoal>(`/api/workouts/goals/${goalId}`)
    return res.data
  },

  /**
   * 새 목표 생성
   */
  createGoal: async (payload: Partial<WorkoutGoal>): Promise<WorkoutGoal> => {
    const res = await apiClient.post<WorkoutGoal>(`/api/workouts/goals`, payload)
    return res.data
  },

  /**
   * 목표 수정
   */
  updateGoal: async (
    goalId: number | string,
    payload: Partial<WorkoutGoal>
  ): Promise<WorkoutGoal> => {
    const res = await apiClient.put<WorkoutGoal>(
      `/api/workouts/goals/${goalId}`,
      payload
    )
    return res.data
  },

  /**
   * 목표 삭제
   */
  deleteGoal: async (goalId: number | string): Promise<{ success: boolean }> => {
    const res = await apiClient.delete<{ success: boolean }>(
      `/api/workouts/goals/${goalId}`
    )
    return res.data
  },

  /**
   * 완료된 운동을 히스토리로 저장
   */
  saveCompletedWorkout: async (
    goalId: number | string,
    completedWorkout: {
      date: string
      sessionId?: number
      sessionName?: string
      completedAt: string
      totalDurationMinutes?: number
      totalSets?: number
      totalReps?: number
      expEarned?: number
      avgIntensity?: number
      moodRating?: number
      energyLevel?: number
      notes?: string
      summary?: {
        muscleGroups?: string[]
        equipmentUsed?: string[]
        comment?: string
      }
      actions?: any[]
    }
  ): Promise<any> => {
    // 먼저 목표를 조회하여 업데이트
    const goal = await goalApi.fetchGoal(goalId)
    
    // 히스토리 데이터 준비
    const historyData = {
      ...completedWorkout,
      date: completedWorkout.date || completedWorkout.completedAt,
    }

    // 목표의 history 배열 업데이트
    const updatedGoal = {
      ...goal,
      history: [...(goal.history || []), historyData],
      completedWorkouts: [...(goal.completedWorkouts || []), {
        completedId: `completed_${Date.now()}`,
        goalId: String(goalId),
        goalTitle: goal.goalTitle,
        completedAt: completedWorkout.completedAt,
        totalSets: completedWorkout.totalSets,
        totalReps: completedWorkout.totalReps,
        expEarned: completedWorkout.expEarned,
        durationMin: completedWorkout.totalDurationMinutes,
        summary: completedWorkout.summary,
      }],
      isCompleted: goal.status === 'done' || goal.status === 'completed',
      status: goal.status === 'done' ? 'completed' : goal.status,
    }

    // 목표 업데이트
    return await goalApi.updateGoal(goalId, updatedGoal)
  }
}

