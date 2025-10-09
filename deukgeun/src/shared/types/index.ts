// ============================================================================
// 중앙화된 타입 시스템
// 모든 타입 정의를 통합 관리
// ============================================================================

// 공통 유틸리티 타입 (기본 타입들만)
export type {
  Nullable,
  Optional,
  DeepPartial,
  ApiResponse,
  PaginatedResponse,
  ErrorResponse,
  SuccessResponse,
  LoadingState,
  UserRole,
  Gender,
  User,
  UserProfile,
  DateString,
  TimeString,
  ID,
} from "./common"

// DTO 타입들은 별도로 export하여 중복 방지
export * from "./dto"

// ============================================================================
// 통합된 타입 별칭 (기존 코드와의 호환성을 위해)
// ============================================================================

// 모든 타입들은 dto/index.ts에서 export됨
