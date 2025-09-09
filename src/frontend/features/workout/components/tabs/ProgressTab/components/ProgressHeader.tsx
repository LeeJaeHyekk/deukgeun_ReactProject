import React from "react"
import styles from "./ProgressHeader.module.css"

type ChartType = "weekly" | "monthly" | "yearly"
type TimeRange = "7days" | "30days" | "90days" | "1year"

interface ProgressHeaderProps {
  selectedChartType: ChartType
  selectedTimeRange: TimeRange
  onChartTypeChange: (type: ChartType) => void
  onTimeRangeChange: (range: TimeRange) => void
  comparisonMode?: boolean
  selectedMetrics?: string[]
}

export const ProgressHeader: React.FC<ProgressHeaderProps> = ({
  selectedChartType,
  selectedTimeRange,
  onChartTypeChange,
  onTimeRangeChange,
  comparisonMode = false,
  selectedMetrics = [],
}) => {
  return (
    <div className={styles.progressHeader}>
      <div className={styles.headerContent}>
        <h2>📊 차트 설정</h2>
        <p>차트 유형과 기간을 선택하세요</p>
      </div>

      <div className={styles.progressControls}>
        <div className={styles.controlGroup}>
          <div className={styles.chartTypeSelector}>
            <label>차트 유형:</label>
            <select
              value={selectedChartType}
              onChange={e => onChartTypeChange(e.target.value as ChartType)}
              className={styles.select}
            >
              <option value="weekly">주간</option>
              <option value="monthly">월간</option>
              <option value="yearly">연간</option>
            </select>
          </div>

          <div className={styles.timeRangeSelector}>
            <label>기간:</label>
            <select
              value={selectedTimeRange}
              onChange={e => onTimeRangeChange(e.target.value as TimeRange)}
              className={styles.select}
            >
              <option value="7days">최근 7일</option>
              <option value="30days">최근 30일</option>
              <option value="90days">최근 90일</option>
              <option value="1year">최근 1년</option>
            </select>
          </div>
        </div>

        <div className={styles.controlInfo}>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>비교 모드:</span>
            <span className={styles.infoValue}>
              {comparisonMode ? "활성화" : "비활성화"}
            </span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>선택된 메트릭:</span>
            <span className={styles.infoValue}>
              {selectedMetrics.length > 0 ? selectedMetrics.join(", ") : "전체"}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
