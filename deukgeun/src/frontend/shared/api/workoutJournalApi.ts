import type {
  WorkoutPlan,
  WorkoutSession,
  WorkoutGoal,
  WorkoutStats,
  WorkoutProgress,
  DashboardData,
  CreatePlanRequest,
  UpdatePlanRequest,
  CreateSessionRequest,
  UpdateSessionRequest,
  CreateGoalRequest,
  UpdateGoalRequest,
} from "../../../types"
import { storage } from "../lib"

// 타입들을 다시 export
export type {
  WorkoutPlan,
  WorkoutSession,
  WorkoutGoal,
  WorkoutStats,
  WorkoutProgress,
  DashboardData,
  CreatePlanRequest,
  UpdatePlanRequest,
  CreateSessionRequest,
  UpdateSessionRequest,
  CreateGoalRequest,
  UpdateGoalRequest,
}

// API 응답 타입
interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// 공통 헤더 생성 함수
function getAuthHeaders(): HeadersInit {
  const token = storage.get("accessToken")
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  }
}

// API 함수들
export const WorkoutJournalApi = {
  // 대시보드 데이터
  async getDashboardData(): Promise<DashboardData> {
    const response = await fetch("/api/workout-journal/dashboard", {
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(
        errorData.error || "대시보드 데이터를 불러오는데 실패했습니다."
      )
    }

    const data: ApiResponse<DashboardData> = await response.json()
    if (!data.success || !data.data) {
      throw new Error(
        data.error || "대시보드 데이터를 불러오는데 실패했습니다."
      )
    }

    return data.data
  },

  // 운동 계획 관련
  async getWorkoutPlans(): Promise<WorkoutPlan[]> {
    const response = await fetch("/api/workout-journal/plans", {
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || "운동 계획을 불러오는데 실패했습니다.")
    }

    const data: ApiResponse<WorkoutPlan[]> = await response.json()
    return data.data || []
  },

  async createWorkoutPlan(planData: CreatePlanRequest): Promise<WorkoutPlan> {
    const response = await fetch("/api/workout-journal/plans", {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(planData),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || "운동 계획 생성에 실패했습니다.")
    }

    const data: ApiResponse<WorkoutPlan> = await response.json()
    if (!data.success || !data.data) {
      throw new Error(data.error || "운동 계획 생성에 실패했습니다.")
    }

    return data.data
  },

  async updateWorkoutPlan(
    planId: number,
    planData: UpdatePlanRequest
  ): Promise<WorkoutPlan> {
    const response = await fetch(`/api/workout-journal/plans/${planId}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(planData),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || "운동 계획 수정에 실패했습니다.")
    }

    const data: ApiResponse<WorkoutPlan> = await response.json()
    if (!data.success || !data.data) {
      throw new Error(data.error || "운동 계획 수정에 실패했습니다.")
    }

    return data.data
  },

  async deleteWorkoutPlan(planId: number): Promise<void> {
    const response = await fetch(`/api/workout-journal/plans/${planId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || "운동 계획 삭제에 실패했습니다.")
    }
  },

  // 운동 세션 관련
  async getWorkoutSessions(): Promise<WorkoutSession[]> {
    const response = await fetch("/api/workout-journal/sessions", {
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || "운동 세션을 불러오는데 실패했습니다.")
    }

    const data: ApiResponse<WorkoutSession[]> = await response.json()
    return data.data || []
  },

  async createWorkoutSession(
    sessionData: CreateSessionRequest
  ): Promise<WorkoutSession> {
    const response = await fetch("/api/workout-journal/sessions", {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(sessionData),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || "운동 세션 생성에 실패했습니다.")
    }

    const data: ApiResponse<WorkoutSession> = await response.json()
    if (!data.success || !data.data) {
      throw new Error(data.error || "운동 세션 생성에 실패했습니다.")
    }

    return data.data
  },

  async updateWorkoutSession(
    sessionId: number,
    sessionData: UpdateSessionRequest
  ): Promise<WorkoutSession> {
    const response = await fetch(`/api/workout-journal/sessions/${sessionId}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(sessionData),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || "운동 세션 수정에 실패했습니다.")
    }

    const data: ApiResponse<WorkoutSession> = await response.json()
    if (!data.success || !data.data) {
      throw new Error(data.error || "운동 세션 수정에 실패했습니다.")
    }

    return data.data
  },

  async deleteWorkoutSession(sessionId: number): Promise<void> {
    const response = await fetch(`/api/workout-journal/sessions/${sessionId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || "운동 세션 삭제에 실패했습니다.")
    }
  },

  // 운동 목표 관련
  async getWorkoutGoals(): Promise<WorkoutGoal[]> {
    const response = await fetch("/api/workout-journal/goals", {
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || "운동 목표를 불러오는데 실패했습니다.")
    }

    const data: ApiResponse<WorkoutGoal[]> = await response.json()
    return data.data || []
  },

  async createWorkoutGoal(goalData: CreateGoalRequest): Promise<WorkoutGoal> {
    const response = await fetch("/api/workout-journal/goals", {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(goalData),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || "운동 목표 생성에 실패했습니다.")
    }

    const data: ApiResponse<WorkoutGoal> = await response.json()
    if (!data.success || !data.data) {
      throw new Error(data.error || "운동 목표 생성에 실패했습니다.")
    }

    return data.data
  },

  async updateWorkoutGoal(
    goalId: number,
    goalData: UpdateGoalRequest
  ): Promise<WorkoutGoal> {
    const response = await fetch(`/api/workout-journal/goals/${goalId}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(goalData),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || "운동 목표 수정에 실패했습니다.")
    }

    const data: ApiResponse<WorkoutGoal> = await response.json()
    if (!data.success || !data.data) {
      throw new Error(data.error || "운동 목표 수정에 실패했습니다.")
    }

    return data.data
  },

  async deleteWorkoutGoal(goalId: number): Promise<void> {
    const response = await fetch(`/api/workout-journal/goals/${goalId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || "운동 목표 삭제에 실패했습니다.")
    }
  },

  // 운동 통계 관련
  async getWorkoutStats(): Promise<WorkoutStats[]> {
    const response = await fetch("/api/workout-journal/stats", {
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || "운동 통계를 불러오는데 실패했습니다.")
    }

    const data: ApiResponse<WorkoutStats[]> = await response.json()
    return data.data || []
  },

  // 운동 진행 상황 관련
  async getWorkoutProgress(): Promise<WorkoutProgress[]> {
    const response = await fetch("/api/workout-journal/progress", {
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(
        errorData.error || "운동 진행 상황을 불러오는데 실패했습니다."
      )
    }

    const data: ApiResponse<WorkoutProgress[]> = await response.json()
    return data.data || []
  },
}
