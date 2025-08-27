import { useCallback } from "react"
import { useWorkoutStore } from "../store/workoutStore"
import type {
  WorkoutPlan,
  WorkoutSession,
  WorkoutGoal,
  CreatePlanRequest,
  UpdatePlanRequest,
  CreateSessionRequest,
  UpdateSessionRequest,
  CreateGoalRequest,
  UpdateGoalRequest,
  TabType,
  DashboardData,
} from "../types"
import { WorkoutStoreState } from "../store/workoutStore"

// 로깅 유틸리티
const logger = {
  info: (message: string, data?: any) => {
    if (import.meta.env.DEV) {
      console.log(`[useWorkoutStore] ${message}`, data || "")
    }
  },
  debug: (message: string, data?: any) => {
    if (import.meta.env.DEV) {
      console.debug(`[useWorkoutStore] ${message}`, data || "")
    }
  },
  warn: (message: string, data?: any) => {
    console.warn(`[useWorkoutStore] ${message}`, data || "")
  },
  error: (message: string, data?: any) => {
    console.error(`[useWorkoutStore] ${message}`, data || "")
  },
}

// ============================================================================
// Zustand Store-based Hooks
// ============================================================================

export function useWorkoutStoreData() {
  const {
    plans,
    sessions,
    goals,
    dashboardData,
    loading,
    activeTab,
    modals,
    currentPlan,
    currentSession,
    currentGoal,
    tabStates,
    sharedState,
  } = useWorkoutStore()

  return {
    plans,
    sessions,
    goals,
    dashboardData,
    loading,
    activeTab,
    modals,
    currentPlan,
    currentSession,
    currentGoal,
    tabStates,
    sharedState,
  }
}

export function useWorkoutPlansActions() {
  const {
    fetchPlans,
    createPlan,
    updatePlan,
    deletePlan,
    addPlanExercise,
    removePlanExercise,
    updatePlanExercise,
    updateSharedState,
    addNotification,
  } = useWorkoutStore()

  const handleCreatePlan = useCallback(
    async (planData: CreatePlanRequest) => {
      logger.info("계획 생성 시작", { planData })
      try {
        const newPlan = await createPlan(planData)
        logger.info("계획 생성 성공", { newPlan })

        // 공유 상태 업데이트
        updateSharedState({ lastUpdatedPlan: newPlan })
        addNotification({
          type: "success",
          message: "운동 계획이 성공적으로 생성되었습니다.",
        })

        return newPlan
      } catch (error) {
        logger.error("계획 생성 실패", error)
        addNotification({
          type: "error",
          message: "운동 계획 생성에 실패했습니다.",
        })
        throw error
      }
    },
    [createPlan, updateSharedState, addNotification]
  )

  const handleUpdatePlan = useCallback(
    async (planId: number, planData: UpdatePlanRequest) => {
      try {
        const updatedPlan = await updatePlan(planId, planData)
        console.log(
          "✅ [useWorkoutPlansActions] 계획 업데이트 성공:",
          updatedPlan
        )

        // 공유 상태 업데이트
        updateSharedState({ lastUpdatedPlan: updatedPlan })
        addNotification({
          type: "success",
          message: "운동 계획이 성공적으로 수정되었습니다.",
        })

        return updatedPlan
      } catch (error) {
        console.error("❌ [useWorkoutPlansActions] 계획 업데이트 실패:", error)
        addNotification({
          type: "error",
          message: "운동 계획 수정에 실패했습니다.",
        })
        throw error
      }
    },
    [updatePlan, updateSharedState, addNotification]
  )

  const handleDeletePlan = useCallback(
    async (planId: number) => {
      try {
        await deletePlan(planId)
        console.log("✅ [useWorkoutPlansActions] 계획 삭제 성공:", planId)

        addNotification({
          type: "success",
          message: "운동 계획이 성공적으로 삭제되었습니다.",
        })
      } catch (error) {
        console.error("❌ [useWorkoutPlansActions] 계획 삭제 실패:", error)
        addNotification({
          type: "error",
          message: "운동 계획 삭제에 실패했습니다.",
        })
        throw error
      }
    },
    [deletePlan, addNotification]
  )

  return {
    fetchPlans,
    createPlan: handleCreatePlan,
    updatePlan: handleUpdatePlan,
    deletePlan: handleDeletePlan,
    addPlanExercise,
    removePlanExercise,
    updatePlanExercise,
  }
}

