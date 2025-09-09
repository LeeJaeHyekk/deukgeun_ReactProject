// 통계 관련 타입 정의

export interface WorkoutStats {
  id: number
  userId: number
  totalWorkouts: number
  totalDuration: number
  totalWeight: number
  totalReps: number
  averageWorkoutDuration: number
  averageWeight: number
  averageReps: number
  favoriteMachines: string[]
  workoutStreak: number
  longestStreak: number
  lastWorkoutDate: Date
  createdAt: Date
  updatedAt: Date
}

export interface User {
  id: number
  email: string
  name: string
  nickname: string
  level: number
  exp: number
  createdAt: Date
  updatedAt: Date
}

export interface Machine {
  id: number
  name: string
  category: string
  difficulty: string
  targetMuscles: string[]
  createdAt: Date
  updatedAt: Date
}

export interface Achievement {
  id: number
  name: string
  description: string
  icon: string
  category: string
  requirement: number
  reward: {
    exp: number
    title?: string
  }
  unlockedAt?: Date
  isUnlocked: boolean
}

export interface DailyStats {
  date: string
  workouts: number
  duration: number
  calories: number
  weight: number
  reps: number
}

export interface WeeklyStats {
  week: string
  totalWorkouts: number
  totalDuration: number
  averageDuration: number
  totalWeight: number
  totalReps: number
  dailyStats: DailyStats[]
}

export interface MonthlyStats {
  month: string
  totalWorkouts: number
  totalDuration: number
  averageDuration: number
  totalWeight: number
  totalReps: number
  weeklyStats: WeeklyStats[]
}

export interface MachineStats {
  machineId: number
  machineName: string
  totalUsage: number
  totalWeight: number
  totalReps: number
  averageWeight: number
  averageReps: number
  lastUsed: Date
  favoriteRank: number
}

export interface ProgressStats {
  period: 'week' | 'month' | 'year'
  startDate: Date
  endDate: Date
  workouts: number
  duration: number
  weight: number
  reps: number
  improvement: {
    workouts: number
    duration: number
    weight: number
    reps: number
  }
}

export interface ComparisonStats {
  current: {
    period: string
    workouts: number
    duration: number
    weight: number
    reps: number
  }
  previous: {
    period: string
    workouts: number
    duration: number
    weight: number
    reps: number
  }
  change: {
    workouts: number
    duration: number
    weight: number
    reps: number
  }
  percentage: {
    workouts: number
    duration: number
    weight: number
    reps: number
  }
}

export interface GoalProgress {
  goalId: number
  goalTitle: string
  targetValue: number
  currentValue: number
  progressPercentage: number
  remainingValue: number
  estimatedCompletion: Date
  isCompleted: boolean
}

export interface StatsSummary {
  totalWorkouts: number
  totalDuration: number
  totalWeight: number
  totalReps: number
  averageWorkoutDuration: number
  workoutStreak: number
  level: number
  exp: number
  achievements: number
  favoriteMachine: string
  lastWorkoutDate: Date
}
