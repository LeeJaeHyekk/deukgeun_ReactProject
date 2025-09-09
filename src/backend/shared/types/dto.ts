// ============================================================================
// Backend DTO 타입들
// ============================================================================

// ============================================================================
// User DTO Types
// ============================================================================

export interface UserDTO {
  id: number
  email: string
  nickname: string
  phone?: string
  phoneNumber?: string
  gender?: "male" | "female" | "other"
  birthDate?: Date | string | null
  profileImage?: string
  role: "user" | "admin" | "moderator"
  isActive: boolean
  isEmailVerified: boolean
  isPhoneVerified: boolean
  name?: string
  username?: string
  lastLoginAt?: Date
  lastActivityAt?: Date
  createdAt: Date
  updatedAt: Date
  accessToken?: string
}

export interface CreateUserDTO {
  id: number
  email: string
  nickname: string
  phone?: string
  phoneNumber?: string
  gender?: "male" | "female" | "other"
  birthDate?: Date
  profileImage?: string
  role: "user" | "admin" | "moderator"
  isActive: boolean
  isEmailVerified: boolean
  isPhoneVerified: boolean
  name?: string
  username?: string
}

export interface UpdateUserDTO {
  id?: number
  email?: string
  nickname?: string
  phone?: string
  phoneNumber?: string
  gender?: "male" | "female" | "other"
  birthDate?: Date
  profileImage?: string
  role?: "user" | "admin" | "moderator"
  isActive?: boolean
  isEmailVerified?: boolean
  isPhoneVerified?: boolean
  name?: string
  username?: string
}

export interface UserDTOResponse {
  success: boolean
  data?: UserDTO
  message?: string
  error?: string
}

export interface UserDTOListResponse {
  success: boolean
  data?: UserDTO[]
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  message?: string
  error?: string
}

// ============================================================================
// UserLevel DTO Types
// ============================================================================

