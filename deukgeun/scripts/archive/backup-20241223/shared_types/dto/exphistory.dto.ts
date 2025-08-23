// ============================================================================
// ExpHistoryDTO - Data Transfer Object
// ============================================================================

export interface ExpHistoryDTO {
  id: number
  userId: number
  actionType: unknown
  expGained: number
  source: string
  metadata?: Record<string, unknown>
  levelBefore?: number
  levelAfter?: number
  isLevelUp: boolean
  createdAt: Date
}

// Create DTO (for creating new ExpHistory)
export interface CreateExpHistoryDTO {
  id: number
  userId: number
  actionType: unknown
  expGained: number
  source: string
  metadata?: Record<string, unknown>
  levelBefore?: number
  levelAfter?: number
  isLevelUp: boolean
}

// Update DTO (for updating existing ExpHistory)
export interface UpdateExpHistoryDTO {
  id?: number
  userId?: number
  actionType?: unknown
  expGained?: number
  source?: string
  metadata?: Record<string, unknown>
  levelBefore?: number
  levelAfter?: number
  isLevelUp?: boolean
}

// Response DTO (for API responses)
export interface ExpHistoryDTOResponse {
  success: boolean
  data?: ExpHistoryDTO
  message?: string
  error?: string
}

// List Response DTO
export interface ExpHistoryDTOListResponse {
  success: boolean
  data?: ExpHistoryDTO[]
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  message?: string
  error?: string
}
