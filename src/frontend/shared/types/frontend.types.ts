// ============================================================================
// 프론트엔드 전용 타입 시스템
// 백엔드와 중복되지 않는 프론트엔드 고유 타입들만 정의
// ============================================================================

// UI 컴포넌트 관련 타입
export interface ComponentProps {
  className?: string
  children?: React.ReactNode
  id?: string
  style?: React.CSSProperties
}

// 폼 관련 타입
export interface FormField {
  name: string
  label: string
  type:
    | "text"
    | "email"
    | "password"
    | "number"
    | "select"
    | "textarea"
    | "checkbox"
    | "radio"
  required?: boolean
  placeholder?: string
  options?: { value: string; label: string }[]
  validation?: {
    min?: number
    max?: number
    pattern?: string
    message?: string
  }
}

export interface FormState<T = Record<string, any>> {
  values: T
  errors: Partial<Record<keyof T, string>>
  touched: Partial<Record<keyof T, boolean>>
  isSubmitting: boolean
  isValid: boolean
}

// 라우팅 관련 타입
export interface RouteConfig {
  path: string
  component: React.ComponentType
  exact?: boolean
  protected?: boolean
  roles?: string[]
  layout?: React.ComponentType
}

export interface NavigationItem {
  label: string
  path: string
  icon?: React.ComponentType
  children?: NavigationItem[]
  badge?: number | string
  disabled?: boolean
}

// 상태 관리 관련 타입
export interface AppState {
  user: UserState
  ui: UIState
  workout: WorkoutState
  gym: GymState
  community: CommunityState
}

export interface UserState {
  isAuthenticated: boolean
  user: User | null
  loading: boolean
  error: string | null
}

export interface UIState {
  theme: "light" | "dark"
  sidebarOpen: boolean
  notifications: Notification[]
  modals: ModalState[]
  loading: boolean
}

export interface WorkoutState {
  plans: WorkoutPlan[]
  sessions: WorkoutSession[]
  goals: WorkoutGoal[]
  currentPlan: WorkoutPlan | null
  currentSession: WorkoutSession | null
  loading: boolean
  error: string | null
}

export interface GymState {
  gyms: Gym[]
  currentGym: Gym | null
  machines: Machine[]
  loading: boolean
  error: string | null
}

export interface CommunityState {
  posts: Post[]
  comments: Comment[]
  likes: Like[]
  loading: boolean
  error: string | null
}

// 사용자 관련 타입
export interface User {
  id: number
  email: string
  username: string
  profileImage?: string
  role: string
  level: number
  experience: number
  createdAt: Date
  updatedAt: Date
}

// 알림 관련 타입
export interface Notification {
  id: string
  type: "success" | "error" | "warning" | "info"
  title: string
  message: string
  timestamp: Date
  read: boolean
  action?: {
    label: string
    onClick: () => void
  }
}

// 모달 관련 타입
export interface ModalState {
  id: string
  isOpen: boolean
  component: React.ComponentType
  props?: Record<string, any>
  onClose?: () => void
}

// 차트 및 데이터 시각화 타입
export interface ChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    backgroundColor?: string
    borderColor?: string
    borderWidth?: number
  }[]
}

export interface ProgressData {
  current: number
  target: number
  percentage: number
  label: string
  color?: string
}

// 검색 및 필터링 타입
export interface SearchFilters {
  keyword?: string
  category?: string
  dateRange?: {
    start: Date
    end: Date
  }
  tags?: string[]
  status?: string
  sortBy?: string
  sortOrder?: "asc" | "desc"
}

