import React, { useState, useEffect, useCallback } from "react"
import { useAuthContext } from "../../shared/contexts/AuthContext"
import { useWorkoutTimer } from "../../shared/contexts/WorkoutTimerContext"
import { useMachines } from "../../shared/hooks/useMachines"
import { Navigation } from "../../widgets/Navigation/Navigation"
import { TabNavigation } from "./components/navigation/TabNavigation"
import { TabContent } from "./components/navigation/TabContent"
import { TAB_CONFIG } from "./constants"
import { WorkoutPlanModal } from "./components/modals/WorkoutPlanModal/WorkoutPlanModal"
import { WorkoutSessionModal } from "./components/modals/WorkoutSessionModal/WorkoutSessionModal"
import { WorkoutGoalModal } from "./components/modals/WorkoutGoalModal/WorkoutGoalModal"
import {
  useWorkoutStoreData,
  useWorkoutPlansActions,
  useWorkoutSessionsActions,
  useWorkoutGoalsActions,
  useWorkoutUI,
  useWorkoutInitialization,
} from "./hooks/useWorkoutStore"
import type { TabType } from "./types"
import type {
  WorkoutPlan,
  WorkoutSession,
  WorkoutGoal,
  DashboardData,
} from "../../../shared/types"
import "./WorkoutJournalPage.css"

// 로깅 유틸리티
const logger = {
  info: (message: string, data?: any) => {
    if (import.meta.env.DEV) {
      console.log(`[WorkoutJournalPage] ${message}`, data || "")
    }
  },
  debug: (message: string, data?: any) => {
    if (import.meta.env.DEV) {
      console.debug(`[WorkoutJournalPage] ${message}`, data || "")
    }
  },
  warn: (message: string, data?: any) => {
    console.warn(`[WorkoutJournalPage] ${message}`, data || "")
  },
  error: (message: string, data?: any) => {
    console.error(`[WorkoutJournalPage] ${message}`, data || "")
  },
  modalOperation: (operation: string, modalType: string, data?: any) => {
    if (import.meta.env.DEV) {
      console.log(
        `[WorkoutJournalPage] ${operation} ${modalType} Modal`,
        data || ""
      )
    }
  },
  performance: (operation: string, duration: number) => {
    if (import.meta.env.DEV) {
      console.log(
        `[WorkoutJournalPage] ${operation} took ${duration.toFixed(2)}ms`
      )
    }
  },
}

