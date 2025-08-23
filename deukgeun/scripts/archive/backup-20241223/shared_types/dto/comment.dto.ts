// ============================================================================
// CommentDTO - Data Transfer Object
// ============================================================================

export interface CommentDTO {
  id: number
  postId: number
  userId: number
  author: string
  content: string
  createdAt: Date
  updatedAt: Date
}

// Create DTO (for creating new Comment)
export interface CreateCommentDTO {
  id: number
  postId: number
  userId: number
  author: string
  content: string
}

// Update DTO (for updating existing Comment)
export interface UpdateCommentDTO {
  id?: number
  postId?: number
  userId?: number
  author?: string
  content?: string
}

// Response DTO (for API responses)
export interface CommentDTOResponse {
  success: boolean
  data?: CommentDTO
  message?: string
  error?: string
}

// List Response DTO
export interface CommentDTOListResponse {
  success: boolean
  data?: CommentDTO[]
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  message?: string
  error?: string
}
