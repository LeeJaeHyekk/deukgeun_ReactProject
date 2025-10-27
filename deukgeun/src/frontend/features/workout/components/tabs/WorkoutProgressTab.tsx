import React, { useState, useMemo } from "react"
import { LineChart, BarChart } from "../charts"
import type { WorkoutSession, WorkoutStats } from "../../types"
import "./WorkoutProgressTab.css"

interface WorkoutProgressTabProps {
  sessions: WorkoutSession[]
  workoutStats: WorkoutStats | null
  isLoading: boolean
}

interface ChartDataPoint {
  period: string
  completedSets: number
  totalSets: number
  durationMinutes: number
  sessions: number
  completionRate: number
}

export function WorkoutProgressTab({
  sessions,
  workoutStats,
  isLoading,
}: WorkoutProgressTabProps) {
  const [selectedTimeRange, setSelectedTimeRange] = useState<
    "weekly" | "monthly" | "yearly"
  >("monthly")
  const [selectedMetric, setSelectedMetric] = useState<
    | "completedSets"
    | "totalSets"
    | "durationMinutes"
    | "sessions"
    | "completionRate"
  >("completionRate")

  // 전체 통계 계산
  const overallStats = useMemo(() => {
    if (!sessions.length) return null

    const totalSessions = sessions.length
    const totalCompletedSets = sessions.reduce(
      (sum, session) =>
        sum + session.exerciseSets.filter((set: any) => set.repsCompleted > 0).length,
      0
    )
    const totalSets = sessions.reduce(
      (sum, session) => sum + session.exerciseSets.length,
      0
    )
    const totalDuration = sessions.reduce(
      (sum, session) => sum + (session.totalDurationMinutes || 0),
      0
    )
    const completionRate =
      totalSets > 0 ? (totalCompletedSets / totalSets) * 100 : 0

    return {
      totalSessions,
      totalCompletedSets,
      totalSets,
      totalDuration,
      completionRate: Math.round(completionRate * 10) / 10,
      averageDurationPerSession: Math.round(totalDuration / totalSessions),
      averageSetsPerSession: Math.round((totalSets / totalSessions) * 10) / 10,
    }
  }, [sessions])

  // 차트 데이터 처리
  const chartData = useMemo(() => {
    if (!sessions.length) return []

    const now = new Date()
    const data: Record<string, ChartDataPoint> = {}

    sessions.forEach(session => {
      const sessionDate = new Date(session.startTime)
      let periodKey: string

      switch (selectedTimeRange) {
        case "weekly": {
          const weekStart = new Date(sessionDate)
          weekStart.setDate(sessionDate.getDate() - sessionDate.getDay())
          periodKey = weekStart.toISOString().split("T")[0]
          break
        }
        case "monthly":
          periodKey = `${sessionDate.getFullYear()}-${String(sessionDate.getMonth() + 1).padStart(2, "0")}`
          break
        case "yearly":
          periodKey = sessionDate.getFullYear().toString()
          break
        default:
          periodKey = sessionDate.toISOString().split("T")[0]
      }

      if (!data[periodKey]) {
        data[periodKey] = {
          period: periodKey,
          completedSets: 0,
          totalSets: 0,
          durationMinutes: 0,
          sessions: 0,
          completionRate: 0,
        }
      }

      const completedSets = session.exerciseSets.filter(
        (set: any) => set.repsCompleted > 0
      ).length
      const totalSets = session.exerciseSets.length

      data[periodKey].completedSets += completedSets
      data[periodKey].totalSets += totalSets
      data[periodKey].durationMinutes += session.totalDurationMinutes || 0
      data[periodKey].sessions += 1
    })

    // 완료율 계산
    Object.values(data).forEach(item => {
      item.completionRate =
        item.totalSets > 0
          ? Math.round((item.completedSets / item.totalSets) * 100 * 10) / 10
          : 0
    })

    return Object.values(data).sort((a, b) => a.period.localeCompare(b.period))
  }, [sessions, selectedTimeRange])

  // 메트릭 표시명
  const getMetricLabel = (metric: string) => {
    switch (metric) {
      case "completedSets":
        return "완료된 세트"
      case "totalSets":
        return "전체 세트"
      case "durationMinutes":
        return "운동 시간 (분)"
      case "sessions":
        return "세션 수"
      case "completionRate":
        return "완료율 (%)"
      default:
        return metric
    }
  }

  // 시간 범위 표시명
  const getTimeRangeLabel = (range: string) => {
    switch (range) {
      case "weekly":
        return "주별"
      case "monthly":
        return "월별"
      case "yearly":
        return "년별"
      default:
        return range
    }
  }

  if (isLoading) {
    return (
      <div className="workout-progress-tab">
        <div className="loading-container">
          <p>진행 상황을 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="workout-progress-tab">
      <div className="tab-header">
        <h2>운동 진행 상황</h2>
        <p>전체 운동량과 진행 상황을 한눈에 확인하세요</p>
      </div>

      {/* 전체 통계 요약 */}
      {overallStats && (
        <div className="overall-stats">
          <div className="stats-grid">
            <div className="stat-card">
              <h3>총 세션</h3>
              <p className="stat-value">{overallStats.totalSessions}</p>
            </div>
            <div className="stat-card">
              <h3>총 운동 시간</h3>
              <p className="stat-value">{overallStats.totalDuration}분</p>
            </div>
            <div className="stat-card">
              <h3>총 완료 세트</h3>
              <p className="stat-value">{overallStats.totalCompletedSets}</p>
            </div>
            <div className="stat-card">
              <h3>전체 완료율</h3>
              <p className="stat-value">{overallStats.completionRate}%</p>
            </div>
            <div className="stat-card">
              <h3>평균 세션 시간</h3>
              <p className="stat-value">
                {overallStats.averageDurationPerSession}분
              </p>
            </div>
            <div className="stat-card">
              <h3>평균 세트 수</h3>
              <p className="stat-value">{overallStats.averageSetsPerSession}</p>
            </div>
          </div>
        </div>
      )}

      <div className="progress-controls">
        <div className="time-range-selector">
          <button
            className={`range-btn ${selectedTimeRange === "weekly" ? "active" : ""}`}
            onClick={() => setSelectedTimeRange("weekly")}
          >
            주별
          </button>
          <button
            className={`range-btn ${selectedTimeRange === "monthly" ? "active" : ""}`}
            onClick={() => setSelectedTimeRange("monthly")}
          >
            월별
          </button>
          <button
            className={`range-btn ${selectedTimeRange === "yearly" ? "active" : ""}`}
            onClick={() => setSelectedTimeRange("yearly")}
          >
            년별
          </button>
        </div>

        <div className="metric-selector">
          <select
            value={selectedMetric}
            onChange={e => setSelectedMetric(e.target.value as any)}
            className="metric-select"
          >
            <option value="completionRate">완료율 (%)</option>
            <option value="completedSets">완료된 세트</option>
            <option value="totalSets">전체 세트</option>
            <option value="durationMinutes">운동 시간 (분)</option>
            <option value="sessions">세션 수</option>
          </select>
        </div>
      </div>

      <div className="progress-charts">
        <div className="chart-container">
          <h3>
            {getTimeRangeLabel(selectedTimeRange)}{" "}
            {getMetricLabel(selectedMetric)}
          </h3>
          {selectedTimeRange === "yearly" ? (
            <LineChart
              data={chartData}
              xKey="period"
              yKey={selectedMetric}
              title={`${getTimeRangeLabel(selectedTimeRange)} ${getMetricLabel(selectedMetric)}`}
            />
          ) : (
            <BarChart
              data={chartData}
              xKey="period"
              yKey={selectedMetric}
              title={`${getTimeRangeLabel(selectedTimeRange)} ${getMetricLabel(selectedMetric)}`}
            />
          )}
        </div>
      </div>

      {!sessions.length && (
        <div className="no-data">
          <p>아직 운동 데이터가 없습니다.</p>
          <p>운동을 시작하여 진행 상황을 확인해보세요!</p>
        </div>
      )}
    </div>
  )
}
