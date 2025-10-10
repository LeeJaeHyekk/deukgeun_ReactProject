// ============================================================================
// DTO (Data Transfer Object) 타입 정의
// 백엔드와 프론트엔드 간 데이터 전송을 위한 타입들
// ============================================================================

// 기본 DTO 인터페이스
export interface BaseDTO {
  id: number
  createdAt: Date
  updatedAt: Date
}

// API 응답 DTO
export interface DTOResponse<T = unknown> {
  success: boolean
  message: string
  data?: T
  error?: string
  statusCode?: number
}

// 페이지네이션 DTO
export interface DTOPaginationParams {
  page?: number
  limit?: number
  offset?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface DTOPaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// ============================================================================
// User DTOs
// ============================================================================

export interface UserDTO extends BaseDTO {
  email: string
  nickname: string
  phone?: string
  phoneNumber?: string
  gender?: 'male' | 'female' | 'other'
  birthDate?: Date | string | null
  profileImage?: string
  role: 'user' | 'admin' | 'moderator'
  isActive: boolean
  isEmailVerified: boolean
  isPhoneVerified: boolean
  name?: string
  username?: string
  lastLoginAt?: Date | string
  lastActivityAt?: Date | string
  accessToken?: string
}

export interface CreateUserDTO {
  email: string
  password: string
  nickname: string
  phone?: string
  gender?: 'male' | 'female' | 'other'
  birthDate?: Date | string
  name?: string
  username?: string
}

export interface UpdateUserDTO {
  nickname?: string
  phone?: string
  gender?: 'male' | 'female' | 'other'
  birthDate?: Date | string
  profileImage?: string
  name?: string
  username?: string
}

export interface UserDTOResponse extends DTOResponse<UserDTO> {}
export interface UserDTOListResponse extends DTOResponse<UserDTO[]> {}

// 인증 관련 DTOs
export interface LoginRequest {
  email: string
  password: string
  recaptchaToken?: string
}

export interface RegisterRequest {
  email: string
  password: string
  nickname: string
  phone?: string
  gender?: 'male' | 'female' | 'other'
  birthDate?: Date | string
  birthday?: Date | string // 호환성을 위한 별칭
  name?: string
  username?: string
  recaptchaToken?: string
}

export interface LoginResponse {
  user: UserDTO
  accessToken: string
  refreshToken: string
}

export interface RegisterResponse {
  user: UserDTO
  accessToken: string
  refreshToken: string
}

export interface PasswordResetRequest {
  email: string
}

export interface PasswordResetConfirm {
  token: string
  newPassword: string
}

export interface EmailVerification {
  token: string
}

export interface AccountRecoveryRequest {
  email: string
}

export interface RefreshResponse {
  accessToken: string
  refreshToken: string
}

export interface LogoutResponse {
  message: string
}

export interface AuthenticatedRequest {
  user: UserDTO
}

// ============================================================================
// Machine DTOs
// ============================================================================

export type MachineCategory = 
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'arms'
  | 'legs'
  | 'core'
  | 'cardio'
  | 'fullbody'

export type DifficultyLevel = 
  | 'beginner'
  | 'intermediate'
  | 'advanced'
  | 'expert'

export interface MachineDTO extends BaseDTO {
  name: string
  nameKo?: string // 한국어 이름
  nameEn?: string // 영어 이름
  imageUrl?: string
  category: MachineCategory | MachineCategoryDTO
  description?: string
  shortDesc?: string // 짧은 설명
  detailDesc?: string // 상세 설명
  difficulty?: DifficultyLevel | DifficultyLevelDTO // 난이도
  difficultyLevel?: DifficultyLevelDTO
  categoryInfo?: MachineCategoryDTO
  targetMuscles?: string[] // 타겟 근육
  positiveEffect?: string // 긍정적 효과
  instructions?: string[] // 사용법
  videoUrl?: string // 비디오 URL
  machineKey?: string // 기계 키
  isActive?: boolean // 활성 상태
}

export interface MachineCategoryDTO {
  id: string
  name: string
  description?: string
  icon?: string
}

export interface DifficultyLevelDTO {
  id: string
  name: string
  level: number
  description?: string
  color?: string
}

export interface CreateMachineDTO {
  name: string
  imageUrl?: string
  category: MachineCategory | MachineCategoryDTO
  description?: string
  difficultyLevelId?: number
  categoryId?: number
}

export interface UpdateMachineDTO {
  name?: string
  imageUrl?: string
  category?: MachineCategory | MachineCategoryDTO
  description?: string
  difficultyLevelId?: number
  categoryId?: number
}

export interface MachineFilterQuery {
  category?: MachineCategory
  difficulty?: DifficultyLevel
  target?: string
  search?: string
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface MachineDTOResponse extends DTOResponse<MachineDTO> {}
export interface MachineDTOListResponse extends DTOResponse<MachineDTO[]> {}

// Machine 타입 별칭 (호환성)
export type Machine = MachineDTO
export type CreateMachineRequest = CreateMachineDTO
export type UpdateMachineRequest = UpdateMachineDTO
export type MachineListResponse = MachineDTOListResponse
export type MachineResponse = MachineDTOResponse

// ============================================================================
// WorkoutPlan DTOs
// ============================================================================

// 새로운 타입 구조 import (먼저 import)
export * from "./workoutPlanExercise.types"
export * from "@/shared/utils/transform/workoutPlanExercise"

// WorkoutPlanExercise 타입을 import
import type { WorkoutPlanExercise } from "./workoutPlanExercise.types"

export interface WorkoutPlanDTO extends BaseDTO {
  userId: number
  name: string
  description?: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimatedDurationMinutes: number
  targetMuscleGroups?: string[]
  isTemplate: boolean
  isPublic: boolean
  exercises: WorkoutPlanExercise[] // 새로운 도메인 타입 사용
  status: 'active' | 'archived' | 'draft'
  goals?: WorkoutGoalDTO[]
  sessions?: WorkoutSessionDTO[]
  // 추가 속성들 (호환성)
  isActive?: boolean
  duration?: number
  estimated_duration_minutes?: number
}

// 레거시 호환성을 위한 별칭 (점진적 마이그레이션용)
export type WorkoutPlanExerciseDTO = WorkoutPlanExercise

export interface CreateWorkoutPlanDTO {
  name: string
  description?: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimatedDurationMinutes: number
  targetMuscleGroups?: string[]
  isTemplate?: boolean
  isPublic?: boolean
  exercises: Array<{
    machineId?: number
    exerciseId: number
    exerciseName: string
    exerciseOrder: number
    sets: number
    repsRange: { min: number; max: number }
    weightRange?: { min: number; max: number }
    restSeconds: number
    notes?: string
  }>
}

export interface UpdateWorkoutPlanDTO {
  name?: string
  description?: string
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
  estimatedDurationMinutes?: number
  targetMuscleGroups?: string[]
  isTemplate?: boolean
  isPublic?: boolean
  status?: 'active' | 'archived' | 'draft'
  exercises?: Array<{
    id?: number
    machineId?: number
    exerciseId?: number
    exerciseName?: string
    exerciseOrder?: number
    sets?: number
    repsRange?: { min: number; max: number }
    weightRange?: { min: number; max: number }
    restSeconds?: number
    notes?: string
  }>
}

export interface WorkoutPlanDTOResponse extends DTOResponse<WorkoutPlanDTO> {}
export interface WorkoutPlanDTOListResponse extends DTOResponse<WorkoutPlanDTO[]> {}

// ============================================================================
// WorkoutSession DTOs
// ============================================================================

export interface WorkoutSessionDTO extends BaseDTO {
  userId: number
  planId?: number
  gymId?: number
  name: string
  startTime: Date | string
  endTime?: Date | string
  totalDurationMinutes?: number
  moodRating?: number
  energyLevel?: number
  notes?: string
  status: 'in_progress' | 'completed' | 'paused' | 'cancelled'
  exerciseSets: ExerciseSetDTO[]
  plan?: WorkoutPlanDTO
  // 추가 속성들 (호환성)
  description?: string
  isCompleted?: boolean
  duration?: number
}

export interface CreateWorkoutSessionDTO {
  planId?: number
  gymId?: number
  name: string
  startTime: Date | string
  notes?: string
}

export interface UpdateWorkoutSessionDTO {
  name?: string
  endTime?: Date | string
  totalDurationMinutes?: number
  moodRating?: number
  energyLevel?: number
  notes?: string
  status?: 'in_progress' | 'completed' | 'paused' | 'cancelled'
}

export interface WorkoutSessionDTOResponse extends DTOResponse<WorkoutSessionDTO> {}
export interface WorkoutSessionDTOListResponse extends DTOResponse<WorkoutSessionDTO[]> {}

// ============================================================================
// WorkoutGoal DTOs
// ============================================================================

export interface WorkoutGoalDTO extends BaseDTO {
  userId: number
  title: string
  description?: string
  type: 'weight' | 'reps' | 'duration' | 'frequency' | 'streak'
  targetValue: number
  currentValue: number
  unit: string
  deadline?: Date | string
  isCompleted: boolean
  completedAt?: Date | string
  planId?: number
  exerciseId?: number
}

export interface CreateWorkoutGoalDTO {
  title: string
  description?: string
  type: 'weight' | 'reps' | 'duration' | 'frequency' | 'streak'
  targetValue: number
  currentValue?: number
  unit: string
  deadline?: Date | string
  planId?: number
  exerciseId?: number
}

export interface UpdateWorkoutGoalDTO {
  title?: string
  description?: string
  type?: 'weight' | 'reps' | 'duration' | 'frequency' | 'streak'
  targetValue?: number
  currentValue?: number
  unit?: string
  deadline?: Date | string
  isCompleted?: boolean
  completedAt?: Date | string
  planId?: number
  exerciseId?: number
}

export interface WorkoutGoalDTOResponse extends DTOResponse<WorkoutGoalDTO> {}
export interface WorkoutGoalDTOListResponse extends DTOResponse<WorkoutGoalDTO[]> {}

// ============================================================================
// ExerciseSet DTOs
// ============================================================================

export interface ExerciseSetDTO extends BaseDTO {
  sessionId: number
  machineId: number
  exerciseName: string
  setNumber: number
  repsCompleted: number
  weightKg?: number
  durationSeconds?: number
  distanceMeters?: number
  rpeRating?: number
  notes?: string
  isPersonalBest: boolean
  isCompleted: boolean
}

export interface CreateExerciseSetDTO {
  sessionId: number
  machineId: number
  exerciseName: string
  setNumber: number
  repsCompleted: number
  weightKg?: number
  durationSeconds?: number
  distanceMeters?: number
  rpeRating?: number
  notes?: string
  isPersonalBest?: boolean
  isCompleted?: boolean
}

export interface UpdateExerciseSetDTO {
  exerciseName?: string
  setNumber?: number
  repsCompleted?: number
  weightKg?: number
  durationSeconds?: number
  distanceMeters?: number
  rpeRating?: number
  notes?: string
  isPersonalBest?: boolean
  isCompleted?: boolean
}

export interface ExerciseSetDTOResponse extends DTOResponse<ExerciseSetDTO> {}
export interface ExerciseSetDTOListResponse extends DTOResponse<ExerciseSetDTO[]> {}

// ============================================================================
// UserLevel DTOs
// ============================================================================

export interface UserLevelDTO extends BaseDTO {
  userId: number
  level: number
  currentExp: number
  totalExp: number
  seasonExp: number
  expToNextLevel: number
  progressPercentage: number
  lastLevelUpAt?: Date | string
  // 추가 속성들 (호환성)
  totalLevelUps?: number
  currentSeason?: number
}

// UserLevel 타입 별칭 (호환성)
export type UserLevel = UserLevelDTO

// ============================================================================
// UserStreak DTOs
// ============================================================================

export interface UserStreakDTO extends BaseDTO {
  userId: number
  currentStreak: number
  longestStreak: number
  lastWorkoutDate?: Date | string
  streakStartDate?: Date | string
}

// ============================================================================
// WorkoutReminder DTOs
// ============================================================================

export interface WorkoutReminderDTO extends BaseDTO {
  userId: number
  title: string
  message: string
  description?: string // 설명
  reminderTime: Date | string
  time?: Date | string // 호환성을 위한 별칭
  isActive: boolean
  isRead: boolean
  type: 'workout' | 'goal' | 'streak' | 'achievement'
  relatedId?: number
  relatedType?: 'plan' | 'session' | 'goal'
  days?: string[] // 요일
}

// ============================================================================
// Gym DTOs
// ============================================================================

export interface GymDTO extends BaseDTO {
  name: string
  address: string
  latitude: number
  longitude: number
  description?: string
  phone?: string
  website?: string
  operatingHours?: string
  facilities?: string[]
  images?: string[]
  is24Hours?: boolean
  hasGX?: boolean
  hasPT?: boolean
  hasGroupPT?: boolean
  hasParking?: boolean
  hasShower?: boolean
}

export interface CreateGymDTO {
  name: string
  address: string
  latitude: number
  longitude: number
  description?: string
  phone?: string
  website?: string
  operatingHours?: string
  facilities?: string[]
  images?: string[]
}

export interface UpdateGymDTO {
  name?: string
  address?: string
  latitude?: number
  longitude?: number
  description?: string
  phone?: string
  website?: string
  operatingHours?: string
  facilities?: string[]
  images?: string[]
}

export interface GymDTOResponse extends DTOResponse<GymDTO> {}
export interface GymDTOListResponse extends DTOResponse<GymDTO[]> {}

// ============================================================================
// Community DTOs
// ============================================================================

export interface PostDTO extends BaseDTO {
  userId: number
  title: string
  content: string
  category: string
  categoryInfo?: PostCategoryInfo
  tags?: string[]
  images?: string[]
  likesCount: number
  commentsCount: number
  viewsCount: number
  isLiked?: boolean
  isBookmarked?: boolean
  author: {
    id: number
    nickname: string
    profileImage?: string
    avatarUrl?: string // 호환성을 위한 별칭
  }
  comments?: CommentDTO[]
  // 추가 속성들 (호환성)
  viewCount?: number
  thumbnailUrl?: string
  likeCount?: number
  commentCount?: number
}

export interface PostCategoryInfo {
  id: string
  name: string
  description?: string
  color?: string
  icon?: string
  count?: number // 포스트 개수
}

export interface CommentDTO extends BaseDTO {
  postId: number
  userId: number
  content: string
  parentId?: number
  likesCount: number
  isLiked?: boolean
  author: {
    id: number
    nickname: string
    profileImage?: string
    avatarUrl?: string // 호환성을 위한 별칭
  }
  replies?: CommentDTO[]
}

export interface CreatePostDTO {
  title: string
  content: string
  category: string
  tags?: string[]
  images?: string[]
}

export interface UpdatePostDTO {
  title?: string
  content?: string
  category?: string
  tags?: string[]
  images?: string[]
}

export interface CreateCommentDTO {
  postId: number
  content: string
  parentId?: number
}

export interface UpdateCommentDTO {
  content: string
}

export interface PostDTOResponse extends DTOResponse<PostDTO> {}
export interface PostDTOListResponse extends DTOResponse<PostDTO[]> {}
export interface CommentDTOResponse extends DTOResponse<CommentDTO> {}
export interface CommentDTOListResponse extends DTOResponse<CommentDTO[]> {}

// Community 타입 별칭 (호환성)
export type Post = PostDTO
export type Comment = CommentDTO
export type PostCategory = PostCategoryInfo

// ============================================================================
// 타입 가드 함수들
// ============================================================================

export function isUserDTO(obj: unknown): obj is UserDTO {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'email' in obj &&
    'nickname' in obj &&
    'role' in obj
  )
}

export function isWorkoutPlanDTO(obj: unknown): obj is WorkoutPlanDTO {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'userId' in obj &&
    'name' in obj &&
    'difficulty' in obj &&
    'exercises' in obj
  )
}

