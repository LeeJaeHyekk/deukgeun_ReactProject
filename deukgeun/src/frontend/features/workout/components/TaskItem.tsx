// ============================================================================
// TaskItem - 세트별 체크박스 (메모이제이션 최적화)
// ============================================================================

import React, { memo, useMemo } from "react"
import type { Task } from "../slices/workoutSlice"
import styles from "./TaskItem.module.css"

interface Props {
  task: Task
  onRecordSet: () => void
  onUndoSet: () => void
}

function TaskItemComponent({ task, onRecordSet, onUndoSet }: Props) {
  // 계산된 값들 메모이제이션
  const taskState = useMemo(() => {
    const isCompleted = task.status === "completed" || task.completedSets >= task.setCount
    // 완료된 태스크는 세트 완료 버튼 비활성화
    const canRecord = !isCompleted && task.completedSets < task.setCount
    const canUndo = task.completedSets > 0
    const progressPercent = task.setCount > 0 
      ? Math.min((task.completedSets / task.setCount) * 100, 100)
      : 0
    
    let statusText = "대기"
    if (isCompleted) {
      statusText = "완료"
    } else if (task.status === "in_progress") {
      statusText = "진행 중"
    }

    return {
      isCompleted,
      canRecord,
      canUndo,
      progressPercent,
      statusText,
    }
  }, [task.status, task.completedSets, task.setCount])

  return (
    <div className={styles.taskItem}>
      <div className={styles.taskHeader}>
        <h4>{task.name}</h4>
        <span className={`${styles.status} ${taskState.isCompleted ? styles.completed : ""}`}>
          {taskState.statusText}
        </span>
      </div>

      <div className={styles.taskInfo}>
        <div className={styles.infoItem}>
          <span className={styles.label}>세트:</span>
          <span className={styles.value}>
            {task.completedSets} / {task.setCount}
          </span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.label}>반복:</span>
          <span className={styles.value}>{task.repsPerSet}회</span>
        </div>
        {task.weightPerSet && (
          <div className={styles.infoItem}>
            <span className={styles.label}>무게:</span>
            <span className={styles.value}>{task.weightPerSet}kg</span>
          </div>
        )}
      </div>

      <div className={styles.progressBar}>
        <div
          className={styles.progressFill}
          style={{ width: `${taskState.progressPercent}%` }}
        />
      </div>

      <div className={styles.actions}>
        <button
          onClick={onRecordSet}
          disabled={!taskState.canRecord}
          className={`${styles.button} ${styles.recordButton}`}
        >
          세트 완료
        </button>
        <button
          onClick={onUndoSet}
          disabled={!taskState.canUndo}
          className={`${styles.button} ${styles.undoButton}`}
        >
          되돌리기
        </button>
      </div>
    </div>
  )
}

// React.memo로 메모이제이션
export const TaskItem = memo(TaskItemComponent, (prevProps, nextProps) => {
  // task의 핵심 속성만 비교
  return (
    prevProps.task.taskId === nextProps.task.taskId &&
    prevProps.task.completedSets === nextProps.task.completedSets &&
    prevProps.task.status === nextProps.task.status &&
    prevProps.task.setCount === nextProps.task.setCount
  )
})
