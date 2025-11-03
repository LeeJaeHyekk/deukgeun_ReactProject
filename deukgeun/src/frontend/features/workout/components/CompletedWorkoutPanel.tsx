// ============================================================================
// CompletedWorkoutPanel - 완료 탭 (메모이제이션 최적화)
// ============================================================================

import React, { memo, useMemo } from "react"
import { useSelector } from "react-redux"
import { selectCompletedWorkouts } from "../selectors"
import type { CompletedWorkout } from "../slices/workoutSlice"
import { CompletedList } from "./CompletedList"
import { WorkoutChart } from "./WorkoutChart"
import styles from "./CompletedWorkoutPanel.module.css"

function CompletedWorkoutPanelComponent() {
  const completedWorkouts = useSelector(selectCompletedWorkouts) as CompletedWorkout[]
  
  // workout 개수 메모이제이션
  const workoutCount = useMemo(() => completedWorkouts.length, [completedWorkouts.length])
  
  // 차트 표시 여부 메모이제이션
  const showChart = useMemo(() => completedWorkouts.length > 0, [completedWorkouts.length])

  return (
    <div className={styles.completedWorkoutPanel}>
      <div className={styles.header}>
        <h2>완료된 운동</h2>
        <span className={styles.count}>{workoutCount}개</span>
      </div>

      <div className={styles.content}>
        <CompletedList workouts={completedWorkouts} />
        {showChart && (
          <div className={styles.chartSection}>
            <WorkoutChart workouts={completedWorkouts} />
          </div>
        )}
      </div>
    </div>
  )
}

// React.memo로 메모이제이션
export const CompletedWorkoutPanel = memo(CompletedWorkoutPanelComponent)

