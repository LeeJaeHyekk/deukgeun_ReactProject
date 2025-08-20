import React, { useState, useEffect } from "react"
import { ProgressChart } from "../../components/charts/ProgressChart"
import { WorkoutCalendar } from "../../components/charts/WorkoutCalendar"
import { WorkoutSession } from "../../../../shared/api/workoutJournalApi"

interface ProgressTabProps {
  sessions: WorkoutSession[]
  isLoading: boolean
  onViewSession: (sessionId: number) => void
}

type ChartType = "weekly" | "monthly" | "yearly"
type TimeRange = "7days" | "30days" | "90days" | "1year"

export function ProgressTab({
  sessions,
  isLoading,
  onViewSession,
}: ProgressTabProps) {
  const [selectedChartType, setSelectedChartType] =
    useState<ChartType>("weekly")
  const [selectedTimeRange, setSelectedTimeRange] =
    useState<TimeRange>("30days")

  // 차트 데이터 계산
  const getChartData = () => {
    if (!sessions || sessions.length === 0) return []

    const now = new Date()
    const filteredSessions = sessions.filter(session => {
      const sessionDate = new Date(session.createdAt)
      const diffTime = now.getTime() - sessionDate.getTime()
      const diffDays = diffTime / (1000 * 60 * 60 * 24)

      switch (selectedTimeRange) {
        case "7days":
          return diffDays <= 7
        case "30days":
          return diffDays <= 30
        case "90days":
          return diffDays <= 90
        case "1year":
          return diffDays <= 365
        default:
          return true
      }
    })

    // 날짜별로 그룹화
    const groupedData = filteredSessions.reduce(
      (acc, session) => {
        const date = new Date(session.createdAt).toLocaleDateString()
        if (!acc[date]) {
          acc[date] = {
            date,
            duration: 0,
            sessions: 0,
            exercises: 0,
          }
        }
        acc[date].duration += session.duration || 0
        acc[date].sessions += 1
        acc[date].exercises += session.exerciseSets?.length || 0
        return acc
      },
      {} as Record<string, any>
    )

    return Object.values(groupedData).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    )
  }

  // 통계 계산
  const getStats = () => {
    if (!sessions || sessions.length === 0) {
      return {
        totalSessions: 0,
        totalDuration: 0,
        totalExercises: 0,
        averageDuration: 0,
        completionRate: 0,
      }
    }

    const completedSessions = sessions.filter(s => s.status === "completed")
    const totalDuration = sessions.reduce(
      (sum, s) => sum + (s.duration || 0),
      0
    )
    const totalExercises = sessions.reduce(
      (sum, s) => sum + (s.exerciseSets?.length || 0),
      0
    )

    return {
      totalSessions: sessions.length,
      totalDuration,
      totalExercises,
      averageDuration:
        sessions.length > 0 ? Math.round(totalDuration / sessions.length) : 0,
      completionRate:
        sessions.length > 0
          ? Math.round((completedSessions.length / sessions.length) * 100)
          : 0,
    }
  }

  const chartData = getChartData()
  const stats = getStats()

  if (isLoading) {
    return (
      <div className="progress-tab">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>진행 상황을 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="progress-tab">
      <div className="progress-header">
        <h2>진행 상황</h2>
        <div className="progress-controls">
          <div className="chart-type-selector">
            <label>차트 유형:</label>
            <select
              value={selectedChartType}
              onChange={e => setSelectedChartType(e.target.value as ChartType)}
            >
              <option value="weekly">주간</option>
              <option value="monthly">월간</option>
              <option value="yearly">연간</option>
            </select>
          </div>
          <div className="time-range-selector">
            <label>기간:</label>
            <select
              value={selectedTimeRange}
              onChange={e => setSelectedTimeRange(e.target.value as TimeRange)}
            >
              <option value="7days">최근 7일</option>
              <option value="30days">최근 30일</option>
              <option value="90days">최근 90일</option>
              <option value="1year">최근 1년</option>
            </select>
          </div>
        </div>
      </div>

      <div className="progress-content">
        {sessions.length === 0 ? (
          <div className="no-progress-container">
            <div className="no-progress-icon">📊</div>
            <h3>아직 운동 기록이 없습니다</h3>
            <p>운동을 시작하면 여기에 진행 상황이 표시됩니다!</p>
          </div>
        ) : (
          <>
            {/* 통계 카드 섹션 */}
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

            {/* 차트 섹션 */}
            <section className="charts-section">
              <div className="charts-grid">
                <div className="chart-container">
                  <h3>운동 시간 추이</h3>
                  <ProgressChart
                    data={chartData}
                    title="운동 시간 추이"
                    unit="분"
                  />
                </div>
                <div className="chart-container">
                  <h3>세션 수 추이</h3>
                  <ProgressChart
                    data={chartData}
                    title="세션 수 추이"
                    unit="개"
                  />
                </div>
              </div>
            </section>

            {/* 캘린더 섹션 */}
            <section className="calendar-section">
              <h3>운동 캘린더</h3>
              <WorkoutCalendar sessions={sessions} />
            </section>

            {/* 최근 활동 섹션 */}
            <section className="recent-activity-section">
              <h3>최근 활동</h3>
              <div className="activity-list">
                {sessions.slice(0, 10).map(session => (
                  <div key={session.id} className="activity-item">
                    <div className="activity-date">
                      {new Date(session.createdAt).toLocaleDateString()}
                    </div>
                    <div className="activity-details">
                      <span className="activity-name">{session.name}</span>
                      <span className="activity-duration">
                        {session.duration}분
                      </span>
                      <span
                        className={`activity-status status-${session.status}`}
                      >
                        {session.status === "completed"
                          ? "완료"
                          : session.status === "in_progress"
                            ? "진행 중"
                            : "일시정지"}
                      </span>
                    </div>
                    <button
                      className="view-session-btn"
                      onClick={() => onViewSession(session.id)}
                    >
                      보기
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  )
}
