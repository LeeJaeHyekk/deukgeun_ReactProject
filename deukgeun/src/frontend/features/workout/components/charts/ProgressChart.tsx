import React from "react"
import "./ProgressChart.css"

interface ProgressChartProps {
  data: any[]
  title?: string
  unit?: string
  color?: string
}

export function ProgressChart({ data }: ProgressChartProps) {
  // 실제 구현에서는 Chart.js나 Recharts 같은 라이브러리를 사용할 수 있습니다.
  // 여기서는 간단한 플레이스홀더를 만듭니다.

  return (
    <div className="progress-chart">
      <div className="chart-placeholder">
        <div className="chart-icon">📊</div>
        <p className="chart-message">차트 데이터가 준비 중입니다</p>
        <p className="chart-description">
          운동 데이터를 수집하면 여기에 진행 상황 차트가 표시됩니다.
        </p>
      </div>
    </div>
  )
}
