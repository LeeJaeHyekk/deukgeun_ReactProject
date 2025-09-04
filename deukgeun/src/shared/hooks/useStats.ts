import { useState, useEffect } from "react"
import { statsApi, type PlatformStats, type UserStats } from "../api/statsApi"
import { showToast } from "../lib"
import { useAuth } from "./useAuth"

// 기본 통계값
const DEFAULT_PLATFORM_STATS: PlatformStats = {
  totalUsers: 0,
  totalWorkouts: 0,
  totalSessions: 0,
  totalGoals: 0,
  averageLevel: 1,
  averageExperience: 0,
  activeUsers: 0,
  newUsersThisWeek: 0,
  totalGyms: 0,
  totalMachines: 0,
}

const DEFAULT_USER_STATS: UserStats = {
  userId: "",
  totalWorkouts: 0,
  totalSessions: 0,
  totalGoals: 0,
  completedGoals: 0,
  currentStreak: 0,
  totalExperience: 0,
  currentLevel: 1,
  averageWorkoutDuration: 0,
  favoriteMachine: "",
  workoutHistory: [],
}

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
      const data = await statsApi.getUserStats(user.id)
      setUserStats(data as unknown as UserStats)
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
