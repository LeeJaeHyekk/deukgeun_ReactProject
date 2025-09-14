// ============================================================================
// Workout Store Hooks - Zustand Store Integration
// ============================================================================

import { useState } from 'react'
import { useWorkoutStore } from '../store/workoutStore'
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
  OverviewTabState,
  PlansTabState,
  SessionsTabState,
  GoalsTabState,
  ProgressTabState,
  Notification,
} from '../types'

// ============================================================================
// Data Hooks
// ============================================================================

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

  console.log('[useWorkoutStoreData] 훅 실행됨', {
    timestamp: new Date().toISOString(),
    plansCount: data.plans.length,
    sessionsCount: data.sessions.length,
    goalsCount: data.goals.length,
  })

  return data
}

// ============================================================================
// Plans Actions Hook
// ============================================================================

export function useWorkoutPlansActions() {
  const actions = useWorkoutStore(state => ({
    fetchPlans: state.fetchPlans,
    createPlan: state.createPlan,
    updatePlan: state.updatePlan,
    deletePlan: state.deletePlan,
    duplicatePlan: state.duplicatePlan,
  }))

  console.log('[useWorkoutPlansActions] 훅 실행됨', {
    timestamp: new Date().toISOString(),
    fetchPlansRef: actions.fetchPlans.toString().slice(0, 50),
  })

  return actions
}

// ============================================================================
// Sessions Actions Hook
// ============================================================================

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

// ============================================================================
// Goals Actions Hook
// ============================================================================

export function useWorkoutGoalsActions() {
  return useWorkoutStore(state => ({
    fetchGoals: state.fetchGoals,
    createGoal: state.createGoal,
    updateGoal: state.updateGoal,
    deleteGoal: state.deleteGoal,
    completeGoal: state.completeGoal,
  }))
}

// ============================================================================
// Dashboard Actions Hook
// ============================================================================

export function useWorkoutDashboardActions() {
  return useWorkoutStore(state => ({
    fetchDashboardData: state.fetchDashboardData,
    refreshDashboard: state.refreshDashboard,
  }))
}

// ============================================================================
// Dashboard Data Hook
// ============================================================================

export function useDashboardData() {
  return useWorkoutStore(state => ({
    dashboardData: state.dashboardData,
    isLoading: state.sharedState.globalLoading,
  }))
}

// ============================================================================
// UI Actions Hook
// ============================================================================

export function useWorkoutUI() {
  return useWorkoutStore(state => ({
    setActiveTab: state.setActiveTab,
    openPlanModal: state.openPlanModal,
    closePlanModal: state.closePlanModal,
    openSessionModal: state.openSessionModal,
    closeSessionModal: state.closeSessionModal,
    openGoalModal: state.openGoalModal,
    closeGoalModal: state.closeGoalModal,
  }))
}

// ============================================================================
// Notification Actions Hook
// ============================================================================

export function useWorkoutNotifications() {
  return useWorkoutStore(state => ({
    addNotification: state.addNotification,
    removeNotification: state.removeNotification,
    clearNotifications: state.clearNotifications,
    notifications: state.sharedState.notifications,
  }))
}

// ============================================================================
// Error Actions Hook
// ============================================================================

export function useWorkoutErrors() {
  return useWorkoutStore(state => ({
    setGlobalError: state.setGlobalError,
    clearGlobalError: state.clearGlobalError,
    globalError: state.sharedState.globalError,
  }))
}

// ============================================================================
// Timer Actions Hook
// ============================================================================

export function useWorkoutTimer() {
  return useWorkoutStore(state => ({
    startTimer: state.startTimer,
    pauseTimer: state.pauseTimer,
    resetTimer: state.resetTimer,
    updateTimer: state.updateTimer,
    timer: state.sharedState.timer,
  }))
}

// ============================================================================
// Tab State Actions Hooks
// ============================================================================

export function useTabState(tabType: TabType) {
  return useWorkoutStore(state => {
    const tabState = state.tabStates[tabType]
    const updateState = (
      updates: Partial<
        | OverviewTabState
        | PlansTabState
        | SessionsTabState
        | GoalsTabState
        | ProgressTabState
      >
    ) => {
      switch (tabType) {
        case 'overview':
          return state.updateOverviewTabState(
            updates as Partial<OverviewTabState>
          )
        case 'plans':
          return state.updatePlansTabState(updates as Partial<PlansTabState>)
        case 'sessions':
          return state.updateSessionsTabState(
            updates as Partial<SessionsTabState>
          )
        case 'goals':
          return state.updateGoalsTabState(updates as Partial<GoalsTabState>)
        case 'workoutProgress':
          return state.updateProgressTabState(
            updates as Partial<ProgressTabState>
          )
        default:
          return
      }
    }

    return {
      tabState,
      updateTabState: updateState,
    }
  })
}

export function useOverviewTabState() {
  return useWorkoutStore(state => ({
    state: state.tabStates.overview,
    updateState: state.updateOverviewTabState,
  }))
}

export function usePlansTabState() {
  return useWorkoutStore(state => ({
    state: state.tabStates.plans,
    updateState: state.updatePlansTabState,
  }))
}

export function useSessionsTabState() {
  return useWorkoutStore(state => ({
    state: state.tabStates.sessions,
    updateState: state.updateSessionsTabState,
  }))
}

export function useGoalsTabState() {
  return useWorkoutStore(state => ({
    state: state.tabStates.goals,
    updateState: state.updateGoalsTabState,
  }))
}

export function useProgressTabState() {
  return useWorkoutStore(state => ({
    state: state.tabStates.workoutProgress,
    updateState: state.updateProgressTabState,
  }))
}

// ============================================================================
// Utility Hooks
// ============================================================================