function WorkoutJournalPageContent() {
  const { isLoggedIn, user } = useAuthContext()
  const [globalError, setGlobalError] = useState<string | null>(null)
  const [isDataLoading, setIsDataLoading] = useState(true)

  // Zustand Store 훅들
  const { plans, sessions, goals, loading, activeTab, modals } =
    useWorkoutStoreData()

  const { fetchPlans, createPlan, updatePlan, deletePlan } =
    useWorkoutPlansActions()

  const { fetchSessions, createSession, updateSession, deleteSession } =
    useWorkoutSessionsActions()

  const { fetchGoals, createGoal, updateGoal, deleteGoal } =
    useWorkoutGoalsActions()

  const {
    setActiveTab,
    openPlanModal,
    closePlanModal,
    openSessionModal,
    closeSessionModal,
    openGoalModal,
    closeGoalModal,
  } = useWorkoutUI()

  const { initializeWorkoutData } = useWorkoutInitialization()

  const { machines, loading: machinesLoading } = useMachines()

  // 타이머 컨텍스트
  const {
    timerState,
    startTimer,
    pauseTimer,
    resetTimer,
    getFormattedTime,
    getSessionProgress,
  } = useWorkoutTimer()

  // 데이터 로딩 상태 로깅
  useEffect(() => {
    logger.debug("Machines 데이터 상태", {
      machineCount: machines?.length || 0,
      machinesLoading,
    })
  }, [machines, machinesLoading])

  useEffect(() => {
    logger.debug("Plans 데이터 상태", {
      planCount: plans?.length || 0,
      plansLoading: loading.plans,
    })
  }, [plans, loading.plans])

  useEffect(() => {
    logger.debug("Sessions 데이터 상태", {
      sessionCount: sessions?.length || 0,
      sessionsLoading: loading.sessions,
    })
  }, [sessions, loading.sessions])

  useEffect(() => {
    logger.debug("Goals 데이터 상태", {
      goalCount: goals?.length || 0,
      goalsLoading: loading.goals,
    })
  }, [goals, loading.goals])

  // 페이지 로드 로깅
  useEffect(() => {
    logger.info("Page loaded", {
      isLoggedIn,
      userId: user?.id,
      timestamp: new Date().toISOString(),
    })

    // 인증 상태 디버깅
    if (isLoggedIn && user) {
      console.log(`🔐 [WorkoutJournalPage] 인증 상태 확인:`, {
        isLoggedIn,
        userId: user.id,
        userEmail: user.email,
        accessToken: user.accessToken
          ? `${user.accessToken.substring(0, 20)}...`
          : "토큰 없음",
      })

      // localStorage에서 직접 토큰 확인
      const storedToken = localStorage.getItem("accessToken")
      console.log(
        `🔐 [WorkoutJournalPage] localStorage 토큰:`,
        storedToken ? `${storedToken.substring(0, 20)}...` : "토큰 없음"
      )
    } else {
      console.log(`🔐 [WorkoutJournalPage] 로그인되지 않음:`, {
        isLoggedIn,
        user: !!user,
      })
    }
  }, [isLoggedIn, user?.id])

  // 데이터 초기화
  useEffect(() => {
    if (isLoggedIn && user) {
      const startTime = performance.now()
      logger.info("Initializing workout data")

      initializeWorkoutData()
        .then(() => {
          const endTime = performance.now()
          logger.performance("Data initialization", endTime - startTime)
          setIsDataLoading(false)
        })
        .catch(error => {
          logger.error("Failed to initialize workout data", error)
          setGlobalError("데이터를 불러오는데 실패했습니다.")
          setIsDataLoading(false)
        })
    }
  }, [isLoggedIn, user, initializeWorkoutData])

  // 탭 변경 핸들러
  const handleTabChange = useCallback(
    (tab: TabType) => {
      logger.debug("Tab changed", { from: activeTab, to: tab })
      setActiveTab(tab)
    },
    [activeTab, setActiveTab]
  )

  // 계획 관련 핸들러
  const handleCreatePlan = useCallback(() => {
    logger.modalOperation("Opening", "Plan Create", {})
    openPlanModal("create")
  }, [openPlanModal])

  const handleEditPlan = useCallback(
    (planId: number) => {
      const plan = plans.find(p => p.id === planId)
      if (plan) {
        logger.modalOperation("Opening", "Plan Edit", {
          planId,
          planName: plan.name,
        })
        openPlanModal("edit", plan)
      }
    },
    [plans, openPlanModal]
  )

  const handleDeletePlan = useCallback(
    async (planId: number) => {
      try {
        await deletePlan(planId)
        logger.info("Plan deleted successfully", { planId })
      } catch (error) {
        logger.error("Failed to delete plan", error)
        setGlobalError("계획을 삭제하는데 실패했습니다.")
      }
    },
    [deletePlan]
  )

  const handleStartSession = useCallback(
    (planId: number) => {
      const plan = plans.find(p => p.id === planId)
      if (plan) {
        logger.modalOperation("Opening", "Session Create from Plan", {
          planId,
          planName: plan.name,
        })
        openSessionModal("create", undefined)
      }
    },
    [plans, openSessionModal]
  )

  // 세션 관련 핸들러
  const handleCreateSession = useCallback(() => {
    logger.modalOperation("Opening", "Session Create", {})
    openSessionModal("create")
  }, [openSessionModal])

  const handleEditSession = useCallback(
    (sessionId: number) => {
      const session = sessions.find(s => s.id === sessionId)
      if (session) {
        logger.modalOperation("Opening", "Session Edit", {
          sessionId,
          sessionName: session.name,
        })
        openSessionModal("edit", session)
      }
    },
    [sessions, openSessionModal]
  )

  const handleViewSession = useCallback(
    (sessionId: number) => {
      const session = sessions.find(s => s.id === sessionId)
      if (session) {
        logger.modalOperation("Opening", "Session View", {
          sessionId,
          sessionName: session.name,
        })
        openSessionModal("view", session)
      }
    },
    [sessions, openSessionModal]
  )

  const handleDeleteSession = useCallback(
    async (sessionId: number) => {
      try {
        await deleteSession(sessionId)
        logger.info("Session deleted successfully", { sessionId })
      } catch (error) {
        logger.error("Failed to delete session", error)
        setGlobalError("세션을 삭제하는데 실패했습니다.")
      }
    },
    [deleteSession]
  )

  // 목표 관련 핸들러
  const handleCreateGoal = useCallback(() => {
    logger.modalOperation("Opening", "Goal Create", {})
    openGoalModal("create")
  }, [openGoalModal])

  const handleEditGoal = useCallback(
    (goalId: number) => {
      const goal = goals.find(g => g.id === goalId)
      if (goal) {
        logger.modalOperation("Opening", "Goal Edit", {
          goalId,
          goalTitle: goal.title,
        })
        openGoalModal("edit", goal)
      }
    },
    [goals, openGoalModal]
  )

  const handleDeleteGoal = useCallback(
    async (goalId: number) => {
      try {
        await deleteGoal(goalId)
        logger.info("Goal deleted successfully", { goalId })
      } catch (error) {
        logger.error("Failed to delete goal", error)
        setGlobalError("목표를 삭제하는데 실패했습니다.")
      }
    },
    [deleteGoal]
  )

  // 클릭 핸들러
  const handlePlanClick = useCallback(
    (planId: number) => {
      logger.debug("Plan clicked", { planId })
      handleEditPlan(planId)
    },
    [handleEditPlan]
  )

  const handleSessionClick = useCallback(
    (sessionId: number) => {
      logger.debug("Session clicked", { sessionId })
      handleViewSession(sessionId)
    },
    [handleViewSession]
  )

  const handleGoalClick = useCallback(
    (goalId: number) => {
      logger.debug("Goal clicked", { goalId })
      handleEditGoal(goalId)
    },
    [handleEditGoal]
  )

  // 로딩 상태 계산
  const isLoading =
    isDataLoading ||
    loading.plans.isLoading ||
    loading.sessions.isLoading ||
    loading.goals.isLoading

  // 에러 처리
  if (globalError) {
    return (
      <div className="workout-journal-page">
        <Navigation />
        <div className="error-container">
          <h2>오류가 발생했습니다</h2>
          <p>{globalError}</p>
          <button onClick={() => setGlobalError(null)}>다시 시도</button>
        </div>
      </div>
    )
  }

  return (
    <div className="workout-journal-page">
      <Navigation />

      <div className="workout-journal-content">
        <TabNavigation
          activeTab={activeTab}
          onTabChange={handleTabChange}
          tabs={TAB_CONFIG}
        />

        <TabContent
          activeTab={activeTab}
          isLoading={isLoading}
          dashboardData={null} // TODO: Implement dashboard data
          plans={plans as any}
          sessions={sessions as any}
          goals={goals as any}
          plansLoading={loading.plans.isLoading}
          sessionsLoading={loading.sessions.isLoading}
          goalsLoading={loading.goals.isLoading}
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
          onDeletePlan={handleDeletePlan}
          onDeleteSession={handleDeleteSession}
          onDeleteGoal={handleDeleteGoal}
        />
      </div>

      {/* 모달들 */}
      <WorkoutPlanModal />
      <WorkoutSessionModal />
      <WorkoutGoalModal />
    </div>
  )
}

// 메인 컴포넌트
export function WorkoutJournalPage() {
  const { isLoggedIn } = useAuthContext()

  if (!isLoggedIn) {
    return (
      <div className="workout-journal-page">
        <Navigation />
        <div className="auth-required">
          <h2>로그인이 필요합니다</h2>
          <p>운동 저널을 사용하려면 로그인해주세요.</p>
        </div>
      </div>
    )
  }

  return <WorkoutJournalPageContent />
}

export default WorkoutJournalPage
