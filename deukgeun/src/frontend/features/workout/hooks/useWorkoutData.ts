/**
 * 워크아웃 데이터 관련 훅들
 */

import { useWorkoutStore } from '../store/workoutStore'
import type { WorkoutPlan, WorkoutSession, WorkoutGoal, DashboardData } from '../types'

/**
 * 워크아웃 스토어 데이터 훅
 */
export function useWorkoutStoreData() {
  const data = useWorkoutStore(state => ({
    plans: state.plans,
    sessions: state.sessions,
    goals: state.goals,
    dashboardData: state.dashboardData,
    loading: state.loading,
    activeTab: state.activeTab,
    modals: state.modals,
    tabStates: state.tabStates,
    sharedState: state.sharedState,
  }))

  console.log("[useWorkoutStoreData] 훅 실행됨", {
    timestamp: new Date().toISOString(),
    plansCount: data.plans.length,
    sessionsCount: data.sessions.length,
    goalsCount: data.goals.length,
  })

  return data
}

/**
 * 워크아웃 플랜 데이터 훅
 */
export function useWorkoutPlans() {
  return useWorkoutStore(state => state.plans)
}

/**
 * 워크아웃 세션 데이터 훅
 */
export function useWorkoutSessions() {
  return useWorkoutStore(state => state.sessions)
}

/**
 * 워크아웃 목표 데이터 훅
 */
export function useWorkoutGoals() {
  return useWorkoutStore(state => state.goals)
}

/**
 * 대시보드 데이터 훅
 */
export function useDashboardData() {
  return useWorkoutStore(state => ({
    dashboardData: state.dashboardData,
    isLoading: state.sharedState.globalLoading,
  }))
}

/**
 * 특정 플랜 조회 훅
 */
export function useWorkoutPlanById(planId: number) {
  return useWorkoutStore(state => state.plans.find(plan => plan.id === planId))
}

/**
 * 특정 세션 조회 훅
 */
export function useWorkoutSessionById(sessionId: number) {
  return useWorkoutStore(state =>
    state.sessions.find(session => session.id === sessionId)
  )
}

/**
 * 특정 목표 조회 훅
 */
export function useWorkoutGoalById(goalId: number) {
  return useWorkoutStore(state => state.goals.find(goal => goal.id === goalId))
}

/**
 * 플랜별 세션 조회 훅
 */
export function useWorkoutSessionsByPlan(planId: number) {
  return useWorkoutStore(state =>
    state.sessions.filter(session => session.planId === planId)
  )
}

/**
 * 플랜별 목표 조회 훅
 */
export function useWorkoutGoalsByPlan(planId: number) {
  return useWorkoutStore(state =>
    state.goals.filter(goal => goal.planId === planId)
  )
}

/**
 * 워크아웃 통계 훅
 */
export function useWorkoutStats() {
  const plans = useWorkoutPlans()
  const sessions = useWorkoutSessions()
  const goals = useWorkoutGoals()

  return {
    totalPlans: plans.length,
    totalSessions: sessions.length,
    totalGoals: goals.length,
    completedSessions: sessions.filter(s => s.status === "completed").length,
    activeGoals: goals.filter(g => !g.isCompleted).length,
    completedGoals: goals.filter(g => g.isCompleted).length,
  }
}