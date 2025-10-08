import React from "react"
import { GoalProgressBar } from "../../../../components/cards/GoalProgressBar"
import type { WorkoutGoal } from "@shared/types"

interface ActiveGoalsSectionProps {
  activeGoals: WorkoutGoal[]
  selectedGoalId: number | null
  onEditGoal: (goalId: number) => void
  onDeleteGoal: (goalId: number) => void
  onGoalSelect: (goalId: number | null) => void
}

export const ActiveGoalsSection: React.FC<ActiveGoalsSectionProps> = ({
  activeGoals,
  selectedGoalId,
  onEditGoal,
  onDeleteGoal,
  onGoalSelect,
}) => {
  return (
    <section className="active-goals-section">
      <h3>진행 중인 목표 ({activeGoals.length})</h3>
      {activeGoals.length > 0 ? (
        <div className="goals-grid">
          {activeGoals.map(goal => (
            <GoalProgressBar
              key={goal.id}
              goal={goal}
              isSelected={selectedGoalId === goal.id}
              onEdit={() => onEditGoal(goal.id)}
              onDelete={() => onDeleteGoal(goal.id)}
              onSelect={() => onGoalSelect(goal.id)}
            />
          ))}
        </div>
      ) : (
        <div className="no-active-goals">
          <p>진행 중인 목표가 없습니다</p>
        </div>
      )}
    </section>
  )
}
