// ============================================================================
// GoalCard - 목표 카드 컴포넌트 (메모이제이션 최적화)
// ============================================================================

import React, { memo, useCallback, useMemo } from "react"
import { useDispatch } from "react-redux"
import type { Goal } from "../slices/workoutSlice"
import { pauseWorkout } from "../slices/workoutSlice"
import { calcGoalProgress, getDifficultyLabel } from "../utils/goalUtils"
import styles from "./GoalCard.module.css"

interface Props {
  goal: Goal
  isActive?: boolean
  onStart: () => void
  onEdit: () => void
  canEdit: boolean
}

function GoalCardComponent({ goal, isActive = false, onStart, onEdit, canEdit }: Props) {
  const dispatch = useDispatch()

  // 진행률 메모이제이션
  const progress = useMemo(() => calcGoalProgress(goal), [goal.tasks])

  // 태스크 통계 메모이제이션
  const taskStats = useMemo(() => {
    const taskCount = goal.tasks.length
    const completedTaskCount = goal.tasks.filter((t) => t.status === "completed").length
    return { taskCount, completedTaskCount }
  }, [goal.tasks])

  // 표시할 태스크 목록 메모이제이션 (최대 4개)
  const visibleTasks = useMemo(() => goal.tasks.slice(0, 4), [goal.tasks])
  const hasMoreTasks = goal.tasks.length > 4

  const handleToggleWorkout = useCallback(() => {
    if (isActive) {
      dispatch(pauseWorkout())
    } else {
      onStart()
    }
  }, [isActive, dispatch, onStart])

  return (
    <div className={styles.goalCard}>
      <div className={styles.header}>
        <h3>{goal.title}</h3>
        {goal.difficulty && (
          <span className={styles.difficulty} data-difficulty={goal.difficulty}>
            {getDifficultyLabel(goal.difficulty)}
          </span>
        )}
      </div>

      {goal.description && (
        <p className={styles.description} title={goal.description}>
          {goal.description}
        </p>
      )}

      <div className={styles.stats}>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>진행률</span>
          <span className={styles.statValue}>{progress}%</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>태스크</span>
          <span className={styles.statValue}>
            {taskStats.completedTaskCount}/{taskStats.taskCount}
          </span>
        </div>
      </div>

      {goal.tasks.length > 0 && (
        <div className={styles.taskList}>
          {visibleTasks.map((task) => (
            <div key={task.taskId} className={styles.taskItem}>
              <span title={task.name}>{task.name || "이름 없음"}</span>
              <span className={styles.taskProgress}>
                {task.completedSets}/{task.setCount} 세트
              </span>
            </div>
          ))}
          {hasMoreTasks && (
            <div className={styles.taskItem}>
              <span style={{ color: "var(--workout-text-tertiary)", fontStyle: "italic" }}>
                +{goal.tasks.length - 4}개 더...
              </span>
            </div>
          )}
        </div>
      )}

      <div className={styles.actions}>
        {goal.status === "active" && (
          <span className={styles.activeBadge}>진행 중</span>
        )}
        <button onClick={handleToggleWorkout} className={styles.startButton}>
          {isActive ? "중지" : "시작"}
        </button>
        {canEdit && (
          <button onClick={onEdit} className={styles.editButton}>
            수정
          </button>
        )}
      </div>
    </div>
  )
}

// React.memo로 메모이제이션 (props가 변경되지 않으면 리렌더링 방지)
export const GoalCard = memo(GoalCardComponent, (prevProps, nextProps) => {
  // 커스텀 비교 함수: goal의 핵심 속성만 비교
  return (
    prevProps.goal.goalId === nextProps.goal.goalId &&
    prevProps.goal.title === nextProps.goal.title &&
    prevProps.goal.status === nextProps.goal.status &&
    prevProps.goal.tasks === nextProps.goal.tasks && // 참조 비교 (불변성 가정)
    prevProps.isActive === nextProps.isActive &&
    prevProps.canEdit === nextProps.canEdit
  )
})
