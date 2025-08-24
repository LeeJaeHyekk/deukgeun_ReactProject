import React, { useState, useEffect, useCallback, useMemo } from "react"
import { WorkoutOverviewSection } from "./components/sections/WorkoutOverviewSection"
import { WorkoutGoalsSection } from "./components/sections/WorkoutGoalsSection"
import { WorkoutPlansSection } from "./components/sections/WorkoutPlansSection"
import { WorkoutSessionsSection } from "./components/sections/WorkoutSessionsSection"
import { SessionTrackingSection } from "./components/sections/SessionTrackingSection"
import { WorkoutRemindersSection } from "./components/sections/WorkoutRemindersSection"
import { WorkoutProgressSection } from "./components/sections/WorkoutProgressSection"
import { WorkoutAnalyticsSection } from "./components/sections/WorkoutAnalyticsSection"
import { CreatePlanModal } from "./components/modals/CreatePlanModal"
import { AddExerciseModal } from "./components/modals/AddExerciseModal"
import { CreateGoalModal } from "./components/modals/CreateGoalModal"
import { useWorkoutData } from "./hooks/useWorkoutData"
import { useWorkoutActions } from "./hooks/useWorkoutActions"
import { Navigation } from "../../widgets/Navigation/Navigation"
import "./WorkoutPage.css"

interface WorkoutPageProps {
  className?: string
}

