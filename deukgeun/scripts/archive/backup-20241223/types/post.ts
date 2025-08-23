// ============================================================================
// 커뮤니티 포스트 관련 타입
// ============================================================================

// 포스트
export interface Post {
  id: number
  userId: number
  title: string
  content: string
  imageUrl?: string
  category: PostCategory
  tags?: string[]
  viewCount: number
  likeCount: number
  commentCount: number
  isPublished: boolean
  publishedAt?: Date
  createdAt: Date
  updatedAt: Date
}

// 커뮤니티 컴포넌트용 Post 타입
export interface CommunityPost {
  id: number
  title: string
  content: string
  author: {
    id: number
    nickname: string
  }
  category: string
  likes?: number
  comments?: number
  like_count?: number
  comment_count?: number
  createdAt: string
  updatedAt: string
}

// 포스트 카테고리
export type PostCategory =
  | "workout_tip"
  | "motivation"
  | "progress_share"
  | "question"
  | "review"
  | "general"

// 커뮤니티 포스트 카테고리
export interface PostCategoryInfo {
  id: number
  name: string
  count: number
}

// 댓글
export interface Comment {
  id: number
  postId: number
  userId: number
  content: string
  parentId?: number
  likeCount: number
  isEdited: boolean
  createdAt: Date
  updatedAt: Date
}

// 커뮤니티 댓글 타입
export interface PostComment {
  id: number
  author: {
    id: number
    nickname: string
  }
  content: string
  createdAt: string
}

// 좋아요
export interface Like {
  id: number
  userId: number
  postId?: number
  commentId?: number
  createdAt: Date
}

// 포스트 생성 요청
export interface CreatePostRequest {
  userId: number
  title: string
  content: string
  imageUrl?: string
  category: PostCategory
  tags?: string[]
}

// 커뮤니티 포스트 생성 요청
export interface CreateCommunityPostRequest {
  title: string
  content: string
  category: string
}

// 포스트 업데이트 요청
export interface UpdatePostRequest {
  postId: number
  title?: string
  content?: string
  imageUrl?: string
  category?: PostCategory
  tags?: string[]
  isPublished?: boolean
}

// 커뮤니티 포스트 업데이트 요청
export interface UpdateCommunityPostRequest {
  title: string
  content: string
  category: string
}

// 댓글 생성 요청
export interface CreateCommentRequest {
  postId: number
  userId: number
  content: string
  parentId?: number
}

// 댓글 업데이트 요청
export interface UpdateCommentRequest {
  commentId: number
  content: string
}

// 좋아요 요청
export interface ToggleLikeRequest {
  userId: number
  postId?: number
  commentId?: number
}

// 포스트 조회 요청
export interface GetPostsRequest {
  page?: number
  limit?: number
  category?: PostCategory
  userId?: number
  search?: string
  tags?: string[]
  sortBy?: "latest" | "popular" | "most_viewed"
}

// 포스트 상세 조회 요청
export interface GetPostRequest {
  postId: number
  userId?: number // 좋아요 상태 확인용
}

// 댓글 조회 요청
export interface GetCommentsRequest {
  postId: number
  page?: number
  limit?: number
  parentId?: number
}

// 포스트 응답 타입
export interface PostResponse {
  success: boolean
  message: string
  data?: Post
  error?: string
}

export interface PostsResponse {
  success: boolean
  message: string
  data?: {
    posts: Post[]
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
  }
  error?: string
}

// 댓글 응답 타입
export interface CommentResponse {
  success: boolean
  message: string
  data?: Comment
  error?: string
}

export interface CommentsResponse {
  success: boolean
  message: string
  data?: {
    comments: Comment[]
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
  }
  error?: string
}

// 좋아요 응답 타입
export interface LikeResponse {
  success: boolean
  message: string
  data?: {
    isLiked: boolean
    likeCount: number
  }
  error?: string
}

// 포스트 통계
export interface PostStats {
  totalPosts: number
  totalViews: number
  totalLikes: number
  totalComments: number
  postsByCategory: Record<PostCategory, number>
  topPosts: Post[]
  recentActivity: Array<{
    type: "post" | "comment" | "like"
    postId: number
    userId: number
    timestamp: Date
  }>
}

// 사용자 포스트 활동
export interface UserPostActivity {
  userId: number
  totalPosts: number
  totalComments: number
  totalLikes: number
  postsByCategory: Record<PostCategory, number>
  recentPosts: Post[]
  recentComments: Comment[]
}

// 포스트 검색 결과
export interface PostSearchResult {
  posts: Post[]
  totalResults: number
  searchTerm: string
  filters: {
    category?: PostCategory
    tags?: string[]
    dateRange?: {
      start: Date
      end: Date
    }
  }
}

// 포스트 알림
export interface PostNotification {
  id: number
  userId: number
  type: "new_comment" | "new_like" | "comment_reply" | "post_mention"
  postId: number
  commentId?: number
  fromUserId: number
  message: string
  isRead: boolean
  createdAt: Date
}

// 포스트 신고
export interface PostReport {
  id: number
  postId: number
  reporterId: number
  reason: "spam" | "inappropriate" | "harassment" | "copyright" | "other"
  description?: string
  status: "pending" | "reviewed" | "resolved" | "dismissed"
  adminNotes?: string
  createdAt: Date
  updatedAt: Date
}

// 포스트 북마크
export interface PostBookmark {
  id: number
  userId: number
  postId: number
  createdAt: Date
}

// 포스트 공유
export interface PostShare {
  id: number
  postId: number
  sharedBy: number
  sharedWith: number
  message?: string
  createdAt: Date
}

// 포스트 태그
export interface PostTag {
  id: number
  name: string
  description?: string
  postCount: number
  createdAt: Date
}

// 포스트 카테고리 설정
export interface PostCategoryConfig {
  category: PostCategory
  name: string
  description: string
  icon?: string
  color?: string
  isActive: boolean
  sortOrder: number
}

// 포스트 템플릿
export interface PostTemplate {
  id: number
  name: string
  description: string
  category: PostCategory
  template: {
    title: string
    content: string
    tags: string[]
  }
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}
