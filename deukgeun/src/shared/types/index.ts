// ============================================================================
// 중앙화된 타입 시스템
// 모든 타입 정의를 통합 관리
// ============================================================================

// 공통 유틸리티 타입
export * from "./common"

// DTO 타입들은 별도로 export하여 중복 방지
export type {
  UserDTO,
  CreateUserDTO,
  UpdateUserDTO,
  UserDTOResponse,
  UserDTOListResponse,
  WorkoutPlanDTO,
  CreateWorkoutPlanDTO,
  UpdateWorkoutPlanDTO,
  WorkoutPlanDTOResponse,
  WorkoutPlanDTOListResponse,
  WorkoutPlanExerciseDTO,
  CreateWorkoutPlanExerciseDTO,
  UpdateWorkoutPlanExerciseDTO,
  WorkoutPlanExerciseDTOResponse,
  WorkoutPlanExercise,
  WorkoutSessionDTO,
  CreateWorkoutSessionDTO,
  UpdateWorkoutSessionDTO,
  WorkoutSessionDTOResponse,
  WorkoutSessionDTOListResponse,
  WorkoutGoalDTO,
  CreateWorkoutGoalDTO,
  UpdateWorkoutGoalDTO,
  WorkoutGoalDTOResponse,
  WorkoutGoalDTOListResponse,
  MachineDTO,
  CreateMachineDTO,
  UpdateMachineDTO,
  MachineDTOResponse,
  MachineDTOListResponse,
  MachineCategoryDTO,
  DifficultyLevelDTO,
  GymDTO,
  CreateGymDTO,
  UpdateGymDTO,
  GymDTOResponse,
  PostDTO,
  CreatePostDTO,
  UpdatePostDTO,
  PostDTOResponse,
  CommentDTO,
  CreateCommentDTO,
  UpdateCommentDTO,
  CommentDTOResponse,
  LikeDTO,
  CreateLikeDTO,
  UpdateLikeDTO,
  LikeDTOResponse,
  UserRewardDTO,
  CreateUserRewardDTO,
  UpdateUserRewardDTO,
  UserRewardDTOResponse,
  ExpHistoryDTO,
  CreateExpHistoryDTO,
  UpdateExpHistoryDTO,
  ExpHistoryDTOResponse,
  UserLevelDTO,
  CreateUserLevelDTO,
  UpdateUserLevelDTO,
  UserLevelDTOResponse,
  MilestoneDTO,
  CreateMilestoneDTO,
  UpdateMilestoneDTO,
  MilestoneDTOResponse,
  UserStreakDTO,
  CreateUserStreakDTO,
  UpdateUserStreakDTO,
  UserStreakDTOResponse,
  ExerciseSetDTO,
  CreateExerciseSetDTO,
  UpdateExerciseSetDTO,
  ExerciseSetDTOResponse,
  ExerciseSetDTOListResponse,
  DashboardData,
  WorkoutStatsDTO,
  WorkoutReminderDTO,
  GoalProgressBarProps,
  SessionCardProps,
  PaginationParams,
} from "./dto"

// ============================================================================
// 통합된 타입 별칭 (기존 코드와의 호환성을 위해)
// ============================================================================

// Machine 관련 타입
export type {
  Machine,
  CreateMachineRequest,
  UpdateMachineRequest,
  MachineResponse,
  MachineListResponse,
  MachineCategory,
  DifficultyLevel,
  MachineFilterQuery,
} from "./dto"

// User 관련 타입
export type {
  User,
  CreateUserRequest,
  UpdateUserRequest,
  UserResponse,
} from "./dto"

// Post 관련 타입
export type {
  Post,
  PostCategoryInfo,
  CreatePostRequest,
  UpdatePostRequest,
  PostResponse,
} from "./dto"

// Comment 관련 타입
export type {
  Comment,
  CreateCommentRequest,
  UpdateCommentRequest,
  CommentResponse,
} from "./dto"

// Gym 관련 타입
export type {
  Gym,
  CreateGymRequest,
  UpdateGymRequest,
  GymResponse,
} from "./dto"

// WorkoutSession 관련 타입
export type {
  WorkoutSession,
  CreateWorkoutSessionRequest,
  UpdateWorkoutSessionRequest,
  WorkoutSessionResponse,
} from "./dto"

// WorkoutPlan 관련 타입
export type {
  WorkoutPlan,
  CreateWorkoutPlanRequest,
  UpdateWorkoutPlanRequest,
  WorkoutPlanResponse,
} from "./dto"

// WorkoutGoal 관련 타입
export type {
  WorkoutGoal,
  CreateWorkoutGoalRequest,
  UpdateWorkoutGoalRequest,
  WorkoutGoalResponse,
} from "./dto"

// ExerciseSet 관련 타입
export type {
  ExerciseSet,
  CreateExerciseSetRequest,
  UpdateExerciseSetRequest,
  ExerciseSetResponse,
} from "./dto"

// ExpHistory 관련 타입
export type {
  ExpHistory,
  CreateExpHistoryRequest,
  UpdateExpHistoryRequest,
  ExpHistoryResponse,
} from "./dto"

// UserLevel 관련 타입
export type {
  UserLevel,
  CreateUserLevelRequest,
  UpdateUserLevelRequest,
  UserLevelResponse,
} from "./dto"

// UserReward 관련 타입
export type {
  UserReward,
  CreateUserRewardRequest,
  UpdateUserRewardRequest,
  UserRewardResponse,
} from "./dto"

// UserStreak 관련 타입
export type {
  UserStreak,
  CreateUserStreakRequest,
  UpdateUserStreakRequest,
  UserStreakResponse,
} from "./dto"

// Milestone 관련 타입
export type {
  Milestone,
  CreateMilestoneRequest,
  UpdateMilestoneRequest,
  MilestoneResponse,
} from "./dto"

// Like 관련 타입
export type {
  Like,
  CreateLikeRequest,
  UpdateLikeRequest,
  LikeResponse,
} from "./dto"

// Auth 관련 타입
export type {
  LoginRequest,
  RegisterRequest,
  LoginResponse,
  RegisterResponse,
  PasswordResetRequest,
  PasswordResetConfirm,
  EmailVerification,
  AccountRecoveryRequest,
} from "./dto"

// API 관련 타입
export type {
  ApiResponse,
  ErrorResponse,
  PaginationInfo,
  SearchQuery,
  FilterQuery,
} from "./dto"
