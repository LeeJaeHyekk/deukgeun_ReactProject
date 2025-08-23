// ============================================================================
// PostDTO - Data Transfer Object
// ============================================================================

export interface PostCategoryInfo {
  id: string
  name: string
  description?: string
  count?: number
}

export interface PostDTO {
  id: number
  title: string
  content: string
  author: string
  userId: number
  category: string | PostCategoryInfo
  tags?: string[]
  thumbnailUrl?: string
  images?: string[]
  likeCount: number
  commentCount: number
  viewCount?: number
  createdAt: Date
  updatedAt: Date
}

// Create DTO (for creating new Post)
export interface CreatePostDTO {
  id: number
  title: string
  content: string
  author: string
  userId: number
  category: unknown
  tags?: string[]
  thumbnailUrl?: string
  images?: string[]
}

// Update DTO (for updating existing Post)
export interface UpdatePostDTO {
  id?: number
  title?: string
  content?: string
  author?: string
  userId?: number
  category?: unknown
  tags?: string[]
  thumbnailUrl?: string
  images?: string[]
}

// Response DTO (for API responses)
export interface PostDTOResponse {
  success: boolean
  data?: PostDTO
  message?: string
  error?: string
}

// List Response DTO
export interface PostDTOListResponse {
  success: boolean
  data?: PostDTO[]
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  message?: string
  error?: string
}
