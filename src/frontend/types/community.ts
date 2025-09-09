// ============================================================================
// Community Types
// ============================================================================

export interface Post {
  id: string
  title: string
  content: string
  author: {
    id: string
    name: string
    avatar?: string
  }
  tags: string[]
  images: string[]
  likes: number
  comments: number
  isLiked: boolean
  createdAt: string
  updatedAt: string
}

export interface Comment {
  id: string
  content: string
  author: {
    id: string
    name: string
    avatar?: string
  }
  parentId?: string
  likes: number
  isLiked: boolean
  replies?: Comment[]
  createdAt: string
  updatedAt: string
}

export interface CreatePostRequest {
  title: string
  content: string
  tags?: string[]
  images?: string[]
}

export interface UpdatePostRequest {
  title?: string
  content?: string
  tags?: string[]
  images?: string[]
}

export interface CreateCommentRequest {
  content: string
  parentId?: string
}

export interface UpdateCommentRequest {
  content: string
}

export interface LikeRequest {
  postId: string
}

export interface PostFilters {
  category?: string
  searchTerm?: string
  sortBy?: string
  sortOrder?: "asc" | "desc"
}

export interface CommentFilters {
  postId?: string
  parentId?: string
  sortBy?: string
  sortOrder?: "asc" | "desc"
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export interface ApiListResponse<T = any> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}