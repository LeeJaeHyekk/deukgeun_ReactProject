import React from "react"
import { WorkoutGoal } from "../../../../types/workout"
import "./GoalProgressBar.css"

interface GoalProgressBarProps {
  goal: WorkoutGoal
}

export function GoalProgressBar({ goal }: GoalProgressBarProps) {
  const getGoalTypeText = (type: string) => {
    switch (type) {
      case "weight_lift":
        return "근력 운동"
      case "endurance":
        return "지구력"
      case "weight_loss":
        return "체중 감량"
      case "muscle_gain":
        return "근육 증가"
      case "strength":
        return "힘"
      case "flexibility":
        return "유연성"
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

  const progressPercentage = Math.min(goal.progress_percentage, 100)

  return (
    <div className="goal-progress-bar">
      <div className="goal-header">
        <h4 className="goal-title">{getGoalTypeText(goal.goal_type)}</h4>
        <span className={`goal-status ${goal.status}`}>
          {goal.status === "active"
            ? "진행 중"
            : goal.status === "completed"
              ? "완료"
              : goal.status === "paused"
                ? "일시정지"
                : "취소됨"}
        </span>
      </div>

      <div className="goal-info">
        <div className="goal-target">
          <span className="target-label">목표:</span>
          <span className="target-value">
            {goal.target_value} {goal.unit}
          </span>
        </div>
        <div className="goal-current">
          <span className="current-label">현재:</span>
          <span className="current-value">
            {goal.current_value} {goal.unit}
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
          시작: {new Date(goal.start_date).toLocaleDateString()}
        </span>
        <span className="target-date">
          목표: {new Date(goal.target_date).toLocaleDateString()}
        </span>
      </div>
    </div>
  )
}
