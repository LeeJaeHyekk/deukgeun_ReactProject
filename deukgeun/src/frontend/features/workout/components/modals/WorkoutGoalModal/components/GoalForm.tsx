import React from "react"
import { Target, Calendar } from "lucide-react"
import type { WorkoutGoal } from "../../../../../../shared/types"
import { GoalTypeSelector } from "./GoalTypeSelector"

const GOAL_TYPES = [
  { value: "weight", label: "무게", unit: "kg", icon: "🏋️" },
  { value: "reps", label: "횟수", unit: "회", icon: "🔄" },
  { value: "duration", label: "시간", unit: "분", icon: "⏱️" },
  { value: "frequency", label: "빈도", unit: "회/주", icon: "📅" },
  { value: "streak", label: "연속", unit: "일", icon: "🔥" },
]

interface GoalFormProps {
  formData: Partial<WorkoutGoal>
  errors: Record<string, string>
  onInputChange: (field: keyof WorkoutGoal, value: any) => void
  onTypeChange: (type: WorkoutGoal["type"]) => void
}

export const GoalForm: React.FC<GoalFormProps> = ({
  formData,
  errors,
  onInputChange,
  onTypeChange,
}) => {
  const selectedGoalType = GOAL_TYPES.find(t => t.value === formData.type)

  return (
    <div className="workout-goal-modal-body">
      {/* 목표 제목 */}
      <div className="form-group">
        <label className="form-label">
          <Target size={16} />
          목표 제목 *
        </label>
        <input
          type="text"
          value={formData.title || ""}
          onChange={e => onInputChange("title", e.target.value)}
          className={`form-input ${errors.title ? "error" : ""}`}
          placeholder="예: 벤치프레스 100kg 달성"
        />
        {errors.title && <span className="error-message">{errors.title}</span>}
      </div>

      {/* 목표 설명 */}
      <div className="form-group">
        <label className="form-label">목표 설명</label>
        <textarea
          value={formData.description || ""}
          onChange={e => onInputChange("description", e.target.value)}
          className="form-textarea"
          placeholder="목표에 대한 자세한 설명을 입력하세요"
          rows={3}
        />
      </div>

      {/* 목표 타입 */}
      <GoalTypeSelector
        selectedType={formData.type || "weight"}
        onTypeChange={onTypeChange}
        error={errors.type}
      />

      {/* 목표값과 현재값 */}
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">목표값 *</label>
          <div className="input-with-unit">
            <input
              type="number"
              value={formData.targetValue || ""}
              onChange={e =>
                onInputChange("targetValue", Number(e.target.value))
              }
              className={`form-input ${errors.targetValue ? "error" : ""}`}
              placeholder="0"
              min="0"
              step="0.1"
            />
            <span className="unit-label">{selectedGoalType?.unit}</span>
          </div>
          {errors.targetValue && (
            <span className="error-message">{errors.targetValue}</span>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">현재값</label>
          <div className="input-with-unit">
            <input
              type="number"
              value={formData.currentValue || ""}
              onChange={e =>
                onInputChange("currentValue", Number(e.target.value))
              }
              className={`form-input ${errors.currentValue ? "error" : ""}`}
              placeholder="0"
              min="0"
              step="0.1"
            />
            <span className="unit-label">{selectedGoalType?.unit}</span>
          </div>
          {errors.currentValue && (
            <span className="error-message">{errors.currentValue}</span>
          )}
        </div>
      </div>

      {/* 마감일 */}
      <div className="form-group">
        <label className="form-label">
          <Calendar size={16} />
          마감일
        </label>
        <input
          type="date"
          value={
            formData.deadline
              ? new Date(formData.deadline).toISOString().split("T")[0]
              : ""
          }
          onChange={e =>
            onInputChange(
              "deadline",
              e.target.value ? new Date(e.target.value) : undefined
            )
          }
          className={`form-input ${errors.deadline ? "error" : ""}`}
          min={new Date().toISOString().split("T")[0]}
        />
        {errors.deadline && (
          <span className="error-message">{errors.deadline}</span>
        )}
      </div>
    </div>
  )
}
