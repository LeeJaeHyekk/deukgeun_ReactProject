// ============================================================================
// Admin Hook
// ============================================================================

import { useState, useCallback, useEffect, useMemo } from "react"
import { AdminApiService } from "../services/adminApi"
import type {
  SystemStats,
  PerformanceMetrics,
  AdminDashboardData,
  AdminSettings,
} from "../../../types/admin/admin.types"
import { logAdminAction } from "../utils/adminUtils"

export const useAdmin = () => {
  const [stats, setStats] = useState<SystemStats | null>(null)
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null)
  const [dashboardData, setDashboardData] = useState<AdminDashboardData | null>(
    null
  )
  const [settings, setSettings] = useState<AdminSettings | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 시스템 통계 조회
  const fetchSystemStats = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await AdminApiService.getSystemStats()
      setStats(data)
      logAdminAction("fetch_system_stats", { success: true })
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "시스템 통계 조회 실패"
      setError(errorMessage)
      logAdminAction("fetch_system_stats", {
        success: false,
        error: errorMessage,
      })
    } finally {
      setLoading(false)
    }
  }, [])

  // 성능 메트릭 조회
  const fetchPerformanceMetrics = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await AdminApiService.getPerformanceMetrics()
      setMetrics(data)
      logAdminAction("fetch_performance_metrics", { success: true })
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "성능 메트릭 조회 실패"
      setError(errorMessage)
      logAdminAction("fetch_performance_metrics", {
        success: false,
        error: errorMessage,
      })
    } finally {
      setLoading(false)
    }
  }, [])

  // 대시보드 데이터 조회
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await AdminApiService.getAdminDashboardData()
      setDashboardData(data)
      logAdminAction("fetch_dashboard_data", { success: true })
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "대시보드 데이터 조회 실패"
      setError(errorMessage)
      logAdminAction("fetch_dashboard_data", {
        success: false,
        error: errorMessage,
      })
    } finally {
      setLoading(false)
    }
  }, [])

  // 관리자 설정 조회
  const fetchAdminSettings = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await AdminApiService.getAdminSettings()
      setSettings(data)
      logAdminAction("fetch_admin_settings", { success: true })
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "관리자 설정 조회 실패"
      setError(errorMessage)
      logAdminAction("fetch_admin_settings", {
        success: false,
        error: errorMessage,
      })
    } finally {
      setLoading(false)
    }
  }, [])

  // 관리자 설정 업데이트
  const updateAdminSettings = useCallback(
    async (newSettings: Partial<AdminSettings>) => {
      try {
        setLoading(true)
        setError(null)
        const data = await AdminApiService.updateAdminSettings(newSettings)
        setSettings(data)
        logAdminAction("update_admin_settings", {
          success: true,
          settingsChanged: Object.keys(newSettings),
        })
        return data
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "관리자 설정 업데이트 실패"
        setError(errorMessage)
        logAdminAction("update_admin_settings", {
          success: false,
          error: errorMessage,
        })
        throw err
      } finally {
        setLoading(false)
      }
    },
    []
  )

  // 캐시 클리어 (임시 구현)
  const clearCache = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      // AdminApiService에 clearCache 메서드가 없으므로 임시로 처리
      console.log("Cache cleared (mock implementation)")
      logAdminAction("clear_cache", { success: true })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "캐시 클리어 실패"
      setError(errorMessage)
      logAdminAction("clear_cache", { success: false, error: errorMessage })
    } finally {
      setLoading(false)
    }
  }, [])

  // 시스템 재시작 (임시 구현)
  const restartSystem = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      // AdminApiService에 restartSystem 메서드가 없으므로 임시로 처리
      console.log("System restart initiated (mock implementation)")
      logAdminAction("restart_system", { success: true })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "시스템 재시작 실패"
      setError(errorMessage)
      logAdminAction("restart_system", { success: false, error: errorMessage })
    } finally {
      setLoading(false)
    }
  }, [])

  // 데이터베이스 백업
  const createBackup = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await AdminApiService.createDatabaseBackup()
      logAdminAction("create_backup", {
        success: true,
        backupId: result.backupId,
      })
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "백업 생성 실패"
      setError(errorMessage)
      logAdminAction("create_backup", { success: false, error: errorMessage })
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // 에러 초기화
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // 초기 데이터 로드
  useEffect(() => {
    fetchSystemStats()
    fetchPerformanceMetrics()
    fetchDashboardData()
    fetchAdminSettings()
  }, [
    fetchSystemStats,
    fetchPerformanceMetrics,
    fetchDashboardData,
    fetchAdminSettings,
  ])

  return {
    // 상태
    stats,
    metrics,
    dashboardData,
    settings,
    loading,
    error,

    // 액션
    fetchSystemStats,
    fetchPerformanceMetrics,
    fetchDashboardData,
    fetchAdminSettings,
    updateAdminSettings,
    clearCache,
    restartSystem,
    createBackup,
    clearError,
  }
}
