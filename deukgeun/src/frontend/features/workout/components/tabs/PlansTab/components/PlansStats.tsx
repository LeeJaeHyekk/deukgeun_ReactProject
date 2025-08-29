import React from "react"
import type { WorkoutPlan } from "../../../../../../shared/types"

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
          {plans.filter(plan => plan.status === "active").length}개
        </span>
      </div>
    </div>
  )
}
