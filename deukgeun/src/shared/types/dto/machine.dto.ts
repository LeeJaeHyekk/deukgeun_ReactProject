// ============================================================================
// MachineDTO - Data Transfer Object
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
