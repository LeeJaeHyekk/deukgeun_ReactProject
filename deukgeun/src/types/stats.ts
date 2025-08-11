// ============================================================================
// 통계 관련 타입
// ============================================================================

export interface PlatformStats {
  activeUsers: number
  totalGyms: number
  totalPosts: number
  achievements: number
}

export interface MonthlyUserStats {
  month: string
  count: number
}

export interface GymDistributionStats {
  district: string
  count: number
}

export interface LevelDistributionStats {
  level: number
  count: number
}

export interface DetailedStats {
  monthlyUsers: MonthlyUserStats[]
  gymDistribution: GymDistributionStats[]
  levelDistribution: LevelDistributionStats[]
}

// ============================================================================
// 검색 및 필터 관련 타입
// ============================================================================
export interface SearchParams {
  query?: string
  category?: string
  difficulty?: string
  location?: {
    latitude: number
    longitude: number
    radius?: number
  }
}

export interface FilterOptions {
  category?: string[]
  difficulty?: string[]
  priceRange?: {
    min: number
    max: number
  }
  facilities?: string[]
}

// ============================================================================
// 크롤링 관련 타입
// ============================================================================
export interface CrawlerResult {
  success: boolean
  data?: unknown
  error?: string
  count?: number
}
