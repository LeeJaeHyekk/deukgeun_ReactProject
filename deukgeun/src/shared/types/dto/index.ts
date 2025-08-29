// ============================================================================
// DTO 통합 인덱스 파일
// 모든 DTO 타입을 중앙에서 관리
// ============================================================================

// Machine DTOs
export * from "./machine.dto"

// User DTOs
export * from "./user.dto"

// Post DTOs
export * from "./post.dto"

// Comment DTOs
export * from "./comment.dto"

// Gym DTOs
export * from "./gym.dto"

// WorkoutSession DTOs
export * from "./workoutsession.dto"

// WorkoutPlan DTOs
export * from "./workoutplan.dto"

// WorkoutPlanExercise DTOs
export * from "./workoutplanexercise.dto"

// WorkoutGoal DTOs
export * from "./workoutgoal.dto"

// ExerciseSet DTOs
export * from "./exerciseset.dto"

// ExpHistory DTOs
export * from "./exphistory.dto"

// UserLevel DTOs
export * from "./userlevel.dto"

// UserReward DTOs
export * from "./userreward.dto"

// UserStreak DTOs
export * from "./userstreak.dto"

// Milestone DTOs
export * from "./milestone.dto"

// Like DTOs
export * from "./like.dto"

// ============================================================================
// 통합된 타입 별칭 (기존 타입과의 호환성을 위해)
// ============================================================================

// Machine 타입 별칭
export type Machine = import("./machine.dto").MachineDTO
export type CreateMachineRequest = import("./machine.dto").CreateMachineDTO
export type UpdateMachineRequest = import("./machine.dto").UpdateMachineDTO
export type MachineResponse = import("./machine.dto").MachineDTOResponse
export type MachineListResponse = import("./machine.dto").MachineDTOListResponse
export type MachineDTOResponse = import("./machine.dto").MachineDTOResponse
export type MachineDTOListResponse =
  import("./machine.dto").MachineDTOListResponse
export type CreateMachineDTO = import("./machine.dto").CreateMachineDTO
export type UpdateMachineDTO = import("./machine.dto").UpdateMachineDTO

// Machine 관련 추가 타입들
export type MachineCategory = import("./machine.dto").MachineCategoryDTO
export type DifficultyLevel = import("./machine.dto").DifficultyLevelDTO
export type MachineCategoryDTO = import("./machine.dto").MachineCategoryDTO
export type DifficultyLevelDTO = import("./machine.dto").DifficultyLevelDTO

// Machine Filter Query 타입
export interface MachineFilterQuery {
  category?: string
  difficulty?: string
  target?: string
  search?: string
}

// User 타입 별칭
export type User = import("./user.dto").UserDTO
export type CreateUserRequest = import("./user.dto").CreateUserDTO
export type UpdateUserRequest = import("./user.dto").UpdateUserDTO
export type UserResponse = import("./user.dto").UserDTOResponse
export type UserDTOResponse = import("./user.dto").UserDTOResponse
export type UserDTOListResponse = import("./user.dto").UserDTOListResponse
export type CreateUserDTO = import("./user.dto").CreateUserDTO
export type UpdateUserDTO = import("./user.dto").UpdateUserDTO

// Post 타입 별칭
export type Post = import("./post.dto").PostDTO
export type PostCategoryInfo = import("./post.dto").PostCategoryInfo
export type CreatePostRequest = import("./post.dto").CreatePostDTO
export type UpdatePostRequest = import("./post.dto").UpdatePostDTO
export type PostResponse = import("./post.dto").PostDTOResponse
export type PostDTOResponse = import("./post.dto").PostDTOResponse
export type CreatePostDTO = import("./post.dto").CreatePostDTO
export type UpdatePostDTO = import("./post.dto").UpdatePostDTO

// Comment 타입 별칭
export type Comment = import("./comment.dto").CommentDTO
export type CreateCommentRequest = import("./comment.dto").CreateCommentDTO
export type UpdateCommentRequest = import("./comment.dto").UpdateCommentDTO
export type CommentResponse = import("./comment.dto").CommentDTOResponse
export type CommentDTOResponse = import("./comment.dto").CommentDTOResponse
export type CreateCommentDTO = import("./comment.dto").CreateCommentDTO
export type UpdateCommentDTO = import("./comment.dto").UpdateCommentDTO

