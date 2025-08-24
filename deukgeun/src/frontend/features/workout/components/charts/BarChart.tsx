import React from "react"

interface BarData {
  label: string
  value: number
  color?: string
}

interface BarChartProps {
  data: BarData[]
  title?: string
  xAxisLabel?: string
  yAxisLabel?: string
  height?: number
  width?: number
  showGrid?: boolean
  showValues?: boolean
  horizontal?: boolean
}

export function BarChart({
  data,
  title,
  xAxisLabel,
  yAxisLabel,
  height = 300,
  width = 600,
  showGrid = true,
  showValues = true,
  horizontal = false,
}: BarChartProps) {
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

  const padding = 60
  const chartWidth = width - padding * 2
  const chartHeight = height - padding * 2

  const maxValue = Math.max(...data.map(d => d.value))
  const minValue = Math.min(...data.map(d => d.value))

  // 세로 막대 그래프
  if (!horizontal) {
    const barWidth = (chartWidth / data.length) * 0.8
    const barSpacing = (chartWidth / data.length) * 0.2

    const getBarHeight = (value: number) => {
      return (value / maxValue) * chartHeight
    }

    const getBarX = (index: number) => {
      return padding + index * (barWidth + barSpacing) + barSpacing / 2
    }

    const getBarY = (value: number) => {
      return height - padding - getBarHeight(value)
    }

    // Y축 눈금 생성
    const generateYTicks = () => {
      const tickCount = 5
      const ticks = []
      for (let i = 0; i <= tickCount; i++) {
        const value = maxValue * (i / tickCount)
        const y = height - padding - (value / maxValue) * chartHeight
        ticks.push({ value: Math.round(value * 10) / 10, y })
      }
      return ticks
    }

    const yTicks = generateYTicks()

    return (
      <div className="chart-container">
        {title && <h3 className="chart-title">{title}</h3>}

        <svg width={width} height={height} className="bar-chart">
          {/* 그리드 */}
          {showGrid && (
            <g className="chart-grid">
              {yTicks.map((tick, index) => (
                <line
                  key={index}
                  x1={padding}
                  y1={tick.y}
                  x2={width - padding}
                  y2={tick.y}
                  stroke="#e5e7eb"
                  strokeWidth="1"
                />
              ))}
            </g>
          )}

          {/* Y축 */}
          <line
            x1={padding}
            y1={padding}
            x2={padding}
            y2={height - padding}
            stroke="#374151"
            strokeWidth="2"
          />

          {/* X축 */}
          <line
            x1={padding}
            y1={height - padding}
            x2={width - padding}
            y2={height - padding}
            stroke="#374151"
            strokeWidth="2"
          />

          {/* Y축 눈금 및 라벨 */}
          <g className="y-axis">
            {yTicks.map((tick, index) => (
              <g key={index}>
                <line
                  x1={padding - 5}
                  y1={tick.y}
                  x2={padding}
                  y2={tick.y}
                  stroke="#374151"
                  strokeWidth="1"
                />
                <text
                  x={padding - 10}
                  y={tick.y + 4}
                  textAnchor="end"
                  fontSize="12"
                  fill="#6b7280"
                >
                  {tick.value}
                </text>
              </g>
            ))}
          </g>

          {/* 막대 */}
          {data.map((item, index) => {
            const barX = getBarX(index)
            const barHeight = getBarHeight(item.value)
            const barY = getBarY(item.value)
            const barColor = item.color || "#3b82f6"

            return (
              <g key={index} className="chart-bar">
                <rect
                  x={barX}
                  y={barY}
                  width={barWidth}
                  height={barHeight}
                  fill={barColor}
                  rx="2"
                  ry="2"
                />

                {/* 값 표시 */}
                {showValues && (
                  <text
                    x={barX + barWidth / 2}
                    y={barY - 5}
                    textAnchor="middle"
                    fontSize="12"
                    fill="#374151"
                    fontWeight="500"
                  >
                    {item.value}
                  </text>
                )}

                {/* 라벨 */}
                <text
                  x={barX + barWidth / 2}
                  y={height - padding + 20}
                  textAnchor="middle"
                  fontSize="12"
                  fill="#6b7280"
                >
                  {item.label}
                </text>
              </g>
            )
          })}

          {/* 축 라벨 */}
          {xAxisLabel && (
            <text
              x={width / 2}
              y={height - 10}
              textAnchor="middle"
              fontSize="14"
              fill="#374151"
              fontWeight="500"
            >
              {xAxisLabel}
            </text>
          )}

          {yAxisLabel && (
            <text
              x={-height / 2}
              y={15}
              textAnchor="middle"
              fontSize="14"
              fill="#374151"
              fontWeight="500"
              transform={`rotate(-90, 15, ${height / 2})`}
            >
              {yAxisLabel}
            </text>
          )}
        </svg>
      </div>
    )
  }

  // 가로 막대 그래프
  else {
    const barHeight = (chartHeight / data.length) * 0.8
    const barSpacing = (chartHeight / data.length) * 0.2

    const getBarWidth = (value: number) => {
      return (value / maxValue) * chartWidth
    }

    const getBarY = (index: number) => {
      return padding + index * (barHeight + barSpacing) + barSpacing / 2
    }

    // X축 눈금 생성
    const generateXTicks = () => {
      const tickCount = 5
      const ticks = []
      for (let i = 0; i <= tickCount; i++) {
        const value = maxValue * (i / tickCount)
        const x = padding + (value / maxValue) * chartWidth
        ticks.push({ value: Math.round(value * 10) / 10, x })
      }
      return ticks
    }

    const xTicks = generateXTicks()

    return (
      <div className="chart-container">
        {title && <h3 className="chart-title">{title}</h3>}

        <svg width={width} height={height} className="bar-chart horizontal">
          {/* 그리드 */}
          {showGrid && (
            <g className="chart-grid">
              {xTicks.map((tick, index) => (
                <line
                  key={index}
                  x1={tick.x}
                  y1={padding}
                  x2={tick.x}
                  y2={height - padding}
                  stroke="#e5e7eb"
                  strokeWidth="1"
                />
              ))}
            </g>
          )}

          {/* Y축 */}
          <line
            x1={padding}
            y1={padding}
            x2={padding}
            y2={height - padding}
            stroke="#374151"
            strokeWidth="2"
          />

          {/* X축 */}
          <line
            x1={padding}
            y1={height - padding}
            x2={width - padding}
            y2={height - padding}
            stroke="#374151"
            strokeWidth="2"
          />

          {/* X축 눈금 및 라벨 */}
          <g className="x-axis">
            {xTicks.map((tick, index) => (
              <g key={index}>
                <line
                  x1={tick.x}
                  y1={height - padding}
                  x2={tick.x}
                  y2={height - padding + 5}
                  stroke="#374151"
                  strokeWidth="1"
                />
                <text
                  x={tick.x}
                  y={height - padding + 20}
                  textAnchor="middle"
                  fontSize="12"
                  fill="#6b7280"
                >
                  {tick.value}
                </text>
              </g>
            ))}
          </g>

          {/* 막대 */}
          {data.map((item, index) => {
            const barY = getBarY(index)
            const barWidth = getBarWidth(item.value)
            const barColor = item.color || "#3b82f6"

            return (
              <g key={index} className="chart-bar">
                <rect
                  x={padding}
                  y={barY}
                  width={barWidth}
                  height={barHeight}
                  fill={barColor}
                  rx="2"
                  ry="2"
                />

                {/* 값 표시 */}
                {showValues && (
                  <text
                    x={padding + barWidth + 10}
                    y={barY + barHeight / 2 + 4}
                    fontSize="12"
                    fill="#374151"
                    fontWeight="500"
                  >
                    {item.value}
                  </text>
                )}

                {/* 라벨 */}
                <text
                  x={padding - 10}
                  y={barY + barHeight / 2 + 4}
                  textAnchor="end"
                  fontSize="12"
                  fill="#6b7280"
                >
                  {item.label}
                </text>
              </g>
            )
          })}

          {/* 축 라벨 */}
          {xAxisLabel && (
            <text
              x={width / 2}
              y={height - 10}
              textAnchor="middle"
              fontSize="14"
              fill="#374151"
              fontWeight="500"
            >
              {xAxisLabel}
            </text>
          )}

          {yAxisLabel && (
            <text
              x={-height / 2}
              y={15}
              textAnchor="middle"
              fontSize="14"
              fill="#374151"
              fontWeight="500"
              transform={`rotate(-90, 15, ${height / 2})`}
            >
              {yAxisLabel}
            </text>
          )}
        </svg>
      </div>
    )
  }
}
