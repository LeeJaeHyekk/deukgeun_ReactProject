import React from "react"
import { WorkoutPlanCard } from "../cards/WorkoutPlanCard"
import { Button } from "../ui/Button"
import { WorkoutPlan } from "../../types"

interface WorkoutPlansSectionProps {
  plans: WorkoutPlan[]
  onCreatePlan: () => void
  onAddExercise: () => void
}

export function WorkoutPlansSection({
  plans,
  onCreatePlan,
  onAddExercise,
}: WorkoutPlansSectionProps) {
  return (
    <section className="workout-section" id="plans">
      <div className="workout-section-header">
        <div>
          <h2 className="workout-section-title">계획 관리</h2>
          <p className="workout-section-description">
            새 계획 생성 및 운동 추가 기능 제공
          </p>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <Button onClick={onCreatePlan} variant="primary">
            새 계획 생성
          </Button>
          <Button onClick={onAddExercise} variant="secondary">
            운동 추가
          </Button>
        </div>
      </div>

      <div className="card-list desktop-3 tablet-2 mobile-1">
        {plans.slice(0, 3).map(plan => (
          <WorkoutPlanCard
            key={plan.id}
            plan={plan}
            onViewDetails={() => console.log("View details:", plan.id)}
            onEdit={() => console.log("Edit plan:", plan.id)}
            onDelete={() => console.log("Delete plan:", plan.id)}
          />
        ))}
      </div>
    </section>
  )
}
