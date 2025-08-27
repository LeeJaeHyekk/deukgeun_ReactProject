import React from "react"
import { useSharedState } from "../../../hooks/useWorkoutStore"
import { ProgressStats } from "./components/ProgressStats"
import { ProgressCharts } from "./components/ProgressCharts"
import { useProgressData } from "./hooks/useProgressData"
import type { WorkoutSession } from "../../../../../shared/api/workoutJournalApi"
import styles from "./ProgressTab.module.css"

interface ProgressTabProps {
  sessions: WorkoutSession[]
  onViewSession: (sessionId: number) => void
  isLoading?: boolean
}

export function ProgressTab({
  sessions,
  onViewSession,
  isLoading = false,
}: ProgressTabProps) {
  // 공유 상태 훅
  const { sharedState } = useSharedState()

  // 차트 데이터 및 통계 계산
  const { chartData, stats } = useProgressData(sessions)

  // 차트 유형 상태 (월/년)
  const [chartType, setChartType] = React.useState<"monthly" | "yearly">(
    "monthly"
  )

  if (isLoading) {
    return (
      <div className={styles.progressTab}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>진행 상황을 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (sessions.length === 0) {
    return (
      <div className={styles.progressTab}>
        <div className={styles.noProgressContainer}>
          <div className={styles.noProgressIcon}>📊</div>
          <h3>아직 운동 기록이 없습니다</h3>
          <p>운동을 시작하면 여기에 진행 상황이 표시됩니다!</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.progressTab}>
      {/* 헤더 섹션 */}
      <div className={styles.progressHeader}>
        <div className={styles.headerContent}>
          <h1>📊 진행 상황</h1>
          <p>운동 진행 상황과 통계를 확인하세요</p>
        </div>
      </div>

      {/* 전체 통계 섹션 */}
      <div className={styles.statsSection}>
        <div className={styles.sectionHeader}>
          <h2>📈 전체 통계</h2>
          <p>전체 운동 진행 상황 요약</p>
        </div>
        <ProgressStats stats={stats} />
      </div>

      {/* 차트 유형 선택 */}
      <div className={styles.chartTypeSection}>
        <div className={styles.chartTypeSelector}>
          <button
            className={`${styles.chartTypeButton} ${
              chartType === "monthly" ? styles.active : ""
            }`}
            onClick={() => setChartType("monthly")}
          >
            월간 보기
          </button>
          <button
            className={`${styles.chartTypeButton} ${
              chartType === "yearly" ? styles.active : ""
            }`}
            onClick={() => setChartType("yearly")}
          >
            연간 보기
          </button>
        </div>
      </div>

      {/* 진행 차트 섹션 */}
      <div className={styles.chartsSection}>
        <div className={styles.sectionHeader}>
          <h2>📊 진행 차트</h2>
          <p>{chartType === "monthly" ? "월간" : "연간"} 운동 진행 상황</p>
        </div>
        <ProgressCharts
          chartData={chartData}
          sessions={sessions}
          onViewSession={onViewSession}
          chartType={chartType}
        />
      </div>

      {/* 최근 활동 섹션 */}
      {sharedState.lastUpdatedSession && (
        <div className={styles.recentActivitySection}>
          <div className={styles.sectionHeader}>
            <h2>🕒 최근 활동</h2>
            <p>가장 최근 운동 세션</p>
          </div>
          <div className={styles.recentSessionCard}>
            <div className={styles.sessionInfo}>
              <span className={styles.sessionName}>
                {sharedState.lastUpdatedSession.name}
              </span>
              <span className={styles.sessionDate}>
                {new Date(
                  sharedState.lastUpdatedSession.updatedAt ||
                    sharedState.lastUpdatedSession.createdAt
                ).toLocaleDateString()}
              </span>
            </div>
            <div className={styles.sessionStats}>
              <span className={styles.sessionDuration}>
                {sharedState.lastUpdatedSession.totalDurationMinutes}분
              </span>
              <span className={styles.sessionSets}>
                {sharedState.lastUpdatedSession.exerciseSets?.length || 0}세트
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
