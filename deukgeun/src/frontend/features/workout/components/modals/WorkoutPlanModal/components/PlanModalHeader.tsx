import React from "react"
import { X } from "lucide-react"

interface PlanModalHeaderProps {
  isEditMode: boolean
  isViewMode: boolean
  onClose: () => void
}

export function PlanModalHeader({
  isEditMode,
  isViewMode,
  onClose,
}: PlanModalHeaderProps) {
  const getTitle = () => {
    if (isViewMode) return "운동 계획 보기"
    if (isEditMode) return "운동 계획 수정"
    return "새 운동 계획 만들기"
  }

  return (
    <div className="workout-plan-modal-header">
      <h2 className="workout-plan-modal-title">{getTitle()}</h2>
      <button className="workout-plan-modal-close" onClick={onClose}>
        <X size={20} />
      </button>
    </div>
  )
}
