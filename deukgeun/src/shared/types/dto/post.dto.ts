// ============================================================================
// PostDTO - Data Transfer Object
// ============================================================================

export type PostCategory =
  | 'general'
  | 'workout'
  | 'nutrition'
  | 'motivation'
  | 'tips'
  | 'questions'
  | 'achievements'
  | 'challenges'

export interface PostCategoryInfo {
  id: string
  name: string
  description?: string
  count?: number
}

// User 정보를 위한 간단한 인터페이스
export interface PostAuthor {
  id: number
  nickname: string
  email?: string
  avatarUrl?: string
}

export interface PostDTO {
  id: number
  title: string
  content: string
  author: PostAuthor
  userId: number
  category: PostCategory | PostCategoryInfo
  tags?: string[]
  thumbnailUrl?: string
  images?: string[]
  likeCount: number
  commentCount: number
  viewCount?: number
  isLiked?: boolean
  createdAt: Date
  updatedAt: Date
}

// Alias for compatibility
export type Post = PostDTO

// Create DTO (for creating new Post)
export interface CreatePostDTO {
  id: number
  title: string
  content: string
  author: PostAuthor
  userId: number
  category: PostCategory | PostCategoryInfo
  tags?: string[]
  thumbnailUrl?: string
  images?: string[]
}

// Update DTO (for updating existing Post)
export interface UpdatePostDTO {
  id?: number
  title?: string
  content?: string
  author?: PostAuthor
  userId?: number
  category?: PostCategory | PostCategoryInfo
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
