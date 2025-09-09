// ============================================================================
// Admin API 서비스 - 타입 안전성 보장
// ============================================================================

import { api } from "../../../shared/lib/api-client"
import { API_ENDPOINTS } from "../../../shared/config/apiEndpoints"
import type {
  SystemStats,
  PerformanceMetrics,
  AdminDashboardData,
  AdminSettings,
  AdminUser,
  AdminPost,
  AdminWorkout,
  AdminApiResponse,
  AdminListResponse,
  UpdateUserRequest,
  BanUserRequest,
  UpdateSettingsRequest,
} from "../../../shared/types/admin/admin.types"

// Mock data for development
const mockSystemStats: SystemStats = {
  totalUsers: 1250,
  activeUsers: 89,
  totalMachines: 45,
  totalPosts: 567,
  totalGyms: 12,
  systemUptime: 86400,
  memoryUsage: 75,
  diskUsage: 60,
  cpuUsage: 45,
  networkTraffic: {
    incoming: 1024,
    outgoing: 512,
  },
}

const mockPerformanceMetrics: PerformanceMetrics = {
  responseTime: {
    average: 150,
    min: 50,
    max: 500,
  },
  throughput: {
    requestsPerSecond: 120,
    requestsPerMinute: 7200,
  },
  errorRate: {
    percentage: 0.5,
    count: 12,
  },
  databasePerformance: {
    queryTime: 25,
    connectionPool: 45,
    slowQueries: 3,
  },
  cacheHitRate: 85,
  availability: 99.9,
  memory: {
    used: 75,
    total: 100,
    percentage: 75,
  },
  cpu: {
    used: 45,
    total: 100,
    percentage: 45,
  },
}

const mockAdminDashboardData: AdminDashboardData = {
  overview: {
    totalUsers: 1250,
    activeUsers: 89,
    newUsersToday: 12,
    totalPosts: 567,
    newPostsToday: 8,
    totalWorkouts: 2340,
    workoutsToday: 156,
  },
  recentActivity: {
    recentUsers: [],
    recentPosts: [],
    recentWorkouts: [],
  },
  systemHealth: {
    status: "healthy",
    uptime: 86400,
    lastBackup: new Date(),
    alerts: [],
  },
}

const mockAdminSettings: AdminSettings = {
  general: {
    siteName: "Deukgeun Fitness",
    siteDescription: "AI 기반 개인 맞춤형 운동 관리 플랫폼",
    maintenanceMode: false,
    registrationEnabled: true,
  },
  security: {
    maxLoginAttempts: 5,
    sessionTimeout: 3600,
    passwordRequirements: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
    },
  },
  features: {
    workoutTracking: true,
    communityPosts: true,
    levelSystem: true,
    notifications: true,
  },
  limits: {
    maxWorkoutPlans: 10,
    maxWorkoutSessions: 100,
    maxPostsPerDay: 5,
    maxFileSize: 10485760,
  },
}

export class AdminApiService {
  // 시스템 통계 조회
  static async getSystemStats(): Promise<SystemStats> {
    try {
      await api.get<AdminApiResponse<SystemStats>>(
        API_ENDPOINTS.ADMIN.SYSTEM.STATS
      )
      // Mock data 반환 (개발 환경)
      return mockSystemStats
    } catch (error) {
      console.error("Failed to fetch system stats:", error)
      // Mock data 반환
      return mockSystemStats
    }
  }

  // 성능 메트릭 조회
  static async getPerformanceMetrics(): Promise<PerformanceMetrics> {
    try {
      await api.get<AdminApiResponse<PerformanceMetrics>>(
        API_ENDPOINTS.ADMIN.SYSTEM.PERFORMANCE
      )
      // Mock data 반환 (개발 환경)
      return mockPerformanceMetrics
    } catch (error) {
      console.error("Failed to fetch performance metrics:", error)
      // Mock data 반환
      return mockPerformanceMetrics
    }
  }

  // 관리자 대시보드 데이터 조회
  static async getAdminDashboardData(): Promise<AdminDashboardData> {
    try {
      await api.get<AdminApiResponse<AdminDashboardData>>(
        API_ENDPOINTS.ADMIN.DASHBOARD
      )
      // Mock data 반환 (개발 환경)
      return mockAdminDashboardData
    } catch (error) {
      console.error("Failed to fetch admin dashboard data:", error)
      // Mock data 반환
      return mockAdminDashboardData
    }
  }

  // 관리자 설정 조회
  static async getAdminSettings(): Promise<AdminSettings> {
    try {
      await api.get<AdminApiResponse<AdminSettings>>(
        API_ENDPOINTS.ADMIN.SYSTEM.SETTINGS
      )
      // Mock data 반환 (개발 환경)
      return mockAdminSettings
    } catch (error) {
      console.error("Failed to fetch admin settings:", error)
      // Mock data 반환
      return mockAdminSettings
    }
  }

  // 관리자 설정 업데이트
  static async updateAdminSettings(
    settings: UpdateSettingsRequest
  ): Promise<AdminSettings> {
    try {
      await api.put<AdminApiResponse<AdminSettings>>(
        API_ENDPOINTS.ADMIN.SYSTEM.SETTINGS,
        settings
      )
      // Mock data 반환 (개발 환경)
      return mockAdminSettings
    } catch (error) {
      console.error("Failed to update admin settings:", error)
      throw new Error("Failed to update admin settings")
    }
  }

