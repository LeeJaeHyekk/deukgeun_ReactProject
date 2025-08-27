import React from "react"
import { useTabState } from "../../../hooks/useWorkoutStore"
import { useSharedState } from "../../../hooks/useWorkoutStore"
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
  // 탭별 상태 관리
  const { tabState, updateTabState } = useTabState("progress")

  // 공유 상태 훅
  const { sharedState } = useSharedState()

  const {
    selectedChartType,
    selectedTimeRange,
    chartData,
    stats,
    setSelectedChartType,
    setSelectedTimeRange,
  } = useProgressData(sessions)

  // 탭 상태와 훅 상태 동기화
  React.useEffect(() => {
    if (selectedChartType !== tabState.chartType) {
      updateTabState({ chartType: selectedChartType })
    }
  }, [selectedChartType, tabState.chartType, updateTabState])

  React.useEffect(() => {
    if (selectedTimeRange !== tabState.selectedTimeRange) {
      updateTabState({ selectedTimeRange })
    }
  }, [selectedTimeRange, tabState.selectedTimeRange, updateTabState])

  // 비교 모드 토글 핸들러
  const handleComparisonModeToggle = (comparisonMode: boolean) => {
    updateTabState({ comparisonMode })
  }

  // 메트릭 선택 핸들러
  const handleMetricsChange = (metrics: string[]) => {
    updateTabState({ selectedMetrics: metrics })
  }

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
      {/* 탭별 설정 컨트롤 */}
      <div className="progress-controls">
        <div className="control-group">
          <label>메트릭:</label>
          <select
            multiple
            value={tabState.selectedMetrics}
            onChange={e => {
              const selectedOptions = Array.from(
                e.target.selectedOptions,
                option => option.value
              )
              handleMetricsChange(selectedOptions)
            }}
          >
            <option value="sessions">세션 수</option>
            <option value="duration">지속 시간</option>
            <option value="calories">칼로리</option>
            <option value="weight">무게</option>
            <option value="reps">횟수</option>
          </select>
        </div>

        <div className="control-group">
          <label>
            <input
              type="checkbox"
              checked={tabState.comparisonMode}
              onChange={e => handleComparisonModeToggle(e.target.checked)}
            />
            비교 모드
          </label>
        </div>
      </div>

      {/* 최근 세션 요약 */}
      {sharedState.lastUpdatedSession && (
        <div className="recent-session-summary">
          <h4>최근 세션 요약</h4>
          <div className="summary-item">
            <span className="session-name">
              {sharedState.lastUpdatedSession.name}
            </span>
            <span className="session-duration">
              {sharedState.lastUpdatedSession.totalDurationMinutes}분
            </span>
            <span className="session-sets">
              {sharedState.lastUpdatedSession.totalSets}세트
            </span>
            <span className="session-date">
              {new Date(
                sharedState.lastUpdatedSession.updatedAt ||
                  sharedState.lastUpdatedSession.createdAt
              ).toLocaleDateString()}
            </span>
          </div>
        </div>
      )}

      <ProgressHeader
        selectedChartType={selectedChartType}
        selectedTimeRange={selectedTimeRange}
        onChartTypeChange={setSelectedChartType}
        onTimeRangeChange={setSelectedTimeRange}
        comparisonMode={tabState.comparisonMode}
        selectedMetrics={tabState.selectedMetrics}
      />

      <ProgressContent
        sessions={sessions}
        chartData={chartData}
        stats={stats}
        onViewSession={onViewSession}
        comparisonMode={tabState.comparisonMode}
        selectedMetrics={tabState.selectedMetrics}
      />
    </div>
  )
}
