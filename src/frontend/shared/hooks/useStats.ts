// ============================================================================
// Frontend 통계 훅
// ============================================================================

import { useState, useEffect, useCallback } from "react"
import { api } from "../lib/api-client"

interface Stats {
  activeUsers: number
  totalGyms: number
  totalPosts: number
  achievements: number
}

interface UseStatsReturn {
  stats: Stats | null
  isLoading: boolean
  error: string | null
  refreshStats: () => Promise<void>
}

export function useStats(): UseStatsReturn {
  const [stats, setStats] = useState<Stats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await api.get("/api/stats/dashboard")
      const data = response.data

      if (data.success && data.data) {
        setStats(data.data)
      } else {
        throw new Error(data.message || "통계 정보를 가져올 수 없습니다")
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "통계 정보를 가져오는데 실패했습니다"
      setError(errorMessage)
      console.error("통계 정보 조회 실패:", err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const refreshStats = useCallback(async () => {
    await fetchStats()
  }, [fetchStats])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  return {
    stats,
    isLoading,
    error,
    refreshStats,
  }
}
