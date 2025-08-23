import React from "react"
import { GoalsHeader } from "./components/GoalsHeader"
import { GoalsContent } from "./components/GoalsContent"
import { GoalsStats } from "./components/GoalsStats"
import { useGoalsActions } from "./hooks/useGoalsActions"
import type { WorkoutGoal } from "../../../types"

interface GoalsTabProps {
  goals: WorkoutGoal[]
  isLoading: boolean
  onCreateGoal: () => void
  onEditGoal: (goalId: number) => void
  onDeleteGoal: (goalId: number) => void
}

export function GoalsTab({
  goals,
  isLoading,
  onCreateGoal,
  onEditGoal,
  onDeleteGoal,
}: GoalsTabProps) {
  const { handleDeleteGoal } = useGoalsActions(onDeleteGoal)

  if (isLoading) {
    return (
      <div className="goals-tab">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>목표를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="goals-tab">
      <GoalsHeader onCreateGoal={onCreateGoal} />
      <GoalsContent
        goals={goals}
        onCreateGoal={onCreateGoal}
        onEditGoal={onEditGoal}
        onDeleteGoal={handleDeleteGoal}
      />
      {goals.length > 0 && <GoalsStats goals={goals} />}
    </div>
  )
}
