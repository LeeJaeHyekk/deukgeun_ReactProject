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

export interface Machine {
  id: number
  machineKey: string
  name: string
  nameEn?: string
  imageUrl: string
  shortDesc: string
  detailDesc: string
  category: MachineCategory
  difficulty: DifficultyLevel
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface CreateMachineRequest {
  machineKey: string
  name: string
  nameEn?: string
  imageUrl: string
  shortDesc: string
  detailDesc: string
  category: MachineCategory
  difficulty: DifficultyLevel
}

export interface UpdateMachineRequest {
  machineKey?: string
  name?: string
  nameEn?: string
  imageUrl?: string
  shortDesc?: string
  detailDesc?: string
  category?: MachineCategory
  difficulty?: DifficultyLevel
  isActive?: boolean
}

export interface MachineListResponse {
  success: boolean
  message: string
  data: {
    machines: Machine[]
    total: number
  }
}

export interface MachineResponse {
  success: boolean
  message: string
  data: {
    machine: Machine
  }
}