  // 사용자 목록 조회
  static async getUsers(params?: {
    page?: number
    limit?: number
    search?: string
    role?: string
    status?: string
  }): Promise<AdminListResponse<AdminUser>> {
    try {
      await api.get<AdminListResponse<AdminUser>>(
        API_ENDPOINTS.ADMIN.USERS.LIST,
        { params }
      )
      // Mock data 반환 (개발 환경)
      return {
        success: true,
        data: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 1,
        },
      }
    } catch (error) {
      console.error("Failed to fetch users:", error)
      throw new Error("Failed to fetch users")
    }
  }

  // 사용자 정보 업데이트
  static async updateUser(request: UpdateUserRequest): Promise<AdminUser> {
    try {
      await api.put<AdminApiResponse<AdminUser>>(
        API_ENDPOINTS.ADMIN.USERS.UPDATE,
        request
      )
      // Mock data 반환 (개발 환경)
      return {
        id: Number(request.id),
        email: "test@example.com",
        nickname: "Test User",
        name: "Test User",
        role: "user" as const,
        isActive: true,
        isEmailVerified: true,
        status: "active" as const,
        stats: {
          totalPosts: 0,
          totalWorkouts: 0,
          level: 1,
          experience: 0,
        },
        createdAt: new Date(),
      }
    } catch (error) {
      console.error("Failed to update user:", error)
      throw new Error("Failed to update user")
    }
  }

  // 사용자 차단
  static async banUser(request: BanUserRequest): Promise<void> {
    try {
      await api.post(API_ENDPOINTS.ADMIN.USERS.BAN, request)
    } catch (error) {
      console.error("Failed to ban user:", error)
      throw new Error("Failed to ban user")
    }
  }

  // 게시글 목록 조회
  static async getPosts(params?: {
    page?: number
    limit?: number
    status?: string
    category?: string
  }): Promise<AdminListResponse<AdminPost>> {
    try {
      await api.get<AdminListResponse<AdminPost>>(
        API_ENDPOINTS.ADMIN.CONTENT.POSTS,
        { params }
      )
      // Mock data 반환 (개발 환경)
      return {
        success: true,
        data: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 1,
        },
      }
    } catch (error) {
      console.error("Failed to fetch posts:", error)
      throw new Error("Failed to fetch posts")
    }
  }

  // 게시글 상태 변경
  static async updatePostStatus(
    postId: number,
    status: string
  ): Promise<AdminPost> {
    try {
      await api.patch<AdminApiResponse<AdminPost>>(
        `${API_ENDPOINTS.ADMIN.CONTENT.POSTS}/${postId}/status`,
        { status }
      )
      // Mock data 반환 (개발 환경)
      return {
        id: postId,
        title: "Test Post",
        content: "Test content",
        author: {
          id: 1,
          nickname: "Test Author",
          email: "author@example.com",
        },
        category: "general",
        status: status as "published" | "draft" | "hidden" | "reported",
        likesCount: 0,
        commentsCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    } catch (error) {
      console.error("Failed to update post status:", error)
      throw new Error("Failed to update post status")
    }
  }

  // 운동 데이터 조회
  static async getWorkouts(params?: {
    page?: number
    limit?: number
    type?: string
    status?: string
  }): Promise<AdminListResponse<AdminWorkout>> {
    try {
      await api.get<AdminListResponse<AdminWorkout>>(
        `${API_ENDPOINTS.ADMIN.DASHBOARD}/workouts`,
        { params }
      )
      // Mock data 반환 (개발 환경)
      return {
        success: true,
        data: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 1,
        },
      }
    } catch (error) {
      console.error("Failed to fetch workouts:", error)
      throw new Error("Failed to fetch workouts")
    }
  }

  // 데이터베이스 백업 생성
  static async createDatabaseBackup(): Promise<{
    backupId: string
    filename: string
    size: number
    createdAt: Date
  }> {
    try {
      await api.post<
        AdminApiResponse<{
          backupId: string
          filename: string
          size: number
          createdAt: Date
        }>
      >(`${API_ENDPOINTS.ADMIN.SYSTEM.STATS}/backup`)
      // Mock data 반환 (개발 환경)
      return {
        backupId: "backup_123",
        filename: "backup_2025_09_03.sql",
        size: 1024 * 1024,
        createdAt: new Date(),
      }
    } catch (error) {
      console.error("Failed to create database backup:", error)
      throw new Error("Failed to create database backup")
    }
  }

  // 시스템 로그 조회
  static async getSystemLogs(params?: {
    page?: number
    limit?: number
    level?: string
    startDate?: string
    endDate?: string
  }): Promise<AdminListResponse<any>> {
    try {
      await api.get<AdminListResponse<any>>(
        API_ENDPOINTS.ADMIN.SYSTEM.LOGS,
        { params }
      )
      // Mock data 반환 (개발 환경)
      return {
        success: true,
        data: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 1,
        },
      }
    } catch (error) {
      console.error("Failed to fetch system logs:", error)
      throw new Error("Failed to fetch system logs")
    }
  }
}
