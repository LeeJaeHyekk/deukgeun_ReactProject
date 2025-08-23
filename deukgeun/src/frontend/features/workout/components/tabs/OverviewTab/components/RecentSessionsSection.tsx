import React from "react"
import { SessionCard } from "../../../../components/cards/SessionCard"
import type { DashboardData } from "../../../../../../shared/api/workoutJournalApi"

interface RecentSessionsSectionProps {
  dashboardData: DashboardData
  onSessionClick: (sessionId: number) => void
}

export const RecentSessionsSection: React.FC<RecentSessionsSectionProps> = ({
  dashboardData,
  onSessionClick,
}) => {
  return (
    <section className="recent-sessions-section">
      <h3>최근 운동 세션</h3>
      <div className="sessions-grid">
        {dashboardData.recentSessions?.slice(0, 3).map(session => (
          <SessionCard
            key={session.id}
            session={session}
            onClick={() => onSessionClick(session.id)}
            compact={true}
          />
        ))}
        {(!dashboardData.recentSessions ||
          dashboardData.recentSessions.length === 0) && (
          <div className="no-data-message">
            <p>아직 운동 세션이 없습니다</p>
          </div>
        )}
      </div>
    </section>
  )
}
