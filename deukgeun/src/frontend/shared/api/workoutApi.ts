import type {
  WorkoutPlan,
  WorkoutSession,
  WorkoutGoal,
  ExerciseSet,
} from "../../../shared/types"

// API 함수들
export const workoutApi = {
  // 운동 계획 관련
  async getPlans(accessToken: string): Promise<WorkoutPlan[]> {
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/workout/plans`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    )

    if (!response.ok) {
      throw new Error("운동 계획을 불러오는데 실패했습니다.")
    }

    const data = await response.json()
    return data.data || []
  },

  async createPlan(
    accessToken: string,
    planData: Partial<WorkoutPlan>
  ): Promise<WorkoutPlan> {
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/workout/plans`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(planData),
      }
    )

    if (!response.ok) {
      throw new Error("운동 계획 생성에 실패했습니다.")
    }

    const data = await response.json()
    return data.data
  },

  async updatePlan(
    accessToken: string,
    planId: number,
    planData: Partial<WorkoutPlan>
  ): Promise<WorkoutPlan> {
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/workout/plans/${planId}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(planData),
      }
    )

    if (!response.ok) {
      throw new Error("운동 계획 수정에 실패했습니다.")
    }

    const data = await response.json()
    return data.data
  },

  async deletePlan(accessToken: string, planId: number): Promise<void> {
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/workout/plans/${planId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )

    if (!response.ok) {
      throw new Error("운동 계획 삭제에 실패했습니다.")
    }
  },

  // 운동 세션 관련
  async getSessions(accessToken: string): Promise<WorkoutSession[]> {
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/workout/sessions`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    )

    if (!response.ok) {
      throw new Error("운동 세션을 불러오는데 실패했습니다.")
    }

    const data = await response.json()
    return data.data || []
  },

  async createSession(
    accessToken: string,
    sessionData: Partial<WorkoutSession>
  ): Promise<WorkoutSession> {
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/workout/sessions`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(sessionData),
      }
    )

    if (!response.ok) {
      throw new Error("운동 세션 생성에 실패했습니다.")
    }

    const data = await response.json()
    return data.data
  },

  async updateSession(
    accessToken: string,
    sessionId: number,
    sessionData: Partial<WorkoutSession>
  ): Promise<WorkoutSession> {
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/workout/sessions/${sessionId}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(sessionData),
      }
    )

    if (!response.ok) {
      throw new Error("운동 세션 수정에 실패했습니다.")
    }

    const data = await response.json()
    return data.data
  },

  async deleteSession(accessToken: string, sessionId: number): Promise<void> {
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/workout/sessions/${sessionId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )

    if (!response.ok) {
      throw new Error("운동 세션 삭제에 실패했습니다.")
    }
  },

  // 운동 목표 관련
  async getGoals(accessToken: string): Promise<WorkoutGoal[]> {
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/workout/goals`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    )

    if (!response.ok) {
      throw new Error("운동 목표를 불러오는데 실패했습니다.")
    }

    const data = await response.json()
    return data.data || []
  },

  async createGoal(
    accessToken: string,
    goalData: Partial<WorkoutGoal>
  ): Promise<WorkoutGoal> {
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/workout/goals`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(goalData),
      }
    )

    if (!response.ok) {
      throw new Error("운동 목표 생성에 실패했습니다.")
    }

    const data = await response.json()
    return data.data
  },

  async updateGoal(
    accessToken: string,
    goalId: number,
    goalData: Partial<WorkoutGoal>
  ): Promise<WorkoutGoal> {
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/workout/goals/${goalId}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(goalData),
      }
    )

    if (!response.ok) {
      throw new Error("운동 목표 수정에 실패했습니다.")
    }

    const data = await response.json()
    return data.data
  },

  async deleteGoal(accessToken: string, goalId: number): Promise<void> {
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/workout/goals/${goalId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )

    if (!response.ok) {
      throw new Error("운동 목표 삭제에 실패했습니다.")
    }
  },

  // 운동 세트 관련
  async addExerciseSet(
    accessToken: string,
    setData: Partial<ExerciseSet>
  ): Promise<ExerciseSet> {
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/workout/sets`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(setData),
      }
    )

    if (!response.ok) {
      throw new Error("운동 세트 추가에 실패했습니다.")
    }

    const data = await response.json()
    return data.data
  },

  // 운동 세션 완료
  async completeSession(
    accessToken: string,
    sessionId: number,
    endTime: Date
  ): Promise<WorkoutSession> {
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/workout/sessions/${sessionId}/complete`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ endTime }),
      }
    )

    if (!response.ok) {
      throw new Error("운동 세션 완료에 실패했습니다.")
    }

    const data = await response.json()
    return data.data
  },
}
