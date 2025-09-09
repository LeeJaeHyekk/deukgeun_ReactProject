// Machine DTOs
export interface Machine {
  id: number
  name: string
  description: string
  category: string
  difficulty: MachineDifficulty
  targetMuscles: string[]
  instructions: string[]
  tips: string[]
  imageUrl?: string
  videoUrl?: string
  gymId: number
  muscleGroups: string[]
  createdAt: Date
  updatedAt: Date
}

export interface MachineDTO {
  id: number
  name: string
  description: string
  category: string
  difficulty: MachineDifficulty
  targetMuscles: string[]
  instructions: string[]
  tips: string[]
  imageUrl?: string
  videoUrl?: string
  gymId: number
  muscleGroups: string[]
  createdAt: Date
  updatedAt: Date
}

export interface CreateMachineRequest {
  name: string
  description: string
  category: string
  difficulty: MachineDifficulty
  targetMuscles: string[]
  instructions: string[]
  tips: string[]
  imageUrl?: string
  videoUrl?: string
  gymId: number
  muscleGroups: string[]
}

export interface UpdateMachineRequest {
  name?: string
  description?: string
  category?: string
  difficulty?: MachineDifficulty
  targetMuscles?: string[]
  instructions?: string[]
  tips?: string[]
  imageUrl?: string
  videoUrl?: string
  gymId?: number
  muscleGroups?: string[]
}

export enum MachineDifficulty {
  BEGINNER = "beginner",
  INTERMEDIATE = "intermediate",
  ADVANCED = "advanced"
}

// User DTOs
export interface User {
  id: number
  email: string
  name?: string
  nickname: string
  phone?: string
  level: number
  exp: number
  maxExp?: number
  experience?: number
  maxExperience?: number
  isEmailVerified: boolean
  role: "user" | "admin" | "moderator"
  profileImage?: string
  avatar?: string
  bio?: string
  birthDate?: string
  gender?: string
  accessToken?: string
  createdAt: Date
  updatedAt: Date
}

// Workout DTOs
export interface WorkoutSession {
  id: number
  userId: number
  startTime: Date
  endTime?: Date
  duration?: number
  exercises: ExerciseSet[]
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export interface ExerciseSet {
  id: number
  machineId: number
  sets: Set[]
  notes?: string
}

export interface Set {
  reps: number
  weight: number
  duration?: number
  restTime?: number
}

export interface WorkoutPlan {
  id: number
  userId: number
  name: string
  description?: string
  exercises: WorkoutPlanExercise[]
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface WorkoutPlanExercise {
  id: number
  machineId: number
  sets: number
  reps: number
  weight: number
  restTime: number
  order: number
}

export interface WorkoutGoal {
  id: number
  userId: number
  title: string
  description?: string
  targetDate: Date
  targetValue: number
  currentValue: number
  unit: string
  isCompleted: boolean
  createdAt: Date
  updatedAt: Date
}

// Common DTOs
export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

export interface ApiListResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface PaginationParams {
  page: number
  limit: number
}
