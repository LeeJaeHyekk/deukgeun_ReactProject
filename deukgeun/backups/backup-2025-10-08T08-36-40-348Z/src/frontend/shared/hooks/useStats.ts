import { useState, useEffect } from "react"
import {
  statsApi,
  PlatformStats,
  UserStats,
  DEFAULT_PLATFORM_STATS,
  DEFAULT_USER_STATS,
} from "../api/statsApi"
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
      // 오류 발생 시 기본값 사용
      setStats(DEFAULT_PLATFORM_STATS)
      setError(null) // 오류 메시지 제거
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
      // 오류 발생 시 기본값 사용
      setUserStats(DEFAULT_USER_STATS)
      setError(null) // 오류 메시지 제거
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
