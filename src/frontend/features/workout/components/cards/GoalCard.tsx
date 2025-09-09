import React from "react"
import { WorkoutGoal } from "../../types"
import { ProgressBar } from "../ui/ProgressBar"
import { Button } from "../ui/Button"

interface GoalCardProps {
  goal: WorkoutGoal
  onEdit: (updates: Partial<WorkoutGoal>) => void
  onDelete: () => void
}

export function GoalCard({ goal, onEdit, onDelete }: GoalCardProps) {
  const percentage = Math.min((goal.currentValue / goal.targetValue) * 100, 100)
  const isCompleted = goal.isCompleted || percentage >= 100

  return (
    <div className={`goal-card ${isCompleted ? "completed" : ""}`}>
      <div className="card-header">
        <div className="card-title">
          <h3>{goal.title}</h3>
          {isCompleted && <span className="completion-badge">달성!</span>}
        </div>
        <div className="card-actions">
          <Button onClick={() => onEdit({})} size="small" variant="secondary">
            수정
          </Button>
          <Button onClick={onDelete} size="small" variant="danger">
            삭제
          </Button>
        </div>
      </div>

      <div className="card-content">
        {goal.description && (
          <p className="card-description">{goal.description}</p>
        )}

        <div className="goal-progress">
          <ProgressBar
            currentValue={goal.currentValue}
            targetValue={goal.targetValue}
            unit={goal.unit}
          />
        </div>

        <div className="goal-details">
          <div className="detail-item">
            <span className="detail-label">목표:</span>
            <span className="detail-value">
              {goal.targetValue} {goal.unit}
            </span>
          </div>
          <div className="detail-item">
            <span className="detail-label">현재:</span>
            <span className="detail-value">
              {goal.currentValue} {goal.unit}
            </span>
          </div>
          {goal.deadline && (
            <div className="detail-item">
              <span className="detail-label">기한:</span>
              <span className="detail-value">
                {new Date(goal.deadline).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
