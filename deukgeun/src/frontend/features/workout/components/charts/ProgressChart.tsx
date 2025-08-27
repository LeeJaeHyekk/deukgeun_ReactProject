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
  color = "#3b82f6",
}: ProgressChartProps) {
  // 데이터가 있고 유효한 경우 실제 차트를 렌더링
  if (data && data.length > 0 && data.some(item => item.value > 0)) {
    return (
      <div className={styles.progressChart}>
        <div className={styles.chartContainer}>
          <div className={styles.chartTitle}>
            <h4
              style={{
                margin: 0,
                fontSize: "1.2rem",
                fontWeight: "600",
                color: "#ffffff",
              }}
            >
              {title || "주간 진행률"}
            </h4>
          </div>
          <div className={styles.chartBody}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-around",
                alignItems: "flex-end",
                height: "180px",
                padding: "0 10px",
                width: "100%",
              }}
            >
              {data.map((item, index) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    position: "relative",
                  }}
                >
                  {/* 수치 표기 */}
                  <div
                    style={{
                      position: "absolute",
                      top: "-25px",
                      fontSize: "0.8rem",
                      fontWeight: "600",
                      color: "#ffffff",
                      textShadow: "0 1px 2px rgba(0, 0, 0, 0.5)",
                    }}
                  >
                    {item.value}
                    {unit}
                  </div>
                  {/* 바 차트 */}
                  <div
                    style={{
                      width: "28px",
                      height: `${Math.max(item.value * 2, 15)}px`,
                      backgroundColor: color,
                      borderRadius: "6px 6px 0 0",
                      marginBottom: "12px",
                      transition: "height 0.3s ease",
                      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
                      position: "relative",
                    }}
                  />
                  {/* 요일 표기 */}
                  <span
                    style={{
                      fontSize: "0.85rem",
                      color: "rgba(255, 255, 255, 0.9)",
                      fontWeight: "500",
                    }}
                  >
                    {item.day}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 데이터가 없거나 유효하지 않은 경우 플레이스홀더 표시
  return (
    <div className={styles.progressChart}>
      <div className={styles.chartPlaceholder}>
        <div className={styles.chartIcon}>📊</div>
        <p className={styles.chartMessage}>차트 데이터가 준비 중입니다</p>
        <p className={styles.chartDescription}>
          운동 데이터를 수집하면 여기에 진행 상황 차트가 표시됩니다.
        </p>
      </div>
    </div>
  )
}
