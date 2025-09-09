// ============================================================================
// 타입 정의 인덱스
// ============================================================================

// 공통 타입
export type {
  ApiResponse,
  ApiListResponse,
  PaginationParams
} from "./common"

// 인증 관련 타입
export type {
  User as AuthUser,
  AuthContextType,
  LoginRequest,
  RegisterRequest
} from "./auth"

// 워크아웃 관련 타입
export type {
  WorkoutGoal,
  WorkoutPlan,
  WorkoutSession,
  ExerciseSet,
  WorkoutPlanExercise
} from "./workout"

// 머신 관련 타입
export type {
  Machine,
  MachineDTO,
  CreateMachineRequest,
  UpdateMachineRequest,
  MachineSearchParams,
  MachineDifficulty,
  MachineCategory,
  MachineStats
} from "./machine"

// 사용자 관련 타입
export type {
  User,
  UserProfile,
  UserPreferences,
  UpdateUserRequest,
  ChangePasswordRequest,
  UserStats,
  UserAchievement
} from "./user"

// 헬스장 관련 타입
export interface Gym {
  id: string
  name: string
  address: string
  phone?: string
  website?: string
  latitude: number
  longitude: number
  facilities: string[]
  operatingHours: {
    monday: string
    tuesday: string
    wednesday: string
    thursday: string
    friday: string
    saturday: string
    sunday: string
  }
  price?: {
    monthly: number
    daily?: number
    hourly?: number
    currency: string
  }
  rating: number
  reviewCount: number
  images: string[]
  description?: string
  createdAt: string
  updatedAt: string
}

// 커뮤니티 관련 타입
export interface Post {
  id: string
  title: string
  content: string
  author: {
    id: string
    name: string
    avatar?: string
  }
  tags: string[]
  images: string[]
  likes: number
  comments: number
  isLiked: boolean
  createdAt: string
  updatedAt: string
}

export interface Comment {
  id: string
  content: string
  author: {
    id: string
    name: string
    avatar?: string
  }
  parentId?: string
  likes: number
  isLiked: boolean
  replies?: Comment[]
  createdAt: string
  updatedAt: string
}

// 관리자 관련 타입
export interface AdminStats {
  totalUsers: number
  totalGyms: number
  totalPosts: number
  totalWorkouts: number
  activeUsers: number
  newUsersThisMonth: number
  popularGyms: Array<{
    id: string
    name: string
    reviewCount: number
  }>
  recentActivity: Array<{
    type: string
    description: string
    timestamp: string
  }>
}
