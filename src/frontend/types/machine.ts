// ============================================================================
// 머신 관련 타입 정의
// ============================================================================

export type MachineCategory =
  | "chest"
  | "back"
  | "shoulders"
  | "arms"
  | "legs"
  | "core"
  | "cardio"
  | "full_body"

export type MachineDifficulty = "beginner" | "intermediate" | "advanced"

export interface Machine {
  id: number
  name: string
  category: MachineCategory
  description?: string
  imageUrl?: string
  difficulty: MachineDifficulty
  targetMuscleGroups: string[]
  muscleGroups: string[]
  gymId: number
  instructions?: string
  safetyTips?: string
  createdAt: Date
  updatedAt: Date
}

export interface MachineDTO {
  id: number
  name: string
  category: MachineCategory
  description?: string
  imageUrl?: string
  difficulty: MachineDifficulty
  targetMuscleGroups: string[]
  muscleGroups: string[]
  gymId: number
  instructions?: string
  safetyTips?: string
  createdAt: Date
  updatedAt: Date
}

export interface CreateMachineRequest {
  name: string
  category: MachineCategory
  description?: string
  imageUrl?: string
  difficulty: MachineDifficulty
  targetMuscleGroups: string[]
  muscleGroups: string[]
  gymId: number
  instructions?: string
  safetyTips?: string
}

export interface UpdateMachineRequest extends Partial<CreateMachineRequest> {
  id: number
}

export interface MachineSearchParams {
  name?: string
  category?: MachineCategory
  difficulty?: MachineDifficulty
  gymId?: number
  muscleGroups?: string[]
  page?: number
  limit?: number
}

export interface MachineStats {
  id: number
  machineId: number
  totalSessions: number
  totalReps: number
  totalWeight: number
  averageReps: number
  averageWeight: number
  personalBest: number
  lastUsed?: Date
  createdAt: Date
  updatedAt: Date
}