// ============================================================================
// 기구 관련 타입 정의
// ============================================================================

export enum EquipmentType {
  CARDIO = "cardio",
  WEIGHT = "weight"
}

export enum EquipmentCategory {
  // 유산소 기구
  TREADMILL = "treadmill",
  BIKE = "bike", 
  STEPPER = "stepper",
  ROWING_MACHINE = "rowing_machine",
  CROSS_TRAINER = "cross_trainer",
  STAIR_MASTER = "stair_master",
  SKI_MACHINE = "ski_machine",
  
  // 웨이트 기구
  DUMBBELL = "dumbbell",
  BARBELL = "barbell",
  WEIGHT_MACHINE = "weight_machine",
  SMITH_MACHINE = "smith_machine",
  POWER_RACK = "power_rack",
  CABLE = "cable",
  PULL_UP_BAR = "pull_up_bar"
}

// 기구 기본 정보
export interface EquipmentInfo {
  id?: number
  gymId: number
  type: EquipmentType
  category: EquipmentCategory
  name: string
  quantity: number
  brand?: string
  model?: string
  isLatestModel?: boolean
  weightRange?: string
  equipmentVariant?: string
  additionalInfo?: string
  confidence: number
  source?: string
  createdAt?: Date
  updatedAt?: Date
}

// 기구 생성 DTO
export interface CreateEquipmentDTO {
  gymId: number
  type: EquipmentType
  category: EquipmentCategory
  name: string
  quantity: number
  brand?: string
  model?: string
  isLatestModel?: boolean
  weightRange?: string
  equipmentVariant?: string
  additionalInfo?: string
  confidence?: number
  source?: string
}

// 기구 업데이트 DTO
export interface UpdateEquipmentDTO {
  type?: EquipmentType
  category?: EquipmentCategory
  name?: string
  quantity?: number
  brand?: string
  model?: string
  isLatestModel?: boolean
  weightRange?: string
  equipmentVariant?: string
  additionalInfo?: string
  confidence?: number
  source?: string
}

// 기구 응답 DTO
export interface EquipmentDTO extends EquipmentInfo {}

// 기구 목록 응답 DTO
export interface EquipmentListResponse {
  equipments: EquipmentDTO[]
  total: number
  page: number
  limit: number
}

// 헬스장 기구 요약 정보
export interface GymEquipmentSummary {
  gymId: number
  totalEquipment: number
  cardioEquipment: {
    total: number
    byCategory: Record<EquipmentCategory, number>
  }
  weightEquipment: {
    total: number
    byCategory: Record<EquipmentCategory, number>
  }
  equipmentDetails: EquipmentDTO[]
}

// 크롤링된 기구 정보
export interface CrawledEquipmentData {
  category: EquipmentCategory
  name: string
  quantity?: number
  brand?: string
  model?: string
  isLatestModel?: boolean
  weightRange?: string
  equipmentVariant?: string
  additionalInfo?: string
  confidence: number
  source: string
}

// 기구 검색 필터
export interface EquipmentSearchFilter {
  gymId?: number
  type?: EquipmentType
  category?: EquipmentCategory
  brand?: string
  isLatestModel?: boolean
  minQuantity?: number
  maxQuantity?: number
}

// 기구 통계 정보
export interface EquipmentStatistics {
  totalGyms: number
  totalEquipment: number
  averageEquipmentPerGym: number
  mostCommonEquipment: {
    category: EquipmentCategory
    count: number
  }[]
  brandDistribution: {
    brand: string
    count: number
  }[]
  equipmentByType: {
    type: EquipmentType
    count: number
    percentage: number
  }[]
}
