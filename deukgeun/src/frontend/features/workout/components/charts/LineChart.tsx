import React from "react"

interface DataPoint {
  x: string | number
  y: number
  label?: string
}

interface LineChartProps {
  data: DataPoint[]
  title?: string
  xAxisLabel?: string
  yAxisLabel?: string
  color?: string
  height?: number
  width?: number
  showGrid?: boolean
  showPoints?: boolean
  smooth?: boolean
}

export function LineChart({
  data,
  title,
  xAxisLabel,
  yAxisLabel,
  color = "#3b82f6",
  height = 300,
  width = 600,
  showGrid = true,
  showPoints = true,
  smooth = true,
}: LineChartProps) {
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

  // 데이터 정렬 및 범위 계산
  const sortedData = [...data].sort((a, b) => {
    if (typeof a.x === "string" && typeof b.x === "string") {
      return new Date(a.x).getTime() - new Date(b.x).getTime()
    }
    return Number(a.x) - Number(b.x)
  })

  const minX = Math.min(...sortedData.map(d => Number(d.x)))
  const maxX = Math.max(...sortedData.map(d => Number(d.x)))
  const minY = Math.min(...sortedData.map(d => d.y))
  const maxY = Math.max(...sortedData.map(d => d.y))

  const padding = 40
  const chartWidth = width - padding * 2
  const chartHeight = height - padding * 2

  // 좌표 변환 함수
  const getX = (value: number) => {
    return padding + ((value - minX) / (maxX - minX)) * chartWidth
  }

  const getY = (value: number) => {
    return height - padding - ((value - minY) / (maxY - minY)) * chartHeight
  }

  // 라인 경로 생성
  const createPath = () => {
    if (sortedData.length < 2) return ""

    const points = sortedData.map(point => {
      const x = getX(Number(point.x))
      const y = getY(point.y)
      return `${x},${y}`
    })

    if (smooth) {
      // 부드러운 곡선 생성
      let path = `M ${points[0]}`
      for (let i = 1; i < points.length; i++) {
        const prev = points[i - 1].split(",")
        const curr = points[i].split(",")
        const x1 = parseFloat(prev[0])
        const y1 = parseFloat(prev[1])
        const x2 = parseFloat(curr[0])
        const y2 = parseFloat(curr[1])

        const cp1x = x1 + (x2 - x1) * 0.5
        const cp1y = y1
        const cp2x = x1 + (x2 - x1) * 0.5
        const cp2y = y2

        path += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${x2},${y2}`
      }
      return path
    } else {
      return `M ${points.join(" L ")}`
    }
  }

  // Y축 눈금 생성
  const generateYTicks = () => {
    const tickCount = 5
    const ticks = []
    for (let i = 0; i <= tickCount; i++) {
      const value = minY + (maxY - minY) * (i / tickCount)
      const y = getY(value)
      ticks.push({ value: Math.round(value * 10) / 10, y })
    }
    return ticks
  }

  // X축 눈금 생성
  const generateXTicks = () => {
    const tickCount = Math.min(6, sortedData.length)
    const ticks = []
    for (let i = 0; i < tickCount; i++) {
      const index = Math.floor((i / (tickCount - 1)) * (sortedData.length - 1))
      const point = sortedData[index]
      const x = getX(Number(point.x))
      const label =
        typeof point.x === "string"
          ? new Date(point.x).toLocaleDateString("ko-KR", {
              month: "short",
              day: "numeric",
            })
          : point.x.toString()
      ticks.push({ label, x })
    }
    return ticks
  }

  const yTicks = generateYTicks()
  const xTicks = generateXTicks()

  return (
    <div className="chart-container">
      {title && <h3 className="chart-title">{title}</h3>}

      <svg width={width} height={height} className="line-chart">
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
                {tick.label}
              </text>
            </g>
          ))}
        </g>

        {/* 라인 */}
        <path
          d={createPath()}
          stroke={color}
          strokeWidth="3"
          fill="none"
          className="chart-line"
        />

        {/* 포인트 */}
        {showPoints &&
          sortedData.map((point, index) => {
            const x = getX(Number(point.x))
            const y = getY(point.y)
            return (
              <g key={index} className="chart-point">
                <circle
                  cx={x}
                  cy={y}
                  r="4"
                  fill={color}
                  stroke="white"
                  strokeWidth="2"
                />
                {point.label && <title>{point.label}</title>}
              </g>
            )
          })}

        {/* 축 라벨 */}
        {xAxisLabel && (
          <text
            x={width / 2}
            y={height - 5}
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
