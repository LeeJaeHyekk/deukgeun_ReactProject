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
  nameKo?: string
  nameEn?: string
  imageUrl: string
  shortDesc: string
  detailDesc: string
  positiveEffect?: string
  category: MachineCategory
  targetMuscles: string[] // optional에서 required로 변경
  difficulty: DifficultyLevel
  videoUrl?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  // 호환성을 위한 추가 필드들
  description?: string
  instructions?: string
}

export interface CreateMachineRequest {
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

// 백엔드 API 응답 구조에 맞는 타입
export interface MachineListResponse {
  message: string
  data: Machine[]
  count: number
}

export interface MachineResponse {
  message: string
  data: Machine
}
