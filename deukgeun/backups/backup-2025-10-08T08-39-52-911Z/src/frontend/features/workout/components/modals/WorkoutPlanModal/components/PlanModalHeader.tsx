import React from "react"
import { X } from "lucide-react"
import styles from "../WorkoutPlanModal.module.css"

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
    <div className={styles.modalHeader}>
      <h2 className={styles.modalTitle}>{getTitle()}</h2>
      <button className={styles.closeButton} onClick={onClose}>
        <X size={20} />
      </button>
    </div>
  )
}
