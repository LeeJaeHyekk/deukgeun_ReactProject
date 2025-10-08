// ============================================================================
// UserRewardDTO - Data Transfer Object
// ============================================================================

export interface UserRewardDTO {
  id: number
  userId: number
  rewardType: string
  rewardValue: number
  description?: string
  isClaimed: boolean
  claimedAt?: Date
  expiresAt?: Date
  createdAt: Date
  updatedAt: Date
}

// Create DTO (for creating new UserReward)
export interface CreateUserRewardDTO {
  id: number
  userId: number
  rewardType: string
  rewardValue: number
  description?: string
  isClaimed: boolean
  expiresAt?: Date
}

// Update DTO (for updating existing UserReward)
export interface UpdateUserRewardDTO {
  id?: number
  userId?: number
  rewardType?: string
  rewardValue?: number
  description?: string
  isClaimed?: boolean
  claimedAt?: Date
  expiresAt?: Date
}

// Response DTO (for API responses)
export interface UserRewardDTOResponse {
  success: boolean
  data?: UserRewardDTO
  message?: string
  error?: string
}

// List Response DTO
export interface UserRewardDTOListResponse {
  success: boolean
  data?: UserRewardDTO[]
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  message?: string
  error?: string
}
