import React, { useState } from "react"
import type { FormExercise } from "../hooks/usePlanForm"
import type { WorkoutPlanExercise } from "@/shared/types/dto"
import styles from "./PlanExercises.module.css"

interface PlanExercisesProps {
  exercises: FormExercise[]
  onExerciseChange?: (index: number, exercise: FormExercise) => void
  onExerciseRemove?: (index: number) => void
  onExerciseAdd?: () => void
  readOnly?: boolean
}

export function PlanExercises({
  exercises,
  onExerciseChange,
  onExerciseRemove,
  onExerciseAdd,
  readOnly = false,
}: PlanExercisesProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null)

  const handleExerciseChange = (
    index: number,
    field: keyof FormExercise,
    value: any
  ) => {
    if (!onExerciseChange) return

    const updatedExercise = {
      ...exercises[index],
      [field]: value,
    }
    onExerciseChange(index, updatedExercise)
  }

  const handleEditExercise = (index: number) => {
    setEditingIndex(index)
  }

  const handleSaveExercise = (index: number) => {
    setEditingIndex(null)
  }

  const handleCancelEdit = () => {
    setEditingIndex(null)
  }

  const getExerciseDisplayValue = (
    exercise: FormExercise,
    field: string
  ): string => {
    switch (field) {
      case "reps":
        return exercise.repsRange
          ? `${exercise.repsRange.min}-${exercise.repsRange.max}회`
          : `${exercise.reps || 0}회`
      case "weight":
        return exercise.weightRange
          ? `${exercise.weightRange.min}-${exercise.weightRange.max}kg`
          : `${exercise.weight || 0}kg`
      case "restTime":
        return exercise.restSeconds ? `${exercise.restSeconds}초` : "0초"
      default:
        const value = (exercise as any)[field]
        if (value instanceof Date) {
          return value.toLocaleDateString()
        }
        return String(value || "")
    }
  }

  return (
    <div className={styles.exercisesSection}>
      <div className={styles.exercisesHeader}>
        <h4 className={styles.exercisesTitle}>운동 목록</h4>
        {!readOnly && (
          <button
            type="button"
            onClick={onExerciseAdd}
            className={styles.addExerciseButton}
          >
            운동 추가
          </button>
        )}
      </div>

      <div className={styles.exercisesList}>
        {exercises.map((exercise, index) => (
          <div key={index} className={styles.exerciseItem}>
            <div className={styles.exerciseHeader}>
              <span className={styles.exerciseNumber}>#{index + 1}</span>
              <div className={styles.exerciseActions}>
                {!readOnly && editingIndex !== index && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleEditExercise(index)}
                      className={styles.editExerciseButton}
                    >
                      수정
                    </button>
                    <button
                      type="button"
                      onClick={() => onExerciseRemove?.(index)}
                      className={styles.removeExerciseButton}
                    >
                      삭제
                    </button>
                  </>
                )}
                {!readOnly && editingIndex === index && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleSaveExercise(index)}
                      className={styles.saveExerciseButton}
                    >
                      저장
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className={styles.cancelEditButton}
                    >
                      취소
                    </button>
                  </>
                )}
              </div>
            </div>

            {editingIndex === index ? (
              // 편집 모드
              <div className={styles.exerciseFields}>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>운동명</label>
                  <input
                    type="text"
                    value={exercise.exerciseName}
                    onChange={e =>
                      handleExerciseChange(
                        index,
                        "exerciseName",
                        e.target.value
                      )
                    }
                    placeholder="운동명을 입력하세요"
                    className={styles.fieldInput}
                  />
                </div>

                <div className={styles.fieldRow}>
                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>세트</label>
                    <input
                      type="number"
                      value={exercise.sets}
                      onChange={e =>
                        handleExerciseChange(
                          index,
                          "sets",
                          parseInt(e.target.value)
                        )
                      }
                      min="1"
                      className={styles.fieldInput}
                    />
                  </div>

                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>횟수</label>
                    <input
                      type="number"
                      value={exercise.reps || 0}
                      onChange={e => {
                        const reps = parseInt(e.target.value)
                        handleExerciseChange(index, "reps", reps)
                      }}
                      min="1"
                      className={styles.fieldInput}
                    />
                  </div>

                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>무게 (kg)</label>
                    <input
                      type="number"
                      value={exercise.weight || 0}
                      onChange={e => {
                        const weight = parseFloat(e.target.value) || 0
                        handleExerciseChange(index, "weight", weight)
                      }}
                      min="0"
                      step="0.5"
                      className={styles.fieldInput}
                    />
                  </div>

                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>휴식 (초)</label>
                    <input
                      type="number"
                      value={exercise.restTime || 0}
                      onChange={e => {
                        const restTime = parseInt(e.target.value) || 0
                        handleExerciseChange(index, "restTime", restTime)
                      }}
                      min="0"
                      className={styles.fieldInput}
                    />
                  </div>
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>메모</label>
                  <textarea
                    value={exercise.notes || ""}
                    onChange={e =>
                      handleExerciseChange(index, "notes", e.target.value)
                    }
                    placeholder="운동에 대한 메모를 입력하세요"
                    rows={2}
                    className={styles.fieldTextarea}
                  />
                </div>
              </div>
            ) : (
              // 보기 모드
              <div className={styles.exerciseDisplay}>
                <div className={styles.exerciseInfo}>
                  <h5 className={styles.exerciseName}>
                    {exercise.exerciseName}
                  </h5>
                  <div className={styles.exerciseDetails}>
                    <span className={styles.exerciseDetail}>
                      <strong>세트:</strong> {exercise.sets}세트
                    </span>
                    <span className={styles.exerciseDetail}>
                      <strong>횟수:</strong>{" "}
                      {getExerciseDisplayValue(exercise, "reps")}
                    </span>
                    <span className={styles.exerciseDetail}>
                      <strong>무게:</strong>{" "}
                      {getExerciseDisplayValue(exercise, "weight")}
                    </span>
                    <span className={styles.exerciseDetail}>
                      <strong>휴식:</strong>{" "}
                      {getExerciseDisplayValue(exercise, "restTime")}
                    </span>
                  </div>
                  {exercise.notes && (
                    <div className={styles.exerciseNotes}>
                      <strong>메모:</strong> {exercise.notes}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {exercises.length === 0 && (
        <div className={styles.noExercises}>
          <p>등록된 운동이 없습니다.</p>
          {!readOnly && (
            <button
              type="button"
              onClick={onExerciseAdd}
              className={styles.addFirstExerciseButton}
            >
              첫 번째 운동 추가
            </button>
          )}
        </div>
      )}
    </div>
  )
}
