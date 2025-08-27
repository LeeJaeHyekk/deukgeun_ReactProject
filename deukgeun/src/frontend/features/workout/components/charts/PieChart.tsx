import React from "react"
import styles from "./PieChart.module.css"

interface PieChartData {
  name: string
  value: number
}

interface PieChartProps {
  data: PieChartData[]
  title?: string
  height?: number
  width?: number
  showLegend?: boolean
}

export function PieChart({
  data,
  title,
  height = 300,
  width = 400,
  showLegend = true,
}: PieChartProps) {
  // 데이터가 없거나 유효하지 않은 경우 플레이스홀더 표시
  if (!data || data.length === 0 || !data.some(item => item.value > 0)) {
    return (
      <div className={styles.pieChart}>
        <div className={styles.chartPlaceholder}>
          <p>데이터가 없습니다</p>
        </div>
      </div>
    )
  }

  const total = data.reduce((sum, item) => sum + item.value, 0)
  const colors = [
    "#3b82f6",
    "#ef4444",
    "#10b981",
    "#f59e0b",
    "#8b5cf6",
    "#06b6d4",
  ]

  let currentAngle = 0

  return (
    <div className={styles.pieChart}>
      {title && <h4 className={styles.chartTitle}>{title}</h4>}
      <div className={styles.chartContainer}>
        <svg width={width} height={height} className={styles.chartSvg}>
          <g transform="translate(100, 100)">
            {data.map((item, index) => {
              const percentage = (item.value / total) * 100
              const angle = (percentage / 100) * 360
              const startAngle = currentAngle
              const endAngle = currentAngle + angle

              // SVG arc 계산
              const radius = 80
              const startX =
                radius * Math.cos(((startAngle - 90) * Math.PI) / 180)
              const startY =
                radius * Math.sin(((startAngle - 90) * Math.PI) / 180)
              const endX = radius * Math.cos(((endAngle - 90) * Math.PI) / 180)
              const endY = radius * Math.sin(((endAngle - 90) * Math.PI) / 180)

              const largeArcFlag = angle > 180 ? 1 : 0

              const pathData = [
                `M ${startX} ${startY}`,
                `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`,
                "L 0 0",
              ].join(" ")

              currentAngle += angle

              return (
                <g key={index}>
                  <path
                    d={pathData}
                    fill={colors[index % colors.length]}
                    stroke="white"
                    strokeWidth="2"
                  />
                </g>
              )
            })}
          </g>
        </svg>

        {showLegend && (
          <div className={styles.legend}>
            {data.map((item, index) => (
              <div key={index} className={styles.legendItem}>
                <div
                  className={styles.legendColor}
                  style={{ backgroundColor: colors[index % colors.length] }}
                />
                <span className={styles.legendLabel}>{item.name}</span>
                <span className={styles.legendValue}>
                  {((item.value / total) * 100).toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
