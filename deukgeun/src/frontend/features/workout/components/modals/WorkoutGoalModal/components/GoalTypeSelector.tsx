import React from "react"
import { BarChart3 } from "lucide-react"
import type { WorkoutGoal } from "../../../../../shared/types"

const GOAL_TYPES = [
  { value: "weight", label: "무게", unit: "kg", icon: "🏋️" },
  { value: "reps", label: "횟수", unit: "회", icon: "🔄" },
  { value: "duration", label: "시간", unit: "분", icon: "⏱️" },
  { value: "frequency", label: "빈도", unit: "회/주", icon: "📅" },
  { value: "streak", label: "연속", unit: "일", icon: "🔥" },
]

interface GoalTypeSelectorProps {
  selectedType: WorkoutGoal["type"]
  onTypeChange: (type: WorkoutGoal["type"]) => void
  error?: string
}

export const GoalTypeSelector: React.FC<GoalTypeSelectorProps> = ({
  selectedType,
  onTypeChange,
  error,
}) => {
  return (
    <div className="form-group">
      <label className="form-label">
        <BarChart3 size={16} />
        목표 타입 *
      </label>
      <div className="goal-type-grid">
        {GOAL_TYPES.map(type => (
          <button
            key={type.value}
            type="button"
            className={`goal-type-button ${
              selectedType === type.value ? "active" : ""
            }`}
            onClick={() => onTypeChange(type.value as WorkoutGoal["type"])}
          >
            <span className="goal-type-icon">{type.icon}</span>
            <span className="goal-type-label">{type.label}</span>
            <span className="goal-type-unit">({type.unit})</span>
          </button>
        ))}
      </div>
      {error && <span className="error-message">{error}</span>}
    </div>
  )
}
