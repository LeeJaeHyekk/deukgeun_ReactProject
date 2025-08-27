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
          <div className={styles.chartContent}>
            {/* 실제 차트 구현 - 여기에 Chart.js나 Recharts를 사용할 수 있습니다 */}
            <div style={{ textAlign: "center", color: "#ffffff" }}>
              <h4 style={{ margin: "0 0 16px 0", fontSize: "1.1rem" }}>
                {title || "주간 진행률"}
              </h4>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-around",
                  alignItems: "flex-end",
                  height: "120px",
                }}
              >
                {data.map((item, index) => (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                    }}
                  >
                    <div
                      style={{
                        width: "20px",
                        height: `${Math.max(item.value * 1.2, 10)}px`,
                        backgroundColor: color,
                        borderRadius: "4px 4px 0 0",
                        marginBottom: "8px",
                        transition: "height 0.3s ease",
                      }}
                    />
                    <span
                      style={{
                        fontSize: "0.75rem",
                        color: "rgba(255, 255, 255, 0.8)",
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
