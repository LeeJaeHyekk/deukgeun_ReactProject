import React from "react"
import { Edit, Trash2, Play, Calendar, Clock, Target } from "lucide-react"
import type { WorkoutPlan } from "../../../../../shared/types"
import type { WorkoutPlanCardProps } from "../../types"
import {
  getDifficultyColor,
  getDifficultyText,
  formatDate,
  getExerciseCount,
  getTargetMuscleGroups,
} from "../../utils/workoutUtils"
import "./WorkoutPlanCard.css"

export function WorkoutPlanCard({
  plan,
  onEdit,
  onDelete,
  onStartSession,
  onClick,
  compact = false,
  className = "",
}: WorkoutPlanCardProps) {
  const handleCardClick = (e: React.MouseEvent) => {
    // 버튼 클릭 시 카드 클릭 이벤트 방지
    if ((e.target as HTMLElement).closest(".action-button")) {
      return
    }
    // onClick이 있으면 onClick 우선, 없으면 onEdit
    if (onClick) {
      onClick(plan)
    } else {
      onEdit?.(plan)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      onEdit?.(plan)
    }
  }

  const exercisesCount = getExerciseCount(plan)
  const estimatedDuration = plan.estimatedDurationMinutes || 0
  const targetMuscles = getTargetMuscleGroups(plan)
  const isTemplate = plan.isTemplate || false
  const createdAt = plan.createdAt

  return (
    <div
      className={`workout-plan-card ${compact ? "compact" : ""} ${className}`}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`${plan.name} 운동 계획 카드`}
    >
      <div className="plan-header">
        <h3 className="plan-name">{plan.name}</h3>
        <div
          className="difficulty-badge"
          style={{
            backgroundColor: getDifficultyColor(plan.difficulty || "beginner"),
          }}
          aria-label={`난이도: ${getDifficultyText(plan.difficulty || "beginner")}`}
        >
          {getDifficultyText(plan.difficulty || "beginner")}
        </div>
      </div>

      {plan.description && (
        <p className="plan-description">{plan.description}</p>
      )}

      <div className="plan-details">
        <div className="detail-item">
          <span className="detail-label">
            <Clock size={14} />
            예상 시간:
          </span>
          <span className="detail-value">{estimatedDuration}분</span>
        </div>

        <div className="detail-item">
          <span className="detail-label">
            <Target size={14} />
            운동 개수:
          </span>
          <span className="detail-value exercises-count">
            {exercisesCount}개
          </span>
        </div>

        {targetMuscles.length > 0 && (
          <div className="detail-item">
            <span className="detail-label">타겟 근육:</span>
            <div
              className="muscle-tags"
              role="list"
              aria-label="타겟 근육 그룹"
            >
              {targetMuscles.map((muscle, index) => (
                <span
                  key={index}
                  className="muscle-tag"
                  role="listitem"
                  aria-label={`${muscle} 근육 그룹`}
                >
                  {muscle}
                </span>
              ))}
            </div>
          </div>
        )}

        {createdAt && (
          <div className="detail-item">
            <span className="detail-label">
              <Calendar size={14} />
              생성일:
            </span>
            <span className="detail-value">{formatDate(createdAt)}</span>
          </div>
        )}
      </div>

      <div className="plan-actions">
        <button
          className="action-button edit-button"
          onClick={e => {
            e.stopPropagation()
            onEdit?.(plan)
          }}
          aria-label="계획 수정"
        >
          <Edit size={16} />
          수정
        </button>

        <button
          className="action-button start-button"
          onClick={e => {
            e.stopPropagation()
            onStartSession?.(plan)
          }}
          aria-label="세션 시작"
        >
          <Play size={16} />
          시작
        </button>

        <button
          className="action-button delete-button"
          onClick={e => {
            e.stopPropagation()
            onDelete?.(plan.id)
          }}
          aria-label="계획 삭제"
        >
          <Trash2 size={16} />
          삭제
        </button>
      </div>

      {isTemplate && (
        <div className="template-badge" aria-label="템플릿 계획">
          템플릿
        </div>
      )}
    </div>
  )
}
