import React from "react"
import type { WorkoutPlan } from "../../../../../../shared/api/workoutJournalApi"

interface PlansStatsProps {
  plans: WorkoutPlan[]
}

export const PlansStats: React.FC<PlansStatsProps> = ({ plans }) => {
  if (plans.length === 0) {
    return null
  }

  return (
    <div className="plans-stats">
      <div className="stat-item">
        <span className="stat-label">총 계획:</span>
        <span className="stat-value">{plans.length}개</span>
      </div>
      <div className="stat-item">
        <span className="stat-label">활성 계획:</span>
        <span className="stat-value">
          {plans.filter(plan => plan.isActive).length}개
        </span>
      </div>
    </div>
  )
}
