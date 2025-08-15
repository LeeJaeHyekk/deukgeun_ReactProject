import React, { useState, useEffect, useRef, useCallback } from "react"
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
  onSectionEdit?: (exercise: WorkoutPlanExercise) => void
  onSectionDelete?: (exerciseIndex: number) => Promise<void>
}

export function WorkoutPlanModal({
  isOpen,
  onClose,
  onSave,
  plan,
  machines,
  onAddSection,
  onSectionEdit,
  onSectionDelete,
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
  const [saveSuccess, setSaveSuccess] = useState(false)

  // 이전 plan 참조를 위한 useRef
  const prevPlanRef = useRef<WorkoutPlan | null>(null)

  // 기존 계획이 있으면 폼 데이터 초기화
  useEffect(() => {
    console.log("🔍 [WorkoutPlanModal] useEffect triggered:", {
      isOpen,
      planId: plan?.id,
      prevPlanId: prevPlanRef.current?.id,
      planExercises: plan?.exercises?.length || 0,
      formDataExercises: formData.exercises?.length || 0,
    })

    if (isOpen) {
      // plan이 실제로 변경되었을 때만 초기화
      if (plan && plan.id !== prevPlanRef.current?.id) {
        console.log(
          "🔄 [WorkoutPlanModal] New plan detected, initializing formData"
        )
        prevPlanRef.current = plan
        // 깊은 복사로 상태 초기화
        const newFormData = {
          ...plan,
          exercises: plan.exercises ? [...plan.exercises] : [],
        }
        console.log("📝 [WorkoutPlanModal] Setting new formData:", newFormData)
        setFormData(newFormData)
      } else if (plan && plan.id === prevPlanRef.current?.id) {
        // 같은 계획이지만 exercises가 변경된 경우 - 실시간 동기화
        const currentExercises = formData.exercises || []
        const newExercises = plan.exercises || []

        console.log(
          "🔄 [WorkoutPlanModal] Same plan, checking exercises update:",
          {
            currentExercisesLength: currentExercises.length,
            newExercisesLength: newExercises.length,
            currentExercises: currentExercises.map(e => ({
              id: e.id,
              name: e.exerciseName,
            })),
            newExercises: newExercises.map(e => ({
              id: e.id,
              name: e.exerciseName,
            })),
          }
        )

        // exercises 배열이 실제로 변경되었는지 확인
        const currentExercisesKey = JSON.stringify(
          currentExercises.map(e => ({
            id: e.id,
            machineId: e.machineId,
            exerciseName: e.exerciseName,
            sets: e.sets,
            reps: e.reps,
            weight: e.weight,
            restTime: e.restTime,
          }))
        )
        const newExercisesKey = JSON.stringify(
          newExercises.map(e => ({
            id: e.id,
            machineId: e.machineId,
            exerciseName: e.exerciseName,
            sets: e.sets,
            reps: e.reps,
            weight: e.weight,
            restTime: e.restTime,
          }))
        )

        if (
          currentExercises.length !== newExercises.length ||
          currentExercisesKey !== newExercisesKey
        ) {
          console.log(
            "🔄 [WorkoutPlanModal] Exercises changed, updating formData"
          )
          prevPlanRef.current = plan
          const updatedFormData = {
            ...plan,
            exercises: newExercises.map(exercise => ({ ...exercise })),
          }
          console.log(
            "📝 [WorkoutPlanModal] Setting updated formData:",
            updatedFormData
          )
          setFormData(updatedFormData)
        } else {
          console.log("✅ [WorkoutPlanModal] No exercises change detected")
        }
      } else if (!plan && prevPlanRef.current !== null) {
        console.log("🔄 [WorkoutPlanModal] Plan cleared, resetting formData")
        prevPlanRef.current = null
        const resetFormData = {
          id: 0,
          userId: 0,
          name: "",
          description: "",
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          exercises: [],
        }
        console.log(
          "📝 [WorkoutPlanModal] Setting reset formData:",
          resetFormData
        )
        setFormData(resetFormData)
      }
      setErrors({})
      setSaveSuccess(false)
    }
  }, [plan, isOpen])

  // plan.exercises가 변경될 때 formData 동기화
  useEffect(() => {
    console.log("🔄 [WorkoutPlanModal] plan.exercises useEffect triggered:", {
      hasPlan: !!plan,
      hasExercises: !!plan?.exercises,
      isOpen,
      exercisesLength: plan?.exercises?.length || 0,
      currentFormDataExercisesLength: formData.exercises?.length || 0,
    })

    if (plan && plan.exercises && isOpen) {
      console.log(
        "📝 [WorkoutPlanModal] Syncing exercises from plan:",
        plan.exercises
      )
      setFormData(prev => {
        const newFormData = {
          ...prev,
          exercises: [...(plan.exercises || [])],
        }
        console.log(
          "📝 [WorkoutPlanModal] Updated formData with exercises:",
          newFormData
        )
        return newFormData
      })
    }
  }, [plan?.exercises, isOpen])

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

  // 입력 필드 변경 핸들러
  const handleInputChange = useCallback(
    (field: keyof WorkoutPlan, value: string | boolean) => {
      setFormData(prev => ({ ...prev, [field]: value }))
      // 에러 제거
      if (errors[field]) {
        setErrors(prev => ({ ...prev, [field]: "" }))
      }
    },
    [errors]
  )

  // 운동 추가
  const addExercise = useCallback(() => {
    console.log("➕ [WorkoutPlanModal] addExercise called:", {
      hasOnAddSection: !!onAddSection,
      formDataId: formData.id,
      currentExercisesLength: formData.exercises?.length || 0,
    })

    // onAddSection 콜백이 있으면 외부 모달을 사용
    if (onAddSection) {
      const currentExercises = formData.exercises || []
      const newOrder = currentExercises.length

      const newExercise: Partial<WorkoutPlanExercise> = {
        planId: formData.id,
        machineId: 0,
        exerciseName: "",
        order: newOrder,
        sets: 3,
        reps: 10,
        weight: 0,
        restTime: 60,
        notes: "",
        // 명시적으로 새 운동임을 표시
        id: 0,
      }

      console.log(
        "🔄 [WorkoutPlanModal] Calling onAddSection with:",
        newExercise
      )
      onAddSection(newExercise)
      return
    }

    // 내부에서 직접 추가하는 경우 (기본 동작)
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

    console.log(
      "📝 [WorkoutPlanModal] Adding exercise internally:",
      newExercise
    )
    setFormData(prev => {
      const updatedFormData = {
        ...prev,
        exercises: [...currentExercises, newExercise],
      }
      console.log(
        "📝 [WorkoutPlanModal] Updated formData after adding exercise:",
        updatedFormData
      )
      return updatedFormData
    })

    // 에러 상태 초기화
    setErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors.exercises
      // 새로 추가된 운동의 에러도 초기화
      Object.keys(newErrors).forEach(key => {
        if (key.startsWith(`exercise_${newOrder}_`)) {
          delete newErrors[key]
        }
      })
      return newErrors
    })
  }, [onAddSection, formData.id, formData.exercises])

  // 운동 제거
  const removeExercise = (index: number) => {
    setFormData(prev => {
      const updatedExercises =
        prev.exercises?.filter((_, i) => i !== index) || []

      // 순서 재정렬
      const reorderedExercises = updatedExercises.map((exercise, newIndex) => ({
        ...exercise,
        order: newIndex,
      }))

      return {
        ...prev,
        exercises: reorderedExercises,
      }
    })

    // 에러 상태 정리
    setErrors(prev => {
      const newErrors = { ...prev }
      // 제거된 운동의 에러 삭제
      Object.keys(newErrors).forEach(key => {
        if (key.startsWith(`exercise_${index}_`)) {
          delete newErrors[key]
        }
      })
      // 순서가 변경된 운동들의 에러 키 업데이트
      const updatedErrors: Record<string, string> = {}
      Object.entries(newErrors).forEach(([key, value]) => {
        if (key.startsWith("exercise_") && key.includes("_")) {
          const parts = key.split("_")
          const oldIndex = parseInt(parts[1])
          if (oldIndex > index) {
            // 인덱스가 제거된 인덱스보다 큰 경우 -1
            const newIndex = oldIndex - 1
            const newKey = `exercise_${newIndex}_${parts.slice(2).join("_")}`
            updatedErrors[newKey] = value
          } else if (oldIndex < index) {
            // 인덱스가 제거된 인덱스보다 작은 경우 그대로 유지
            updatedErrors[key] = value
          }
          // oldIndex === index인 경우는 삭제됨
        } else {
          updatedErrors[key] = value
        }
      })
      return updatedErrors
    })
  }

  // 운동 업데이트
  const updateExercise = (
    index: number,
    field: keyof WorkoutPlanExercise,
    value: string | number
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

    // exercises가 없거나 비어있으면 에러
    if (!formData.exercises || formData.exercises.length === 0) {
      newErrors.exercises = "최소 하나의 운동을 추가해주세요"
    } else {
      // exercises가 있으면 각 운동 검증
      formData.exercises.forEach((exercise, index) => {
        if (!exercise.machineId || exercise.machineId === 0) {
          newErrors[`exercise_${index}_machine`] = "운동 기구를 선택해주세요"
        }
        if (!exercise.exerciseName || !exercise.exerciseName.trim()) {
          newErrors[`exercise_${index}_name`] = "운동 이름을 입력해주세요"
        }
        if (!exercise.sets || exercise.sets <= 0) {
          newErrors[`exercise_${index}_sets`] = "세트 수는 1 이상이어야 합니다"
        }
        if (!exercise.reps || exercise.reps <= 0) {
          newErrors[`exercise_${index}_reps`] =
            "반복 횟수는 1 이상이어야 합니다"
        }
      })
    }

    setErrors(newErrors)
    const isValid = Object.keys(newErrors).length === 0
    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors,
    }
  }

  const resetForm = () => {
    console.log("🔄 [WorkoutPlanModal] Resetting form data")
    setFormData({
      id: 0,
      userId: 0,
      name: "",
      description: "",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      exercises: [],
    })
    setErrors({})
    setSaveSuccess(false)
  }

  // 저장 핸들러
  const handleSave = async () => {
    console.log(
      "💾 [WorkoutPlanModal] handleSave called with formData:",
      formData
    )

    const { isValid, errors: formErrors } = validateForm()
    console.log("✅ [WorkoutPlanModal] Form validation result:", {
      isValid,
      errors: formErrors,
    })

    if (!isValid) {
      console.log("❌ [WorkoutPlanModal] Form validation failed")
      // 에러가 있는 경우 사용자에게 알림
      const errorMessages = Object.values(formErrors).filter(Boolean)
      if (errorMessages.length > 0) {
        alert(`다음 오류를 수정해주세요:\n${errorMessages.join("\n")}`)
      } else {
        // 에러 메시지가 비어있으면 기본 메시지 표시
        alert("폼에 오류가 있습니다. 모든 필수 필드를 확인해주세요.")
      }
      return
    }

    try {
      // exercises 배열이 없으면 빈 배열로 초기화
      const planDataToSave = {
        ...formData,
        exercises: formData.exercises || [],
      }

      console.log("📤 [WorkoutPlanModal] Calling onSave with:", planDataToSave)
      const updatedPlan = await onSave(planDataToSave)
      console.log("📥 [WorkoutPlanModal] onSave returned:", updatedPlan)

      // 성공 시 성공 메시지 표시 후 모달 닫기
      setSaveSuccess(true)
      console.log(
        "✅ [WorkoutPlanModal] Save successful, closing modal in 1 second"
      )

      // 1초 후 모달 닫기 (사용자가 성공 메시지를 볼 수 있도록)
      setTimeout(() => {
        console.log("🚪 [WorkoutPlanModal] Closing modal after successful save")
        setSaveSuccess(false)
        resetForm()
        onClose()
      }, 1000)
    } catch (error) {
      console.error("❌ [WorkoutPlanModal] Save failed:", error)
      const errorMessage =
        error instanceof Error
          ? error.message
          : "알 수 없는 오류가 발생했습니다."
      alert(`저장 중 오류가 발생했습니다: ${errorMessage}`)
    }
  }

  // 오버레이 클릭으로 모달 닫기
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      console.log(
        "🔄 [WorkoutPlanModal] Overlay clicked, resetting form and closing"
      )
      resetForm()
      onClose()
    }
  }

  if (!isOpen) return null

  // 렌더링 로그 제거 (성능 최적화)

  return (
    <div className="workout-plan-modal-overlay" onClick={handleOverlayClick}>
      <div className="workout-plan-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{plan ? "운동 계획 수정" : "새 운동 계획 만들기"}</h2>
          <button onClick={onClose} className="close-btn">
            <X size={24} />
          </button>
        </div>

        <div className="modal-content">
          {/* 성공 메시지 */}
          {saveSuccess && (
            <div className="success-message">
              <p>✅ 계획이 성공적으로 저장되었습니다!</p>
              <p className="success-subtitle">잠시 후 모달이 닫힙니다...</p>
            </div>
          )}

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
                  <div className="exercise-info">
                    <span className="exercise-number">{index + 1}</span>
                    <div className="exercise-details">
                      <h4>{exercise.exerciseName || "운동 이름 없음"}</h4>
                    </div>
                  </div>
                  <div className="exercise-actions">
                    {onSectionEdit && (
                      <button
                        onClick={() => onSectionEdit(exercise)}
                        className="edit-button"
                        title="운동 편집"
                      >
                        편집
                      </button>
                    )}
                    {onSectionDelete ? (
                      <button
                        onClick={() => onSectionDelete(index)}
                        className="remove-button"
                        title="운동 삭제"
                      >
                        <Trash2 size={16} />
                      </button>
                    ) : (
                      <button
                        onClick={() => removeExercise(index)}
                        className="remove-button"
                        title="운동 삭제"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>

                {/* 운동 상세 정보 */}
                <div className="exercise-details-section">
                  <div className="exercise-summary-grid">
                    <div className="exercise-param">
                      <span className="param-label">세트</span>
                      <span className="param-value">
                        {exercise.sets || 0}세트
                      </span>
                    </div>
                    <div className="exercise-param">
                      <span className="param-label">횟수</span>
                      <span className="param-value">
                        {exercise.reps || 0}회
                      </span>
                    </div>
                    <div className="exercise-param">
                      <span className="param-label">무게</span>
                      <span className="param-value">
                        {exercise.weight || 0}kg
                      </span>
                    </div>
                    <div className="exercise-param">
                      <span className="param-label">휴식</span>
                      <span className="param-value">
                        {exercise.restTime || 0}초
                      </span>
                    </div>
                  </div>
                  {exercise.notes && (
                    <div className="exercise-notes">
                      <span className="notes-label">메모:</span>
                      <span className="notes-content">{exercise.notes}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="modal-footer">
          {!saveSuccess ? (
            <>
              <button onClick={onClose} className="cancel-btn">
                취소
              </button>
              <button onClick={handleSave} className="save-btn">
                <Save size={16} />
                저장
              </button>
            </>
          ) : (
            <button onClick={onClose} className="close-btn">
              닫기
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
