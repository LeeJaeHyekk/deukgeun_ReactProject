import React from "react"
import { SessionCard } from "../../../../components/cards/SessionCard"
import { useWorkoutTimer } from "@shared/contexts/WorkoutTimerContext"
import type { WorkoutSession } from "@shared/api/workoutJournalApi"

interface SessionsContentProps {
  sessions: WorkoutSession[]
  activeSession?: WorkoutSession
  onCreateSession: () => void
  onViewSession: (sessionId: number) => void
  onEditSession: (sessionId: number) => void
  onDeleteSession: (sessionId: number) => void
}

export const SessionsContent: React.FC<SessionsContentProps> = ({
  sessions,
  activeSession,
  onCreateSession,
  onViewSession,
  onEditSession,
  onDeleteSession,
}) => {
  const { startTimer, pauseTimer, stopTimer } = useWorkoutTimer()

  if (sessions.length === 0) {
    return (
      <div className="sessions-content">
        <div className="no-sessions-container">
          <div className="no-sessions-icon">🏋️‍♂️</div>
          <h3>아직 운동 세션이 없습니다</h3>
          <p>첫 번째 운동 세션을 시작해보세요!</p>
          <button
            className="create-first-session-btn"
            onClick={onCreateSession}
          >
            첫 세션 시작하기
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="sessions-content">
      <div className="sessions-filters">
        <button className="filter-btn active">전체</button>
        <button className="filter-btn">완료</button>
        <button className="filter-btn">진행 중</button>
        <button className="filter-btn">일시정지</button>
      </div>

      <div className="sessions-grid">
        {sessions
          .filter(session => !activeSession || session.id !== activeSession.id)
          .map(session => (
            <SessionCard
              key={session.id}
              session={session}
              onView={() => onViewSession(session.id)}
              onEdit={() => onEditSession(session.id)}
              onDelete={() => onDeleteSession(session.id)}
              onStart={() => {
                startTimer(session.id.toString())
                console.log("세션 시작:", session.id)
              }}
              onPause={() => {
                pauseTimer()
                console.log("세션 일시정지")
              }}
              onComplete={() => {
                stopTimer()
                console.log("세션 완료")
              }}
            />
          ))}
      </div>
    </div>
  )
}
