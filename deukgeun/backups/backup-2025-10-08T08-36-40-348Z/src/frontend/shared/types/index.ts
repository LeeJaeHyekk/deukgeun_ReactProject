// ============================================================================
// 프론트엔드 타입 시스템 - 중앙화된 타입 관리
// ============================================================================

// 중앙 타입 시스템 재사용 (명시적 export로 중복 방지)
export {
  // 공통 타입들
  ApiResponse,
  PaginatedResponse,
  ErrorResponse,
  SuccessResponse,

  // DTO 타입들
  UserDTO,
  CreateUserDTO,
  UpdateUserDTO,
  UserDTOResponse,
  UserDTOListResponse,
  MachineDTO,
  CreateMachineDTO,
  UpdateMachineDTO,
  MachineDTOResponse,
  MachineDTOListResponse,
  MachineCategoryDTO,
  DifficultyLevelDTO,
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
  ExerciseSetDTO,
  CreateExerciseSetDTO,
  UpdateExerciseSetDTO,
  ExerciseSetDTOResponse,
  ExerciseSetDTOListResponse,
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
  DashboardData,
  WorkoutStatsDTO,
  WorkoutReminderDTO,
  GoalProgressBarProps,
  SessionCardProps,
  PaginationParams,

  // 타입 별칭들
  User,
  Machine,
  WorkoutPlan,
  WorkoutSession,
  WorkoutGoal,
  ExerciseSet,
  CreatePlanRequest,
  UpdatePlanRequest,
  CreateSessionRequest,
  UpdateSessionRequest,
  CreateGoalRequest,
  UpdateGoalRequest,

  // 기타 타입들
  PostCategoryInfo,
} from "../../../shared/types"

// Mix.json 기반 자동 생성 타입들
export * from "./mix-generated"

// ============================================================================
// 프론트엔드 전용 타입 (중앙 타입과 중복되지 않는 것들만)
// ============================================================================

// 프론트엔드 설정 타입
export interface FrontendConfig {
  apiBaseUrl: string
  kakaoApiKey: string
  recaptchaSiteKey: string
  environment: "development" | "production" | "test"
}

// UI 상태 타입
export interface PaginationState {
  page: number
  limit: number
  total: number
  totalPages: number
}

// 폼 관련 타입
export interface FormField {
  value: string
  error?: string
  touched: boolean
}

export interface FormState {
  [key: string]: FormField
}

// 모달 관련 타입
export interface ModalState {
  isOpen: boolean
  data?: unknown
}

// 알림 관련 타입
export interface Notification {
  id: string
  type: "success" | "error" | "warning" | "info"
  title: string
  message: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

// 테마 관련 타입
export interface Theme {
  mode: "light" | "dark"
  primaryColor: string
  secondaryColor: string
  backgroundColor: string
  textColor: string
}

// 사용자 설정 타입
export interface UserSettings {
  theme: Theme
  language: string
  notifications: {
    email: boolean
    push: boolean
    sms: boolean
  }
  privacy: {
    profileVisibility: "public" | "private" | "friends"
    workoutVisibility: "public" | "private" | "friends"
  }
}

// API 요청/응답 래퍼 타입
export interface ApiRequest<T = unknown> {
  data: T
  loading?: boolean
  error?: string
}

// 캐시 관련 타입
export interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

export interface CacheStore {
  [key: string]: CacheEntry<unknown>
}

// 웹소켓 관련 타입
export interface WebSocketMessage {
  type: string
  payload: unknown
  timestamp: number
}

export interface WebSocketState {
  isConnected: boolean
  isConnecting: boolean
  error?: string
  lastMessage?: WebSocketMessage
}

// 파일 업로드 관련 타입
export interface FileUpload {
  file: File
  progress: number
  status: "pending" | "uploading" | "completed" | "error"
  url?: string
  error?: string
}

// 검색 관련 타입
export interface SearchFilters {
  query: string
  category?: string
  location?: string
  priceRange?: [number, number]
  rating?: number
  sortBy?: string
  sortOrder?: "asc" | "desc"
}

// 필터 관련 타입
export interface FilterOption {
  value: string
  label: string
  count?: number
  selected?: boolean
}

export interface FilterGroup {
  name: string
  options: FilterOption[]
  multiSelect?: boolean
}

// 차트 관련 타입
export interface ChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    backgroundColor?: string
    borderColor?: string
  }[]
}

// 달력 관련 타입
export interface CalendarEvent {
  id: string
  title: string
  description?: string
  start: Date
  end: Date
  color?: string
  type: "workout" | "goal" | "reminder" | "milestone"
}

// 드래그 앤 드롭 관련 타입
export interface DragItem {
  id: string
  type: string
  data?: unknown
}

export interface DropResult {
  draggableId: string
  type: string
  source: {
    droppableId: string
    index: number
  }
  destination?: {
    droppableId: string
    index: number
  }
}

// 애니메이션 관련 타입
export interface AnimationConfig {
  duration: number
  easing: string
  delay?: number
  repeat?: number
  yoyo?: boolean
}

// 접근성 관련 타입
export interface AccessibilityConfig {
  highContrast: boolean
  largeText: boolean
  screenReader: boolean
  keyboardNavigation: boolean
}

// 성능 모니터링 타입
export interface PerformanceMetrics {
  pageLoadTime: number
  apiResponseTime: number
  renderTime: number
  memoryUsage: number
}

// 에러 바운더리 타입
export interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: {
    componentStack: string
  }
}

// 라우터 관련 타입
export interface RouteConfig {
  path: string
  component: React.ComponentType
  exact?: boolean
  private?: boolean
  roles?: string[]
}

// 권한 관련 타입
export interface Permission {
  resource: string
  action: string
  conditions?: Record<string, unknown>
}

export interface Role {
  name: string
  permissions: Permission[]
}

// 국제화 관련 타입
export interface Locale {
  code: string
  name: string
  flag?: string
  direction: "ltr" | "rtl"
}

export interface Translation {
  [key: string]: string | Translation
}

// 개발 도구 관련 타입
export interface DevToolsConfig {
  enableReduxDevTools: boolean
  enableReactDevTools: boolean
  enablePerformanceMonitor: boolean
  enableErrorReporting: boolean
}
