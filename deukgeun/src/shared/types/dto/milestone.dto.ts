// ============================================================================
// MilestoneDTO - Data Transfer Object
// ============================================================================

export interface MilestoneDTO {
  id: number
  userId: number
  milestoneType: string
  title: string
  description?: string
  targetValue: number
  currentValue: number
  isCompleted: boolean
  completedAt?: Date
  rewardValue?: number
  createdAt: Date
  updatedAt: Date
}

// Create DTO (for creating new Milestone)
export interface CreateMilestoneDTO {
  id: number
  userId: number
  milestoneType: string
  title: string
  description?: string
  targetValue: number
  currentValue: number
  isCompleted: boolean
  rewardValue?: number
}

// Update DTO (for updating existing Milestone)
export interface UpdateMilestoneDTO {
  id?: number
  userId?: number
  milestoneType?: string
  title?: string
  description?: string
  targetValue?: number
  currentValue?: number
  isCompleted?: boolean
  completedAt?: Date
  rewardValue?: number
}

// Response DTO (for API responses)
export interface MilestoneDTOResponse {
  success: boolean
  data?: MilestoneDTO
  message?: string
  error?: string
}

// List Response DTO
export interface MilestoneDTOListResponse {
  success: boolean
  data?: MilestoneDTO[]
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  message?: string
  error?: string
}
