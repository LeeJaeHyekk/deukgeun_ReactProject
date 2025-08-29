import React from "react"
import type { WorkoutPlan } from "../../../../../../shared/types"
import styles from "./PlansContent.module.css"

interface PlansContentProps {
  plans: WorkoutPlan[]
  viewMode: "grid" | "list"
  onEditPlan: (planId: number) => void
  onStartSession: (planId: number) => void
  onDeletePlan: (planId: number) => void
  onCreatePlan: () => void
}

export const PlansContent: React.FC<PlansContentProps> = ({
  plans,
  viewMode,
  onEditPlan,
  onStartSession,
  onDeletePlan,
  onCreatePlan,
}) => {
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
  if (plans.length === 0) {
    return (
      <div className={styles.plansContent}>
        <div className={styles.noPlansContainer}>
          <div className={styles.noPlansIcon}>📋</div>
          <h3>아직 운동 계획이 없습니다</h3>
          <p>첫 번째 운동 계획을 만들어보세요!</p>
          <button className={styles.createFirstPlanBtn} onClick={onCreatePlan}>
            첫 계획 만들기
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.plansContent}>
      {viewMode === "grid" ? (
        <div className={styles.plansGrid}>
          {plans.map(plan => (
            <WorkoutPlanCard
              key={plan.id}
              plan={plan}
              onViewDetails={() => onEditPlan(plan.id)}
              onEdit={() => onEditPlan(plan.id)}
              onDelete={() => onDeletePlan(plan.id)}
            />
          ))}
        </div>
      ) : (
        <div className={styles.plansList}>
          {plans.map(plan => (
            <div key={plan.id} className={styles.planListItem}>
              <div className={styles.planListHeader}>
                <div className={styles.planListTitle}>
                  <h4>{plan.name}</h4>
                  <span
                    className={`${styles.planDifficulty} ${getDifficultyClass(plan.difficulty)}`}
                  >
                    {plan.difficulty}
                  </span>
                </div>
                <div className={styles.planListActions}>
                  <button
                    className={`${styles.listActionButton} ${styles.primary}`}
                    onClick={() => onEditPlan(plan.id)}
                  >
                    상세보기
                  </button>
                  <button
                    className={`${styles.listActionButton} ${styles.secondary}`}
                    onClick={() => onEditPlan(plan.id)}
                  >
                    수정
                  </button>
                  <button
                    className={`${styles.listActionButton} ${styles.danger}`}
                    onClick={() => onDeletePlan(plan.id)}
                  >
                    삭제
                  </button>
                </div>
              </div>

              {plan.description && (
                <p className={styles.planListDescription}>{plan.description}</p>
              )}

              <div className={styles.planListStats}>
                <div className={styles.planListStatItem}>
                  <span className={styles.planListStatLabel}>운동 수</span>
                  <span className={styles.planListStatValue}>
                    {plan.exercises?.length || 0}개
                  </span>
                </div>
                <div className={styles.planListStatItem}>
                  <span className={styles.planListStatLabel}>소요 시간</span>
                  <span className={styles.planListStatValue}>
                    {plan.totalDurationMinutes || 0}분
                  </span>
                </div>
                <div className={styles.planListStatItem}>
                  <span className={styles.planListStatLabel}>연속 달성</span>
                  <span className={styles.planListStatValue}>
                    {plan.streak || 0}일
                  </span>
                </div>
                <div className={styles.planListStatItem}>
                  <span className={styles.planListStatLabel}>진행률</span>
                  <span className={styles.planListStatValue}>
                    {plan.progress || 0}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
