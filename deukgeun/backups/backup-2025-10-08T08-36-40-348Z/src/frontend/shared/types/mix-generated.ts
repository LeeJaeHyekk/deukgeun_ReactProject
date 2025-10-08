// ============================================================================
// Mix.json 기반 자동 생성 Frontend 타입들
// ============================================================================

// User 관련 타입
export interface UserType {
  id: number
  email: string
  nickname: string
  phone?: string
  gender?: unknown
  birthday?: Date
  profileImage?: string
  role: unknown
  isActive: boolean
  isEmailVerified: boolean
  isPhoneVerified: boolean
  name?: string
  username?: string
  lastLoginAt?: Date
  lastActivityAt?: Date
  createdAt: Date
  updatedAt: Date
}

// Machine 관련 타입
export interface MachineType {
  id: number
  machineKey: string
  name: string
  nameKo?: string
  nameEn?: string
  imageUrl: string
  shortDesc: string
  detailDesc: string
  positiveEffect?: string
  category: unknown
  targetMuscles?: string[]
  difficulty: unknown
  videoUrl?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

// WorkoutSession 관련 타입
export interface WorkoutSessionType {
  id: number
  userId: number
  planId?: number
  gymId?: number
  name: string
  startTime: Date
  endTime?: Date
  totalDurationMinutes?: number
  moodRating?: number
  energyLevel?: number
  notes?: string
  status: unknown
  createdAt: Date
  updatedAt: Date
}

// ExerciseSet 관련 타입
export interface ExerciseSetType {
  id: number
  sessionId: number
  machineId: number
  setNumber: number
  repsCompleted: number
  weightKg?: number
  durationSeconds?: number
  distanceMeters?: number
  rpeRating?: number
  notes?: string
  createdAt: Date
}

// Gym 관련 타입
export interface GymType {
  id: number
  name: string
  address: string
  phone?: string
  latitude?: number
  longitude?: number
  facilities?: string
  openHour?: string
  is24Hours: boolean
  hasGX: boolean
  hasPT: boolean
  hasGroupPT: boolean
  hasParking: boolean
  hasShower: boolean
  createdAt: Date
  updatedAt: Date
}

// Post 관련 타입
export interface PostType {
  id: number
  title: string
  content: string
  author: string
  userId: number
  category: unknown
  tags?: string[]
  thumbnailUrl?: string
  images?: string[]
  likeCount: number
  commentCount: number
  createdAt: Date
  updatedAt: Date
}

// Comment 관련 타입
export interface CommentType {
  id: number
  postId: number
  userId: number
  author: string
  content: string
  createdAt: Date
  updatedAt: Date
}

// UserLevel 관련 타입
export interface UserLevelType {
  id: number
  userId: number
  level: number
  currentExp: number
  totalExp: number
  seasonExp: number
  totalLevelUps: number
  lastLevelUpAt?: Date
  currentSeason: number
  seasonStartDate?: Date
  seasonEndDate?: Date
  createdAt: Date
  updatedAt: Date
}

// Like 관련 타입
export interface LikeType {
  id: number
  postId: number
  userId: number
  createdAt: Date
}

// ExpHistory 관련 타입
export interface ExpHistoryType {
  id: number
  userId: number
  actionType: unknown
  expGained: number
  source: string
  metadata?: Record<string, unknown>
  levelBefore?: number
  levelAfter?: number
  isLevelUp: boolean
  createdAt: Date
}

// API 응답 타입들
export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}
