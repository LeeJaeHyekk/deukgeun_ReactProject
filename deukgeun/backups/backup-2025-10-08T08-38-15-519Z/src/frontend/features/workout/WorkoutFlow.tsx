import React from 'react'
import { useAuth } from '@frontend/shared/hooks/useAuth'
import { useWorkoutPlans } from './hooks/useWorkoutPlans'
import { useWorkoutSessions } from './hooks/useWorkoutSessions'

export default function WorkoutFlow() {
  const { user, isLoggedIn } = useAuth()
  const { plans, loading, error } = useWorkoutPlans()
  const { sessions } = useWorkoutSessions()

  if (!isLoggedIn) {
    return <div>로그인이 필요합니다.</div>
  }

  if (loading) {
    return <div>로딩 중...</div>
  }

  if (error) {
    return <div>{error}</div>
  }

  if (plans.length === 0) {
    return <div>운동 계획이 없습니다.</div>
  }

  return (
    <div>
      <h1>운동 플로우</h1>
      <div>
        <button>새 계획 만들기</button>
        <button>운동 시작</button>
      </div>
      <div>
        {plans.map(plan => (
          <div key={plan.id}>
            <h3>{plan.name}</h3>
            <p>{plan.description}</p>
            <button>운동 시작</button>
          </div>
        ))}
      </div>
      <div>
        <button>일시정지</button>
        <button>재개</button>
        <button>운동 완료</button>
      </div>
      <div>
        <button>세트 추가</button>
        <button>세트 완료</button>
        <button>세트 저장</button>
      </div>
      <div>
        <span>운동 1</span>
        <span>50kg x 10회</span>
      </div>
      <div>
        <span>운동 완료!</span>
        <span>운동 기록이 저장되었습니다.</span>
      </div>
    </div>
  )
}