// 새로운 타입 가드 추가
export function isWorkoutPlanExerciseDTO(obj: unknown): obj is WorkoutPlanExercise {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'planId' in obj &&
    'exerciseId' in obj &&
    'exerciseOrder' in obj &&
    'sets' in obj &&
    'repsRange' in obj &&
    'restSeconds' in obj
  )
}

export function isWorkoutSessionDTO(obj: unknown): obj is WorkoutSessionDTO {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'userId' in obj &&
    'name' in obj &&
    'startTime' in obj &&
    'status' in obj
  )
}

export function isWorkoutGoalDTO(obj: unknown): obj is WorkoutGoalDTO {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'userId' in obj &&
    'title' in obj &&
    'type' in obj &&
    'targetValue' in obj
  )
}

export function isMachineDTO(obj: unknown): obj is MachineDTO {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'name' in obj &&
    'category' in obj
  )
}

// ============================================================================
// 유틸리티 타입들
// ============================================================================

export type DTOWithTimestamps<T> = T & {
  createdAt: Date | string
  updatedAt: Date | string
}

export type CreateDTO<T> = Omit<T, 'id' | 'createdAt' | 'updatedAt'>
export type UpdateDTO<T> = Partial<CreateDTO<T>> & { id: number }

export type DTOListResponse<T> = DTOResponse<T[]>
export type DTOSingleResponse<T> = DTOResponse<T>

// ============================================================================
// WorkoutPlanExercise DTOs
// ============================================================================

export type {
  CreateWorkoutPlanExerciseDTO,
  UpdateWorkoutPlanExerciseDTO,
  WorkoutPlanExerciseForm,
  WorkoutPlanExerciseDTOResponse,
  WorkoutPlanExerciseDTOListResponse,
  WorkoutPlanExercise,
  CreateWorkoutPlanExercise,
  UpdateWorkoutPlanExercise
} from "./workoutPlanExercise.types"