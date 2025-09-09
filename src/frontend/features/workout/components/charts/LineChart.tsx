import React, { useState } from "react"
import styles from "./LineChart.module.css"

interface LineChartProps {
  data: any[]
  xKey?: string
  yKey?: string
  title?: string
  xAxisLabel?: string
  yAxisLabel?: string
  height?: number
  width?: number
  config?: any
  className?: string
}

export function LineChart({
  data,
  xKey = "x",
  yKey = "y",
  title,
}: LineChartProps) {
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null)

  if (!data || data.length === 0) {
    return (
      <div className={styles.lineChart}>
        <div className={styles.chartPlaceholder}>
          <p>데이터가 없습니다</p>
        </div>
      </div>
    )
  }

  const maxValue = Math.max(...data.map(d => d[yKey] || 0))
  const minValue = Math.min(...data.map(d => d[yKey] || 0))
  const valueRange = maxValue - minValue || 1

  // Y축 눈금 계산
  const yTicks = 5
  const yTickValues = Array.from({ length: yTicks }, (_, i) => {
    return minValue + (valueRange * i) / (yTicks - 1)
  })

  const chartHeight = 300
  const chartWidth = 600
  const margin = { top: 20, right: 30, bottom: 40, left: 50 }
  const innerWidth = chartWidth - margin.left - margin.right
  const innerHeight = chartHeight - margin.top - margin.bottom

  const getX = (index: number) => {
    return margin.left + (index / (data.length - 1)) * innerWidth
  }

  const getY = (value: number) => {
    return (
      margin.top + innerHeight - ((value - minValue) / valueRange) * innerHeight
    )
  }

  return (
    <div className={styles.lineChart}>
      {title && <h4 className={styles.chartTitle}>{title}</h4>}
      <div className={styles.chartContainer}>
        <svg
          width="100%"
          height={chartHeight}
          className={styles.chartSvg}
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        >
          {/* 배경 그리드 */}
          <defs>
            <pattern
              id="grid"
              width="10"
              height="10"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 10 0 L 0 0 0 10"
                fill="none"
                stroke="rgba(255, 255, 255, 0.1)"
                strokeWidth="1"
              />
            </pattern>
          </defs>

          {/* 그리드 배경 */}
          <rect width="100%" height="100%" fill="transparent" />

          {/* Y축 그리드 라인 */}
          {yTickValues.map((tickValue, index) => (
            <g key={`y-grid-${index}`}>
              <line
                x1={margin.left}
                y1={getY(tickValue)}
                x2={margin.left + innerWidth}
                y2={getY(tickValue)}
                stroke="rgba(255, 255, 255, 0.2)"
                strokeWidth="1"
                strokeDasharray="2,2"
              />
              <text
                x={margin.left - 10}
                y={getY(tickValue)}
                textAnchor="end"
                dominantBaseline="middle"
                fontSize="12"
                fill="rgba(255, 255, 255, 0.8)"
                className={styles.axisLabel}
              >
                {tickValue.toFixed(1)}
              </text>
            </g>
          ))}

          {/* X축 그리드 라인 */}
          {data.map((item, index) => (
            <g key={`x-grid-${index}`}>
              <line
                x1={getX(index)}
                y1={margin.top}
                x2={getX(index)}
                y2={margin.top + innerHeight}
                stroke="rgba(255, 255, 255, 0.2)"
                strokeWidth="1"
                strokeDasharray="2,2"
              />
              <text
                x={getX(index)}
                y={margin.top + innerHeight + 20}
                textAnchor="middle"
                fontSize="12"
                fill="rgba(255, 255, 255, 0.8)"
                className={styles.axisLabel}
              >
                {item[xKey]}
              </text>
            </g>
          ))}

          {/* 라인 차트 */}
          <g className={styles.chartContent}>
            {/* 라인 */}
            <path
              d={data
                .map((item, index) => {
                  const x = getX(index)
                  const y = getY(item[yKey] || 0)
                  return `${index === 0 ? "M" : "L"} ${x} ${y}`
                })
                .join(" ")}
              stroke="#3b82f6"
              strokeWidth="3"
              fill="none"
              className={styles.chartLine}
            />

            {/* 포인트들 */}
            {data.map((item, index) => {
              const x = getX(index)
              const y = getY(item[yKey] || 0)
              const isHovered = hoveredPoint === index

              return (
                <g key={index} className={styles.dataPoint}>
                  {/* 호버 영역 */}
                  <circle
                    cx={x}
                    cy={y}
                    r="8"
                    fill="transparent"
                    onMouseEnter={() => setHoveredPoint(index)}
                    onMouseLeave={() => setHoveredPoint(null)}
                    className={styles.hoverArea}
                  />

                  {/* 포인트 */}
                  <circle
                    cx={x}
                    cy={y}
                    r={isHovered ? "6" : "4"}
                    fill={isHovered ? "#1d4ed8" : "#3b82f6"}
                    stroke="white"
                    strokeWidth="2"
                    className={styles.dataPointCircle}
                  />

                  {/* 툴팁 */}
                  {isHovered && (
                    <g className={styles.tooltip}>
                      <rect
                        x={x + 10}
                        y={y - 30}
                        width="80"
                        height="40"
                        fill="#1f2937"
                        rx="4"
                        className={styles.tooltipBackground}
                      />
                      <text
                        x={x + 50}
                        y={y - 15}
                        textAnchor="middle"
                        fontSize="12"
                        fill="white"
                        className={styles.tooltipText}
                      >
                        {item[xKey]}
                      </text>
                      <text
                        x={x + 50}
                        y={y + 2}
                        textAnchor="middle"
                        fontSize="12"
                        fill="white"
                        className={styles.tooltipText}
                      >
                        {item[yKey]}
                      </text>
                    </g>
                  )}
                </g>
              )
            })}
          </g>

          {/* 축 */}
          <line
            x1={margin.left}
            y1={margin.top}
            x2={margin.left}
            y2={margin.top + innerHeight}
            stroke="rgba(255, 255, 255, 0.8)"
            strokeWidth="2"
            className={styles.axis}
          />
          <line
            x1={margin.left}
            y1={margin.top + innerHeight}
            x2={margin.left + innerWidth}
            y2={margin.top + innerHeight}
            stroke="rgba(255, 255, 255, 0.8)"
            strokeWidth="2"
            className={styles.axis}
          />
        </svg>
      </div>
    </div>
  )
}
