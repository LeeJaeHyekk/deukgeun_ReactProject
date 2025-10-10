import React from "react"
import { WorkoutStats, WorkoutSessionDTO } from "../../types"

interface WorkoutProgressSectionProps {
  workoutStats: WorkoutStats
  completedSessions: WorkoutSessionDTO[]
}

export function WorkoutProgressSection({
  workoutStats,
  completedSessions,
}: WorkoutProgressSectionProps) {
  return (
    <section className="workout-section" id="workoutProgress">
      <div className="workout-section-header">
        <div>
          <h2 className="workout-section-title">운동 진행 상황</h2>
          <p className="workout-section-description">
            DB에 저장된 운동 세션 정보를 기반으로 월 단위와 년 단위 진행 상황을
            시각화
          </p>
        </div>
      </div>

      <div className="progress-graphs">
        <div className="graph-container">
          <h3>월별 진행 현황</h3>
          <div className="graph-placeholder">월별 차트 (구현 예정)</div>
        </div>

        <div className="graph-container">
          <h3>년별 진행 현황</h3>
          <div className="graph-placeholder">년별 차트 (구현 예정)</div>
        </div>
      </div>
    </section>
  )
}
