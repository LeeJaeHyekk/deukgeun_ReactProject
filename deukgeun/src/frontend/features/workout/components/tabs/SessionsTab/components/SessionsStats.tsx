import React from "react"
import type { WorkoutSession } from "../../../../../../shared/api/workoutJournalApi"

interface SessionsStatsProps {
  sessions: WorkoutSession[]
}

export const SessionsStats: React.FC<SessionsStatsProps> = ({ sessions }) => {
  const totalSessions = sessions.length
  const completedSessions = sessions.filter(s => s.isCompleted).length
  const inProgressSessions = sessions.filter(s => !s.isCompleted).length
  const totalDuration = sessions
    .filter(s => s.duration)
    .reduce((total, s) => total + (s.duration || 0), 0)

  return (
    <div className="sessions-stats">
      <div className="stat-item">
        <span className="stat-label">총 세션</span>
        <span className="stat-value">{totalSessions}</span>
      </div>
      <div className="stat-item">
        <span className="stat-label">완료된 세션</span>
        <span className="stat-value">{completedSessions}</span>
      </div>
      <div className="stat-item">
        <span className="stat-label">진행 중</span>
        <span className="stat-value">{inProgressSessions}</span>
      </div>
      <div className="stat-item">
        <span className="stat-label">총 운동 시간</span>
        <span className="stat-value">{totalDuration.toFixed(0)}분</span>
      </div>
    </div>
  )
}
