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
} from "lucide-react"
import type { WorkoutSession } from "../../../shared/api/workoutJournalApi"
import "./SessionCard.css"

interface SessionCardProps {
  session: WorkoutSession
  onEdit: () => void
  onDelete: () => void
  onStart?: () => void
  onPause?: () => void
  onComplete?: () => void
}

export function SessionCard({
  session,
  onEdit,
  onDelete,
  onStart,
  onPause,
  onComplete,
}: SessionCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedSession, setEditedSession] = useState(session)

  // 운동 진행률 계산
  const calculateProgress = () => {
    const exercises = (session as any).exercises || []
    if (exercises.length === 0) return { completed: 0, total: 0, percent: 0 }

    let completedSets = 0
    let totalSets = 0

    exercises.forEach((exercise: any) => {
      const completedExerciseSets = exercise.completedSets?.length || 0
      const totalExerciseSets = exercise.sets || 0
      completedSets += completedExerciseSets
      totalSets += totalExerciseSets
    })

    const percent =
      totalSets > 0 ? Math.floor((completedSets / totalSets) * 100) : 0
    return { completed: completedSets, total: totalSets, percent }
  }

  const progress = calculateProgress()
  const isCompleted = session.isCompleted || progress.percent === 100
  const isInProgress = !isCompleted && progress.percent > 0
  const isPaused = !isCompleted && !isInProgress && session.startTime

  // 세션 상태에 따른 클래스명
  const getStatusClass = () => {
    if (isCompleted) return "completed"
    if (isInProgress) return "in-progress"
    if (isPaused) return "paused"
    return "not-started"
  }

  // 시간 포맷팅
  const formatDuration = (minutes?: number) => {
    if (!minutes) return "0분"
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}시간 ${mins}분` : `${mins}분`
  }

  // 날짜 포맷팅
  const formatDate = (date?: Date | string) => {
    if (!date) return ""
    const d = new Date(date)
    return d.toLocaleDateString("ko-KR", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // 인라인 편집 핸들러
  const handleInlineEdit = (field: string, value: string) => {
    setEditedSession(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSaveEdit = () => {
    // 여기서 실제 저장 로직을 호출할 수 있습니다
    setIsEditing(false)
    onEdit()
  }

  const handleCancelEdit = () => {
    setEditedSession(session)
    setIsEditing(false)
  }

  return (
    <div className={`session-card ${getStatusClass()}`}>
      {/* 카드 헤더 */}
      <div className="session-card-header">
        <div className="session-title-section">
          {isEditing ? (
            <input
              type="text"
              value={editedSession.name || ""}
              onChange={e => handleInlineEdit("name", e.target.value)}
              className="session-title-input"
              placeholder="세션 이름"
            />
          ) : (
            <h3 className="session-title">
              {session.name || session.session_name || "새 세션"}
            </h3>
          )}
          <div className="session-status-badge">
            {isCompleted && <Check size={14} />}
            <span>
              {isCompleted
                ? "완료"
                : isInProgress
                  ? "진행중"
                  : isPaused
                    ? "일시정지"
                    : "시작전"}
            </span>
          </div>
        </div>

        <div className="session-actions">
          {isEditing ? (
            <>
              <button onClick={handleSaveEdit} className="action-btn save-btn">
                <Check size={16} />
              </button>
              <button
                onClick={handleCancelEdit}
                className="action-btn cancel-btn"
              >
                <Square size={16} />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="action-btn edit-btn"
              >
                <Edit size={16} />
              </button>
              <button onClick={onDelete} className="action-btn delete-btn">
                <Trash2 size={16} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* 진행률 표시 */}
      <div className="session-progress">
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${progress.percent}%` }}
          />
        </div>
        <div className="progress-text">
          <span>
            {progress.completed}/{progress.total} 세트 완료
          </span>
          <span className="progress-percent">{progress.percent}%</span>
        </div>
      </div>

      {/* 세션 정보 */}
      <div className="session-info">
        <div className="info-row">
          <div className="info-item">
            <Clock size={14} />
            <span>시작: {formatDate(session.startTime)}</span>
          </div>
          {session.duration && (
            <div className="info-item">
              <Target size={14} />
              <span>시간: {formatDuration(session.duration)}</span>
            </div>
          )}
        </div>

        {session.caloriesBurned && (
          <div className="info-item">
            <span>🔥 {session.caloriesBurned} kcal</span>
          </div>
        )}
      </div>

      {/* 운동 목록 (축약형) */}
      {(session as any).exercises && (session as any).exercises.length > 0 && (
        <div className="session-exercises">
          <div className="exercises-header">
            <span>운동 목록</span>
            <span className="exercise-count">
              {(session as any).exercises.length}개
            </span>
          </div>
          <div className="exercises-preview">
            {(session as any).exercises
              .slice(0, 3)
              .map((exercise: any, index: number) => (
                <div key={index} className="exercise-preview-item">
                  <div className="exercise-name">
                    {exercise.exerciseName ||
                      exercise.name ||
                      "알 수 없는 운동"}
                  </div>
                  <div className="exercise-sets">
                    {exercise.completedSets?.length || 0}/{exercise.sets || 0}{" "}
                    세트
                  </div>
                  <div className="set-progress-dots">
                    {Array.from({ length: exercise.sets || 0 }, (_, i) => (
                      <span
                        key={i}
                        className={`set-dot ${i < (exercise.completedSets?.length || 0) ? "completed" : ""}`}
                      >
                        ●
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            {(session as any).exercises.length > 3 && (
              <div className="more-exercises">
                +{(session as any).exercises.length - 3}개 더
              </div>
            )}
          </div>
        </div>
      )}

      {/* 세션 메모 */}
      {session.notes && (
        <div className="session-notes">
          <span className="notes-label">메모:</span>
          <span className="notes-text">{session.notes}</span>
        </div>
      )}

      {/* 하단 고정 액션 버튼 */}
      <div className="session-card-footer">
        {!isCompleted && (
          <div className="session-controls">
            {isInProgress ? (
              <button onClick={onPause} className="control-btn pause-btn">
                <Pause size={16} />
                일시정지
              </button>
            ) : (
              <button onClick={onStart} className="control-btn start-btn">
                <Play size={16} />
                {isPaused ? "재개" : "시작"}
              </button>
            )}
            <button onClick={onComplete} className="control-btn complete-btn">
              <Check size={16} />
              완료
            </button>
          </div>
        )}
      </div>

      {/* 원형 타이머 (진행 중일 때만 표시) */}
      {isInProgress && (
        <div className="circular-timer">
          <svg className="timer-svg" viewBox="0 0 60 60">
            <circle
              className="timer-background"
              cx="30"
              cy="30"
              r="25"
              strokeWidth="4"
            />
            <circle
              className="timer-progress"
              cx="30"
              cy="30"
              r="25"
              strokeWidth="4"
              strokeDasharray={`${2 * Math.PI * 25}`}
              strokeDashoffset={`${2 * Math.PI * 25 * (1 - progress.percent / 100)}`}
              transform="rotate(-90 30 30)"
            />
          </svg>
          <div className="timer-text">{progress.percent}%</div>
        </div>
      )}
    </div>
  )
}
