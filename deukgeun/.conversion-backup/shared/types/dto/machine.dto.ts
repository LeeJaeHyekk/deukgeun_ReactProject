// ============================================================================
// MachineDTO - Data Transfer Object
// ============================================================================

export type MachineCategory =
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'arms'
  | 'legs'
  | 'core'
  | 'cardio'
  | 'fullbody'

export type DifficultyLevel =
  | 'beginner'
  | 'intermediate'
  | 'advanced'
  | 'expert'

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
  sortOrder?: 'asc' | 'desc'
}

// 이미지 메타데이터 인터페이스
export interface ImageMetadata {
  fileName: string
  fileSize: number
  dimensions: {
    width: number
    height: number
  }
  format: string
  lastModified: Date
  checksum?: string
}

// 이미지 분류 정보
export interface ImageClassification {
  type: 'equipment' | 'exercise' | 'instruction' | 'diagram'
  angle: 'front' | 'side' | 'back' | 'top' | 'diagonal'
  lighting: 'natural' | 'studio' | 'gym'
  background: 'transparent' | 'white' | 'gym' | 'outdoor'
}

// 이미지 사용 정보
export interface ImageUsage {
  isThumbnail: boolean
  isMainImage: boolean
  displayOrder: number
  altText: string
}

export interface MachineDTO {
  id: number
  machineKey: string
  name: string
  nameKo?: string
  nameEn?: string
  imageUrl: string
  imageMetadata?: ImageMetadata
  imageClassification?: ImageClassification
  imageUsage?: ImageUsage
  shortDesc: string
  detailDesc: string
  description?: string
  instructions?: string[]
  positiveEffect?: string
  category: MachineCategory | MachineCategoryDTO
  targetMuscles?: string[]
  difficulty: DifficultyLevel | DifficultyLevelDTO
  videoUrl?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

// Alias for compatibility
export type Machine = MachineDTO

// Create DTO (for creating new Machine)
export interface CreateMachineDTO {
  id: number
  machineKey: string
  name: string
  nameKo?: string
  nameEn?: string
  imageUrl: string
  imageMetadata?: ImageMetadata
  imageClassification?: ImageClassification
  imageUsage?: ImageUsage
  shortDesc: string
  detailDesc: string
  description?: string
  instructions?: string[]
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
  imageMetadata?: ImageMetadata
  imageClassification?: ImageClassification
  imageUsage?: ImageUsage
  shortDesc?: string
  detailDesc?: string
  description?: string
  instructions?: string[]
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
