import React, { memo, useMemo, useCallback } from "react"
import { useTabState } from "../../../hooks/useWorkoutStore"
import { useSharedState } from "../../../hooks/useWorkoutStore"
import { ErrorBoundary, ComponentErrorFallback } from "../../../../../shared/components/ErrorBoundary"
import { GoalsContent } from "./components/GoalsContent"
import { GoalsStats } from "./components/GoalsStats"
import { useGoalsActions } from "./hooks/useGoalsActions"
import type { WorkoutGoal, GoalType } from "../../../types"
import type { GoalsTabState } from "../../../types"
import "./GoalsTab.css"

// 로깅 유틸리티
const logger = {
  info: (message: string, data?: any) => {
    if (import.meta.env.DEV) {
      console.log(`[GoalsTab] ${message}`, data || "")
    }
  },
  debug: (message: string, data?: any) => {
    if (import.meta.env.DEV) {
      console.debug(`[GoalsTab] ${message}`, data || "")
    }
  },
  warn: (message: string, data?: any) => {
    console.warn(`[GoalsTab] ${message}`, data || "")
  },
  error: (message: string, data?: any) => {
    console.error(`[GoalsTab] ${message}`, data || "")
  },
}

interface GoalsTabProps {
  goals: WorkoutGoal[]
  isLoading: boolean
  onCreateGoal: () => void
  onEditGoal: (goalId: number) => void
  onDeleteGoal: (goalId: number) => void
  selectedGoalId?: number
}

// 데이터 매핑 유틸리티 함수들
const goalDataMapper = {
  // 목표 데이터 검증 및 정규화
  validateGoal: (goal: unknown): WorkoutGoal | null => {
    if (
      typeof goal === 'object' &&
      goal !== null &&
      typeof (goal as any).id === 'number' &&
      typeof (goal as any).title === 'string' &&
      typeof (goal as any).targetValue === 'number' &&
      typeof (goal as any).currentValue === 'number'
    ) {
      return goal as WorkoutGoal
    }
    return null
  },

  // 목표 목록 정렬
  sortGoals: (goals: WorkoutGoal[], sortBy: GoalsTabState['sortBy']): WorkoutGoal[] => {
    return [...goals].sort((a, b) => {
      const progressA = (a.currentValue / a.targetValue) * 100
      const progressB = (b.currentValue / b.targetValue) * 100

      switch (sortBy) {
        case "deadline":
          if (!a.deadline && !b.deadline) return 0
          if (!a.deadline) return 1
          if (!b.deadline) return -1
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
        case "title":
          return a.title.localeCompare(b.title)
        case "progress":
          return progressB - progressA
        case "createdAt":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        default:
          return progressB - progressA
      }
    })
  },

  // 목표 통계 계산
  calculateGoalStats: (goals: WorkoutGoal[]) => {
    const totalGoals = goals.length
    const completedGoals = goals.filter(goal => goal.isCompleted).length
    const activeGoals = totalGoals - completedGoals
    const averageProgress = totalGoals > 0 
      ? goals.reduce((sum, goal) => sum + (goal.currentValue / goal.targetValue) * 100, 0) / totalGoals
      : 0

    return {
      totalGoals,
      completedGoals,
      activeGoals,
      averageProgress: Math.round(averageProgress),
      completionRate: totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0
    }
  },

  // 목표 진행률 계산
  calculateProgress: (goal: WorkoutGoal): number => {
    return Math.min((goal.currentValue / goal.targetValue) * 100, 100)
  },

  // 마감일까지 남은 일수 계산
  calculateDaysLeft: (deadline: string | undefined): number | null => {
    if (!deadline) return null
    const now = new Date().getTime()
    const deadlineTime = new Date(deadline).getTime()
    return Math.ceil((deadlineTime - now) / (1000 * 60 * 60 * 24))
  },

  // 목표 상태 분류
  categorizeGoals: (goals: WorkoutGoal[]) => {
    return {
      active: goals.filter(goal => !goal.isCompleted),
      completed: goals.filter(goal => goal.isCompleted),
      urgent: goals.filter(goal => {
        if (goal.isCompleted || !goal.deadline) return false
        const daysLeft = goalDataMapper.calculateDaysLeft(goal.deadline.toISOString())
        return daysLeft !== null && daysLeft <= 7
      }),
      warning: goals.filter(goal => {
        if (goal.isCompleted || !goal.deadline) return false
        const daysLeft = goalDataMapper.calculateDaysLeft(goal.deadline.toISOString())
        return daysLeft !== null && daysLeft > 7 && daysLeft <= 30
      })
    }
  }
}

