// ============================================================================
// 커뮤니티 기능 공통 타입 정의
// ============================================================================

import { PostDTO as CommunityPost } from '../../../../shared/types'

// 기본 타입들
export type Post = CommunityPost
export type PostId = number
export type UserId = number

// 기존 타입들 재내보내기
export type { PostDTO } from '../../../../shared/types'

// 댓글 관련 타입
export interface CommentAuthor {
  id: number
  nickname: string
  profileImage?: string
  avatarUrl?: string
}

export interface Comment {
  id: number
  postId: number
  userId: number
  author: CommentAuthor
  content: string
  likesCount: number
  createdAt: string
  updatedAt: string
}

// API 응답 타입
export interface ApiResponse<T = any> {
  success: boolean
  message: string
  data?: T
  error?: string
}

export interface CommentsApiResponse {
  success: boolean
  message: string
  data?: Comment[]
  error?: string
}

// 필터 관련 타입
export type SortOption = 'latest' | 'popular'
export type CategoryFilter = string

// 모달 관련 타입
export interface PostModalData {
  title: string
  content: string
  category: string
}

// 댓글 수 동기화 타입
export interface CommentCountSync {
  postId: number
  confirmedCount: number
  optimisticCount: number
}

// 에러 타입
export interface CommunityError {
  code: string
  message: string
  details?: any
}
