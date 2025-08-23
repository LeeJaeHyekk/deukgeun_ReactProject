import React from "react"
import { GoalProgressBar } from "../../../../components/cards/GoalProgressBar"
import type { DashboardData } from "../../../../../../shared/api/workoutJournalApi"

interface GoalsProgressSectionProps {
  dashboardData: DashboardData
  onGoalClick: (goalId: number) => void
}

export const GoalsProgressSection: React.FC<GoalsProgressSectionProps> = ({
  dashboardData,
  onGoalClick,
}) => {
  return (
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
  )
}
