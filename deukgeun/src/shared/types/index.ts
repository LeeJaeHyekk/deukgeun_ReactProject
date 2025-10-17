// ============================================================================
// 중앙화된 타입 시스템
// 모든 타입 정의를 통합 관리
// ============================================================================

// DTO 타입들을 먼저 import (순서 중요)
export type {
  // 기본 DTO 타입들
  BaseDTO,
  DTOResponse,
  DTOPaginationParams,
  DTOPaginatedResponse,
  
  // User DTOs
  UserDTO,
  CreateUserDTO,
  UpdateUserDTO,
  UserDTOResponse,
  UserDTOListResponse,
  
  // 인증 관련 DTOs
  LoginRequest,
  RegisterRequest,
  LoginResponse,
  RegisterResponse,
  PasswordResetRequest,
  PasswordResetConfirm,
  EmailVerification,
  AccountRecoveryRequest,
  RefreshResponse,
  LogoutResponse,
  AuthenticatedRequest,
  
  // Machine DTOs
  MachineDTO,
  MachineCategory,
  MachineCategoryDTO,
  DifficultyLevel,
  DifficultyLevelDTO,
  CreateMachineDTO,
  UpdateMachineDTO,
  MachineDTOResponse,
  MachineDTOListResponse,
  
  // Machine 타입 별칭 (호환성)
  CreateMachineRequest,
  UpdateMachineRequest,
  MachineListResponse,
  MachineResponse,
  
  // WorkoutPlan DTOs
  WorkoutPlanDTO,
  WorkoutPlanExerciseDTO,
  CreateWorkoutPlanDTO,
  UpdateWorkoutPlanDTO,
  WorkoutPlanDTOResponse,
  WorkoutPlanDTOListResponse,
  
  // WorkoutSession DTOs
  WorkoutSessionDTO,
  CreateWorkoutSessionDTO,
  UpdateWorkoutSessionDTO,
  WorkoutSessionDTOResponse,
  WorkoutSessionDTOListResponse,
  
  // WorkoutGoal DTOs
  WorkoutGoalDTO,
  CreateWorkoutGoalDTO,
  UpdateWorkoutGoalDTO,
  WorkoutGoalDTOResponse,
  WorkoutGoalDTOListResponse,
  
  // ExerciseSet DTOs
  ExerciseSetDTO,
  CreateExerciseSetDTO,
  UpdateExerciseSetDTO,
  ExerciseSetDTOResponse,
  ExerciseSetDTOListResponse,
  
  // Gym DTOs
  GymDTO,
  CreateGymDTO,
  UpdateGymDTO,
  GymDTOResponse,
  GymDTOListResponse,
  
  // UserLevel DTOs
  UserLevelDTO,
  
  // UserStreak DTOs
  UserStreakDTO,
  
  // WorkoutReminder DTOs
  WorkoutReminderDTO,
  
  // Community DTOs
  PostDTO,
  PostCategoryInfo,
  CommentDTO,
  CreatePostDTO,
  UpdatePostDTO,
  CreateCommentDTO,
  UpdateCommentDTO,
  PostDTOResponse,
  PostDTOListResponse,
  CommentDTOResponse,
  CommentDTOListResponse,
  
  // 유틸리티 타입들
  DTOWithTimestamps,
  CreateDTO,
  UpdateDTO,
  DTOListResponse,
  DTOSingleResponse,
} from "@shared/types/dto"

// 공통 유틸리티 타입
export type {
  Nullable,
  Optional,
  DeepPartial,
  ErrorResponse,
  SuccessResponse,
  LoadingState,
  UserRole,
  Gender,
  UserProfile,
  DateString,
  TimeString,
  ID,
  DashboardData,
  // API 요청/응답 타입들
  CreatePlanRequest,
  UpdatePlanRequest,
  CreateSessionRequest,
  UpdateSessionRequest,
  CreateGoalRequest,
  UpdateGoalRequest,
  CreateExerciseSetRequest,
  UpdateExerciseSetRequest,
  // 기본 타입들
  ApiResponse,
  PaginationParams,
  PaginatedResponse,
  User,
  Machine,
  Gym,
} from "@shared/types/common"

// 컴포넌트 Props 타입들 (백엔드에서는 제외)
// export * from "./components"

// 타입 가드 및 검증 함수들
export * from "@shared/types/guards"

// 기구 관련 타입들
export * from "@shared/types/equipment"

// ============================================================================
// 간소화된 타입 별칭 (기존 코드와의 호환성)
// 권장: 가능한 경우 직접 DTO 타입을 사용하세요 (예: UserDTO, WorkoutPlanDTO)
// ============================================================================

// 타입 별칭 (기존 코드와의 호환성) - DTO 타입들을 직접 참조
export type WorkoutGoal = import("./dto").WorkoutGoalDTO
export type WorkoutPlan = import("./dto").WorkoutPlanDTO
export type WorkoutSession = import("./dto").WorkoutSessionDTO
export type WorkoutPlanExercise = import("./dto").WorkoutPlanExerciseDTO
export type ExerciseSet = import("./dto").ExerciseSetDTO
export type UserLevel = import("./dto").UserLevelDTO
export type Post = import("./dto").PostDTO
export type Comment = import("./dto").CommentDTO
export type PostCategory = import("./dto").PostCategoryInfo
