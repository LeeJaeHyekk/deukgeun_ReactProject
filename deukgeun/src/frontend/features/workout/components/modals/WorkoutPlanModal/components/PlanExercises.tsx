import React from "react"
import type { WorkoutPlanExercise } from "../../../../../shared/types"

interface PlanExercisesProps {
  exercises: WorkoutPlanExercise[]
  onExerciseChange?: (index: number, exercise: WorkoutPlanExercise) => void
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
  const handleExerciseChange = (
    index: number,
    field: keyof WorkoutPlanExercise,
    value: any
  ) => {
    if (!onExerciseChange) return

    const updatedExercise = {
      ...exercises[index],
      [field]: value,
    }
    onExerciseChange(index, updatedExercise)
  }

  return (
    <div className="plan-exercises">
      <div className="exercises-header">
        <h4>운동 목록</h4>
        {!readOnly && (
          <button
            type="button"
            onClick={onExerciseAdd}
            className="add-exercise-btn"
          >
            운동 추가
          </button>
        )}
      </div>

      <div className="exercises-list">
        {exercises.map((exercise, index) => (
          <div key={index} className="exercise-item">
            <div className="exercise-header">
              <span className="exercise-number">#{index + 1}</span>
              {!readOnly && (
                <button
                  type="button"
                  onClick={() => onExerciseRemove?.(index)}
                  className="remove-exercise-btn"
                >
                  삭제
                </button>
              )}
            </div>

            <div className="exercise-fields">
              <div className="field-group">
                <label>운동명</label>
                <input
                  type="text"
                  value={exercise.exerciseName}
                  onChange={e =>
                    handleExerciseChange(index, "exerciseName", e.target.value)
                  }
                  disabled={readOnly}
                  placeholder="운동명을 입력하세요"
                />
              </div>

              <div className="field-row">
                <div className="field-group">
                  <label>세트</label>
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
                    disabled={readOnly}
                    min="1"
                  />
                </div>

                <div className="field-group">
                  <label>횟수</label>
                  <input
                    type="number"
                    value={exercise.reps}
                    onChange={e =>
                      handleExerciseChange(
                        index,
                        "reps",
                        parseInt(e.target.value)
                      )
                    }
                    disabled={readOnly}
                    min="1"
                  />
                </div>

                <div className="field-group">
                  <label>무게 (kg)</label>
                  <input
                    type="number"
                    value={exercise.weight || ""}
                    onChange={e =>
                      handleExerciseChange(
                        index,
                        "weight",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    disabled={readOnly}
                    min="0"
                    step="0.5"
                  />
                </div>

                <div className="field-group">
                  <label>휴식 (초)</label>
                  <input
                    type="number"
                    value={exercise.restTime || ""}
                    onChange={e =>
                      handleExerciseChange(
                        index,
                        "restTime",
                        parseInt(e.target.value) || 0
                      )
                    }
                    disabled={readOnly}
                    min="0"
                  />
                </div>
              </div>

              <div className="field-group">
                <label>메모</label>
                <textarea
                  value={exercise.notes || ""}
                  onChange={e =>
                    handleExerciseChange(index, "notes", e.target.value)
                  }
                  disabled={readOnly}
                  placeholder="운동에 대한 메모를 입력하세요"
                  rows={2}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {exercises.length === 0 && (
        <div className="no-exercises">
          <p>등록된 운동이 없습니다.</p>
          {!readOnly && (
            <button
              type="button"
              onClick={onExerciseAdd}
              className="add-first-exercise-btn"
            >
              첫 번째 운동 추가
            </button>
          )}
        </div>
      )}
    </div>
  )
}
