import React, { useState, useEffect, useCallback } from "react"
import { useAuthContext } from "../../shared/contexts/AuthContext"
import { useWorkoutTimer } from "../../shared/contexts/WorkoutTimerContext"
import { useWorkoutPlans } from "./hooks/useWorkoutPlans"
import { useWorkoutSessions } from "./hooks/useWorkoutSessions"
import { useWorkoutGoals } from "./hooks/useWorkoutGoals"
import { useMachines } from "../../shared/hooks/useMachines"
import { Navigation } from "../../widgets/Navigation/Navigation"
import { TabNavigation } from "./components/navigation/TabNavigation"
import { TabContent } from "./components/navigation/TabContent"
import { WorkoutPlanModal } from "./pages/modals/WorkoutPlanModal"
import { WorkoutSessionModal } from "./pages/modals/WorkoutSessionModal"
import { WorkoutGoalModal } from "./pages/modals/WorkoutGoalModal"
import WorkoutSessionService from "./services/WorkoutSessionService"
import type { WorkoutPlan, WorkoutSession, WorkoutGoal } from "../../../types"
import type { TabType } from "./types"
import "./WorkoutJournalPage.css"

// 로깅 유틸리티
const logger = {
  info: (message: string, data?: any) => {
    console.log(`[WorkoutJournalPage] ${message}`, data || "")
  },
  debug: (message: string, data?: any) => {
    console.debug(`[WorkoutJournalPage] ${message}`, data || "")
  },
  warn: (message: string, data?: any) => {
    console.warn(`[WorkoutJournalPage] ${message}`, data || "")
  },
  error: (message: string, data?: any) => {
    console.error(`[WorkoutJournalPage] ${message}`, data || "")
  },
  modalOperation: (operation: string, modalType: string, data?: any) => {
    console.log(
      `[WorkoutJournalPage] ${operation} ${modalType} Modal`,
      data || ""
    )
  },
  performance: (operation: string, duration: number) => {
    console.log(
      `[WorkoutJournalPage] ${operation} took ${duration.toFixed(2)}ms`
    )
  },
}

