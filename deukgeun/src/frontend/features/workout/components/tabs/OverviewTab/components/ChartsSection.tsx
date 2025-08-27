import React from "react"
import { ProgressChart } from "../../../../components/charts/ProgressChart"
import { PieChart } from "../../../../components/charts/PieChart"
import type { DashboardData } from "../../../../../../shared/api/workoutJournalApi"
import styles from "./ChartsSection.module.css"

interface ChartsSectionProps {
  dashboardData: DashboardData
}

export const ChartsSection: React.FC<ChartsSectionProps> = ({
  dashboardData,
}) => {
  // 기구 사용률 데이터 생성 (실제 데이터 기반)
  const generateMachineUsageData = () => {
    // 기본 데이터 제공 (실제 데이터 연동은 추후 구현)
    return [
      { name: "벤치프레스", value: 35 },
      { name: "스쿼트랙", value: 25 },
      { name: "레그프레스", value: 20 },
      { name: "덤벨", value: 15 },
      { name: "기타", value: 5 },
    ]
  }

  // 주간 운동 현황 데이터 생성
  const generateWeeklyProgressData = () => {
    // 기본 데이터 제공 (실제 데이터 연동은 추후 구현)
    return [
      { day: "월", value: 60 },
      { day: "화", value: 80 },
      { day: "수", value: 40 },
      { day: "목", value: 90 },
      { day: "금", value: 70 },
      { day: "토", value: 50 },
      { day: "일", value: 30 },
    ]
  }

  return (
    <section className={styles.chartsSection}>
      <h3>📈 분석 차트</h3>
      <div className={styles.chartsGrid}>
        <div className={styles.chartContainer}>
          <h4>주간 운동 현황</h4>
          <div className={styles.chartContent}>
            <ProgressChart data={generateWeeklyProgressData()} />
          </div>
        </div>
        <div className={styles.chartContainer}>
          <h4>기구 사용률</h4>
          <div className={styles.pieChartContainer}>
            <div className={styles.pieChartWrapper}>
              <PieChart
                data={generateMachineUsageData()}
                title=""
                height={180}
                width={180}
                showLegend={false}
              />
            </div>
            <div className={styles.legendWrapper}>
              <h5
                style={{
                  margin: "0 0 16px 0",
                  fontSize: "1.1rem",
                  color: "#ffffff",
                  textAlign: "center",
                  fontWeight: "600",
                }}
              >
                기구별 사용률
              </h5>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                {generateMachineUsageData().map((item, index) => {
                  const total = generateMachineUsageData().reduce(
                    (sum, d) => sum + d.value,
                    0
                  )
                  const percentage = ((item.value / total) * 100).toFixed(1)
                  const colors = [
                    "#3b82f6",
                    "#ef4444",
                    "#10b981",
                    "#f59e0b",
                    "#8b5cf6",
                  ]

                  return (
                    <div
                      key={index}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        padding: "8px 12px",
                        background: "rgba(255, 255, 255, 0.1)",
                        borderRadius: "8px",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                      }}
                    >
                      <div
                        style={{
                          width: "12px",
                          height: "12px",
                          backgroundColor: colors[index % colors.length],
                          borderRadius: "2px",
                          flexShrink: 0,
                        }}
                      />
                      <span
                        style={{
                          flex: 1,
                          fontSize: "0.9rem",
                          color: "rgba(255, 255, 255, 0.9)",
                          fontWeight: "500",
                        }}
                      >
                        {item.name}
                      </span>
                      <span
                        style={{
                          fontSize: "0.9rem",
                          fontWeight: "600",
                          color: "#ffffff",
                          textShadow: "0 1px 2px rgba(0, 0, 0, 0.3)",
                        }}
                      >
                        {percentage}%
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
