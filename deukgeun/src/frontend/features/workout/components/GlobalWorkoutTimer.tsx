import React, { useState, useEffect } from "react"
import { Play, Pause, Square, Clock, Target } from "lucide-react"
import { useWorkoutTimer } from "../../../shared/contexts/WorkoutTimerContext"
import WorkoutSessionService, {
  SessionData,
} from "../services/WorkoutSessionService"
import "./GlobalWorkoutTimer.css"

interface GlobalWorkoutTimerProps {
  onOpenSessionModal?: () => void
}

export function GlobalWorkoutTimer({
  onOpenSessionModal,
}: GlobalWorkoutTimerProps) {
  const {
    timerState,
    sessionState,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    getFormattedTime,
    getSessionProgress,
    isSessionActive,
  } = useWorkoutTimer()

  const [sessionService] = useState(() => WorkoutSessionService.getInstance())
  const [currentSessionData, setCurrentSessionData] =
    useState<SessionData | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)

  // 세션 데이터 동기화
  useEffect(() => {
    const sessionData = sessionService.getCurrentSession()
    setCurrentSessionData(sessionData)
  }, [sessionService, timerState.isRunning, timerState.isPaused])

  // 타이머가 활성화되어 있지 않으면 렌더링하지 않음
  if (!isSessionActive()) {
    return null
  }

  const handleStart = () => {
    if (timerState.isPaused) {
      resumeTimer()
      sessionService.resumeSession()
    } else {
      // 새 세션 시작 (임시로 자유 운동으로 시작)
      const sessionData = sessionService.startFreeSession()
      startTimer(sessionData.sessionId)
    }
  }

  const handlePause = () => {
    pauseTimer()
    sessionService.pauseSession()
  }

  const handleStop = () => {
    stopTimer()
    sessionService.cancelSession()
  }

  const handleOpenSessionModal = () => {
    onOpenSessionModal?.()
  }

  const progress = getSessionProgress()
  const formattedTime = getFormattedTime()

  return (
    <div className={`global-workout-timer ${isExpanded ? "expanded" : ""}`}>
      <div className="timer-header" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="timer-info">
          <Clock size={16} className="timer-icon" />
          <span className="timer-time">{formattedTime}</span>
          {currentSessionData?.plan?.name && (
            <span className="session-name">{currentSessionData.plan.name}</span>
          )}
        </div>

        <div className="timer-status">
          {timerState.isRunning ? (
            <div className="status-indicator running">
              <div className="pulse-dot"></div>
              운동 중
            </div>
          ) : (
            <div className="status-indicator paused">일시정지</div>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="timer-details">
          {/* 진행률 표시 */}
          {currentSessionData && (
            <div className="progress-section">
              <div className="progress-info">
                <Target size={14} />
                <span>진행률</span>
                <span className="progress-percentage">
                  {Math.round(progress)}%
                </span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* 현재 운동 정보 */}
          {currentSessionData?.exercises &&
            currentSessionData.exercises.length > 0 && (
              <div className="current-exercise">
                <span className="exercise-label">현재 운동:</span>
                <span className="exercise-name">
                  {currentSessionData.exercises[
                    sessionState.currentExerciseIndex
                  ]?.exerciseName || "자유 운동"}
                </span>
              </div>
            )}

          {/* 컨트롤 버튼 */}
          <div className="timer-controls">
            {timerState.isRunning ? (
              <button onClick={handlePause} className="control-btn pause-btn">
                <Pause size={14} />
                일시정지
              </button>
            ) : (
              <button onClick={handleStart} className="control-btn start-btn">
                <Play size={14} />
                {timerState.isPaused ? "재개" : "시작"}
              </button>
            )}

            <button onClick={handleStop} className="control-btn stop-btn">
              <Square size={14} />
              종료
            </button>

            <button
              onClick={handleOpenSessionModal}
              className="control-btn details-btn"
            >
              상세보기
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
