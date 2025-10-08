import React from "react"

interface GoalsHeaderProps {
  onCreateGoal: () => void
  totalGoals: number
  selectedGoalId: number | null
  onGoalSelect: (goalId: number | null) => void
}

export const GoalsHeader: React.FC<GoalsHeaderProps> = ({
  onCreateGoal,
  totalGoals,
  selectedGoalId,
  onGoalSelect,
}) => {
  return (
    <div className="goals-header">
      <h2>운동 목표 ({totalGoals}개)</h2>
      <button
        className="create-goal-btn"
        onClick={onCreateGoal}
        aria-label="새 운동 목표 만들기"
      >
        <span className="icon">🎯</span>새 목표 만들기
      </button>
    </div>
  )
}
