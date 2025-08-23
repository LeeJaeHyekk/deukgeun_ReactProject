import React from "react"
import { ProgressStats } from "./ProgressStats"
import { ProgressCharts } from "./ProgressCharts"
import type { WorkoutSession } from "../../../../../../shared/api/workoutJournalApi"

interface ProgressContentProps {
  sessions: WorkoutSession[]
  chartData: any[]
  stats: {
    totalSessions: number
    totalDuration: number
    totalExercises: number
    averageDuration: number
    completionRate: number
  }
  onViewSession: (sessionId: number) => void
}

export const ProgressContent: React.FC<ProgressContentProps> = ({
  sessions,
  chartData,
  stats,
  onViewSession,
}) => {
  if (sessions.length === 0) {
    return (
      <div className="progress-content">
        <div className="no-progress-container">
          <div className="no-progress-icon">📊</div>
          <h3>아직 운동 기록이 없습니다</h3>
          <p>운동을 시작하면 여기에 진행 상황이 표시됩니다!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="progress-content">
      <ProgressStats stats={stats} />
      <ProgressCharts
        chartData={chartData}
        sessions={sessions}
        onViewSession={onViewSession}
      />
    </div>
  )
}
