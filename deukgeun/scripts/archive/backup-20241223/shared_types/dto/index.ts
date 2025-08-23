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

// ExerciseSet DTOs
export * from "./exerciseset.dto"

// ExpHistory DTOs
export * from "./exphistory.dto"

// UserLevel DTOs
export * from "./userlevel.dto"

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

// Machine 관련 추가 타입들
export type MachineCategory = import("./machine.dto").MachineCategory
export type DifficultyLevel = import("./machine.dto").DifficultyLevel

// Machine Filter Query 타입
export interface MachineFilterQuery {
  category?: MachineCategory
  difficulty?: DifficultyLevel
  target?: string
  search?: string
}

// User 타입 별칭
export type User = import("./user.dto").UserDTO
export type CreateUserRequest = import("./user.dto").CreateUserDTO
export type UpdateUserRequest = import("./user.dto").UpdateUserDTO
export type UserResponse = import("./user.dto").UserDTOResponse

// Post 타입 별칭
export type Post = import("./post.dto").PostDTO
export type CreatePostRequest = import("./post.dto").CreatePostDTO
export type UpdatePostRequest = import("./post.dto").UpdatePostDTO
export type PostResponse = import("./post.dto").PostDTOResponse

// Comment 타입 별칭
export type Comment = import("./comment.dto").CommentDTO
export type CreateCommentRequest = import("./comment.dto").CreateCommentDTO
export type UpdateCommentRequest = import("./comment.dto").UpdateCommentDTO
export type CommentResponse = import("./comment.dto").CommentDTOResponse

// Gym 타입 별칭
export type Gym = import("./gym.dto").GymDTO
export type CreateGymRequest = import("./gym.dto").CreateGymDTO
export type UpdateGymRequest = import("./gym.dto").UpdateGymDTO
export type GymResponse = import("./gym.dto").GymDTOResponse

// WorkoutSession 타입 별칭
export type WorkoutSession = import("./workoutsession.dto").WorkoutSessionDTO
export type CreateWorkoutSessionRequest = import("./workoutsession.dto").CreateWorkoutSessionDTO
export type UpdateWorkoutSessionRequest = import("./workoutsession.dto").UpdateWorkoutSessionDTO
export type WorkoutSessionResponse = import("./workoutsession.dto").WorkoutSessionDTOResponse

// ExerciseSet 타입 별칭
export type ExerciseSet = import("./exerciseset.dto").ExerciseSetDTO
export type CreateExerciseSetRequest = import("./exerciseset.dto").CreateExerciseSetDTO
export type UpdateExerciseSetRequest = import("./exerciseset.dto").UpdateExerciseSetDTO
export type ExerciseSetResponse = import("./exerciseset.dto").ExerciseSetDTOResponse

// ExpHistory 타입 별칭
export type ExpHistory = import("./exphistory.dto").ExpHistoryDTO
export type CreateExpHistoryRequest = import("./exphistory.dto").CreateExpHistoryDTO
export type UpdateExpHistoryRequest = import("./exphistory.dto").UpdateExpHistoryDTO
export type ExpHistoryResponse = import("./exphistory.dto").ExpHistoryDTOResponse

// UserLevel 타입 별칭
export type UserLevel = import("./userlevel.dto").UserLevelDTO
export type CreateUserLevelRequest = import("./userlevel.dto").CreateUserLevelDTO
export type UpdateUserLevelRequest = import("./userlevel.dto").UpdateUserLevelDTO
export type UserLevelResponse = import("./userlevel.dto").UserLevelDTOResponse

// Like 타입 별칭
export type Like = import("./like.dto").LikeDTO
export type CreateLikeRequest = import("./like.dto").CreateLikeDTO
export type UpdateLikeRequest = import("./like.dto").UpdateLikeDTO
export type LikeResponse = import("./like.dto").LikeDTOResponse

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
  birthday?: string
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
