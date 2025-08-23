import React from "react"
import { ProgressChart } from "../../../../components/charts/ProgressChart"
import { WorkoutCalendar } from "../../../../components/charts/WorkoutCalendar"
import type { DashboardData } from "../../../../../../shared/api/workoutJournalApi"

interface ChartsSectionProps {
  dashboardData: DashboardData
}

export const ChartsSection: React.FC<ChartsSectionProps> = ({
  dashboardData,
}) => {
  return (
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
  )
}
