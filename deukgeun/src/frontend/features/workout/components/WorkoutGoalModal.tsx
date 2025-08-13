import React, { useState, useEffect } from "react"
import { X, Save, Target, Calendar, BarChart3 } from "lucide-react"
import type { WorkoutGoal } from "../../../../types"
import "./WorkoutGoalModal.css"

interface WorkoutGoalModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (goal: Partial<WorkoutGoal>) => void
  goal?: WorkoutGoal | null
}

const GOAL_TYPES = [
  { value: "weight", label: "무게", unit: "kg", icon: "🏋️" },
  { value: "reps", label: "횟수", unit: "회", icon: "🔄" },
  { value: "duration", label: "시간", unit: "분", icon: "⏱️" },
  { value: "frequency", label: "빈도", unit: "회/주", icon: "📅" },
  { value: "streak", label: "연속", unit: "일", icon: "🔥" },
]

export function WorkoutGoalModal({
  isOpen,
  onClose,
  onSave,
  goal,
}: WorkoutGoalModalProps) {
  const [formData, setFormData] = useState<Partial<WorkoutGoal>>({
    title: "",
    description: "",
    type: "weight",
    targetValue: 0,
    currentValue: 0,
    unit: "kg",
    deadline: undefined,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // 기존 목표가 있으면 폼 데이터 초기화
  useEffect(() => {
    if (goal) {
      setFormData({
        title: goal.title || "",
        description: goal.description || "",
        type: goal.type,
        targetValue: goal.targetValue,
        currentValue: goal.currentValue || 0,
        unit: goal.unit,
        deadline: goal.deadline,
      })
    } else {
      setFormData({
        title: "",
        description: "",
        type: "weight",
        targetValue: 0,
        currentValue: 0,
        unit: "kg",
        deadline: undefined,
      })
    }
    setErrors({})
  }, [goal, isOpen])

  // 입력 필드 변경 핸들러
  const handleInputChange = (field: keyof WorkoutGoal, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // 에러 제거
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }))
    }
  }

  // 목표 타입 변경 시 단위 자동 설정
  const handleTypeChange = (type: WorkoutGoal["type"]) => {
    const goalType = GOAL_TYPES.find(t => t.value === type)
    setFormData(prev => ({
      ...prev,
      type,
      unit: goalType?.unit || "kg",
    }))
    if (errors.type) {
      setErrors(prev => ({ ...prev, type: "" }))
    }
  }

  // 폼 검증
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.title?.trim()) {
      newErrors.title = "목표 제목을 입력해주세요."
    }

    if (!formData.targetValue || formData.targetValue <= 0) {
      newErrors.targetValue = "목표값을 입력해주세요."
    }

    if (formData.currentValue && formData.currentValue < 0) {
      newErrors.currentValue = "현재값은 0 이상이어야 합니다."
    }

    if (formData.deadline && new Date(formData.deadline) <= new Date()) {
      newErrors.deadline = "마감일은 오늘 이후로 설정해주세요."
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // 저장 핸들러
  const handleSave = () => {
    if (!validateForm()) return

    onSave(formData)
  }

  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape)
      return () => document.removeEventListener("keydown", handleEscape)
    }
  }, [isOpen, onClose])

  // 오버레이 클릭으로 모달 닫기
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  if (!isOpen) return null

  const selectedGoalType = GOAL_TYPES.find(t => t.value === formData.type)

  return (
    <div className="workout-goal-modal-overlay" onClick={handleOverlayClick}>
      <div className="workout-goal-modal" onClick={e => e.stopPropagation()}>
        <div className="workout-goal-modal-header">
          <h2 className="workout-goal-modal-title">
            {goal ? "운동 목표 수정" : "새 운동 목표 설정"}
          </h2>
          <button className="workout-goal-modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

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
              onChange={e => handleInputChange("title", e.target.value)}
              className={`form-input ${errors.title ? "error" : ""}`}
              placeholder="예: 벤치프레스 100kg 달성"
            />
            {errors.title && (
              <span className="error-message">{errors.title}</span>
            )}
          </div>

          {/* 목표 설명 */}
          <div className="form-group">
            <label className="form-label">목표 설명</label>
            <textarea
              value={formData.description || ""}
              onChange={e => handleInputChange("description", e.target.value)}
              className="form-textarea"
              placeholder="목표에 대한 자세한 설명을 입력하세요"
              rows={3}
            />
          </div>

          {/* 목표 타입 */}
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
                    formData.type === type.value ? "active" : ""
                  }`}
                  onClick={() =>
                    handleTypeChange(type.value as WorkoutGoal["type"])
                  }
                >
                  <span className="goal-type-icon">{type.icon}</span>
                  <span className="goal-type-label">{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 목표값과 현재값 */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">목표값 *</label>
              <div className="input-with-unit">
                <input
                  type="number"
                  value={formData.targetValue || ""}
                  onChange={e =>
                    handleInputChange("targetValue", Number(e.target.value))
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
                    handleInputChange("currentValue", Number(e.target.value))
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
                handleInputChange(
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

        <div className="workout-goal-modal-footer">
          <button className="cancel-button" onClick={onClose}>
            취소
          </button>
          <button className="save-button" onClick={handleSave}>
            <Save size={16} />
            {goal ? "수정" : "생성"}
          </button>
        </div>
      </div>
    </div>
  )
}
