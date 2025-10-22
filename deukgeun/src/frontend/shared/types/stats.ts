export interface UserStats {
  username: string
  level: number
  totalExp: number
  posts: number
}

export interface PlatformStats {
  totalUsers: number
  totalPosts: number
  totalGyms: number
  lastUpdated: string
}

export interface DetailedStats {
  weeklyStats: {
    posts: number
    views: number
    likes: number
  }
  monthlyStats: {
    posts: number
    views: number
    likes: number
  }
  topCategories: Array<{
    name: string
    count: number
  }>
}