export interface UserLevelDTO {
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

export interface CreateUserLevelDTO {
  id: number
  userId: number
  level: number
  currentExp: number
  totalExp: number
  seasonExp: number
  totalLevelUps: number
  currentSeason: number
  seasonStartDate?: Date
  seasonEndDate?: Date
}

export interface UpdateUserLevelDTO {
  id?: number
  userId?: number
  level?: number
  currentExp?: number
  totalExp?: number
  seasonExp?: number
  totalLevelUps?: number
  currentSeason?: number
  seasonStartDate?: Date
  seasonEndDate?: Date
}

export interface UserLevelDTOResponse {
  success: boolean
  data?: UserLevelDTO
  message?: string
  error?: string
}

export interface UserLevelDTOListResponse {
  success: boolean
  data?: UserLevelDTO[]
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  message?: string
  error?: string
}

// ============================================================================
// Machine DTO Types
// ============================================================================

export type MachineCategory =
  | "chest"
  | "back"
  | "shoulders"
  | "arms"
  | "legs"
  | "core"
  | "cardio"
  | "fullbody"

export type DifficultyLevel =
  | "beginner"
  | "intermediate"
  | "advanced"
  | "expert"

export interface MachineCategoryDTO {
  id: string
  name: string
  description?: string
  icon?: string
}

export interface DifficultyLevelDTO {
  id: string
  name: string
  description?: string
  level: number
}

export interface MachineFilterQuery {
  category?: MachineCategory
  difficulty?: DifficultyLevel
  target?: string
  search?: string
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: "asc" | "desc"
}

export interface MachineDTO {
  id: number
  machineKey: string
  name: string
  nameKo?: string
  nameEn?: string
  imageUrl: string
  shortDesc: string
  detailDesc: string
  description?: string
  instructions?: string
  positiveEffect?: string
  category: MachineCategory | MachineCategoryDTO
  targetMuscles?: string[]
  difficulty: DifficultyLevel | DifficultyLevelDTO
  videoUrl?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface CreateMachineDTO {
  id: number
  machineKey: string
  name: string
  nameKo?: string
  nameEn?: string
  imageUrl: string
  shortDesc: string
  detailDesc: string
  description?: string
  instructions?: string
  positiveEffect?: string
  category: MachineCategory | MachineCategoryDTO
  targetMuscles?: string[]
  difficulty: DifficultyLevel | DifficultyLevelDTO
  videoUrl?: string
  isActive: boolean
}

export interface UpdateMachineDTO {
  id?: number
  machineKey?: string
  name?: string
  nameKo?: string
  nameEn?: string
  imageUrl?: string
  shortDesc?: string
  detailDesc?: string
  description?: string
  instructions?: string
  positiveEffect?: string
  category?: MachineCategory | MachineCategoryDTO
  targetMuscles?: string[]
  difficulty?: DifficultyLevel | DifficultyLevelDTO
  videoUrl?: string
  isActive?: boolean
}

export interface MachineDTOResponse {
  success: boolean
  data?: MachineDTO
  message?: string
  error?: string
}

export interface MachineDTOListResponse {
  success: boolean
  data?: MachineDTO[]
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  message?: string
  error?: string
}

// ============================================================================
// Post DTO Types
// ============================================================================

export type PostCategory =
  | "general"
  | "workout"
  | "nutrition"
  | "motivation"
  | "tips"
  | "questions"
  | "achievements"
  | "challenges"

export interface PostDTO {
  id: number
  title: string
  content: string
  author: string
  userId: number
  category: PostCategory
  tags?: string[]
  thumbnail_url?: string
  images?: string[]
  like_count: number
  comment_count: number
  createdAt: Date
  updatedAt: Date
}

export interface CreatePostDTO {
  title: string
  content: string
  author: string
  userId: number
  category: PostCategory
  tags?: string[]
  thumbnail_url?: string
  images?: string[]
}

export interface UpdatePostDTO {
  id?: number
  title?: string
  content?: string
  category?: PostCategory
  tags?: string[]
  thumbnail_url?: string
  images?: string[]
}

export interface PostDTOResponse {
  success: boolean
  data?: PostDTO
  message?: string
  error?: string
}

export interface PostDTOListResponse {
  success: boolean
  data?: PostDTO[]
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  message?: string
  error?: string
}

// ============================================================================
// Comment DTO Types
// ============================================================================

export interface CommentDTO {
  id: number
  postId: number
  userId: number
  author: string
  content: string
  parentId?: number
  like_count: number
  createdAt: Date
  updatedAt: Date
}

export interface CreateCommentDTO {
  postId: number
  userId: number
  author: string
  content: string
  parentId?: number
}

export interface UpdateCommentDTO {
  id?: number
  content?: string
}

export interface CommentDTOResponse {
  success: boolean
  data?: CommentDTO
  message?: string
  error?: string
}

export interface CommentDTOListResponse {
  success: boolean
  data?: CommentDTO[]
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  message?: string
  error?: string
}

// ============================================================================
// Like DTO Types
// ============================================================================

export interface LikeDTO {
  id: number
  userId: number
  postId?: number
  commentId?: number
  createdAt: Date
}

export interface CreateLikeDTO {
  userId: number
  postId?: number
  commentId?: number
}

export interface UpdateLikeDTO {
  id?: number
}

export interface LikeDTOResponse {
  success: boolean
  data?: LikeDTO
  message?: string
  error?: string
}

export interface LikeDTOListResponse {
  success: boolean
  data?: LikeDTO[]
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  message?: string
  error?: string
}

// ============================================================================
// Gym DTO Types
// ============================================================================

export interface GymDTO {
  id: number
  name: string
  address: string
  phone?: string
  website?: string
  operatingHours?: string
  facilities?: string[]
  latitude?: number
  longitude?: number
  rating?: number
  priceRange?: string
  createdAt: Date
  updatedAt: Date
}

export interface CreateGymDTO {
  name: string
  address: string
  phone?: string
  website?: string
  operatingHours?: string
  facilities?: string[]
  latitude?: number
  longitude?: number
  rating?: number
  priceRange?: string
}

export interface UpdateGymDTO {
  id?: number
  name?: string
  address?: string
  phone?: string
  website?: string
  operatingHours?: string
  facilities?: string[]
  latitude?: number
  longitude?: number
  rating?: number
  priceRange?: string
}

export interface GymDTOResponse {
  success: boolean
  data?: GymDTO
  message?: string
  error?: string
}

export interface GymDTOListResponse {
  success: boolean
  data?: GymDTO[]
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  message?: string
  error?: string
}

// ============================================================================
// Common Types
// ============================================================================

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export interface PaginationParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: "asc" | "desc"
}

export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  message?: string
  error?: string
}
