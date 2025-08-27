import React from "react"
import { ActiveGoalsSection } from "./ActiveGoalsSection"
import { CompletedGoalsSection } from "./CompletedGoalsSection"
import type { WorkoutGoal } from "@shared/types"

interface GoalsContentProps {
  goals: WorkoutGoal[]
  selectedGoalId: number | null
  onCreateGoal: () => void
  onEditGoal: (goalId: number) => void
  onDeleteGoal: (goalId: number) => void
  onGoalSelect: (goalId: number | null) => void
}

export const GoalsContent: React.FC<GoalsContentProps> = ({
  goals,
  selectedGoalId,
  onCreateGoal,
  onEditGoal,
  onDeleteGoal,
  onGoalSelect,
}) => {
  const activeGoals = goals.filter(goal => !goal.isCompleted)
  const completedGoals = goals.filter(goal => goal.isCompleted)

  if (goals.length === 0) {
    return (
      <div className="goals-content">
        <div className="no-goals-container">
          <div className="no-goals-icon">🎯</div>
          <h3>아직 운동 목표가 없습니다</h3>
          <p>첫 번째 운동 목표를 설정해보세요!</p>
          <button className="create-first-goal-btn" onClick={onCreateGoal}>
            첫 목표 설정
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="goals-content">
      <ActiveGoalsSection
        activeGoals={activeGoals}
        selectedGoalId={selectedGoalId}
        onEditGoal={onEditGoal}
        onDeleteGoal={onDeleteGoal}
        onGoalSelect={onGoalSelect}
      />
      <CompletedGoalsSection 
        completedGoals={completedGoals}
        selectedGoalId={selectedGoalId}
        onGoalSelect={onGoalSelect}
      />
    </div>
  )
}
