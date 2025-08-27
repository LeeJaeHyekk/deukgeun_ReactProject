import React from "react"
import styles from "./ProgressChart.module.css"

interface ProgressChartData {
  day: string
  value: number
}

interface ProgressChartProps {
  data: ProgressChartData[]
  title?: string
  unit?: string
  color?: string
}

export function ProgressChart({
  data,
  title,
  unit = "%",
  color = "#f59e0b",
}: ProgressChartProps) {
  console.log("ProgressChart 렌더링:", { data, title, unit, color })

  // 데이터 검증 및 로깅
  const hasValidData =
    data && data.length > 0 && data.some(item => item.value > 0)
  console.log("차트 데이터 유효성:", { hasValidData, dataLength: data?.length })

  // 데이터가 있고 유효한 경우 실제 차트를 렌더링
  if (hasValidData) {
    return (
      <div className={styles.progressChart}>
        <div className={styles.chartContainer}>
          <div className={styles.chartTitle}>
            <h4>{title || "주간 진행률"}</h4>
          </div>
          <div className={styles.chartBody}>
            <div className={styles.chartBars}>
              {data.map((item, index) => {
                console.log(`차트 바 ${index}:`, item)
                return (
                  <div key={index} className={styles.chartBar}>
                    {/* 수치 표기 */}
                    <div className={styles.barValue}>
                      {item.value}
                      {unit}
                    </div>
                    {/* 바 차트 */}
                    <div
                      className={styles.bar}
                      style={{
                        height: `${Math.max(item.value * 2, 15)}px`,
                        background: color,
                      }}
                    />
                    {/* 요일 표기 */}
                    <span className={styles.barLabel}>{item.day}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 데이터가 없거나 유효하지 않은 경우 플레이스홀더 렌더링
  console.log("플레이스홀더 렌더링")
  return (
    <div className={styles.progressChart}>
      <div className={styles.chartPlaceholder}>
        <div className={styles.chartIcon}>📊</div>
        <h3 className={styles.chartMessage}>데이터가 없습니다</h3>
        <p className={styles.chartDescription}>
          운동 기록을 추가하면 여기에 차트가 표시됩니다.
        </p>
      </div>
    </div>
  )
}
