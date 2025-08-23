export interface WorkoutPlan {
  id: number
  name: string
  description: string
  target_muscle_groups: string[]
  difficulty: string
  duration: number
  exercises: WorkoutExercise[]
  createdAt: Date
  updatedAt: Date
}

export interface WorkoutExercise {
  id: number
  name: string
  sets: number
  reps: number
  weight?: number
  duration?: number
  rest: number
  notes?: string
}

export interface WorkoutSession {
  id: number
  userId: number
  planId?: number
  startTime: Date
  endTime?: Date
  exercises: WorkoutSessionExercise[]
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export interface WorkoutSessionExercise {
  id: number
  exerciseId: number
  sets: WorkoutSet[]
  notes?: string
}

export interface WorkoutSet {
  id: number
  reps: number
  weight?: number
  duration?: number
  completed: boolean
}

export interface WorkoutGoal {
  id: number
  userId: number
  title: string
  description: string
  targetValue: number
  currentValue: number
  unit: string
  deadline?: Date
  isCompleted: boolean
  createdAt: Date
  updatedAt: Date
}

export interface DashboardData {
  totalSessions: number
  totalDuration: number
  activeGoals: WorkoutGoal[]
  recentSessions: WorkoutSession[]
  weeklyProgress: {
    date: string
    value: number
    label: string
  }[]
}
