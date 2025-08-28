import React from "react"
import { useTabState } from "../../../hooks/useWorkoutStore"
import { useSharedState } from "../../../hooks/useWorkoutStore"
import { GoalsContent } from "./components/GoalsContent"
import { GoalsStats } from "./components/GoalsStats"
import { useGoalsActions } from "./hooks/useGoalsActions"
import type { WorkoutGoal } from "../../../types"
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

export function GoalsTab({
  goals,
  isLoading,
  onCreateGoal,
  onEditGoal,
  onDeleteGoal,
  selectedGoalId,
}: GoalsTabProps) {
  const { tabState, updateTabState } = useTabState("goals")

  // 공유 상태 훅
  const { sharedState } = useSharedState()

  const { handleDeleteGoal } = useGoalsActions(onDeleteGoal)

  logger.info("GoalsTab 렌더링", {
    goalsCount: goals.length,
    isLoading,
    showCompleted: tabState.showCompleted,
    sortBy: tabState.sortBy,
    selectedGoalId: tabState.selectedGoalId,
    activeGoalsCount: goals.filter(g => !g.isCompleted).length,
    completedGoalsCount: goals.filter(g => g.isCompleted).length,
  })

  // 필터링된 목표 목록
  const filteredGoals = React.useMemo(() => {
    let filtered = goals

    // 완료된 목표 필터링
    if (!tabState.showCompleted) {
      filtered = filtered.filter(goal => !goal.isCompleted)
    }

    // 정렬 (진행률 높은 순으로 기본 정렬)
    filtered.sort((a, b) => {
      const progressA = (a.currentValue / a.targetValue) * 100
      const progressB = (b.currentValue / b.targetValue) * 100

      switch (tabState.sortBy) {
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
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
        default:
          // 기본값: 진행률 높은 순
          return progressB - progressA
      }
    })

    return filtered
  }, [goals, tabState.showCompleted, tabState.sortBy])

  // 진행중인 목표와 완료된 목표 분리
  const activeGoals = filteredGoals.filter(goal => !goal.isCompleted)
  const completedGoals = filteredGoals.filter(goal => goal.isCompleted)

  const handleSortChange = (sortBy: string) => {
    updateTabState({ sortBy })
  }

  const handleShowCompletedChange = (showCompleted: boolean) => {
    updateTabState({ showCompleted })
  }

  const handleGoalSelect = (goalId: number | null) =>
    updateTabState({ selectedGoalId: goalId })

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
              className={`sort-btn ${tabState.sortBy === "progress" ? "active" : ""}`}
              onClick={() => handleSortChange("progress")}
            >
              진행률순
            </button>
            <button
              className={`sort-btn ${tabState.sortBy === "deadline" ? "active" : ""}`}
              onClick={() => handleSortChange("deadline")}
            >
              마감일순
            </button>
            <button
              className={`sort-btn ${tabState.sortBy === "createdAt" ? "active" : ""}`}
              onClick={() => handleSortChange("createdAt")}
            >
              최신순
            </button>
          </div>
          <button
            className={`toggle-btn ${tabState.showCompleted ? "active" : ""}`}
            onClick={() => handleShowCompletedChange(!tabState.showCompleted)}
          >
            <span className="toggle-icon">
              {tabState.showCompleted ? "✓" : "○"}
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
              const progress = (goal.currentValue / goal.targetValue) * 100
              const daysLeft = goal.deadline
                ? Math.ceil(
                    (new Date(goal.deadline).getTime() - new Date().getTime()) /
                      (1000 * 60 * 60 * 24)
                  )
                : null

              return (
                <div
                  key={goal.id}
                  className={`goal-card ${goal.id === tabState.selectedGoalId ? "selected" : ""}`}
                  onClick={() => handleGoalSelect(goal.id)}
                >
                  <div className="goal-header">
                    <h4>{goal.title}</h4>
                    <div className="goal-actions">
                      <button
                        className="action-btn edit"
                        onClick={e => {
                          e.stopPropagation()
                          onEditGoal(goal.id)
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
      {completedGoals.length > 0 && tabState.showCompleted && (
        <div className="completed-goals-section">
          <div className="section-header">
            <h3>✅ 완료된 목표 ({completedGoals.length}개)</h3>
            <p>달성한 목표들을 확인하세요</p>
          </div>
          <div className="completed-goals-grid">
            {completedGoals.map(goal => (
              <div
                key={goal.id}
                className={`goal-card completed ${goal.id === tabState.selectedGoalId ? "selected" : ""}`}
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
      {goals.length === 0 && (
        <div className="no-goals-container">
          <div className="no-goals-icon">🎯</div>
          <h3>아직 운동 목표가 없습니다</h3>
          <p>첫 번째 운동 목표를 설정해보세요!</p>
          <button className="create-first-goal-btn" onClick={onCreateGoal}>
            첫 목표 설정
          </button>
        </div>
      )}

      {/* 통계 */}
      {goals.length > 0 && (
        <GoalsStats
          goals={goals}
          totalGoals={goals.length}
          filteredCount={filteredGoals.length}
          completedCount={goals.filter(goal => goal.isCompleted).length}
        />
      )}
    </div>
  )
}
