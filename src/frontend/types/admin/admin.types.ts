// ============================================================================
// 관리자 관련 타입 정의
// ============================================================================

export interface AdminUser {
  id: number
  email: string
  nickname: string
  name: string
  role: "user" | "admin" | "moderator"
  status: "active" | "banned" | "suspended"
  isActive: boolean
  isEmailVerified: boolean
  createdAt: Date
  lastLoginAt?: Date
  profileImage?: string
  stats?: {
    totalPosts: number
    totalWorkouts: number
    level: number
    experience: number
  }
}

export interface AdminStats {
  totalUsers: number
  activeUsers: number
  bannedUsers: number
  totalPosts: number
  totalComments: number
  totalGyms: number
  totalMachines: number
  systemUptime: number
  memoryUsage: number
  cpuUsage: number
  diskUsage: number
}

export interface SystemMetrics {
  cpu: {
    usage: number
    cores: number
    loadAverage: number[]
  }
  memory: {
    total: number
    used: number
    free: number
    usage: number
  }
  disk: {
    total: number
    used: number
    free: number
    usage: number
  }
  network: {
    bytesIn: number
    bytesOut: number
    packetsIn: number
    packetsOut: number
  }
  uptime: number
}

export interface AdminLog {
  id: number
  userId: number
  action: string
  resource: string
  resourceId?: number
  details?: any
  ipAddress: string
  userAgent: string
  timestamp: Date
}

export interface AdminSettings {
  general: {
    siteName: string
    siteDescription: string
    maintenanceMode: boolean
    registrationEnabled: boolean
  }
  security: {
    maxLoginAttempts: number
    sessionTimeout: number
    passwordRequirements: {
      minLength: number
      requireUppercase: boolean
      requireLowercase: boolean
      requireNumbers: boolean
      requireSpecialChars: boolean
    }
  }
  features: {
    workoutTracking: boolean
    communityPosts: boolean
    levelSystem: boolean
    notifications: boolean
  }
  limits: {
    maxWorkoutPlans: number
    maxWorkoutSessions: number
    maxPostsPerDay: number
    maxFileSize: number
  }
}

export interface AdminDashboardData {
  overview: {
    totalUsers: number
    activeUsers: number
    newUsersToday: number
    totalPosts: number
    newPostsToday: number
    totalWorkouts: number
    workoutsToday: number
  }
  recentActivity: {
    recentUsers: AdminUser[]
    recentPosts: AdminPost[]
    recentWorkouts: AdminWorkout[]
  }
  systemHealth: {
    status: string
    uptime: number
    lastBackup: Date
    alerts: any[]
  }
}

export interface AdminAlert {
  id: number
  type: "error" | "warning" | "info" | "success"
  title: string
  message: string
  isRead: boolean
  createdAt: Date
  expiresAt?: Date
}

export interface AdminUserFilters {
  role?: string
  status?: string
  search?: string
  page?: number
  limit?: number
}

export interface AdminContentFilters {
  status?: string
  category?: string
  page?: number
  limit?: number
}

export interface AdminLogFilters {
  level?: string
  startDate?: string
  endDate?: string
  page?: number
  limit?: number
}

export interface AdminAction {
  type: string
  payload: any
  timestamp: Date
  userId: number
}

export interface AdminPermission {
  id: number
  name: string
  description: string
  resource: string
  action: string
  conditions?: any
}

export interface AdminRole {
  id: number
  name: string
  description: string
  permissions: AdminPermission[]
  isSystem: boolean
  createdAt: Date
  updatedAt: Date
}

// 추가 타입들
export interface SystemStats {
  totalUsers: number
  activeUsers: number
  totalPosts: number
  totalComments: number
  totalMachines: number
  systemUptime: number
  memoryUsage: number
  cpuUsage: number
  diskUsage: number
}

export interface PerformanceMetrics {
  responseTime: {
    average: number
    min: number
    max: number
  }
  throughput: {
    requestsPerSecond: number
    requestsPerMinute: number
  }
  errorRate: {
    percentage: number
    count: number
  }
  availability: number
  memory: {
    used: number
    total: number
    percentage: number
  }
  cpu: {
    used: number
    total: number
    percentage: number
  }
  databasePerformance: {
    queryTime: number
    connectionPool: number
    slowQueries: number
  }
  cacheHitRate: number
}

export interface AdminPost {
  id: number
  title: string
  content: string
  author: AdminUser
  status: "published" | "draft" | "archived"
  createdAt: Date
  updatedAt: Date
}

export interface AdminWorkout {
  id: number
  name: string
  user: AdminUser
  duration: number
  exercises: any[]
  createdAt: Date
  updatedAt: Date
}

export interface AdminApiResponse<T = any> {
  success: boolean
  data: T
  message?: string
  error?: string
}

export interface AdminListResponse<T = any> {
  success: boolean
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  message?: string
}

export interface UpdateUserRequest {
  id: number
  email?: string
  nickname?: string
  role?: string
  status?: string
}

export interface BanUserRequest {
  userId: number
  reason: string
  duration?: number
}

export interface UpdateSettingsRequest {
  general?: Partial<AdminSettings['general']>
  security?: Partial<AdminSettings['security']>
  features?: Partial<AdminSettings['features']>
  limits?: Partial<AdminSettings['limits']>
}
