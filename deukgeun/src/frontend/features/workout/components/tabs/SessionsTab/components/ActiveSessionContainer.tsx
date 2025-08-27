import React from "react"
import { Clock, Play, Pause, Check, Edit, Trash2 } from "lucide-react"
import { useWorkoutTimer } from "@shared/contexts/WorkoutTimerContext"
import type { WorkoutSessionDTO } from "../../../../types"
import "./ActiveSessionContainer.css"

interface ActiveSessionContainerProps {
  activeSession: WorkoutSessionDTO
  onViewSession: (sessionId: number) => void
  onEditSession: (sessionId: number) => void
  onDeleteSession: (sessionId: number) => void
}

export const ActiveSessionContainer: React.FC<ActiveSessionContainerProps> = ({
  activeSession,
  onViewSession,
  onEditSession,
  onDeleteSession,
}) => {
  const { startTimer, pauseTimer, stopTimer } = useWorkoutTimer()

  const isInProgress = activeSession.status === "in_progress"
  const isPaused = activeSession.status === "paused"

  const formatDuration = (minutes?: number) => {
    if (!minutes) return "0분"
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}시간 ${mins}분` : `${mins}분`
  }

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return "미정"
    const d = new Date(date)
    return d.toLocaleDateString("ko-KR", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const handleStart = () => {
    startTimer(activeSession.id.toString())
  }

  const handlePause = () => {
    pauseTimer()
  }

  const handleComplete = () => {
    stopTimer()
    // 세션 완료 로직 추가
  }

  return (
    <div className="active-session-container">
      <div className="active-session-header">
        <div className="header-content">
          <div className="session-title">
            <Clock size={20} />
            <h3>{activeSession.name}</h3>
            <span className="status-badge active">진행중</span>
          </div>
          <div className="session-meta">
            <span>시작: {formatDate(activeSession.startTime)}</span>
            {activeSession.totalDurationMinutes && (
              <span>
                소요시간: {formatDuration(activeSession.totalDurationMinutes)}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="active-session-content">
        <div className="session-info">
          <div className="info-grid">
            <div className="info-item">
              <span className="label">상태</span>
              <span className="value">
                {isInProgress ? "운동 중" : isPaused ? "일시정지" : "준비"}
              </span>
            </div>
            <div className="info-item">
              <span className="label">운동 세트</span>
              <span className="value">
                {activeSession.exerciseSets?.length || 0}개
              </span>
            </div>
            {activeSession.notes && (
              <div className="info-item full-width">
                <span className="label">메모</span>
                <span className="value notes">{activeSession.notes}</span>
              </div>
            )}
          </div>
        </div>

        <div className="session-actions">
          <div className="primary-actions">
            {isInProgress ? (
              <button className="action-btn pause-btn" onClick={handlePause}>
                <Pause size={16} />
                일시정지
              </button>
            ) : (
              <button className="action-btn start-btn" onClick={handleStart}>
                <Play size={16} />
                {isPaused ? "재개" : "시작"}
              </button>
            )}
            <button
              className="action-btn complete-btn"
              onClick={handleComplete}
            >
              <Check size={16} />
              완료
            </button>
          </div>

          <div className="secondary-actions">
            <button
              className="action-btn view-btn"
              onClick={() => onViewSession(activeSession.id)}
            >
              상세보기
            </button>
            <button
              className="action-btn edit-btn"
              onClick={() => onEditSession(activeSession.id)}
            >
              <Edit size={14} />
            </button>
            <button
              className="action-btn delete-btn"
              onClick={() => onDeleteSession(activeSession.id)}
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
