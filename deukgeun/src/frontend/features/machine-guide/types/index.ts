// ============================================================================
// Machine Guide Feature Types
// ============================================================================

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
  targetMuscles?: string[]
  difficulty: DifficultyLevel
  videoUrl?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
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

export type TargetMuscle =
  | "가슴"
  | "등"
  | "어깨"
  | "팔"
  | "복근"
  | "허리"
  | "엉덩이"
  | "다리"

// Filter Types
export interface MachineFilterQuery {
  category?: MachineCategory
  difficulty?: DifficultyLevel
  target?: string
  search?: string
}

// Component Props Types
export interface MachineCardProps {
  machine: Machine
  onClick: (machine: Machine) => void
  className?: string
}

export interface MachineModalProps {
  machine: Machine | null
  isOpen: boolean
  onClose: () => void
}

export interface MachineFilterProps {
  selectedCategory: string
  selectedDifficulty: string
  selectedTarget: string
  searchTerm: string
  onCategoryChange: (category: string) => void
  onDifficultyChange: (difficulty: string) => void
  onTargetChange: (target: string) => void
  onSearchChange: (search: string) => void
  onReset: () => void
}

// Hook Return Types
export interface UseMachinesReturn {
  machines: Machine[]
  loading: boolean
  error: string | null
  currentFilter: string | null
  fetchMachines: () => Promise<Machine[]>
  fetchMachine: (id: number) => Promise<Machine>
  createMachine: (data: CreateMachineRequest) => Promise<Machine>
  updateMachine: (id: number, data: UpdateMachineRequest) => Promise<Machine>
  deleteMachine: (id: number) => Promise<void>
  getMachinesByCategory: (category: string) => Promise<Machine[]>
  getMachinesByDifficulty: (difficulty: string) => Promise<Machine[]>
  getMachinesByTarget: (target: string) => Promise<Machine[]>
  filterMachines: (filters: MachineFilterQuery) => Promise<Machine[]>
  clearError: () => void
}

// Constants
export const MACHINE_CATEGORIES: MachineCategory[] = [
  "상체",
  "하체",
  "전신",
  "기타",
  "cardio",
  "strength",
  "flexibility",
  "balance",
  "functional",
  "rehabilitation",
]

export const DIFFICULTY_LEVELS: DifficultyLevel[] = [
  "초급",
  "중급",
  "고급",
  "beginner",
  "intermediate",
  "advanced",
  "expert",
]

export const TARGET_MUSCLES: TargetMuscle[] = [
  "가슴",
  "등",
  "어깨",
  "팔",
  "복근",
  "허리",
  "엉덩이",
  "다리",
]

// Utility Types
export type MachineSortOption = "name" | "category" | "difficulty" | "createdAt"

export interface MachineSortConfig {
  field: MachineSortOption
  direction: "asc" | "desc"
}
