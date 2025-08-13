import React from "react"
import type { WorkoutGoal } from "../../../../types"
import "./GoalProgressBar.css"

interface GoalProgressBarProps {
  goal: WorkoutGoal
}

export function GoalProgressBar({ goal }: GoalProgressBarProps) {
  const getGoalTypeText = (type: string) => {
    switch (type) {
      case "weight":
        return "무게"
      case "reps":
        return "반복 횟수"
      case "duration":
        return "지속 시간"
      case "frequency":
        return "빈도"
      case "streak":
        return "연속 기록"
      default:
        return type
    }
  }

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return "#4caf50"
    if (percentage >= 60) return "#ff9800"
    if (percentage >= 40) return "#2196f3"
    return "#f44336"
  }

  const progressPercentage = Math.min(
    (goal.currentValue / goal.targetValue) * 100,
    100
  )

  return (
    <div className="goal-progress-bar">
      <div className="goal-header">
        <h4 className="goal-title">
          {goal.title || getGoalTypeText(goal.type)}
        </h4>
        <span
          className={`goal-status ${goal.isCompleted ? "completed" : "active"}`}
        >
          {goal.isCompleted ? "완료" : "진행 중"}
        </span>
      </div>

      <div className="goal-info">
        <div className="goal-target">
          <span className="target-label">목표:</span>
          <span className="target-value">
            {goal.targetValue} {goal.unit}
          </span>
        </div>
        <div className="goal-current">
          <span className="current-label">현재:</span>
          <span className="current-value">
            {goal.currentValue} {goal.unit}
          </span>
        </div>
      </div>

      <div className="progress-container">
        <div
          className="progress-bar"
          style={{
            width: `${progressPercentage}%`,
            backgroundColor: getProgressColor(progressPercentage),
          }}
        />
        <span className="progress-text">{progressPercentage.toFixed(1)}%</span>
      </div>

      <div className="goal-dates">
        <span className="start-date">
          시작: {new Date(goal.createdAt).toLocaleDateString()}
        </span>
        {goal.deadline && (
          <span className="target-date">
            목표: {new Date(goal.deadline).toLocaleDateString()}
          </span>
        )}
      </div>
    </div>
  )
}