export function useWorkoutUtils() {
  return useWorkoutStore(state => ({
    resetStore: state.resetStore,
    clearCache: state.clearCache,
  }))
}

// ============================================================================
// Shared State Hook
// ============================================================================

export function useSharedState() {
  return useWorkoutStore(state => ({
    sharedState: state.sharedState,
    lastUpdatedPlan: state.sharedState.lastUpdatedPlan,
    lastUpdatedSession: state.sharedState.lastUpdatedSession,
    lastUpdatedGoal: state.sharedState.lastUpdatedGoal,
    globalLoading: state.sharedState.globalLoading,
    globalError: state.sharedState.globalError,
    timer: state.sharedState.timer,
  }))
}

// ============================================================================
// Initialization Hook
// ============================================================================

export function useWorkoutInitialization() {
  const { fetchPlans } = useWorkoutPlansActions()
  const { fetchSessions } = useWorkoutSessionsActions()
  const { fetchGoals } = useWorkoutGoalsActions()
  const { fetchDashboardData } = useWorkoutDashboardActions()

  // 초기화 상태를 추적하여 중복 요청 방지
  const [isInitializing, setIsInitializing] = useState(false)
  const [hasInitialized, setHasInitialized] = useState(false)

  const initializeWorkoutData = async () => {
    // 이미 초기화 중이거나 완료된 경우 스킵
    if (isInitializing || hasInitialized) {
      console.log(
        '[useWorkoutInitialization] 초기화 스킵 - 이미 진행 중이거나 완료됨',
        {
          isInitializing,
          hasInitialized,
          timestamp: new Date().toISOString(),
        }
      )
      return
    }

    console.log('[useWorkoutInitialization] initializeWorkoutData 호출됨', {
      timestamp: new Date().toISOString(),
      stack: new Error().stack,
    })

    setIsInitializing(true)

    // 인증 토큰 확인
    const token = localStorage.getItem('accessToken')
    console.log('[useWorkoutInitialization] 인증 토큰 확인:', {
      hasToken: !!token,
      tokenPreview: token ? `${token.substring(0, 20)}...` : '없음',
      timestamp: new Date().toISOString(),
    })

    try {
      // 순차적으로 실행하여 Rate Limit 방지
      console.log('[useWorkoutInitialization] 대시보드 데이터 로드 시작')
      await fetchDashboardData()

      console.log('[useWorkoutInitialization] 계획 데이터 로드 시작')
      await fetchPlans()

      console.log('[useWorkoutInitialization] 세션 데이터 로드 시작')
      await fetchSessions()

      console.log('[useWorkoutInitialization] 목표 데이터 로드 시작')
      await fetchGoals()

      setHasInitialized(true)
      console.log('[useWorkoutInitialization] 데이터 초기화 완료')
    } catch (error) {
      console.error('Failed to initialize workout data:', error)
    } finally {
      setIsInitializing(false)
    }
  }

  return { initializeWorkoutData, isInitializing, hasInitialized }
}

// ============================================================================
// Selector Hooks
// ============================================================================

export function useWorkoutPlans() {
  return useWorkoutStore(state => state.plans)
}

export function useWorkoutSessions() {
  return useWorkoutStore(state => state.sessions)
}

export function useWorkoutGoals() {
  return useWorkoutStore(state => state.goals)
}

export function useWorkoutDashboardData() {
  return useWorkoutStore(state => state.dashboardData)
}

export function useWorkoutLoading() {
  return useWorkoutStore(state => state.loading)
}

export function useWorkoutActiveTab() {
  return useWorkoutStore(state => state.activeTab)
}

export function useWorkoutModals() {
  return useWorkoutStore(state => state.modals)
}

// ============================================================================
// Computed Selectors
// ============================================================================

export function useWorkoutStats() {
  const plans = useWorkoutPlans()
  const sessions = useWorkoutSessions()
  const goals = useWorkoutGoals()

  return {
    totalPlans: plans.length,
    totalSessions: sessions.length,
    totalGoals: goals.length,
    completedSessions: sessions.filter(s => s.status === 'completed').length,
    activeGoals: goals.filter(g => !g.isCompleted).length,
    completedGoals: goals.filter(g => g.isCompleted).length,
  }
}

export function useWorkoutPlanById(planId: number) {
  return useWorkoutStore(state => state.plans.find(plan => plan.id === planId))
}

export function useWorkoutSessionById(sessionId: number) {
  return useWorkoutStore(state =>
    state.sessions.find(session => session.id === sessionId)
  )
}

export function useWorkoutGoalById(goalId: number) {
  return useWorkoutStore(state => state.goals.find(goal => goal.id === goalId))
}

export function useWorkoutSessionsByPlan(planId: number) {
  return useWorkoutStore(state =>
    state.sessions.filter(session => session.planId === planId)
  )
}

export function useWorkoutGoalsByPlan(planId: number) {
  return useWorkoutStore(state =>
    state.goals.filter(goal => goal.planId === planId)
  )
}

// ============================================================================
// Loading State Hooks
// ============================================================================

export function useWorkoutLoadingState(
  tab: 'overview' | 'plans' | 'sessions' | 'goals' | 'progress'
) {
  return useWorkoutStore(state => state.loading[tab])
}

export function useWorkoutGlobalLoading() {
  return useWorkoutStore(state => state.sharedState.globalLoading)
}

// ============================================================================
// Modal State Hooks
// ============================================================================

export function useWorkoutPlanModal() {
  return useWorkoutStore(state => state.modals.plan)
}

export function useWorkoutSessionModal() {
  return useWorkoutStore(state => state.modals.session)
}

export function useWorkoutGoalModal() {
  return useWorkoutStore(state => state.modals.goal)
}
