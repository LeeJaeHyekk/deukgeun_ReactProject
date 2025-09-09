import React from "react"
import styles from "./ProgressStats.module.css"

interface ProgressStatsProps {
  stats: {
    totalSessions: number
    totalDuration: number
    totalExercises: number
    averageDuration: number
    completionRate: number
    totalCalories?: number
    averageCalories?: number
  }
}

export const ProgressStats: React.FC<ProgressStatsProps> = ({ stats }) => {
  return (
    <div className={styles.progressStats}>
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>📊</div>
          <div className={styles.statContent}>
            <h4>총 운동 세션</h4>
            <p className={styles.statValue}>{stats.totalSessions}개</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>⏱️</div>
          <div className={styles.statContent}>
            <h4>총 운동 시간</h4>
            <p className={styles.statValue}>{stats.totalDuration}분</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>💪</div>
          <div className={styles.statContent}>
            <h4>총 운동 세트</h4>
            <p className={styles.statValue}>{stats.totalExercises}개</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>📈</div>
          <div className={styles.statContent}>
            <h4>평균 운동 시간</h4>
            <p className={styles.statValue}>{stats.averageDuration}분</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>🎯</div>
          <div className={styles.statContent}>
            <h4>완료율</h4>
            <p className={styles.statValue}>{stats.completionRate}%</p>
          </div>
        </div>

        {stats.totalCalories && (
          <div className={styles.statCard}>
            <div className={styles.statIcon}>🔥</div>
            <div className={styles.statContent}>
              <h4>총 소모 칼로리</h4>
              <p className={styles.statValue}>{stats.totalCalories}kcal</p>
            </div>
          </div>
        )}

        {stats.averageCalories && (
          <div className={styles.statCard}>
            <div className={styles.statIcon}>⚡</div>
            <div className={styles.statContent}>
              <h4>평균 칼로리</h4>
              <p className={styles.statValue}>{stats.averageCalories}kcal</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
