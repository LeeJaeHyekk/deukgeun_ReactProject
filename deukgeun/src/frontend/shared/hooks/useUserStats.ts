import { useState, useEffect } from 'react'
import { typedApiClient } from '../../../shared/api/client'
import { useAuthRedux } from './useAuthRedux'
import { isValidUserData } from '../../../shared/utils/apiValidation'

export interface Achievement {
  id: number
  name: string
  description: string
  iconUrl?: string
  unlockedAt: string
  category: 'workout' | 'social' | 'streak' | 'level'
}

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
  achievements: Achievement[]
}

// ApiResponse 타입은 이미 apiValidation에서 정의됨

export const useUserStats = () => {
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuthRedux()

  const fetchUserStats = async () => {
    if (!user) {
      setError("로그인이 필요합니다.")
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      const response = await typedApiClient.get<UserStats>("/api/stats/user")
      setUserStats(response as UserStats)
    } catch (err: unknown) {
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
