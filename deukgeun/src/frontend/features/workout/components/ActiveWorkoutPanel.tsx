// ============================================================================
// ActiveWorkoutPanel - 진행 중 탭 (메모이제이션 최적화)
// ============================================================================

import React, { memo } from "react"
import { useDispatch } from "react-redux"
import { useWorkoutSession } from "../hooks/useWorkoutSession"
import { pauseWorkout } from "../slices/workoutSlice"
import { WorkoutHeader } from "./WorkoutHeader"
import { TaskList } from "./TaskList"
import { RestTimer } from "./RestTimer"
import { ControlBar } from "./ControlBar"
import { EmptyState, ErrorState } from "./common"
import styles from "./ActiveWorkoutPanel.module.css"

function ActiveWorkoutPanelComponent() {
  const dispatch = useDispatch()
  const {
    activeWorkout,
    activeGoal,
    handleRecordSet,
    handleUndoSet,
    handleFinishSession,
  } = useWorkoutSession()

  const handlePause = () => {
    dispatch(pauseWorkout())
  }

  if (!activeWorkout) {
    return (
      <EmptyState
        message="진행 중인 운동 세션이 없습니다."
        secondaryMessage="목표 설정 탭에서 운동을 시작해보세요!"
      />
    )
  }

  if (!activeGoal) {
    return (
      <ErrorState message="운동 목표를 찾을 수 없습니다." />
    )
  }

  return (
    <div className={styles.activeWorkoutPanel}>
      <WorkoutHeader goal={activeGoal} activeWorkout={activeWorkout} />

      <TaskList
        tasks={activeGoal.tasks}
        onRecordSet={handleRecordSet}
        onUndoSet={handleUndoSet}
      />

      <RestTimer />

      <ControlBar
        onPause={handlePause}
        onFinish={handleFinishSession}
      />
    </div>
  )
}

// React.memo로 메모이제이션
export const ActiveWorkoutPanel = memo(ActiveWorkoutPanelComponent)

