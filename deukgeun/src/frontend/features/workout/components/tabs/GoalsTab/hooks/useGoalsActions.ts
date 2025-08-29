import { useCallback } from "react"
import { useWorkoutGoalsActions } from "../../../../hooks/useWorkoutStore"

export function useGoalsActions(onDeleteGoal: (goalId: number) => void) {
  const { deleteGoal } = useWorkoutGoalsActions()

  const handleDeleteGoal = useCallback(
    async (goalId: number) => {
      try {
        await deleteGoal(goalId)
        onDeleteGoal(goalId)
      } catch (error) {
        console.error("목표 삭제 실패:", error)
      }
    },
    [deleteGoal, onDeleteGoal]
  )

  return {
    handleDeleteGoal,
  }
}
