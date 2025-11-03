// ============================================================================
// GoalSettingPanel - 목표 설정 탭 (메모이제이션 최적화)
// ============================================================================

import React, { useState, useCallback, memo } from "react"
import type { Goal } from "../slices/workoutSlice"
import { useWorkoutGoals } from "../hooks/useWorkoutGoals"
import { GoalCard } from "./GoalCard"
import { AddGoalModal } from "./AddGoalModal"
import { EmptyState } from "./common"
import styles from "./GoalSettingPanel.module.css"

function GoalSettingPanelComponent() {
  const { goals, activeWorkout, handleStartWorkout, canEditGoal } = useWorkoutGoals()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)

  const handleEditGoal = useCallback((goal: Goal) => {
    setEditingGoal(goal)
    setIsModalOpen(true)
  }, [])

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false)
    setEditingGoal(null)
  }, [])

  const handleAddGoalClick = useCallback(() => {
    setEditingGoal(null)
    setIsModalOpen(true)
  }, [])

  return (
    <div className={styles.goalSettingPanel}>
      <div className={styles.header}>
        <h2>운동 목표</h2>
        <button onClick={handleAddGoalClick} className={styles.addButton}>
          새 목표 추가
        </button>
      </div>

      <div className={styles.goalList}>
        {goals.length === 0 ? (
          <EmptyState
            message="아직 등록된 목표가 없습니다."
            secondaryMessage="새 목표를 추가해서 운동을 시작해보세요!"
          />
        ) : (
          goals.map((goal: Goal) => (
            <GoalCard
              key={goal.goalId}
              goal={goal}
              isActive={activeWorkout?.goalId === goal.goalId}
              onStart={() => handleStartWorkout(goal.goalId)}
              onEdit={() => handleEditGoal(goal)}
              canEdit={canEditGoal(goal.goalId)}
            />
          ))
        )}
      </div>

      {isModalOpen && (
        <AddGoalModal
          initial={editingGoal || undefined}
          onClose={handleCloseModal}
        />
      )}
    </div>
  )
}

// React.memo로 메모이제이션
export const GoalSettingPanel = memo(GoalSettingPanelComponent)

