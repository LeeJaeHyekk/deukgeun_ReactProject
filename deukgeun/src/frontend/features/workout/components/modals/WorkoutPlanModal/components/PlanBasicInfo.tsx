import React from "react"
import type { CreatePlanRequest } from "../../../../shared/types"

interface PlanBasicInfoProps {
  formData: CreatePlanRequest
  updateFormData: (data: Partial<CreatePlanRequest>) => void
  errors: Record<string, string>
  isViewMode: boolean
}

export function PlanBasicInfo({
  formData,
  updateFormData,
  errors,
  isViewMode,
}: PlanBasicInfoProps) {
  const handleInputChange = (field: keyof CreatePlanRequest, value: any) => {
    if (isViewMode) return
    updateFormData({ [field]: value })
  }

  return (
    <div className="form-section">
      <h3>기본 정보</h3>

      {/* 계획 이름 */}
      <div className="form-group">
        <label htmlFor="plan-name">계획 이름 *</label>
        <input
          id="plan-name"
          type="text"
          value={formData.name || ""}
          onChange={e => handleInputChange("name", e.target.value)}
          placeholder="예: 상체 근력 운동"
          className={errors.name ? "error" : ""}
          disabled={isViewMode}
        />
        {errors.name && <span className="error-message">{errors.name}</span>}
      </div>

      {/* 계획 설명 */}
      <div className="form-group">
        <label htmlFor="plan-description">계획 설명 *</label>
        <textarea
          id="plan-description"
          value={formData.description || ""}
          onChange={e => handleInputChange("description", e.target.value)}
          placeholder="이 운동 계획에 대한 설명을 입력하세요"
          rows={3}
          className={errors.description ? "error" : ""}
          disabled={isViewMode}
        />
        {errors.description && (
          <span className="error-message">{errors.description}</span>
        )}
      </div>

      {/* 난이도 및 소요시간 */}
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="plan-difficulty">난이도</label>
          <select
            id="plan-difficulty"
            value={formData.difficulty || "beginner"}
            onChange={e => handleInputChange("difficulty", e.target.value)}
            disabled={isViewMode}
          >
            <option value="beginner">초급</option>
            <option value="intermediate">중급</option>
            <option value="advanced">고급</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="plan-duration">예상 소요시간 (분) *</label>
          <input
            id="plan-duration"
            type="number"
            value={formData.estimatedDurationMinutes || 60}
            onChange={e =>
              handleInputChange(
                "estimatedDurationMinutes",
                parseInt(e.target.value) || 0
              )
            }
            min="1"
            max="300"
            className={errors.estimatedDurationMinutes ? "error" : ""}
            disabled={isViewMode}
          />
          {errors.estimatedDurationMinutes && (
            <span className="error-message">
              {errors.estimatedDurationMinutes}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
