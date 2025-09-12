// ============================================================================
// MachineDTO - Data Transfer Object
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
  sortOrder?: 'asc' | 'desc'
}

// 해부학적 정보
export interface MachineAnatomy {
  primaryMuscles: string[]
  secondaryMuscles: string[]
  antagonistMuscles: string[]
  easyExplanation: string
}

// 운동 가이드
export interface MachineGuide {
  setup: string
  execution: string[]
  movementDirection: string
  idealStimulus: string
  commonMistakes: string[]
  breathing: string
  safetyTips: string[]
}

// 훈련 정보
export interface MachineTraining {
  recommendedReps: string
  recommendedSets: string
  restTime: string
  variations: string[]
  levelUpOptions: string[]
  beginnerTips: string[]
}

// 추가 정보
export interface MachineExtraInfo {
  dailyUseCase: string
  searchKeywords: string[]
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
  // 새로운 JSON 필드들
  anatomy: MachineAnatomy
  guide: MachineGuide
  training: MachineTraining
  extraInfo: MachineExtraInfo
  createdAt: Date
  updatedAt: Date
}

// Alias for compatibility
export type Machine = MachineDTO

// Create DTO (for creating new Machine)
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
  // 새로운 JSON 필드들
  anatomy: MachineAnatomy
  guide: MachineGuide
  training: MachineTraining
  extraInfo: MachineExtraInfo
}

// Update DTO (for updating existing Machine)
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
  // 새로운 JSON 필드들
  anatomy?: Partial<MachineAnatomy>
  guide?: Partial<MachineGuide>
  training?: Partial<MachineTraining>
  extraInfo?: Partial<MachineExtraInfo>
}

// Response DTO (for API responses)
export interface MachineDTOResponse {
  success: boolean
  data?: MachineDTO
  message?: string
  error?: string
}

// List Response DTO
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
