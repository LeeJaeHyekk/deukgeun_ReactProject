// ============================================================================
// GoalForm - 목표 생성·수정 폼 컴포넌트
// ============================================================================

import React, { useState, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../../shared/store/hooks'
import { useAuthRedux } from '../../shared/hooks/useAuthRedux'
import { createGoal, updateGoal, selectGoal } from '../../features/goals/goalSlice'
import type { WorkoutGoal, GoalType } from '../../shared/types/goal'
import { showToast } from '../../shared/lib'

type GoalFormProps = {
  initial?: Partial<WorkoutGoal>
  onDone?: () => void
}

export function GoalForm({ initial, onDone }: GoalFormProps) {
  const dispatch = useAppDispatch()
  const { user } = useAuthRedux()
  const { loading, error } = useAppSelector((state) => state.goals)

  const [title, setTitle] = useState(initial?.goalTitle || '')
  const [type, setType] = useState<GoalType>(initial?.goalType || 'custom')
  const [targetValue, setTargetValue] = useState<number | ''>(
    initial?.targetMetrics?.targetValue ?? ''
  )
  const [unit, setUnit] = useState(initial?.targetMetrics?.unit || '회')
  const [description, setDescription] = useState(initial?.description || '')
  const [difficulty, setDifficulty] = useState<
    'beginner' | 'intermediate' | 'advanced' | ''
  >(initial?.difficulty || '')

  useEffect(() => {
    return () => {
      dispatch(selectGoal(null))
    }
  }, [dispatch])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      showToast('목표명을 입력해주세요.', 'error')
      return
    }

    if (!user?.id) {
      showToast('로그인이 필요합니다.', 'error')
      return
    }

    const payload: Partial<WorkoutGoal> = {
      goalTitle: title,
      goalType: type,
      description: description || undefined,
      difficulty: difficulty || undefined,
      targetMetrics: {
        targetValue: typeof targetValue === 'number' ? targetValue : undefined,
        unit: unit || undefined,
      },
      startDate: new Date().toISOString(),
      status: 'planned',
      userId: user.id,
    }

    try {
      if (initial?.goalId) {
        await dispatch(
          updateGoal({
            goalId: initial.goalId,
            payload,
          })
        ).unwrap()
        showToast('목표가 수정되었습니다.', 'success')
      } else {
        await dispatch(createGoal(payload)).unwrap()
        showToast('목표가 생성되었습니다.', 'success')
      }
      onDone?.()
    } catch (err: any) {
      showToast(err?.message || '목표 저장에 실패했습니다.', 'error')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="goal-form">
      <div className="form-group">
        <label htmlFor="goal-title">목표명 *</label>
        <input
          id="goal-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="예: 주 3회 운동하기"
          required
          disabled={loading}
        />
      </div>

      <div className="form-group">
        <label htmlFor="goal-type">유형</label>
        <select
          id="goal-type"
          value={type}
          onChange={(e) => setType(e.target.value as GoalType)}
          disabled={loading}
        >
          <option value="custom">커스텀</option>
          <option value="strength">근력</option>
          <option value="endurance">지구력</option>
          <option value="weight">체중</option>
          <option value="muscle_gain">근육량 증가</option>
          <option value="fat_loss">체지방 감소</option>
          <option value="frequency">운동 빈도</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="goal-target-value">목표값</label>
        <div className="input-group">
          <input
            id="goal-target-value"
            type="number"
            value={targetValue}
            onChange={(e) =>
              setTargetValue(e.target.value === '' ? '' : Number(e.target.value))
            }
            placeholder="0"
            disabled={loading}
          />
          <input
            type="text"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            placeholder="회"
            disabled={loading}
            style={{ width: '80px' }}
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="goal-description">설명</label>
        <textarea
          id="goal-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="목표에 대한 자세한 설명을 입력하세요"
          rows={3}
          disabled={loading}
        />
      </div>

      <div className="form-group">
        <label htmlFor="goal-difficulty">난이도</label>
        <select
          id="goal-difficulty"
          value={difficulty}
          onChange={(e) =>
            setDifficulty(
              e.target.value as 'beginner' | 'intermediate' | 'advanced' | ''
            )
          }
          disabled={loading}
        >
          <option value="">선택 안함</option>
          <option value="beginner">초급</option>
          <option value="intermediate">중급</option>
          <option value="advanced">고급</option>
        </select>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="form-actions">
        <button type="submit" disabled={loading}>
          {loading ? '저장 중...' : initial?.goalId ? '수정' : '생성'}
        </button>
        {onDone && (
          <button type="button" onClick={onDone} disabled={loading}>
            취소
          </button>
        )}
      </div>
    </form>
  )
}

