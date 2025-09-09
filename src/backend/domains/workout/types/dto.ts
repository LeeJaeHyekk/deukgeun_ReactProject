// ============================================================================
// Workout DTO Types
// ============================================================================

export interface WorkoutSessionDTO {
  id: number
  userId: number
  planId?: number
  gymId?: number
  name: string
  startTime: Date
  endTime?: Date
  totalDurationMinutes?: number
  moodRating?: number
  energyLevel?: number
  notes?: string
  status: "planned" | "in_progress" | "completed" | "cancelled"
  exerciseSets: ExerciseSetDTO[]
  createdAt: Date
  updatedAt: Date
  user?: {
    id: number
    nickname: string
    profileImage?: string
  }
  gym?: {
    id: number
    name: string
    address: string
  }
}

export interface ExerciseSetDTO {
  id: number
  sessionId: number
  machineId: number
  setNumber: number
  reps?: number
  repsCompleted?: number
  weight?: number
  weightKg?: number
  duration?: number
  durationSeconds?: number
  distance?: number
  distanceMeters?: number
  restTime?: number
  rpeRating?: number
  notes?: string
  createdAt: Date
  updatedAt: Date
  machine?: {
    id: number
    name: string
    category: string
    difficulty: string
  }
}

export interface WorkoutPlanDTO {
  id: number
  userId: number
  name: string
  description?: string
  isPublic: boolean
  difficulty: "beginner" | "intermediate" | "advanced"
  estimatedDuration: number
  exercises: WorkoutPlanExerciseDTO[]
  createdAt: Date
  updatedAt: Date
  user?: {
    id: number
    nickname: string
    profileImage?: string
  }
}

export interface WorkoutPlanExerciseDTO {
  id: number
  planId: number
  machineId: number
  order: number
  sets: number
  reps?: number
  weight?: number
  duration?: number
  restTime?: number
  notes?: string
  machine?: {
    id: number
    name: string
    category: string
    difficulty: string
  }
}

export interface WorkoutStatsDTO {
  id: number
  userId: number
  machineId: number
  totalSessions: number
  totalSets: number
  totalReps: number
  totalWeight: number
  totalDuration: number
  averageWeight: number
  averageReps: number
  personalBest: number
  lastWorkoutDate?: Date
  createdAt: Date
  updatedAt: Date
  user?: {
    id: number
    nickname: string
    profileImage?: string
  }
  machine?: {
    id: number
    name: string
    category: string
    difficulty: string
  }
}

export interface CreateWorkoutSessionDTO {
  userId: number
  planId?: number
  gymId?: number
  name: string
  startTime: Date
  moodRating?: number
  energyLevel?: number
  notes?: string
}

export interface UpdateWorkoutSessionDTO {
  name?: string
  endTime?: Date
  totalDurationMinutes?: number
  moodRating?: number
  energyLevel?: number
  notes?: string
  status?: "planned" | "in_progress" | "completed" | "cancelled"
}

export interface CreateExerciseSetDTO {
  sessionId: number
  machineId: number
  setNumber: number
  reps?: number
  weight?: number
  duration?: number
  distance?: number
  restTime?: number
  notes?: string
}

export interface UpdateExerciseSetDTO {
  setNumber?: number
  reps?: number
  weight?: number
  duration?: number
  distance?: number
  restTime?: number
  notes?: string
}

export interface CreateWorkoutPlanDTO {
  userId: number
  name: string
  description?: string
  isPublic?: boolean
  difficulty: "beginner" | "intermediate" | "advanced"
  estimatedDuration: number
}

export interface UpdateWorkoutPlanDTO {
  name?: string
  description?: string
  isPublic?: boolean
  difficulty?: "beginner" | "intermediate" | "advanced"
  estimatedDuration?: number
}
