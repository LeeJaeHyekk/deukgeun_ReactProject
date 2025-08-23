import type { UserProfile } from "./common"

// ============================================================================
// 게시글 관련 타입
// ============================================================================

export interface Post {
  id: number
  title: string
  content: string
  authorId: number
  author?: UserProfile
  likes: number
  comments: number
  createdAt: Date
  updatedAt: Date
}

export interface Comment {
  id: number
  content: string
  authorId: number
  postId: number
  author?: UserProfile
  createdAt: Date
  updatedAt: Date
}

export interface Like {
  id: number
  userId: number
  postId: number
  createdAt: Date
}
