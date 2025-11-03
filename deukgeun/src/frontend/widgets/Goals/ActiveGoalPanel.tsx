// ============================================================================
// ActiveGoalPanel - 활성 목표 패널 컴포넌트
// ============================================================================

import React from 'react'
import { useAppDispatch, useAppSelector } from '../../shared/store/hooks'
import { updateGoal } from '../../features/goals/goalSlice'
import { showToast } from '../../shared/lib'

export function ActiveGoalPanel() {
  const dispatch = useAppDispatch()
  const selected = useAppSelector((state) => state.goals.selected)
  const { loading } = useAppSelector((state) => state.goals)

  if (!selected) {
    return (
      <div className="active-goal-panel-empty">
        <p>활성 목표가 없습니다.</p>
        <p>목표를 선택하거나 새로 만드세요.</p>
      </div>
    )
  }

  const handleMarkCompleted = async () => {
    if (!selected.goalId) {
      showToast('목표 ID가 없습니다.', 'error')
      return
    }

    try {
      await dispatch(
        updateGoal({
          goalId: selected.goalId,
          payload: {
            isCompleted: true,
            status: 'completed',
            completedAt: new Date().toISOString(),
          },
        })
      ).unwrap()
      showToast('목표가 완료로 표시되었습니다.', 'success')
    } catch (err: any) {
      showToast(err?.message || '목표 완료 처리에 실패했습니다.', 'error')
    }
  }

  const progressPercentage = selected.progress?.progressPercentage ?? 0
  const completedTasks = selected.progress?.completedTasks ?? 0
  const totalTasks = selected.progress?.totalTasks ?? 0

  return (
    <div className="active-goal-panel">
      <div className="goal-header">
        <h2>{selected.goalTitle}</h2>
        <span className={`goal-status goal-status-${selected.status || 'planned'}`}>
          {getStatusLabel(selected.status)}
        </span>
      </div>

      {selected.description && (
        <p className="goal-description">{selected.description}</p>
      )}

      <div className="goal-progress">
        <div className="progress-header">
          <span>진행률</span>
          <span>{progressPercentage}%</span>
        </div>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        {totalTasks > 0 && (
          <div className="progress-details">
            <span>
              완료: {completedTasks} / 전체: {totalTasks}
            </span>
          </div>
        )}
      </div>

      {selected.targetMetrics && (
        <div className="goal-metrics">
          <h3>목표 지표</h3>
          <ul>
            {selected.targetMetrics.targetValue && (
              <li>
                목표값: {selected.targetMetrics.targetValue}{' '}
                {selected.targetMetrics.unit || ''}
              </li>
            )}
            {selected.targetMetrics.muscleGain && (
              <li>근육량 증가: {selected.targetMetrics.muscleGain}kg</li>
            )}
            {selected.targetMetrics.fatLoss && (
              <li>체지방 감소: {selected.targetMetrics.fatLoss}kg</li>
            )}
            {selected.targetMetrics.workoutFrequency && (
              <li>주간 운동 횟수: {selected.targetMetrics.workoutFrequency}회</li>
            )}
          </ul>
        </div>
      )}

      {selected.startDate && (
        <div className="goal-dates">
          <p>
            <strong>시작일:</strong>{' '}
            {new Date(selected.startDate).toLocaleDateString()}
          </p>
          {selected.endDate && (
            <p>
              <strong>종료일:</strong>{' '}
              {new Date(selected.endDate).toLocaleDateString()}
            </p>
          )}
          {selected.deadline && (
            <p>
              <strong>마감일:</strong>{' '}
              {new Date(selected.deadline).toLocaleDateString()}
            </p>
          )}
        </div>
      )}

      <div className="goal-actions">
        <button
          onClick={handleMarkCompleted}
          disabled={loading || selected.isCompleted}
          className="btn-complete"
        >
          {selected.isCompleted ? '완료됨' : '완료로 표시'}
        </button>
      </div>
    </div>
  )
}

function getStatusLabel(status?: string): string {
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

