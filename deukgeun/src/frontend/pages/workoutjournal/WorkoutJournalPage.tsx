import React, { useState, useEffect } from "react"
import { useAuthContext } from "../../shared/contexts/AuthContext"
import { Navigation } from "../../widgets/Navigation/Navigation"
import { LoadingSpinner } from "../../shared/ui/LoadingSpinner"
import { WorkoutPlanCard } from "./components/WorkoutPlanCard"
import { WorkoutSessionTimer } from "./components/WorkoutSessionTimer"
import { WorkoutCalendar } from "./components/WorkoutCalendar"
import { ProgressChart } from "./components/ProgressChart"
import { GoalProgressBar } from "./components/GoalProgressBar"
import { useWorkoutPlans } from "./hooks/useWorkoutPlans"
import { useWorkoutSessions } from "./hooks/useWorkoutSessions"
import { useWorkoutGoals } from "./hooks/useWorkoutGoals"
import {
  WorkoutJournalApi,
  DashboardData,
} from "../../shared/api/workoutJournalApi"
import "./WorkoutJournalPage.css"

export default function WorkoutJournalPage() {
  const { isLoggedIn, user } = useAuthContext()
  const [activeTab, setActiveTab] = useState<
    "overview" | "plans" | "sessions" | "goals" | "progress"
  >("overview")
  const [isLoading, setIsLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)

  const {
    plans,
    loading: plansLoading,
    error: plansError,
    getUserPlans,
  } = useWorkoutPlans()

  const {
    sessions,
    loading: sessionsLoading,
    error: sessionsError,
    getUserSessions,
  } = useWorkoutSessions()

  const {
    goals,
    loading: goalsLoading,
    error: goalsError,
    getUserGoals,
  } = useWorkoutGoals()

  useEffect(() => {
    if (isLoggedIn && user) {
      const loadData = async () => {
        setIsLoading(true)
        try {
          const [dashboard] = await Promise.all([
            WorkoutJournalApi.getDashboardData(),
            getUserPlans(),
            getUserSessions(),
            getUserGoals(),
          ])
          setDashboardData(dashboard)
        } catch (error) {
          console.error("데이터 로딩 실패:", error)
        } finally {
          setIsLoading(false)
        }
      }
      loadData()
    }
  }, [isLoggedIn, user])

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

  if (isLoading) {
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
                <button className="create-plan-button">새 계획 만들기</button>
              </div>

              {plansLoading ? (
                <LoadingSpinner />
              ) : plansError ? (
                <div className="error-message">{plansError}</div>
              ) : (
                <div className="plans-grid">
                  {plans?.map(plan => (
                    <WorkoutPlanCard key={plan.plan_id} plan={plan} />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "sessions" && (
            <div className="sessions-section">
              <div className="section-header">
                <h2>운동 세션</h2>
                <button className="start-session-button">새 세션 시작</button>
              </div>

              {sessionsLoading ? (
                <LoadingSpinner />
              ) : sessionsError ? (
                <div className="error-message">{sessionsError}</div>
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
                <button className="create-goal-button">새 목표 설정</button>
              </div>

              {goalsLoading ? (
                <LoadingSpinner />
              ) : goalsError ? (
                <div className="error-message">{goalsError}</div>
              ) : (
                <div className="goals-list">
                  {goals?.map(goal => (
                    <div key={goal.goal_id} className="goal-item">
                      <h3>{goal.goal_type}</h3>
                      <p>
                        목표: {goal.target_value} {goal.unit}
                      </p>
                      <p>
                        현재: {goal.current_value} {goal.unit}
                      </p>
                      <GoalProgressBar goal={goal} />
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
                  <ProgressChart data={[]} />
                </div>
                <div className="chart-container">
                  <h3>근력 진행</h3>
                  <ProgressChart data={[]} />
                </div>
              </div>
              <WorkoutCalendar />
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
