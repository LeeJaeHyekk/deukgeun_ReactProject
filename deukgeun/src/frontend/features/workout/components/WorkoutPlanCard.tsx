import React from "react"
import { Edit, Trash2, Play } from "lucide-react"
import type { WorkoutPlan } from "../../../shared/api/workoutJournalApi"
import "./WorkoutPlanCard.css"

interface WorkoutPlanCardProps {
  plan: WorkoutPlan
  onEdit?: () => void
  onDelete?: () => void
  onStart?: () => void
}

export function WorkoutPlanCard({
  plan,
  onEdit,
  onDelete,
  onStart,
}: WorkoutPlanCardProps) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "#4caf50"
      case "intermediate":
        return "#ff9800"
      case "advanced":
        return "#f44336"
      default:
        return "#666"
    }
  }

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "초급"
      case "intermediate":
        return "중급"
      case "advanced":
        return "고급"
      default:
        return difficulty
    }
  }

  const handleCardClick = (e: React.MouseEvent) => {
    // 버튼 클릭 시 카드 클릭 이벤트 방지
    if ((e.target as HTMLElement).closest(".action-button")) {
      return
    }
    onEdit?.()
  }

  return (
    <div className="workout-plan-card" onClick={handleCardClick}>
      <div className="plan-header">
        <h3 className="plan-name">{plan.plan_name}</h3>
        <div
          className="difficulty-badge"
          style={{
            backgroundColor: getDifficultyColor(plan.difficulty || "beginner"),
          }}
        >
          {getDifficultyText(plan.difficulty || "beginner")}
        </div>
      </div>

      {plan.description && (
        <p className="plan-description">{plan.description}</p>
      )}

      <div className="plan-details">
        <div className="detail-item">
          <span className="detail-label">예상 시간:</span>
          <span className="detail-value">
            {plan.estimated_duration_minutes}분
          </span>
        </div>

        {plan.target_muscle_groups && plan.target_muscle_groups.length > 0 && (
          <div className="detail-item">
            <span className="detail-label">타겟 근육:</span>
            <div className="muscle-tags">
              {plan.target_muscle_groups.map((muscle, index) => (
                <span key={index} className="muscle-tag">
                  {muscle}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="plan-footer">
        {plan.created_at && (
          <div className="created-date">
            {new Date(plan.created_at).toLocaleDateString()}
          </div>
        )}
        {plan.is_template && <span className="template-badge">템플릿</span>}
      </div>

      <div className="plan-actions">
        {onStart && (
          <button
            className="action-button start-button"
            onClick={e => {
              e.stopPropagation()
              onStart()
            }}
            title="운동 시작"
          >
            <Play size={16} />
            시작
          </button>
        )}

        {onEdit && (
          <button
            className="action-button edit-button"
            onClick={e => {
              e.stopPropagation()
              onEdit()
            }}
            title="편집"
          >
            <Edit size={16} />
            편집
          </button>
        )}

        {onDelete && (
          <button
            className="action-button delete-button"
            onClick={e => {
              e.stopPropagation()
              onDelete()
            }}
            title="삭제"
          >
            <Trash2 size={16} />
            삭제
          </button>
        )}
      </div>
    </div>
  )
}
