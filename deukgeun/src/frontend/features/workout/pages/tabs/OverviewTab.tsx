import React from "react"
import { DashboardData } from "../../../../shared/api/workoutJournalApi"
import { WorkoutPlanCard } from "../../components/cards/WorkoutPlanCard"
import { SessionCard } from "../../components/cards/SessionCard"
import { GoalProgressBar } from "../../components/cards/GoalProgressBar"
import { ProgressChart } from "../../components/charts/ProgressChart"
import { WorkoutCalendar } from "../../components/charts/WorkoutCalendar"
import "./OverviewTab.css"

interface OverviewTabProps {
  dashboardData: DashboardData | null
  isLoading: boolean
  onPlanClick: (planId: number) => void
  onSessionClick: (sessionId: number) => void
  onGoalClick: (goalId: number) => void
}

export function OverviewTab({
  dashboardData,
  isLoading,
  onPlanClick,
  onSessionClick,
  onGoalClick,
}: OverviewTabProps) {
  if (isLoading) {
    return (
      <div className="overview-tab">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>대시보드 데이터를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (!dashboardData) {
    return (
      <div className="overview-tab">
        <div className="no-data-container">
          <h3>운동 데이터가 없습니다</h3>
          <p>첫 번째 운동 계획을 만들어보세요!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="overview-tab">
      <div className="overview-grid">
        {/* 통계 카드 섹션 */}
        <section className="stats-section">
          <h3>운동 통계</h3>
          <div className="stats-grid">
            <div className="stat-card">
              <h4>총 운동 계획</h4>
              <p>{dashboardData.summary.totalPlans || 0}개</p>
            </div>
            <div className="stat-card">
              <h4>완료한 세션</h4>
              <p>{dashboardData.summary.completedSessions || 0}개</p>
            </div>
            <div className="stat-card">
              <h4>활성 목표</h4>
              <p>{dashboardData.summary.activeGoals || 0}개</p>
            </div>
          </div>
        </section>

        {/* 최근 세션 섹션 */}
        <section className="recent-sessions-section">
          <h3>최근 운동 세션</h3>
          <div className="sessions-grid">
            {dashboardData.recentSessions?.slice(0, 3).map(session => (
              <SessionCard
                key={session.id}
                session={session}
                onClick={() => onSessionClick(session.id)}
                compact={true}
              />
            ))}
            {(!dashboardData.recentSessions ||
              dashboardData.recentSessions.length === 0) && (
              <div className="no-data-message">
                <p>아직 운동 세션이 없습니다</p>
              </div>
            )}
          </div>
        </section>

        {/* 목표 진행률 섹션 */}
        <section className="goals-progress-section">
          <h3>목표 진행률</h3>
          <div className="goals-grid">
            {dashboardData.activeGoals?.map(goal => (
              <GoalProgressBar
                key={goal.id}
                goal={goal}
                onClick={() => onGoalClick(goal.id)}
                compact={true}
              />
            ))}
            {(!dashboardData.activeGoals ||
              dashboardData.activeGoals.length === 0) && (
              <div className="no-data-message">
                <p>설정된 목표가 없습니다</p>
              </div>
            )}
          </div>
        </section>

        {/* 차트 섹션 */}
        <section className="charts-section">
          <h3>진행 상황</h3>
          <div className="charts-grid">
            <div className="chart-container">
              <h4>주간 운동 현황</h4>
              <ProgressChart data={dashboardData.recentProgress} />
            </div>
            <div className="chart-container">
              <h4>운동 캘린더</h4>
              <WorkoutCalendar sessions={dashboardData.recentSessions} />
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
