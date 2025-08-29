import React, { useState } from "react"
import { WorkoutPlanDTO, ExerciseItem } from "../../types"
import { Button } from "../ui/Button"

interface CreatePlanModalProps {
  isOpen: boolean
  onClose: () => void
  onCreatePlan: (
    planData: Omit<WorkoutPlanDTO, "id" | "createdAt" | "updatedAt">
  ) => void
}

export function CreatePlanModal({
  isOpen,
  onClose,
  onCreatePlan,
}: CreatePlanModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    difficulty: "보통" as const,
    totalDurationMinutes: 60,
    exercises: [] as ExerciseItem[],
  })

  const [newExercise, setNewExercise] = useState({
    name: "",
    machineId: 1,
    setCount: 3,
    setDurationSeconds: 60,
  })

  const availableExercises = [
    { id: 1, name: "벤치프레스", machineId: 1 },
    { id: 2, name: "스쿼트", machineId: 2 },
    { id: 3, name: "데드리프트", machineId: 3 },
    { id: 4, name: "오버헤드프레스", machineId: 4 },
    { id: 5, name: "바벨로우", machineId: 5 },
    { id: 6, name: "풀업", machineId: 6 },
    { id: 7, name: "딥스", machineId: 7 },
    { id: 8, name: "러닝", machineId: 8 },
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onCreatePlan(formData as any)
    onClose()
    setFormData({
      name: "",
      description: "",
      difficulty: "보통",
      totalDurationMinutes: 60,
      exercises: [],
    })
  }

  const addExercise = () => {
    if (newExercise.name.trim()) {
      const exercise: ExerciseItem = {
        id: Date.now(),
        name: newExercise.name,
        machineId: newExercise.machineId,
        sets: newExercise.setCount,
        reps: 10, // 기본값
        restTime: newExercise.setDurationSeconds,
        order: formData.exercises.length + 1,
      }
      setFormData({
        ...formData,
        exercises: [...formData.exercises, exercise],
      })
      setNewExercise({
        name: "",
        machineId: 1,
        setCount: 3,
        setDurationSeconds: 60,
      })
    }
  }

  const removeExercise = (exerciseId: number) => {
    setFormData({
      ...formData,
      exercises: formData.exercises.filter(ex => ex.id !== exerciseId),
    })
  }

  const moveExercise = (exerciseId: number, direction: "up" | "down") => {
    const exercises = [...formData.exercises]
    const index = exercises.findIndex(ex => ex.id === exerciseId)

    if (direction === "up" && index > 0) {
      ;[exercises[index], exercises[index - 1]] = [
        exercises[index - 1],
        exercises[index],
      ]
    } else if (direction === "down" && index < exercises.length - 1) {
      ;[exercises[index], exercises[index + 1]] = [
        exercises[index + 1],
        exercises[index],
      ]
    }

    setFormData({
      ...formData,
      exercises: exercises.map((ex, idx) => ({ ...ex, order: idx + 1 })),
    })
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>새 운동 계획 생성</h2>
          <button onClick={onClose} className="modal-close">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="planName">계획 이름 *</label>
            <input
              id="planName"
              type="text"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="planDescription">설명</label>
            <textarea
              id="planDescription"
              value={formData.description}
              onChange={e =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
            />
          </div>

          <div className="form-group">
            <label htmlFor="difficulty">난이도</label>
            <select
              id="difficulty"
              value={formData.difficulty}
              onChange={e =>
                setFormData({ ...formData, difficulty: e.target.value as any })
              }
            >
              <option value="쉬움">쉬움</option>
              <option value="보통">보통</option>
              <option value="어려움">어려움</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="duration">총 소요 시간 (분)</label>
            <input
              id="duration"
              type="number"
              min="1"
              value={formData.totalDurationMinutes}
              onChange={e =>
                setFormData({
                  ...formData,
                  totalDurationMinutes: parseInt(e.target.value),
                })
              }
            />
          </div>

          <div className="form-group">
            <label>운동 추가</label>
            <div className="exercise-input-group">
              <select
                value={newExercise.name}
                onChange={e =>
                  setNewExercise({ ...newExercise, name: e.target.value })
                }
              >
                <option value="">운동을 선택하세요</option>
                {availableExercises.map(exercise => (
                  <option key={exercise.id} value={exercise.name}>
                    {exercise.name}
                  </option>
                ))}
              </select>
              <input
                type="number"
                placeholder="세트 수"
                min="1"
                value={newExercise.setCount}
                onChange={e =>
                  setNewExercise({
                    ...newExercise,
                    setCount: parseInt(e.target.value),
                  })
                }
              />
              <input
                type="number"
                placeholder="세트 시간(초)"
                min="10"
                value={newExercise.setDurationSeconds}
                onChange={e =>
                  setNewExercise({
                    ...newExercise,
                    setDurationSeconds: parseInt(e.target.value),
                  })
                }
              />
              <Button
                type="button"
                onClick={addExercise}
                variant="secondary"
                size="small"
              >
                추가
              </Button>
            </div>
          </div>

          {formData.exercises.length > 0 && (
            <div className="form-group">
              <label>추가된 운동</label>
              <div className="exercise-list">
                {formData.exercises.map((exercise, index) => (
                  <div key={exercise.id} className="exercise-item">
                    <span className="exercise-order">{index + 1}.</span>
                    <span className="exercise-name">{exercise.name}</span>
                    <span className="exercise-details">
                      {exercise.sets}세트 × {exercise.restTime}초
                    </span>
                    <div className="exercise-actions">
                      <Button
                        type="button"
                        onClick={() => moveExercise(exercise.id, "up")}
                        size="small"
                        variant="secondary"
                        disabled={index === 0}
                      >
                        ↑
                      </Button>
                      <Button
                        type="button"
                        onClick={() => moveExercise(exercise.id, "down")}
                        size="small"
                        variant="secondary"
                        disabled={index === formData.exercises.length - 1}
                      >
                        ↓
                      </Button>
                      <Button
                        type="button"
                        onClick={() => removeExercise(exercise.id)}
                        size="small"
                        variant="danger"
                      >
                        삭제
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="modal-actions">
            <Button type="submit" variant="primary">
              저장
            </Button>
            <Button type="button" onClick={onClose} variant="secondary">
              취소
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
