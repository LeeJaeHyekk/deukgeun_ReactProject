import React, { useState, useEffect, useCallback } from "react"
import {
  X,
  Plus,
  Trash2,
  Save,
  Clock,
  Target,
  Weight,
  Repeat,
} from "lucide-react"
import type {
  WorkoutPlan,
  WorkoutPlanExercise,
  Machine,
} from "../../../../../types"
import "./WorkoutPlanModal.css"

interface WorkoutPlanModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (plan: WorkoutPlan) => Promise<void> | void
  plan?: WorkoutPlan | null
  machines: Machine[]
}

export function WorkoutPlanModal({
  isOpen,
  onClose,
  onSave,
  plan,
  machines,
}: WorkoutPlanModalProps) {
  const [formData, setFormData] = useState<WorkoutPlan>({
    id: 0,
    userId: 0,
    name: "",
    description: "",
    difficulty: "beginner",
    estimated_duration_minutes: 60,
    exercises: [],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  })

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

  // 초기화
  useEffect(() => {
    if (isOpen) {
      logger.info("Modal opened", { hasPlan: !!plan, planId: plan?.id })
      if (plan) {
        setFormData(plan)
        logger.debug("Plan data loaded", { plan })
      } else {
        // 새 계획 초기화
        setFormData({
          id: 0,
          userId: 0,
          name: "",
          description: "",
          difficulty: "beginner",
          estimated_duration_minutes: 60,
          exercises: [],
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        logger.debug("New plan initialized")
      }
      setErrors({})
      setIsSubmitting(false)
    }
  }, [isOpen, plan])

  // 입력 변경 핸들러
  const handleInputChange = useCallback(
    (field: keyof WorkoutPlan, value: any) => {
      logger.debug("Input changed", { field, value })
      setFormData(prev => ({ ...prev, [field]: value }))

      // 에러 상태 초기화
      if (errors[field]) {
        setErrors(prev => ({ ...prev, [field]: "" }))
      }
    },
    [errors]
  )

  // 운동 추가 (내부 로직만 유지)
  const addExercise = useCallback(() => {
    logger.info("Adding exercise internally")

    const currentExercises = formData.exercises || []
    const newOrder = currentExercises.length

    const newExercise: WorkoutPlanExercise = {
      id: 0,
      planId: formData.id,
      machineId: 0,
      exerciseName: "새로운 운동",
      order: newOrder,
      sets: 3,
      reps: 10,
      weight: 0,
      restTime: 60,
      notes: "",
    }

    logger.debug("New exercise created", newExercise)
    setFormData(prev => ({
      ...prev,
      exercises: [...currentExercises, newExercise],
    }))

    // 에러 상태 초기화
    setErrors(prev => ({ ...prev, exercises: "" }))
  }, [formData.exercises, formData.id])

  // 운동 삭제
  const removeExercise = useCallback(
    (index: number) => {
      logger.info("Removing exercise", { index })
      const currentExercises = formData.exercises || []
      const updatedExercises = currentExercises.filter((_, i) => i !== index)

      // 순서 재정렬
      const reorderedExercises = updatedExercises.map((exercise, i) => ({
        ...exercise,
        order: i,
      }))

      setFormData(prev => ({
        ...prev,
        exercises: reorderedExercises,
      }))

      logger.debug("Exercise removed and reordered", {
        removedIndex: index,
        newLength: reorderedExercises.length,
      })
    },
    [formData.exercises]
  )

  // 운동 정보 업데이트
  const updateExercise = useCallback(
    (index: number, field: keyof WorkoutPlanExercise, value: any) => {
      logger.debug("Exercise updated", { index, field, value })
      const currentExercises = formData.exercises || []
      const updatedExercises = currentExercises.map((exercise, i) =>
        i === index ? { ...exercise, [field]: value } : exercise
      )

      setFormData(prev => ({
        ...prev,
        exercises: updatedExercises,
      }))
    },
    [formData.exercises]
  )

  // 유효성 검사
  const validateForm = useCallback(() => {
    logger.info("Validating form")
    const newErrors: { [key: string]: string } = {}

    if (!formData.name.trim()) {
      newErrors.name = "계획 이름을 입력해주세요"
    }

    if (!formData.description?.trim()) {
      newErrors.description = "계획 설명을 입력해주세요"
    }

    if (
      !formData.estimated_duration_minutes ||
      formData.estimated_duration_minutes <= 0
    ) {
      newErrors.estimated_duration_minutes = "예상 소요시간을 입력해주세요"
    }

    if (!formData.exercises || formData.exercises.length === 0) {
      newErrors.exercises = "최소 하나의 운동을 추가해주세요"
    } else {
      // 각 운동의 유효성 검사
      formData.exercises.forEach((exercise, index) => {
        if (!exercise.exerciseName.trim()) {
          newErrors[`exercise_${index}_name`] = "운동 이름을 입력해주세요"
        }
        if (exercise.sets <= 0) {
          newErrors[`exercise_${index}_sets`] = "세트 수를 입력해주세요"
        }
        if (exercise.reps <= 0) {
          newErrors[`exercise_${index}_reps`] = "반복 횟수를 입력해주세요"
        }
      })
    }

    setErrors(newErrors)
    logger.debug("Validation completed", { errors: newErrors })
    return Object.keys(newErrors).length === 0
  }, [formData])

  // 폼 제출
  const handleSubmit = useCallback(async () => {
    logger.info("Form submission started")

    if (!validateForm()) {
      logger.warn("Form validation failed", { errors })
      return
    }

    setIsSubmitting(true)
    logger.debug("Submitting plan data", { formData })

    try {
      await onSave(formData)
      logger.info("Plan saved successfully")
      onClose()
    } catch (error) {
      logger.error("Plan save failed", { error })
      setErrors({ submit: "계획 저장에 실패했습니다" })
    } finally {
      setIsSubmitting(false)
    }
  }, [formData, validateForm, onSave, onClose])

  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        logger.debug("Modal closed via ESC key")
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape)
      return () => document.removeEventListener("keydown", handleEscape)
    }
  }, [isOpen, onClose])

  // 오버레이 클릭으로 모달 닫기
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      logger.debug("Modal closed via overlay click")
      onClose()
    }
  }

  if (!isOpen) return null

  logger.debug("Rendering modal", {
    isEditMode: !!plan,
    planId: plan?.id,
    exercisesCount: formData.exercises?.length || 0,
    hasErrors: Object.keys(errors).length > 0,
  })

  return (
    <div className="workout-plan-modal-overlay" onClick={handleOverlayClick}>
      <div className="workout-plan-modal" onClick={e => e.stopPropagation()}>
        <div className="workout-plan-modal-header">
          <h2 className="workout-plan-modal-title">
            {plan ? "운동 계획 수정" : "새 운동 계획 만들기"}
          </h2>
          <button className="workout-plan-modal-close" onClick={onClose}>
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
                value={formData.name}
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
                value={formData.description || ""}
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
                  value={formData.difficulty || "beginner"}
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
                  value={formData.estimated_duration_minutes || 60}
                  onChange={e =>
                    handleInputChange(
                      "estimated_duration_minutes",
                      parseInt(e.target.value) || 0
                    )
                  }
                  min="1"
                  max="300"
                  className={errors.estimated_duration_minutes ? "error" : ""}
                />
                {errors.estimated_duration_minutes && (
                  <span className="error-message">
                    {errors.estimated_duration_minutes}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* 운동 목록 */}
          <div className="form-section">
            <div className="section-header">
              <h3>운동 목록</h3>
              <button className="add-button" onClick={addExercise}>
                <Plus size={16} />
                운동 추가
              </button>
            </div>

            {errors.exercises && (
              <div className="error-message">{errors.exercises}</div>
            )}

            <div className="exercises-list">
              {formData.exercises?.map((exercise, index) => (
                <div key={index} className="exercise-item">
                  <div className="exercise-header">
                    <h4>운동 {index + 1}</h4>
                    <button
                      className="remove-exercise-btn"
                      onClick={() => removeExercise(index)}
                      aria-label="운동 삭제"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

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
                            updateExercise(
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
                            updateExercise(
                              index,
                              "machineId",
                              parseInt(e.target.value) || 0
                            )
                          }
                        >
                          <option value={0}>기계 없음</option>
                          {machines.map(machine => (
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
                            updateExercise(
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
                          value={exercise.reps}
                          onChange={e =>
                            updateExercise(
                              index,
                              "reps",
                              parseInt(e.target.value) || 0
                            )
                          }
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
                          value={exercise.weight || 0}
                          onChange={e =>
                            updateExercise(
                              index,
                              "weight",
                              parseFloat(e.target.value) || 0
                            )
                          }
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
                          value={exercise.restTime || 0}
                          onChange={e =>
                            updateExercise(
                              index,
                              "restTime",
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
                          updateExercise(index, "notes", e.target.value)
                        }
                        placeholder="운동에 대한 추가 메모"
                        rows={2}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {formData.exercises?.length === 0 && (
              <div className="no-exercises-message">
                <p>아직 추가된 운동이 없습니다.</p>
                <p>위의 "운동 추가" 버튼을 클릭하여 운동을 추가해주세요.</p>
              </div>
            )}
          </div>
        </div>

        <div className="workout-plan-modal-footer">
          <button className="cancel-btn" onClick={onClose}>
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
