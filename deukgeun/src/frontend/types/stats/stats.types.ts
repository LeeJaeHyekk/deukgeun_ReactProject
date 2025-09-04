// Stats 시스템 - 통계 관련 타입 정의

// 플랫폼 통계
export interface PlatformStats {
  activeUsers: number
  totalGyms: number
  totalPosts: number
  achievements: number
  totalWorkouts: number
  totalSessions: number
  averageWorkoutDuration: number
  mostPopularMachine: string
  mostActiveTime: string
  lastUpdated: Date
}

// 사용자 통계
export interface UserStats {
  userId: string
  totalWorkouts: number
  totalSessions: number
  totalDuration: number
  averageWorkoutDuration: number
  favoriteMachine: string
  workoutStreak: number
  longestStreak: number
  totalCalories: number
  averageCalories: number
  level: number
  experience: number
  achievements: Achievement[]
  lastWorkout: Date
  lastUpdated: Date
}

// 운동 통계
export interface WorkoutStats {
  userId: string
  period: string
  totalWorkouts: number
  totalSessions: number
  totalDuration: number
  averageWorkoutDuration: number
  totalCalories: number
  averageCalories: number
  favoriteMachines: MachineUsage[]
  workoutFrequency: WorkoutFrequency[]
  progressTrend: ProgressTrend[]
  lastUpdated: Date
}

// 기계 사용 통계
export interface MachineUsage {
  machineId: number
  machineName: string
  usageCount: number
  totalDuration: number
  averageWeight: number
  averageReps: number
  lastUsed: Date
}

// 운동 빈도
export interface WorkoutFrequency {
  date: string
  workoutCount: number
  totalDuration: number
  totalCalories: number
}

// 진행 추세
export interface ProgressTrend {
  date: string
  weight: number
  reps: number
  duration: number
  calories: number
}

// 업적
export interface Achievement {
  id: number
  name: string
  description: string
  icon: string
  category: string
  isUnlocked: boolean
  unlockedAt?: Date
  progress?: number
  maxProgress?: number
}

// 통계 기간
export type StatsPeriod = "day" | "week" | "month" | "quarter" | "year" | "all"

// 통계 요청
export interface StatsRequest {
  userId?: string
  period: StatsPeriod
  startDate?: Date
  endDate?: Date
  category?: string
  machineId?: number
}

// 통계 응답
export interface StatsResponse<T> {
  data: T
  period: StatsPeriod
  startDate: Date
  endDate: Date
  lastUpdated: Date
}

// DTO 타입 (백엔드와의 호환성을 위해)
export type PlatformStatsDTO = PlatformStats
export type UserStatsDTO = UserStats
export type WorkoutStatsDTO = WorkoutStats
export type MachineUsageDTO = MachineUsage
export type WorkoutFrequencyDTO = WorkoutFrequency
export type ProgressTrendDTO = ProgressTrend

// API 응답 타입
export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
}
