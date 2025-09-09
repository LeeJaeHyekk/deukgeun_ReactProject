// ============================================================================
// Domains Index
// ============================================================================

// Auth domain exports
export * from "./auth/controllers/authController"
export * from "./auth/services/accountRecoveryService"
export { User } from "./auth/entities/User"
export * from "./auth/entities/VerificationToken"
export * from "./auth/entities/PasswordResetToken"
export * from "./auth/transformers/userTransformer"
export type { 
  ApiResponse as AuthApiResponse, 
  ErrorResponse as AuthErrorResponse 
} from "./auth/types/auth.types"
export * from "./auth/routes/auth"

// Community domain exports
export * from "./community/controllers/post.controller"
export * from "./community/controllers/commentController"
export * from "./community/controllers/likeController"
export * from "./community/entities/Post"
export * from "./community/entities/Comment"
export * from "./community/entities/Like"
export * from "./community/transformers/post.transformer"
export * from "./community/transformers/comment.transformer"
export * from "./community/transformers/like.transformer"
export * from "./community/types/community.types"
export * from "./community/routes/post"
export * from "./community/routes/comment"
export * from "./community/routes/like"

// Workout domain exports
export * from "./workout/controllers/workoutController"
export * from "./workout/services/workoutService"
export * from "./workout/entities/WorkoutSession"
export * from "./workout/entities/ExerciseSet"
export * from "./workout/transformers/workoutsession.transformer"
export * from "./workout/transformers/exerciseset.transformer"
// export * from "./workout/types/workout.types"
export * from "./workout/routes/workout"

// Machine domain exports
export * from "./machine/controllers/machineController"
export * from "./machine/services/machineService"
export * from "./machine/entities/Machine"
// export * from "./machine/entities/MachineCategory"
export * from "./machine/transformers/machine.transformer"
// export * from "./machine/types/machine.types"
export * from "./machine/routes/machine"

// Gym domain exports
export * from "./gym/controllers/gymController"
export * from "./gym/services/gymService"
export * from "./gym/entities/Gym"
export * from "./gym/transformers/gym.transformer"
export type { 
  ApiResponse as GymApiResponse, 
  ErrorResponse as GymErrorResponse,
  PaginatedResponse as GymPaginatedResponse,
  PaginationParams as GymPaginationParams
} from "./gym/types/gym.types"
export * from "./gym/routes/gym"

// Level domain exports (with unique names)
export * from "./level/controllers/levelController"
export * from "./level/services/levelService"
export { UserLevel as LevelUserLevel } from "./level/entities/UserLevel"
export { ExpHistory as LevelExpHistory } from "./level/entities/ExpHistory"
export { UserReward as LevelUserReward } from "./level/entities/UserReward"
export * from "./level/transformers/userlevel.transformer"
export * from "./level/transformers/exphistory.transformer"
export type { 
  ApiResponse as LevelApiResponse, 
  ErrorResponse as LevelErrorResponse,
  PaginatedResponse as LevelPaginatedResponse,
  PaginationParams as LevelPaginationParams
} from "./level/types/level.types"
export * from "./level/routes/level"

// Stats domain exports (with unique names)
export * from "./stats/controllers/statsController"
export * from "./stats/services/statsService"
export { WorkoutStats as StatsWorkoutStats } from "./stats/entities/WorkoutStats"
export * from "./stats/transformers/statsTransformer"
export type { 
  ApiResponse as StatsApiResponse, 
  ErrorResponse as StatsErrorResponse,
  PaginatedResponse as StatsPaginatedResponse,
  PaginationParams as StatsPaginationParams
} from "./stats/types/stats.types"
export * from "./stats/routes/stats"
