import React from "react"
import { Edit, Trash2, Play, Calendar, Clock, Target } from "lucide-react"
import type { WorkoutPlan } from "../../../shared/api/workoutJournalApi"
import {
  getDifficultyColor,
  getDifficultyText,
  formatDate,
  getExerciseCount,
  getTargetMuscleGroups,
} from "../utils/workoutUtils"
import "./WorkoutPlanCard.css"

interface WorkoutPlanCardProps {
  plan: WorkoutPlan
  onEdit?: () => void
  onDelete?: () => void
  onStart?: () => void
  className?: string
}

export function WorkoutPlanCard({
  plan,
  onEdit,
  onDelete,
  onStart,
  className = "",
}: WorkoutPlanCardProps) {
  const handleCardClick = (e: React.MouseEvent) => {
    // 버튼 클릭 시 카드 클릭 이벤트 방지
    if ((e.target as HTMLElement).closest(".action-button")) {
      return
    }
    onEdit?.()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      onEdit?.()
    }
  }

  const exercisesCount = getExerciseCount(plan)
  const estimatedDuration = plan.estimated_duration_minutes || 0
  const targetMuscles = getTargetMuscleGroups(plan)
  const isTemplate = plan.is_template || false
  const createdAt = plan.created_at || plan.createdAt

  return (
    <div
      className={`workout-plan-card ${className}`}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`${plan.plan_name || plan.name} 운동 계획 카드`}
    >
      <div className="plan-header">
        <h3 className="plan-name">{plan.plan_name || plan.name}</h3>
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
                <span key={index} className="muscle-tag" role="listitem">
                  {muscle}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 운동 목록 미리보기 */}
        {exercisesCount > 0 && (
          <div className="detail-item exercises-preview">
            <span className="detail-label">운동 목록:</span>
            <div
              className="exercises-list"
              role="list"
              aria-label="운동 목록 미리보기"
            >
              {plan.exercises?.slice(0, 3).map((exercise, index) => (
                <span
                  key={index}
                  className="exercise-preview-item"
                  role="listitem"
                >
                  {exercise.exerciseName || "운동 이름 없음"}
                </span>
              ))}
              {exercisesCount > 3 && (
                <span className="more-exercises" role="listitem">
                  +{exercisesCount - 3}개 더
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="plan-footer">
        {createdAt && (
          <div className="plan-date">
            <Calendar size={12} />
            {formatDate(createdAt)}
          </div>
        )}
        {isTemplate && (
          <span className="template-badge" aria-label="템플릿 계획">
            템플릿
          </span>
        )}
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
            aria-label="운동 계획 시작"
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
            aria-label="운동 계획 편집"
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
            aria-label="운동 계획 삭제"
          >
            <Trash2 size={16} />
            삭제
          </button>
        )}
      </div>
    </div>
  )
}
