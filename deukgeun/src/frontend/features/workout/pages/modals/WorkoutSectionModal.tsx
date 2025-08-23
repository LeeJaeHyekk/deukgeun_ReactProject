import React, { useState, useEffect } from "react"
import { X, Save, Plus, Trash2, Dumbbell, Clock, Repeat } from "lucide-react"
import type { WorkoutPlanExercise } from "../../../../../shared/types"
import type { Machine } from "@dto/index"
import { findMatchingImage } from "../../../../shared/utils/machineImageUtils"
import "./WorkoutSectionModal.css"

interface WorkoutSectionModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (exercise: Partial<WorkoutPlanExercise>) => Promise<void> | void
  exercise?: WorkoutPlanExercise | null
  machines: Machine[]
  planId: number
}

const MUSCLE_GROUPS = [
  { value: "chest", label: "가슴", icon: "💪" },
  { value: "back", label: "등", icon: "🏋️" },
  { value: "shoulders", label: "어깨", icon: "🤸" },
  { value: "arms", label: "팔", icon: "💪" },
  { value: "abs", label: "복근", icon: "🔥" },
  { value: "legs", label: "하체", icon: "🦵" },
  { value: "full_body", label: "전신", icon: "🏃" },
]

const DIFFICULTY_LEVELS = [
  { value: "beginner", label: "초급", color: "#4CAF50" },
  { value: "intermediate", label: "중급", color: "#FF9800" },
  { value: "advanced", label: "고급", color: "#F44336" },
  { value: "expert", label: "전문가", color: "#9C27B0" },
]

// 로깅 유틸리티
const logger = {
  info: (message: string, data?: any) => {
    console.log(`[WorkoutSectionModal] ${message}`, data || "")
  },
  debug: (message: string, data?: any) => {
    console.debug(`[WorkoutSectionModal] ${message}`, data || "")
  },
  warn: (message: string, data?: any) => {
    console.warn(`[WorkoutSectionModal] ${message}`, data || "")
  },
  error: (message: string, data?: any) => {
    console.error(`[WorkoutSectionModal] ${message}`, data || "")
  },
  performance: (operation: string, startTime: number) => {
    const duration = performance.now() - startTime
    console.log(
      `[WorkoutSectionModal] ${operation} took ${duration.toFixed(2)}ms`
    )
  },
}

