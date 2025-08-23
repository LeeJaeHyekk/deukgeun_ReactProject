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
} from "../types"

// ============================================================================
// Zustand Store-based Hooks
// ============================================================================

export function useWorkoutStoreData() {
  const {
    plans,
    sessions,
    goals,
    loading,
    activeTab,
    modals,
    currentPlan,
    currentSession,
    currentGoal,
  } = useWorkoutStore()

  return {
    plans,
    sessions,
    goals,
    loading,
    activeTab,
    modals,
    currentPlan,
    currentSession,
    currentGoal,
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
  } = useWorkoutStore()

  const handleCreatePlan = useCallback(
    async (planData: CreatePlanRequest) => {
      try {
        const newPlan = await createPlan(planData)
        console.log("✅ [useWorkoutPlansActions] 계획 생성 성공:", newPlan)
        return newPlan
      } catch (error) {
        console.error("❌ [useWorkoutPlansActions] 계획 생성 실패:", error)
        throw error
      }
    },
    [createPlan]
  )

  const handleUpdatePlan = useCallback(
    async (planId: number, planData: UpdatePlanRequest) => {
      try {
        const updatedPlan = await updatePlan(planId, planData)
        console.log(
          "✅ [useWorkoutPlansActions] 계획 업데이트 성공:",
          updatedPlan
        )
        return updatedPlan
      } catch (error) {
        console.error("❌ [useWorkoutPlansActions] 계획 업데이트 실패:", error)
        throw error
      }
    },
    [updatePlan]
  )

  const handleDeletePlan = useCallback(
    async (planId: number) => {
      try {
        await deletePlan(planId)
        console.log("✅ [useWorkoutPlansActions] 계획 삭제 성공:", planId)
      } catch (error) {
        console.error("❌ [useWorkoutPlansActions] 계획 삭제 실패:", error)
        throw error
      }
    },
    [deletePlan]
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
  } = useWorkoutStore()

  const handleCreateSession = useCallback(
    async (sessionData: CreateSessionRequest) => {
      try {
        const newSession = await createSession(sessionData)
        console.log(
          "✅ [useWorkoutSessionsActions] 세션 생성 성공:",
          newSession
        )
        return newSession
      } catch (error) {
        console.error("❌ [useWorkoutSessionsActions] 세션 생성 실패:", error)
        throw error
      }
    },
    [createSession]
  )

  const handleUpdateSession = useCallback(
    async (sessionId: number, sessionData: UpdateSessionRequest) => {
      try {
        const updatedSession = await updateSession(sessionId, sessionData)
        console.log(
          "✅ [useWorkoutSessionsActions] 세션 업데이트 성공:",
          updatedSession
        )
        return updatedSession
      } catch (error) {
        console.error(
          "❌ [useWorkoutSessionsActions] 세션 업데이트 실패:",
          error
        )
        throw error
      }
    },
    [updateSession]
  )

  const handleDeleteSession = useCallback(
    async (sessionId: number) => {
      try {
        await deleteSession(sessionId)
        console.log("✅ [useWorkoutSessionsActions] 세션 삭제 성공:", sessionId)
      } catch (error) {
        console.error("❌ [useWorkoutSessionsActions] 세션 삭제 실패:", error)
        throw error
      }
    },
    [deleteSession]
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
  const { fetchGoals, createGoal, updateGoal, deleteGoal } = useWorkoutStore()

  const handleCreateGoal = useCallback(
    async (goalData: CreateGoalRequest) => {
      try {
        const newGoal = await createGoal(goalData)
        console.log("✅ [useWorkoutGoalsActions] 목표 생성 성공:", newGoal)
        return newGoal
      } catch (error) {
        console.error("❌ [useWorkoutGoalsActions] 목표 생성 실패:", error)
        throw error
      }
    },
    [createGoal]
  )

  const handleUpdateGoal = useCallback(
    async (goalId: number, goalData: UpdateGoalRequest) => {
      try {
        const updatedGoal = await updateGoal(goalId, goalData)
        console.log(
          "✅ [useWorkoutGoalsActions] 목표 업데이트 성공:",
          updatedGoal
        )
        return updatedGoal
      } catch (error) {
        console.error("❌ [useWorkoutGoalsActions] 목표 업데이트 실패:", error)
        throw error
      }
    },
    [updateGoal]
  )

  const handleDeleteGoal = useCallback(
    async (goalId: number) => {
      try {
        await deleteGoal(goalId)
        console.log("✅ [useWorkoutGoalsActions] 목표 삭제 성공:", goalId)
      } catch (error) {
        console.error("❌ [useWorkoutGoalsActions] 목표 삭제 실패:", error)
        throw error
      }
    },
    [deleteGoal]
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
  } = useWorkoutStore()

  return {
    setActiveTab,
    openPlanModal,
    closePlanModal,
    openSessionModal,
    closeSessionModal,
    openGoalModal,
    closeGoalModal,
  }
}

export function useWorkoutInitialization() {
  const { fetchPlans, fetchSessions, fetchGoals } = useWorkoutStore()

  const initializeWorkoutData = useCallback(async () => {
    console.log("🚀 [useWorkoutInitialization] 워크아웃 데이터 초기화 시작")
    try {
      await Promise.all([fetchPlans(), fetchSessions(), fetchGoals()])
      console.log("✅ [useWorkoutInitialization] 워크아웃 데이터 초기화 완료")
    } catch (error) {
      console.error(
        "❌ [useWorkoutInitialization] 워크아웃 데이터 초기화 실패:",
        error
      )
      throw error
    }
  }, [fetchPlans, fetchSessions, fetchGoals])

  return {
    initializeWorkoutData,
  }
}
