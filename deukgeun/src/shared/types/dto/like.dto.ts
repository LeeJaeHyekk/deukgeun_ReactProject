// ============================================================================
// LikeDTO - Data Transfer Object
// ============================================================================

export interface LikeDTO {
  id: number
  postId: number
  userId: number
  createdAt: Date
}

// Alias for compatibility
export type Like = LikeDTO

// Create DTO (for creating new Like)
export interface CreateLikeDTO {
  id: number
  postId: number
  userId: number
}

// Update DTO (for updating existing Like)
export interface UpdateLikeDTO {
  id?: number
  postId?: number
  userId?: number
}

// Response DTO (for API responses)
export interface LikeDTOResponse {
  success: boolean
  data?: LikeDTO
  message?: string
  error?: string
}

// List Response DTO
export interface LikeDTOListResponse {
  success: boolean
  data?: LikeDTO[]
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  message?: string
  error?: string
}
