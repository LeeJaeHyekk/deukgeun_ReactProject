// ============================================================================
// Admin API Service
// ============================================================================

import { api } from "@shared/api"
import { API_ENDPOINTS } from "@shared/config"
import type {
  SystemStats,
  PerformanceMetrics,
  AdminDashboardData,
  AdminSettings,
} from "../types"

class AdminApiService {
  private static instance: AdminApiService

  private constructor() {}

  static getInstance(): AdminApiService {
    if (!AdminApiService.instance) {
      AdminApiService.instance = new AdminApiService()
    }
    return AdminApiService.instance
  }

  // 시스템 통계 조회
  async getSystemStats(): Promise<SystemStats> {
    try {
      const response = await api.get<SystemStats>(
        `${API_ENDPOINTS.BASE_URL}/admin/stats`
      )

      const responseData = response.data as any
      if (!responseData.success || !responseData.data) {
        throw new Error(responseData.message || "Failed to fetch system stats")
      }

      return responseData.data
    } catch (error) {
      console.error("Failed to fetch system stats:", error)
      // 임시 데이터 반환 (실제로는 에러 처리)
      return {
        totalUsers: 1250,
        activeUsers: 342,
        totalMachines: 45,
        totalPosts: 1234,
        systemLoad: 23.5,
        memoryUsage: 67.2,
        diskUsage: 45.8,
        uptime: 86400, // 24시간
        systemStatus: "healthy",
      }
    }
  }

  // 성능 메트릭 조회
  async getPerformanceMetrics(): Promise<PerformanceMetrics> {
    try {
      const response = await api.get<PerformanceMetrics>(
        `${API_ENDPOINTS.BASE_URL}/admin/performance`
      )

      const responseData = response.data as any
      if (!responseData.success || !responseData.data) {
        throw new Error(
          responseData.message || "Failed to fetch performance metrics"
        )
      }

      return responseData.data
    } catch (error) {
      console.error("Failed to fetch performance metrics:", error)
      // 임시 데이터 반환
      return {
        averageResponseTime: 245.6,
        averageFetchTime: 180.2,
        requestCount: 15420,
        totalRequests: 15420,
        errorRate: 0.8,
        errorCount: 123,
        cacheHitRate: 78.5,
        memoryUsage: 67.2,
        cpuUsage: 23.5,
        serverLoad: 45.2,
        diskUsage: 45.8,
        activeUsers: 342,
      }
    }
  }

