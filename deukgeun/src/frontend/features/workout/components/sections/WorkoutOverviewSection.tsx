import React from "react"
import { WorkoutPlanCard } from "../cards/WorkoutPlanCard"
import { WorkoutStatsCard } from "../cards/WorkoutStatsCard"
import { WorkoutPlanDTO, WorkoutStats, WorkoutSessionDTO } from "../../types"

interface WorkoutOverviewSectionProps {
  workoutPlans: WorkoutPlanDTO[]
  workoutStats: WorkoutStats
  activeSessions: WorkoutSessionDTO[]
}

export function WorkoutOverviewSection({
  workoutPlans,
  workoutStats,
  activeSessions,
}: WorkoutOverviewSectionProps) {
  return (
    <section className="workout-section" id="overview">
      <div className="workout-section-header">
        <div>
          <h2 className="workout-section-title">개요</h2>
          <p className="workout-section-description">
            현재 진행중인 운동 계획과 주요 통계를 카드 형태로 표시
          </p>
        </div>
      </div>

      <div className="card-list desktop-3 tablet-2 mobile-1">
        {/* 운동 계획 카드들 */}
        {workoutPlans.slice(0, 3).map(plan => (
          <WorkoutPlanCard
            key={plan.id}
            plan={plan}
            onViewDetails={() => console.log("View details:", plan.id)}
            onEdit={() => console.log("Edit plan:", plan.id)}
            onDelete={() => console.log("Delete plan:", plan.id)}
          />
        ))}

        {/* 통계 카드 */}
        <WorkoutStatsCard stats={workoutStats} />
      </div>
    </section>
  )
}
