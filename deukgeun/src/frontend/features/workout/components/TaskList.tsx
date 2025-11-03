// ============================================================================
// TaskList - 운동 항목 리스트 (메모이제이션 최적화)
// ============================================================================

import React, { memo, useCallback } from "react"
import { TaskItem } from "./TaskItem"
import type { Task } from "../slices/workoutSlice"
import styles from "./TaskList.module.css"

interface Props {
  tasks: Task[]
  onRecordSet: (taskId: string) => void
  onUndoSet: (taskId: string) => void
}

function TaskListComponent({ tasks, onRecordSet, onUndoSet }: Props) {
  // 콜백 함수 메모이제이션으로 TaskItem 리렌더링 방지
  const createRecordHandler = useCallback(
    (taskId: string) => () => onRecordSet(taskId),
    [onRecordSet]
  )

  const createUndoHandler = useCallback(
    (taskId: string) => () => onUndoSet(taskId),
    [onUndoSet]
  )

  if (tasks.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p>등록된 운동 항목이 없습니다.</p>
      </div>
    )
  }

  return (
    <div className={styles.taskList}>
      <h3>운동 항목</h3>
      <div className={styles.tasks}>
        {tasks.map((task) => (
          <TaskItem
            key={task.taskId}
            task={task}
            onRecordSet={createRecordHandler(task.taskId)}
            onUndoSet={createUndoHandler(task.taskId)}
          />
        ))}
      </div>
    </div>
  )
}

// React.memo로 메모이제이션
export const TaskList = memo(TaskListComponent)

