import React from "react"
import "./GoalComparison.css"

interface GoalComparisonProps {
  targetValue: number
  currentValue: number
  unit: string
  title?: string
}

export function GoalComparison({
  targetValue,
  currentValue,
  unit,
  title = "목표 진행률",
}: GoalComparisonProps) {
  const progress = Math.min((currentValue / targetValue) * 100, 100)
  const isCompleted = currentValue >= targetValue

  return (
    <div className="goal-comparison">
      <h3>{title}</h3>
      <div className="goal-info">
        <div className="goal-item current">
          <span className="goal-label">현재</span>
          <span className="goal-value">
            {currentValue}
            {unit}
          </span>
        </div>
        <div className="goal-item target">
          <span className="goal-label">목표</span>
          <span className="goal-value">
            {targetValue}
            {unit}
          </span>
        </div>
      </div>
      <div className="goal-progress">
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <span className="progress-text">{progress.toFixed(1)}%</span>
      </div>
      {isCompleted && (
        <div className="goal-completed">
          <span>🎉 목표 달성!</span>
        </div>
      )}
    </div>
  )
}
