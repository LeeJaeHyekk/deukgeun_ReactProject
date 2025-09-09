import React from "react"
import { WorkoutSessionCard } from "../cards/WorkoutSessionCard"
import { WorkoutSession } from "../../types"

interface WorkoutSessionsSectionProps {
  sessions: WorkoutSession[]
  onStartSession: (sessionId: number) => void
  onPauseSession: (sessionId: number) => void
  onCompleteSession: (sessionId: number, sessionData?: any) => void
  onDeleteSession: (sessionId: number) => void
}

export function WorkoutSessionsSection({
  sessions,
  onStartSession,
  onPauseSession,
  onCompleteSession,
  onDeleteSession,
}: WorkoutSessionsSectionProps) {
  return (
    <section className="workout-section" id="sessions">
      <div className="workout-section-header">
        <div>
          <h2 className="workout-section-title">운동 세션</h2>
          <p className="workout-section-description">
            사용자가 직접 추가할 수 없으며 이전에 등록된 운동 세션만 표시
          </p>
        </div>
      </div>

      <div className="card-list desktop-3 tablet-2 mobile-1">
        {sessions.map(session => (
          <WorkoutSessionCard
            key={session.id}
            session={session}
            onStart={() => onStartSession(session.id)}
            onPause={() => onPauseSession(session.id)}
            onComplete={() => onCompleteSession(session.id)}
            onDelete={() => onDeleteSession(session.id)}
          />
        ))}
      </div>
    </section>
  )
}
