import type {
  WorkoutPlan,
  WorkoutSession,
  WorkoutGoal,
  WorkoutStats,
  WorkoutProgress,
  DashboardData,
} from "../../../types"

// API 함수들
export const WorkoutJournalApi = {
  // 대시보드 데이터
  async getDashboardData(): Promise<DashboardData> {
    const response = await fetch("/api/workout/dashboard", {
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error("대시보드 데이터를 불러오는데 실패했습니다.")
    }

    const data = await response.json()
    return data.data
  },

  // 운동 계획 관련
  async getWorkoutPlans(): Promise<WorkoutPlan[]> {
    const response = await fetch("/api/workout/plans", {
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error("운동 계획을 불러오는데 실패했습니다.")
    }

    const data = await response.json()
    return data.data || []
  },

  async createWorkoutPlan(
    planData: Partial<WorkoutPlan>
  ): Promise<WorkoutPlan> {
    const response = await fetch("/api/workout/plans", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(planData),
    })

    if (!response.ok) {
      throw new Error("운동 계획 생성에 실패했습니다.")
    }

    const data = await response.json()
    return data.data
  },

  async updateWorkoutPlan(
    planId: number,
    planData: Partial<WorkoutPlan>
  ): Promise<WorkoutPlan> {
    const response = await fetch(`/api/workout/plans/${planId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(planData),
    })

    if (!response.ok) {
      throw new Error("운동 계획 수정에 실패했습니다.")
    }

    const data = await response.json()
    return data.data
  },

  async deleteWorkoutPlan(planId: number): Promise<void> {
    const response = await fetch(`/api/workout/plans/${planId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error("운동 계획 삭제에 실패했습니다.")
    }
  },

  // 운동 세션 관련
  async getWorkoutSessions(): Promise<WorkoutSession[]> {
    const response = await fetch("/api/workout/sessions", {
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error("운동 세션을 불러오는데 실패했습니다.")
    }

    const data = await response.json()
    return data.data || []
  },

  async createWorkoutSession(
    sessionData: Partial<WorkoutSession>
  ): Promise<WorkoutSession> {
    const response = await fetch("/api/workout/sessions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(sessionData),
    })

    if (!response.ok) {
      throw new Error("운동 세션 생성에 실패했습니다.")
    }

    const data = await response.json()
    return data.data
  },

  async updateWorkoutSession(
    sessionId: number,
    sessionData: Partial<WorkoutSession>
  ): Promise<WorkoutSession> {
    const response = await fetch(`/api/workout/sessions/${sessionId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(sessionData),
    })

    if (!response.ok) {
      throw new Error("운동 세션 수정에 실패했습니다.")
    }

    const data = await response.json()
    return data.data
  },

  async deleteWorkoutSession(sessionId: number): Promise<void> {
    const response = await fetch(`/api/workout/sessions/${sessionId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error("운동 세션 삭제에 실패했습니다.")
    }
  },

  // 운동 목표 관련
  async getWorkoutGoals(): Promise<WorkoutGoal[]> {
    const response = await fetch("/api/workout/goals", {
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error("운동 목표를 불러오는데 실패했습니다.")
    }

    const data = await response.json()
    return data.data || []
  },

  async createWorkoutGoal(
    goalData: Partial<WorkoutGoal>
  ): Promise<WorkoutGoal> {
    const response = await fetch("/api/workout/goals", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(goalData),
    })

    if (!response.ok) {
      throw new Error("운동 목표 생성에 실패했습니다.")
    }

    const data = await response.json()
    return data.data
  },

  async updateWorkoutGoal(
    goalId: number,
    goalData: Partial<WorkoutGoal>
  ): Promise<WorkoutGoal> {
    const response = await fetch(`/api/workout/goals/${goalId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(goalData),
    })

    if (!response.ok) {
      throw new Error("운동 목표 수정에 실패했습니다.")
    }

    const data = await response.json()
    return data.data
  },

  async deleteWorkoutGoal(goalId: number): Promise<void> {
    const response = await fetch(`/api/workout/goals/${goalId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error("운동 목표 삭제에 실패했습니다.")
    }
  },

  // 운동 통계 관련
  async getWorkoutStats(): Promise<WorkoutStats[]> {
    const response = await fetch("/api/workout/stats", {
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error("운동 통계를 불러오는데 실패했습니다.")
    }

    const data = await response.json()
    return data.data || []
  },

  // 운동 진행 상황 관련
  async getWorkoutProgress(): Promise<WorkoutProgress[]> {
    const response = await fetch("/api/workout/progress", {
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error("운동 진행 상황을 불러오는데 실패했습니다.")
    }

    const data = await response.json()
    return data.data || []
  },
}
