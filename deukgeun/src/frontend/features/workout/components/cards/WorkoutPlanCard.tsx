import React from "react"
import { WorkoutPlan } from "../../types"
import { ProgressBar } from "../ui/ProgressBar"
import { Badge } from "../ui/Badge"
import { Button } from "../ui/Button"
import styles from "./WorkoutPlanCard.module.css"

interface WorkoutPlanCardProps {
  plan: WorkoutPlan
  onViewDetails: () => void
  onEdit: () => void
  onDelete: () => void
}

export function WorkoutPlanCard({
  plan,
  onViewDetails,
  onEdit,
  onDelete,
}: WorkoutPlanCardProps) {
  // 실제 데이터에서 계산된 값들
  const getPlanStats = () => {
    return {
      exerciseCount: plan.exercises?.length || 0,
             totalDuration: plan.estimatedDurationMinutes || 0,
      streak: 0, // WorkoutPlanDTO에는 streak 속성이 없음
      progress: 0, // WorkoutPlanDTO에는 progress 속성이 없음
      difficulty: plan.difficulty || "보통",
    }
  }

  const stats = getPlanStats()

  // 난이도별 색상 클래스
  const getDifficultyClass = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "쉬움":
      case "easy":
        return styles.easy
      case "어려움":
      case "hard":
        return styles.hard
      default:
        return styles.medium
    }
  }

  return (
    <div className={styles.workoutPlanCard}>
      <div className={styles.cardHeader}>
        <div className={styles.cardTitle}>
          <h3>{plan.name}</h3>
          {/* WorkoutPlanDTO에는 badge 속성이 없으므로 제거 */}
        </div>
        <div className={styles.cardActions}>
          <button
            className={`${styles.actionButton} ${styles.primary}`}
            onClick={onViewDetails}
          >
            상세보기
          </button>
          <button
            className={`${styles.actionButton} ${styles.secondary}`}
            onClick={onEdit}
          >
            수정
          </button>
          <button
            className={`${styles.actionButton} ${styles.danger}`}
            onClick={onDelete}
          >
            삭제
          </button>
        </div>
      </div>

      <div className={styles.cardContent}>
        {plan.description && (
          <p className={styles.cardDescription}>{plan.description}</p>
        )}

        <div className={styles.cardStats}>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>운동 수</span>
            <span className={styles.statValue}>{stats.exerciseCount}개</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>소요 시간</span>
            <span className={styles.statValue}>{stats.totalDuration}분</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>연속 달성</span>
            <span className={styles.statValue}>{stats.streak}일</span>
          </div>
        </div>

        <div className={styles.cardProgress}>
          <div className={styles.progressLabel}>진행률</div>
          <ProgressBar
            currentValue={stats.progress}
            targetValue={100}
            unit="%"
          />
        </div>
      </div>
    </div>
  )
}
