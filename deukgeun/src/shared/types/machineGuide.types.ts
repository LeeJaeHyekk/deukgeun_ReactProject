// ============================================================================
// Enhanced Machine Guide Types
// ============================================================================

export type MachineCategory =
  | 'chest'
  | 'back'
  | 'legs'
  | 'shoulders'
  | 'arms'
  | 'cardio'
  | 'core'
  | 'fullbody'

export type DifficultyLevel =
  | 'beginner'
  | 'intermediate'
  | 'advanced'
  | 'expert'

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

// 기본 머신 인터페이스
export interface Machine {
  id: number
  machineKey: string
  name: string
  nameEn: string
  imageUrl: string
  shortDesc: string
  category: MachineCategory
  difficulty: DifficultyLevel
  isActive: boolean
}

// 향상된 머신 인터페이스 (새로운 구조)
export interface EnhancedMachine extends Machine {
  anatomy: MachineAnatomy
  guide: MachineGuide
  training: MachineTraining
  extraInfo: MachineExtraInfo
}

// 카테고리 정보
export interface MachineCategoryInfo {
  name: string
  nameEn: string
  description: string
  color: string
}

// 난이도 정보
export interface DifficultyInfo {
  name: string
  nameEn: string
  description: string
  color: string
}

// 머신 가이드 데이터 (JSON 구조)
export interface MachineGuideData {
  machines: EnhancedMachine[]
  categories: Record<MachineCategory, MachineCategoryInfo>
  difficulties: Record<DifficultyLevel, DifficultyInfo>
}

// machinesData.json에서 직접 import할 수 있는 타입
export interface MachinesDataJson {
  machines: EnhancedMachine[]
}

// 필터 쿼리
export interface MachineFilterQuery {
  category?: MachineCategory
  difficulty?: DifficultyLevel
  targetMuscle?: string
  searchTerm?: string
}

// 머신 가이드 상태
export interface MachineGuideState {
  machines: EnhancedMachine[]
  loading: boolean
  error: string | null
  currentFilter: string
  retryCount: number
}

// 컴포넌트 Props
export interface MachineCardProps {
  machine: EnhancedMachine
  onClick: (machine: EnhancedMachine) => void
  className?: string
  showAnatomy?: boolean
  showTraining?: boolean
}

export interface MachineModalProps {
  machine: EnhancedMachine | null
  isOpen: boolean
  onClose: () => void
  activeTab?: 'guide' | 'anatomy' | 'training' | 'safety'
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

// API 응답 타입
export interface MachineApiResponse {
  success: boolean
  data: EnhancedMachine[]
  message?: string
}

export interface MachineApiError {
  success: false
  error: string
  code?: string
}

// 이미지 설정
export interface MachineImageConfig {
  webp: string
  png: string
  thumbnail: string
}

export interface MachineWithImages extends EnhancedMachine {
  images: MachineImageConfig
}

// 통계
export interface MachineStats {
  totalMachines: number
  activeMachines: number
  inactiveMachines: number
  categoryCounts: Record<MachineCategory, number>
  difficultyCounts: Record<DifficultyLevel, number>
  mostPopularCategory: MachineCategory
  mostPopularDifficulty: DifficultyLevel
}

// 검색 결과
export interface MachineSearchResult {
  machine: EnhancedMachine
  relevanceScore: number
  matchedFields: string[]
}

export interface MachineSearchOptions {
  includeInactive?: boolean
  maxResults?: number
  minRelevanceScore?: number
}

// 관리용 타입
export interface MachineCreateRequest {
  machineKey: string
  name: string
  nameEn: string
  imageUrl: string
  shortDesc: string
  category: MachineCategory
  difficulty: DifficultyLevel
  anatomy: MachineAnatomy
  guide: MachineGuide
  training: MachineTraining
  extraInfo: MachineExtraInfo
}

export interface MachineUpdateRequest {
  id: number
  name?: string
  nameEn?: string
  imageUrl?: string
  shortDesc?: string
  category?: MachineCategory
  difficulty?: DifficultyLevel
  anatomy?: Partial<MachineAnatomy>
  guide?: Partial<MachineGuide>
  training?: Partial<MachineTraining>
  extraInfo?: Partial<MachineExtraInfo>
  isActive?: boolean
}
