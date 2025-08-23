import React from "react"

interface GoalsHeaderProps {
  onCreateGoal: () => void
}

export const GoalsHeader: React.FC<GoalsHeaderProps> = ({ onCreateGoal }) => {
  return (
    <div className="goals-header">
      <h2>운동 목표</h2>
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
