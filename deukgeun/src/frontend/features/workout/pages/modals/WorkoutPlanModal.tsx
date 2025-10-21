import React, { useState, useEffect, useCallback } from "react"
import { X, Plus, Save, Clock, Target, Edit, Trash2 } from "lucide-react"
import type { WorkoutPlanExercise, WorkoutPlanExerciseForm } from "@/shared/types/dto"
import type { WorkoutPlan } from "@/shared/types/common"
import type { Machine } from "../../../../../shared/types/dto"
import { useWorkoutPlan } from "../../contexts/WorkoutPlanContext"
import { createEmptyWorkoutPlanExerciseForm } from "@/shared/utils/transform/workoutPlanExercise"
import "./WorkoutPlanModal.css"

interface WorkoutPlanModalProps {
  machines?: Machine[]
  onSave?: (plan: WorkoutPlan) => Promise<void>
}

export function WorkoutPlanModal({
  machines = [],
  onSave,
}: WorkoutPlanModalProps) {
  const {
    state,
    openCreateModal,
    openEditModal,
    openViewModal,
    closeModal,
    addExercise,
    updateExercise,
    removeExercise,
    saveExercise,
    confirmExercise,
    removeSavedExercise,
    saveDraft,
    getFinalPlan,
    resetState,
  } = useWorkoutPlan()

  const {
    modalState,
    draftPlan,
    currentPlanExercises, // exercises 대신 currentPlanExercises 사용
    confirmedExerciseIndices,
    isEditing,
  } = state
  const isOpen = modalState.isOpen
  const plan = draftPlan
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 로깅 유틸리티
  const logger = {
    info: (message: string, data?: any) => {
      console.log(`[WorkoutPlanModal] ${message}`, data || "")
    },
    debug: (message: string, data?: any) => {
      console.debug(`[WorkoutPlanModal] ${message}`, data || "")
    },
    warn: (message: string, data?: any) => {
      console.warn(`[WorkoutPlanModal] ${message}`, data || "")
    },
    error: (message: string, data?: any) => {
      console.error(`[WorkoutPlanModal] ${message}`, data || "")
    },
  }

  // 입력 변경 핸들러
  const handleInputChange = useCallback(
    (field: keyof WorkoutPlan, value: any) => {
      logger.debug("Input changed", { field, value, valueType: typeof value })
      saveDraft({ [field]: value })

      // 에러 상태 초기화
      if (errors[field as string]) {
        setErrors(prev => ({ ...prev, [field as string]: "" }))
      }
    },
    [errors, saveDraft]
  )

  // 운동 추가
  const handleAddExercise = useCallback(() => {
    logger.info("Adding exercise")
    const newExercise = createEmptyWorkoutPlanExerciseForm(plan?.id || 0)
    newExercise.exerciseName = "새로운 운동"
    newExercise.sets = 3
    newExercise.repsRange = { min: 10, max: 10 }
    newExercise.weightRange = { min: 0, max: 0 }
    newExercise.restSeconds = 60
    
    addExercise(newExercise)
    setErrors(prev => ({ ...prev, exercises: "" }))
  }, [addExercise, plan?.id])

  // 운동 삭제
  const handleRemoveExercise = useCallback(
    (index: number) => {
      logger.info("Removing exercise", { index })
      removeExercise(index)
    },
    [removeExercise]
  )

  // 운동 정보 업데이트
  const handleUpdateExercise = useCallback(
    (index: number, field: keyof WorkoutPlanExerciseForm, value: any) => {
      logger.debug("Exercise updated", { index, field, value })
      const updatedExercise = { ...currentPlanExercises[index], [field]: value }
      updateExercise(index, updatedExercise)
    },
    [currentPlanExercises, updateExercise]
  )

  // 개별 운동 확정 저장
  const handleConfirmExercise = useCallback(
    (index: number) => {
      logger.info("Confirming individual exercise", { index })
      const exerciseToConfirm = currentPlanExercises[index]
      if (exerciseToConfirm) {
        saveExercise(index, exerciseToConfirm)
        confirmExercise(index, exerciseToConfirm)
        logger.info("Exercise confirmed successfully", {
          exercise: exerciseToConfirm,
        })
      }
    },
    [currentPlanExercises, saveExercise, confirmExercise]
  )

  // 유효성 검사
  const validateForm = useCallback(() => {
    logger.info("Validating form")
    const newErrors: { [key: string]: string } = {}

    // 계획 데이터 로깅
    logger.debug("Plan data for validation:", {
      name: plan?.name,
      description: plan?.description,
      estimated_duration_minutes: plan?.estimated_duration_minutes,
      exercisesCount: currentPlanExercises?.length || 0,
    })

    if (!plan?.name?.trim()) {
      newErrors.name = "계획 이름을 입력해주세요"
    }

    if (!plan?.description?.trim()) {
      newErrors.description = "계획 설명을 입력해주세요"
    }

    // estimated_duration_minutes 검증 로직 개선
    const duration = plan?.estimated_duration_minutes
    logger.debug("Duration validation check:", {
      duration,
      type: typeof duration,
      isNumber: typeof duration === "number",
      isPositive: duration ? duration > 0 : false,
      isValid: duration && duration > 0,
    })

    if (!duration || duration <= 0) {
      newErrors.estimated_duration_minutes = "예상 소요시간을 입력해주세요"
      logger.warn("Duration validation failed", { duration })
    }

    if (!currentPlanExercises || currentPlanExercises.length === 0) {
      newErrors.exercises = "최소 하나의 운동을 추가해주세요"
    } else {
      // 각 운동의 유효성 검사
      currentPlanExercises.forEach((exercise, index) => {
        if (!exercise.exerciseName?.trim()) {
          newErrors[`exercise_${index}_name`] = "운동 이름을 입력해주세요"
        }
        if (exercise.sets <= 0) {
          newErrors[`exercise_${index}_sets`] = "세트 수를 입력해주세요"
        }
        if (!exercise.repsRange || exercise.repsRange.min <= 0) {
          newErrors[`exercise_${index}_reps`] = "반복 횟수를 입력해주세요"
        }
      })
    }

    setErrors(newErrors)
    logger.debug("Validation completed", { errors: newErrors })
    return Object.keys(newErrors).length === 0
  }, [plan, currentPlanExercises])

  // 폼 제출
  const handleSubmit = useCallback(async () => {
    logger.info("Form submission started")

    if (!validateForm()) {
      logger.warn("Form validation failed", { errors })
      return
    }

    setIsSubmitting(true)
    logger.debug("Submitting plan data", { plan })

    try {
      // 최종 계획 데이터 생성 - 모든 운동 포함
      const finalPlan: WorkoutPlan = {
        ...plan!,
        exercises: currentPlanExercises || [],
        estimatedDurationMinutes: plan?.estimatedDurationMinutes || 60,
      }

      logger.debug("Final plan for submission:", {
        id: finalPlan.id,
        name: finalPlan.name,
        estimatedDurationMinutes: finalPlan.estimatedDurationMinutes,
        exercisesCount: finalPlan.exercises?.length || 0,
      })

      // onSave prop이 있으면 호출, 없으면 모달만 닫기
      if (onSave) {
        await onSave(finalPlan)
        logger.info("Plan saved successfully via onSave")
      } else {
        logger.info("No onSave handler, closing modal")
      }

      closeModal()
    } catch (error) {
      logger.error("Plan save failed", { error })
      setErrors({ submit: "계획 저장에 실패했습니다" })
    } finally {
      setIsSubmitting(false)
    }
  }, [plan, currentPlanExercises, validateForm, closeModal, onSave])

  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        logger.debug("Modal closed via ESC key")
        closeModal()
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape)
      return () => document.removeEventListener("keydown", handleEscape)
    }
  }, [isOpen, closeModal])

  // 오버레이 클릭으로 모달 닫기
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      logger.debug("Modal closed via overlay click")
      closeModal()
    }
  }

  logger.info("Modal render check", { isOpen, planId: plan?.id })

  if (!isOpen) {
    logger.debug("Modal not open, returning null")
    return null
  }

  logger.info("Rendering modal", {
    isEditMode: !!plan,
    planId: plan?.id,
    exercisesCount: currentPlanExercises?.length || 0,
    hasErrors: Object.keys(errors).length > 0,
  })

  return (
    <div className="workout-plan-modal-overlay" onClick={handleOverlayClick}>
      <div className="workout-plan-modal" onClick={e => e.stopPropagation()}>
        <div className="workout-plan-modal-header">
          <h2 className="workout-plan-modal-title">
            {plan ? "운동 계획 수정" : "새 운동 계획 만들기"}
          </h2>
          <button className="workout-plan-modal-close" onClick={closeModal}>
            <X size={20} />
          </button>
        </div>

        <div className="workout-plan-modal-body">
          {/* 기본 정보 */}
          <div className="form-section">
            <h3>기본 정보</h3>
            <div className="form-group">
              <label htmlFor="plan-name">계획 이름 *</label>
              <input
                id="plan-name"
                type="text"
                value={plan?.name || ""}
                onChange={e => handleInputChange("name", e.target.value)}
                placeholder="예: 상체 근력 운동"
                className={errors.name ? "error" : ""}
              />
              {errors.name && (
                <span className="error-message">{errors.name}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="plan-description">계획 설명 *</label>
              <textarea
                id="plan-description"
                value={plan?.description || ""}
                onChange={e => handleInputChange("description", e.target.value)}
                placeholder="이 운동 계획에 대한 설명을 입력하세요"
                rows={3}
                className={errors.description ? "error" : ""}
              />
              {errors.description && (
                <span className="error-message">{errors.description}</span>
              )}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="plan-difficulty">난이도</label>
                <select
                  id="plan-difficulty"
                  value={plan?.difficulty || "beginner"}
                  onChange={e =>
                    handleInputChange("difficulty", e.target.value)
                  }
                >
                  <option value="beginner">초급</option>
                  <option value="intermediate">중급</option>
                  <option value="advanced">고급</option>
                  <option value="expert">전문가</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="plan-duration">예상 소요시간 (분) *</label>
                <input
                  id="plan-duration"
                  type="number"
                  value={plan?.estimated_duration_minutes || 60}
                  onChange={e => {
                    const value = parseInt(e.target.value) || 0
                    logger.debug("Duration input changed", {
                      rawValue: e.target.value,
                      parsedValue: value,
                    })
                    handleInputChange("estimatedDurationMinutes", value)
                  }}
                  min="1"
                  max="300"
                  className={errors.estimatedDurationMinutes ? "error" : ""}
                />
                {errors.estimatedDurationMinutes && (
                  <span className="error-message">
                    {errors.estimatedDurationMinutes}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* 운동 목록 */}
          <div className="form-section">
            <div className="section-header">
              <h3>운동 목록</h3>
              <button className="add-button" onClick={handleAddExercise}>
                <Plus size={16} />
                운동 추가
              </button>
            </div>

            {errors.exercises && (
              <div className="error-message">{errors.exercises}</div>
            )}

            <div className="exercises-list">
              {currentPlanExercises?.map((exercise, index) => (
                <div key={index} className="exercise-item">
                  <div className="exercise-header">
                    <h4>운동 {index + 1}</h4>
                    <div className="exercise-actions">
                      <button
                        className="action-button"
                        onClick={() => handleConfirmExercise(index)}
                        disabled={confirmedExerciseIndices.has(index)}
                      >
                        <Edit size={14} />
                        확정
                      </button>
                      <button
                        className="action-button delete"
                        onClick={() => handleRemoveExercise(index)}
                      >
                        <Trash2 size={14} />
                        삭제
                      </button>
                    </div>
                  </div>

                  {confirmedExerciseIndices.has(index) ? (
                    <div className="exercise-summary">
                      <div className="summary-item">
                        <span className="exercise-name">
                          {exercise.exerciseName}
                        </span>
                      </div>
                      <div className="summary-item">
                        <Target size={14} />
                        <span>
                          {exercise.sets}세트 × {exercise.repsRange?.min || 0}회
                        </span>
                      </div>
                      {exercise.weightRange && exercise.weightRange.min > 0 && (
                        <div className="summary-item">
                          <span>{exercise.weightRange.min}kg</span>
                        </div>
                      )}
                      {(exercise.restSeconds || 0) > 0 && (
                        <div className="summary-item">
                          <Clock size={14} />
                          <span>{exercise.restSeconds}초 휴식</span>
                        </div>
                      )}
                      {exercise.notes && (
                        <div className="summary-item">
                          <span className="notes">{exercise.notes}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="exercise-form">
                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor={`exercise-${index}-name`}>
                            운동 이름 *
                          </label>
                          <input
                            id={`exercise-${index}-name`}
                            type="text"
                            value={exercise.exerciseName}
                            onChange={e =>
                              handleUpdateExercise(
                                index,
                                "exerciseName",
                                e.target.value
                              )
                            }
                            placeholder="운동 이름"
                            className={
                              errors[`exercise_${index}_name`] ? "error" : ""
                            }
                          />
                          {errors[`exercise_${index}_name`] && (
                            <span className="error-message">
                              {errors[`exercise_${index}_name`]}
                            </span>
                          )}
                        </div>

                        <div className="form-group">
                          <label htmlFor={`exercise-${index}-machine`}>
                            기계 선택
                          </label>
                          <select
                            id={`exercise-${index}-machine`}
                            value={exercise.machineId}
                            onChange={e =>
                              handleUpdateExercise(
                                index,
                                "machineId",
                                parseInt(e.target.value) || 0
                              )
                            }
                          >
                            <option value={0}>기계 없음</option>
                            {(machines || []).map(machine => (
                              <option key={machine.id} value={machine.id}>
                                {machine.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor={`exercise-${index}-sets`}>
                            세트 수 *
                          </label>
                          <input
                            id={`exercise-${index}-sets`}
                            type="number"
                            value={exercise.sets}
                            onChange={e =>
                              handleUpdateExercise(
                                index,
                                "sets",
                                parseInt(e.target.value) || 0
                              )
                            }
                            min="1"
                            max="20"
                            className={
                              errors[`exercise_${index}_sets`] ? "error" : ""
                            }
                          />
                          {errors[`exercise_${index}_sets`] && (
                            <span className="error-message">
                              {errors[`exercise_${index}_sets`]}
                            </span>
                          )}
                        </div>

                        <div className="form-group">
                          <label htmlFor={`exercise-${index}-reps`}>
                            반복 횟수 *
                          </label>
                          <input
                            id={`exercise-${index}-reps`}
                            type="number"
                            value={exercise.repsRange?.min || 0}
                            onChange={e => {
                              const value = parseInt(e.target.value) || 0
                              handleUpdateExercise(
                                index,
                                "repsRange",
                                { min: value, max: value }
                              )
                            }}
                            min="1"
                            max="100"
                            className={
                              errors[`exercise_${index}_reps`] ? "error" : ""
                            }
                          />
                          {errors[`exercise_${index}_reps`] && (
                            <span className="error-message">
                              {errors[`exercise_${index}_reps`]}
                            </span>
                          )}
                        </div>

                        <div className="form-group">
                          <label htmlFor={`exercise-${index}-weight`}>
                            무게 (kg)
                          </label>
                          <input
                            id={`exercise-${index}-weight`}
                            type="number"
                            value={exercise.weightRange?.min || 0}
                            onChange={e => {
                              const value = parseFloat(e.target.value) || 0
                              handleUpdateExercise(
                                index,
                                "weightRange",
                                { min: value, max: value }
                              )
                            }}
                            min="0"
                            step="0.5"
                          />
                        </div>

                        <div className="form-group">
                          <label htmlFor={`exercise-${index}-rest`}>
                            휴식 시간 (초)
                          </label>
                          <input
                            id={`exercise-${index}-rest`}
                            type="number"
                            value={exercise.restSeconds || 0}
                            onChange={e =>
                              handleUpdateExercise(
                                index,
                                "restSeconds",
                                parseInt(e.target.value) || 0
                              )
                            }
                            min="0"
                            max="600"
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label htmlFor={`exercise-${index}-notes`}>메모</label>
                        <textarea
                          id={`exercise-${index}-notes`}
                          value={exercise.notes || ""}
                          onChange={e =>
                            handleUpdateExercise(index, "notes", e.target.value)
                          }
                          placeholder="운동에 대한 추가 메모"
                          rows={2}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {currentPlanExercises?.length === 0 && (
              <div className="no-exercises-message">
                <p>아직 추가된 운동이 없습니다.</p>
                <p>위의 "운동 추가" 버튼을 클릭하여 운동을 추가해주세요.</p>
              </div>
            )}
          </div>
        </div>

        <div className="workout-plan-modal-footer">
          <button className="cancel-btn" onClick={closeModal}>
            취소
          </button>
          <button
            className="save-btn"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            <Save size={16} />
            {isSubmitting ? "저장 중..." : plan ? "수정" : "저장"}
          </button>
        </div>

        {errors.submit && (
          <div className="submit-error-message">{errors.submit}</div>
        )}
      </div>
    </div>
  )
}