export default function WorkoutPage({ className = "" }: WorkoutPageProps) {
  // 모달 상태 관리
  const [modalStates, setModalStates] = useState({
    createPlan: false,
    addExercise: false,
    createGoal: false,
  })

  // 페이지 상태 관리
  const [pageState, setPageState] = useState({
    isLoading: false,
    error: null as string | null,
    lastRefresh: new Date(),
  })

  // 데이터 훅
  const {
    workoutPlans,
    workoutGoals,
    workoutSessions,
    workoutStats,
    workoutReminders,
    isLoading: dataLoading,
    error: dataError,
  } = useWorkoutData()

  // 액션 훅
  const {
    createWorkoutPlan,
    createWorkoutGoal,
    updateWorkoutGoal,
    deleteWorkoutGoal,
    createWorkoutSession,
    updateWorkoutSession,
    deleteWorkoutSession,
    createWorkoutReminder,
    updateWorkoutReminder,
    toggleWorkoutReminder,
    deleteWorkoutReminder,
  } = useWorkoutActions()

  // 로딩 및 에러 상태 통합
  useEffect(() => {
    setPageState(prev => ({
      ...prev,
      isLoading: dataLoading,
      error: dataError,
    }))
  }, [dataLoading, dataError])

  // 모달 핸들러들 (useCallback으로 최적화)
  const handleModalToggle = useCallback(
    (modalName: keyof typeof modalStates) => {
      setModalStates(prev => ({
        ...prev,
        [modalName]: !prev[modalName],
      }))
    },
    []
  )

  const handleCloseModal = useCallback(
    (modalName: keyof typeof modalStates) => {
      setModalStates(prev => ({
        ...prev,
        [modalName]: false,
      }))
    },
    []
  )

  // 목표 관리 핸들러들
  const handleCreateGoal = useCallback(
    async (goalData: any) => {
      try {
        setPageState(prev => ({ ...prev, isLoading: true, error: null }))
        const result = await createWorkoutGoal(goalData)
        if (result.success) {
          handleCloseModal("createGoal")
          console.log("목표가 성공적으로 생성되었습니다.")
        } else {
          setPageState(prev => ({
            ...prev,
            error: result.error || "목표 생성에 실패했습니다.",
          }))
        }
      } catch (error) {
        setPageState(prev => ({
          ...prev,
          error:
            error instanceof Error
              ? error.message
              : "알 수 없는 오류가 발생했습니다.",
        }))
      } finally {
        setPageState(prev => ({ ...prev, isLoading: false }))
      }
    },
    [createWorkoutGoal, handleCloseModal]
  )

  const handleUpdateGoal = useCallback(
    async (goalId: number, goalData: any) => {
      try {
        setPageState(prev => ({ ...prev, isLoading: true, error: null }))
        const result = await updateWorkoutGoal(goalId, goalData)
        if (result.success) {
          console.log("목표가 성공적으로 업데이트되었습니다.")
        } else {
          setPageState(prev => ({
            ...prev,
            error: result.error || "목표 업데이트에 실패했습니다.",
          }))
        }
      } catch (error) {
        setPageState(prev => ({
          ...prev,
          error:
            error instanceof Error
              ? error.message
              : "알 수 없는 오류가 발생했습니다.",
        }))
      } finally {
        setPageState(prev => ({ ...prev, isLoading: false }))
      }
    },
    [updateWorkoutGoal]
  )

  const handleDeleteGoal = useCallback(
    async (goalId: number) => {
      if (!window.confirm("정말로 이 목표를 삭제하시겠습니까?")) return

      try {
        setPageState(prev => ({ ...prev, isLoading: true, error: null }))
        const result = await deleteWorkoutGoal(goalId)
        if (result.success) {
          console.log("목표가 성공적으로 삭제되었습니다.")
        } else {
          setPageState(prev => ({
            ...prev,
            error: result.error || "목표 삭제에 실패했습니다.",
          }))
        }
      } catch (error) {
        setPageState(prev => ({
          ...prev,
          error:
            error instanceof Error
              ? error.message
              : "알 수 없는 오류가 발생했습니다.",
        }))
      } finally {
        setPageState(prev => ({ ...prev, isLoading: false }))
      }
    },
    [deleteWorkoutGoal]
  )

  // 계획 관리 핸들러들
  const handleCreatePlan = useCallback(
    async (planData: any) => {
      try {
        setPageState(prev => ({ ...prev, isLoading: true, error: null }))
        const result = await createWorkoutPlan(planData)
        if (result.success) {
          handleCloseModal("createPlan")
          console.log("계획이 성공적으로 생성되었습니다.")
        } else {
          setPageState(prev => ({
            ...prev,
            error: result.error || "계획 생성에 실패했습니다.",
          }))
        }
      } catch (error) {
        setPageState(prev => ({
          ...prev,
          error:
            error instanceof Error
              ? error.message
              : "알 수 없는 오류가 발생했습니다.",
        }))
      } finally {
        setPageState(prev => ({ ...prev, isLoading: false }))
      }
    },
    [createWorkoutPlan, handleCloseModal]
  )

  // 세션 관리 핸들러들
  const handleStartSession = useCallback(
    async (planId: number) => {
      try {
        setPageState(prev => ({ ...prev, isLoading: true, error: null }))
        const result = await createWorkoutSession({
          planId,
          status: "in_progress",
        } as any)
        if (result.success) {
          console.log("세션이 시작되었습니다.")
        } else {
          setPageState(prev => ({
            ...prev,
            error: result.error || "세션 시작에 실패했습니다.",
          }))
        }
      } catch (error) {
        setPageState(prev => ({
          ...prev,
          error:
            error instanceof Error
              ? error.message
              : "알 수 없는 오류가 발생했습니다.",
        }))
      } finally {
        setPageState(prev => ({ ...prev, isLoading: false }))
      }
    },
    [createWorkoutSession]
  )

  const handlePauseSession = useCallback(
    async (sessionId: number) => {
      try {
        setPageState(prev => ({ ...prev, isLoading: true, error: null }))
        const result = await updateWorkoutSession(sessionId, {
          status: "paused",
        })
        if (result.success) {
          console.log("세션이 일시정지되었습니다.")
        } else {
          setPageState(prev => ({
            ...prev,
            error: result.error || "세션 일시정지에 실패했습니다.",
          }))
        }
      } catch (error) {
        setPageState(prev => ({
          ...prev,
          error:
            error instanceof Error
              ? error.message
              : "알 수 없는 오류가 발생했습니다.",
        }))
      } finally {
        setPageState(prev => ({ ...prev, isLoading: false }))
      }
    },
    [updateWorkoutSession]
  )

  const handleCompleteSession = useCallback(
    async (sessionId: number, sessionData: any) => {
      try {
        setPageState(prev => ({ ...prev, isLoading: true, error: null }))
        const result = await updateWorkoutSession(sessionId, {
          ...sessionData,
          status: "completed",
        })
        if (result.success) {
          console.log("세션이 완료되었습니다.")
        } else {
          setPageState(prev => ({
            ...prev,
            error: result.error || "세션 완료에 실패했습니다.",
          }))
        }
      } catch (error) {
        setPageState(prev => ({
          ...prev,
          error:
            error instanceof Error
              ? error.message
              : "알 수 없는 오류가 발생했습니다.",
        }))
      } finally {
        setPageState(prev => ({ ...prev, isLoading: false }))
      }
    },
    [updateWorkoutSession]
  )

  const handleDeleteSession = useCallback(
    async (sessionId: number) => {
      if (!window.confirm("정말로 이 세션을 삭제하시겠습니까?")) return

      try {
        setPageState(prev => ({ ...prev, isLoading: true, error: null }))
        const result = await deleteWorkoutSession(sessionId)
        if (result.success) {
          console.log("세션이 성공적으로 삭제되었습니다.")
        } else {
          setPageState(prev => ({
            ...prev,
            error: result.error || "세션 삭제에 실패했습니다.",
          }))
        }
      } catch (error) {
        setPageState(prev => ({
          ...prev,
          error:
            error instanceof Error
              ? error.message
              : "알 수 없는 오류가 발생했습니다.",
        }))
      } finally {
        setPageState(prev => ({ ...prev, isLoading: false }))
      }
    },
    [deleteWorkoutSession]
  )

  // 리마인더 관리 핸들러들
  const handleCreateReminder = useCallback(
    async (reminderData: any) => {
      try {
        setPageState(prev => ({ ...prev, isLoading: true, error: null }))
        const result = await createWorkoutReminder(reminderData)
        if (result.success) {
          console.log("리마인더가 성공적으로 생성되었습니다.")
        } else {
          setPageState(prev => ({
            ...prev,
            error: result.error || "리마인더 생성에 실패했습니다.",
          }))
        }
      } catch (error) {
        setPageState(prev => ({
          ...prev,
          error:
            error instanceof Error
              ? error.message
              : "알 수 없는 오류가 발생했습니다.",
        }))
      } finally {
        setPageState(prev => ({ ...prev, isLoading: false }))
      }
    },
    [createWorkoutReminder]
  )

  const handleUpdateReminder = useCallback(
    async (reminderId: number, reminderData: any) => {
      try {
        setPageState(prev => ({ ...prev, isLoading: true, error: null }))
        const result = await updateWorkoutReminder(reminderId, reminderData)
        if (result.success) {
          console.log("리마인더가 성공적으로 업데이트되었습니다.")
        } else {
          setPageState(prev => ({
            ...prev,
            error: result.error || "리마인더 업데이트에 실패했습니다.",
          }))
        }
      } catch (error) {
        setPageState(prev => ({
          ...prev,
          error:
            error instanceof Error
              ? error.message
              : "알 수 없는 오류가 발생했습니다.",
        }))
      } finally {
        setPageState(prev => ({ ...prev, isLoading: false }))
      }
    },
    [updateWorkoutReminder]
  )

  const handleToggleReminder = useCallback(
    async (reminderId: number) => {
      try {
        const reminder = workoutReminders.find(r => r.id === reminderId)
        const result = await toggleWorkoutReminder(
          reminderId,
          !reminder?.isActive
        )
        if (result.success) {
          console.log("리마인더 상태가 변경되었습니다.")
        } else {
          setPageState(prev => ({
            ...prev,
            error: result.error || "리마인더 상태 변경에 실패했습니다.",
          }))
        }
      } catch (error) {
        setPageState(prev => ({
          ...prev,
          error:
            error instanceof Error
              ? error.message
              : "알 수 없는 오류가 발생했습니다.",
        }))
      }
    },
    [toggleWorkoutReminder]
  )

  const handleDeleteReminder = useCallback(
    async (reminderId: number) => {
      if (!window.confirm("정말로 이 리마인더를 삭제하시겠습니까?")) return

      try {
        setPageState(prev => ({ ...prev, isLoading: true, error: null }))
        const result = await deleteWorkoutReminder(reminderId)
        if (result.success) {
          console.log("리마인더가 성공적으로 삭제되었습니다.")
        } else {
          setPageState(prev => ({
            ...prev,
            error: result.error || "리마인더 삭제에 실패했습니다.",
          }))
        }
      } catch (error) {
        setPageState(prev => ({
          ...prev,
          error:
            error instanceof Error
              ? error.message
              : "알 수 없는 오류가 발생했습니다.",
        }))
      } finally {
        setPageState(prev => ({ ...prev, isLoading: false }))
      }
    },
    [deleteWorkoutReminder]
  )

  // 에러 초기화 핸들러
  const handleClearError = useCallback(() => {
    setPageState(prev => ({ ...prev, error: null }))
  }, [])

  // 페이지 새로고침 핸들러
  const handleRefresh = useCallback(() => {
    setPageState(prev => ({
      ...prev,
      lastRefresh: new Date(),
      error: null,
    }))
    // 데이터를 다시 불러오는 로직이 있다면 여기에 추가
  }, [])

  // 메모이제이션된 데이터
  const activeSessions = useMemo(
    () => workoutSessions.filter(session => session.status === "in_progress"),
    [workoutSessions]
  )

  const completedSessions = useMemo(
    () => workoutSessions.filter(session => session.status === "completed"),
    [workoutSessions]
  )

  const activeReminders = useMemo(
    () => workoutReminders.filter(reminder => reminder.isActive),
    [workoutReminders]
  )

  // 로딩 상태
  if (pageState.isLoading && !workoutPlans.length && !workoutGoals.length) {
    return (
      <div className="workout-page-loading" role="status" aria-live="polite">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>운동 데이터를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`workout-page ${className}`} role="main">
      <Navigation />

      {/* 에러 알림 */}
      {pageState.error && (
        <div className="error-notification" role="alert">
          <div className="error-content">
            <span className="error-message">{pageState.error}</span>
            <button
              className="error-close"
              onClick={handleClearError}
              aria-label="에러 알림 닫기"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <header className="workout-page-header">
        <div className="header-content">
          <div className="header-text">
            <h1>운동 관리</h1>
            <p>
              운동 계획, 진행 상황, 목표, 리마인더, 실시간 세션 트래킹, 분석을
              한 페이지에서 확인
            </p>
          </div>
          <div className="header-actions">
            <button
              className="refresh-button"
              onClick={handleRefresh}
              disabled={pageState.isLoading}
              aria-label="페이지 새로고침"
            >
              <span className="refresh-icon">↻</span>
              새로고침
            </button>
          </div>
        </div>
      </header>

      <main className="workout-page-content">
        {/* 개요 섹션 */}
        <WorkoutOverviewSection
          workoutPlans={workoutPlans}
          workoutStats={workoutStats}
          activeSessions={activeSessions}
        />

        {/* 목표 섹션 */}
        <WorkoutGoalsSection
          goals={workoutGoals}
          onUpdateGoal={handleUpdateGoal}
          onDeleteGoal={handleDeleteGoal}
          onCreateGoal={() => handleModalToggle("createGoal")}
        />

        {/* 계획 관리 섹션 */}
        <WorkoutPlansSection
          plans={workoutPlans}
          onCreatePlan={() => handleModalToggle("createPlan")}
          onAddExercise={() => handleModalToggle("addExercise")}
        />

        {/* 운동 세션 섹션 */}
        <WorkoutSessionsSection
          sessions={workoutSessions}
          onStartSession={handleStartSession}
          onPauseSession={handlePauseSession}
          onCompleteSession={handleCompleteSession}
          onDeleteSession={handleDeleteSession}
        />

        {/* 실시간 세션 트래킹 */}
        {activeSessions.length > 0 && (
          <SessionTrackingSection
            activeSessions={activeSessions}
            onUpdateSession={updateWorkoutSession}
          />
        )}

        {/* 리마인더 섹션 */}
        <WorkoutRemindersSection
          reminders={workoutReminders}
          onCreateReminder={handleCreateReminder}
          onEditReminder={reminderId => handleUpdateReminder(reminderId, {})}
          onToggleReminder={handleToggleReminder}
          onDeleteReminder={handleDeleteReminder}
        />

        {/* 운동 진행 상황 */}
        <WorkoutProgressSection
          workoutStats={workoutStats}
          completedSessions={completedSessions}
        />

        {/* 분석 대시보드 */}
        <WorkoutAnalyticsSection
          workoutStats={workoutStats}
          workoutGoals={workoutGoals}
          workoutSessions={workoutSessions}
        />
      </main>

      {/* 모달들 */}
      <CreatePlanModal
        isOpen={modalStates.createPlan}
        onClose={() => handleCloseModal("createPlan")}
        onCreatePlan={handleCreatePlan}
      />

      <AddExerciseModal
        isOpen={modalStates.addExercise}
        onClose={() => handleCloseModal("addExercise")}
      />

      <CreateGoalModal
        isOpen={modalStates.createGoal}
        onClose={() => handleCloseModal("createGoal")}
        onCreateGoal={handleCreateGoal}
      />

      {/* 전역 로딩 오버레이 */}
      {pageState.isLoading && (
        <div
          className="global-loading-overlay"
          role="status"
          aria-live="polite"
        >
          <div className="loading-content">
            <div className="spinner"></div>
            <p>처리 중...</p>
          </div>
        </div>
      )}
    </div>
  )
}
