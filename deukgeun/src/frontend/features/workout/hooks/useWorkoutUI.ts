/**
 * 워크아웃 UI 관련 훅들
 */

import { useWorkoutStore } from '../store/workoutStore'
import type { TabType } from '../types'

/**
 * 워크아웃 UI 액션 훅
 */
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

/**
 * 워크아웃 로딩 상태 훅
 */
export function useWorkoutLoading() {
  return useWorkoutStore(state => state.loading)
}

/**
 * 워크아웃 활성 탭 훅
 */
export function useWorkoutActiveTab() {
  return useWorkoutStore(state => state.activeTab)
}

/**
 * 워크아웃 모달 상태 훅
 */
export function useWorkoutModals() {
  return useWorkoutStore(state => state.modals)
}

/**
 * 특정 탭 로딩 상태 훅
 */
export function useWorkoutLoadingState(
  tab: "overview" | "plans" | "sessions" | "goals" | "progress"
) {
  return useWorkoutStore(state => state.loading[tab])
}

/**
 * 전역 로딩 상태 훅
 */
export function useWorkoutGlobalLoading() {
  return useWorkoutStore(state => state.sharedState.globalLoading)
}

/**
 * 플랜 모달 상태 훅
 */
export function useWorkoutPlanModal() {
  return useWorkoutStore(state => state.modals.plan)
}

/**
 * 세션 모달 상태 훅
 */
export function useWorkoutSessionModal() {
  return useWorkoutStore(state => state.modals.session)
}

/**
 * 목표 모달 상태 훅
 */
export function useWorkoutGoalModal() {
  return useWorkoutStore(state => state.modals.goal)
}
