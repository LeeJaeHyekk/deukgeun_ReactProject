import React from "react"
import { WorkoutPlanDTO } from "../../types"
import { ProgressBar } from "../ui/ProgressBar"
import { Badge } from "../ui/Badge"
import { Button } from "../ui/Button"

interface WorkoutPlanCardProps {
  plan: WorkoutPlanDTO
  onViewDetails: () => void
  onEdit: () => void
  onDelete: () => void
}

export function WorkoutPlanCard({
  plan,
  onViewDetails,
  onEdit,
  onDelete,
}: WorkoutPlanCardProps) {
  return (
    <div className="workout-plan-card">
      <div className="card-header">
        <div className="card-title">
          <h3>{plan.name}</h3>
          {plan.badge && (
            <Badge level={plan.difficulty} milestone={plan.badge} />
          )}
        </div>
        <div className="card-actions">
          <Button onClick={onViewDetails} size="small" variant="primary">
            상세보기
          </Button>
          <Button onClick={onEdit} size="small" variant="secondary">
            수정
          </Button>
          <Button onClick={onDelete} size="small" variant="danger">
            삭제
          </Button>
        </div>
      </div>

      <div className="card-content">
        {plan.description && (
          <p className="card-description">{plan.description}</p>
        )}

        <div className="card-stats">
          <div className="stat-item">
            <span className="stat-label">운동 수:</span>
            <span className="stat-value">{plan.exercises.length}개</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">소요 시간:</span>
            <span className="stat-value">{plan.totalDurationMinutes}분</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">연속 달성:</span>
            <span className="stat-value">{plan.streak}일</span>
          </div>
        </div>

        <div className="card-progress">
          <ProgressBar
            currentValue={plan.progress}
            targetValue={100}
            unit="%"
          />
        </div>
      </div>
    </div>
  )
}
