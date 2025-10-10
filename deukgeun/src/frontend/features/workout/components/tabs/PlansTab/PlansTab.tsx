import React, { memo, useMemo, useCallback } from "react"
import { useTabState } from "../../../hooks/useWorkoutStore"
import { ErrorBoundary, ComponentErrorFallback } from "../../../../../shared/components/ErrorBoundary"
import type { WorkoutPlan, WorkoutPlanExercise } from "../../../types"
import type { PlansTabState } from "../../../types"
import "./PlansTab.css"

// 로깅 유틸리티
const logger = {
  info: (message: string, data?: any) => {
    if (import.meta.env.DEV) {
      console.log(`[PlansTab] ${message}`, data || "")
    }
  },
  debug: (message: string, data?: any) => {
    if (import.meta.env.DEV) {
      console.debug(`[PlansTab] ${message}`, data || "")
    }
  },
  warn: (message: string, data?: any) => {
    console.warn(`[PlansTab] ${message}`, data || "")
  },
  error: (message: string, data?: any) => {
    console.error(`[PlansTab] ${message}`, data || "")
  },
}

interface PlansTabProps {
  plans: WorkoutPlan[]
  isLoading: boolean
  onCreatePlan: () => void
  onEditPlan: (planId: number) => void
  onDeletePlan: (planId: number) => void
  selectedPlanId?: number
}

// 데이터 매핑 유틸리티 함수들
const planDataMapper = {
  // 운동 계획 데이터 검증 및 정규화
  validatePlan: (plan: unknown): WorkoutPlan | null => {
    if (
      typeof plan === 'object' &&
      plan !== null &&
      typeof (plan as any).id === 'number' &&
      typeof (plan as any).name === 'string' &&
      typeof (plan as any).createdAt === 'string'
    ) {
      return plan as WorkoutPlan
    }
    return null
  },

  // 운동 데이터 검증
  validateExercise: (exercise: unknown): WorkoutPlanExercise | null => {
    if (
      typeof exercise === 'object' &&
      exercise !== null &&
      typeof (exercise as any).exerciseName === 'string' &&
      typeof (exercise as any).sets === 'number'
    ) {
      return exercise as WorkoutPlanExercise
    }
    return null
  },

  // 계획 목록 정렬
  sortPlans: (plans: WorkoutPlan[], sortBy: PlansTabState['sortBy']): WorkoutPlan[] => {
    return [...plans].sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name)
        case "createdAt":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case "difficulty":
          return a.difficulty.localeCompare(b.difficulty)
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
    })
  },

  // 계획 통계 계산
  calculatePlanStats: (plan: WorkoutPlan) => {
    const totalExercises = plan.exercises?.length || 0
    const totalSets = plan.exercises?.reduce((sum, exercise) => sum + (exercise.sets || 0), 0) || 0
    const estimatedDuration = plan.estimatedDurationMinutes || 0
    
    return {
      totalExercises,
      totalSets,
      estimatedDuration,
      hasExercises: totalExercises > 0
    }
  },

  // 운동 미리보기 생성
  generateExercisePreview: (exercises: WorkoutPlanExercise[] | undefined, maxItems: number = 3) => {
    if (!exercises || exercises.length === 0) {
      return []
    }

    return exercises.slice(0, maxItems).map((exercise, index) => ({
      id: index,
      name: exercise.exerciseName,
      sets: exercise.sets,
      reps: exercise.repsRange ? `${exercise.repsRange.min}-${exercise.repsRange.max}` : 'N/A'
    }))
  }
}

