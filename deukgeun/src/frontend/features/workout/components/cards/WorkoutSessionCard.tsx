import React, { useState } from "react"
import { WorkoutSessionDTO } from "../../types"
import { ProgressBar } from "../ui/ProgressBar"
import { Button } from "../ui/Button"

interface WorkoutSessionCardProps {
  session: WorkoutSessionDTO
  onStart: () => void
  onPause: () => void
  onComplete: () => void
  onDelete: () => void
}

export function WorkoutSessionCard({
  session,
  onStart,
  onPause,
  onComplete,
  onDelete,
}: WorkoutSessionCardProps) {
  const [showDetails, setShowDetails] = useState(false)

  const completedSets = session.exerciseSets.filter(
    set => set.isCompleted
  ).length
  const totalSets = session.exerciseSets.length
  const isCompleted = session.status === "completed"
  const isInProgress = session.status === "in_progress"
  const isPaused = session.status === "paused"

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}시간 ${mins}분` : `${mins}분`
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString("ko-KR", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getMoodEmoji = (rating: number) => {
    if (rating >= 8) return "😊"
    if (rating >= 6) return "🙂"
    if (rating >= 4) return "😐"
    return "😞"
  }

  const getEnergyEmoji = (level: number) => {
    if (level >= 8) return "⚡⚡⚡"
    if (level >= 6) return "⚡⚡"
    if (level >= 4) return "⚡"
    return "🔋"
  }

  return (
    <div className={`workout-session-card ${isCompleted ? "completed" : ""}`}>
      <div className="card-header">
        <div className="card-title">
          <h3>{session.name}</h3>
          <span className={`status-badge status-${session.status}`}>
            {session.status === "completed" && "완료"}
            {session.status === "in_progress" && "진행중"}
            {session.status === "paused" && "일시정지"}
            {session.status === "cancelled" && "취소"}
          </span>
        </div>
        <div className="card-actions">
          {!isCompleted && (
            <>
              {isInProgress ? (
                <Button onClick={onPause} size="small" variant="secondary">
                  일시정지
                </Button>
              ) : (
                <Button onClick={onStart} size="small" variant="primary">
                  시작
                </Button>
              )}
              <Button onClick={onComplete} size="small" variant="primary">
                완료
              </Button>
            </>
          )}
          <Button onClick={onDelete} size="small" variant="danger">
            삭제
          </Button>
        </div>
      </div>

      <div className="card-content">
        <div className="session-summary">
          <div className="summary-item">
            <span className="summary-label">총 세트:</span>
            <span className="summary-value">{totalSets}세트</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">완료 세트:</span>
            <span className="summary-value">{completedSets}세트</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">소요 시간:</span>
            <span className="summary-value">
              {formatDuration(session.totalDurationMinutes)}
            </span>
          </div>
        </div>

        <div className="session-progress">
          <ProgressBar
            currentValue={completedSets}
            targetValue={totalSets}
            unit="세트"
          />
        </div>

        {session.moodRating && (
          <div className="session-metrics">
            <div className="metric-item">
              <span className="metric-label">기분:</span>
              <span className="metric-value">
                {getMoodEmoji(session.moodRating)} {session.moodRating}/10
              </span>
            </div>
            {session.energyLevel && (
              <div className="metric-item">
                <span className="metric-label">에너지:</span>
                <span className="metric-value">
                  {getEnergyEmoji(session.energyLevel)} {session.energyLevel}/10
                </span>
              </div>
            )}
          </div>
        )}

        <div className="session-timing">
          {session.startTime && (
            <div className="timing-item">
              <span className="timing-label">시작:</span>
              <span className="timing-value">
                {formatDateTime(session.startTime)}
              </span>
            </div>
          )}
          {session.endTime && (
            <div className="timing-item">
              <span className="timing-label">종료:</span>
              <span className="timing-value">
                {formatDateTime(session.endTime)}
              </span>
            </div>
          )}
        </div>

        <div className="session-stats">
          {session.caloriesBurned && (
            <div className="stat-item">
              <span className="stat-label">소모 칼로리:</span>
              <span className="stat-value">{session.caloriesBurned}kcal</span>
            </div>
          )}
          {session.totalWeight && (
            <div className="stat-item">
              <span className="stat-label">총 무게:</span>
              <span className="stat-value">{session.totalWeight}kg</span>
            </div>
          )}
          {session.totalReps && (
            <div className="stat-item">
              <span className="stat-label">총 횟수:</span>
              <span className="stat-value">{session.totalReps}회</span>
            </div>
          )}
        </div>

        <div className="exercise-summary">
          <div className="summary-header">
            <h4>운동 요약</h4>
            <Button
              onClick={() => setShowDetails(!showDetails)}
              size="small"
              variant="secondary"
            >
              {showDetails ? "접기" : "자세히"}
            </Button>
          </div>

          {showDetails ? (
            <div className="exercise-list-detailed">
              {session.exerciseSets.map((set, index) => (
                <div key={index} className="exercise-item-detailed">
                  <div className="exercise-header">
                    <span className="exercise-name">{set.exerciseName}</span>
                    <span className="set-number">세트 {set.setNumber}</span>
                  </div>
                  <div className="exercise-details">
                    <span className="detail-item">
                      {set.repsCompleted}회
                      {set.weightKg && ` × ${set.weightKg}kg`}
                    </span>
                    {set.rpeRating && (
                      <span className="detail-item">RPE: {set.rpeRating}</span>
                    )}
                    {set.isPersonalBest && (
                      <span className="personal-best-badge">🏆 PB</span>
                    )}
                  </div>
                  {set.notes && (
                    <div className="exercise-notes">
                      <span className="notes-text">{set.notes}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="exercise-list">
              {session.exerciseSets.slice(0, 3).map((set, index) => (
                <div key={index} className="exercise-item">
                  <span className="exercise-name">{set.exerciseName}</span>
                  <span className="exercise-sets">
                    {set.repsCompleted}회{" "}
                    {set.weightKg ? `× ${set.weightKg}kg` : ""}
                  </span>
                </div>
              ))}
              {session.exerciseSets.length > 3 && (
                <div className="more-exercises">
                  +{session.exerciseSets.length - 3}개 더
                </div>
              )}
            </div>
          )}
        </div>

        {session.notes && (
          <div className="session-notes">
            <h4>메모</h4>
            <p className="notes-text">{session.notes}</p>
          </div>
        )}
      </div>
    </div>
  )
}
