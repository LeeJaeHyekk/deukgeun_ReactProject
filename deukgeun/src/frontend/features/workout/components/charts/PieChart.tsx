import React from "react"

interface PieData {
  label: string
  value: number
  color?: string
}

interface PieChartProps {
  data: PieData[]
  title?: string
  height?: number
  width?: number
  showLabels?: boolean
  showValues?: boolean
  showLegend?: boolean
  innerRadius?: number
}

export function PieChart({
  data,
  title,
  height = 300,
  width = 400,
  showLabels = true,
  showValues = true,
  showLegend = true,
  innerRadius = 0,
}: PieChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="chart-container">
        <div className="chart-empty">
          <div className="empty-icon">📊</div>
          <p>데이터가 없습니다</p>
        </div>
      </div>
    )
  }

  const total = data.reduce((sum, item) => sum + item.value, 0)
  const centerX = width / 2
  const centerY = height / 2
  const radius = Math.min(centerX, centerY) - 40

  // 색상 팔레트
  const defaultColors = [
    "#3b82f6",
    "#ef4444",
    "#10b981",
    "#f59e0b",
    "#8b5cf6",
    "#06b6d4",
    "#84cc16",
    "#f97316",
    "#ec4899",
    "#6366f1",
  ]

  // 파이 조각 생성
  const createPieSlices = () => {
    let currentAngle = -Math.PI / 2 // 12시 방향에서 시작

    return data.map((item, index) => {
      const percentage = item.value / total
      const angle = percentage * 2 * Math.PI
      const endAngle = currentAngle + angle

      // 호의 시작점과 끝점
      const startX = centerX + Math.cos(currentAngle) * radius
      const startY = centerY + Math.sin(currentAngle) * radius
      const endX = centerX + Math.cos(endAngle) * radius
      const endY = centerY + Math.sin(endAngle) * radius

      // 큰 호인지 작은 호인지 판단
      const largeArcFlag = angle > Math.PI ? 1 : 0

      // SVG 경로 생성
      const pathData = [
        `M ${centerX} ${centerY}`,
        `L ${startX} ${startY}`,
        `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`,
        "Z",
      ].join(" ")

      // 내부 반지름이 있는 경우 도넛 차트
      let innerPathData = ""
      if (innerRadius > 0) {
        const innerStartX = centerX + Math.cos(currentAngle) * innerRadius
        const innerStartY = centerY + Math.sin(currentAngle) * innerRadius
        const innerEndX = centerX + Math.cos(endAngle) * innerRadius
        const innerEndY = centerY + Math.sin(endAngle) * innerRadius

        innerPathData = [
          `M ${innerEndX} ${innerEndY}`,
          `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${innerStartX} ${innerStartY}`,
          `L ${startX} ${startY}`,
          `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`,
          "Z",
        ].join(" ")
      }

      const color = item.color || defaultColors[index % defaultColors.length]
      const labelAngle = currentAngle + angle / 2
      const labelRadius = radius * 0.7
      const labelX = centerX + Math.cos(labelAngle) * labelRadius
      const labelY = centerY + Math.sin(labelAngle) * labelRadius

      const slice = {
        pathData: innerRadius > 0 ? innerPathData : pathData,
        color,
        percentage,
        labelAngle,
        labelX,
        labelY,
        value: item.value,
        label: item.label,
      }

      currentAngle = endAngle
      return slice
    })
  }

  const slices = createPieSlices()

  return (
    <div className="chart-container">
      {title && <h3 className="chart-title">{title}</h3>}

      <div className="pie-chart-container">
        <svg width={width} height={height} className="pie-chart">
          {/* 파이 조각들 */}
          {slices.map((slice, index) => (
            <g key={index} className="pie-slice">
              <path
                d={slice.pathData}
                fill={slice.color}
                stroke="white"
                strokeWidth="2"
              />

              {/* 라벨 */}
              {showLabels && slice.percentage > 0.05 && (
                <text
                  x={slice.labelX}
                  y={slice.labelY}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="12"
                  fill="white"
                  fontWeight="500"
                >
                  {slice.label}
                </text>
              )}

              {/* 값 */}
              {showValues && slice.percentage > 0.1 && (
                <text
                  x={slice.labelX}
                  y={slice.labelY + 15}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="10"
                  fill="white"
                >
                  {Math.round(slice.percentage * 100)}%
                </text>
              )}
            </g>
          ))}

          {/* 중앙 텍스트 (도넛 차트인 경우) */}
          {innerRadius > 0 && (
            <text
              x={centerX}
              y={centerY}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="16"
              fill="#374151"
              fontWeight="600"
            >
              {total}
            </text>
          )}
        </svg>

        {/* 범례 */}
        {showLegend && (
          <div className="pie-legend">
            {slices.map((slice, index) => (
              <div key={index} className="legend-item">
                <div
                  className="legend-color"
                  style={{ backgroundColor: slice.color }}
                />
                <div className="legend-content">
                  <span className="legend-label">{slice.label}</span>
                  <span className="legend-value">
                    {slice.value} ({Math.round(slice.percentage * 100)}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
