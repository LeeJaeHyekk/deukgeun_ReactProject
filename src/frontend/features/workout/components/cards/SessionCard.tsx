import React, { useState } from "react"
import {
  Check,
  Edit,
  Trash2,
  Clock,
  Target,
  Play,
  Pause,
  Square,
  User,
  Timer,
} from "lucide-react"
import type { WorkoutSession } from "../../../../../shared/types"
import type { WorkoutSessionCardProps as SessionCardProps } from "../../types"
import "./SessionCard.css"

export function SessionCard({
  session,
  isActive = false,
  onView,
  onEdit,
  onDelete,
  onStart,
  onPause,
  onComplete,
  onClick,
  compact = false,
}: SessionCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedSession, setEditedSession] = useState(session)

  // 로깅 유틸리티
  const logger = {
    info: (message: string, data?: any) => {
      console.log(`[SessionCard] ${message}`, data || "")
    },
    debug: (message: string, data?: any) => {
      console.debug(`[SessionCard] ${message}`, data || "")
    },
    warn: (message: string, data?: any) => {
      console.warn(`[SessionCard] ${message}`, data || "")
    },
    error: (message: string, data?: any) => {
      console.error(`[SessionCard] ${message}`, data || "")
    },
  }

  logger.debug("SessionCard rendered", {
    sessionId: session.id,
    sessionName: session.name,
    isActive,
    status: session.status,
  })

  // 운동 진행률 계산
  const calculateProgress = () => {
    const exercises = (session as any).exercises || []
    if (exercises.length === 0) return { completed: 0, total: 0, percentage: 0 }

    const total = exercises.length
    const completed = exercises.filter((ex: any) => ex.isCompleted).length
    const percentage = Math.round((completed / total) * 100)

    logger.debug("Progress calculated", { completed, total, percentage })
    return { completed, total, percentage }
  }

  const { completed, total, percentage } = calculateProgress()

  // 세션 상태 확인
  const isInProgress = isActive && session.status === "in_progress"
  const isPaused = isActive && session.status === "paused"
  const isCompleted = session.status === "completed"

  // 사용자 정보 추출
  const userName =
    (session as any).userName || (session as any).user?.name || "사용자"

  // 이벤트 핸들러들
  const handleCardClick = (e: React.MouseEvent) => {
    e.preventDefault()
    logger.info("Card clicked", { sessionId: session.id })
    if (onClick) {
      onClick(session)
    } else {
      onView?.(session)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      if (onClick) {
        logger.info("Card key pressed - onClick handler", {
          sessionId: session.id,
          key: e.key,
        })
        onClick(session)
      } else {
        logger.info("Card key pressed - onView handler", {
          sessionId: session.id,
          key: e.key,
        })
        onView?.(session)
      }
    }
  }

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    logger.info("Edit button clicked", { sessionId: session.id })
    onEdit?.(session)
  }

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    logger.info("Delete button clicked", { sessionId: session.id })
    onDelete?.(session.id)
  }

  const handleStartClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    logger.info("Start button clicked", { sessionId: session.id })
    onStart?.(session)
  }

  const handlePauseClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    logger.info("Pause button clicked", { sessionId: session.id })
    onPause?.(session)
  }

  const handleCompleteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    logger.info("Complete button clicked", { sessionId: session.id })
    onComplete?.(session)
  }

  const formatDuration = (minutes?: number) => {
    if (!minutes) return "0분"
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}시간 ${mins}분` : `${mins}분`
  }

  const formatDate = (date: Date | string) => {
    const d = new Date(date)
    return d.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div
      className={`session-card ${isActive ? "active" : ""} ${isCompleted ? "completed" : ""} ${compact ? "compact" : ""}`}
      onClick={handleCardClick}
      onKeyDown={handleKeyPress}
      tabIndex={0}
      role="button"
      aria-label={`세션: ${session.name}`}
    >
      {/* Timer Header Integration */}
      {isActive && (
        <div className="timer-header">
          <span className="timer-label">
            <Clock size={16} />
            운동 시간
          </span>
          <button
            className="timer-toggle-btn"
            onClick={e => {
              e.stopPropagation()
              if (isInProgress) {
                handlePauseClick(e)
              } else {
                handleStartClick(e)
              }
            }}
            aria-label={isInProgress ? "일시정지" : "시작"}
          >
            {isInProgress ? <Pause size={14} /> : <Play size={14} />}
          </button>
        </div>
      )}

      {/* User Information Section */}
      <div className="session-user-info">
        <div className="user-info-row">
          <div className="user-info-item">
            <User size={16} />
            {userName}
          </div>
          {isInProgress && (
            <div className="timer-status">
              <Timer size={16} />
              타이머 진행 중
            </div>
          )}
        </div>
      </div>

      {/* Session Content */}
      <div className="session-content">
        <div className="session-header">
          <h3 className="session-name">{session.name || "무제 세션"}</h3>
          <div className="session-status">
            {isCompleted && <Check size={16} className="completed-icon" />}
          </div>
        </div>

        <div className="session-details">
          <div className="session-info">
            <div className="info-item">
              <Clock size={14} />
              <span>시작: {formatDate(session.startTime)}</span>
            </div>
            {session.endTime && (
              <div className="info-item">
                <Target size={14} />
                <span>완료: {formatDate(session.endTime)}</span>
              </div>
            )}
            {session.totalDurationMinutes && (
              <div className="info-item">
                <Timer size={14} />
                <span>소요시간: {session.totalDurationMinutes}분</span>
              </div>
            )}
          </div>

          {/* Progress Display */}
          {total > 0 && (
            <div className="session-progress">
              <div className="progress-info">
                <span>
                  진행률: {completed}/{total} 운동
                </span>
                <span>{percentage}%</span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          )}

          {session.notes && (
            <div className="session-notes">
              <p>{session.notes}</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="session-actions">
          {isEditing ? (
            <div className="edit-actions">
              <button onClick={handleEditClick} className="action-btn save-btn">
                <Check size={16} />
                저장
              </button>
              <button
                onClick={() => {
                  logger.info("Cancel edit", { sessionId: session.id })
                  setIsEditing(false)
                }}
                className="action-btn cancel-btn"
              >
                취소
              </button>
            </div>
          ) : (
            <>
              <button onClick={handleEditClick} className="action-btn edit-btn">
                <Edit size={16} />
              </button>
              <button
                onClick={handleDeleteClick}
                className="action-btn delete-btn"
              >
                <Trash2 size={16} />
              </button>
            </>
          )}
        </div>

        {/* Session Controls */}
        <div className="session-controls">
          {isInProgress ? (
            <button
              onClick={handlePauseClick}
              className="control-btn pause-btn"
            >
              <Pause size={16} />
              일시정지
            </button>
          ) : (
            <button
              onClick={handleStartClick}
              className="control-btn start-btn"
            >
              <Play size={16} />
              {isPaused ? "재개" : "시작"}
            </button>
          )}
          <button
            onClick={handleCompleteClick}
            className="control-btn complete-btn"
          >
            <Check size={16} />
            완료
          </button>
        </div>
      </div>

      {/* Progress Indicator (우측 하단) */}
      {total > 0 && (
        <div className="progress-indicator">
          <svg className="progress-circle" viewBox="0 0 40 40">
            <circle
              className="progress-circle-bg"
              cx="20"
              cy="20"
              r="18"
              strokeWidth="3"
            />
            <circle
              className="progress-circle-fill"
              cx="20"
              cy="20"
              r="18"
              strokeWidth="3"
              strokeDasharray={`${2 * Math.PI * 18}`}
              strokeDashoffset={`${2 * Math.PI * 18 * (1 - percentage / 100)}`}
              transform="rotate(-90 20 20)"
            />
          </svg>
          <span className="progress-circle-text">{percentage}%</span>
        </div>
      )}
    </div>
  )
}
