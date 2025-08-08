import { useState, useEffect } from "react"
import { statsApi, PlatformStats, UserStats } from "../api/statsApi"
import { showToast } from "../lib"
import { useAuth } from "./useAuth"

export const useStats = () => {
  const [stats, setStats] = useState<PlatformStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await statsApi.getPlatformStats()
      setStats(data)
    } catch (err) {
      console.error("통계 조회 오류:", err)
      setError("통계를 불러오는데 실패했습니다.")
      showToast("통계 조회에 실패했습니다.", "error")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  return {
    stats,
    isLoading,
    error,
    refetch: fetchStats,
  }
}

// 사용자 개인 통계 훅
export const useUserStats = () => {
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  const fetchUserStats = async () => {
    if (!user) {
      setError("로그인이 필요합니다.")
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      const data = await statsApi.getUserStats()
      setUserStats(data)
    } catch (err) {
      console.error("사용자 통계 조회 오류:", err)
      setError("사용자 통계를 불러오는데 실패했습니다.")
      showToast("사용자 통계 조회에 실패했습니다.", "error")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchUserStats()
    }
  }, [user])

  return {
    userStats,
    isLoading,
    error,
    refetch: fetchUserStats,
  }
}
