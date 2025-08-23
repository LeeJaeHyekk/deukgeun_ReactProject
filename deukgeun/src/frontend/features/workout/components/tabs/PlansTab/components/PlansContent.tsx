import React from "react"
import { WorkoutPlanCard } from "../../../../components/cards/WorkoutPlanCard"
import type { WorkoutPlan } from "../../../../../../shared/api/workoutJournalApi"

interface PlansContentProps {
  plans: WorkoutPlan[]
  onEditPlan: (planId: number) => void
  onStartSession: (planId: number) => void
  onDeletePlan: (planId: number) => void
  onCreatePlan: () => void
}

export const PlansContent: React.FC<PlansContentProps> = ({
  plans,
  onEditPlan,
  onStartSession,
  onDeletePlan,
  onCreatePlan,
}) => {
  if (plans.length === 0) {
    return (
      <div className="plans-content">
        <div className="no-plans-container">
          <div className="no-plans-icon">📋</div>
          <h3>아직 운동 계획이 없습니다</h3>
          <p>첫 번째 운동 계획을 만들어보세요!</p>
          <button className="create-first-plan-btn" onClick={onCreatePlan}>
            첫 계획 만들기
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="plans-content">
      <div className="plans-grid">
        {plans.map(plan => (
          <WorkoutPlanCard
            key={plan.id}
            plan={plan}
            onEdit={() => onEditPlan(plan.id)}
            onStartSession={() => onStartSession(plan.id)}
            onDelete={() => onDeletePlan(plan.id)}
          />
        ))}
      </div>
    </div>
  )
}
