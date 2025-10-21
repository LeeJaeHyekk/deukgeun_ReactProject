/**
 * 워크아웃 상태 관리 관련 훅들
 */

import { useWorkoutStore } from '../store/workoutStore'
import type { 
  TabType, 
  OverviewTabState, 
  PlansTabState, 
  SessionsTabState, 
  GoalsTabState, 
  ProgressTabState 
} from '../types'

/**
 * 공유 상태 훅
 */
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

/**
 * 알림 상태 훅
 */
export function useWorkoutNotifications() {
  return useWorkoutStore(state => ({
    addNotification: state.addNotification,
    removeNotification: state.removeNotification,
    clearNotifications: state.clearNotifications,
    notifications: state.sharedState.notifications,
  }))
}

/**
 * 에러 상태 훅
 */
export function useWorkoutErrors() {
  return useWorkoutStore(state => ({
    setGlobalError: state.setGlobalError,
    clearGlobalError: state.clearGlobalError,
    globalError: state.sharedState.globalError,
  }))
}

/**
 * 타이머 상태 훅
 */
export function useWorkoutTimer() {
  return useWorkoutStore(state => ({
    startTimer: state.startTimer,
    pauseTimer: state.pauseTimer,
    resetTimer: state.resetTimer,
    updateTimer: state.updateTimer,
    timer: state.sharedState.timer,
  }))
}

/**
 * 탭 상태 훅
 */
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
        case "overview":
          return state.updateOverviewTabState(
            updates as Partial<OverviewTabState>
          )
        case "plans":
          return state.updatePlansTabState(updates as Partial<PlansTabState>)
        case "sessions":
          return state.updateSessionsTabState(
            updates as Partial<SessionsTabState>
          )
        case "goals":
          return state.updateGoalsTabState(updates as Partial<GoalsTabState>)
        case "workoutProgress":
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

/**
 * 개별 탭 상태 훅들
 */
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
