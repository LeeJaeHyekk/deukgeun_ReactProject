import React from "react"
import type { WorkoutGoal } from "@shared/types"

interface CompletedGoalsSectionProps {
  completedGoals: WorkoutGoal[]
}

export const CompletedGoalsSection: React.FC<CompletedGoalsSectionProps> = ({
  completedGoals,
}) => {
  if (completedGoals.length === 0) {
    return null
  }

  return (
    <section className="completed-goals-section">
      <h3>달성한 목표 ({completedGoals.length})</h3>
      <div className="completed-goals-grid">
        {completedGoals.map(goal => (
          <div key={goal.id} className="completed-goal-card">
            <div className="goal-header">
              <h4>{goal.title}</h4>
              <span className="completion-date">
                {new Date(goal.completedAt || "").toLocaleDateString()}
              </span>
            </div>
            <div className="goal-details">
              <p>
                목표: {goal.targetValue} {goal.unit}
              </p>
              <p>
                달성: {goal.currentValue} {goal.unit}
              </p>
            </div>
            <div className="goal-progress">
              <div className="progress-bar">
                <div
                  className="progress-fill completed"
                  style={{ width: "100%" }}
                ></div>
              </div>
              <span className="progress-text">100% 완료</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
