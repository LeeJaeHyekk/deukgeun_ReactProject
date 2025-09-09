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
  | "full-body"

export type DifficultyLevel = "beginner" | "intermediate" | "advanced"

export interface MachineDTO {
  id: number
  machineKey: string
  name: string
  nameKo?: string
  nameEn?: string
  imageUrl?: string
  shortDesc?: string
  detailDesc?: string
  positiveEffect?: string
  category: MachineCategory
  targetMuscles?: string[]
  difficulty: DifficultyLevel
  videoUrl?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface CreateMachineDTO {
  machineKey: string
  name: string
  nameKo?: string
  nameEn?: string
  imageUrl?: string
  shortDesc?: string
  detailDesc?: string
  positiveEffect?: string
  category: MachineCategory
  targetMuscles?: string[]
  difficulty: DifficultyLevel
  videoUrl?: string
  isActive?: boolean
}

export interface UpdateMachineDTO {
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

export interface MachineSearchParams {
  name?: string
  category?: MachineCategory
  difficulty?: DifficultyLevel
  targetMuscles?: string[]
  isActive?: boolean
}

export interface CreateMachineRequest {
  machineKey: string
  name: string
  nameKo?: string
  nameEn?: string
  imageUrl?: string
  shortDesc?: string
  detailDesc?: string
  positiveEffect?: string
  category: MachineCategory
  targetMuscles?: string[]
  difficulty: DifficultyLevel
  videoUrl?: string
  isActive?: boolean
}

export interface UpdateMachineRequest {
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

export interface MachineFilterQuery {
  name?: string
  category?: MachineCategory
  difficulty?: DifficultyLevel
  targetMuscles?: string[]
  isActive?: boolean
  page?: number
  limit?: number
}

export interface MachineListResponse {
  machines: MachineDTO[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}