export function useWorkoutSessionsActions() {
  const {
    fetchSessions,
    createSession,
    updateSession,
    deleteSession,
    addSessionExercise,
    removeSessionExercise,
    updateSessionExercise,
    updateSharedState,
    addNotification,
  } = useWorkoutStore()

  const handleCreateSession = useCallback(
    async (sessionData: CreateSessionRequest) => {
      try {
        const newSession = await createSession(sessionData)
        console.log(
          "✅ [useWorkoutSessionsActions] 세션 생성 성공:",
          newSession
        )

        // 공유 상태 업데이트
        updateSharedState({ lastUpdatedSession: newSession })
        addNotification({
          type: "success",
          message: "운동 세션이 성공적으로 생성되었습니다.",
        })

        return newSession
      } catch (error) {
        console.error("❌ [useWorkoutSessionsActions] 세션 생성 실패:", error)
        addNotification({
          type: "error",
          message: "운동 세션 생성에 실패했습니다.",
        })
        throw error
      }
    },
    [createSession, updateSharedState, addNotification]
  )

  const handleUpdateSession = useCallback(
    async (sessionId: number, sessionData: UpdateSessionRequest) => {
      try {
        const updatedSession = await updateSession(sessionId, sessionData)
        console.log(
          "✅ [useWorkoutSessionsActions] 세션 업데이트 성공:",
          updatedSession
        )

        // 공유 상태 업데이트
        updateSharedState({ lastUpdatedSession: updatedSession })
        addNotification({
          type: "success",
          message: "운동 세션이 성공적으로 수정되었습니다.",
        })

        return updatedSession
      } catch (error) {
        console.error(
          "❌ [useWorkoutSessionsActions] 세션 업데이트 실패:",
          error
        )
        addNotification({
          type: "error",
          message: "운동 세션 수정에 실패했습니다.",
        })
        throw error
      }
    },
    [updateSession, updateSharedState, addNotification]
  )

  const handleDeleteSession = useCallback(
    async (sessionId: number) => {
      try {
        await deleteSession(sessionId)
        console.log("✅ [useWorkoutSessionsActions] 세션 삭제 성공:", sessionId)

        addNotification({
          type: "success",
          message: "운동 세션이 성공적으로 삭제되었습니다.",
        })
      } catch (error) {
        console.error("❌ [useWorkoutSessionsActions] 세션 삭제 실패:", error)
        addNotification({
          type: "error",
          message: "운동 세션 삭제에 실패했습니다.",
        })
        throw error
      }
    },
    [deleteSession, addNotification]
  )

  return {
    fetchSessions,
    createSession: handleCreateSession,
    updateSession: handleUpdateSession,
    deleteSession: handleDeleteSession,
    addSessionExercise,
    removeSessionExercise,
    updateSessionExercise,
  }
}

