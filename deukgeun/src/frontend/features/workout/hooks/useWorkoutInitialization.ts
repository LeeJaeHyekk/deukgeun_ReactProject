/**
 * 워크아웃 초기화 관련 훅들
 */

import { useWorkoutPlansActions } from './useWorkoutActions'
import { useWorkoutSessionsActions } from './useWorkoutActions'
import { useWorkoutGoalsActions } from './useWorkoutActions'
import { useWorkoutDashboardActions } from './useWorkoutActions'

/**
 * 워크아웃 데이터 초기화 훅
 */
export function useWorkoutInitialization() {
  const { fetchPlans } = useWorkoutPlansActions()
  const { fetchSessions } = useWorkoutSessionsActions()
  const { fetchGoals } = useWorkoutGoalsActions()
  const { fetchDashboardData } = useWorkoutDashboardActions()

  const initializeWorkoutData = async () => {
    console.log("[useWorkoutInitialization] initializeWorkoutData 호출됨", {
      timestamp: new Date().toISOString(),
      stack: new Error().stack,
    })

    // 인증 토큰 확인
    const token = localStorage.getItem("accessToken")
    console.log("[useWorkoutInitialization] 인증 토큰 확인:", {
      hasToken: !!token,
      tokenPreview: token ? `${token.substring(0, 20)}...` : "없음",
      timestamp: new Date().toISOString(),
    })

    try {
      await Promise.all([
        fetchPlans(),
        fetchSessions(),
        fetchGoals(),
        fetchDashboardData(),
      ])
      console.log("[useWorkoutInitialization] 데이터 초기화 완료")
    } catch (error) {
      console.error("Failed to initialize workout data:", error)
    }
  }

  return { initializeWorkoutData }
}
