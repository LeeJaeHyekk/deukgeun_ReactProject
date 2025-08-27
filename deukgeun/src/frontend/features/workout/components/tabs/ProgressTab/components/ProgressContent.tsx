import React from "react"
import { ProgressStats } from "./ProgressStats"
import { ProgressCharts } from "./ProgressCharts"
import type { WorkoutSession } from "../../../../../../shared/api/workoutJournalApi"
import styles from "./ProgressContent.module.css"

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
  comparisonMode?: boolean
  selectedMetrics?: string[]
}

export const ProgressContent: React.FC<ProgressContentProps> = ({
  sessions,
  chartData,
  stats,
  onViewSession,
  comparisonMode = false,
  selectedMetrics = [],
}) => {
  if (sessions.length === 0) {
    return (
      <div className={styles.progressContent}>
        <div className={styles.noProgressContainer}>
          <div className={styles.noProgressIcon}>📊</div>
          <h3>아직 운동 기록이 없습니다</h3>
          <p>운동을 시작하면 여기에 진행 상황이 표시됩니다!</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.progressContent}>
      {/* 통계 섹션 */}
      <div className={styles.statsSection}>
        <div className={styles.sectionHeader}>
          <h3>📈 전체 통계</h3>
          <p>운동 진행 상황 요약</p>
        </div>
        <ProgressStats stats={stats} />
      </div>

      {/* 차트 섹션 */}
      <div className={styles.chartsSection}>
        <div className={styles.sectionHeader}>
          <h3>📊 진행 차트</h3>
          <p>시간별 운동 진행 상황</p>
        </div>
        <ProgressCharts
          chartData={chartData}
          sessions={sessions}
          onViewSession={onViewSession}
          comparisonMode={comparisonMode}
          selectedMetrics={selectedMetrics}
        />
      </div>
    </div>
  )
}
