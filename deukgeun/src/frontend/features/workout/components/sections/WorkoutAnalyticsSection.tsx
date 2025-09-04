import React, { useState } from "react"
import { LineChart } from "../charts/LineChart"
import { BarChart } from "../charts/BarChart"
import { PieChart } from "../charts/PieChart"
import { StreakDisplay } from "../charts/StreakDisplay"
import { GoalComparison } from "../charts/GoalComparison"
import { WorkoutStats, WorkoutGoal, WorkoutSession } from "../../types"

interface WorkoutAnalyticsSectionProps {
  workoutStats: WorkoutStats
  workoutGoals: WorkoutGoal[]
  workoutSessions: WorkoutSession[]
}

export function WorkoutAnalyticsSection({
  workoutStats,
  workoutGoals,
  workoutSessions,
}: WorkoutAnalyticsSectionProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<
    "week" | "month" | "year"
  >("week")

  // 주간 운동 데이터 생성
  const generateWeeklyData = () => {
    const days = ["월", "화", "수", "목", "금", "토", "일"]
    return days.map((day, index) => ({
      x: day,
      y: Math.floor(Math.random() * 5) + 1, // 임시 데이터
      label: `${day}요일 운동`,
    }))
  }

  // 월간 운동 데이터 생성
  const generateMonthlyData = () => {
    const weeks = ["1주", "2주", "3주", "4주"]
    return weeks.map((week, index) => ({
      x: week,
      y: Math.floor(Math.random() * 20) + 10, // 임시 데이터
      label: `${week} 운동 세션`,
    }))
  }

  // 운동 기구 사용률 데이터
  const generateMachineUsageData = () => {
    return [
      { name: "벤치프레스", value: 35, color: "#3b82f6" },
      { name: "스쿼트랙", value: 25, color: "#10b981" },
      { name: "레그프레스", value: 20, color: "#f59e0b" },
      { name: "덤벨", value: 15, color: "#ef4444" },
      { name: "기타", value: 5, color: "#8b5cf6" },
    ]
  }

  // 운동 시간대별 데이터
  const generateTimeSlotData = () => {
    return [
      { label: "아침 (6-9시)", value: 15 },
      { label: "오전 (9-12시)", value: 10 },
      { label: "오후 (12-6시)", value: 20 },
      { label: "저녁 (6-9시)", value: 45 },
      { label: "밤 (9시 이후)", value: 10 },
    ]
  }

  // 연속 운동 데이터
  const generateStreakData = () => ({
    currentStreak: workoutStats.currentStreak,
    longestStreak: workoutStats.longestStreak || 0,
    startDate:
      workoutStats.startDate?.toISOString() || new Date().toISOString(),
    lastWorkoutDate: workoutStats.lastWorkoutDate?.toISOString(),
    weeklyGoal: 3,
    weeklyProgress: Math.floor(Math.random() * 4), // 임시 데이터
  })

  const getChartData = () => {
    switch (selectedPeriod) {
      case "week":
        return generateWeeklyData()
      case "month":
        return generateMonthlyData()
      case "year":
        return generateMonthlyData() // 임시로 월간 데이터 사용
      default:
        return generateWeeklyData()
    }
  }

  const getChartTitle = () => {
    switch (selectedPeriod) {
      case "week":
        return "주간 운동 현황"
      case "month":
        return "월간 운동 현황"
      case "year":
        return "연간 운동 현황"
      default:
        return "운동 현황"
    }
  }

  return (
    <section className="workout-section">
      <div className="workout-section-header">
        <div>
          <h2 className="workout-section-title">운동 분석</h2>
          <p className="workout-section-description">
            운동 데이터를 분석하여 패턴과 개선점을 파악하세요
          </p>
        </div>
        <div className="period-selector">
          <button
            className={`period-button ${selectedPeriod === "week" ? "active" : ""}`}
            onClick={() => setSelectedPeriod("week")}
          >
            주간
          </button>
          <button
            className={`period-button ${selectedPeriod === "month" ? "active" : ""}`}
            onClick={() => setSelectedPeriod("month")}
          >
            월간
          </button>
          <button
            className={`period-button ${selectedPeriod === "year" ? "active" : ""}`}
            onClick={() => setSelectedPeriod("year")}
          >
            연간
          </button>
        </div>
      </div>

      <div className="analytics-grid">
        {/* 연속 운동 현황 */}
        <div className="analytics-card streak-card">
          <StreakDisplay
            data={generateStreakData()}
            title="연속 운동"
            size="medium"
          />
        </div>

        {/* 운동 현황 라인 차트 */}
        <div className="analytics-card chart-card">
          <LineChart
            data={getChartData()}
            title={getChartTitle()}
            xAxisLabel="기간"
            yAxisLabel="운동 세션 수"
            height={300}
            width={500}
          />
        </div>

        {/* 기구 사용률 파이 차트 */}
        <div className="analytics-card chart-card">
          <PieChart
            data={generateMachineUsageData()}
            title="기구 사용률"
            height={300}
            width={400}
            showLegend={true}
          />
        </div>

        {/* 운동 시간대별 막대 차트 */}
        <div className="analytics-card chart-card">
          <BarChart
            data={generateTimeSlotData()}
            title="운동 시간대별 분포"
            xAxisLabel="시간대"
            yAxisLabel="세션 수"
            height={300}
            width={500}
            horizontal={true}
          />
        </div>

        {/* 목표 달성 현황 */}
        <div className="analytics-card goals-card">
          <GoalComparison
            goals={workoutGoals}
            title="목표 달성 현황"
            showProgress={true}
            showDeadlines={true}
            layout="vertical"
          />
        </div>

        {/* 통계 요약 */}
        <div className="analytics-card stats-card">
          <h3 className="stats-title">전체 통계</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-number">{workoutStats.totalSessions}</div>
              <div className="stat-label">총 운동 세션</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">
                {workoutStats.totalDurationMinutes}
              </div>
              <div className="stat-label">총 운동 시간 (분)</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">
                {workoutStats.totalCaloriesBurned}
              </div>
              <div className="stat-label">총 소모 칼로리</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{workoutStats.currentStreak}</div>
              <div className="stat-label">현재 연속 일수</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{workoutStats.longestStreak}</div>
              <div className="stat-label">최장 연속 일수</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">
                {workoutStats.favoriteMachines &&
                workoutStats.favoriteMachines.length > 0
                  ? workoutStats.favoriteMachines[0]?.name || "없음"
                  : "없음"}
              </div>
              <div className="stat-label">선호 기구</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
