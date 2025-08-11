import apiClient from "./index"

export interface WorkoutPlan {
  plan_id: number
  user_id: number
  name: string
  description?: string
  difficulty_level: "beginner" | "intermediate" | "advanced"
  estimated_duration_minutes: number
  target_muscle_groups: string[]
  is_template: boolean
  is_public: boolean
  created_at: string
  updated_at: string
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

export interface WorkoutStats {
  stat_id: number
  user_id: number
  machine_id?: number
  workout_date: string
  total_sessions: number
  total_duration_minutes: number
  total_sets: number
  total_reps: number
  total_weight_kg: number
  total_distance_meters: number
  average_mood: number
  average_energy: number
  average_rpe: number
  calories_burned: number
  created_at: string
  updated_at: string
}

export interface WorkoutProgress {
  progress_id: number
  user_id: number
  machine_id: number
  progress_date: string
  set_number: number
  reps_completed: number
  weight_kg?: number
  duration_seconds?: number
  distance_meters?: number
  rpe_rating?: number
  notes?: string
  is_personal_best: boolean
  improvement_percentage?: number
  created_at: string
  updated_at: string
}

export interface DashboardData {
  summary: {
    totalPlans: number
    totalSessions: number
    completedSessions: number
    activeGoals: number
  }
  weeklyStats: {
    totalSessions: number
    totalDuration: number
    averageMood: number
    averageEnergy: number
  }
  recentSessions: WorkoutSession[]
  recentProgress: WorkoutProgress[]
  activeGoals: WorkoutGoal[]
}

export class WorkoutJournalApi {
  // 운동 계획 관련
  static async getWorkoutPlans(): Promise<WorkoutPlan[]> {
    const response = await apiClient.get("/workout-journal/plans")
    return response.data.data
  }

  static async createWorkoutPlan(
    planData: Partial<WorkoutPlan>
  ): Promise<WorkoutPlan> {
    const response = await apiClient.post("/workout-journal/plans", planData)
    return response.data.data
  }

  // 운동 세션 관련
  static async getWorkoutSessions(): Promise<WorkoutSession[]> {
    const response = await apiClient.get("/workout-journal/sessions")
    return response.data.data
  }

  static async createWorkoutSession(
    sessionData: Partial<WorkoutSession>
  ): Promise<WorkoutSession> {
    const response = await apiClient.post(
      "/workout-journal/sessions",
      sessionData
    )
    return response.data.data
  }

  static async updateWorkoutSession(
    sessionId: number,
    updateData: Partial<WorkoutSession>
  ): Promise<WorkoutSession> {
    const response = await apiClient.put(
      `/workout-journal/sessions/${sessionId}`,
      updateData
    )
    return response.data.data
  }

  // 운동 목표 관련
  static async getWorkoutGoals(): Promise<WorkoutGoal[]> {
    const response = await apiClient.get("/workout-journal/goals")
    return response.data.data
  }

  static async createWorkoutGoal(
    goalData: Partial<WorkoutGoal>
  ): Promise<WorkoutGoal> {
    const response = await apiClient.post("/workout-journal/goals", goalData)
    return response.data.data
  }

  static async updateWorkoutGoal(
    goalId: number,
    updateData: Partial<WorkoutGoal>
  ): Promise<WorkoutGoal> {
    const response = await apiClient.put(
      `/workout-journal/goals/${goalId}`,
      updateData
    )
    return response.data.data
  }

  // 운동 통계 관련
  static async getWorkoutStats(): Promise<WorkoutStats[]> {
    const response = await apiClient.get("/workout-journal/stats")
    return response.data.data
  }

  // 운동 진행 상황 관련
  static async getWorkoutProgress(): Promise<WorkoutProgress[]> {
    const response = await apiClient.get("/workout-journal/progress")
    return response.data.data
  }

  // 대시보드 데이터
  static async getDashboardData(): Promise<DashboardData> {
    const response = await apiClient.get("/workout-journal/dashboard")
    return response.data.data
  }
}
