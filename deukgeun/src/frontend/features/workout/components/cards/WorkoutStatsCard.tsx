import React from "react"
import { WorkoutStatsDTO } from "../../types"

interface WorkoutStatsCardProps {
  stats: WorkoutStatsDTO
}

export function WorkoutStatsCard({ stats }: WorkoutStatsCardProps) {
  return (
    <div className="workout-stats-card">
      <div className="card-header">
        <h3>운동 통계</h3>
      </div>

      <div className="card-content">
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-label">총 세션</span>
            <span className="stat-value">{stats.totalSessions}회</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">총 시간</span>
            <span className="stat-value">{stats.totalDuration}분</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">총 칼로리</span>
            <span className="stat-value">{stats.totalCalories}kcal</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">최장 연속</span>
            <span className="stat-value">{stats.workoutStreak}일</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">현재 연속</span>
            <span className="stat-value">{stats.workoutStreak}일</span>
          </div>
        </div>

        {stats.favoriteExercises.length > 0 && (
          <div className="favorite-exercises">
            <h4>선호 운동</h4>
            <div className="exercise-tags">
              {stats.favoriteExercises.slice(0, 3).map((exercise, index) => (
                <span key={index} className="exercise-tag">
                  {exercise.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
