import React from "react"
import type { CreatePlanRequest } from "../../../../../../../shared/types"
import styles from "./PlanBasicInfo.module.css"

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
    <div className={styles.formSection}>
      <h3 className={styles.sectionTitle}>기본 정보</h3>

      {/* 계획 이름 */}
      <div className={styles.formGroup}>
        <label htmlFor="plan-name" className={styles.formLabel}>
          계획 이름 *
        </label>
        <input
          id="plan-name"
          type="text"
          value={formData.name || ""}
          onChange={e => handleInputChange("name", e.target.value)}
          placeholder="예: 상체 근력 운동"
          className={`${styles.formInput} ${errors.name ? styles.error : ""}`}
          disabled={isViewMode}
        />
        {errors.name && (
          <span className={styles.errorMessage}>{errors.name}</span>
        )}
      </div>

      {/* 계획 설명 */}
      <div className={styles.formGroup}>
        <label htmlFor="plan-description" className={styles.formLabel}>
          계획 설명 *
        </label>
        <textarea
          id="plan-description"
          value={formData.description || ""}
          onChange={e => handleInputChange("description", e.target.value)}
          placeholder="이 운동 계획에 대한 설명을 입력하세요"
          rows={3}
          className={`${styles.formTextarea} ${errors.description ? styles.error : ""}`}
          disabled={isViewMode}
        />
        {errors.description && (
          <span className={styles.errorMessage}>{errors.description}</span>
        )}
      </div>

      {/* 난이도 및 소요시간 */}
      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label htmlFor="plan-difficulty" className={styles.formLabel}>
            난이도
          </label>
          <select
            id="plan-difficulty"
            value={formData.difficulty || "beginner"}
            onChange={e => handleInputChange("difficulty", e.target.value)}
            className={styles.formSelect}
            disabled={isViewMode}
          >
            <option value="beginner">초급</option>
            <option value="intermediate">중급</option>
            <option value="advanced">고급</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="plan-duration" className={styles.formLabel}>
            예상 소요시간 (분) *
          </label>
          <input
            id="plan-duration"
            type="number"
            value={formData.estimated_duration_minutes || 60}
            onChange={e =>
              handleInputChange(
                "estimated_duration_minutes",
                parseInt(e.target.value) || 0
              )
            }
            min="1"
            max="300"
            className={`${styles.formInput} ${errors.estimated_duration_minutes ? styles.error : ""}`}
            disabled={isViewMode}
          />
          {errors.estimated_duration_minutes && (
            <span className={styles.errorMessage}>
              {errors.estimated_duration_minutes}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
