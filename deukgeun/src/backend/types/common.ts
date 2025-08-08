// 공통 타입 정의
export interface ApiResponse<T = unknown> {
  success: boolean
  message: string
  data?: T
  error?: string
}

export interface PaginationParams {
  page?: number
  limit?: number
  offset?: number
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface ErrorResponse {
  success: false
  message: string
  error: string
  statusCode?: number
}

// 사용자 관련 타입
export interface UserProfile {
  id: number
  email: string
  nickname: string
  phone?: string
  gender?: "male" | "female" | "other"
  birthday?: Date
  profileImage?: string
  role: "user" | "admin"
  createdAt: Date
  updatedAt: Date
}

// 레벨 시스템 관련 타입
export interface UserLevelInfo {
  userId: number
  level: number
  currentExp: number
  totalExp: number
  seasonExp: number
  createdAt: Date
  updatedAt: Date
}

export interface ExpHistoryEntry {
  userId: number
  actionType: string
  expGained: number
  source: string
  metadata?: Record<string, unknown>
  createdAt: Date
}

export interface UserRewardInfo {
  userId: number
  rewardType: "badge" | "achievement" | "item"
  rewardId: string
  claimedAt?: Date
  expiresAt?: Date
  metadata?: Record<string, unknown>
}

export interface UserStreakInfo {
  userId: number
  streakType: string
  currentCount: number
  lastActivity: Date
  createdAt: Date
  updatedAt: Date
}

// 게시글 관련 타입
export interface PostData {
  id: number
  title: string
  content: string
  authorId: number
  author?: UserProfile
  likes: number
  comments: number
  createdAt: Date
  updatedAt: Date
}

export interface CommentData {
  id: number
  content: string
  authorId: number
  postId: number
  author?: UserProfile
  createdAt: Date
  updatedAt: Date
}

// 헬스장 관련 타입
export interface GymData {
  id: number
  name: string
  address: string
  phone?: string
  latitude: number
  longitude: number
  operatingHours?: string
  facilities?: string[]
  createdAt: Date
  updatedAt: Date
}

// 머신 관련 타입
export interface MachineData {
  id: number
  name: string
  category: string
  difficulty: "beginner" | "intermediate" | "advanced"
  description: string
  instructions: string
  imageUrl?: string
  videoUrl?: string
  createdAt: Date
  updatedAt: Date
}

// 검색 및 필터 관련 타입
export interface SearchParams {
  query?: string
  category?: string
  difficulty?: string
  location?: {
    latitude: number
    longitude: number
    radius?: number
  }
}

export interface FilterOptions {
  category?: string[]
  difficulty?: string[]
  priceRange?: {
    min: number
    max: number
  }
  facilities?: string[]
}

// API 요청/응답 타입
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
  gender?: "male" | "female" | "other"
  birthday?: Date
  recaptchaToken: string
}

export interface LoginResponse {
  success: true
  message: string
  accessToken: string
  user: UserProfile
}

export interface RegisterResponse {
  success: true
  message: string
  accessToken: string
  user: UserProfile
}

// 통계 관련 타입
export interface PlatformStats {
  activeUsers: number
  totalGyms: number
  totalPosts: number
  achievements: number
}

export interface DetailedStats {
  monthlyUsers: Array<{
    month: string
    count: number
  }>
  gymDistribution: Array<{
    district: string
    count: number
  }>
  levelDistribution: Array<{
    level: number
    count: number
  }>
}

// 크롤링 관련 타입
export interface CrawlerResult {
  success: boolean
  data?: unknown
  error?: string
  count?: number
}

export interface GymCrawlerData {
  name: string
  address: string
  phone?: string
  latitude?: number
  longitude?: number
  operatingHours?: string
  facilities?: string[]
}

// 미들웨어 관련 타입
export interface AuthenticatedRequest extends Request {
  user?: {
    userId: number
    email: string
    role: string
  }
}

// 유틸리티 타입
export type Nullable<T> = T | null
export type Optional<T> = T | undefined
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}