const PlansTab = memo(function PlansTab({
  plans,
  isLoading,
  onCreatePlan,
  onEditPlan,
  onDeletePlan,
  selectedPlanId,
}: PlansTabProps) {
  const { tabState, updateTabState } = useTabState("plans")

  // 타입 캐스팅을 사용하여 PlansTabState로 처리
  const plansTabState = tabState as PlansTabState

  logger.info("PlansTab 렌더링", {
    plansCount: plans.length,
    isLoading,
    selectedPlanId: plansTabState.selectedPlanId,
  })

  // 데이터 검증 및 필터링된 계획 목록
  const { validatedPlans, filteredPlans } = useMemo(() => {
    // 1. 데이터 검증
    const validated = plans
      .map(plan => planDataMapper.validatePlan(plan))
      .filter((plan): plan is WorkoutPlan => plan !== null)

    // 2. 정렬 적용
    const sorted = planDataMapper.sortPlans(validated, plansTabState.sortBy)

    logger.debug("계획 데이터 처리", {
      originalCount: plans.length,
      validatedCount: validated.length,
      sortBy: plansTabState.sortBy
    })

    return {
      validatedPlans: validated,
      filteredPlans: sorted
    }
  }, [plans, plansTabState.sortBy])

  // 이벤트 핸들러들을 useCallback으로 최적화
  const handleSortChange = useCallback((
    sortBy: "name" | "createdAt" | "difficulty"
  ) => {
    updateTabState({ sortBy } as PlansTabState)
  }, [updateTabState])

  const handlePlanSelect = useCallback((planId: number | null) => {
    updateTabState({ selectedPlanId: planId } as PlansTabState)
  }, [updateTabState])

  const handleEditPlan = useCallback((planId: number) => {
    onEditPlan(planId)
  }, [onEditPlan])

  const handleDeletePlan = useCallback((planId: number) => {
    onDeletePlan(planId)
  }, [onDeletePlan])

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
    <ErrorBoundary
      fallback={
        <ComponentErrorFallback
          componentName="PlansTab"
          onRetry={() => window.location.reload()}
        />
      }
      onError={(error: Error, errorInfo: React.ErrorInfo) => {
        logger.error("PlansTab 에러 발생", { error, errorInfo })
      }}
    >
      <div className="plans-tab">
      {/* 헤더 */}
      <div className="plans-header">
        <div className="header-content">
          <h2>📋 운동 계획</h2>
          <p>운동 계획을 만들고 관리하세요</p>
        </div>
        <button className="create-plan-btn" onClick={onCreatePlan}>
          <span className="icon">+</span>새 계획
        </button>
      </div>

      {/* 컨트롤 */}
      <div className="plans-controls">
        <div className="control-section">
          <div className="sort-buttons">
            <button
              className={`sort-btn ${plansTabState.sortBy === "createdAt" ? "active" : ""}`}
              onClick={() => handleSortChange("createdAt")}
            >
              최신순
            </button>
            <button
              className={`sort-btn ${plansTabState.sortBy === "name" ? "active" : ""}`}
              onClick={() => handleSortChange("name")}
            >
              이름순
            </button>
            <button
              className={`sort-btn ${plansTabState.sortBy === "difficulty" ? "active" : ""}`}
              onClick={() => handleSortChange("difficulty")}
            >
              난이도순
            </button>
          </div>
        </div>
      </div>

      {/* 계획 목록 */}
      {filteredPlans.length > 0 && (
        <div className="plans-section">
          <div className="plans-grid">
            {filteredPlans.map(plan => (
              <div
                key={plan.id}
                className={`plan-card ${plan.id === plansTabState.selectedPlanId ? "selected" : ""}`}
                onClick={() => handlePlanSelect(plan.id)}
              >
                <div className="plan-header">
                  <h4>{plan.name}</h4>
                  <div className="plan-actions">
                    <button
                      className="action-btn edit"
                      onClick={e => {
                        e.stopPropagation()
                        handleEditPlan(plan.id)
                      }}
                    >
                      ✏️
                    </button>
                    <button
                      className="action-btn delete"
                      onClick={e => {
                        e.stopPropagation()
                        handleDeletePlan(plan.id)
                      }}
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                <div className="plan-content">
                  {plan.description && (
                    <p className="plan-description">{plan.description}</p>
                  )}
                  
                  {(() => {
                    const stats = planDataMapper.calculatePlanStats(plan)
                    return (
                      <div className="plan-details">
                        <div className="detail-item">
                          <span className="detail-label">예상 시간:</span>
                          <span className="detail-value">{stats.estimatedDuration}분</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">운동 수:</span>
                          <span className="detail-value">{stats.totalExercises}개</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">총 세트:</span>
                          <span className="detail-value">{stats.totalSets}세트</span>
                        </div>
                      </div>
                    )
                  })()}

                  {(() => {
                    const exercisePreview = planDataMapper.generateExercisePreview(plan.exercises, 3)
                    if (exercisePreview.length > 0) {
                      return (
                        <div className="exercises-preview">
                          <h5>포함된 운동:</h5>
                          <ul>
                            {exercisePreview.map((exercise) => (
                              <li key={exercise.id}>
                                {exercise.name} ({exercise.sets}세트 x {exercise.reps})
                              </li>
                            ))}
                            {plan.exercises && plan.exercises.length > 3 && (
                              <li>...외 {plan.exercises.length - 3}개</li>
                            )}
                          </ul>
                        </div>
                      )
                    }
                    return null
                  })()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 계획이 없을 때 */}
      {validatedPlans.length === 0 && (
        <div className="no-plans-container">
          <div className="no-plans-icon">📋</div>
          <h3>
            {plans.length === 0 
              ? "아직 운동 계획이 없습니다" 
              : "유효한 운동 계획이 없습니다"
            }
          </h3>
          <p>
            {plans.length === 0 
              ? "첫 번째 운동 계획을 만들어보세요!" 
              : "데이터를 확인하고 다시 시도해주세요."
            }
          </p>
          <button className="create-first-plan-btn" onClick={onCreatePlan}>
            {plans.length === 0 ? "첫 계획 만들기" : "새 계획 만들기"}
          </button>
        </div>
      )}
      </div>
    </ErrorBoundary>
  )
})

export { PlansTab }