  // 관리자 대시보드 데이터 조회
  async getDashboardData(): Promise<AdminDashboardData> {
    try {
      const response = await api.get<AdminDashboardData>(
        `${API_ENDPOINTS.BASE_URL}/admin/dashboard`
      )

      const responseData = response.data as any
      if (!responseData.success || !responseData.data) {
        throw new Error(
          responseData.message || "Failed to fetch dashboard data"
        )
      }

      return responseData.data
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error)
      // 임시 데이터 반환
      return {
        stats: await this.getSystemStats(),
        recentActivities: [
          {
            id: "1",
            type: "user_created",
            description: "새 사용자가 가입했습니다",
            timestamp: new Date(),
            severity: "low",
          },
          {
            id: "2",
            type: "machine_added",
            description: "새 운동 기구가 추가되었습니다",
            timestamp: new Date(Date.now() - 3600000),
            severity: "medium",
          },
        ],
        systemHealth: {
          status: "healthy",
          issues: [],
          lastCheck: new Date(),
        },
      }
    }
  }

  // 관리자 설정 조회
  async getAdminSettings(): Promise<AdminSettings> {
    try {
      const response = await api.get<AdminSettings>(
        `${API_ENDPOINTS.BASE_URL}/admin/settings`
      )

      const responseData = response.data as any
      if (!responseData.success || !responseData.data) {
        throw new Error(
          responseData.message || "Failed to fetch admin settings"
        )
      }

      return responseData.data
    } catch (error) {
      console.error("Failed to fetch admin settings:", error)
      // 기본 설정 반환
      return {
        performanceMonitoring: {
          enabled: true,
          refreshInterval: 30000,
          alertThreshold: 80,
        },
        systemNotifications: {
          email: false,
          slack: false,
          webhook: "",
        },
        security: {
          sessionTimeout: 3600000,
          maxLoginAttempts: 5,
          requireMFA: false,
        },
      }
    }
  }

  // 관리자 설정 업데이트
  async updateAdminSettings(
    settings: Partial<AdminSettings>
  ): Promise<AdminSettings> {
    try {
      const response = await api.put<AdminSettings>(
        `${API_ENDPOINTS.BASE_URL}/admin/settings`,
        settings
      )

      const responseData = response.data as any
      if (!responseData.success || !responseData.data) {
        throw new Error(
          responseData.message || "Failed to update admin settings"
        )
      }

      return responseData.data
    } catch (error) {
      console.error("Failed to update admin settings:", error)
      throw new Error("설정 업데이트에 실패했습니다")
    }
  }

  // 시스템 로그 조회
  async getSystemLogs(limit: number = 100): Promise<any[]> {
    try {
      const response = await api.get(
        `${API_ENDPOINTS.BASE_URL}/admin/logs?limit=${limit}`
      )

      const responseData = response.data as any
      if (!responseData.success || !responseData.data) {
        return []
      }

      return responseData.data as any[]
    } catch (error) {
      console.error("Failed to fetch system logs:", error)
      return []
    }
  }

  // 데이터베이스 백업
  async createDatabaseBackup(): Promise<{
    backupId: string
    downloadUrl: string
  }> {
    try {
      const response = await api.post(`${API_ENDPOINTS.BASE_URL}/admin/backup`)

      const responseData = response.data as any
      if (!responseData.success || !responseData.data) {
        throw new Error(
          responseData.message || "Failed to create database backup"
        )
      }

      return responseData.data as {
        backupId: string
        downloadUrl: string
      }
    } catch (error) {
      console.error("Failed to create database backup:", error)
      throw new Error("데이터베이스 백업 생성에 실패했습니다")
    }
  }

  // 시스템 재시작
  async restartSystem(): Promise<void> {
    try {
      await api.post(`${API_ENDPOINTS.BASE_URL}/admin/restart`)
    } catch (error) {
      console.error("Failed to restart system:", error)
      throw new Error("시스템 재시작에 실패했습니다")
    }
  }

  // 캐시 초기화
  async clearCache(): Promise<void> {
    try {
      await api.post(`${API_ENDPOINTS.BASE_URL}/admin/cache/clear`)
    } catch (error) {
      console.error("Failed to clear cache:", error)
      throw new Error("캐시 초기화에 실패했습니다")
    }
  }

  // 사용자 관리
  async getUsers(page: number = 1, limit: number = 20): Promise<any> {
    try {
      const response = await api.get(
        `${API_ENDPOINTS.BASE_URL}/admin/users?page=${page}&limit=${limit}`
      )

      const responseData = response.data as any
      if (!responseData.success || !responseData.data) {
        return { users: [], total: 0, page: 1, limit: 20 }
      }

      return responseData.data
    } catch (error) {
      console.error("Failed to fetch users:", error)
      return { users: [], total: 0, page: 1, limit: 20 }
    }
  }

  async updateUserRole(userId: string, role: string): Promise<void> {
    try {
      await api.put(`${API_ENDPOINTS.BASE_URL}/admin/users/${userId}/role`, {
        role,
      })
    } catch (error) {
      console.error("Failed to update user role:", error)
      throw new Error("사용자 권한 업데이트에 실패했습니다")
    }
  }

  async deleteUser(userId: string): Promise<void> {
    try {
      await api.delete(`${API_ENDPOINTS.BASE_URL}/admin/users/${userId}`)
    } catch (error) {
      console.error("Failed to delete user:", error)
      throw new Error("사용자 삭제에 실패했습니다")
    }
  }
}

export { AdminApiService }
