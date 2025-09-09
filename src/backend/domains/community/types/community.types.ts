export interface CommunityStats {
  totalPosts: number
  totalComments: number
  totalLikes: number
  activeUsers: number
}

export interface PostFilter {
  category?: string
  author?: string
  dateFrom?: Date
  dateTo?: Date
  tags?: string[]
}

export interface CommentFilter {
  postId?: number
  author?: string
  dateFrom?: Date
  dateTo?: Date
}
