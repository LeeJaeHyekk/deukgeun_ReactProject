import { API_ENDPOINTS } from "../config"

// 타입 정의
export interface WorkoutPlan {
  plan_id: number
  user_id: number
  name: string
  description?: string
  difficulty_level: "beginner" | "intermediate" | "advanced"
  estimated_duration_minutes: number
  target_muscle_groups?: string[]
  is_template: boolean
  is_public: boolean
  created_at: string
  updated_at: string
  exercises?: WorkoutPlanExercise[]
}

export interface WorkoutPlanExercise {
  plan_exercise_id: number
  plan_id: number
  machine_id: number
  exercise_order: number
  sets: number
  reps_range: { min: number; max: number }
  weight_range?: { min: number; max: number }
  rest_seconds: number
  notes?: string
  machine?: {
    id: number
    name_ko: string
    name_en?: string
    image_url: string
    category: string
  }
}

export interface WorkoutSession {
  session_id: number
  user_id: number
  plan_id?: number
  gym_id?: number
  session_name: string
  start_time: string
  end_time?: string
  total_duration_minutes?: number
  mood_rating?: number
  energy_level?: number
  notes?: string
  status: "in_progress" | "completed" | "paused" | "cancelled"
  created_at: string
  updated_at: string
}

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

// API 함수들
export const workoutApi = {
  // 운동 계획 관련
  async getPlans(accessToken: string): Promise<WorkoutPlan[]> {
    const response = await fetch(`${API_ENDPOINTS.BASE_URL}/workouts/plans`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      throw new Error("운동 계획을 불러오는데 실패했습니다.")
    }

    return response.json()
  },

  async createPlan(accessToken: string, planData: any): Promise<WorkoutPlan> {
    const response = await fetch(`${API_ENDPOINTS.BASE_URL}/workouts/plans`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(planData),
    })

    if (!response.ok) {
      throw new Error("운동 계획 생성에 실패했습니다.")
    }

    return response.json()
  },

  async updatePlan(
    accessToken: string,
    planId: number,
    planData: any
  ): Promise<WorkoutPlan> {
    const response = await fetch(
      `${API_ENDPOINTS.BASE_URL}/workouts/plans/${planId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(planData),
      }
    )

    if (!response.ok) {
      throw new Error("운동 계획 수정에 실패했습니다.")
    }

    return response.json()
  },

  async deletePlan(accessToken: string, planId: number): Promise<void> {
    const response = await fetch(
      `${API_ENDPOINTS.BASE_URL}/workouts/plans/${planId}`,
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
      `${API_ENDPOINTS.BASE_URL}/workouts/sessions`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )

    if (!response.ok) {
      throw new Error("운동 세션을 불러오는데 실패했습니다.")
    }

    return response.json()
  },

  async startSession(
    accessToken: string,
    sessionData: any
  ): Promise<WorkoutSession> {
    const response = await fetch(
      `${API_ENDPOINTS.BASE_URL}/workouts/sessions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(sessionData),
      }
    )

    if (!response.ok) {
      throw new Error("운동 세션 시작에 실패했습니다.")
    }

    return response.json()
  },

  async completeSession(
    accessToken: string,
    sessionId: number
  ): Promise<WorkoutSession> {
    const response = await fetch(
      `${API_ENDPOINTS.BASE_URL}/workouts/sessions/${sessionId}/complete`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )

    if (!response.ok) {
      throw new Error("운동 세션 완료에 실패했습니다.")
    }

    return response.json()
  },

  // 운동 목표 관련
  async getGoals(accessToken: string): Promise<WorkoutGoal[]> {
    const response = await fetch(`${API_ENDPOINTS.BASE_URL}/workouts/goals`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      throw new Error("운동 목표를 불러오는데 실패했습니다.")
    }

    return response.json()
  },

  async createGoal(accessToken: string, goalData: any): Promise<WorkoutGoal> {
    const response = await fetch(`${API_ENDPOINTS.BASE_URL}/workouts/goals`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(goalData),
    })

    if (!response.ok) {
      throw new Error("운동 목표 생성에 실패했습니다.")
    }

    return response.json()
  },

  async updateGoal(
    accessToken: string,
    goalId: number,
    goalData: any
  ): Promise<WorkoutGoal> {
    const response = await fetch(
      `${API_ENDPOINTS.BASE_URL}/workouts/goals/${goalId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(goalData),
      }
    )

    if (!response.ok) {
      throw new Error("운동 목표 수정에 실패했습니다.")
    }

    return response.json()
  },

  async deleteGoal(accessToken: string, goalId: number): Promise<void> {
    const response = await fetch(
      `${API_ENDPOINTS.BASE_URL}/workouts/goals/${goalId}`,
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

  // 운동 진행 상황
  async getProgress(accessToken: string, machineId?: number): Promise<any> {
    const url = new URL(`${API_ENDPOINTS.BASE_URL}/workouts/progress`)
    if (machineId) {
      url.searchParams.append("machineId", machineId.toString())
    }

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      throw new Error("운동 진행 상황을 불러오는데 실패했습니다.")
    }

    return response.json()
  },
}
