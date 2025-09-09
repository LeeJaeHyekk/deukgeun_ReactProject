// Community 시스템 - Post 관련 타입 정의

// 게시글 카테고리 (API 응답과 호환성을 위해 객체 인터페이스로 정의)
export interface PostCategory {
  id: number
  name: string
  count: number
}

// 게시글 상태
export type PostStatus = "published" | "draft" | "archived" | "deleted"

// 게시글 타입
export interface Post {
  id: number
  userId: number
  title: string
  content: string
  category: PostCategory | string // 카테고리 객체 또는 이름
  status: PostStatus
  viewCount: number
  likeCount: number
  commentCount: number
  isAnonymous: boolean
  tags: string[]
  images?: string[]
  createdAt: Date
  updatedAt: Date
  // 관계 데이터
  author?: PostUser // 작성자 정보
  user?: PostUser
  likes?: Like[]
  comments?: Comment[]
}

// 게시글 작성자 정보
export interface PostUser {
  id: number
  nickname: string
  profileImage?: string
  level: number
  experience: number
}

// 좋아요 타입
export interface Like {
  id: number
  userId: number
  postId: number
  createdAt: Date
  user?: PostUser
}

// 댓글 타입
export interface Comment {
  id: number
  postId: number
  userId: number
  content: string
  parentId?: number
  isAnonymous: boolean
  createdAt: Date
  updatedAt: Date
  // 관계 데이터
  user?: PostUser
  replies?: Comment[]
}

// 게시글 목록 응답
export interface PostListResponse {
  posts: Post[]
  total: number
  page: number
  limit: number
}

// 게시글 페이지네이션 정보
export interface PostPaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

// 게시글 생성 요청
export interface CreatePostRequest {
  title: string
  content: string
  category: string
  isAnonymous?: boolean
  tags?: string[]
  images?: string[]
}

// 게시글 수정 요청
export interface UpdatePostRequest {
  title?: string
  content?: string
  category?: string
  status?: PostStatus
  tags?: string[]
  images?: string[]
}

// 게시글 검색 요청
export interface SearchPostsRequest {
  query: string
  category?: string
  page?: number
  limit?: number
  sortBy?: "latest" | "popular" | "relevance"
}

// 게시글 필터 요청
export interface FilterPostsRequest {
  category?: string
  tags?: string[]
  dateRange?: {
    start: Date
    end: Date
  }
  page?: number
  limit?: number
  sortBy?: "latest" | "popular" | "viewCount" | "likeCount"
}

// 댓글 생성 요청
export interface CreateCommentRequest {
  postId: number
  content: string
  parentId?: number
  isAnonymous: boolean
}

// 댓글 수정 요청
export interface UpdateCommentRequest {
  id: number
  content: string
}

// 좋아요 요청
export interface LikePostRequest {
  postId: number
}

// DTO 타입 (백엔드와의 호환성을 위해)
export type PostDTO = Post
export type CommentDTO = Comment
export type LikeDTO = Like
export type PostUserDTO = PostUser

// API 응답 타입
export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
}

export interface ApiListResponse<T> {
  data: T[]
  pagination: PostPaginationInfo
  message?: string
  success: boolean
}
