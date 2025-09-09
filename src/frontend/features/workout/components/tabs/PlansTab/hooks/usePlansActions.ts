import { useCallback } from "react"
import { useWorkoutPlans } from "../../../../hooks/useWorkoutPlans"

export function usePlansActions(onDeletePlan: () => void) {
  const { deletePlan } = useWorkoutPlans()

  const handleDeletePlan = useCallback(
    async (planId: number) => {
      try {
        await deletePlan(planId)
        onDeletePlan()
      } catch (error) {
        console.error("계획 삭제 실패:", error)
      }
    },
    [deletePlan, onDeletePlan]
  )

  return {
    handleDeletePlan,
  }
}