// Gym 타입 별칭
export type Gym = import("./gym.dto").GymDTO
export type CreateGymRequest = import("./gym.dto").CreateGymDTO
export type UpdateGymRequest = import("./gym.dto").UpdateGymDTO
export type GymResponse = import("./gym.dto").GymDTOResponse
export type GymDTOResponse = import("./gym.dto").GymDTOResponse
export type CreateGymDTO = import("./gym.dto").CreateGymDTO
export type UpdateGymDTO = import("./gym.dto").UpdateGymDTO

// WorkoutSession 타입 별칭
export type WorkoutSession = import("./workoutsession.dto").WorkoutSessionDTO
export type CreateWorkoutSessionRequest =
  import("./workoutsession.dto").CreateWorkoutSessionDTO
export type UpdateWorkoutSessionRequest =
  import("./workoutsession.dto").UpdateWorkoutSessionDTO
export type WorkoutSessionResponse =
  import("./workoutsession.dto").WorkoutSessionDTOResponse
export type WorkoutSessionDTOResponse =
  import("./workoutsession.dto").WorkoutSessionDTOResponse
export type WorkoutSessionDTOListResponse =
  import("./workoutsession.dto").WorkoutSessionDTOListResponse
export type CreateWorkoutSessionDTO =
  import("./workoutsession.dto").CreateWorkoutSessionDTO
export type UpdateWorkoutSessionDTO =
  import("./workoutsession.dto").UpdateWorkoutSessionDTO

// WorkoutPlan 타입 별칭
export type WorkoutPlan = import("./workoutplan.dto").WorkoutPlanDTO
export type CreateWorkoutPlanRequest =
  import("./workoutplan.dto").CreateWorkoutPlanDTO
export type UpdateWorkoutPlanRequest =
  import("./workoutplan.dto").UpdateWorkoutPlanDTO
export type WorkoutPlanResponse =
  import("./workoutplan.dto").WorkoutPlanDTOResponse
export type WorkoutPlanDTOResponse =
  import("./workoutplan.dto").WorkoutPlanDTOResponse
export type WorkoutPlanDTOListResponse =
  import("./workoutplan.dto").WorkoutPlanDTOListResponse
export type CreateWorkoutPlanDTO =
  import("./workoutplan.dto").CreateWorkoutPlanDTO
export type UpdateWorkoutPlanDTO =
  import("./workoutplan.dto").UpdateWorkoutPlanDTO

// WorkoutPlanExercise 타입 별칭
export type WorkoutPlanExercise =
  import("./workoutplanexercise.dto").WorkoutPlanExerciseDTO
export type CreateWorkoutPlanExerciseRequest =
  import("./workoutplanexercise.dto").CreateWorkoutPlanExerciseDTO
export type UpdateWorkoutPlanExerciseRequest =
  import("./workoutplanexercise.dto").UpdateWorkoutPlanExerciseDTO
export type WorkoutPlanExerciseResponse =
  import("./workoutplanexercise.dto").WorkoutPlanExerciseDTOResponse
export type WorkoutPlanExerciseDTOResponse =
  import("./workoutplanexercise.dto").WorkoutPlanExerciseDTOResponse
export type CreateWorkoutPlanExerciseDTO =
  import("./workoutplanexercise.dto").CreateWorkoutPlanExerciseDTO
export type UpdateWorkoutPlanExerciseDTO =
  import("./workoutplanexercise.dto").UpdateWorkoutPlanExerciseDTO

// WorkoutGoal 타입 별칭
export type WorkoutGoal = import("./workoutgoal.dto").WorkoutGoalDTO
export type CreateWorkoutGoalRequest =
  import("./workoutgoal.dto").CreateWorkoutGoalDTO
export type UpdateWorkoutGoalRequest =
  import("./workoutgoal.dto").UpdateWorkoutGoalDTO
export type WorkoutGoalResponse =
  import("./workoutgoal.dto").WorkoutGoalDTOResponse
export type WorkoutGoalDTOResponse =
  import("./workoutgoal.dto").WorkoutGoalDTOResponse
export type WorkoutGoalDTOListResponse =
  import("./workoutgoal.dto").WorkoutGoalDTOListResponse
export type CreateWorkoutGoalDTO =
  import("./workoutgoal.dto").CreateWorkoutGoalDTO
export type UpdateWorkoutGoalDTO =
  import("./workoutgoal.dto").UpdateWorkoutGoalDTO

// ExerciseSet 타입 별칭
export type ExerciseSet = import("./exerciseset.dto").ExerciseSetDTO
export type CreateExerciseSetRequest =
  import("./exerciseset.dto").CreateExerciseSetDTO
