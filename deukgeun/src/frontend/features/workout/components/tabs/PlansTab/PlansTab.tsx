import React from "react"
import type { WorkoutPlan } from "../../../../../shared/api/workoutJournalApi"
import { PlansHeader } from "./components/PlansHeader"
import { PlansContent } from "./components/PlansContent"
import { PlansStats } from "./components/PlansStats"
import { usePlansActions } from "./hooks/usePlansActions"

interface PlansTabProps {
  plans: WorkoutPlan[]
  isLoading: boolean
  onCreatePlan: () => void
  onEditPlan: (planId: number) => void
  onStartSession: (planId: number) => void
  onDeletePlan: (planId: number) => void
}

export function PlansTab({
  plans,
  isLoading,
  onCreatePlan,
  onEditPlan,
  onStartSession,
  onDeletePlan,
}: PlansTabProps) {
  const { handleDeletePlan } = usePlansActions(onDeletePlan)

  if (isLoading) {
    return (
      <div className="plans-tab">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>계획을 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="plans-tab">
      <PlansHeader onCreatePlan={onCreatePlan} />
      <PlansContent
        plans={plans}
        onEditPlan={onEditPlan}
        onStartSession={onStartSession}
        onDeletePlan={handleDeletePlan}
        onCreatePlan={onCreatePlan}
      />
      <PlansStats plans={plans} />
    </div>
  )
}
