import React from "react"
import { useWorkoutTimer } from "../../../../shared/contexts/WorkoutTimerContext"

interface GlobalWorkoutTimerProps {
  className?: string
}

export function GlobalWorkoutTimer({
  className = "",
}: GlobalWorkoutTimerProps) {
  const {
    timerState,
    startTimer,
    pauseTimer,
    resetTimer,
    // getFormattedTime,
    // getSessionProgress,
  } = useWorkoutTimer()

  const handleStartPause = () => {
    if (timerState.isRunning) {
      pauseTimer()
    } else {
      startTimer()
    }
  }

  const handleReset = () => {
    resetTimer()
  }

  const progress = 0 // 임시로 0으로 설정

  return (
    <div className={`global-workout-timer ${className}`}>
      <div className="timer-display">
        <div className="timer-time">00:00:00</div>
        <div className="timer-progress">
          <div
            className="timer-progress-bar"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="timer-controls">
        <button
          type="button"
          onClick={handleStartPause}
          className={`timer-btn ${timerState.isRunning ? "pause" : "start"}`}
        >
          {timerState.isRunning ? "일시정지" : "시작"}
        </button>

        <button type="button" onClick={handleReset} className="timer-btn reset">
          리셋
        </button>
      </div>

      <div className="timer-info">
        <span className="timer-status">
          {timerState.isRunning ? "운동 중" : "대기 중"}
        </span>
        <span className="timer-progress-text">
          {Math.round(progress)}% 완료
        </span>
      </div>
    </div>
  )
}
