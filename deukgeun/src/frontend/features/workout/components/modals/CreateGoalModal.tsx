import React, { useState } from "react"
import { WorkoutGoalDTO } from "../../types"
import { Button } from "../ui/Button"

interface CreateGoalModalProps {
  isOpen: boolean
  onClose: () => void
  onCreateGoal: (goalData: Omit<WorkoutGoalDTO, "id" | "createdAt" | "updatedAt">) => void
}

export function CreateGoalModal({
  isOpen,
  onClose,
  onCreateGoal,
}: CreateGoalModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "frequency" as const,
    targetValue: 1,
    currentValue: 0,
    unit: "회/주",
    deadline: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onCreateGoal({
      ...formData,
      userId: 1, // 임시로 하드코딩
      isCompleted: false,
      deadline: formData.deadline ? new Date(formData.deadline) : new Date(),
    })
    onClose()
    setFormData({
      title: "",
      description: "",
      type: "frequency",
      targetValue: 1,
      currentValue: 0,
      unit: "회/주",
      deadline: "",
    })
  }

  const handleTypeChange = (type: string) => {
    const typeConfig = {
      frequency: { unit: "회/주", targetValue: 3 },
      weight: { unit: "kg", targetValue: 100 },
      reps: { unit: "회", targetValue: 10 },
      duration: { unit: "분", targetValue: 30 },
      streak: { unit: "일", targetValue: 30 },
    }

    const config = typeConfig[type as keyof typeof typeConfig] || typeConfig.frequency
    setFormData({
      ...formData,
      type: type as any,
      unit: config.unit,
      targetValue: config.targetValue,
    })
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>새 목표 생성</h2>
          <button onClick={onClose} className="modal-close">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="goalTitle">목표 제목 *</label>
            <input
              id="goalTitle"
              type="text"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="goalDescription">설명</label>
            <textarea
              id="goalDescription"
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="form-group">
            <label htmlFor="goalType">목표 타입</label>
            <select
              id="goalType"
              value={formData.type}
              onChange={e => handleTypeChange(e.target.value)}
            >
              <option value="frequency">운동 빈도</option>
              <option value="weight">무게</option>
              <option value="reps">횟수</option>
              <option value="duration">시간</option>
              <option value="streak">연속</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="targetValue">목표 값</label>
            <input
              id="targetValue"
              type="number"
              min="1"
              value={formData.targetValue}
              onChange={e => setFormData({ ...formData, targetValue: parseInt(e.target.value) })}
            />
          </div>

          <div className="form-group">
            <label htmlFor="currentValue">현재 값</label>
            <input
              id="currentValue"
              type="number"
              min="0"
              value={formData.currentValue}
              onChange={e => setFormData({ ...formData, currentValue: parseInt(e.target.value) })}
            />
          </div>

          <div className="form-group">
            <label htmlFor="deadline">목표 기한 (선택사항)</label>
            <input
              id="deadline"
              type="date"
              value={formData.deadline}
              onChange={e => setFormData({ ...formData, deadline: e.target.value })}
            />
          </div>

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
