import React, { useState, useEffect, useCallback, useMemo } from "react"
import { useAuthContext } from "../../shared/contexts/AuthContext"
import { Navigation } from "../../widgets/Navigation/Navigation"
import { LoadingSpinner } from "../../shared/ui/LoadingSpinner"
import { WorkoutPlanCard } from "./components/WorkoutPlanCard"
import { WorkoutSessionTimer } from "./components/WorkoutSessionTimer"
import { WorkoutCalendar } from "./components/WorkoutCalendar"
import { ProgressChart } from "./components/ProgressChart"
import { GoalProgressBar } from "./components/GoalProgressBar"
import { WorkoutPlanModal } from "./components/WorkoutPlanModal"
import { WorkoutSessionModal } from "./components/WorkoutSessionModal"
import { useWorkoutPlans } from "./hooks/useWorkoutPlans"
import { useWorkoutSessions } from "./hooks/useWorkoutSessions"
import { useWorkoutGoals } from "./hooks/useWorkoutGoals"
import { useMachines } from "../../shared/hooks/useMachines"
import {
  WorkoutJournalApi,
  DashboardData,
  WorkoutPlan,
  WorkoutSession,
} from "../../shared/api/workoutJournalApi"
import "./WorkoutJournalPage.css"

type TabType = "overview" | "plans" | "sessions" | "goals" | "progress"

