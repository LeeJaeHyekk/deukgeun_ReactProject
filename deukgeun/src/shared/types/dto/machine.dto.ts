// ============================================================================
// MachineDTO - Data Transfer Object
// ============================================================================

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
  category: string | MachineCategoryDTO
  targetMuscles?: string[]
  difficulty: string | DifficultyLevelDTO
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
  category: string | MachineCategoryDTO
  targetMuscles?: string[]
  difficulty: string | DifficultyLevelDTO
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
  category?: string | MachineCategoryDTO
  targetMuscles?: string[]
  difficulty?: string | DifficultyLevelDTO
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