export type UpdateExerciseSetRequest =
  import("./exerciseset.dto").UpdateExerciseSetDTO
export type ExerciseSetResponse =
  import("./exerciseset.dto").ExerciseSetDTOResponse
export type ExerciseSetDTOResponse =
  import("./exerciseset.dto").ExerciseSetDTOResponse
export type ExerciseSetDTOListResponse =
  import("./exerciseset.dto").ExerciseSetDTOListResponse
export type CreateExerciseSetDTO =
  import("./exerciseset.dto").CreateExerciseSetDTO
export type UpdateExerciseSetDTO =
  import("./exerciseset.dto").UpdateExerciseSetDTO

// ExpHistory 타입 별칭
export type ExpHistory = import("./exphistory.dto").ExpHistoryDTO
export type CreateExpHistoryRequest =
  import("./exphistory.dto").CreateExpHistoryDTO
export type UpdateExpHistoryRequest =
  import("./exphistory.dto").UpdateExpHistoryDTO
export type ExpHistoryResponse =
  import("./exphistory.dto").ExpHistoryDTOResponse
export type ExpHistoryDTOResponse =
  import("./exphistory.dto").ExpHistoryDTOResponse
export type CreateExpHistoryDTO = import("./exphistory.dto").CreateExpHistoryDTO
export type UpdateExpHistoryDTO = import("./exphistory.dto").UpdateExpHistoryDTO

// UserLevel 타입 별칭
export type UserLevel = import("./userlevel.dto").UserLevelDTO
export type CreateUserLevelRequest =
  import("./userlevel.dto").CreateUserLevelDTO
export type UpdateUserLevelRequest =
  import("./userlevel.dto").UpdateUserLevelDTO
export type UserLevelResponse = import("./userlevel.dto").UserLevelDTOResponse
export type UserLevelDTOResponse =
  import("./userlevel.dto").UserLevelDTOResponse
export type CreateUserLevelDTO = import("./userlevel.dto").CreateUserLevelDTO
export type UpdateUserLevelDTO = import("./userlevel.dto").UpdateUserLevelDTO

// UserReward 타입 별칭
export type UserReward = import("./userreward.dto").UserRewardDTO
export type CreateUserRewardRequest =
  import("./userreward.dto").CreateUserRewardDTO
export type UpdateUserRewardRequest =
  import("./userreward.dto").UpdateUserRewardDTO
export type UserRewardResponse =
  import("./userreward.dto").UserRewardDTOResponse
export type UserRewardDTOResponse =
  import("./userreward.dto").UserRewardDTOResponse
export type CreateUserRewardDTO = import("./userreward.dto").CreateUserRewardDTO
export type UpdateUserRewardDTO = import("./userreward.dto").UpdateUserRewardDTO

// UserStreak 타입 별칭
export type UserStreak = import("./userstreak.dto").UserStreakDTO
export type CreateUserStreakRequest =
  import("./userstreak.dto").CreateUserStreakDTO
export type UpdateUserStreakRequest =
  import("./userstreak.dto").UpdateUserStreakDTO
export type UserStreakResponse =
  import("./userstreak.dto").UserStreakDTOResponse
export type UserStreakDTOResponse =
  import("./userstreak.dto").UserStreakDTOResponse
export type CreateUserStreakDTO = import("./userstreak.dto").CreateUserStreakDTO
export type UpdateUserStreakDTO = import("./userstreak.dto").UpdateUserStreakDTO

// Milestone 타입 별칭
export type Milestone = import("./milestone.dto").MilestoneDTO
export type CreateMilestoneRequest =
  import("./milestone.dto").CreateMilestoneDTO
export type UpdateMilestoneRequest =
  import("./milestone.dto").UpdateMilestoneDTO
export type MilestoneResponse = import("./milestone.dto").MilestoneDTOResponse
export type MilestoneDTOResponse =
  import("./milestone.dto").MilestoneDTOResponse
export type CreateMilestoneDTO = import("./milestone.dto").CreateMilestoneDTO
export type UpdateMilestoneDTO = import("./milestone.dto").UpdateMilestoneDTO

