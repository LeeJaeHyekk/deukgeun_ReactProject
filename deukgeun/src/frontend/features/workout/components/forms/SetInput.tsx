import React, { useState, useEffect } from "react"
import { Button } from "../ui/Button"

interface SetInputProps {
  exerciseName: string
  setNumber: number
  onSetComplete: (setData: {
    repsCompleted: number
    weightKg?: number
    durationSeconds?: number
    rpeRating?: number
    notes?: string
    isPersonalBest: boolean
  }) => void
  onSetSkip: () => void
  previousSet?: {
    repsCompleted: number
    weightKg?: number
    durationSeconds?: number
  }
}

export function SetInput({
  exerciseName,
  setNumber,
  onSetComplete,
  onSetSkip,
  previousSet,
}: SetInputProps) {
  const [formData, setFormData] = useState({
    repsCompleted: previousSet?.repsCompleted || 0,
    weightKg: previousSet?.weightKg || 0,
    durationSeconds: previousSet?.durationSeconds || 0,
    rpeRating: 0,
    notes: "",
  })

  const [isCompleted, setIsCompleted] = useState(false)
  const [isPersonalBest, setIsPersonalBest] = useState(false)
  const [timer, setTimer] = useState(0)
  const [isTimerRunning, setIsTimerRunning] = useState(false)

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1)
      }, 1000)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isTimerRunning])

  const startTimer = () => {
    setIsTimerRunning(true)
  }

  const stopTimer = () => {
    setIsTimerRunning(false)
    setFormData(prev => ({ ...prev, durationSeconds: timer }))
  }

  const resetTimer = () => {
    setTimer(0)
    setIsTimerRunning(false)
    setFormData(prev => ({ ...prev, durationSeconds: 0 }))
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleComplete = () => {
    if (formData.repsCompleted > 0) {
      onSetComplete({
        ...formData,
        isPersonalBest,
      })
      setIsCompleted(true)
    }
  }

  const handleSkip = () => {
    onSetSkip()
  }

  const handleRpeChange = (rating: number) => {
    setFormData(prev => ({ ...prev, rpeRating: rating }))
  }

  const quickReps = [5, 8, 10, 12, 15, 20]
  const quickWeights = [20, 30, 40, 50, 60, 70, 80, 90, 100]
  const rpeScale = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

  if (isCompleted) {
    return (
      <div className="set-input completed">
        <div className="set-header">
          <h3>
            {exerciseName} - 세트 {setNumber}
          </h3>
          <span className="completion-badge">완료</span>
        </div>
        <div className="set-summary">
          <div className="summary-item">
            <span className="summary-label">완료한 횟수:</span>
            <span className="summary-value">{formData.repsCompleted}회</span>
          </div>
          {formData.weightKg > 0 && (
            <div className="summary-item">
              <span className="summary-label">무게:</span>
              <span className="summary-value">{formData.weightKg}kg</span>
            </div>
          )}
          {formData.durationSeconds > 0 && (
            <div className="summary-item">
              <span className="summary-label">시간:</span>
              <span className="summary-value">
                {formatTime(formData.durationSeconds)}
              </span>
            </div>
          )}
          {formData.rpeRating > 0 && (
            <div className="summary-item">
              <span className="summary-label">RPE:</span>
              <span className="summary-value">{formData.rpeRating}/10</span>
            </div>
          )}
          {isPersonalBest && (
            <div className="personal-best-indicator">🏆 개인 최고 기록!</div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="set-input">
      <div className="set-header">
        <h3>
          {exerciseName} - 세트 {setNumber}
        </h3>
        {previousSet && (
          <div className="previous-set-info">
            <span className="previous-label">이전 세트:</span>
            <span className="previous-value">
              {previousSet.repsCompleted}회
              {previousSet.weightKg ? ` × ${previousSet.weightKg}kg` : ""}
            </span>
          </div>
        )}
      </div>

      <div className="set-inputs">
        <div className="input-group">
          <label htmlFor="reps">완료한 횟수 *</label>
          <input
            id="reps"
            type="number"
            min="0"
            value={formData.repsCompleted}
            onChange={e =>
              setFormData(prev => ({
                ...prev,
                repsCompleted: parseInt(e.target.value) || 0,
              }))
            }
            placeholder="0"
          />
          <div className="quick-buttons">
            {quickReps.map(reps => (
              <button
                key={reps}
                type="button"
                className="quick-button"
                onClick={() =>
                  setFormData(prev => ({ ...prev, repsCompleted: reps }))
                }
              >
                {reps}
              </button>
            ))}
          </div>
        </div>

        <div className="input-group">
          <label htmlFor="weight">무게 (kg)</label>
          <input
            id="weight"
            type="number"
            min="0"
            step="0.5"
            value={formData.weightKg}
            onChange={e =>
              setFormData(prev => ({
                ...prev,
                weightKg: parseFloat(e.target.value) || 0,
              }))
            }
            placeholder="0"
          />
          <div className="quick-buttons">
            {quickWeights.map(weight => (
              <button
                key={weight}
                type="button"
                className="quick-button"
                onClick={() =>
                  setFormData(prev => ({ ...prev, weightKg: weight }))
                }
              >
                {weight}
              </button>
            ))}
          </div>
        </div>

        <div className="input-group">
          <label>세트 시간</label>
          <div className="timer-display">
            <span className="timer-value">{formatTime(timer)}</span>
            <div className="timer-controls">
              {!isTimerRunning ? (
                <Button onClick={startTimer} size="small" variant="primary">
                  시작
                </Button>
              ) : (
                <Button onClick={stopTimer} size="small" variant="secondary">
                  정지
                </Button>
              )}
              <Button onClick={resetTimer} size="small" variant="secondary">
                리셋
              </Button>
            </div>
          </div>
        </div>

        <div className="input-group">
          <label>RPE (Rate of Perceived Exertion)</label>
          <div className="rpe-scale">
            {rpeScale.map(rating => (
              <button
                key={rating}
                type="button"
                className={`rpe-button ${formData.rpeRating === rating ? "selected" : ""}`}
                onClick={() => handleRpeChange(rating)}
              >
                {rating}
              </button>
            ))}
          </div>
          <div className="rpe-labels">
            <span className="rpe-label">1-3: 쉬움</span>
            <span className="rpe-label">4-6: 보통</span>
            <span className="rpe-label">7-9: 어려움</span>
            <span className="rpe-label">10: 최대</span>
          </div>
        </div>

        <div className="input-group">
          <label htmlFor="notes">메모</label>
          <textarea
            id="notes"
            value={formData.notes}
            onChange={e =>
              setFormData(prev => ({ ...prev, notes: e.target.value }))
            }
            placeholder="세트에 대한 메모를 입력하세요..."
            rows={2}
          />
        </div>

        <div className="personal-best-toggle">
          <label>
            <input
              type="checkbox"
              checked={isPersonalBest}
              onChange={e => setIsPersonalBest(e.target.checked)}
            />
            개인 최고 기록
          </label>
        </div>
      </div>

      <div className="set-actions">
        <Button
          onClick={handleComplete}
          variant="primary"
          disabled={formData.repsCompleted === 0}
        >
          세트 완료
        </Button>
        <Button onClick={handleSkip} variant="secondary">
          건너뛰기
        </Button>
      </div>
    </div>
  )
}
