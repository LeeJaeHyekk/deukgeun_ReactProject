import React from "react"
import { ProgressChart } from "../../../../components/charts/ProgressChart"
import type { WorkoutSession } from "../../../../../../shared/api/workoutJournalApi"
import styles from "./ProgressCharts.module.css"

interface ProgressChartsProps {
  chartData: any[]
  sessions: WorkoutSession[]
  onViewSession: (sessionId: number) => void
  chartType: "monthly" | "yearly"
  comparisonMode?: boolean
  selectedMetrics?: string[]
}

export const ProgressCharts: React.FC<ProgressChartsProps> = ({
  chartData,
  sessions,
  onViewSession,
  chartType,
  comparisonMode = false,
  selectedMetrics = [],
}) => {
  console.log("ProgressCharts 렌더링:", {
    chartData,
    sessionsLength: sessions.length,
    chartType,
  })

  // 차트 데이터 변환
  const durationChartData = chartData.map(item => ({
    day: item.day,
    value: item.duration || 0,
  }))

  const sessionChartData = chartData.map(item => ({
    day: item.day,
    value: item.sessions || 0,
  }))

  const exerciseChartData = chartData.map(item => ({
    day: item.day,
    value: item.exercises || 0,
  }))

  console.log("변환된 차트 데이터:", {
    durationChartData,
    sessionChartData,
    exerciseChartData,
  })

  return (
    <div className={styles.progressCharts}>
      {/* 차트 섹션 */}
      <div className={styles.chartsSection}>
        <div className={styles.chartsGrid}>
          <div className={styles.chartContainer}>
            <div className={styles.chartHeader}>
              <h3>⏱️ 운동 시간 추이</h3>
              <p>{chartType === "monthly" ? "월간" : "연간"} 운동 시간 변화</p>
            </div>
            <div className={styles.chartBody}>
              <ProgressChart
                data={durationChartData}
                title="운동 시간 추이"
                unit="분"
                color="#f59e0b"
              />
            </div>
          </div>

          <div className={styles.chartContainer}>
            <div className={styles.chartHeader}>
              <h3>📊 세션 수 추이</h3>
              <p>{chartType === "monthly" ? "월간" : "연간"} 운동 세션 수</p>
            </div>
            <div className={styles.chartBody}>
              <ProgressChart
                data={sessionChartData}
                title="세션 수 추이"
                unit="개"
                color="#10b981"
              />
            </div>
          </div>

          <div className={styles.chartContainer}>
            <div className={styles.chartHeader}>
              <h3>💪 운동 세트 추이</h3>
              <p>{chartType === "monthly" ? "월간" : "연간"} 운동 세트 수</p>
            </div>
            <div className={styles.chartBody}>
              <ProgressChart
                data={exerciseChartData}
                title="운동 세트 추이"
                unit="개"
                color="#8b5cf6"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 최근 활동 섹션 */}
      <div className={styles.recentActivitySection}>
        <div className={styles.sectionHeader}>
          <h3>🔥 최근 활동</h3>
          <p>최근 10개 운동 세션</p>
        </div>
        <div className={styles.activityList}>
          {sessions.slice(0, 10).map(session => (
            <div key={session.id} className={styles.activityItem}>
              <div className={styles.activityDate}>
                {new Date(session.createdAt).toLocaleDateString()}
              </div>
              <div className={styles.activityDetails}>
                <span className={styles.activityName}>{session.name}</span>
                <span className={styles.activityDuration}>
                  {session.totalDurationMinutes || session.duration || 0}분
                </span>
                <span
                  className={`${styles.activityStatus} ${styles[`status${session.status}`]}`}
                >
                  {session.status === "completed"
                    ? "완료"
                    : session.status === "in_progress"
                      ? "진행 중"
                      : "일시정지"}
                </span>
              </div>
              <button
                className={styles.viewSessionBtn}
                onClick={() => onViewSession(session.id)}
              >
                보기
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
