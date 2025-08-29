import React, { useEffect } from "react"
import { X, Save } from "lucide-react"
import type { WorkoutGoal } from "../../../../../../shared/types"
import { useWorkoutStore } from "../../../store/workoutStore"
import { GoalForm } from "./components/GoalForm"
import { useGoalForm } from "./hooks/useGoalForm"
import "./WorkoutGoalModal.css"

// 로깅 유틸리티
const logger = {
  info: (message: string, data?: any) => {
    if (import.meta.env.DEV) {
      console.log(`[WorkoutGoalModal] ${message}`, data || "")
    }
  },
  debug: (message: string, data?: any) => {
    if (import.meta.env.DEV) {
      console.debug(`[WorkoutGoalModal] ${message}`, data || "")
    }
  },
  warn: (message: string, data?: any) => {
    console.warn(`[WorkoutGoalModal] ${message}`, data || "")
  },
  error: (message: string, data?: any) => {
    console.error(`[WorkoutGoalModal] ${message}`, data || "")
  },
}

export function WorkoutGoalModal() {
  const {
    modals: { goal: modalState },
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
  } = useGoalForm(modalState.data)

  const isOpen = modalState.isOpen
  const isEditMode = modalState.mode === "edit"
  const isViewMode = modalState.mode === "view"
  const goal = modalState.data

  logger.info("WorkoutGoalModal 렌더링", {
    isOpen,
    mode: modalState.mode,
    hasGoal: !!goal,
    goalId: goal?.id,
    formDataKeys: Object.keys(formData),
    hasErrors: Object.keys(errors).length > 0,
  })

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
    logger.info("목표 저장 시도", {
      mode: modalState.mode,
      goalId: goal?.id,
      formData,
    })

    if (!validateForm()) {
      logger.warn("폼 검증 실패", { errors })
      return
    }

    try {
      if (isEditMode && goal) {
        logger.info("목표 수정 시작", { goalId: goal.id })
        await updateGoal(goal.id, formData)
        logger.info("목표 수정 완료", { goalId: goal.id })
      } else {
        logger.info("새 목표 생성 시작")
        await createGoal(formData)
        logger.info("새 목표 생성 완료")
      }
      closeGoalModal()
    } catch (error) {
      logger.error("목표 저장 실패", error)
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
