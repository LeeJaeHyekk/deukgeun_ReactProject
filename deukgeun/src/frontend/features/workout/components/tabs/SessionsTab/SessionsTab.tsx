import React from "react"
import { GlobalWorkoutTimer } from "../../../components/timer/GlobalWorkoutTimer"
import { useWorkoutSessions } from "../../../hooks/useWorkoutSessions"
import { SessionsHeader } from "./components/SessionsHeader"
import { ActiveSessionContainer } from "./components/ActiveSessionContainer"
import { SessionsContent } from "./components/SessionsContent"
import { SessionsStats } from "./components/SessionsStats"
import { useSessionsActions } from "./hooks/useSessionsActions"
import type { WorkoutSession } from "@shared/api/workoutJournalApi"

interface SessionsTabProps {
  sessions: WorkoutSession[]
  isLoading: boolean
  onCreateSession: () => void
  onEditSession: (sessionId: number) => void
  onViewSession: (sessionId: number) => void
  onDeleteSession: (sessionId: number) => void
}

export function SessionsTab({
  sessions,
  isLoading,
  onCreateSession,
  onEditSession,
  onViewSession,
  onDeleteSession,
}: SessionsTabProps) {
  const { activeSession } = useWorkoutSessions()
  const { handleDeleteSession } = useSessionsActions(onDeleteSession)

  if (isLoading) {
    return (
      <div className="sessions-tab">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>세션을 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="sessions-tab">
      <SessionsHeader onCreateSession={onCreateSession} />

      {activeSession && (
        <ActiveSessionContainer
          activeSession={activeSession}
          onViewSession={onViewSession}
          onEditSession={onEditSession}
          onDeleteSession={handleDeleteSession}
        />
      )}

      <SessionsContent
        sessions={sessions}
        activeSession={activeSession}
        onCreateSession={onCreateSession}
        onViewSession={onViewSession}
        onEditSession={onEditSession}
        onDeleteSession={handleDeleteSession}
      />

      {sessions.length > 0 && <SessionsStats sessions={sessions} />}

      <GlobalWorkoutTimer />
    </div>
  )
}
