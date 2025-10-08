import React from "react"
import "./StreakDisplay.css"

interface StreakDisplayProps {
  currentStreak: number
  longestStreak: number
}

export function StreakDisplay({
  currentStreak,
  longestStreak,
}: StreakDisplayProps) {
  return (
    <div className="streak-display">
      <h3>스트릭</h3>
      <div className="streak-info">
        <div className="streak-item current">
          <span className="streak-label">현재 스트릭</span>
          <span className="streak-value">{currentStreak}일</span>
        </div>
        <div className="streak-item longest">
          <span className="streak-label">최장 스트릭</span>
          <span className="streak-value">{longestStreak}일</span>
        </div>
      </div>
      <div className="streak-progress">
        <div
          className="streak-bar"
          style={{
            width: `${Math.min((currentStreak / Math.max(longestStreak, 1)) * 100, 100)}%`,
          }}
        />
      </div>
    </div>
  )
}
