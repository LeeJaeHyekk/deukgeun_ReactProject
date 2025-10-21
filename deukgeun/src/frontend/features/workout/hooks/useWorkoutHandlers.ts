import { useCallback } from 'react'
import { useWorkoutStore } from '../store/workoutStore'
import { useWorkoutPlansActions, useWorkoutSessionsActions, useWorkoutGoalsActions } from './useWorkoutStore'
import { useWorkoutUI } from './useWorkoutStore'
import { useWorkoutErrors } from './useWorkoutStore'
import { isNumber, isDefined, isArray } from '../../../shared/utils/typeGuards'
import { handleError } from '../../../shared/utils/errorHandling'
import type { WorkoutPlan, WorkoutSession, WorkoutGoal } from '../types'

/**
 * 워크아웃 페이지의 모든 핸들러를 관리하는 훅
 */
export function useWorkoutHandlers() {
  // Store actions
  const { createPlan, updatePlan, deletePlan } = useWorkoutPlansActions()
  const { createSession, updateSession, deleteSession } = useWorkoutSessionsActions()
  const { createGoal, updateGoal, deleteGoal } = useWorkoutGoalsActions()
  
  // UI actions
  const {
    setActiveTab,
    openPlanModal,
    closePlanModal,
    openSessionModal,
    closeSessionModal,
    openGoalModal,
    closeGoalModal,
  } = useWorkoutUI()
  
  // Error handling
  const { setGlobalError } = useWorkoutErrors()

  // ============================================================================
  // Plan Handlers
  // ============================================================================

  const handleCreatePlan = useCallback(() => {
    openPlanModal('create')
  }, [openPlanModal])

  const handleEditPlan = useCallback((planId: number, plans: WorkoutPlan[]) => {
    // 타입 안전성 검증
    if (!isNumber(planId) || planId <= 0) {
      console.error('Invalid plan ID:', planId)
      return
    }
    
    if (!isArray(plans)) {
      console.error('Invalid plans array:', plans)
      return
    }

    const plan = plans.find(p => p.id === planId)
    if (plan) {
      openPlanModal('edit', plan)
    }
  }, [openPlanModal])

  const handleDeletePlan = useCallback(async (planId: number) => {
    // 타입 안전성 검증
    if (!isNumber(planId) || planId <= 0) {
      console.error('Invalid plan ID:', planId)
      return
    }

    try {
      await deletePlan(planId)
    } catch (error) {
      const appError = handleError(error, 'useWorkoutHandlers.handleDeletePlan')
      console.error('Failed to delete plan:', appError)
      setGlobalError('계획을 삭제하는데 실패했습니다.')
    }
  }, [deletePlan, setGlobalError])

  const handleStartSession = useCallback((planId: number, plans: WorkoutPlan[]) => {
    const plan = plans.find(p => p.id === planId)
    if (plan) {
      openSessionModal('create', undefined)
    }
  }, [openSessionModal])

  // ============================================================================
  // Session Handlers
  // ============================================================================

  const handleEditSession = useCallback((sessionId: number, sessions: WorkoutSession[]) => {
    const session = sessions.find(s => s.id === sessionId)
    if (session) {
      openSessionModal('edit', session)
    }
  }, [openSessionModal])

  const handleViewSession = useCallback((sessionId: number, sessions: WorkoutSession[]) => {
    const session = sessions.find(s => s.id === sessionId)
    if (session) {
      openSessionModal('view', session)
    }
  }, [openSessionModal])

  const handleDeleteSession = useCallback(async (sessionId: number) => {
    try {
      await deleteSession(sessionId)
    } catch (error) {
      console.error('Failed to delete session:', error)
      setGlobalError('세션을 삭제하는데 실패했습니다.')
    }
  }, [deleteSession, setGlobalError])

  // ============================================================================
  // Goal Handlers
  // ============================================================================

  const handleCreateGoal = useCallback(() => {
    openGoalModal('create')
  }, [openGoalModal])

  const handleEditGoal = useCallback((goalId: number, goals: WorkoutGoal[]) => {
    const goal = goals.find(g => g.id === goalId)
    if (goal) {
      openGoalModal('edit', goal)
    }
  }, [openGoalModal])

  const handleDeleteGoal = useCallback(async (goalId: number) => {
    try {
      await deleteGoal(goalId)
    } catch (error) {
      console.error('Failed to delete goal:', error)
      setGlobalError('목표를 삭제하는데 실패했습니다.')
    }
  }, [deleteGoal, setGlobalError])

  // ============================================================================
  // Click Handlers
  // ============================================================================

  const handlePlanClick = useCallback((planId: number, plans: WorkoutPlan[]) => {
    handleEditPlan(planId, plans)
  }, [handleEditPlan])

  const handleSessionClick = useCallback((sessionId: number, sessions: WorkoutSession[]) => {
    handleViewSession(sessionId, sessions)
  }, [handleViewSession])

  const handleGoalClick = useCallback((goalId: number, setSelectedGoalId: (id: number) => void) => {
    setSelectedGoalId(goalId)
    setActiveTab('goals')
  }, [setActiveTab])

  // ============================================================================
  // Tab Handlers
  // ============================================================================

  const handleTabChange = useCallback((tab: string, setSelectedGoalId: (id: number | undefined) => void) => {
    setActiveTab(tab as any)
    
    // 목표 탭이 아닌 다른 탭으로 이동할 때 selectedGoalId 초기화
    if (tab !== 'goals') {
      setSelectedGoalId(undefined)
    }
  }, [setActiveTab])

  return {
    // Plan handlers
    handleCreatePlan,
    handleEditPlan,
    handleDeletePlan,
    handleStartSession,
    
    // Session handlers
    handleEditSession,
    handleViewSession,
    handleDeleteSession,
    
    // Goal handlers
    handleCreateGoal,
    handleEditGoal,
    handleDeleteGoal,
    
    // Click handlers
    handlePlanClick,
    handleSessionClick,
    handleGoalClick,
    
    // Tab handlers
    handleTabChange,
  }
}
