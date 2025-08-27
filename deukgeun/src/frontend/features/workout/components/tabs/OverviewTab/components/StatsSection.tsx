import React from "react"
import type { DashboardData } from "../../../../../../shared/api/workoutJournalApi"
import styles from "./StatsSection.module.css"

interface StatsSectionProps {
  dashboardData: DashboardData
}

export const StatsSection: React.FC<StatsSectionProps> = ({
  dashboardData,
}) => {
  const stats = [
    {
      label: "총 계획",
      value: dashboardData.summary?.totalPlans || 0,
      unit: "개",
      icon: "📋",
    },
    {
      label: "완료 세션",
      value: dashboardData.summary?.completedSessions || 0,
      unit: "개",
      icon: "✅",
    },
    {
      label: "활성 목표",
      value: (dashboardData.totalGoals || 0) - (dashboardData.completedGoals || 0),
      unit: "개",
      icon: "🎯",
    },
    {
      label: "연속 운동",
      value: dashboardData.currentStreak || 0,
      unit: "일",
      icon: "🔥",
    },
  ]

  return (
    <section className={styles.statsSection}>
      <h3>📊 요약 통계</h3>
      <div className={styles.statsGrid}>
        {stats.map((stat, index) => (
          <div key={index} className={styles.statCard}>
            <div className={styles.statIcon}>{stat.icon}</div>
            <div className={styles.statContent}>
              <h4>{stat.label}</h4>
              <p>
                {stat.value}
                {stat.unit}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
