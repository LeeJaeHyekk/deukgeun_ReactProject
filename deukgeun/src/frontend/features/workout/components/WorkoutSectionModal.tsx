import React, { useState, useEffect } from "react"
import { X, Save, Plus, Trash2, Dumbbell, Clock, Repeat } from "lucide-react"
import type { WorkoutPlanExercise, Machine } from "../../../../types"
import "./WorkoutSectionModal.css"

interface WorkoutSectionModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (exercise: Partial<WorkoutPlanExercise>) => void
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

export function WorkoutSectionModal({
  isOpen,
  onClose,
  onSave,
  exercise,
  machines,
  planId,
}: WorkoutSectionModalProps) {
  const [formData, setFormData] = useState<Partial<WorkoutPlanExercise>>({
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

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null)

  // 기존 운동이 있으면 폼 데이터 초기화
  useEffect(() => {
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
      })

      // 선택된 기계 찾기
      const machine = machines.find(m => m.id === exercise.machineId)
      setSelectedMachine(machine || null)
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
      setSelectedMachine(null)
    }
    setErrors({})
  }, [exercise, isOpen, planId, machines])

  // 입력 필드 변경 핸들러
  const handleInputChange = (field: keyof WorkoutPlanExercise, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // 에러 제거
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }))
    }
  }

  // 기계 선택 핸들러
  const handleMachineSelect = (machine: Machine) => {
    setSelectedMachine(machine)
    setFormData(prev => ({
      ...prev,
      machineId: machine.id,
      exerciseName: machine.name,
    }))
    if (errors.machineId) {
      setErrors(prev => ({ ...prev, machineId: "" }))
    }
  }

  // 폼 검증
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.machineId || formData.machineId === 0) {
      newErrors.machineId = "운동 기계를 선택해주세요."
    }

    if (!formData.exerciseName || !formData.exerciseName.trim()) {
      newErrors.exerciseName = "운동 이름을 입력해주세요."
    }

    if (!formData.sets || formData.sets <= 0) {
      newErrors.sets = "세트 수를 입력해주세요."
    }

    if (!formData.reps || formData.reps <= 0) {
      newErrors.reps = "횟수를 입력해주세요."
    }

    if (formData.weight && formData.weight < 0) {
      newErrors.weight = "무게는 0 이상이어야 합니다."
    }

    if (formData.restTime && formData.restTime < 0) {
      newErrors.restTime = "휴식 시간은 0 이상이어야 합니다."
    }

    console.log("WorkoutSectionModal 검증 결과:", {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors,
    })
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // 저장 핸들러
  const handleSave = async () => {
    console.log("WorkoutSectionModal 저장 시도:", formData)

    if (!validateForm()) {
      console.log("폼 검증 실패")
      return
    }

    try {
      // 새 운동 추가 시 id 필드 제거 (편집 모드가 아닌 경우)
      const dataToSave = exercise?.id
        ? formData
        : { ...formData, id: undefined }
      console.log("WorkoutSectionModal 최종 저장 데이터:", dataToSave)

      await onSave(dataToSave)
      console.log("운동 섹션 저장 성공")
    } catch (error) {
      console.error("운동 섹션 저장 실패:", error)
    }
  }

  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
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
      onClose()
    }
  }

  if (!isOpen) return null

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
                      selectedMachine?.id === machine.id ? "active" : ""
                    }`}
                    onClick={() => handleMachineSelect(machine)}
                  >
                    <div className="machine-card-header">
                      <img
                        src={machine.imageUrl || "/img/machine/default.png"}
                        alt={machine.name}
                        className="machine-image"
                        onError={e => {
                          const target = e.target as HTMLImageElement
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
