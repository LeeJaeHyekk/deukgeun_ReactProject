// ============================================================================
// WorkoutPlanModal - Modular Component
// ============================================================================

import React, { useState, useCallback, useEffect } from "react"
import { X, Save } from "lucide-react"
import { useWorkoutStore } from "../../../store/workoutStore"
import { useMachines } from "@shared/hooks/useMachines"
import { PlanBasicInfo } from "./components/PlanBasicInfo"
import { PlanExercises } from "./components/PlanExercises"
import { PlanModalHeader } from "./components/PlanModalHeader"
import { PlanModalFooter } from "./components/PlanModalFooter"
import { usePlanForm } from "./hooks/usePlanForm"
import { usePlanValidation } from "./hooks/usePlanValidation"
import styles from "./WorkoutPlanModal.module.css"

export function WorkoutPlanModal() {
  const { machines } = useMachines()
  const {
    modals: { plan: modalState },
    currentPlan,
    closePlanModal,
    createPlan,
    updatePlan,
  } = useWorkoutStore()

  const {
    formData,
    updateFormData,
    resetForm,
    addExercise,
    updateExercise,
    removeExercise,
    getCreatePlanRequest,
  } = usePlanForm(currentPlan)
  const { errors, validateForm, clearErrors } = usePlanValidation()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [originalFormData, setOriginalFormData] = useState(formData)

  // 초기 데이터 저장
  useEffect(() => {
    if (currentPlan) {
      setOriginalFormData(formData)
    }
  }, [currentPlan, formData])

  // 취소 핸들러
  const handleCancel = useCallback(() => {
    if (currentPlan) {
      // 편집 모드에서 취소 시 원본 데이터로 복원
      updateFormData(originalFormData)
    }
    closePlanModal()
    resetForm()
  }, [currentPlan, originalFormData, updateFormData, closePlanModal, resetForm])

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
        // 편집 모드에서는 formData를 직접 사용
        await updatePlan(currentPlan.id, formData as any)
      } else {
        // 생성 모드에서는 CreatePlanRequest로 변환
        const createPlanRequest = getCreatePlanRequest()
        await createPlan(createPlanRequest)
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
    validateForm,
    isEditMode,
    currentPlan,
    updatePlan,
    createPlan,
    getCreatePlanRequest,
    closePlanModal,
    resetForm,
  ])

  if (!isOpen) return null

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContainer}>
        <PlanModalHeader
          isEditMode={isEditMode}
          isViewMode={isViewMode}
          onClose={handleCancel}
        />

        <div className={styles.modalContent}>
          <PlanBasicInfo
            formData={formData}
            updateFormData={updateFormData}
            errors={errors}
            isViewMode={isViewMode}
          />

          <PlanExercises
            exercises={formData.exercises as any}
            onExerciseChange={updateExercise}
            onExerciseRemove={removeExercise}
            onExerciseAdd={addExercise}
            readOnly={isViewMode}
          />
        </div>

        <PlanModalFooter
          isEditMode={isEditMode}
          isViewMode={isViewMode}
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </div>
    </div>
  )
}
