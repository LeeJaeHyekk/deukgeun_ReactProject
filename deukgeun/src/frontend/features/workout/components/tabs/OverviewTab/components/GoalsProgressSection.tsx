import React from "react"
import type { DashboardData } from "../../../../../../shared/api/workoutJournalApi"
import styles from "./GoalsProgressSection.module.css"

interface Goal {
  id: number
  title: string
  currentValue: number
  targetValue: number
  unit: string
  category: "workout" | "weight" | "strength" | "endurance"
  deadline?: string
  status: "active" | "completed" | "overdue"
}

interface GoalsProgressSectionProps {
  dashboardData: DashboardData
  onGoalClick: (goalId: number) => void
}

export const GoalsProgressSection: React.FC<GoalsProgressSectionProps> = ({
  dashboardData,
  onGoalClick,
}) => {
  // 실제 데이터에서 목표 정보를 가져오는 함수
  const getActiveGoals = (): Goal[] => {
    // dashboardData에서 목표 정보를 추출하는 로직
    // 실제 구현 시에는 dashboardData.upcomingGoals 등을 사용하여 변환
    if (
      dashboardData &&
      dashboardData.upcomingGoals &&
      dashboardData.upcomingGoals.length > 0
    ) {
      return dashboardData.upcomingGoals.map(goal => ({
        id: goal.id,
        title: goal.title,
        currentValue: Math.round(goal.progress), // 진행률을 현재값으로 변환
        targetValue: 100, // 목표값을 100으로 설정
        unit: "%",
        category: "workout" as Goal["category"], // 기본값
        deadline: goal.deadline
          ? new Date(goal.deadline).toLocaleDateString()
          : undefined,
        status:
          goal.progress >= 100 ? "completed" : ("active" as Goal["status"]),
      }))
    }

    // 기본 목표 데이터 (실제 데이터 연동 전까지 사용)
    return [
      {
        id: 1,
        title: "주 3회 운동하기",
        currentValue: 2,
        targetValue: 3,
        unit: "회",
        category: "workout",
        status: "active",
      },
      {
        id: 2,
        title: "체중 5kg 감량",
        currentValue: 2,
        targetValue: 5,
        unit: "kg",
        category: "weight",
        status: "active",
      },
      {
        id: 3,
        title: "벤치프레스 100kg",
        currentValue: 80,
        targetValue: 100,
        unit: "kg",
        category: "strength",
        status: "active",
      },
    ]
  }

  const activeGoals = getActiveGoals()

  // 목표 카테고리별 색상 및 아이콘
  const getGoalCategoryInfo = (category: Goal["category"]) => {
    switch (category) {
      case "workout":
        return {
          color: "#3b82f6",
          icon: "💪",
          bgColor: "rgba(59, 130, 246, 0.2)",
        }
      case "weight":
        return {
          color: "#10b981",
          icon: "⚖️",
          bgColor: "rgba(16, 185, 129, 0.2)",
        }
      case "strength":
        return {
          color: "#f59e0b",
          icon: "🏋️",
          bgColor: "rgba(245, 158, 11, 0.2)",
        }
      case "endurance":
        return {
          color: "#8b5cf6",
          icon: "🏃",
          bgColor: "rgba(139, 92, 246, 0.2)",
        }
      default:
        return {
          color: "#6b7280",
          icon: "🎯",
          bgColor: "rgba(107, 114, 128, 0.2)",
        }
    }
  }

  // 진행률에 따른 상태 색상
  const getProgressColor = (progress: number) => {
    if (progress >= 100) return "#10b981"
    if (progress >= 70) return "#f59e0b"
    if (progress >= 40) return "#3b82f6"
    return "#ef4444"
  }

  return (
    <section className={styles.goalsProgressSection}>
      <div className={styles.sectionHeader}>
        <h3>🎯 목표 현황</h3>
        <span className={styles.goalsCount}>{activeGoals.length}개 목표</span>
      </div>
      <div className={styles.goalsList}>
        {activeGoals.length > 0 ? (
          activeGoals.map(goal => {
            const progress = (goal.currentValue / goal.targetValue) * 100
            const categoryInfo = getGoalCategoryInfo(goal.category)
            const progressColor = getProgressColor(progress)

            return (
              <div
                key={goal.id}
                className={`${styles.goalItem} ${styles[goal.status]}`}
                onClick={() => onGoalClick(goal.id)}
              >
                <div className={styles.goalHeader}>
                  <div className={styles.goalInfo}>
                    <span
                      className={styles.goalIcon}
                      style={{ backgroundColor: categoryInfo.bgColor }}
                    >
                      {categoryInfo.icon}
                    </span>
                    <h4>{goal.title}</h4>
                  </div>
                  <span
                    className={styles.goalProgress}
                    style={{
                      color: progressColor,
                      backgroundColor: `${progressColor}20`,
                    }}
                  >
                    {Math.round(progress)}%
                  </span>
                </div>
                <div className={styles.goalProgressBar}>
                  <div
                    className={styles.goalProgressFill}
                    style={{
                      width: `${Math.min(progress, 100)}%`,
                      background: `linear-gradient(90deg, ${progressColor} 0%, ${progressColor}80 100%)`,
                    }}
                  />
                </div>
                <div className={styles.goalDetails}>
                  <span className={styles.goalValues}>
                    {goal.currentValue} / {goal.targetValue} {goal.unit}
                  </span>
                  {goal.deadline && (
                    <span className={styles.goalDeadline}>
                      마감: {goal.deadline}
                    </span>
                  )}
                </div>
              </div>
            )
          })
        ) : (
          <div className={styles.noDataMessage}>
            <div className={styles.noDataIcon}>🎯</div>
            <p>설정된 목표가 없습니다</p>
            <span>새로운 목표를 설정해보세요!</span>
          </div>
        )}
      </div>
    </section>
  )
}
