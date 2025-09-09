import React, { useState } from "react"
import { GoalCard } from "../../components/cards/GoalCard"
import { CreateGoalModal } from "../modals/CreateGoalModal"
import { Button } from "../ui/Button"
import { WorkoutGoal } from "../../types"

interface WorkoutGoalsSectionProps {
  goals: WorkoutGoal[]
  onUpdateGoal: (goalId: number, updates: Partial<WorkoutGoal>) => void
  onDeleteGoal: (goalId: number) => void
  onCreateGoal: (
    goalData: Omit<WorkoutGoal, "id" | "createdAt" | "updatedAt">
  ) => void
}

export function WorkoutGoalsSection({
  goals,
  onUpdateGoal,
  onDeleteGoal,
  onCreateGoal,
}: WorkoutGoalsSectionProps) {
  const [isAddingGoal, setIsAddingGoal] = useState(false)

  const handleCreateGoal = (
    goalData: Omit<WorkoutGoal, "id" | "createdAt" | "updatedAt">
  ) => {
    onCreateGoal(goalData)
    setIsAddingGoal(false)
  }

  return (
    <section className="workout-section" id="goals">
      <div className="workout-section-header">
        <div>
          <h2 className="workout-section-title">목표</h2>
          <p className="workout-section-description">
            운동 목표와 달성 상태를 보여주며, 목표 추가/수정 가능
          </p>
        </div>
        <Button onClick={() => setIsAddingGoal(true)} variant="primary">
          목표 추가
        </Button>
      </div>

      <div className="card-list desktop-2 tablet-2 mobile-1">
        {goals.map(goal => (
          <GoalCard
            key={goal.id}
            goal={goal}
            onEdit={updates => onUpdateGoal(goal.id, updates)}
            onDelete={() => onDeleteGoal(goal.id)}
          />
        ))}
      </div>

      <CreateGoalModal
        isOpen={isAddingGoal}
        onClose={() => setIsAddingGoal(false)}
        onCreateGoal={handleCreateGoal}
      />
    </section>
  )
}
