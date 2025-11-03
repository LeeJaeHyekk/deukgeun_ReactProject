// ============================================================================
// useWorkoutStats Hook - 운동 통계 계산 훅
// ============================================================================

import { useMemo } from "react"
import type { CompletedWorkout } from "@frontend/features/workout/slices/workoutSlice"
import { safeParseNumber, formatNumber } from "../utils/numberUtils"

export interface WorkoutStats {
  totalSessions: number
  totalSets: number
  totalReps: number
  totalExp: number
  thisWeekSessions: number
  thisMonthSessions: number
  thisMonthSets: number
  hasData: boolean
  formatNumber: (num: number) => string
}

const DEFAULT_STATS: WorkoutStats = {
  totalSessions: 0,
  totalSets: 0,
  totalReps: 0,
  totalExp: 0,
  thisWeekSessions: 0,
  thisMonthSessions: 0,
  thisMonthSets: 0,
  hasData: false,
  formatNumber,
}

/**
 * 운동 통계를 계산하는 훅
 */
export function useWorkoutStats(completedWorkouts: CompletedWorkout[]): WorkoutStats {
  return useMemo(() => {
    try {
      // 데이터 유효성 검증
      if (!Array.isArray(completedWorkouts) || completedWorkouts.length === 0) {
        return DEFAULT_STATS
      }

      // 유효한 데이터만 필터링
      const validWorkouts = completedWorkouts.filter((w) => {
        if (!w || typeof w !== 'object') return false
        if (!w.completedAt || typeof w.completedAt !== 'string') return false
        try {
          const date = new Date(w.completedAt)
          return !isNaN(date.getTime())
        } catch {
          return false
        }
      })

      if (validWorkouts.length === 0) {
        return DEFAULT_STATS
      }

      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const startOfWeek = new Date(now)
      startOfWeek.setDate(now.getDate() - now.getDay())
      startOfWeek.setHours(0, 0, 0, 0)

      // 이번 달 완료된 운동 (안전장치 포함)
      const thisMonthWorkouts = validWorkouts.filter((w) => {
        try {
          if (!w?.completedAt) return false
          const completedDate = new Date(w.completedAt)
          if (isNaN(completedDate.getTime())) return false
          return completedDate >= startOfMonth
        } catch {
          return false
        }
      })

      // 이번 주 완료된 운동 (안전장치 포함)
      const thisWeekWorkouts = validWorkouts.filter((w) => {
        try {
          if (!w?.completedAt) return false
          const completedDate = new Date(w.completedAt)
          if (isNaN(completedDate.getTime())) return false
          return completedDate >= startOfWeek
        } catch {
          return false
        }
      })

      // 총 운동 세션 수
      const totalSessions = validWorkouts.length
      const thisMonthSessions = thisMonthWorkouts.length
      const thisWeekSessions = thisWeekWorkouts.length

      // 총 완료한 세트 (타입 검증 포함)
      const totalSets = validWorkouts.reduce((sum, w) => {
        return sum + safeParseNumber(w?.totalSets)
      }, 0)
      
      const thisMonthSets = thisMonthWorkouts.reduce((sum, w) => {
        return sum + safeParseNumber(w?.totalSets)
      }, 0)

      // 총 완료한 반복 (타입 검증 포함)
      const totalReps = validWorkouts.reduce((sum, w) => {
        return sum + safeParseNumber(w?.totalReps)
      }, 0)

      // 총 획득 경험치 (타입 검증 포함)
      const totalExp = validWorkouts.reduce((sum, w) => {
        return sum + safeParseNumber(w?.expEarned)
      }, 0)

      return {
        totalSessions,
        thisMonthSessions,
        thisWeekSessions,
        totalSets,
        thisMonthSets,
        totalReps,
        totalExp,
        formatNumber,
        hasData: true,
      }
    } catch (error) {
      console.error('❌ [useWorkoutStats] 운동 통계 계산 오류:', error)
      return DEFAULT_STATS
    }
  }, [completedWorkouts])
}

