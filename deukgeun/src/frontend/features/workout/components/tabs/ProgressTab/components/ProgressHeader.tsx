import React from "react"

type ChartType = "weekly" | "monthly" | "yearly"
type TimeRange = "7days" | "30days" | "90days" | "1year"

interface ProgressHeaderProps {
  selectedChartType: ChartType
  selectedTimeRange: TimeRange
  onChartTypeChange: (type: ChartType) => void
  onTimeRangeChange: (range: TimeRange) => void
}

export const ProgressHeader: React.FC<ProgressHeaderProps> = ({
  selectedChartType,
  selectedTimeRange,
  onChartTypeChange,
  onTimeRangeChange,
}) => {
  return (
    <div className="progress-header">
      <h2>진행 상황</h2>
      <div className="progress-controls">
        <div className="chart-type-selector">
          <label>차트 유형:</label>
          <select
            value={selectedChartType}
            onChange={e => onChartTypeChange(e.target.value as ChartType)}
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
            onChange={e => onTimeRangeChange(e.target.value as TimeRange)}
          >
            <option value="7days">최근 7일</option>
            <option value="30days">최근 30일</option>
            <option value="90days">최근 90일</option>
            <option value="1year">최근 1년</option>
          </select>
        </div>
      </div>
    </div>
  )
}
