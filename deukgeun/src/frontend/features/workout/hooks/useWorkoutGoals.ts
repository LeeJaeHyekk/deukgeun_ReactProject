// ============================================================================
// useWorkoutGoals - 목표 관리 Hook (최적화)
// ============================================================================

import { useCallback, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { selectGoals, selectActiveWorkout } from '../selectors'
import { startSession, addGoal, editGoal, deleteGoal, type Goal } from '../slices/workoutSlice'
import { calcGoalProgress, isGoalCompleted } from '../utils/goalUtils'

export function useWorkoutGoals() {
  const dispatch = useDispatch()
  const goals = useSelector(selectGoals) as Goal[]
  const activeWorkout = useSelector(selectActiveWorkout)

  // 목표 추가
  const handleAddGoal = useCallback(
    (goal: Goal) => {
      dispatch(addGoal(goal))
    },
    [dispatch]
  )

  // 목표 수정
  const handleEditGoal = useCallback(
    (goalId: string, patch: Partial<Goal>) => {
      dispatch(editGoal({ goalId, patch }))
    },
    [dispatch]
  )

  // 목표 삭제
  const handleDeleteGoal = useCallback(
    (goalId: string) => {
      dispatch(deleteGoal(goalId))
    },
    [dispatch]
  )

  // 운동 시작
  const handleStartWorkout = useCallback(
    (goalId: string) => {
      // 이미 활성 세션이 있는 경우 체크
      if (activeWorkout) {
        alert("이미 진행 중인 운동 세션이 있습니다. 먼저 현재 세션을 종료하거나 일시정지해주세요.")
        return
      }

      const goal = goals.find((g: Goal) => g.goalId === goalId)
      if (!goal) {
        alert("목표를 찾을 수 없습니다.")
        return
      }

      // 목표에 운동 항목이 없는 경우 체크
      if (!goal.tasks || goal.tasks.length === 0) {
        alert("운동 항목이 없습니다. 먼저 운동 항목을 추가해주세요.")
        return
      }

      // 이전에 완료된 세트 총합 계산 (goal.tasks의 completedSets 합계)
      const previousCompletedSets = goal.tasks.reduce((sum, task) => sum + (task.completedSets || 0), 0)
      
      const newActiveWorkout = {
        sessionId: Date.now().toString(),
        goalId: goal.goalId,
        startTime: new Date().toISOString(),
        endTime: null,
        progress: 0,
        // 이전에 완료된 세트 총합으로 초기화 (startSession에서 다시 계산됨)
        currentSet: previousCompletedSets,
        restTimerSec: 0,
        addedTasks: goal.tasks.map((task) => ({ ...task })),
        notes: '',
        photos: [],
      }

      dispatch(startSession(newActiveWorkout))
    },
    [dispatch, goals, activeWorkout]
  )

  // 목표 수정 가능 여부
  const canEditGoal = useCallback(
    (goalId: string) => {
      return activeWorkout?.goalId !== goalId
    },
    [activeWorkout]
  )

  // 메모이제이션된 목표 목록 (완료되지 않은 목표만 필터링)
  // calcGoalProgress 사용으로 중복 계산 제거
  const memoizedGoals = useMemo(() => {
    return goals.filter((goal: Goal) => {
      // status가 'done'이 아닌 경우
      if (goal.status === 'done') return false
      
      // 진행률 및 완료 여부 계산 (통합 함수 사용)
      const progress = calcGoalProgress(goal)
      const completed = isGoalCompleted(goal)
      
      // 완료되지 않은 목표만 필터링
      return !completed && progress < 100
    })
  }, [goals])

  return {
    goals: memoizedGoals,
    activeWorkout,
    handleAddGoal,
    handleEditGoal,
    handleDeleteGoal,
    handleStartWorkout,
    canEditGoal,
  }
}