export function useWorkoutGoalsActions() {
  const {
    fetchGoals,
    createGoal,
    updateGoal,
    deleteGoal,
    updateSharedState,
    addNotification,
  } = useWorkoutStore()

  const handleCreateGoal = useCallback(
    async (goalData: CreateGoalRequest) => {
      try {
        const newGoal = await createGoal(goalData)
        console.log("✅ [useWorkoutGoalsActions] 목표 생성 성공:", newGoal)

        // 공유 상태 업데이트
        updateSharedState({ lastUpdatedGoal: newGoal })
        addNotification({
          type: "success",
          message: "운동 목표가 성공적으로 생성되었습니다.",
        })

        return newGoal
      } catch (error) {
        console.error("❌ [useWorkoutGoalsActions] 목표 생성 실패:", error)
        addNotification({
          type: "error",
          message: "운동 목표 생성에 실패했습니다.",
        })
        throw error
      }
    },
    [createGoal, updateSharedState, addNotification]
  )

  const handleUpdateGoal = useCallback(
    async (goalId: number, goalData: UpdateGoalRequest) => {
      try {
        const updatedGoal = await updateGoal(goalId, goalData)
        console.log(
          "✅ [useWorkoutGoalsActions] 목표 업데이트 성공:",
          updatedGoal
        )

        // 공유 상태 업데이트
        updateSharedState({ lastUpdatedGoal: updatedGoal })
        addNotification({
          type: "success",
          message: "운동 목표가 성공적으로 수정되었습니다.",
        })

        return updatedGoal
      } catch (error) {
        console.error("❌ [useWorkoutGoalsActions] 목표 업데이트 실패:", error)
        addNotification({
          type: "error",
          message: "운동 목표 수정에 실패했습니다.",
        })
        throw error
      }
    },
    [updateGoal, updateSharedState, addNotification]
  )

  const handleDeleteGoal = useCallback(
    async (goalId: number) => {
      try {
        await deleteGoal(goalId)
        console.log("✅ [useWorkoutGoalsActions] 목표 삭제 성공:", goalId)

        addNotification({
          type: "success",
          message: "운동 목표가 성공적으로 삭제되었습니다.",
        })
      } catch (error) {
        console.error("❌ [useWorkoutGoalsActions] 목표 삭제 실패:", error)
        addNotification({
          type: "error",
          message: "운동 목표 삭제에 실패했습니다.",
        })
        throw error
      }
    },
    [deleteGoal, addNotification]
  )

  return {
    fetchGoals,
    createGoal: handleCreateGoal,
    updateGoal: handleUpdateGoal,
    deleteGoal: handleDeleteGoal,
  }
}

export function useWorkoutUI() {
  const {
    setActiveTab,
    openPlanModal,
    closePlanModal,
    openSessionModal,
    closeSessionModal,
    openGoalModal,
    closeGoalModal,
    updateTabState,
    resetTabState,
  } = useWorkoutStore()

  return {
    setActiveTab,
    openPlanModal,
    closePlanModal,
    openSessionModal,
    closeSessionModal,
    openGoalModal,
    closeGoalModal,
    updateTabState,
    resetTabState,
  }
}

export function useWorkoutInitialization() {
  const {
    fetchPlans,
    fetchSessions,
    fetchGoals,
    fetchDashboardData,
    initializeWorkoutData: storeInitializeWorkoutData,
  } = useWorkoutStore()

  const initializeWorkoutData = useCallback(async () => {
    console.log("🚀 [useWorkoutInitialization] 워크아웃 데이터 초기화 시작")
    try {
      await storeInitializeWorkoutData()
      console.log("✅ [useWorkoutInitialization] 워크아웃 데이터 초기화 완료")
    } catch (error) {
      console.error(
        "❌ [useWorkoutInitialization] 워크아웃 데이터 초기화 실패:",
        error
      )
      throw error
    }
  }, [storeInitializeWorkoutData])

  return {
    initializeWorkoutData,
  }
}

// ============================================================================
// Tab State Management Hooks
// ============================================================================

export function useTabState<T extends TabType>(tab: T) {
  const { tabStates, updateTabState, resetTabState } = useWorkoutStore()

  return {
    tabState: tabStates[tab],
    updateTabState: (updates: Partial<WorkoutStoreState["tabStates"][T]>) =>
      updateTabState(tab, updates),
    resetTabState: () => resetTabState(tab),
  }
}

// ============================================================================
// Shared State Management Hooks
// ============================================================================

export function useSharedState() {
  const {
    sharedState,
    updateSharedState,
    addNotification,
    removeNotification,
    clearNotifications,
  } = useWorkoutStore()

  return {
    sharedState,
    updateSharedState,
    addNotification,
    removeNotification,
    clearNotifications,
  }
}

// ============================================================================
// Dashboard Data Hook
// ============================================================================

export function useDashboardData() {
  const { dashboardData, loading } = useWorkoutStore()

  return {
    dashboardData,
    isLoading: loading.overview.isLoading,
    error: loading.overview.error,
  }
}
