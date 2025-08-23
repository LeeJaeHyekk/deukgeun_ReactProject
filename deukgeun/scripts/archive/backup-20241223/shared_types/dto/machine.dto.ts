// ============================================================================
// MachineDTO - Data Transfer Object
// ============================================================================

// Machine 카테고리 타입
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

// 난이도 레벨 타입
export type DifficultyLevel =
  | "beginner"
  | "intermediate"
  | "advanced"
  | "expert"
  | "초급"
  | "중급"
  | "고급"

export interface MachineDTO {
  id: number
  machineKey: string
  name: string
  nameKo?: string
  nameEn?: string
  imageUrl: string
  shortDesc: string
  detailDesc: string
  positiveEffect?: string
  category: MachineCategory
  targetMuscles?: string[]
  difficulty: DifficultyLevel
  videoUrl?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

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
  positiveEffect?: string
  category: MachineCategory
  targetMuscles?: string[]
  difficulty: DifficultyLevel
  videoUrl?: string
  isActive: boolean
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
  positiveEffect?: string
  category?: MachineCategory
  targetMuscles?: string[]
  difficulty?: DifficultyLevel
  videoUrl?: string
  isActive?: boolean
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