const GoalsTab = memo(function GoalsTab({
  goals,
  isLoading,
  onCreateGoal,
  onEditGoal,
  onDeleteGoal,
  selectedGoalId,
}: GoalsTabProps) {
  const { tabState, updateTabState } = useTabState("goals")

  // 타입 캐스팅을 사용하여 GoalsTabState로 처리
  const goalsTabState = tabState as GoalsTabState

  // selectedGoalId가 변경되면 해당 목표를 선택하고 편집 모달 열기
  React.useEffect(() => {
    if (selectedGoalId && selectedGoalId !== goalsTabState.selectedGoalId) {
      updateTabState({ selectedGoalId } as GoalsTabState)
      // 약간의 지연 후 편집 모달 열기
      setTimeout(() => {
        onEditGoal(selectedGoalId)
      }, 100)
    }
  }, [selectedGoalId, goalsTabState.selectedGoalId, updateTabState, onEditGoal])

  // 초기 상태 설정 (목표가 있을 때)
  React.useEffect(() => {
    if (
      goals.length > 0 &&
      !goalsTabState.showCompleted &&
      !goalsTabState.sortBy
    ) {
      updateTabState({
        showCompleted: false,
        sortBy: "progress",
        selectedGoalId: undefined,
      } as GoalsTabState)
    }
  }, [
    goals.length,
    goalsTabState.showCompleted,
    goalsTabState.sortBy,
    updateTabState,
  ])

  // 공유 상태 훅
  const { sharedState } = useSharedState()

  const { handleDeleteGoal: deleteGoalAction } = useGoalsActions(onDeleteGoal)

  logger.info("GoalsTab 렌더링", {
    goalsCount: goals.length,
    isLoading,
    showCompleted: goalsTabState.showCompleted,
    sortBy: goalsTabState.sortBy,
    selectedGoalId: goalsTabState.selectedGoalId,
    activeGoalsCount: goals.filter(g => !g.isCompleted).length,
    completedGoalsCount: goals.filter(g => g.isCompleted).length,
  })

  // 데이터 검증 및 필터링된 목표 목록
  const { validatedGoals, filteredGoals, goalStats, categorizedGoals } = useMemo(() => {
    // 1. 데이터 검증
    const validated = goals
      .map(goal => goalDataMapper.validateGoal(goal))
      .filter((goal): goal is WorkoutGoal => goal !== null)

    // 2. 완료된 목표 필터링
    let filtered = validated
    if (!goalsTabState.showCompleted) {
      filtered = filtered.filter(goal => !goal.isCompleted)
    }

    // 3. 정렬 적용
    const sorted = goalDataMapper.sortGoals(filtered, goalsTabState.sortBy)

    // 4. 통계 계산
    const stats = goalDataMapper.calculateGoalStats(validated)
    const categorized = goalDataMapper.categorizeGoals(validated)

    logger.debug("목표 데이터 처리", {
      originalCount: goals.length,
      validatedCount: validated.length,
      filteredCount: sorted.length,
      showCompleted: goalsTabState.showCompleted,
      sortBy: goalsTabState.sortBy,
      stats
    })

    return {
      validatedGoals: validated,
      filteredGoals: sorted,
      goalStats: stats,
      categorizedGoals: categorized
    }
  }, [goals, goalsTabState.showCompleted, goalsTabState.sortBy])

  // 진행중인 목표와 완료된 목표 분리 (이미 categorizedGoals에서 계산됨)
  const activeGoals = categorizedGoals.active
  const completedGoals = categorizedGoals.completed

  // 이벤트 핸들러들을 useCallback으로 최적화
  const handleSortChange = useCallback((
    sortBy: "progress" | "deadline" | "title" | "createdAt"
  ) => {
    updateTabState({ sortBy } as GoalsTabState)
  }, [updateTabState])

  const handleShowCompletedChange = useCallback((showCompleted: boolean) => {
    updateTabState({ showCompleted } as GoalsTabState)
  }, [updateTabState])

  const handleGoalSelect = useCallback((goalId: number | null) => {
    updateTabState({ selectedGoalId: goalId } as GoalsTabState)
  }, [updateTabState])

  const handleEditGoal = useCallback((goalId: number) => {
    onEditGoal(goalId)
  }, [onEditGoal])

  const handleDeleteGoal = useCallback((goalId: number) => {
    deleteGoalAction(goalId)
  }, [deleteGoalAction])

  if (isLoading) {
    return (
      <div className="goals-tab">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>목표를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <ErrorBoundary
      fallback={
        <ComponentErrorFallback
          componentName="GoalsTab"
          onRetry={() => window.location.reload()}
        />
      }
      onError={(error: Error, errorInfo: React.ErrorInfo) => {
        logger.error("GoalsTab 에러 발생", { error, errorInfo })
      }}
    >
      <div className="goals-tab">
      {/* 간단한 헤더 */}
      <div className="goals-header">
        <div className="header-content">
          <h2>🎯 운동 목표</h2>
          <p>목표를 설정하고 진행 상황을 관리하세요</p>
        </div>
        <button className="create-goal-btn" onClick={onCreateGoal}>
          <span className="icon">+</span>새 목표
        </button>
      </div>

      {/* 간단한 컨트롤 */}
      <div className="goals-controls">
        <div className="control-section">
          <div className="sort-buttons">
            <button
              className={`sort-btn ${goalsTabState.sortBy === "progress" ? "active" : ""}`}
              onClick={() => handleSortChange("progress")}
            >
              진행률순
            </button>
            <button
              className={`sort-btn ${goalsTabState.sortBy === "deadline" ? "active" : ""}`}
              onClick={() => handleSortChange("deadline")}
            >
              마감일순
            </button>
            <button
              className={`sort-btn ${goalsTabState.sortBy === "createdAt" ? "active" : ""}`}
              onClick={() => handleSortChange("createdAt")}
            >
              최신순
            </button>
          </div>
          <button
            className={`toggle-btn ${goalsTabState.showCompleted ? "active" : ""}`}
            onClick={() =>
              handleShowCompletedChange(!goalsTabState.showCompleted)
            }
          >
            <span className="toggle-icon">
              {goalsTabState.showCompleted ? "✓" : "○"}
            </span>
            완료된 목표
          </button>
        </div>
      </div>

      {/* 진행중인 목표 섹션 (강화) */}
      {activeGoals.length > 0 && (
        <div className="active-goals-section">
          <div className="section-header">
            <h3>🔥 진행중인 목표 ({activeGoals.length}개)</h3>
            <p>현재 달성하고 있는 목표들을 확인하세요</p>
          </div>
          <div className="active-goals-grid">
            {activeGoals.map(goal => {
              const progress = goalDataMapper.calculateProgress(goal)
              const daysLeft = goalDataMapper.calculateDaysLeft(goal.deadline?.toISOString())

              return (
                <div
                  key={goal.id}
                  className={`goal-card ${goal.id === goalsTabState.selectedGoalId ? "selected" : ""}`}
                  onClick={() => handleGoalSelect(goal.id)}
                >
                  <div className="goal-header">
                    <h4>{goal.title}</h4>
                    <div className="goal-actions">
                      <button
                        className="action-btn edit"
                        onClick={e => {
                          e.stopPropagation()
                          handleEditGoal(goal.id)
                        }}
                      >
                        ✏️
                      </button>
                      <button
                        className="action-btn delete"
                        onClick={e => {
                          e.stopPropagation()
                          handleDeleteGoal(goal.id)
                        }}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  <div className="goal-progress-section">
                    <div className="progress-info">
                      <span className="progress-percentage">
                        {Math.round(progress)}%
                      </span>
                      <span className="progress-values">
                        {goal.currentValue} / {goal.targetValue} {goal.unit}
                      </span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="goal-details">
                    <div className="goal-type">
                      <span className="type-badge">{goal.type}</span>
                    </div>
                    {goal.description && (
                      <p className="goal-description">{goal.description}</p>
                    )}
                    {daysLeft !== null && (
                      <div className="deadline-info">
                        <span
                          className={`deadline-text ${daysLeft <= 7 ? "urgent" : daysLeft <= 30 ? "warning" : "normal"}`}
                        >
                          {daysLeft > 0 ? `${daysLeft}일 남음` : "마감일 지남"}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* 완료된 목표 섹션 */}
      {completedGoals.length > 0 && goalsTabState.showCompleted && (
        <div className="completed-goals-section">
          <div className="section-header">
            <h3>✅ 완료된 목표 ({completedGoals.length}개)</h3>
            <p>달성한 목표들을 확인하세요</p>
          </div>
          <div className="completed-goals-grid">
            {completedGoals.map(goal => (
              <div
                key={goal.id}
                className={`goal-card completed ${goal.id === goalsTabState.selectedGoalId ? "selected" : ""}`}
                onClick={() => handleGoalSelect(goal.id)}
              >
                <div className="goal-header">
                  <h4>{goal.title}</h4>
                  <span className="completed-badge">완료</span>
                </div>
                <div className="goal-progress-section">
                  <div className="progress-info">
                    <span className="progress-percentage">100%</span>
                    <span className="progress-values">
                      {goal.targetValue} / {goal.targetValue} {goal.unit}
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-fill completed"
                      style={{ width: "100%" }}
                    />
                  </div>
                </div>
                <div className="goal-details">
                  <div className="goal-type">
                    <span className="type-badge">{goal.type}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 목표가 없을 때 */}
      {validatedGoals.length === 0 && (
        <div className="no-goals-container">
          <div className="no-goals-icon">🎯</div>
          <h3>
            {goals.length === 0 
              ? "아직 운동 목표가 없습니다" 
              : "유효한 운동 목표가 없습니다"
            }
          </h3>
          <p>
            {goals.length === 0 
              ? "첫 번째 운동 목표를 설정해보세요!" 
              : "데이터를 확인하고 다시 시도해주세요."
            }
          </p>
          <button className="create-first-goal-btn" onClick={onCreateGoal}>
            {goals.length === 0 ? "첫 목표 설정" : "새 목표 설정"}
          </button>
        </div>
      )}

      {/* 통계 */}
      {validatedGoals.length > 0 && (
        <GoalsStats
          goals={validatedGoals}
          totalGoals={goalStats.totalGoals}
          filteredCount={filteredGoals.length}
          completedCount={goalStats.completedGoals}
        />
      )}
      </div>
    </ErrorBoundary>
  )
})

export { GoalsTab }
