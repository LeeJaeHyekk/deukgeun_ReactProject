import React from "react"
import type { DashboardData } from "../../../../types"
import styles from "./RecentSessionsSection.module.css"

interface RecentSessionsSectionProps {
  dashboardData: DashboardData
  onSessionClick: (sessionId: number) => void
}

export const RecentSessionsSection: React.FC<RecentSessionsSectionProps> = ({
  dashboardData,
  onSessionClick,
}) => {
  const recentSessions = dashboardData.recentSessions?.slice(0, 3) || []

  return (
    <section
      className={styles.recentSessionsSection}
      style={{
        background: "rgba(255, 255, 255, 0.1)",
        borderRadius: "16px",
        padding: "24px",
        border: "1px solid rgba(255, 255, 255, 0.2)",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
        backdropFilter: "blur(15px)",
        height: "100%",
        minHeight: "300px",
      }}
    >
      <h3>⏱️ 최근 세션</h3>
      <div className={styles.sessionsList}>
        {recentSessions.length > 0 ? (
          recentSessions.map((session: any) => (
            <div
              key={session.id}
              className={styles.sessionItem}
              onClick={() => onSessionClick(session.id)}
            >
              <div className={styles.sessionInfo}>
                <h4>{session.name || `세션 ${session.id}`}</h4>
                <p>{session.duration || 0}분 • 운동 완료</p>
              </div>
              <div className={styles.sessionDate}>
                {new Date(session.date).toLocaleDateString()}
              </div>
            </div>
          ))
        ) : (
          <div className={styles.noDataMessage}>
            <p>아직 운동 세션이 없습니다</p>
          </div>
        )}
      </div>
    </section>
  )
}
