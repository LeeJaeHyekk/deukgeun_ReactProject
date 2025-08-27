import React from "react"
import type { DashboardData } from "../../../../../../shared/api/workoutJournalApi"
import styles from "./GoalsProgressSection.module.css"

interface GoalsProgressSectionProps {
  dashboardData: DashboardData
  onGoalClick: (goalId: number) => void
}

export const GoalsProgressSection: React.FC<GoalsProgressSectionProps> = ({
  dashboardData,
  onGoalClick,
}) => {
  // 기본 목표 데이터 (실제 데이터 연동은 추후 구현)
  const defaultGoals = [
    {
      id: 1,
      title: "주 3회 운동하기",
      currentValue: 2,
      targetValue: 3,
      unit: "회",
    },
    {
      id: 2,
      title: "체중 5kg 감량",
      currentValue: 2,
      targetValue: 5,
      unit: "kg",
    },
  ]

  const activeGoals = defaultGoals

  return (
    <section className={styles.goalsProgressSection}>
      <h3>🎯 목표 현황</h3>
      <div className={styles.goalsList}>
        {activeGoals.length > 0 ? (
          activeGoals.map(goal => {
            const progress = (goal.currentValue / goal.targetValue) * 100
            return (
              <div
                key={goal.id}
                className={styles.goalItem}
                onClick={() => onGoalClick(goal.id)}
              >
                <div className={styles.goalHeader}>
                  <h4>{goal.title}</h4>
                  <span className={styles.goalProgress}>
                    {Math.round(progress)}%
                  </span>
                </div>
                <div className={styles.goalProgressBar}>
                  <div
                    className={styles.goalProgressFill}
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
                <p className={styles.goalDetails}>
                  {goal.currentValue} / {goal.targetValue} {goal.unit}
                </p>
              </div>
            )
          })
        ) : (
          <div className={styles.noDataMessage}>
            <p>설정된 목표가 없습니다</p>
          </div>
        )}
      </div>
    </section>
  )
}
