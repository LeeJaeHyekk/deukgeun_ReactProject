// ============================================================================
// GoalList - 목표 목록 컴포넌트
// ============================================================================

import React, { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../../shared/store/hooks'
import { fetchGoals, selectGoal } from '../../features/goals/goalSlice'
import type { WorkoutGoal } from '../../shared/types/goal'

type GoalListProps = {
  userId: number | string
  onGoalSelect?: (goal: WorkoutGoal) => void
}

export function GoalList({ userId, onGoalSelect }: GoalListProps) {
  const dispatch = useAppDispatch()
  const { list, loading, error } = useAppSelector((state) => state.goals)

  useEffect(() => {
    if (userId) {
      dispatch(fetchGoals(userId))
    }
  }, [dispatch, userId])

  const handleGoalClick = (goal: WorkoutGoal) => {
    dispatch(selectGoal(goal))
    onGoalSelect?.(goal)
  }

  if (loading) {
    return <div className="goal-list-loading">로딩 중...</div>
  }

  if (error) {
    return <div className="goal-list-error">에러: {error}</div>
  }

  if (list.length === 0) {
    return (
      <div className="goal-list-empty">
        <p>등록된 목표가 없습니다.</p>
        <p>새로운 목표를 만들어보세요!</p>
      </div>
    )
  }

  return (
    <ul className="goal-list">
      {list.map((goal) => (
        <li
          key={goal.goalId || goal.goalTitle}
          onClick={() => handleGoalClick(goal)}
          className="goal-item"
        >
          <div className="goal-header">
            <h3>{goal.goalTitle}</h3>
            <span className={`goal-status goal-status-${goal.status || 'planned'}`}>
              {getStatusLabel(goal.status)}
            </span>
          </div>
          <div className="goal-meta">
            <span className="goal-type">{goal.goalType}</span>
            {goal.targetMetrics?.targetValue && (
              <>
                <span>·</span>
                <span>
                  {goal.targetMetrics.targetValue}
                  {goal.targetMetrics.unit || ''}
                </span>
              </>
            )}
            {goal.progress?.progressPercentage !== undefined && (
              <>
                <span>·</span>
                <span>진행률: {goal.progress.progressPercentage}%</span>
              </>
            )}
          </div>
          {goal.description && (
            <p className="goal-description">{goal.description}</p>
          )}
        </li>
      ))}
    </ul>
  )
}

function getStatusLabel(
  status?: string
): string {
  const statusMap: Record<string, string> = {
    planned: '계획됨',
    active: '진행 중',
    paused: '일시정지',
    completed: '완료',
    done: '완료',
    cancelled: '취소',
  }
  return statusMap[status || 'planned'] || '계획됨'
}

