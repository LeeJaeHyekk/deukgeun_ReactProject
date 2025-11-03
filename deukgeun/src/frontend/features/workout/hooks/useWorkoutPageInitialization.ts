// ============================================================================
// useWorkoutPageInitialization - 운동 페이지 초기화 Hook
// ============================================================================

import { useEffect } from "react"
import { useDispatch } from "react-redux"
import { useAuthRedux } from "@frontend/shared/hooks/useAuthRedux"
import { fetchGoalsFromBackend, setCompletedWorkouts, setGoals } from "../slices/workoutSlice"
import { loadWorkoutStateFromStorage } from "../slices/workoutPersistenceMiddleware"

/**
 * 운동 페이지 초기화 로직을 담당하는 Hook
 * localStorage와 백엔드 데이터를 병합하여 로드
 */
export function useWorkoutPageInitialization() {
  const dispatch = useDispatch()
  const { isLoggedIn: isAuthenticated, user } = useAuthRedux()

  useEffect(() => {
    if (!isAuthenticated || !user?.id) return

    const initializeData = async () => {
      try {
        // 1. localStorage에서 복원 (빠른 표시, 진행 상태 보존)
        let localStorageGoals: any[] = []
        try {
          const savedState = loadWorkoutStateFromStorage()
          if (savedState) {
            if (savedState.goals && savedState.goals.length > 0) {
              localStorageGoals = savedState.goals
              dispatch(setGoals(savedState.goals))
              console.log(`📥 localStorage에서 ${savedState.goals.length}개 목표 로드 (진행 상태 포함)`, {
                goals: savedState.goals.map((g: any) => ({
                  goalId: g.goalId,
                  title: g.title,
                  totalCompletedSets: g.tasks?.reduce((sum: number, t: any) => sum + (t.completedSets || 0), 0) || 0,
                  tasks: g.tasks?.map((t: any) => ({
                    taskId: t.taskId,
                    name: t.name,
                    completedSets: t.completedSets,
                    setCount: t.setCount
                  }))
                }))
              })
            }
            if (savedState.completedWorkouts && savedState.completedWorkouts.length > 0) {
              dispatch(setCompletedWorkouts(savedState.completedWorkouts))
            }
          }
        } catch (storageError) {
          console.warn("localStorage에서 데이터 로드 실패:", storageError)
          // localStorage 오류는 치명적이지 않으므로 계속 진행
        }

        // 2. 백엔드에서 최신 데이터 불러오기
        // 백엔드 데이터와 localStorage 데이터를 병합하여 진행 상태 보존
        // fetchGoalsFromBackend.fulfilled에서 기존 state.goals를 참조하여 병합
        try {
          // dispatch를 통해 실행되면 fetchGoalsFromBackend.fulfilled에서 기존 state.goals 참조 가능
          // fulfilled에서 기존 state.goals와 병합하므로 여기서는 결과만 기다림
          const backendGoals = await dispatch(fetchGoalsFromBackend(user.id)).unwrap()

          // 3. 백엔드 데이터에서 completedWorkouts 추출
          const allCompletedWorkouts: any[] = []
          if (Array.isArray(backendGoals)) {
            backendGoals.forEach((goal: any) => {
              // 백엔드 원본 데이터에서 추출
              const backendData = goal._backendData
              if (backendData) {
                if (backendData.completedWorkouts && Array.isArray(backendData.completedWorkouts)) {
                  allCompletedWorkouts.push(...backendData.completedWorkouts)
                }
                if (backendData.history && Array.isArray(backendData.history)) {
                  backendData.history.forEach((history: any) => {
                    if (history && history.completedAt) {
                      allCompletedWorkouts.push({
                        completedId: `history_${history.date}_${backendData.goalId}`,
                        goalId: String(backendData.goalId),
                        goalTitle: backendData.goalTitle,
                        completedAt: history.completedAt,
                        totalSets: history.totalSets || 0,
                        totalReps: history.totalReps || 0,
                        expEarned: history.expEarned || 0,
                        durationMin: history.totalDurationMinutes,
                        summary: history.summary,
                      })
                    }
                  })
                }
              }
            })

            if (allCompletedWorkouts.length > 0) {
              dispatch(setCompletedWorkouts(allCompletedWorkouts))
            }
          }
        } catch (apiError: any) {
          console.error("백엔드 데이터 로드 실패:", apiError)
          // API 오류 시 사용자에게 알림
          const errorMessage = apiError?.response?.data?.message || apiError?.message || "데이터를 불러오는데 실패했습니다."
          alert(`데이터 로드 실패: ${errorMessage}`)
        }
      } catch (error: any) {
        console.error("초기 데이터 로드 중 예기치 않은 오류:", error)
        alert("데이터를 불러오는 중 오류가 발생했습니다. 페이지를 새로고침해주세요.")
      }
    }

    initializeData()
  }, [dispatch, isAuthenticated, user?.id])
}

