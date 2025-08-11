import type { Machine, DifficultyLevel } from "./machine"

// ============================================================================
// 운동 관련 타입
// ============================================================================

export interface WorkoutPlan {
  plan_id: number
  user_id: number
  name: string
  description?: string
  difficulty_level: DifficultyLevel
  estimated_duration_minutes: number
  target_muscle_groups?: string[]
  is_template: boolean
  is_public: boolean
  created_at: Date
  updated_at: Date
  exercises?: WorkoutPlanExercise[]
}

export interface WorkoutPlanExercise {
  exercise_id: number
  plan_id: number
  machine_id: number
  sets: number
  reps: number
  weight?: number
  rest_time_seconds: number
  order_index: number
  machine?: Machine
}

export interface WorkoutSession {
  session_id: number
  user_id: number
  plan_id?: number
  start_time: Date
  end_time?: Date
  duration_minutes?: number
  notes?: string
  exercises?: ExerciseSet[]
}

export interface ExerciseSet {
  set_id: number
  session_id: number
  machine_id: number
  set_number: number
  reps: number
  weight?: number
  rest_time_seconds?: number
  notes?: string
  machine?: Machine
}

export interface WorkoutGoal {
  goal_id: number
  user_id: number
  goal_type: string
  target_value: number
  current_value: number
  unit: string
  target_date: Date
  start_date: Date
  status: "active" | "completed" | "paused" | "cancelled"
  progress_percentage: number
  created_at: Date
  updated_at: Date
}
