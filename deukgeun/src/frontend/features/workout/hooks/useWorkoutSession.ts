// ============================================================================
// useWorkoutSession - 운동 세션 관리 Hook (최적화)
// ============================================================================

import { useCallback, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { selectActiveWorkout, selectActiveGoal } from '../selectors'
import {
  recordSet,
  undoSet,
  quickAddTaskToActive,
  endSessionAndCompleteGoal,
  type Task,
} from '../slices/workoutSlice'
import { useRestTimer } from './useRestTimer'

export function useWorkoutSession() {
  const dispatch = useDispatch()
  const activeWorkout = useSelector(selectActiveWorkout)
  // Selector를 통한 activeGoal 조회 (최적화)
  const activeGoal = useSelector(selectActiveGoal)
  const { startTimer } = useRestTimer()

  // 세트 기록
  const handleRecordSet = useCallback(
    (taskId: string) => {
      if (!activeWorkout) {
        console.warn("활성 세션이 없습니다.")
        return
      }

      if (!taskId) {
        console.error("taskId가 제공되지 않았습니다.")
        return
      }

      dispatch(
        recordSet({
          goalId: activeWorkout.goalId,
          taskId,
        })
      )

      // 세트 완료 후 휴식 타이머 시작
      if (activeGoal) {
        const task = activeGoal.tasks.find((t) => t.taskId === taskId)
        if (task && task.completedSets < task.setCount) {
          const allTasksCompleted = activeGoal.tasks.every(
            (t) => t.completedSets >= t.setCount
          )
          if (!allTasksCompleted) {
            startTimer()
          }
        }
      } else {
        console.warn("활성 목표를 찾을 수 없습니다:", activeWorkout.goalId)
      }
    },
    [dispatch, activeWorkout, activeGoal, startTimer]
  )

  // 세트 되돌리기
  const handleUndoSet = useCallback(
    (taskId: string) => {
      if (!activeWorkout) {
        console.warn("활성 세션이 없습니다.")
        return
      }

      if (!taskId) {
        console.error("taskId가 제공되지 않았습니다.")
        return
      }

      dispatch(
        undoSet({
          goalId: activeWorkout.goalId,
          taskId,
        })
      )
    },
    [dispatch, activeWorkout]
  )

  // 빠른 운동 추가
  const handleQuickAdd = useCallback(
    () => {
      if (!activeWorkout) return

      const now = new Date().toISOString()
      const newTask: Task = {
        taskId: Date.now().toString(),
        name: '추가 운동',
        setCount: 3,
        repsPerSet: 10,
        completedSets: 0,
        status: 'pending',
        createdAt: now,
        updatedAt: now,
      }

      dispatch(quickAddTaskToActive({ task: newTask }))
    },
    [dispatch, activeWorkout]
  )

  // 세션 종료
  const handleFinishSession = useCallback(
    () => {
      if (!activeWorkout) {
        console.warn("활성 세션이 없습니다.")
        alert("진행 중인 운동 세션이 없습니다.")
        return
      }

      if (!activeWorkout.sessionId) {
        console.error("sessionId가 없습니다.")
        alert("세션 정보가 올바르지 않습니다.")
        return
      }

      dispatch(endSessionAndCompleteGoal({ sessionId: activeWorkout.sessionId }))
    },
    [dispatch, activeWorkout]
  )

  return {
    activeWorkout,
    activeGoal,
    handleRecordSet,
    handleUndoSet,
    handleQuickAdd,
    handleFinishSession,
  }
}

