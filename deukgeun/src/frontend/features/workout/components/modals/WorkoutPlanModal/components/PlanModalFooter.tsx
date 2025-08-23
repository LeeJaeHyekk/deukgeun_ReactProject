import React from "react"
import { Save } from "lucide-react"

interface PlanModalFooterProps {
  isEditMode: boolean
  isViewMode: boolean
  isSubmitting: boolean
  onSubmit: () => void
  onCancel: () => void
}

export function PlanModalFooter({
  isEditMode,
  isViewMode,
  isSubmitting,
  onSubmit,
  onCancel,
}: PlanModalFooterProps) {
  const getSubmitButtonText = () => {
    if (isViewMode) return "닫기"
    if (isSubmitting) return "저장 중..."
    if (isEditMode) return "수정"
    return "저장"
  }

  return (
    <div className="workout-plan-modal-footer">
      <button className="cancel-btn" onClick={onCancel}>
        {isViewMode ? "닫기" : "취소"}
      </button>

      {!isViewMode && (
        <button className="save-btn" onClick={onSubmit} disabled={isSubmitting}>
          <Save size={16} />
          {getSubmitButtonText()}
        </button>
      )}
    </div>
  )
}
