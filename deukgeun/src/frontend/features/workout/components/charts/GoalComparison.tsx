import React from "react"
import { WorkoutGoalDTO } from "../../types"

interface GoalComparisonProps {
  goals: WorkoutGoalDTO[]
  title?: string
  showProgress?: boolean
  showDeadlines?: boolean
  layout?: "vertical" | "horizontal"
}

export function GoalComparison({
  goals,
  title = "목표 달성 현황",
  showProgress = true,
  showDeadlines = true,
  layout = "vertical",
}: GoalComparisonProps) {
  if (!goals || goals.length === 0) {
    return (
      <div className="chart-container">
        <div className="chart-empty">
          <div className="empty-icon">🎯</div>
          <p>설정된 목표가 없습니다</p>
        </div>
      </div>
    )
  }

  const getGoalIcon = (type: string) => {
    switch (type) {
      case "weight":
        return "🏋️"
      case "reps":
        return "💪"
      case "duration":
        return "⏱️"
      case "frequency":
        return "📅"
      case "streak":
        return "🔥"
      default:
        return "🎯"
    }
  }

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return "#10b981" // green-500
    if (percentage >= 80) return "#3b82f6" // blue-500
    if (percentage >= 60) return "#f59e0b" // amber-500
    if (percentage >= 40) return "#f97316" // orange-500
    return "#ef4444" // red-500
  }

  const getProgressStatus = (percentage: number) => {
    if (percentage >= 100) return "달성 완료"
    if (percentage >= 80) return "거의 완료"
    if (percentage >= 60) return "진행 중"
    if (percentage >= 40) return "시작됨"
    return "시작 필요"
  }

  const getDaysUntilDeadline = (deadline?: string) => {
    if (!deadline) return null
    const deadlineDate = new Date(deadline)
    const today = new Date()
    const diffTime = deadlineDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const formatDeadline = (deadline?: string) => {
    if (!deadline) return null
    return new Date(deadline).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const sortedGoals = [...goals].sort((a, b) => {
    const aProgress = (a.currentValue / a.targetValue) * 100
    const bProgress = (b.currentValue / b.targetValue) * 100
    return bProgress - aProgress
  })

  return (
    <div className={`goal-comparison ${layout}`}>
      {title && <h3 className="goal-title">{title}</h3>}

      <div className="goals-container">
        {sortedGoals.map((goal, index) => {
          const progress = (goal.currentValue / goal.targetValue) * 100
          const progressColor = getProgressColor(progress)
          const progressStatus = getProgressStatus(progress)
          const daysUntilDeadline = getDaysUntilDeadline(goal.deadline)
          const formattedDeadline = formatDeadline(goal.deadline)
          const goalIcon = getGoalIcon(goal.type)

          return (
            <div key={goal.id} className="goal-item">
              <div className="goal-header">
                <div className="goal-icon">{goalIcon}</div>
                <div className="goal-info">
                  <h4 className="goal-name">{goal.title}</h4>
                  {goal.description && (
                    <p className="goal-description">{goal.description}</p>
                  )}
                </div>
                <div className="goal-status">
                  {goal.isCompleted ? (
                    <span className="status-completed">✅ 완료</span>
                  ) : (
                    <span
                      className="status-progress"
                      style={{ color: progressColor }}
                    >
                      {progressStatus}
                    </span>
                  )}
                </div>
              </div>

              <div className="goal-progress">
                <div className="progress-info">
                  <span className="progress-text">
                    {goal.currentValue} / {goal.targetValue} {goal.unit}
                  </span>
                  <span
                    className="progress-percentage"
                    style={{ color: progressColor }}
                  >
                    {Math.round(progress)}%
                  </span>
                </div>

                {showProgress && (
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${Math.min(progress, 100)}%`,
                        backgroundColor: progressColor,
                      }}
                    />
                  </div>
                )}
              </div>

              {showDeadlines && goal.deadline && (
                <div className="goal-deadline">
                  <span className="deadline-label">목표 기한:</span>
                  <span className="deadline-date">{formattedDeadline}</span>
                  {daysUntilDeadline !== null && (
                    <span
                      className={`deadline-countdown ${
                        daysUntilDeadline < 0
                          ? "overdue"
                          : daysUntilDeadline <= 7
                            ? "urgent"
                            : daysUntilDeadline <= 30
                              ? "warning"
                              : "normal"
                      }`}
                    >
                      {daysUntilDeadline < 0
                        ? `${Math.abs(daysUntilDeadline)}일 지남`
                        : `${daysUntilDeadline}일 남음`}
                    </span>
                  )}
                </div>
              )}

              {/* 목표 타입별 추가 정보 */}
              <div className="goal-details">
                <div className="detail-item">
                  <span className="detail-label">목표 타입:</span>
                  <span className="detail-value">
                    {goal.type === "weight" && "무게"}
                    {goal.type === "reps" && "횟수"}
                    {goal.type === "duration" && "시간"}
                    {goal.type === "frequency" && "빈도"}
                    {goal.type === "streak" && "연속"}
                  </span>
                </div>

                {goal.planId && (
                  <div className="detail-item">
                    <span className="detail-label">관련 계획:</span>
                    <span className="detail-value">계획 #{goal.planId}</span>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* 전체 목표 요약 */}
      <div className="goals-summary">
        <div className="summary-item">
          <span className="summary-label">총 목표:</span>
          <span className="summary-value">{goals.length}개</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">달성 완료:</span>
          <span className="summary-value completed">
            {goals.filter(g => g.isCompleted).length}개
          </span>
        </div>
        <div className="summary-item">
          <span className="summary-label">진행 중:</span>
          <span className="summary-value in-progress">
            {goals.filter(g => !g.isCompleted).length}개
          </span>
        </div>
        <div className="summary-item">
          <span className="summary-label">평균 진행률:</span>
          <span className="summary-value">
            {Math.round(
              goals.reduce(
                (sum, goal) =>
                  sum + (goal.currentValue / goal.targetValue) * 100,
                0
              ) / goals.length
            )}
            %
          </span>
        </div>
      </div>
    </div>
  )
}
