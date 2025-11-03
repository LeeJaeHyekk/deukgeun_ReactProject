// ============================================================================
// CompletedList - 완료 운동 목록 (메모이제이션 최적화)
// ============================================================================

import React, { memo, useMemo, useCallback } from "react"
import type { CompletedWorkout } from "../slices/workoutSlice"
import { EmptyState } from "./common"
import styles from "./CompletedList.module.css"

interface Props {
  workouts: CompletedWorkout[]
}

function CompletedListComponent({ workouts }: Props) {
  // 날짜 포맷팅 함수 메모이제이션
  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString("ko-KR")
  }, [])
  if (workouts.length === 0) {
    return (
      <EmptyState
        message="완료된 운동이 없습니다."
        secondaryMessage="운동을 완료하면 여기에 표시됩니다."
      />
    )
  }

  return (
    <div className={styles.completedList}>
      {workouts.map((workout) => (
        <div key={workout.completedId} className={styles.workoutCard}>
          <div className={styles.header}>
            <h3>{workout.goalTitle || "운동 완료"}</h3>
            <span className={styles.date}>
              {formatDate(workout.completedAt)}
            </span>
          </div>

          <div className={styles.stats}>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>총 세트</span>
              <span className={styles.statValue}>{workout.totalSets}</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>총 반복</span>
              <span className={styles.statValue}>{workout.totalReps}</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>경험치</span>
              <span className={styles.statValue}>{workout.expEarned} EXP</span>
            </div>
            {workout.durationMin && (
              <div className={styles.statItem}>
                <span className={styles.statLabel}>소요 시간</span>
                <span className={styles.statValue}>{workout.durationMin}분</span>
              </div>
            )}
          </div>

          {workout.summary?.comment && (
            <div className={styles.comment}>
              <p>{workout.summary.comment}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// React.memo로 메모이제이션
export const CompletedList = memo(CompletedListComponent)

