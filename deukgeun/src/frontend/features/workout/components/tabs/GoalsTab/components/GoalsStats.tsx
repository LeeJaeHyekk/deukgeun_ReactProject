import React from "react"
import type { WorkoutGoal } from "@shared/types"

interface GoalsStatsProps {
  goals: WorkoutGoal[]
  totalGoals: number
  filteredCount: number
  completedCount: number
}

export const GoalsStats: React.FC<GoalsStatsProps> = ({
  goals,
  totalGoals,
  filteredCount,
  completedCount,
}) => {
  const activeGoals = goals.filter(goal => !goal.isCompleted)
  const completionRate =
    goals.length > 0 ? Math.round((completedCount / goals.length) * 100) : 0

  return (
    <div className="goals-stats">
      <div className="stat-item">
        <span className="stat-label">총 목표:</span>
        <span className="stat-value">{totalGoals}개</span>
      </div>
      <div className="stat-item">
        <span className="stat-label">표시 중:</span>
        <span className="stat-value">{filteredCount}개</span>
      </div>
      <div className="stat-item">
        <span className="stat-label">진행 중:</span>
        <span className="stat-value">{activeGoals.length}개</span>
      </div>
      <div className="stat-item">
        <span className="stat-label">달성:</span>
        <span className="stat-value">{completedCount}개</span>
      </div>
      <div className="stat-item">
        <span className="stat-label">달성률:</span>
        <span className="stat-value">{completionRate}%</span>
      </div>
    </div>
  )
}