export function WorkoutSectionModal({
  isOpen,
  onClose,
  onSave,
  exercise,
  machines,
  planId,
}: WorkoutSectionModalProps) {
  const [formData, setFormData] = useState<Partial<WorkoutPlanExercise>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})

  // 초기화 함수
  const initializeForm = (exercise?: WorkoutPlanExercise) => {
    const startTime = performance.now()
    logger.info("Form initialization started", {
      isEditMode: !!exercise,
      exerciseId: exercise?.id,
      exerciseName: exercise?.exerciseName,
      planId,
    })

    if (exercise) {
      setFormData({
        planId: exercise.planId,
        machineId: exercise.machineId,
        exerciseName: exercise.exerciseName,
        order: exercise.order,
        sets: exercise.sets,
        reps: exercise.reps,
        weight: exercise.weight || 0,
        restTime: exercise.restTime || 60,
        notes: exercise.notes || "",
        id: exercise.id,
      })
      logger.debug("Form initialized for edit mode", {
        machineId: exercise.machineId,
        sets: exercise.sets,
        reps: exercise.reps,
        weight: exercise.weight,
        restTime: exercise.restTime,
      })
    } else {
      setFormData({
        planId,
        machineId: 0,
        exerciseName: "",
        order: 0,
        sets: 3,
        reps: 10,
        weight: 0,
        restTime: 60,
        notes: "",
      })
      logger.debug("Form initialized for add mode", {
        planId,
        defaultSets: 3,
        defaultReps: 10,
        defaultRestTime: 60,
      })
    }
    setErrors({})
    logger.performance("Form initialization", startTime)
  }

  // 모달 열릴 때 초기화
  useEffect(() => {
    if (isOpen) {
      logger.info("Modal opened, initializing form", {
        isEditMode: !!exercise,
        exerciseId: exercise?.id,
        machinesCount: machines.length,
      })
      initializeForm(exercise || undefined)
    } else {
      logger.debug("Modal closed")
    }
  }, [isOpen, exercise])

  // 입력 필드 변경 핸들러
  const handleInputChange = (field: keyof WorkoutPlanExercise, value: any) => {
    logger.debug("Input field changed", {
      field,
      value,
      previousValue: formData[field],
    })

    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }))
      logger.debug("Cleared error for field", { field })
    }
  }

  // 기계 선택 핸들러
  const handleMachineSelect = (machine: Machine) => {
    logger.info("Machine selected", {
      machineId: machine.id,
      machineName: machine.name,
      category: machine.category,
      difficulty: machine.difficulty,
    })

    handleInputChange("machineId", machine.id)
    handleInputChange("exerciseName", machine.name)
  }

  // 폼 검증
  const validateForm = (): boolean => {
    const startTime = performance.now()
    logger.info("Form validation started")

    const requiredFields: Array<[keyof WorkoutPlanExercise, string]> = [
      ["machineId", "운동 기계를 선택해주세요."],
      ["exerciseName", "운동 이름을 입력해주세요."],
      ["sets", "세트 수를 입력해주세요."],
      ["reps", "횟수를 입력해주세요."],
    ]

    const newErrors: Record<string, string> = {}

    requiredFields.forEach(([field, message]) => {
      if (!formData[field] || formData[field] === 0) {
        newErrors[field] = message
        logger.warn("Validation failed", {
          field,
          message,
          value: formData[field],
        })
      }
    })

    // 추가 검증
    if (formData.weight && formData.weight < 0) {
      newErrors.weight = "무게는 0 이상이어야 합니다."
      logger.warn("Weight validation failed", { weight: formData.weight })
    }

    if (formData.restTime && formData.restTime < 0) {
      newErrors.restTime = "휴식 시간은 0 이상이어야 합니다."
      logger.warn("Rest time validation failed", {
        restTime: formData.restTime,
      })
    }

    const isValid = Object.keys(newErrors).length === 0
    logger.info("Form validation completed", {
      isValid,
      errorCount: Object.keys(newErrors).length,
      errors: newErrors,
    })

    setErrors(newErrors)
    logger.performance("Form validation", startTime)
    return isValid
  }

  // 저장 핸들러
  const handleSave = async () => {
    const startTime = performance.now()
    logger.info("Save operation started", {
      isEditMode: !!exercise?.id,
      exerciseId: exercise?.id,
      formData: {
        machineId: formData.machineId,
        exerciseName: formData.exerciseName,
        sets: formData.sets,
        reps: formData.reps,
        weight: formData.weight,
        restTime: formData.restTime,
      },
    })

    if (!validateForm()) {
      logger.warn("Save operation cancelled due to validation failure")
      return
    }

    const dataToSave = exercise?.id ? formData : { ...formData, id: undefined }
    logger.debug("Data prepared for save", dataToSave)

    try {
      await onSave(dataToSave)
      logger.info("Save operation completed successfully")
      logger.performance("Save operation", startTime)
    } catch (error) {
      logger.error("Save operation failed", {
        error: error instanceof Error ? error.message : error,
        exerciseName: formData.exerciseName,
        machineId: formData.machineId,
      })
      logger.performance("Save operation (failed)", startTime)
    }
  }

  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        logger.debug("Modal closed via ESC key")
        onClose()
      }
    }

    if (isOpen) {
      logger.debug("ESC key listener added")
      document.addEventListener("keydown", handleEscape)
      return () => {
        logger.debug("ESC key listener removed")
        document.removeEventListener("keydown", handleEscape)
      }
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
    isEditMode: !!exercise,
    exerciseId: exercise?.id,
    machinesCount: machines.length,
    hasErrors: Object.keys(errors).length > 0,
  })

  return (
    <div className="workout-section-modal-overlay" onClick={handleOverlayClick}>
      <div className="workout-section-modal" onClick={e => e.stopPropagation()}>
        <div className="workout-section-modal-header">
          <h2 className="workout-section-modal-title">
            {exercise ? "운동 섹션 수정" : "새 운동 섹션 추가"}
          </h2>
          <button className="workout-section-modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="workout-section-modal-body">
          {/* 기계 선택 */}
          <div className="form-group">
            <label className="form-label">
              <Dumbbell size={16} />
              운동 기계 *
            </label>
            <div className="machine-selection">
              <div className="machine-grid">
                {machines.map(machine => (
                  <button
                    key={machine.id}
                    type="button"
                    className={`machine-card ${
                      formData.machineId === machine.id ? "active" : ""
                    }`}
                    onClick={() => handleMachineSelect(machine)}
                  >
                    <div className="machine-card-header">
                      <img
                        src={findMatchingImage(machine)}
                        alt={machine.name}
                        className="machine-image"
                        onError={e => {
                          const target = e.target as HTMLImageElement
                          logger.warn("Machine image failed to load", {
                            machineId: machine.id,
                            machineName: machine.name,
                            attemptedImageUrl: target.src,
                          })
                          // 기본 이미지로 대체
                          target.src = "/img/machine/default.png"
                        }}
                      />
                      <div className="machine-badges">
                        {machine.difficulty && (
                          <span
                            className="difficulty-badge"
                            style={{
                              backgroundColor:
                                DIFFICULTY_LEVELS.find(
                                  d => d.value === machine.difficulty
                                )?.color || "#9E9E9E",
                            }}
                          >
                            {DIFFICULTY_LEVELS.find(
                              d => d.value === machine.difficulty
                            )?.label || machine.difficulty}
                          </span>
                        )}
                        <span className="category-badge">
                          {machine.category}
                        </span>
                      </div>
                    </div>
                    <div className="machine-card-body">
                      <h4 className="machine-name">{machine.name}</h4>
                      <p className="machine-description">
                        {machine.description}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            {errors.machineId && (
              <span className="error-message">{errors.machineId}</span>
            )}
          </div>

          {/* 운동 이름 */}
          <div className="form-group">
            <label className="form-label">운동 이름 *</label>
            <input
              type="text"
              value={formData.exerciseName || ""}
              onChange={e => handleInputChange("exerciseName", e.target.value)}
              className={`form-input ${errors.exerciseName ? "error" : ""}`}
              placeholder="운동 이름을 입력하세요"
            />
            {errors.exerciseName && (
              <span className="error-message">{errors.exerciseName}</span>
            )}
          </div>

          {/* 세트, 횟수, 무게 */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">
                <Repeat size={16} />
                세트 수 *
              </label>
              <input
                type="number"
                value={formData.sets || ""}
                onChange={e =>
                  handleInputChange("sets", Number(e.target.value))
                }
                className={`form-input ${errors.sets ? "error" : ""}`}
                placeholder="3"
                min="1"
                max="20"
              />
              {errors.sets && (
                <span className="error-message">{errors.sets}</span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">횟수 *</label>
              <input
                type="number"
                value={formData.reps || ""}
                onChange={e =>
                  handleInputChange("reps", Number(e.target.value))
                }
                className={`form-input ${errors.reps ? "error" : ""}`}
                placeholder="10"
                min="1"
                max="100"
              />
              {errors.reps && (
                <span className="error-message">{errors.reps}</span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">무게 (kg)</label>
              <input
                type="number"
                value={formData.weight || ""}
                onChange={e =>
                  handleInputChange("weight", Number(e.target.value))
                }
                className={`form-input ${errors.weight ? "error" : ""}`}
                placeholder="0"
                min="0"
                step="0.5"
              />
              {errors.weight && (
                <span className="error-message">{errors.weight}</span>
              )}
            </div>
          </div>

          {/* 휴식 시간 */}
          <div className="form-group">
            <label className="form-label">
              <Clock size={16} />
              휴식 시간 (초)
            </label>
            <input
              type="number"
              value={formData.restTime || ""}
              onChange={e =>
                handleInputChange("restTime", Number(e.target.value))
              }
              className={`form-input ${errors.restTime ? "error" : ""}`}
              placeholder="60"
              min="0"
              step="5"
            />
            {errors.restTime && (
              <span className="error-message">{errors.restTime}</span>
            )}
          </div>

          {/* 메모 */}
          <div className="form-group">
            <label className="form-label">메모</label>
            <textarea
              value={formData.notes || ""}
              onChange={e => handleInputChange("notes", e.target.value)}
              className="form-textarea"
              placeholder="운동에 대한 추가 메모를 입력하세요"
              rows={3}
            />
          </div>
        </div>

        <div className="workout-section-modal-footer">
          <button className="cancel-button" onClick={onClose}>
            취소
          </button>
          <button className="save-button" onClick={handleSave}>
            <Save size={16} />
            {exercise ? "수정" : "추가"}
          </button>
        </div>
      </div>
    </div>
  )
}
