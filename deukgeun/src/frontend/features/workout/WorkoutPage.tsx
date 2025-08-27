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
  useSharedState,
} from "./hooks/useWorkoutStore"
import { USE_MOCK_DATA } from "./data/mockData"
import type { TabType } from "./types"
import type {
  WorkoutPlan,
  WorkoutSession,
  WorkoutGoal,
} from "../../../shared/types"
import type { DashboardData } from "./types"
import styles from "./WorkoutPage.module.css"

// 로깅 유틸리티
const logger = {
  info: (message: string, data?: any) => {
    if (import.meta.env.DEV) {
      console.log(`[WorkoutPage] ${message}`, data || "")
    }
  },
  debug: (message: string, data?: any) => {
    if (import.meta.env.DEV) {
      console.debug(`[WorkoutPage] ${message}`, data || "")
    }
  },
  warn: (message: string, data?: any) => {
    console.warn(`[WorkoutPage] ${message}`, data || "")
  },
  error: (message: string, data?: any) => {
    console.error(`[WorkoutPage] ${message}`, data || "")
  },
  modalOperation: (operation: string, modalType: string, data?: any) => {
    if (import.meta.env.DEV) {
      console.log(`[WorkoutPage] ${operation} ${modalType} Modal`, data || "")
    }
  },
  performance: (operation: string, duration: number) => {
    if (import.meta.env.DEV) {
      console.log(`[WorkoutPage] ${operation} took ${duration.toFixed(2)}ms`)
    }
  },
}

function WorkoutPageContent() {
  const { isLoggedIn, user } = useAuthContext()
  const [globalError, setGlobalError] = useState<string | null>(null)
  const [isDataLoading, setIsDataLoading] = useState(true)

  logger.info("워크아웃 페이지 컴포넌트 렌더링", {
    isLoggedIn,
    userId: user?.id,
    timestamp: new Date().toISOString(),
  })

  // Zustand Store 훅들
  const {
    plans,
    sessions,
    goals,
    dashboardData,
    loading,
    activeTab,
    modals,
    tabStates,
    sharedState,
  } = useWorkoutStoreData()

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
    updateTabState,
    resetTabState,
  } = useWorkoutUI()

  const { initializeWorkoutData } = useWorkoutInitialization()

  // 공유 상태 훅
  const { removeNotification } = useSharedState()

  // 기계 데이터 훅
  const { machines } = useMachines()

  // 로딩 상태 계산
  const isLoading =
    loading.plans.isLoading ||
    loading.sessions.isLoading ||
    loading.goals.isLoading ||
    isDataLoading

  // 탭 변경 핸들러
  const handleTabChange = useCallback(
    (tab: TabType) => {
      logger.info("탭 변경", { from: activeTab, to: tab })
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
  // 주석 처리: 새 세션 생성 기능 비활성화
  // const handleCreateSession = useCallback(() => {
  //   logger.modalOperation("Opening", "Session Create", {})
  //   openSessionModal("create")
  // }, [openSessionModal])

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

  // 데이터 초기화
  useEffect(() => {
    const initializeData = async () => {
      const startTime = performance.now()
      logger.info("데이터 초기화 시작", {
        isLoggedIn,
        userId: user?.id,
        machinesCount: machines.length,
      })

      try {
        await initializeWorkoutData()
        logger.performance("데이터 초기화", performance.now() - startTime)
        logger.info("데이터 초기화 완료", {
          plansCount: plans.length,
          sessionsCount: sessions.length,
          goalsCount: goals.length,
        })
      } catch (error) {
        logger.error("데이터 초기화 실패", error)
        setGlobalError("데이터를 불러오는 중 오류가 발생했습니다.")
      } finally {
        setIsDataLoading(false)
      }
    }

    if (isLoggedIn) {
      initializeData()
    }
  }, [isLoggedIn, initializeWorkoutData])

  // 에러 처리
  if (globalError) {
    return (
      <div className={styles.workoutPage}>
        <Navigation />
        <div className={styles.errorContainer}>
          <h2>오류가 발생했습니다</h2>
          <p>{globalError}</p>
          <button onClick={() => window.location.reload()}>
            페이지 새로고침
          </button>
        </div>
      </div>
    )
  }

  // 로딩 상태
  if (isLoading) {
    return (
      <div className={styles.workoutPage}>
        <Navigation />
        <div className={styles.workoutPageLoading}>
          <div className={styles.loadingSpinner}>
            <div className={styles.spinner}></div>
            <p>운동 데이터를 불러오는 중...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.workoutPage}>
      <Navigation />

      <div className={styles.workoutPageContent}>
        <header className={styles.workoutPageHeader}>
          <div className={styles.workoutPageHeaderContent}>
            <div className={styles.headerText}>
              <h1>운동 관리</h1>
              <p>
                운동 계획, 진행 상황, 목표, 실시간 세션 트래킹, 분석을 한
                페이지에서 확인
              </p>
            </div>
          </div>
        </header>

        <TabNavigation
          activeTab={activeTab}
          onTabChange={handleTabChange}
          tabs={TAB_CONFIG}
        />

        <TabContent
          activeTab={activeTab}
          isLoading={isLoading}
          dashboardData={dashboardData as any}
          plans={plans as any}
          sessions={sessions as any}
          goals={goals as any}
          workoutStats={null} // TODO: 운동 통계 데이터 추가
          machines={machines}
          plansLoading={loading.plans.isLoading}
          sessionsLoading={loading.sessions.isLoading}
          goalsLoading={loading.goals.isLoading}
          onPlanClick={handlePlanClick}
          onSessionClick={handleSessionClick}
          onGoalClick={handleGoalClick}
          onCreatePlan={handleCreatePlan}
          onEditPlan={handleEditPlan}
          onStartSession={handleStartSession}
          // onCreateSession={handleCreateSession}  // 주석 처리: 새 세션 생성 기능 비활성화
          onEditSession={handleEditSession}
          onViewSession={handleViewSession}
          onCreateGoal={handleCreateGoal}
          onEditGoal={handleEditGoal}
          onDeletePlan={handleDeletePlan}
          onDeleteSession={handleDeleteSession}
          onDeleteGoal={handleDeleteGoal}
        />
      </div>

      {/* 알림 시스템 */}
      {sharedState.notifications.length > 0 && (
        <div className={styles.notificationsContainer}>
          {sharedState.notifications.map(notification => (
            <div key={notification.id} className={styles.notification}>
              <div className={styles.notificationContent}>
                <span className={styles.notificationMessage}>
                  {notification.message}
                </span>
                <button
                  className={styles.notificationClose}
                  onClick={() => removeNotification(notification.id)}
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 모달들 */}
      <WorkoutPlanModal />
      <WorkoutSessionModal />
      <WorkoutGoalModal />
    </div>
  )
}

// 메인 컴포넌트
export default function WorkoutPage() {
  const { isLoggedIn } = useAuthContext()

  if (!isLoggedIn) {
    return (
      <div className={styles.workoutPage}>
        <Navigation />
        <div className={styles.authRequired}>
          <h2>로그인이 필요합니다</h2>
          <p>운동 관리를 사용하려면 로그인해주세요.</p>
        </div>
      </div>
    )
  }

  return <WorkoutPageContent />
}
