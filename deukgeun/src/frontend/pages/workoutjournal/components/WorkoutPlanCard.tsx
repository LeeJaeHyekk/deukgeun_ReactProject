import React from "react"
import { WorkoutPlan } from "../hooks/useWorkoutPlans"
import "./WorkoutPlanCard.css"

interface WorkoutPlanCardProps {
  plan: WorkoutPlan
  onClick?: () => void
}

export function WorkoutPlanCard({ plan, onClick }: WorkoutPlanCardProps) {
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

  return (
    <div className="workout-plan-card" onClick={onClick}>
      <div className="plan-header">
        <h3 className="plan-name">{plan.name}</h3>
        <span
          className="difficulty-badge"
          style={{ backgroundColor: getDifficultyColor(plan.difficulty_level) }}
        >
          {getDifficultyText(plan.difficulty_level)}
        </span>
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

        {plan.exercises && plan.exercises.length > 0 && (
          <div className="detail-item">
            <span className="detail-label">운동 수:</span>
            <span className="detail-value">{plan.exercises.length}개</span>
          </div>
        )}
      </div>

      <div className="plan-footer">
        <span className="plan-date">
          {new Date(plan.created_at).toLocaleDateString()}
        </span>
        {plan.is_template && <span className="template-badge">템플릿</span>}
      </div>
    </div>
  )
}
