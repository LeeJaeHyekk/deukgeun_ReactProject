import React, { useState, useEffect } from "react"
import { useAuthRedux } from "@frontend/shared/hooks/useAuthRedux"
import { useMachines } from "@shared/hooks/useMachines"
import { Navigation } from "@widgets/Navigation/Navigation"
import { TabNavigation } from "./components/navigation/TabNavigation"
import { TabContent } from "./components/navigation/TabContent"
import { WorkoutPageHeader } from "./components/WorkoutPageHeader"
import { WorkoutPageLoading } from "./components/WorkoutPageLoading"
import { WorkoutPageError } from "./components/WorkoutPageError"
import { WorkoutNotifications } from "./components/WorkoutNotifications"
import { WorkoutPlanModal } from "./components/modals/WorkoutPlanModal/WorkoutPlanModal"
import { WorkoutSessionModal } from "./components/modals/WorkoutSessionModal/WorkoutSessionModal"
import { WorkoutGoalModal } from "./components/modals/WorkoutGoalModal/WorkoutGoalModal"
import {
  useWorkoutStoreData,
  useWorkoutInitialization,
  useSharedState,
  useWorkoutNotifications as useNotifications,
  useWorkoutErrors,
  useWorkoutTimer,
} from "./hooks/useWorkoutStore"
import { useWorkoutHandlers } from "./hooks/useWorkoutHandlers"
import { TAB_CONFIG } from "./constants"
import { isDefined, isString, isNumber } from "../../shared/utils/typeGuards"
import { handleError } from "../../shared/utils/errorHandling"
import type { TabType } from "./types"
import type {
  WorkoutPlan,
  WorkoutSession,
  WorkoutGoal,
  DashboardData,
} from "./types"
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
  const { isLoggedIn: isAuthenticated, user } = useAuthRedux()
  const [isDataLoading, setIsDataLoading] = useState(true)
  const [selectedGoalId, setSelectedGoalId] = useState<number | undefined>(
    undefined
  )

  logger.info("워크아웃 페이지 컴포넌트 렌더링", {
    isAuthenticated,
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

  const { initializeWorkoutData } = useWorkoutInitialization()

  // 공유 상태 훅
  const { removeNotification } = useNotifications()
  const { setGlobalError } = useWorkoutErrors()
  const { timer, updateTimer } = useWorkoutTimer()

  // 기계 데이터 훅
  const { machines } = useMachines()

  // 핸들러 훅
  const {
    handleCreatePlan,
    handleEditPlan,
    handleDeletePlan,
    handleStartSession,
    handleEditSession,
    handleViewSession,
    handleDeleteSession,
    handleCreateGoal,
    handleEditGoal,
    handleDeleteGoal,
    handlePlanClick,
    handleSessionClick,
    handleGoalClick,
    handleTabChange,
  } = useWorkoutHandlers()

  // 로딩 상태 계산
  const isLoading =
    loading.plans.isLoading ||
    loading.sessions.isLoading ||
    loading.goals.isLoading ||
    isDataLoading

  // 탭 변경 핸들러
  const onTabChange = (tab: TabType) => {
    logger.info("탭 변경", { from: activeTab, to: tab })
    handleTabChange(tab, setSelectedGoalId)
  }

  // 클릭 핸들러들 (타입 안전성 보장)
  const onPlanClick = (planId: number) => {
    if (!isNumber(planId) || planId <= 0) {
      logger.error("Invalid plan ID", { planId })
      return
    }
    logger.debug("Plan clicked", { planId })
    handlePlanClick(planId, plans)
  }

  const onSessionClick = (sessionId: number) => {
    if (!isNumber(sessionId) || sessionId <= 0) {
      logger.error("Invalid session ID", { sessionId })
      return
    }
    logger.debug("Session clicked", { sessionId })
    handleSessionClick(sessionId, sessions)
  }

  const onGoalClick = (goalId: number) => {
    if (!isNumber(goalId) || goalId <= 0) {
      logger.error("Invalid goal ID", { goalId })
      return
    }
    logger.debug("Goal clicked", { goalId })
    handleGoalClick(goalId, setSelectedGoalId)
  }

  // 데이터 초기화
  useEffect(() => {
    if (!isAuthenticated) {
      console.log("[WorkoutPage] 로그인되지 않은 상태 - 데이터 초기화 스킵")
      return
    }

    console.log("[WorkoutPage] 로그인 상태 확인:", {
      isAuthenticated,
      userId: user?.id,
      userEmail: user?.email,
      timestamp: new Date().toISOString(),
    })

    // 토큰 상태 확인
    const token = localStorage.getItem("accessToken")
    console.log("[WorkoutPage] 토큰 상태 확인:", {
      hasToken: !!token,
      tokenPreview: token ? `${token.substring(0, 20)}...` : "없음",
      timestamp: new Date().toISOString(),
    })

    const initializeData = async () => {
      const startTime = performance.now()
      setIsDataLoading(true)

      console.log("[WorkoutPage] 데이터 초기화 시작", {
        isAuthenticated,
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
      const appError = handleError(error, 'WorkoutPage.initializeData')
      logger.error("데이터 초기화 실패", appError)
      setGlobalError("데이터를 불러오는 중 오류가 발생했습니다.")
    } finally {
      setIsDataLoading(false)
    }
    }

    if (isAuthenticated) {
      initializeData()
    }
  }, [isAuthenticated, user?.id]) // initializeWorkoutData 의존성 제거

  // 타이머 업데이트
  useEffect(() => {
    if (!timer.isRunning) return

    const interval = setInterval(() => {
      updateTimer(timer.seconds + 1000)
    }, 1000)

    return () => clearInterval(interval)
  }, [timer.isRunning, timer.seconds, updateTimer])

  // 에러 처리
  if (sharedState.globalError) {
    return (
      <div className={styles.workoutPage}>
        <Navigation />
        <WorkoutPageError 
          error={sharedState.globalError}
          onRetry={() => window.location.reload()}
        />
      </div>
    )
  }

  // 로딩 상태
  if (isLoading) {
    return (
      <div className={styles.workoutPage}>
        <Navigation />
        <WorkoutPageLoading message="운동 데이터를 불러오는 중..." />
      </div>
    )
  }

  return (
    <div className={styles.workoutPage}>
      <Navigation />

      <div className={styles.workoutPageContent}>
        <WorkoutPageHeader />

        <TabNavigation
          activeTab={activeTab}
          onTabChange={onTabChange}
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
          onPlanClick={onPlanClick}
          onSessionClick={onSessionClick}
          onGoalClick={onGoalClick}
          onCreatePlan={handleCreatePlan}
          onEditPlan={(planId) => handleEditPlan(planId, plans)}
          onStartSession={(planId) => handleStartSession(planId, plans)}
          onEditSession={(sessionId) => handleEditSession(sessionId, sessions)}
          onViewSession={(sessionId) => handleViewSession(sessionId, sessions)}
          onCreateGoal={handleCreateGoal}
          onEditGoal={(goalId) => handleEditGoal(goalId, goals)}
          onDeletePlan={handleDeletePlan}
          onDeleteSession={handleDeleteSession}
          onDeleteGoal={handleDeleteGoal}
          selectedGoalId={selectedGoalId}
        />
      </div>

      {/* 알림 시스템 */}
      <WorkoutNotifications
        notifications={sharedState.notifications}
        onRemove={removeNotification}
      />

      {/* 모달들 */}
      <WorkoutPlanModal />
      <WorkoutSessionModal />
      <WorkoutGoalModal />
    </div>
  )
}

// 메인 컴포넌트
function WorkoutPage() {
  const { isLoggedIn: isAuthenticated } = useAuthRedux()

  if (!isAuthenticated) {
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

export default WorkoutPage
export { WorkoutPage }
