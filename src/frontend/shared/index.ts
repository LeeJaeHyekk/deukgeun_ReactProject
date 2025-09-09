// ============================================================================
// Shared Module Index
// ============================================================================

// Components
export * from "./components"

// Hooks
export * from "./hooks"

// Library utilities
export * from "./lib"

// Types (selective exports to avoid conflicts)
export type {
  ApiResponse,
  PaginationParams,
  Machine,
  User,
  WorkoutGoal,
  WorkoutPlan,
  WorkoutSession,
  ExerciseSet,
  WorkoutPlanExercise,
  LevelProgress,
  AuthContextType,
  LoginRequest,
  RegisterRequest,
  TokenPayload,
  LikeRequest,
  PostFilters,
  CommentFilters,
  Achievement,
  MachineFilters,
  LevelAchievement
} from "./types"

// Constants
export * from "./constants"

// Contexts
export * from "./contexts"

// Store
export * from "./store"

// Config
export * from "./config"
