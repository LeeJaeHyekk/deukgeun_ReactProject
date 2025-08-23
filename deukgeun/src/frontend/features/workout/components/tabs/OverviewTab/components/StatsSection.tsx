import React from "react"
import type { DashboardData } from "../../../../../../shared/api/workoutJournalApi"

interface StatsSectionProps {
  dashboardData: DashboardData
}

export const StatsSection: React.FC<StatsSectionProps> = ({
  dashboardData,
}) => {
  return (
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
  )
}