export default function WorkoutJournalPage() {
  const { isLoggedIn, user } = useAuthContext()
  const [activeTab, setActiveTab] = useState<TabType>("overview")
  const [isLoading, setIsLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [globalError, setGlobalError] = useState<string | null>(null)

  // 모달 상태
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false)
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<WorkoutPlan | null>(null)
  const [selectedSession, setSelectedSession] = useState<WorkoutSession | null>(
    null
  )

  const {
    plans,
    loading: plansLoading,
    error: plansError,
    getUserPlans,
    createPlan,
    updatePlan,
    deletePlan,
    clearError: clearPlansError,
  } = useWorkoutPlans()

  const {
    sessions,
    loading: sessionsLoading,
    error: sessionsError,
    getUserSessions,
    createSession,
    updateSession,
    deleteSession,
    clearError: clearSessionsError,
  } = useWorkoutSessions()

  const {
    goals,
    loading: goalsLoading,
    error: goalsError,
    getUserGoals,
    createGoal,
    updateGoal,
    deleteGoal,
    clearError: clearGoalsError,
  } = useWorkoutGoals()

  const {
    machines,
    loading: machinesLoading,
    error: machinesError,
    getMachines,
  } = useMachines()

  // 에러 처리
  useEffect(() => {
    const errors = [
      plansError,
      sessionsError,
      goalsError,
      machinesError,
    ].filter(Boolean)
    if (errors.length > 0) {
      setGlobalError(errors[0])
    } else {
      setGlobalError(null)
    }
  }, [plansError, sessionsError, goalsError, machinesError])

  // 데이터 로딩
  const loadData = useCallback(async () => {
    if (!isLoggedIn || !user) return

    setIsLoading(true)
    setGlobalError(null)

    try {
      const [dashboard] = await Promise.all([
        WorkoutJournalApi.getDashboardData(),
        getUserPlans(),
        getUserSessions(),
        getUserGoals(),
        getMachines(),
      ])
      setDashboardData(dashboard)
    } catch (error) {
      console.error("데이터 로딩 실패:", error)
      setGlobalError("데이터를 불러오는데 실패했습니다.")
    } finally {
      setIsLoading(false)
    }
  }, [
    isLoggedIn,
    user,
    getUserPlans,
    getUserSessions,
    getUserGoals,
    getMachines,
  ])

  useEffect(() => {
    loadData()
  }, [loadData])

  // 계획 생성/수정 핸들러
  const handlePlanSave = useCallback(
    async (planData: Partial<WorkoutPlan>) => {
      try {
        if (selectedPlan) {
          await updatePlan(selectedPlan.plan_id, planData)
        } else {
          await createPlan(planData)
        }
        setIsPlanModalOpen(false)
        setSelectedPlan(null)
        clearPlansError()
      } catch (error) {
        console.error("계획 저장 실패:", error)
        // 에러는 hook에서 처리됨
      }
    },
    [selectedPlan, updatePlan, createPlan, clearPlansError]
  )

  // 계획 편집 핸들러
  const handlePlanEdit = useCallback((plan: WorkoutPlan) => {
    setSelectedPlan(plan)
    setIsPlanModalOpen(true)
  }, [])

  // 계획 삭제 핸들러
  const handlePlanDelete = useCallback(
    async (planId: number) => {
      if (window.confirm("정말로 이 운동 계획을 삭제하시겠습니까?")) {
        try {
          await deletePlan(planId)
          clearPlansError()
        } catch (error) {
          console.error("계획 삭제 실패:", error)
          // 에러는 hook에서 처리됨
        }
      }
    },
    [deletePlan, clearPlansError]
  )

  // 세션 시작 핸들러
  const handleSessionStart = useCallback((plan?: WorkoutPlan) => {
    if (plan) {
      setSelectedPlan(plan)
    }
    setIsSessionModalOpen(true)
  }, [])

  // 세션 저장 핸들러
  const handleSessionSave = useCallback(
    async (sessionData: Partial<WorkoutSession>) => {
      try {
        await createSession(sessionData)
        setIsSessionModalOpen(false)
        setSelectedPlan(null)
        clearSessionsError()
      } catch (error) {
        console.error("세션 저장 실패:", error)
        // 에러는 hook에서 처리됨
      }
    },
    [createSession, clearSessionsError]
  )

  // 세션 삭제 핸들러
  const handleSessionDelete = useCallback(
    async (sessionId: number) => {
      if (window.confirm("정말로 이 운동 세션을 삭제하시겠습니까?")) {
        try {
          await deleteSession(sessionId)
          clearSessionsError()
        } catch (error) {
          console.error("세션 삭제 실패:", error)
          // 에러는 hook에서 처리됨
        }
      }
    },
    [deleteSession, clearSessionsError]
  )

  // 목표 생성 핸들러
  const handleGoalCreate = useCallback(
    async (goalData: any) => {
      try {
        await createGoal(goalData)
        clearGoalsError()
      } catch (error) {
        console.error("목표 생성 실패:", error)
        // 에러는 hook에서 처리됨
      }
    },
    [createGoal, clearGoalsError]
  )

  // 차트 데이터 생성
  const chartData = useMemo(() => {
    const today = new Date()
    const data = []

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)

      // 해당 날짜의 운동 세션 수 계산
      const sessionsOnDate =
        sessions?.filter(session => {
          const sessionDate = new Date(session.start_time)
          return (
            sessionDate.getDate() === date.getDate() &&
            sessionDate.getMonth() === date.getMonth() &&
            sessionDate.getFullYear() === date.getFullYear()
          )
        }) || []

      data.push({
        date: date.toISOString().split("T")[0],
        value: sessionsOnDate.length,
        label: date.toLocaleDateString("ko-KR", {
          month: "short",
          day: "numeric",
        }),
      })
    }

    return data
  }, [sessions])

  // 로딩 상태 통합
  const isDataLoading =
    isLoading ||
    plansLoading ||
    sessionsLoading ||
    goalsLoading ||
    machinesLoading

  if (!isLoggedIn) {
    return (
      <div className="workout-journal-page">
        <Navigation />
        <div className="workout-journal-auth-required">
          <h2>로그인이 필요합니다</h2>
          <p>운동일지를 사용하려면 로그인해주세요.</p>
        </div>
      </div>
    )
  }

  if (isDataLoading) {
    return (
      <div className="workout-journal-page">
        <Navigation />
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="workout-journal-page">
      <Navigation />

      <div className="workout-journal-container">
        <header className="workout-journal-header">
          <h1>운동일지</h1>
          <p>당신의 운동 여정을 기록하고 추적하세요</p>
        </header>

        {/* 전역 에러 메시지 */}
        {globalError && (
          <div className="global-error-message">
            <p>{globalError}</p>
            <button onClick={() => setGlobalError(null)}>닫기</button>
          </div>
        )}

        <nav className="workout-journal-tabs">
          <button
            className={`tab-button ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            개요
          </button>
          <button
            className={`tab-button ${activeTab === "plans" ? "active" : ""}`}
            onClick={() => setActiveTab("plans")}
          >
            운동 계획
          </button>
          <button
            className={`tab-button ${activeTab === "sessions" ? "active" : ""}`}
            onClick={() => setActiveTab("sessions")}
          >
            운동 세션
          </button>
          <button
            className={`tab-button ${activeTab === "goals" ? "active" : ""}`}
            onClick={() => setActiveTab("goals")}
          >
            목표
          </button>
          <button
            className={`tab-button ${activeTab === "progress" ? "active" : ""}`}
            onClick={() => setActiveTab("progress")}
          >
            진행 상황
          </button>
        </nav>

        <main className="workout-journal-content">
          {activeTab === "overview" && (
            <div className="overview-section">
              <div className="overview-stats">
                <div className="stat-card">
                  <h3>총 운동 계획</h3>
                  <p className="stat-number">
                    {dashboardData?.summary.totalPlans || 0}
                  </p>
                </div>
                <div className="stat-card">
                  <h3>완료된 세션</h3>
                  <p className="stat-number">
                    {dashboardData?.summary.completedSessions || 0}
                  </p>
                </div>
                <div className="stat-card">
                  <h3>활성 목표</h3>
                  <p className="stat-number">
                    {dashboardData?.summary.activeGoals || 0}
                  </p>
                </div>
                <div className="stat-card">
                  <h3>주간 운동</h3>
                  <p className="stat-number">
                    {dashboardData?.weeklyStats.totalSessions || 0}
                  </p>
                </div>
              </div>

              <div className="overview-widgets">
                <div className="widget">
                  <h3>주간 통계</h3>
                  <div className="weekly-stats">
                    <p>
                      총 운동 시간:{" "}
                      {dashboardData?.weeklyStats.totalDuration || 0}분
                    </p>
                    <p>
                      평균 기분:{" "}
                      {dashboardData?.weeklyStats.averageMood?.toFixed(1) || 0}
                      /5
                    </p>
                    <p>
                      평균 에너지:{" "}
                      {dashboardData?.weeklyStats.averageEnergy?.toFixed(1) ||
                        0}
                      /5
                    </p>
                  </div>
                </div>

                <div className="widget">
                  <h3>목표 진행률</h3>
                  {dashboardData?.activeGoals.slice(0, 3).map(goal => (
                    <GoalProgressBar key={goal.goal_id} goal={goal} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "plans" && (
            <div className="plans-section">
              <div className="section-header">
                <h2>운동 계획</h2>
                <button
                  className="create-plan-button"
                  onClick={() => {
                    setSelectedPlan(null)
                    setIsPlanModalOpen(true)
                  }}
                >
                  새 계획 만들기
                </button>
              </div>

              {plansLoading ? (
                <LoadingSpinner />
              ) : plansError ? (
                <div className="error-message">
                  {plansError}
                  <button onClick={clearPlansError}>다시 시도</button>
                </div>
              ) : (
                <div className="plans-grid">
                  {plans?.map(plan => (
                    <WorkoutPlanCard
                      key={plan.plan_id}
                      plan={plan}
                      onEdit={() => handlePlanEdit(plan)}
                      onDelete={() => handlePlanDelete(plan.plan_id)}
                      onStart={() => handleSessionStart(plan)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "sessions" && (
            <div className="sessions-section">
              <div className="section-header">
                <h2>운동 세션</h2>
                <button
                  className="start-session-button"
                  onClick={() => handleSessionStart()}
                >
                  새 세션 시작
                </button>
              </div>

              {sessionsLoading ? (
                <LoadingSpinner />
              ) : sessionsError ? (
                <div className="error-message">
                  {sessionsError}
                  <button onClick={clearSessionsError}>다시 시도</button>
                </div>
              ) : (
                <div className="sessions-list">
                  {sessions?.map(session => (
                    <div key={session.session_id} className="session-item">
                      <h3>{session.session_name}</h3>
                      <p>
                        시작: {new Date(session.start_time).toLocaleString()}
                      </p>
                      {session.end_time && (
                        <p>
                          완료: {new Date(session.end_time).toLocaleString()}
                        </p>
                      )}
                      <span className={`status-badge ${session.status}`}>
                        {session.status === "completed"
                          ? "완료"
                          : session.status === "in_progress"
                            ? "진행 중"
                            : session.status === "paused"
                              ? "일시정지"
                              : "취소됨"}
                      </span>
                      <button
                        className="delete-session-button"
                        onClick={() => handleSessionDelete(session.session_id)}
                      >
                        삭제
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "goals" && (
            <div className="goals-section">
              <div className="section-header">
                <h2>운동 목표</h2>
                <button
                  className="create-goal-button"
                  onClick={() => {
                    // 목표 생성 모달 구현 필요
                    console.log("목표 생성 기능 구현 필요")
                  }}
                >
                  새 목표 설정
                </button>
              </div>

              {goalsLoading ? (
                <LoadingSpinner />
              ) : goalsError ? (
                <div className="error-message">
                  {goalsError}
                  <button onClick={clearGoalsError}>다시 시도</button>
                </div>
              ) : (
                <div className="goals-list">
                  {goals?.map(goal => (
                    <div key={goal.id} className="goal-item">
                      <h3>{goal.title || goal.type}</h3>
                      <p>
                        목표: {goal.targetValue} {goal.unit}
                      </p>
                      <p>
                        현재: {goal.currentValue} {goal.unit}
                      </p>
                      <GoalProgressBar goal={goal} />
                      <button
                        className="delete-goal-button"
                        onClick={() => {
                          if (
                            window.confirm("정말로 이 목표를 삭제하시겠습니까?")
                          ) {
                            deleteGoal(goal.id)
                          }
                        }}
                      >
                        삭제
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "progress" && (
            <div className="progress-section">
              <h2>진행 상황</h2>
              <div className="progress-charts">
                <div className="chart-container">
                  <h3>운동 빈도</h3>
                  <ProgressChart
                    data={chartData}
                    title="주간 운동 빈도"
                    unit="회"
                    color="#4caf50"
                  />
                </div>
                <div className="chart-container">
                  <h3>근력 진행</h3>
                  <ProgressChart
                    data={[]}
                    title="근력 진행 상황"
                    unit="kg"
                    color="#2196f3"
                  />
                </div>
              </div>
              <WorkoutCalendar sessions={sessions || []} />
            </div>
          )}
        </main>
      </div>

      {/* 모달들 */}
      <WorkoutPlanModal
        isOpen={isPlanModalOpen}
        onClose={() => {
          setIsPlanModalOpen(false)
          setSelectedPlan(null)
        }}
        onSave={handlePlanSave}
        plan={selectedPlan}
        machines={machines || []}
      />

      <WorkoutSessionModal
        isOpen={isSessionModalOpen}
        onClose={() => {
          setIsSessionModalOpen(false)
          setSelectedSession(null)
        }}
        onSave={handleSessionSave}
        session={selectedSession}
        plan={selectedPlan}
        machines={machines || []}
      />
    </div>
  )
}