export default function WorkoutJournalPage() {
  const { isLoggedIn, user } = useAuthContext()
  const [activeTab, setActiveTab] = useState<TabType>("overview")
  const [globalError, setGlobalError] = useState<string | null>(null)
  const [isDataLoading, setIsDataLoading] = useState(true)

  // 데이터 훅들
  const {
    plans,
    loading: plansLoading,
    createPlan,
    updatePlan,
    deletePlan,
    getUserPlans,
  } = useWorkoutPlans()
  const {
    sessions,
    loading: sessionsLoading,
    createSession,
    updateSession,
    deleteSession,
    getUserSessions,
  } = useWorkoutSessions()
  const {
    goals,
    loading: goalsLoading,
    createGoal,
    updateGoal,
    deleteGoal,
    getUserGoals,
  } = useWorkoutGoals()
  const { machines, loading: machinesLoading } = useMachines()

  // 타이머 컨텍스트
  const {
    timerState,
    sessionState,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    isSessionActive,
  } = useWorkoutTimer()

  // 세션 서비스 인스턴스
  const [sessionService] = useState(() => WorkoutSessionService.getInstance())

  // 페이지 로드 로깅
  useEffect(() => {
    logger.info("Page loaded", {
      isLoggedIn,
      userId: user?.id,
      timestamp: new Date().toISOString(),
    })
  }, [isLoggedIn, user?.id])

  // 모달 상태 통합 관리 (섹션 모달 제거)
  const [modalState, setModalState] = useState({
    plan: {
      isOpen: false,
      data: null as WorkoutPlan | null,
    },
    session: {
      isOpen: false,
      data: null as WorkoutSession | null,
    },
    goal: {
      isOpen: false,
      data: null as WorkoutGoal | null,
    },
  })

  // 모달 상태 업데이트 함수들
  const updateModalState = useCallback(
    (
      modalType: keyof typeof modalState,
      updates: Partial<(typeof modalState)[keyof typeof modalState]>
    ) => {
      logger.debug("Updating modal state", { modalType, updates })
      setModalState(prev => ({
        ...prev,
        [modalType]: { ...prev[modalType], ...updates },
      }))
    },
    []
  )

  // 모달 열기 함수들
  const openPlanModal = useCallback(
    (plan?: WorkoutPlan | null) => {
      logger.modalOperation("Opening", "Plan", {
        planId: plan?.id,
        planName: plan?.name,
      })
      updateModalState("plan", { isOpen: true, data: plan || null })
    },
    [updateModalState]
  )

  const openSessionModal = useCallback(
    (session?: WorkoutSession | null) => {
      logger.modalOperation("Opening", "Session", {
        sessionId: session?.id,
        sessionName: session?.session_name,
      })
      updateModalState("session", { isOpen: true, data: session || null })
    },
    [updateModalState]
  )

  const openGoalModal = useCallback(
    (goal?: WorkoutGoal | null) => {
      logger.modalOperation("Opening", "Goal", {
        goalId: goal?.id,
        goalTitle: goal?.title,
      })
      updateModalState("goal", { isOpen: true, data: goal || null })
    },
    [updateModalState]
  )

  // 모달 닫기 함수들
  const closePlanModal = useCallback(() => {
    logger.modalOperation("Closing", "Plan", {})
    updateModalState("plan", { isOpen: false, data: null })
  }, [updateModalState])

  const closeSessionModal = useCallback(() => {
    logger.modalOperation("Closing", "Session", {})
    updateModalState("session", { isOpen: false, data: null })
  }, [updateModalState])

  const closeGoalModal = useCallback(() => {
    logger.modalOperation("Closing", "Goal", {})
    updateModalState("goal", { isOpen: false, data: null })
  }, [updateModalState])

  // 탭 변경 핸들러
  const handleTabChange = useCallback(
    (tab: TabType) => {
      logger.info("Tab changed", { from: activeTab, to: tab })
      setActiveTab(tab)
    },
    [activeTab]
  )

  // 계획 관련 핸들러들
  const handleCreatePlan = useCallback(() => {
    logger.info("Create plan requested")
    openPlanModal()
  }, [openPlanModal])

  const handleEditPlan = useCallback(
    (planId: number) => {
      logger.info("Edit plan requested", { planId })
      const plan = plans.find(p => p.id === planId)
      if (plan) {
        openPlanModal(plan)
      } else {
        logger.error("Plan not found", { planId })
        setGlobalError("계획을 찾을 수 없습니다")
      }
    },
    [plans, openPlanModal]
  )

  const handlePlanClick = useCallback(
    (planId: number) => {
      logger.info("Plan clicked", { planId })
      handleEditPlan(planId)
    },
    [handleEditPlan]
  )

  const handlePlanSubmit = useCallback(
    async (plan: WorkoutPlan) => {
      const startTime = performance.now()
      logger.info("Plan submit started", {
        planId: plan.id,
        planName: plan.name,
      })

      try {
        if (plan.id && plan.id > 0) {
          await updatePlan(plan.id, plan)
          logger.info("Plan updated successfully", { planId: plan.id })
        } else {
          await createPlan(plan)
          logger.info("Plan created successfully")
        }
        closePlanModal()
        await getUserPlans()
        logger.performance("Plan submit", performance.now() - startTime)
      } catch (error) {
        logger.error("Plan submit failed", { error })
        setGlobalError("계획 저장에 실패했습니다")
        logger.performance(
          "Plan submit (failed)",
          performance.now() - startTime
        )
      }
    },
    [createPlan, updatePlan, closePlanModal, getUserPlans]
  )

  // 세션 관련 핸들러들
  const handleCreateSession = useCallback(() => {
    logger.info("Create session requested")
    openSessionModal()
  }, [openSessionModal])

  const handleEditSession = useCallback(
    (sessionId: number) => {
      logger.info("Edit session requested", { sessionId })
      const session = sessions.find(s => s.id === sessionId)
      if (session) {
        openSessionModal(session)
      } else {
        logger.error("Session not found", { sessionId })
        setGlobalError("세션을 찾을 수 없습니다")
      }
    },
    [sessions, openSessionModal]
  )

  const handleViewSession = useCallback(
    (sessionId: number) => {
      logger.info("View session requested", { sessionId })
      const session = sessions.find(s => s.id === sessionId)
      if (session) {
        openSessionModal(session)
      } else {
        logger.error("Session not found", { sessionId })
        setGlobalError("세션을 찾을 수 없습니다")
      }
    },
    [sessions, openSessionModal]
  )

  const handleSessionClick = useCallback(
    (sessionId: number) => {
      logger.info("Session clicked", { sessionId })
      handleViewSession(sessionId)
    },
    [handleViewSession]
  )

  const handleStartSession = useCallback(
    (planId: number) => {
      logger.info("Start session requested", { planId })
      const plan = plans.find(p => p.id === planId)
      if (plan) {
        openSessionModal()
      } else {
        logger.error("Plan not found for session start", { planId })
        setGlobalError("계획을 찾을 수 없습니다")
      }
    },
    [plans, openSessionModal]
  )

  const handleSessionSubmit = useCallback(
    async (session: WorkoutSession) => {
      const startTime = performance.now()
      logger.info("Session submit started", { sessionId: session.id })

      try {
        if (session.id && session.id > 0) {
          await updateSession(session.id, session)
          logger.info("Session updated successfully", { sessionId: session.id })
        } else {
          await createSession(session)
          logger.info("Session created successfully")
        }
        closeSessionModal()
        await getUserSessions()
        logger.performance("Session submit", performance.now() - startTime)
      } catch (error) {
        logger.error("Session submit failed", { error })
        setGlobalError("세션 저장에 실패했습니다")
        logger.performance(
          "Session submit (failed)",
          performance.now() - startTime
        )
      }
    },
    [createSession, updateSession, closeSessionModal, getUserSessions]
  )

  // 목표 관련 핸들러들 (자동 섹션 생성 포함)
  const handleCreateGoal = useCallback(() => {
    logger.info("Create goal requested")
    openGoalModal()
  }, [openGoalModal])

  const handleEditGoal = useCallback(
    (goalId: number) => {
      logger.info("Edit goal requested", { goalId })
      const goal = goals.find(g => g.id === goalId)
      if (goal) {
        openGoalModal(goal)
      } else {
        logger.error("Goal not found", { goalId })
        setGlobalError("목표를 찾을 수 없습니다")
      }
    },
    [goals, openGoalModal]
  )

  const handleGoalClick = useCallback(
    (goalId: number) => {
      logger.info("Goal clicked", { goalId })
      handleEditGoal(goalId)
    },
    [handleEditGoal]
  )

  const handleGoalSubmit = useCallback(
    async (goal: Partial<WorkoutGoal>) => {
      const startTime = performance.now()
      logger.info("Goal submit started", {
        goalId: goal.id,
        goalTitle: goal.title,
      })

      try {
        if (goal.id && goal.id > 0) {
          await updateGoal(goal.id, goal)
          logger.info("Goal updated successfully", { goalId: goal.id })
        } else {
          await createGoal(goal)
          logger.info("Goal created successfully")

          // 목표 기반 자동 섹션 생성 (새 목표 생성 시에만)
          logger.info("Generating sections from goal", { goalId: goal.id })
          // 여기에 자동 섹션 생성 로직 추가
          // SectionGenerationService.generateSectionsFromGoal(goal)
        }
        closeGoalModal()
        await getUserGoals()
        logger.performance("Goal submit", performance.now() - startTime)
      } catch (error) {
        logger.error("Goal submit failed", { error })
        setGlobalError("목표 저장에 실패했습니다")
        logger.performance(
          "Goal submit (failed)",
          performance.now() - startTime
        )
      }
    },
    [createGoal, updateGoal, closeGoalModal, getUserGoals]
  )

  // 초기 데이터 로딩
  useEffect(() => {
    const loadInitialData = async () => {
      const startTime = performance.now()
      logger.info("Loading initial data")
      setIsDataLoading(true)

      try {
        await Promise.all([getUserPlans(), getUserSessions(), getUserGoals()])
        logger.info("Initial data loaded successfully")
        logger.performance(
          "Initial data loading",
          performance.now() - startTime
        )
      } catch (error) {
        logger.error("Initial data loading failed", { error })
        setGlobalError("데이터 로딩에 실패했습니다")
      } finally {
        setIsDataLoading(false)
      }
    }

    if (isLoggedIn) {
      loadInitialData()
    }
  }, [isLoggedIn, getUserPlans, getUserSessions, getUserGoals])

  // 전역 에러 초기화
  useEffect(() => {
    if (globalError) {
      const timer = setTimeout(() => {
        setGlobalError(null)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [globalError])

  // 인증 확인
  if (!isLoggedIn) {
    return (
      <div className="workout-journal-page">
        <Navigation />
        <div className="auth-required">
          <h2>로그인이 필요합니다</h2>
          <p>운동일지를 사용하려면 로그인해주세요.</p>
        </div>
      </div>
    )
  }

  // 에러 상태
  if (globalError) {
    return (
      <div className="workout-journal-page">
        <Navigation />
        <div className="error-container">
          <h2>오류가 발생했습니다</h2>
          <p>{globalError}</p>
          <button onClick={() => window.location.reload()}>다시 시도</button>
        </div>
      </div>
    )
  }

  return (
    <div className="workout-journal-page">
      <Navigation />

      <div className="workout-journal-container">
        {/* 탭 네비게이션 */}
        <TabNavigation activeTab={activeTab} onTabChange={handleTabChange} />

        {/* 탭 컨텐츠 */}
        <TabContent
          activeTab={activeTab}
          isLoading={isDataLoading}
          dashboardData={null}
          plans={plans}
          sessions={sessions}
          goals={goals}
          plansLoading={plansLoading}
          sessionsLoading={sessionsLoading}
          goalsLoading={goalsLoading}
          onPlanClick={handlePlanClick}
          onSessionClick={handleSessionClick}
          onGoalClick={handleGoalClick}
          onCreatePlan={handleCreatePlan}
          onEditPlan={handleEditPlan}
          onStartSession={handleStartSession}
          onCreateSession={handleCreateSession}
          onEditSession={handleEditSession}
          onViewSession={handleViewSession}
          onCreateGoal={handleCreateGoal}
          onEditGoal={handleEditGoal}
          onDeletePlan={() => getUserPlans()}
          onDeleteSession={() => getUserSessions()}
          onDeleteGoal={() => getUserGoals()}
        />
      </div>

      {/* 모달들 (섹션 모달 제거) */}
      <WorkoutPlanModal
        isOpen={modalState.plan.isOpen}
        onClose={closePlanModal}
        onSave={handlePlanSubmit}
        plan={modalState.plan.data}
        machines={machines}
      />

      <WorkoutSessionModal
        isOpen={modalState.session.isOpen}
        onClose={closeSessionModal}
        onSave={handleSessionSubmit}
        session={modalState.session.data}
        plan={modalState.plan.data}
        machines={machines}
      />

      <WorkoutGoalModal
        isOpen={modalState.goal.isOpen}
        onClose={closeGoalModal}
        onSave={handleGoalSubmit}
        goal={modalState.goal.data}
      />
    </div>
  )
}
