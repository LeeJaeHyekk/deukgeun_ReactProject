// ============================================================================
// Machine Types
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

export interface Machine {
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

export interface MachineCategoryEntity {
  id: number
  name: string
  description?: string
  createdAt: Date
  updatedAt: Date
}

export interface MachineSearchFilters {
  name?: string
  category?: MachineCategory
  difficulty?: DifficultyLevel
  targetMuscles?: string[]
  isActive?: boolean
}

export interface MachineListParams {
  page?: number
  limit?: number
  sortBy?: "name" | "category" | "difficulty" | "createdAt"
  sortOrder?: "asc" | "desc"
  filters?: MachineSearchFilters
}
