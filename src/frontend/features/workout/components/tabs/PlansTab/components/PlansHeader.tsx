import React from "react"

interface PlansHeaderProps {
  onCreatePlan: () => void
}

export const PlansHeader: React.FC<PlansHeaderProps> = ({ onCreatePlan }) => {
  return (
    <div className="plans-header">
      <h2>운동 계획</h2>
      <button
        className="create-plan-btn"
        onClick={onCreatePlan}
        aria-label="새 운동 계획 만들기"
      >
        <span className="icon">+</span>새 계획 만들기
      </button>
    </div>
  )
}
