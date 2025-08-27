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
          <div className={styles.chartContent}>
            <PieChart
              data={generateMachineUsageData()}
              title="기구별 사용률"
              height={200}
              width={250}
              showLegend={true}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
