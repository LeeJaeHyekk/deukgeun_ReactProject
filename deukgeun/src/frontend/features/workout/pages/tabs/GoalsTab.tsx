import React from "react"
import { WorkoutGoal } from "../../../../../types"
import { GoalProgressBar } from "../../components/cards/GoalProgressBar"
import { useWorkoutGoals } from "../../hooks/useWorkoutGoals"

interface GoalsTabProps {
  goals: WorkoutGoal[]
  isLoading: boolean
  onCreateGoal: () => void
  onEditGoal: (goalId: number) => void
  onDeleteGoal: () => void
}

export function GoalsTab({
  goals,
  isLoading,
  onCreateGoal,
  onEditGoal,
  onDeleteGoal,
}: GoalsTabProps) {
  const { deleteGoal } = useWorkoutGoals()

  const handleDeleteGoal = async (goalId: number) => {
    try {
      await deleteGoal(goalId)
      onDeleteGoal()
    } catch (error) {
      console.error("목표 삭제 실패:", error)
    }
  }

  const activeGoals = goals.filter(goal => !goal.isCompleted)
  const completedGoals = goals.filter(goal => goal.isCompleted)

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
      <div className="goals-header">
        <h2>운동 목표</h2>
        <button
          className="create-goal-btn"
          onClick={onCreateGoal}
          aria-label="새 운동 목표 만들기"
        >
          <span className="icon">🎯</span>새 목표 만들기
        </button>
      </div>

      <div className="goals-content">
        {goals.length === 0 ? (
          <div className="no-goals-container">
            <div className="no-goals-icon">🎯</div>
            <h3>아직 운동 목표가 없습니다</h3>
            <p>첫 번째 운동 목표를 설정해보세요!</p>
            <button className="create-first-goal-btn" onClick={onCreateGoal}>
              첫 목표 설정
            </button>
          </div>
        ) : (
          <>
            {/* 활성 목표 섹션 */}
            <section className="active-goals-section">
              <h3>진행 중인 목표 ({activeGoals.length})</h3>
              {activeGoals.length > 0 ? (
                <div className="goals-grid">
                  {activeGoals.map(goal => (
                    <GoalProgressBar
                      key={goal.id}
                      goal={goal}
                      onEdit={() => onEditGoal(goal.id)}
                      onDelete={() => handleDeleteGoal(goal.id)}
                    />
                  ))}
                </div>
              ) : (
                <div className="no-active-goals">
                  <p>진행 중인 목표가 없습니다</p>
                </div>
              )}
            </section>

            {/* 완료된 목표 섹션 */}
            {completedGoals.length > 0 && (
              <section className="completed-goals-section">
                <h3>달성한 목표 ({completedGoals.length})</h3>
                <div className="completed-goals-grid">
                  {completedGoals.map(goal => (
                    <div key={goal.id} className="completed-goal-card">
                      <div className="goal-header">
                        <h4>{goal.title}</h4>
                        <span className="completion-date">
                          {new Date(
                            goal.completedAt || ""
                          ).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="goal-details">
                        <p>
                          목표: {goal.targetValue} {goal.unit}
                        </p>
                        <p>
                          달성: {goal.currentValue} {goal.unit}
                        </p>
                      </div>
                      <div className="goal-progress">
                        <div className="progress-bar">
                          <div
                            className="progress-fill completed"
                            style={{ width: "100%" }}
                          ></div>
                        </div>
                        <span className="progress-text">100% 완료</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>

      {goals.length > 0 && (
        <div className="goals-stats">
          <div className="stat-item">
            <span className="stat-label">총 목표:</span>
            <span className="stat-value">{goals.length}개</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">진행 중:</span>
            <span className="stat-value">{activeGoals.length}개</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">달성:</span>
            <span className="stat-value">{completedGoals.length}개</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">달성률:</span>
            <span className="stat-value">
              {goals.length > 0
                ? Math.round((completedGoals.length / goals.length) * 100)
                : 0}
              %
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
