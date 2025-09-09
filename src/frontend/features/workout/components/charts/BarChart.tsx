import React, { useState } from "react"
import styles from "./BarChart.module.css"

interface BarChartProps {
  data: any[]
  xKey?: string
  yKey?: string
  title?: string
  xAxisLabel?: string
  yAxisLabel?: string
  height?: number
  width?: number
  horizontal?: boolean
  config?: any
  className?: string
}

export function BarChart({ data, xKey = "x", yKey = "y", title }: BarChartProps) {
  const [hoveredBar, setHoveredBar] = useState<number | null>(null)

  if (!data || data.length === 0) {
    return (
      <div className={styles.barChart}>
        <div className={styles.chartPlaceholder}>
          <p>데이터가 없습니다</p>
        </div>
      </div>
    )
  }

  const maxValue = Math.max(...data.map(item => item[yKey] || 0))
  const minValue = Math.min(...data.map(item => item[yKey] || 0))
  const valueRange = maxValue - minValue || 1

  // Y축 눈금 계산
  const yTicks = 5
  const yTickValues = Array.from({ length: yTicks }, (_, i) => {
    return minValue + (valueRange * i) / (yTicks - 1)
  })

  const chartHeight = 300
  const chartWidth = 600
  const margin = { top: 20, right: 30, bottom: 60, left: 50 }
  const innerWidth = chartWidth - margin.left - margin.right
  const innerHeight = chartHeight - margin.top - margin.bottom

  const barWidth = (innerWidth / data.length) * 0.8
  const barSpacing = (innerWidth / data.length) * 0.2

  const getX = (index: number) => {
    return margin.left + index * (barWidth + barSpacing) + barSpacing / 2
  }

  const getY = (value: number) => {
    return (
      margin.top + innerHeight - ((value - minValue) / valueRange) * innerHeight
    )
  }

  const getBarHeight = (value: number) => {
    return ((value - minValue) / valueRange) * innerHeight
  }

  return (
    <div className={styles.barChart}>
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

          {/* 막대 차트 */}
          <g className={styles.chartContent}>
            {data.map((item, index) => {
              const x = getX(index)
              const barHeight = getBarHeight(item[yKey] || 0)
              const y = getY(item[yKey] || 0)
              const isHovered = hoveredBar === index

              return (
                <g key={index} className={styles.barGroup}>
                  {/* 호버 영역 */}
                  <rect
                    x={x - 5}
                    y={margin.top}
                    width={barWidth + 10}
                    height={innerHeight}
                    fill="transparent"
                    onMouseEnter={() => setHoveredBar(index)}
                    onMouseLeave={() => setHoveredBar(null)}
                    className={styles.hoverArea}
                  />

                  {/* 막대 */}
                  <rect
                    x={x}
                    y={y}
                    width={barWidth}
                    height={barHeight}
                    fill={isHovered ? "#1d4ed8" : "#3b82f6"}
                    rx="4"
                    className={styles.bar}
                    style={{
                      filter: isHovered
                        ? "drop-shadow(0 4px 8px rgba(59, 130, 246, 0.3))"
                        : "none",
                    }}
                  />

                  {/* 막대 위 값 표시 */}
                  {barHeight > 20 && (
                    <text
                      x={x + barWidth / 2}
                      y={y - 8}
                      textAnchor="middle"
                      fontSize="12"
                      fill="rgba(255, 255, 255, 0.9)"
                      fontWeight="600"
                      className={styles.barValue}
                    >
                      {item[yKey]}
                    </text>
                  )}

                  {/* X축 레이블 */}
                  <text
                    x={x + barWidth / 2}
                    y={margin.top + innerHeight + 20}
                    textAnchor="middle"
                    fontSize="12"
                    fill="rgba(255, 255, 255, 0.8)"
                    className={styles.axisLabel}
                    transform={`rotate(-45 ${x + barWidth / 2} ${margin.top + innerHeight + 20})`}
                  >
                    {item[xKey]}
                  </text>

                  {/* 툴팁 */}
                  {isHovered && (
                    <g className={styles.tooltip}>
                      <rect
                        x={x + barWidth / 2 - 40}
                        y={y - 50}
                        width="80"
                        height="40"
                        fill="#1f2937"
                        rx="4"
                        className={styles.tooltipBackground}
                      />
                      <text
                        x={x + barWidth / 2}
                        y={y - 35}
                        textAnchor="middle"
                        fontSize="12"
                        fill="white"
                        className={styles.tooltipText}
                      >
                        {item[xKey]}
                      </text>
                      <text
                        x={x + barWidth / 2}
                        y={y - 18}
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
