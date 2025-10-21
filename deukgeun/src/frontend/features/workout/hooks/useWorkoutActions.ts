/**
 * 워크아웃 액션 관련 훅들
 */

import { useWorkoutStore } from '../store/workoutStore'

/**
 * 워크아웃 플랜 액션 훅
 */
export function useWorkoutPlansActions() {
  const actions = useWorkoutStore(state => ({
    fetchPlans: state.fetchPlans,
    createPlan: state.createPlan,
    updatePlan: state.updatePlan,
    deletePlan: state.deletePlan,
    duplicatePlan: state.duplicatePlan,
  }))

  console.log("[useWorkoutPlansActions] 훅 실행됨", {
    timestamp: new Date().toISOString(),
    fetchPlansRef: actions.fetchPlans.toString().slice(0, 50),
  })

  return actions
}

/**
 * 워크아웃 세션 액션 훅
 */
export function useWorkoutSessionsActions() {
  return useWorkoutStore(state => ({
    fetchSessions: state.fetchSessions,
    createSession: state.createSession,
    updateSession: state.updateSession,
    deleteSession: state.deleteSession,
    startSession: state.startSession,
    pauseSession: state.pauseSession,
    completeSession: state.completeSession,
  }))
}

/**
 * 워크아웃 목표 액션 훅
 */
export function useWorkoutGoalsActions() {
  return useWorkoutStore(state => ({
    fetchGoals: state.fetchGoals,
    createGoal: state.createGoal,
    updateGoal: state.updateGoal,
    deleteGoal: state.deleteGoal,
    completeGoal: state.completeGoal,
  }))
}

/**
 * 대시보드 액션 훅
 */
export function useWorkoutDashboardActions() {
  return useWorkoutStore(state => ({
    fetchDashboardData: state.fetchDashboardData,
    refreshDashboard: state.refreshDashboard,
  }))
}

/**
 * 워크아웃 유틸리티 액션 훅
 */
export function useWorkoutUtils() {
  return useWorkoutStore(state => ({
    resetStore: state.resetStore,
    clearCache: state.clearCache,
  }))
}