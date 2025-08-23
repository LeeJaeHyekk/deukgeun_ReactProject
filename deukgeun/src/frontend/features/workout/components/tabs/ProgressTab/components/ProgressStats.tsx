import React from "react"

interface ProgressStatsProps {
  stats: {
    totalSessions: number
    totalDuration: number
    totalExercises: number
    averageDuration: number
    completionRate: number
  }
}

export const ProgressStats: React.FC<ProgressStatsProps> = ({ stats }) => {
  return (
    <section className="stats-section">
      <div className="stats-grid">
        <div className="stat-card">
          <h4>총 운동 세션</h4>
          <p className="stat-value">{stats.totalSessions}개</p>
        </div>
        <div className="stat-card">
          <h4>총 운동 시간</h4>
          <p className="stat-value">{stats.totalDuration}분</p>
        </div>
        <div className="stat-card">
          <h4>총 운동 세트</h4>
          <p className="stat-value">{stats.totalExercises}개</p>
        </div>
        <div className="stat-card">
          <h4>평균 운동 시간</h4>
          <p className="stat-value">{stats.averageDuration}분</p>
        </div>
        <div className="stat-card">
          <h4>완료율</h4>
          <p className="stat-value">{stats.completionRate}%</p>
        </div>
      </div>
    </section>
  )
}