// 페이지네이션 타입
export interface PaginationState {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

// API 요청 상태 타입
export interface RequestState<T = any> {
  data: T | null
  loading: boolean
  error: string | null
  lastUpdated: Date | null
}

// 로컬 스토리지 타입
export interface LocalStorageData {
  theme: "light" | "dark"
  language: string
  userPreferences: Record<string, any>
  recentSearches: string[]
  favoriteItems: string[]
}

// 에러 처리 타입
export interface AppError {
  code: string
  message: string
  details?: any
  timestamp: Date
  userFriendly?: boolean
}

// 성능 모니터링 타입
export interface PerformanceMetrics {
  pageLoadTime: number
  componentRenderTime: number
  apiResponseTime: number
  memoryUsage: number
  timestamp: Date
}

// 접근성 관련 타입
export interface AccessibilityProps {
  ariaLabel?: string
  ariaDescribedBy?: string
  ariaHidden?: boolean
  role?: string
  tabIndex?: number
}

// 반응형 디자인 타입
export interface Breakpoint {
  xs: number
  sm: number
  md: number
  lg: number
  xl: number
}

export interface ResponsiveValue<T> {
  xs?: T
  sm?: T
  md?: T
  lg?: T
  xl?: T
}

// 운동 관련 DTO 타입들
export interface WorkoutPlanDTO {
  id: number
  userId: number
  name: string
  description?: string
  difficulty: "beginner" | "intermediate" | "advanced"
  duration: number // 분 단위
  frequency: number // 주당 횟수
  exercises: WorkoutPlanExerciseDTO[]
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

// 중복된 DTO 타입 정의는 파일 하단에 통합되어 있습니다.

// 헬스장 관련 DTO 타입들
export interface GymDTO {
  id: number
  name: string
  address: string
  phone?: string
  latitude: number
  longitude: number
  description?: string
  operatingHours?: string
  facilities: string[]
  rating?: number
  reviewCount: number
  images?: string[]
  website?: string
  isVerified: boolean
  createdAt: Date
  updatedAt: Date
}

export interface MachineDTO {
  id: number
  gymId: number
  name: string
  type: string
  brand?: string
  model?: string
  description?: string
  instructions?: string
  muscleGroups: string[]
  difficulty: "beginner" | "intermediate" | "advanced"
  isAvailable: boolean
  maintenanceStatus: "good" | "needs_attention" | "out_of_order"
  lastMaintenance?: Date
  images?: string[]
  createdAt: Date
  updatedAt: Date
}

// 커뮤니티 관련 DTO 타입들
export interface PostDTO {
  id: number
  userId: number
  user: UserDTO
  title: string
  content: string
  images?: string[]
  tags?: string[]
  category: string
  likeCount: number
  commentCount: number
  viewCount: number
  isPublished: boolean
  publishedAt?: Date
  createdAt: Date
  updatedAt: Date
}

export interface CommentDTO {
  id: number
  postId: number
  userId: number
  user: UserDTO
  content: string
  parentId?: number
  replies?: CommentDTO[]
  likeCount: number
  isEdited: boolean
  createdAt: Date
  updatedAt: Date
}

export interface LikeDTO {
  id: number
  userId: number
  targetType: "post" | "comment"
  targetId: number
  createdAt: Date
}

// 사용자 관련 DTO 타입들
export interface UserDTO {
  id: number
  email: string
  username: string
  nickname?: string
  profileImage?: string
  role: string
  level: number
  experience: number
  streak: number
  bio?: string
  isVerified: boolean
  createdAt: Date
  updatedAt: Date
}

export interface UserProfileDTO {
  id: number
  userId: number
  height?: number
  weight?: number
  bodyFat?: number
  muscleMass?: number
  fitnessGoal?: string
  experienceLevel?: string
  preferredWorkoutTypes?: string[]
  medicalConditions?: string[]
  allergies?: string[]
  emergencyContact?: {
    name: string
    phone: string
    relationship: string
  }
  createdAt: Date
  updatedAt: Date
}

// API 응답 타입
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
  statusCode: number
}

// 페이지네이션 응답 타입
export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// 기본 엔티티 타입들 (shared 타입과의 의존성 제거)
export interface User {
  id: number
  email: string
  username: string
  nickname?: string
  profileImage?: string
  role: string
  level: number
  experience: number
  maxExperience: number
  createdAt: Date
  updatedAt: Date
}

export interface Gym {
  id: number
  name: string
  address: string
  phone?: string
  latitude: number
  longitude: number
  description?: string
  operatingHours?: string
  facilities: string[]
  rating?: number
  reviewCount: number
  images?: string[]
  website?: string
  isVerified: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Machine {
  id: number
  gymId: number
  name: string
  type: string
  brand?: string
  model?: string
  description?: string
  instructions?: string
  muscleGroups: string[]
  difficulty: "beginner" | "intermediate" | "advanced"
  isAvailable: boolean
  maintenanceStatus: "good" | "needs_attention" | "out_of_order"
  lastMaintenance?: Date
  images?: string[]
  createdAt: Date
  updatedAt: Date
}

export interface Post {
  id: number
  userId: number
  user: User
  title: string
  content: string
  images?: string[]
  tags?: string[]
  category: string
  likeCount: number
  commentCount: number
  viewCount: number
  isPublished: boolean
  publishedAt?: Date
  createdAt: Date
  updatedAt: Date
}

export interface Comment {
  id: number
  postId: number
  userId: number
  user: User
  content: string
  parentId?: number
  replies?: Comment[]
  likeCount: number
  isEdited: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Like {
  id: number
  userId: number
  targetType: "post" | "comment"
  targetId: number
  createdAt: Date
}

// 운동 관련 기본 타입들
export interface WorkoutPlan {
  id: number
  userId: number
  name: string
  description?: string
  difficulty: "beginner" | "intermediate" | "advanced"
  duration: number
  frequency: number
  exercises: WorkoutPlanExercise[]
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface WorkoutPlanExercise {
  id: number
  workoutPlanId: number
  exerciseId: number
  exerciseName: string
  sets: number
  reps: number
  weight?: number
  duration?: number
  restTime: number
  order: number
  notes?: string
}

export interface WorkoutSession {
  id: number
  userId: number
  workoutPlanId?: number
  name: string
  startTime: Date
  endTime?: Date
  duration?: number
  exercises: ExerciseSet[]
  notes?: string
  rating?: number
  isCompleted: boolean
  createdAt: Date
  updatedAt: Date
}

export interface ExerciseSet {
  id: number
  workoutSessionId: number
  exerciseId: number
  exerciseName: string
  setNumber: number
  reps: number
  weight?: number
  duration?: number
  restTime: number
  notes?: string
  isCompleted: boolean
}

export interface WorkoutGoal {
  id: number
  userId: number
  title: string
  description?: string
  type: "weight" | "reps" | "duration" | "distance" | "custom"
  targetValue: number
  currentValue: number
  unit: string
  deadline?: Date
  isCompleted: boolean
  progress: number
  createdAt: Date
  updatedAt: Date
}

// 공통 상태 타입들
export interface LoadingState {
  isLoading: boolean
  error: string | null
}

export interface ErrorState {
  hasError: boolean
  error: string | null
}

export interface SuccessState {
  isSuccess: boolean
  message: string | null
}

// DTO 타입들 (백엔드와의 호환성을 위한 타입)
export interface WorkoutPlanDTO {
  id: number
  userId: number
  name: string
  description?: string
  difficulty: "beginner" | "intermediate" | "advanced"
  duration: number
  frequency: number
  exercises: WorkoutPlanExerciseDTO[]
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface WorkoutPlanExerciseDTO {
  id: number
  planId: number
  exerciseId: number
  machine: Machine
  weight: number
  reps: number
  order: number
  notes?: string
}

export interface WorkoutSessionDTO {
  id: number
  userId: number
  workoutPlanId?: number
  name: string
  startTime: Date
  endTime?: Date
  duration?: number
  exercises: ExerciseSetDTO[]
  notes?: string
  rating?: number
  isCompleted: boolean
  createdAt: Date
  updatedAt: Date
}

export interface ExerciseSetDTO {
  id: number
  sessionId: number
  exerciseId: number
  machine: Machine
  setNumber: number
  reps: number
  weight?: number
  duration?: number
  restTime: number
  notes?: string
  isCompleted: boolean
}

export interface WorkoutGoalDTO {
  id: number
  userId: number
  title: string
  description?: string
  type: "weight" | "reps" | "duration" | "distance" | "custom"
  targetValue: number
  currentValue: number
  unit: string
  deadline?: Date
  isCompleted: boolean
  progress: number
  createdAt: Date
  updatedAt: Date
}

// 차트 데이터 타입
export interface ChartData {
  date: string
  value: number
  label?: string
}

// 플랫폼 통계 타입
export interface PlatformStats {
  activeUsers: number
  totalGyms: number
  totalPosts: number
  achievements: number
}

// 레벨 진행 타입
export interface LevelProgress {
  level: number
  currentExp: number
  totalExp: number
  seasonExp: number
  expToNextLevel: number
  progressPercentage: number
}

// 사용자 통계 타입
export interface UserStats {
  totalWorkouts: number
  totalDuration: number
  averageRating: number
  completedGoals: number
  currentStreak: number
  longestStreak: number
  favoriteExercises: string[]
  progressHistory: ChartData[]
}
