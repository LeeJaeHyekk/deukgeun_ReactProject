import React from "react"
import { ProgressChart } from "../../../../components/charts/ProgressChart"
import { WorkoutCalendar } from "../../../../components/charts/WorkoutCalendar"
import type { WorkoutSession } from "../../../../../../shared/api/workoutJournalApi"

interface ProgressChartsProps {
  chartData: any[]
  sessions: WorkoutSession[]
  onViewSession: (sessionId: number) => void
}

export const ProgressCharts: React.FC<ProgressChartsProps> = ({
  chartData,
  sessions,
  onViewSession,
}) => {
  return (
    <>
      {/* 차트 섹션 */}
      <section className="charts-section">
        <div className="charts-grid">
          <div className="chart-container">
            <h3>운동 시간 추이</h3>
            <ProgressChart data={chartData} title="운동 시간 추이" unit="분" />
          </div>
          <div className="chart-container">
            <h3>세션 수 추이</h3>
            <ProgressChart data={chartData} title="세션 수 추이" unit="개" />
          </div>
        </div>
      </section>

      {/* 캘린더 섹션 */}
      <section className="calendar-section">
        <h3>운동 캘린더</h3>
        <WorkoutCalendar sessions={sessions} />
      </section>

      {/* 최근 활동 섹션 */}
      <section className="recent-activity-section">
        <h3>최근 활동</h3>
        <div className="activity-list">
          {sessions.slice(0, 10).map(session => (
            <div key={session.id} className="activity-item">
              <div className="activity-date">
                {new Date(session.createdAt).toLocaleDateString()}
              </div>
              <div className="activity-details">
                <span className="activity-name">{session.name}</span>
                <span className="activity-duration">{session.duration}분</span>
                <span className={`activity-status status-${session.status}`}>
                  {session.status === "completed"
                    ? "완료"
                    : session.status === "in_progress"
                      ? "진행 중"
                      : "일시정지"}
                </span>
              </div>
              <button
                className="view-session-btn"
                onClick={() => onViewSession(session.id)}
              >
                보기
              </button>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
