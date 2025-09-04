// ============================================================================
// 공통 타입 시스템 - 프론트엔드와 백엔드에서 공유하는 핵심 타입들만 정의
// ============================================================================

// 공통 유틸리티 타입
export * from "./common"

// 인증 관련 타입
export * from "./auth"

// 공통으로 사용되는 기본 타입들만 export
// DTO 타입들은 각각의 도메인에서 정의하여 중복 방지
export type {
  // 기본 엔티티 타입들
  User,
  Gym,
  Machine,
  
  // 기본 요청/응답 타입들
  ApiResponse,
  ApiError,
  PaginatedResponse,
  PaginationParams,
  
  // 공통 상태 타입들
  LoadingState,
  FormState,
  ModalState,
  Notification,
  FileUpload,
  
  // 워크아웃 관련 타입들
  WorkoutPlan,
  WorkoutPlanExercise,
  WorkoutSession,
  ExerciseSet,
  WorkoutGoal,
  CreatePlanRequest,
  UpdatePlanRequest,
  CreateSessionRequest,
  UpdateSessionRequest,
  CreateGoalRequest,
  UpdateGoalRequest,
  CreateExerciseSetRequest,
  UpdateExerciseSetRequest,
  DashboardData,
} from "./common"

// ============================================================================
// 공통 타입 사용 가이드
// ============================================================================
// 
// 1. 백엔드 전용 타입: src/backend/types/backend.types.ts
// 2. 프론트엔드 전용 타입: src/frontend/types/frontend.types.ts  
// 3. 공통 타입: src/shared/types/ (이 파일)
//
// 각 도메인에서는 필요한 타입만 import하여 사용하세요.
// 중복을 방지하기 위해 shared 타입을 과도하게 사용하지 마세요.
