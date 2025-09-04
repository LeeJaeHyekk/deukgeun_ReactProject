// 프론트엔드 전용 useStats 훅

import { useState, useEffect, useCallback } from "react"
import type {
  PlatformStats,
  UserStats,
  WorkoutStats,
  StatsPeriod,
} from "../types/stats"

// 임시 통계 API 래퍼 (실제 구현 시 백엔드 API로 교체)
const statsApiWrapper = {
  async getPlatformStats(): Promise<PlatformStats> {
    // 임시 구현 - 실제로는 백엔드 API 호출
    return {
      activeUsers: 150,
      totalGyms: 45,
      totalPosts: 320,
      achievements: 25,
      totalWorkouts: 1250,
      totalSessions: 3200,
      averageWorkoutDuration: 45,
      mostPopularMachine: "벤치프레스",
      mostActiveTime: "19:00-21:00",
      lastUpdated: new Date(),
    }
  },

  async getUserStats(userId: string, period: StatsPeriod): Promise<UserStats> {
    // 임시 구현 - 실제로는 백엔드 API 호출
    return {
      userId,
      totalWorkouts: 25,
      totalSessions: 45,
      totalDuration: 1800,
      averageWorkoutDuration: 40,
      favoriteMachine: "벤치프레스",
      workoutStreak: 7,
      longestStreak: 15,
      totalCalories: 12500,
      averageCalories: 500,
      level: 3,
      experience: 250,
      achievements: [],
      lastWorkout: new Date(),
      lastUpdated: new Date(),
    }
  },

  async getWorkoutStats(
    userId: string,
    period: StatsPeriod
  ): Promise<WorkoutStats> {
    // 임시 구현 - 실제로는 백엔드 API 호출
    return {
      userId,
      period,
      totalWorkouts: 25,
      totalSessions: 45,
      totalDuration: 1800,
      averageWorkoutDuration: 40,
      totalCalories: 12500,
      averageCalories: 500,
      favoriteMachines: [],
      workoutFrequency: [],
      progressTrend: [],
      lastUpdated: new Date(),
    }
  },
}

export function useStats() {
  const [platformStats, setPlatformStats] = useState<PlatformStats | null>(null)
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [workoutStats, setWorkoutStats] = useState<WorkoutStats | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // 플랫폼 통계 로드
  const loadPlatformStats = useCallback(async () => {
    try {
      setIsLoading(true)
      const stats = await statsApiWrapper.getPlatformStats()
      setPlatformStats(stats)
    } catch (error) {
      console.error("플랫폼 통계 로드 실패:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // 사용자 통계 로드
  const loadUserStats = useCallback(
    async (userId: string, period: StatsPeriod = "month") => {
      try {
        setIsLoading(true)
        const stats = await statsApiWrapper.getUserStats(userId, period)
        setUserStats(stats)
      } catch (error) {
        console.error("사용자 통계 로드 실패:", error)
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  // 운동 통계 로드
  const loadWorkoutStats = useCallback(
    async (userId: string, period: StatsPeriod = "month") => {
      try {
        setIsLoading(true)
        const stats = await statsApiWrapper.getWorkoutStats(userId, period)
        setWorkoutStats(stats)
      } catch (error) {
        console.error("운동 통계 로드 실패:", error)
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  // 통합 통계 로드
  const loadAllStats = useCallback(
    async (userId: string, period: StatsPeriod = "month") => {
      try {
        setIsLoading(true)
        await Promise.all([
          loadPlatformStats(),
          loadUserStats(userId, period),
          loadWorkoutStats(userId, period),
        ])
      } catch (error) {
        console.error("통계 로드 실패:", error)
      } finally {
        setIsLoading(false)
      }
    },
    [loadPlatformStats, loadUserStats, loadWorkoutStats]
  )

  // 초기 플랫폼 통계 로드
  useEffect(() => {
    loadPlatformStats()
  }, [loadPlatformStats])

  return {
    stats: platformStats,
    userStats,
    workoutStats,
    isLoading,
    loadPlatformStats,
    loadUserStats,
    loadWorkoutStats,
    loadAllStats,
  }
}
