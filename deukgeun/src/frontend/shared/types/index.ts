// ============================================================================
// 프론트엔드 타입 시스템 - 중앙화된 타입 관리
// ============================================================================

// 중앙 타입 시스템 재사용 (명시적 export로 중복 방지)
module.exports.// 공통 타입들
  ApiResponse = // 공통 타입들
  ApiResponse
module.exports.PaginatedResponse = PaginatedResponse
module.exports.ErrorResponse = ErrorResponse
module.exports.SuccessResponse = SuccessResponse
module.exports.// DTO 타입들
  UserDTO = // DTO 타입들
  UserDTO
module.exports.CreateUserDTO = CreateUserDTO
module.exports.UpdateUserDTO = UpdateUserDTO
module.exports.UserDTOResponse = UserDTOResponse
module.exports.UserDTOListResponse = UserDTOListResponse
module.exports.MachineDTO = MachineDTO
module.exports.CreateMachineDTO = CreateMachineDTO
module.exports.UpdateMachineDTO = UpdateMachineDTO
module.exports.MachineDTOResponse = MachineDTOResponse
module.exports.MachineDTOListResponse = MachineDTOListResponse
module.exports.MachineCategoryDTO = MachineCategoryDTO
module.exports.DifficultyLevelDTO = DifficultyLevelDTO
module.exports.WorkoutPlanDTO = WorkoutPlanDTO
module.exports.CreateWorkoutPlanDTO = CreateWorkoutPlanDTO
module.exports.UpdateWorkoutPlanDTO = UpdateWorkoutPlanDTO
module.exports.WorkoutPlanDTOResponse = WorkoutPlanDTOResponse
module.exports.WorkoutPlanDTOListResponse = WorkoutPlanDTOListResponse
module.exports.WorkoutPlanExerciseDTO = WorkoutPlanExerciseDTO
module.exports.CreateWorkoutPlanExerciseDTO = CreateWorkoutPlanExerciseDTO
module.exports.UpdateWorkoutPlanExerciseDTO = UpdateWorkoutPlanExerciseDTO
module.exports.WorkoutPlanExerciseDTOResponse = WorkoutPlanExerciseDTOResponse
module.exports.WorkoutPlanExercise = WorkoutPlanExercise
module.exports.WorkoutSessionDTO = WorkoutSessionDTO
module.exports.CreateWorkoutSessionDTO = CreateWorkoutSessionDTO
module.exports.UpdateWorkoutSessionDTO = UpdateWorkoutSessionDTO
module.exports.WorkoutSessionDTOResponse = WorkoutSessionDTOResponse
module.exports.WorkoutSessionDTOListResponse = WorkoutSessionDTOListResponse
module.exports.WorkoutGoalDTO = WorkoutGoalDTO
module.exports.CreateWorkoutGoalDTO = CreateWorkoutGoalDTO
module.exports.UpdateWorkoutGoalDTO = UpdateWorkoutGoalDTO
module.exports.WorkoutGoalDTOResponse = WorkoutGoalDTOResponse
module.exports.WorkoutGoalDTOListResponse = WorkoutGoalDTOListResponse
module.exports.ExerciseSetDTO = ExerciseSetDTO
module.exports.CreateExerciseSetDTO = CreateExerciseSetDTO
module.exports.UpdateExerciseSetDTO = UpdateExerciseSetDTO
module.exports.ExerciseSetDTOResponse = ExerciseSetDTOResponse
module.exports.ExerciseSetDTOListResponse = ExerciseSetDTOListResponse
module.exports.GymDTO = GymDTO
module.exports.CreateGymDTO = CreateGymDTO
module.exports.UpdateGymDTO = UpdateGymDTO
module.exports.GymDTOResponse = GymDTOResponse
module.exports.PostDTO = PostDTO
module.exports.CreatePostDTO = CreatePostDTO
module.exports.UpdatePostDTO = UpdatePostDTO
module.exports.PostDTOResponse = PostDTOResponse
module.exports.CommentDTO = CommentDTO
module.exports.CreateCommentDTO = CreateCommentDTO
module.exports.UpdateCommentDTO = UpdateCommentDTO
module.exports.CommentDTOResponse = CommentDTOResponse
module.exports.LikeDTO = LikeDTO
module.exports.CreateLikeDTO = CreateLikeDTO
module.exports.UpdateLikeDTO = UpdateLikeDTO
module.exports.LikeDTOResponse = LikeDTOResponse
module.exports.UserRewardDTO = UserRewardDTO
module.exports.CreateUserRewardDTO = CreateUserRewardDTO
module.exports.UpdateUserRewardDTO = UpdateUserRewardDTO
module.exports.UserRewardDTOResponse = UserRewardDTOResponse
module.exports.ExpHistoryDTO = ExpHistoryDTO
module.exports.CreateExpHistoryDTO = CreateExpHistoryDTO
module.exports.UpdateExpHistoryDTO = UpdateExpHistoryDTO
module.exports.ExpHistoryDTOResponse = ExpHistoryDTOResponse
module.exports.UserLevelDTO = UserLevelDTO
module.exports.CreateUserLevelDTO = CreateUserLevelDTO
module.exports.UpdateUserLevelDTO = UpdateUserLevelDTO
module.exports.UserLevelDTOResponse = UserLevelDTOResponse
module.exports.MilestoneDTO = MilestoneDTO
module.exports.CreateMilestoneDTO = CreateMilestoneDTO
module.exports.UpdateMilestoneDTO = UpdateMilestoneDTO
module.exports.MilestoneDTOResponse = MilestoneDTOResponse
module.exports.UserStreakDTO = UserStreakDTO
module.exports.CreateUserStreakDTO = CreateUserStreakDTO
module.exports.UpdateUserStreakDTO = UpdateUserStreakDTO
module.exports.UserStreakDTOResponse = UserStreakDTOResponse
module.exports.DashboardData = DashboardData
module.exports.WorkoutStatsDTO = WorkoutStatsDTO
module.exports.WorkoutReminderDTO = WorkoutReminderDTO
module.exports.GoalProgressBarProps = GoalProgressBarProps
module.exports.SessionCardProps = SessionCardProps
module.exports.PaginationParams = PaginationParams
module.exports.// 타입 별칭들
  User = // 타입 별칭들
  User
module.exports.Machine = Machine
module.exports.WorkoutPlan = WorkoutPlan
module.exports.WorkoutSession = WorkoutSession
module.exports.WorkoutGoal = WorkoutGoal
module.exports.ExerciseSet = ExerciseSet
module.exports.CreatePlanRequest = CreatePlanRequest
module.exports.UpdatePlanRequest = UpdatePlanRequest
module.exports.CreateSessionRequest = CreateSessionRequest
module.exports.UpdateSessionRequest = UpdateSessionRequest
module.exports.CreateGoalRequest = CreateGoalRequest
module.exports.UpdateGoalRequest = UpdateGoalRequest
module.exports.// 기타 타입들
  PostCategoryInfo = // 기타 타입들
  PostCategoryInfo
module.exports. =  from "../../../shared/types"

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
