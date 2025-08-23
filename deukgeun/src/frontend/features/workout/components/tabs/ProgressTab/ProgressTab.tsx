import React from "react"
import { ProgressHeader } from "./components/ProgressHeader"
import { ProgressContent } from "./components/ProgressContent"
import { useProgressData } from "./hooks/useProgressData"
import type { WorkoutSession } from "../../../../../shared/api/workoutJournalApi"

interface ProgressTabProps {
  sessions: WorkoutSession[]
  isLoading: boolean
  onViewSession: (sessionId: number) => void
}

export function ProgressTab({
  sessions,
  isLoading,
  onViewSession,
}: ProgressTabProps) {
  const {
    selectedChartType,
    selectedTimeRange,
    chartData,
    stats,
    setSelectedChartType,
    setSelectedTimeRange,
  } = useProgressData(sessions)

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
      <ProgressHeader
        selectedChartType={selectedChartType}
        selectedTimeRange={selectedTimeRange}
        onChartTypeChange={setSelectedChartType}
        onTimeRangeChange={setSelectedTimeRange}
      />
      <ProgressContent
        sessions={sessions}
        chartData={chartData}
        stats={stats}
        onViewSession={onViewSession}
      />
    </div>
  )
}
