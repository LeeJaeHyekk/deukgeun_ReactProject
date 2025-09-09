import React, { useState } from "react"
import { Button } from "../ui/Button"

interface AddExerciseModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AddExerciseModal({ isOpen, onClose }: AddExerciseModalProps) {
  const [formData, setFormData] = useState({
    exerciseSelect: "",
    setCount: 3,
    setDuration: 60,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // 운동 추가 로직 구현 예정
    console.log("Adding exercise:", formData)
    onClose()
    setFormData({
      exerciseSelect: "",
      setCount: 3,
      setDuration: 60,
    })
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>운동 추가</h2>
          <button onClick={onClose} className="modal-close">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="exerciseSelect">운동 선택 *</label>
            <select
              id="exerciseSelect"
              value={formData.exerciseSelect}
              onChange={e =>
                setFormData({ ...formData, exerciseSelect: e.target.value })
              }
              required
            >
              <option value="">운동을 선택하세요</option>
              <option value="벤치프레스">벤치프레스</option>
              <option value="스쿼트">스쿼트</option>
              <option value="데드리프트">데드리프트</option>
              <option value="오버헤드프레스">오버헤드프레스</option>
              <option value="바벨로우">바벨로우</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="setCount">세트 수</label>
            <input
              id="setCount"
              type="number"
              min="1"
              value={formData.setCount}
              onChange={e =>
                setFormData({ ...formData, setCount: parseInt(e.target.value) })
              }
            />
          </div>

          <div className="form-group">
            <label htmlFor="setDuration">세트 별 시간 (초)</label>
            <input
              id="setDuration"
              type="number"
              min="10"
              value={formData.setDuration}
              onChange={e =>
                setFormData({
                  ...formData,
                  setDuration: parseInt(e.target.value),
                })
              }
            />
          </div>

          <div className="modal-actions">
            <Button type="submit" variant="primary">
              추가
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
