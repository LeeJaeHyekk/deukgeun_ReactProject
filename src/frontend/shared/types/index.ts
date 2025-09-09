// ============================================================================
// Shared Types Index
// ============================================================================

// Common types
export type { 
  ApiResponse, 
  PaginationParams,
  CreateGoalRequest,
  UpdateGoalRequest,
  CreatePlanRequest,
  UpdatePlanRequest,
  CreateSessionRequest,
  UpdateSessionRequest,
  ExerciseSet,
  Machine,
  WorkoutGoal,
  WorkoutPlan,
  WorkoutPlanExercise,
  WorkoutSession,
  LevelProgress,
  User
} from "./common"

// Auth types
export type { 
  User as AuthUser,
  AuthContextType,
  LoginRequest,
  RegisterRequest
} from "./auth"

// User types
export type { 
  User as UserType,
  UserProfile,
  UserPreferences,
  UpdateUserRequest,
  ChangePasswordRequest,
  UserStats,
  UserAchievement
} from "../../types/user"

// Workout types
export type {
  WorkoutGoal as WorkoutGoalType,
  WorkoutPlan as WorkoutPlanType,
  WorkoutSession as WorkoutSessionType,
  WorkoutPlanExercise as WorkoutPlanExerciseType,
  ExerciseSet as ExerciseSetType,
  Machine as WorkoutMachineType
} from "./workout"

// Machine types
export type {
  Machine as MachineType,
  MachineDTO,
  CreateMachineRequest,
  UpdateMachineRequest,
  MachineSearchParams,
  MachineDifficulty,
  MachineCategory,
  MachineStats
} from "../../types/machine"

// Level types
export type {
  LevelProgress as LevelProgressType
} from "./level"

// Stats types
export type {
  WorkoutStats,
  User as StatsUser,
  Machine as StatsMachine
} from "./stats"

// Community types
export type {
  Post,
  Comment,
  CreatePostRequest,
  UpdatePostRequest,
  CreateCommentRequest,
  UpdateCommentRequest,
  PostCategory
} from "./community"

// Additional types
export type {
  ApiListResponse
} from "./common"

// Additional types
export interface TokenPayload {
  id: number
  email: string
  role: "user" | "admin" | "moderator"
  iat: number
  exp: number
}

export interface LikeRequest {
  postId: number
  commentId?: number
}

export interface PostFilters {
  category?: string
  author?: string
  dateRange?: {
    start: Date
    end: Date
  }
  tags?: string[]
}

export interface CommentFilters {
  postId?: number
  author?: string
  dateRange?: {
    start: Date
    end: Date
  }
}

export interface Achievement {
  id: number
  name: string
  description: string
  icon: string
  category: string
  requirement: {
    type: string
    value: number
  }
  reward: {
    exp: number
    badge?: string
  }
  isUnlocked: boolean
  unlockedAt?: Date
  progress: number
  createdAt: Date
  updatedAt: Date
}

export interface MachineFilters {
  category?: string
  difficulty?: string
  gymId?: number
  muscleGroups?: string[]
  name?: string
}

export interface LevelAchievement {
  id: number
  name: string
  description: string
  icon: string
  category: string
  requirement: {
    type: string
    value: number
  }
  reward: {
    exp: number
    badge?: string
  }
  isUnlocked: boolean
  unlockedAt?: Date
  progress: number
  createdAt: Date
  updatedAt: Date
}