// Like 타입 별칭
export type Like = import("./like.dto").LikeDTO
export type CreateLikeRequest = import("./like.dto").CreateLikeDTO
export type UpdateLikeRequest = import("./like.dto").UpdateLikeDTO
export type LikeResponse = import("./like.dto").LikeDTOResponse
export type LikeDTOResponse = import("./like.dto").LikeDTOResponse
export type CreateLikeDTO = import("./like.dto").CreateLikeDTO
export type UpdateLikeDTO = import("./like.dto").UpdateLikeDTO

// ============================================================================
// 기존 타입과의 호환성을 위한 추가 타입들
// ============================================================================

// Auth 관련 타입들
export interface LoginRequest {
  email: string
  password: string
  recaptchaToken: string
}

export interface RegisterRequest {
  email: string
  password: string
  nickname: string
  phone?: string
  gender?: string
  birthday?: Date | string | null
  recaptchaToken: string
}

export interface LoginResponse {
  success: boolean
  message: string
  accessToken?: string
  user?: User
  error?: string
}

export interface RegisterResponse {
  success: boolean
  message: string
  user?: User
  error?: string
}

export interface PasswordResetRequest {
  email: string
  recaptchaToken: string
}

export interface PasswordResetConfirm {
  token: string
  newPassword: string
  confirmPassword: string
}

export interface EmailVerification {
  token: string
}

export interface AccountRecoveryRequest {
  email: string
  question: string
  answer: string
  recaptchaToken: string
}

export interface RefreshResponse {
  success: boolean
  message: string
  accessToken?: string
  error?: string
}

export interface LogoutResponse {
  success: boolean
  message: string
  error?: string
}

export interface AuthenticatedRequest {
  user: {
    id: number
    userId: number
    email: string
    role: string
  }
}

// Plan, Session, Goal Request 타입들
export type CreatePlanRequest = import("./workoutplan.dto").CreateWorkoutPlanDTO
export type UpdatePlanRequest = import("./workoutplan.dto").UpdateWorkoutPlanDTO
export type CreateSessionRequest =
  import("./workoutsession.dto").CreateWorkoutSessionDTO
export type UpdateSessionRequest =
  import("./workoutsession.dto").UpdateWorkoutSessionDTO
export type CreateGoalRequest = import("./workoutgoal.dto").CreateWorkoutGoalDTO
export type UpdateGoalRequest = import("./workoutgoal.dto").UpdateWorkoutGoalDTO

// DashboardData 타입
export interface DashboardData {
  totalWorkouts: number
  totalSessions: number
  totalGoals: number
  completedGoals: number
  totalDuration: number
  totalCalories: number
  averageRating: number
  favoriteExercises: string[]
  recentSessions: any[]
  upcomingGoals: any[]
  weeklyProgress: any[]
  monthlyStats: any[]
}

// WorkoutStats 타입
export interface WorkoutStats {
  id: number
  userId: number
  totalWorkouts: number
  totalDuration: number
  totalCalories: number
  averageRating: number
  createdAt: Date
  updatedAt: Date
}

// WorkoutStatsDTO 타입 (기존 코드와의 호환성을 위해)
export type WorkoutStatsDTO = WorkoutStats

// WorkoutProgress 타입
export interface WorkoutProgress {
  id: number
  userId: number
  goalId: number
  currentValue: number
  targetValue: number
  progressPercentage: number
  createdAt: Date
  updatedAt: Date
}

// Common API Response 타입들
export interface ApiResponse<T = any> {
  success: boolean
  message: string
  data?: T
  error?: string
}

export interface ErrorResponse {
  success: false
  message: string
  error: string
}

// Pagination 타입
export interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
}

// Search/Filter 타입들
export interface SearchQuery {
  q?: string
  page?: number
  limit?: number
  sort?: string
}

export interface FilterQuery extends SearchQuery {
  category?: string
  difficulty?: string
  target?: string
}

// PaginationParams 타입
export interface PaginationParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: "asc" | "desc"
}

// WorkoutReminderDTO 타입
export interface WorkoutReminderDTO {
  id: number
  userId: number
  title: string
  message: string
  description?: string
  time?: string
  days?: string[]
  scheduledTime: Date
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

// GoalProgressBarProps 타입
export interface GoalProgressBarProps {
  goal: import("./workoutgoal.dto").WorkoutGoalDTO
  className?: string
}

// SessionCardProps 타입
export interface SessionCardProps {
  session: import("./workoutsession.dto").WorkoutSessionDTO
  onEdit?: (session: import("./workoutsession.dto").WorkoutSessionDTO) => void
  onDelete?: (sessionId: number) => void
  className?: string
}
