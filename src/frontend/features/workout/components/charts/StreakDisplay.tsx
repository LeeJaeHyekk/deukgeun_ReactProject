import React from "react"

interface StreakData {
  currentStreak: number
  longestStreak: number
  startDate: string
  lastWorkoutDate?: string
  weeklyGoal: number
  weeklyProgress: number
}

interface StreakDisplayProps {
  data: StreakData
  title?: string
  showDetails?: boolean
  size?: "small" | "medium" | "large"
}

export function StreakDisplay({
  data,
  title = "연속 운동",
  showDetails = true,
  size = "medium",
}: StreakDisplayProps) {
  const {
    currentStreak,
    longestStreak,
    startDate,
    lastWorkoutDate,
    weeklyGoal,
    weeklyProgress,
  } = data

  const getStreakEmoji = (streak: number) => {
    if (streak >= 30) return "🔥🔥🔥"
    if (streak >= 20) return "🔥🔥"
    if (streak >= 10) return "🔥"
    if (streak >= 5) return "💪"
    if (streak >= 3) return "👍"
    return "🎯"
  }

  const getStreakColor = (streak: number) => {
    if (streak >= 30) return "#dc2626" // red-600
    if (streak >= 20) return "#ea580c" // orange-600
    if (streak >= 10) return "#d97706" // amber-600
    if (streak >= 5) return "#059669" // emerald-600
    if (streak >= 3) return "#3b82f6" // blue-500
    return "#6b7280" // gray-500
  }

  const getSizeClasses = () => {
    switch (size) {
      case "small":
        return {
          container: "streak-display small",
          number: "text-2xl",
          label: "text-sm",
          emoji: "text-lg",
        }
      case "large":
        return {
          container: "streak-display large",
          number: "text-6xl",
          label: "text-lg",
          emoji: "text-4xl",
        }
      default:
        return {
          container: "streak-display medium",
          number: "text-4xl",
          label: "text-base",
          emoji: "text-2xl",
        }
    }
  }

  const sizeClasses = getSizeClasses()
  const streakEmoji = getStreakEmoji(currentStreak)
  const streakColor = getStreakColor(currentStreak)
  const weeklyProgressPercentage = Math.min(
    (weeklyProgress / weeklyGoal) * 100,
    100
  )

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ko-KR", {
      month: "short",
      day: "numeric",
    })
  }

  const getDaysSinceLastWorkout = () => {
    if (!lastWorkoutDate) return 0
    const lastWorkout = new Date(lastWorkoutDate)
    const today = new Date()
    const diffTime = Math.abs(today.getTime() - lastWorkout.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  const daysSinceLastWorkout = getDaysSinceLastWorkout()

  return (
    <div className={sizeClasses.container}>
      {title && <h3 className="streak-title">{title}</h3>}

      <div className="streak-main">
        <div className="streak-current">
          <div className="streak-number" style={{ color: streakColor }}>
            {currentStreak}
          </div>
          <div className="streak-emoji">{streakEmoji}</div>
          <div className="streak-label">일 연속</div>
        </div>

        {showDetails && (
          <div className="streak-details">
            <div className="streak-record">
              <span className="record-label">최고 기록:</span>
              <span className="record-value">{longestStreak}일</span>
            </div>

            {daysSinceLastWorkout > 0 && (
              <div className="streak-warning">
                <span className="warning-text">
                  마지막 운동: {daysSinceLastWorkout}일 전
                </span>
              </div>
            )}

            <div className="weekly-progress">
              <div className="progress-header">
                <span className="progress-label">이번 주 목표</span>
                <span className="progress-value">
                  {weeklyProgress}/{weeklyGoal}회
                </span>
              </div>
              <div className="progress-bar-container">
                <div
                  className="progress-bar-fill"
                  style={{ width: `${weeklyProgressPercentage}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {showDetails && (
        <div className="streak-info">
          <div className="info-item">
            <span className="info-label">시작일:</span>
            <span className="info-value">{formatDate(startDate)}</span>
          </div>
          {lastWorkoutDate && (
            <div className="info-item">
              <span className="info-label">마지막 운동:</span>
              <span className="info-value">{formatDate(lastWorkoutDate)}</span>
            </div>
          )}
        </div>
      )}

      {/* 연속 운동 달성 배지 */}
      {currentStreak > 0 && (
        <div className="streak-badges">
          {currentStreak >= 3 && (
            <div className="streak-badge bronze">3일 연속</div>
          )}
          {currentStreak >= 7 && (
            <div className="streak-badge silver">1주 연속</div>
          )}
          {currentStreak >= 14 && (
            <div className="streak-badge gold">2주 연속</div>
          )}
          {currentStreak >= 30 && (
            <div className="streak-badge diamond">1개월 연속</div>
          )}
          {currentStreak >= 100 && (
            <div className="streak-badge legendary">100일 연속</div>
          )}
        </div>
      )}
    </div>
  )
}
