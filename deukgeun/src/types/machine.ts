// ============================================================================
// 기계 관련 타입
// ============================================================================

// 운동 기계
export interface Machine {
  id: number
  name: string
  category: MachineCategory
  description?: string
  instructions?: string
  targetMuscles: string[]
  difficulty: DifficultyLevel
  imageUrl?: string
  videoUrl?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

// 기계 카테고리
export type MachineCategory =
  | "cardio"
  | "strength"
  | "flexibility"
  | "balance"
  | "functional"
  | "rehabilitation"
  | "상체"
  | "하체"
  | "전신"
  | "기타"

// 난이도 레벨
export type DifficultyLevel =
  | "beginner"
  | "intermediate"
  | "advanced"
  | "expert"
  | "초급"
  | "중급"
  | "고급"

// 기계 검색 필터
export interface MachineSearchFilter {
  category?: MachineCategory[]
  difficulty?: DifficultyLevel[]
  targetMuscles?: string[]
  isActive?: boolean
}

// 기계 정렬 옵션
export type MachineSortOption =
  | "name"
  | "category"
  | "difficulty"
  | "created_at"
  | "popularity"

// 기계 검색 요청
export interface SearchMachinesRequest {
  query?: string
  filter?: MachineSearchFilter
  sortBy?: MachineSortOption
  page?: number
  limit?: number
}

// 기계 상세 조회 요청
export interface GetMachineRequest {
  machineId: number
}

// 기계 응답 타입
export interface MachineListResponse {
  success: boolean
  message: string
  data?: {
    machines: Machine[]
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
  }
  error?: string
}

// 기계 카테고리 응답 타입
export interface MachineCategoriesResponse {
  success: boolean
  message: string
  data?: {
    categories: Array<{
      category: MachineCategory
      name: string
      description: string
      count: number
    }>
  }
  error?: string
}

// 기계 사용 통계
export interface MachineUsageStats {
  machineId: number
  totalUsage: number
  averageRating: number
  totalReviews: number
  popularity: number
  lastUsed?: Date
  usageByDifficulty: Record<DifficultyLevel, number>
  usageByUserLevel: Record<string, number>
}

// 기계 리뷰
export interface MachineReview {
  id: number
  machineId: number
  userId: number
  rating: number
  title: string
  content: string
  difficulty: DifficultyLevel
  helpfulCount: number
  createdAt: Date
  updatedAt: Date
}

// 기계 리뷰 생성 요청
export interface CreateMachineReviewRequest {
  machineId: number
  userId: number
  rating: number
  title: string
  content: string
  difficulty: DifficultyLevel
}

// 기계 리뷰 업데이트 요청
export interface UpdateMachineReviewRequest {
  reviewId: number
  rating?: number
  title?: string
  content?: string
  difficulty?: DifficultyLevel
}

// 기계 리뷰 응답 타입
export interface MachineReviewResponse {
  success: boolean
  message: string
  data?: MachineReview
  error?: string
}

export interface MachineReviewsResponse {
  success: boolean
  message: string
  data?: {
    reviews: MachineReview[]
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
  }
  error?: string
}

// 기계 즐겨찾기
export interface MachineFavorite {
  id: number
  userId: number
  machineId: number
  createdAt: Date
}

// 기계 즐겨찾기 요청
export interface ToggleMachineFavoriteRequest {
  userId: number
  machineId: number
}

// 기계 즐겨찾기 응답 타입
export interface MachineFavoriteResponse {
  success: boolean
  message: string
  data?: {
    isFavorited: boolean
    favoriteCount: number
  }
  error?: string
}

// 기계 사용 기록
export interface MachineUsage {
  id: number
  userId: number
  machineId: number
  sessionId: number
  sets: number
  reps: number
  weight: number
  duration?: number // 초 단위
  notes?: string
  rating?: number
  createdAt: Date
}

// 기계 사용 통계 요청
export interface GetMachineStatsRequest {
  machineId: number
  period?: "day" | "week" | "month" | "year"
  startDate?: Date
  endDate?: Date
}

// 기계 사용 통계 응답
export interface MachineStatsResponse {
  success: boolean
  message: string
  data?: {
    machine: Machine
    stats: MachineUsageStats
    recentUsage: MachineUsage[]
    topUsers: Array<{
      userId: number
      usageCount: number
      averageRating: number
    }>
  }
  error?: string
}

// 기계 추천
export interface MachineRecommendation {
  machineId: number
  machine: Machine
  score: number
  reason: string
  category: "popular" | "similar" | "trending" | "personalized"
}

// 기계 추천 요청
export interface GetMachineRecommendationsRequest {
  userId: number
  limit?: number
  category?: MachineCategory[]
  difficulty?: DifficultyLevel[]
}

// 기계 추천 응답
export interface MachineRecommendationsResponse {
  success: boolean
  message: string
  data?: {
    recommendations: MachineRecommendation[]
    userPreferences: {
      favoriteCategories: MachineCategory[]
      preferredDifficulty: DifficultyLevel
      targetMuscles: string[]
    }
  }
  error?: string
}

// 기계 비교
export interface MachineComparison {
  machines: Machine[]
  comparison: {
    category: boolean
    difficulty: boolean
    targetMuscles: boolean
    popularity: boolean
    averageRating: boolean
  }
}

// 기계 비교 요청
export interface CompareMachinesRequest {
  machineIds: number[]
}

// 기계 비교 응답
export interface MachineComparisonResponse {
  success: boolean
  message: string
  data?: MachineComparison
  error?: string
}

// 기계 알림
export interface MachineNotification {
  id: number
  machineId: number
  userId: number
  type: "maintenance" | "new_review" | "popularity_change" | "recommendation"
  title: string
  message: string
  isRead: boolean
  createdAt: Date
}

// 기계 메타데이터
export interface MachineMetadata {
  machineId: number
  tags: string[]
  keywords: string[]
  relatedMachines: number[]
  alternativeNames: string[]
  manufacturer?: string
  model?: string
  specifications?: Record<string, unknown>
  safetyNotes?: string[]
  maintenanceSchedule?: string
  warrantyInfo?: string
}

// 기계 이미지
export interface MachineImage {
  id: number
  machineId: number
  url: string
  alt: string
  caption?: string
  isPrimary: boolean
  order: number
  createdAt: Date
}

// 기계 비디오
export interface MachineVideo {
  id: number
  machineId: number
  url: string
  title: string
  description?: string
  duration: number // 초 단위
  thumbnail?: string
  isPrimary: boolean
  createdAt: Date
}

// 기계 운동 프로그램
export interface MachineWorkoutProgram {
  id: number
  machineId: number
  name: string
  description: string
  difficulty: DifficultyLevel
  duration: number // 분 단위
  sets: number
  reps: number
  restTime: number // 초 단위
  progression: string[]
  notes?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

// 기계 운동 프로그램 응답
export interface MachineWorkoutProgramResponse {
  success: boolean
  message: string
  data?: {
    machine: Machine
    programs: MachineWorkoutProgram[]
  }
  error?: string
}

// ============================================================================
// 기존 프론트엔드 타입과의 호환성을 위한 추가 타입
// ============================================================================

// Machine 생성 요청 타입
export interface CreateMachineRequest {
  machine_key: string
  name_ko: string
  name_en?: string
  image_url: string
  short_desc: string
  detail_desc: string
  category: "상체" | "하체" | "전신" | "기타"
  difficulty_level?: "초급" | "중급" | "고급"
  target_muscle?: string[]
  positive_effect?: string
  video_url?: string
}

// Machine 수정 요청 타입
export interface UpdateMachineRequest {
  machine_key?: string
  name_ko?: string
  name_en?: string
  image_url?: string
  short_desc?: string
  detail_desc?: string
  category?: "상체" | "하체" | "전신" | "기타"
  difficulty_level?: "초급" | "중급" | "고급"
  target_muscle?: string[]
  positive_effect?: string
  video_url?: string
}

// Machine 필터링 쿼리 타입
export interface MachineFilterQuery {
  category?: "상체" | "하체" | "전신" | "기타"
  difficulty?: "초급" | "중급" | "고급"
  target?: string
}

// Machine API 응답 타입
export interface MachineResponse {
  message: string
  data: Machine
}

export interface MachineFilterResponse {
  message: string
  data: Machine[]
  count: number
}

// Machine 카테고리 옵션
export const MACHINE_CATEGORIES = [
  { value: "상체", label: "상체" },
  { value: "하체", label: "하체" },
  { value: "전신", label: "전신" },
  { value: "기타", label: "기타" },
] as const

// Machine 난이도 옵션
export const MACHINE_DIFFICULTIES = [
  { value: "초급", label: "초급" },
  { value: "중급", label: "중급" },
  { value: "고급", label: "고급" },
] as const

// 타겟 근육 옵션
export const TARGET_MUSCLES = [
  "삼두근",
  "이두근",
  "대흉근",
  "광배근",
  "승모근",
  "삼각근",
  "대퇴사두근",
  "햄스트링",
  "둔근",
  "비복근",
  "복근",
  "척추기립근",
] as const
