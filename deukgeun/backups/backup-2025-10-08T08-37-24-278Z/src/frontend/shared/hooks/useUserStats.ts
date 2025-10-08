import { useState, useEffect } from "react"
import { apiClient } from "../../../shared/api/client"
import { useAuth } from "./useAuth"

export interface UserStats {
  user: {
    id: number
    nickname: string
    email: string
    createdAt: string
  }
  level: {
    level: number
    currentExp: number
    totalExp: number
  } | null
  posts: {
    count: number
    totalLikes: number
  }
  workout: {
    totalDays: number
    consecutiveDays: number
    totalPosts: number
  }
  achievements: any[]
}

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
      const response = await apiClient.get("/api/stats/user")
      setUserStats((response.data as any).data as any)
    } catch (err) {
      console.error("사용자 통계 조회 오류:", err)
      setError("사용자 통계를 불러오는데 실패했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchUserStats()
    } else {
      setIsLoading(false)
    }
  }, [user])

  return {
    userStats,
    isLoading,
    error,
    refetch: fetchUserStats,
  }
}
