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
  console.log("🏋️ [SessionsTab] 컴포넌트 렌더링", {
    sessionsCount: sessions.length,
    isLoading,
    sessions: sessions.map(s => ({ id: s.id, name: s.name, status: s.status })),
  })

  const { activeSession } = useWorkoutSessions()
  const { handleDeleteSession } = useSessionsActions(onDeleteSession)

  console.log("📊 [SessionsTab] 활성 세션:", activeSession)

  if (isLoading) {
    console.log("⏳ [SessionsTab] 로딩 중...")
    return (
      <div className="sessions-tab">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>세션을 불러오는 중...</p>
        </div>
      </div>
    )
  }

  console.log("✅ [SessionsTab] 렌더링 완료")

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
