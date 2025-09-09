import React from "react"
import { Play, Pause, Save } from "lucide-react"

interface ModalFooterProps {
  onClose: () => void
  onComplete: () => void
  isTimerRunning: boolean
  onToggleTimer: () => void
  currentExerciseIndex: number
  totalExercises: number
}

export const ModalFooter: React.FC<ModalFooterProps> = ({
  onClose,
  onComplete,
  isTimerRunning,
  onToggleTimer,
  currentExerciseIndex,
  totalExercises,
}) => (
  <div className="modal-footer">
    <div className="footer-progress">
      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{
            width: `${((currentExerciseIndex + 1) / totalExercises) * 100}%`,
          }}
        />
      </div>
      <span className="progress-text">
        {currentExerciseIndex + 1} / {totalExercises} 운동
      </span>
    </div>
    <div className="footer-controls">
      <button onClick={onClose} className="cancel-btn">
        취소
      </button>
      <button onClick={onToggleTimer} className="timer-btn">
        {isTimerRunning ? <Pause size={16} /> : <Play size={16} />}
        {isTimerRunning ? "일시정지" : "운동 시작"}
      </button>
      <button onClick={onComplete} className="complete-btn">
        <Save size={16} />
        세션 저장
      </button>
    </div>
  </div>
)
