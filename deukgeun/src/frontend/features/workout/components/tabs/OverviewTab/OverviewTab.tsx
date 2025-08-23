import React from "react"
import type { DashboardData } from "../../../../../shared/api/workoutJournalApi"
import { StatsSection } from "./components/StatsSection"
import { RecentSessionsSection } from "./components/RecentSessionsSection"
import { GoalsProgressSection } from "./components/GoalsProgressSection"
import { ChartsSection } from "./components/ChartsSection"
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
        <StatsSection dashboardData={dashboardData} />
        <RecentSessionsSection
          dashboardData={dashboardData}
          onSessionClick={onSessionClick}
        />
        <GoalsProgressSection
          dashboardData={dashboardData}
          onGoalClick={onGoalClick}
        />
        <ChartsSection dashboardData={dashboardData} />
      </div>
    </div>
  )
}
