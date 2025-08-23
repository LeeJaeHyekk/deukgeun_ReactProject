// ============================================================================
// WorkoutPlanModal - Modular Component
// ============================================================================

import React, { useState, useCallback } from "react"
import { X, Save } from "lucide-react"
import { useWorkoutStore } from "../../../store/workoutStore"
import { useMachines } from "@shared/hooks/useMachines"
import { PlanBasicInfo } from "./components/PlanBasicInfo"
import { PlanExercises } from "./components/PlanExercises"
import { PlanModalHeader } from "./components/PlanModalHeader"
import { PlanModalFooter } from "./components/PlanModalFooter"
import { usePlanForm } from "./hooks/usePlanForm"
import { usePlanValidation } from "./hooks/usePlanValidation"
import "../../../pages/modals/WorkoutPlanModal.css"

export function WorkoutPlanModal() {
  const { machines } = useMachines()
  const {
    modals: { plan: modalState },
    currentPlan,
    closePlanModal,
    createPlan,
    updatePlan,
  } = useWorkoutStore()

  const { formData, updateFormData, resetForm } = usePlanForm(currentPlan)
  const { errors, validateForm, clearErrors } = usePlanValidation()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isOpen = modalState.isOpen
  const isEditMode = modalState.mode === "edit"
  const isViewMode = modalState.mode === "view"

  // 폼 제출 핸들러
  const handleSubmit = useCallback(async () => {
    if (!validateForm(formData)) {
      return
    }

    setIsSubmitting(true)
    try {
      if (isEditMode && currentPlan) {
        await updatePlan(currentPlan.id, formData)
      } else {
        await createPlan(formData)
      }
      closePlanModal()
      resetForm()
    } catch (error) {
      console.error("Plan save failed:", error)
    } finally {
      setIsSubmitting(false)
    }
  }, [
    formData,
    isEditMode,
    currentPlan,
    validateForm,
    createPlan,
    updatePlan,
    closePlanModal,
    resetForm,
  ])

  // 모달 닫기 핸들러
  const handleClose = useCallback(() => {
    closePlanModal()
    resetForm()
    clearErrors()
  }, [closePlanModal, resetForm, clearErrors])

  // 오버레이 클릭 핸들러
  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        handleClose()
      }
    },
    [handleClose]
  )

  if (!isOpen) {
    return null
  }

  return (
    <div className="workout-plan-modal-overlay" onClick={handleOverlayClick}>
      <div className="workout-plan-modal" onClick={e => e.stopPropagation()}>
        {/* 헤더 */}
        <PlanModalHeader
          isEditMode={isEditMode}
          isViewMode={isViewMode}
          onClose={handleClose}
        />

        {/* 본문 */}
        <div className="workout-plan-modal-body">
          {/* 기본 정보 섹션 */}
          <PlanBasicInfo
            formData={formData}
            updateFormData={updateFormData}
            errors={errors}
            isViewMode={isViewMode}
          />

          {/* 운동 목록 섹션 */}
          <PlanExercises
            exercises={modalState.exercises}
            readOnly={isViewMode}
          />
        </div>

        {/* 푸터 */}
        <PlanModalFooter
          isEditMode={isEditMode}
          isViewMode={isViewMode}
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit}
          onCancel={handleClose}
        />
      </div>
    </div>
  )
}
