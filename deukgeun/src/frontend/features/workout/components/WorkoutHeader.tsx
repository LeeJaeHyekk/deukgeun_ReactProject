// ============================================================================
// WorkoutHeader - 세션 정보, 타이머, 상태 표시
// ============================================================================

import React, { useState, useEffect, useMemo, memo, useCallback } from "react"
import type { Goal, ActiveWorkout } from "../slices/workoutSlice"
import { calcGoalProgress } from "../utils/goalUtils"
import styles from "./WorkoutHeader.module.css"

interface Props {
  goal: Goal
  activeWorkout: ActiveWorkout
}

function WorkoutHeaderComponent({ goal, activeWorkout }: Props) {
  const [elapsedTime, setElapsedTime] = useState(0)

  // 진행률 실시간 계산 (goal.tasks 변경 시 업데이트)
  const progress = useMemo(() => calcGoalProgress(goal), [
    goal,
    goal.tasks,
    goal.tasks?.map((t) => t.status).join(","),
    goal.tasks?.map((t) => t.completedSets).join(","),
  ])

  // 현재 완료된 세트 총합 계산 (goal.tasks의 completedSets 합계)
  // 이전에 완료된 세트도 포함하여 계산
  const currentCompletedSets = useMemo(() => {
    if (!goal.tasks || goal.tasks.length === 0) return 0
    
    const totalCompleted = goal.tasks.reduce((sum, task) => {
      // completedSets를 명시적으로 확인하고 보존
      const completed = task.completedSets !== undefined && task.completedSets !== null && !isNaN(task.completedSets)
        ? Number(task.completedSets)
        : 0
      return sum + completed
    }, 0)
    
    // 디버깅: 계산된 값 로그 출력 (항상 출력하여 문제 확인)
    console.log(`📊 현재 완료된 세트 계산: ${totalCompleted}`, {
      goalId: goal.goalId,
      goalTitle: goal.title,
      tasksCount: goal.tasks.length,
      tasks: goal.tasks.map(t => ({
        taskId: t.taskId,
        name: t.name,
        completedSets: t.completedSets,
        completedSetsType: typeof t.completedSets,
        completedSetsIsNaN: typeof t.completedSets === 'number' ? isNaN(t.completedSets) : 'not a number',
        setCount: t.setCount,
        status: t.status
      })),
      totalCompleted
    })
    
    return totalCompleted
  }, [
    goal.goalId,
    goal.tasks,
    goal.tasks?.map((t) => `${t.taskId}:${t.completedSets || 0}`).join(","),
  ])

  // 총 세트 수 계산
  const totalSets = useMemo(() => {
    if (!goal.tasks || goal.tasks.length === 0) return 0
    return goal.tasks.reduce((sum, task) => sum + (task.setCount || 0), 0)
  }, [
    goal.tasks,
    goal.tasks?.map((t) => t.setCount).join(","),
  ])

  useEffect(() => {
    const startTime = new Date(activeWorkout.startTime).getTime()
    const interval = setInterval(() => {
      const now = Date.now()
      setElapsedTime(Math.floor((now - startTime) / 1000))
    }, 1000)

    return () => clearInterval(interval)
  }, [activeWorkout.startTime])

  // formatTime 함수 메모이제이션
  const formatTime = useCallback((seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`
  }, [])

  return (
    <div className={styles.workoutHeader}>
      <div className={styles.titleSection}>
        <h2>{goal.title}</h2>
        <span className={styles.progress}>{progress}%</span>
      </div>

      <div className={styles.statsSection}>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>경과 시간</span>
          <span className={styles.statValue}>{formatTime(elapsedTime)}</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>현재 세트</span>
          <span className={styles.statValue}>{currentCompletedSets} / {totalSets}</span>
        </div>
      </div>

      {goal.description && (
        <p className={styles.description}>{goal.description}</p>
      )}
    </div>
  )
}

// React.memo로 메모이제이션
export const WorkoutHeader = memo(WorkoutHeaderComponent, (prevProps, nextProps) => {
  // goal과 activeWorkout의 핵심 속성 비교
  const goalChanged = 
    prevProps.goal.goalId !== nextProps.goal.goalId ||
    prevProps.goal.tasks?.length !== nextProps.goal.tasks?.length
  
  // tasks의 completedSets 변경 감지
  const tasksChanged = goalChanged || 
    (prevProps.goal.tasks && nextProps.goal.tasks && 
     prevProps.goal.tasks.some((prevTask, index) => {
       const nextTask = nextProps.goal.tasks[index]
       return !nextTask || 
         prevTask.taskId !== nextTask.taskId ||
         prevTask.completedSets !== nextTask.completedSets ||
         prevTask.status !== nextTask.status
     }))
  
  const activeWorkoutChanged = 
    prevProps.activeWorkout.sessionId !== nextProps.activeWorkout.sessionId ||
    prevProps.activeWorkout.startTime !== nextProps.activeWorkout.startTime ||
    prevProps.activeWorkout.currentSet !== nextProps.activeWorkout.currentSet
  
  // 변경이 없으면 리렌더링 방지
  return !tasksChanged && !activeWorkoutChanged
})

