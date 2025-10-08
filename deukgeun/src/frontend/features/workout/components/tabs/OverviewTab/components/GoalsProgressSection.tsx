import React from "react"
import type { DashboardData, WorkoutGoal } from "../../../../types"
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
  goals?: WorkoutGoal[]
  onGoalClick: (goalId: number) => void
}

export const GoalsProgressSection: React.FC<GoalsProgressSectionProps> = ({
  dashboardData,
  goals,
  onGoalClick,
}) => {
  // 실제 데이터에서 목표 정보를 가져오는 함수
  const getActiveGoals = (): Goal[] => {
    console.log("🎯 [GoalsProgressSection] dashboardData:", dashboardData)
    console.log("🎯 [GoalsProgressSection] goals:", goals)

    // 실제 목표 데이터를 우선적으로 사용
    if (goals && goals.length > 0) {
      console.log("🎯 [GoalsProgressSection] Using actual goals data:", goals)
      return goals
        .filter(goal => !goal.isCompleted) // 완료되지 않은 목표만
        .map(goal => ({
          id: goal.id,
          title: goal.title,
          currentValue: goal.currentValue,
          targetValue: goal.targetValue,
          unit: goal.unit || "회",
          category: (goal.type as Goal["category"]) || "workout",
          deadline: goal.deadline
            ? new Date(goal.deadline).toLocaleDateString()
            : undefined,
          status: goal.isCompleted ? "completed" : ("active" as Goal["status"]),
        }))
    }

    // dashboardData에서 목표 정보를 추출하는 로직 (fallback)
    if (
      dashboardData &&
      dashboardData.activeGoals &&
      dashboardData.activeGoals.length > 0
    ) {
      console.log(
        "🎯 [GoalsProgressSection] activeGoals found in dashboardData:",
        dashboardData.activeGoals
      )
      return dashboardData.activeGoals.map((goal: any) => ({
        id: goal.id,
        title: goal.title,
        currentValue: goal.currentValue,
        targetValue: goal.targetValue,
        unit: goal.unit || "회",
        category: (goal.type as Goal["category"]) || "workout",
        deadline: goal.deadline
          ? new Date(goal.deadline).toLocaleDateString()
          : undefined,
        status: goal.isCompleted ? "completed" : ("active" as Goal["status"]),
      }))
    }

    console.log("🎯 [GoalsProgressSection] No goals found, using mock data")
    // 기본 목표 데이터 (실제 데이터 연동 전까지 사용)
    return []
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
                title="클릭하여 목표 탭으로 이동"
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
