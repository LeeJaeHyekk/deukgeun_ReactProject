import React from "react"
import { WorkoutPlan } from "../../../../shared/api/workoutJournalApi"
import { WorkoutPlanCard } from "../../components/cards/WorkoutPlanCard"
import { useWorkoutPlans } from "../../hooks/useWorkoutPlans"

interface PlansTabProps {
  plans: WorkoutPlan[]
  isLoading: boolean
  onCreatePlan: () => void
  onEditPlan: (planId: number) => void
  onStartSession: (planId: number) => void
  onDeletePlan: () => void
}

export function PlansTab({
  plans,
  isLoading,
  onCreatePlan,
  onEditPlan,
  onStartSession,
  onDeletePlan,
}: PlansTabProps) {
  const { deletePlan } = useWorkoutPlans()

  const handleDeletePlan = async (planId: number) => {
    try {
      await deletePlan(planId)
      onDeletePlan()
    } catch (error) {
      console.error("계획 삭제 실패:", error)
    }
  }

  if (isLoading) {
    return (
      <div className="plans-tab">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>계획을 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="plans-tab">
      <div className="plans-header">
        <h2>운동 계획</h2>
        <button
          className="create-plan-btn"
          onClick={onCreatePlan}
          aria-label="새 운동 계획 만들기"
        >
          <span className="icon">+</span>새 계획 만들기
        </button>
      </div>

      <div className="plans-content">
        {plans.length === 0 ? (
          <div className="no-plans-container">
            <div className="no-plans-icon">📋</div>
            <h3>아직 운동 계획이 없습니다</h3>
            <p>첫 번째 운동 계획을 만들어보세요!</p>
            <button className="create-first-plan-btn" onClick={onCreatePlan}>
              첫 계획 만들기
            </button>
          </div>
        ) : (
          <div className="plans-grid">
            {plans.map(plan => (
              <WorkoutPlanCard
                key={plan.id}
                plan={plan}
                onEdit={() => onEditPlan(plan.id)}
                onStartSession={() => onStartSession(plan.id)}
                onDelete={() => handleDeletePlan(plan.id)}
              />
            ))}
          </div>
        )}
      </div>

      {plans.length > 0 && (
        <div className="plans-stats">
          <div className="stat-item">
            <span className="stat-label">총 계획:</span>
            <span className="stat-value">{plans.length}개</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">활성 계획:</span>
            <span className="stat-value">
              {plans.filter(plan => plan.isActive).length}개
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
