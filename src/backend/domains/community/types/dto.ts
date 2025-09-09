// ============================================================================
// Community DTO Types
// ============================================================================

export interface PostDTO {
  id: number
  userId: number
  title: string
  content: string
  imageUrl?: string
  likesCount: number
  commentsCount: number
  isLiked: boolean
  createdAt: Date
  updatedAt: Date
  user?: {
    id: number
    nickname: string
    profileImage?: string
  }
}

export interface CommentDTO {
  id: number
  postId: number
  userId: number
  content: string
  parentId?: number
  likesCount: number
  isLiked: boolean
  createdAt: Date
  updatedAt: Date
  user?: {
    id: number
    nickname: string
    profileImage?: string
  }
  replies?: CommentDTO[]
}

export interface LikeDTO {
  id: number
  userId: number
  targetType: "post" | "comment"
  targetId: number
  createdAt: Date
}

export interface CreatePostDTO {
  title: string
  content: string
  imageUrl?: string
}

export interface UpdatePostDTO {
  title?: string
  content?: string
  imageUrl?: string
}

export interface CreateCommentDTO {
  content: string
  parentId?: number
}

export interface UpdateCommentDTO {
  content: string
}

export type PostCategory = 
  | "general"
  | "workout"
  | "nutrition"
  | "motivation"
  | "tips"
  | "questions"
  | "achievements"
  | "challenges"