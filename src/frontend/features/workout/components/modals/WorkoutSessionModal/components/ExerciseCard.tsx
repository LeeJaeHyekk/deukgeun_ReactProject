import React from "react"
import { Check, Timer } from "lucide-react"
import type { Machine } from "@dto/index"

interface ExerciseCardProps {
  exercise: any
  machine?: Machine
  isCurrent: boolean
  isCompleted: boolean
  completedSets: number
  totalSets: number
  onCompleteSet: () => void
  onStartRest: (seconds: number) => void
  order: number
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({
  exercise,
  machine,
  isCurrent,
  isCompleted,
  completedSets,
  totalSets,
  onCompleteSet,
  onStartRest,
  order,
}) => {
  const renderSetProgress = () => {
    const dots = []
    for (let i = 0; i < totalSets; i++) {
      const isSetCompleted = i < completedSets
      const isCurrentSet = i === completedSets && isCurrent
      dots.push(
        <span
          key={i}
          className={`set-dot ${isSetCompleted ? "completed" : ""} ${isCurrentSet ? "current" : ""}`}
        >
          ●
        </span>
      )
    }
    return <div className="set-progress-dots">{dots}</div>
  }

  return (
    <div
      className={`exercise-card ${isCurrent ? "active" : ""} ${isCompleted ? "completed" : ""}`}
    >
      <div className="exercise-order">{order}</div>
      <div className="exercise-content">
        <div className="exercise-header">
          <h4>{machine?.name || exercise.exerciseName || "알 수 없는 기구"}</h4>
          <div className="exercise-status">
            {isCompleted && <Check size={16} className="completed-icon" />}
          </div>
        </div>
        <div className="exercise-details">
          <span className="exercise-targets">
            {totalSets}세트 × {exercise.reps || 10}회
            {exercise.weight && ` (${exercise.weight}kg)`}
          </span>
          <span className="exercise-progress">
            {completedSets}/{totalSets} 세트 완료
          </span>
        </div>
        {renderSetProgress()}
        <div className="exercise-controls">
          <button
            onClick={() =>
              onStartRest(
                exercise.restTime ||
                  exercise.restSeconds ||
                  exercise.rest_time ||
                  60
              )
            }
            className="rest-btn"
            disabled={isCompleted}
          >
            <Timer size={14} />
            휴식 (
            {exercise.restTime ||
              exercise.restSeconds ||
              exercise.rest_time ||
              60}
            초)
          </button>
          <button
            onClick={onCompleteSet}
            className="complete-set-btn"
            disabled={isCompleted || !isCurrent}
          >
            <Check size={16} /> 세트 완료
          </button>
        </div>
      </div>
    </div>
  )
}
