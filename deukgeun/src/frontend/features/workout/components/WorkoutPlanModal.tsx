import React, { useState, useEffect } from "react"
import { X, Plus, Trash2, Save } from "lucide-react"
import type {
  Machine,
  WorkoutPlan,
  WorkoutPlanExercise,
} from "../../../../types"
import "./WorkoutPlanModal.css"

interface WorkoutPlanModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (plan: WorkoutPlan) => void
  plan?: WorkoutPlan | null
  machines: Machine[]
  onAddSection?: (exercise: Partial<WorkoutPlanExercise>) => void
}

const DIFFICULTY_OPTIONS = [
  { value: "beginner", label: "초급" },
  { value: "intermediate", label: "중급" },
  { value: "advanced", label: "고급" },
  { value: "expert", label: "전문가" },
]

const MUSCLE_GROUPS = ["가슴", "등", "어깨", "팔", "복근", "하체", "전신"]

export function WorkoutPlanModal({
  isOpen,
  onClose,
  onSave,
  plan,
  machines,
  onAddSection,
}: WorkoutPlanModalProps) {
  const [formData, setFormData] = useState<WorkoutPlan>({
    id: 0,
    userId: 0,
    name: "",
    description: "",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // 기존 계획이 있으면 폼 데이터 초기화
  useEffect(() => {
    if (plan) {
      setFormData(plan)
    } else {
      setFormData({
        id: 0,
        userId: 0,
        name: "",
        description: "",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    }
    setErrors({})
  }, [plan, isOpen])

  // 입력 필드 변경 핸들러
  const handleInputChange = (field: keyof WorkoutPlan, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // 에러 제거
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }))
    }
  }

  // 운동 추가
  const addExercise = () => {
    if (onAddSection) {
      // 외부 섹션 모달을 사용하는 경우
      onAddSection({
        planId: formData.id,
        machineId: 0,
        exerciseName: "",
        order: formData.exercises?.length || 0,
        sets: 3,
        reps: 10,
        weight: 0,
        restTime: 60,
        notes: "",
      })
    } else {
      // 내부에서 직접 추가하는 경우
      const newExercise: WorkoutPlanExercise = {
        id: 0,
        planId: formData.id,
        machineId: 0,
        exerciseName: "",
        order: formData.exercises?.length || 0,
        sets: 3,
        reps: 10,
        weight: 0,
        restTime: 60,
        notes: "",
      }

      setFormData(prev => ({
        ...prev,
        exercises: [...(prev.exercises || []), newExercise],
      }))
    }
  }

  // 운동 제거
  const removeExercise = (index: number) => {
    setFormData(prev => ({
      ...prev,
      exercises: prev.exercises?.filter((_, i) => i !== index) || [],
    }))
  }

  // 운동 업데이트
  const updateExercise = (
    index: number,
    field: keyof WorkoutPlanExercise,
    value: any
  ) => {
    setFormData(prev => ({
      ...prev,
      exercises:
        prev.exercises?.map((exercise, i) =>
          i === index ? { ...exercise, [field]: value } : exercise
        ) || [],
    }))
  }

  // 폼 검증
  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "계획 이름을 입력해주세요"
    }

    if (formData.exercises?.length === 0) {
      newErrors.exercises = "최소 하나의 운동을 추가해주세요"
    }

    formData.exercises?.forEach((exercise, index) => {
      if (!exercise.machineId) {
        newErrors[`exercise_${index}_machine`] = "운동 기구를 선택해주세요"
      }
      if (!exercise.exerciseName.trim()) {
        newErrors[`exercise_${index}_name`] = "운동 이름을 입력해주세요"
      }
      if (exercise.sets <= 0) {
        newErrors[`exercise_${index}_sets`] = "세트 수는 1 이상이어야 합니다"
      }
      if (exercise.reps <= 0) {
        newErrors[`exercise_${index}_reps`] = "반복 횟수는 1 이상이어야 합니다"
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // 저장 핸들러
  const handleSave = () => {
    if (validateForm()) {
      onSave(formData)
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="workout-plan-modal-overlay">
      <div className="workout-plan-modal">
        <div className="modal-header">
          <h2>{plan ? "운동 계획 수정" : "새 운동 계획 만들기"}</h2>
          <button onClick={onClose} className="close-btn">
            <X size={24} />
          </button>
        </div>

        <div className="modal-content">
          {/* 기본 정보 */}
          <div className="form-section">
            <h3>기본 정보</h3>
            <div className="form-group">
              <label>계획 이름 *</label>
              <input
                type="text"
                value={formData.name}
                onChange={e => handleInputChange("name", e.target.value)}
                className={errors.name ? "error" : ""}
                placeholder="운동 계획 이름을 입력하세요"
              />
              {errors.name && (
                <span className="error-message">{errors.name}</span>
              )}
            </div>

            <div className="form-group">
              <label>설명</label>
              <textarea
                value={formData.description || ""}
                onChange={e => handleInputChange("description", e.target.value)}
                placeholder="운동 계획에 대한 설명을 입력하세요"
                rows={3}
              />
            </div>
          </div>

          {/* 운동 목록 */}
          <div className="form-section">
            <div className="section-header">
              <h3>운동 목록</h3>
              <button onClick={addExercise} className="add-button">
                <Plus size={16} />
                운동 추가
              </button>
            </div>

            {errors.exercises && (
              <span className="error-message">{errors.exercises}</span>
            )}

            {formData.exercises?.map((exercise, index) => (
              <div key={index} className="exercise-item">
                <div className="exercise-header">
                  <h4>운동 {index + 1}</h4>
                  <button
                    onClick={() => removeExercise(index)}
                    className="remove-button"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="exercise-content">
                  <div className="form-group">
                    <label>운동 기구 *</label>
                    <select
                      value={exercise.machineId}
                      onChange={e =>
                        updateExercise(
                          index,
                          "machineId",
                          parseInt(e.target.value)
                        )
                      }
                      className={
                        errors[`exercise_${index}_machine`] ? "error" : ""
                      }
                    >
                      <option value={0}>운동 기구 선택</option>
                      {machines.map(machine => (
                        <option key={machine.id} value={machine.id}>
                          {machine.name} ({machine.category})
                        </option>
                      ))}
                    </select>
                    {errors[`exercise_${index}_machine`] && (
                      <span className="error-message">
                        {errors[`exercise_${index}_machine`]}
                      </span>
                    )}
                  </div>

                  <div className="form-group">
                    <label>운동 이름 *</label>
                    <input
                      type="text"
                      value={exercise.exerciseName}
                      onChange={e =>
                        updateExercise(index, "exerciseName", e.target.value)
                      }
                      className={
                        errors[`exercise_${index}_name`] ? "error" : ""
                      }
                      placeholder="운동 이름을 입력하세요"
                    />
                    {errors[`exercise_${index}_name`] && (
                      <span className="error-message">
                        {errors[`exercise_${index}_name`]}
                      </span>
                    )}
                  </div>

                  <div className="exercise-params">
                    <div className="form-group">
                      <label>세트 수 *</label>
                      <input
                        type="number"
                        min="1"
                        value={exercise.sets}
                        onChange={e =>
                          updateExercise(
                            index,
                            "sets",
                            parseInt(e.target.value)
                          )
                        }
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
                      <label>반복 횟수 *</label>
                      <input
                        type="number"
                        min="1"
                        value={exercise.reps}
                        onChange={e =>
                          updateExercise(
                            index,
                            "reps",
                            parseInt(e.target.value)
                          )
                        }
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
                      <label>무게 (kg)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        value={exercise.weight || 0}
                        onChange={e =>
                          updateExercise(
                            index,
                            "weight",
                            parseFloat(e.target.value) || 0
                          )
                        }
                      />
                    </div>

                    <div className="form-group">
                      <label>휴식 시간 (초)</label>
                      <input
                        type="number"
                        min="0"
                        value={exercise.restTime || 60}
                        onChange={e =>
                          updateExercise(
                            index,
                            "restTime",
                            parseInt(e.target.value) || 60
                          )
                        }
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>메모</label>
                    <textarea
                      value={exercise.notes || ""}
                      onChange={e =>
                        updateExercise(index, "notes", e.target.value)
                      }
                      placeholder="운동에 대한 메모를 입력하세요"
                      rows={2}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="cancel-btn">
            취소
          </button>
          <button onClick={handleSave} className="save-btn">
            <Save size={16} />
            저장
          </button>
        </div>
      </div>
    </div>
  )
}
