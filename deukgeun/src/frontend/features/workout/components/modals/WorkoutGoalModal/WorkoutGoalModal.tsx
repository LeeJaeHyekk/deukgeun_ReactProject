import React, { useEffect } from "react"
import { X, Save } from "lucide-react"
import type { WorkoutGoal } from "../../../../../../shared/types"
import { useWorkoutStore } from "../../../store/workoutStore"
import { GoalForm } from "./components/GoalForm"
import { useGoalForm } from "./hooks/useGoalForm"
import "./WorkoutGoalModal.css"

export function WorkoutGoalModal() {
  const {
    modals: { goal: modalState },
    currentGoal,
    closeGoalModal,
    createGoal,
    updateGoal,
  } = useWorkoutStore()

  const {
    formData,
    errors,
    handleInputChange,
    handleTypeChange,
    validateForm,
  } = useGoalForm(currentGoal)

  const isOpen = modalState.isOpen
  const isEditMode = modalState.mode === "edit"
  const isViewMode = modalState.mode === "view"
  const goal = modalState.goal

  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeGoalModal()
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape)
      return () => document.removeEventListener("keydown", handleEscape)
    }
  }, [isOpen, closeGoalModal])

  // 오버레이 클릭으로 모달 닫기
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      closeGoalModal()
    }
  }

  // 저장 핸들러
  const handleSave = async () => {
    if (!validateForm()) return

    try {
      if (isEditMode && goal) {
        await updateGoal(goal.id, formData)
      } else {
        await createGoal(formData)
      }
      closeGoalModal()
    } catch (error) {
      console.error("Goal save failed:", error)
    }
  }

  if (!isOpen) return null

  return (
    <div className="workout-goal-modal-overlay" onClick={handleOverlayClick}>
      <div className="workout-goal-modal" onClick={e => e.stopPropagation()}>
        <div className="workout-goal-modal-header">
          <h2 className="workout-goal-modal-title">
            {isViewMode
              ? "운동 목표 보기"
              : isEditMode
                ? "운동 목표 수정"
                : "새 운동 목표 설정"}
          </h2>
          <button className="workout-goal-modal-close" onClick={closeGoalModal}>
            <X size={20} />
          </button>
        </div>

        <GoalForm
          formData={formData}
          errors={errors}
          onInputChange={handleInputChange}
          onTypeChange={handleTypeChange}
        />

        <div className="workout-goal-modal-footer">
          <button className="cancel-button" onClick={closeGoalModal}>
            취소
          </button>
          {!isViewMode && (
            <button className="save-button" onClick={handleSave}>
              <Save size={16} />
              {isEditMode ? "수정" : "생성"}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
