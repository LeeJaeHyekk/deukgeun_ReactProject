// ============================================================================
// useUserExp Hook - 사용자 경험치 계산 훅
// ============================================================================

import { useMemo } from "react"
import type { LevelProgress } from "@frontend/shared/api/levelApi"
import type { CompletedWorkout } from "@frontend/features/workout/slices/workoutSlice"
import { safeParseNumber } from "../utils/numberUtils"

/**
 * 사용자 총 경험치를 계산하는 훅
 * 우선순위: 1) useLevel hook의 API 데이터 (백엔드에서 모든 경험치 합산), 2) 운동 완료 경험치 합계 (fallback)
 */
export function useUserExp(
  levelProgress: LevelProgress | null,
  completedWorkouts: CompletedWorkout[]
): number {
  return useMemo(() => {
    try {
      // 1. useLevel hook에서 가져온 totalExp (백엔드 API 데이터 - 모든 경험치 합산) - 가장 정확
      if (levelProgress && 
          typeof levelProgress.totalExp === 'number' && 
          levelProgress.totalExp !== undefined && 
          levelProgress.totalExp !== null && 
          !isNaN(levelProgress.totalExp)) {
        return Math.max(0, Math.floor(levelProgress.totalExp))
      }
      
      // 2. 운동 완료로 획득한 경험치 합계 (fallback - 운동 관련 경험치만)
      if (Array.isArray(completedWorkouts) && completedWorkouts.length > 0) {
        const workoutExp = completedWorkouts.reduce(
          (sum, w) => sum + safeParseNumber(w?.expEarned),
          0
        )
        return Math.max(0, Math.floor(workoutExp))
      }
      
      return 0
    } catch (error) {
      console.error('❌ [useUserExp] 경험치 계산 오류:', error)
      return 0
    }
  }, [levelProgress, completedWorkouts])
}

