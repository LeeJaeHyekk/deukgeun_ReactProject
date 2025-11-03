// ============================================================================
// Workout Middleware - 세트 완료 시 자동 휴식 타이머 시작
// ============================================================================

import { Middleware } from "redux"
import type { UnknownAction } from "redux"
import { recordSet, endSessionAndCompleteGoal, endSessionAndSaveToBackend, type Goal, type Task } from "./workoutSlice"
import { RootState } from "@frontend/shared/store"

// 휴식 타이머를 시작하는 액션 (RestTimer 컴포넌트에서 사용)
export const START_REST_TIMER = "workout/startRestTimer"
export const STOP_REST_TIMER = "workout/stopRestTimer"

export const workoutMiddleware: Middleware = (storeAPI) => (next) => (action: unknown) => {
  const result = next(action)

  // recordSet 액션이 완료되면 휴식 타이머 시작
  if (typeof action === 'object' && action !== null && 'type' in action && action.type === recordSet.type) {
    const state = storeAPI.getState()
    const activeWorkout = state.workout.activeWorkout

    if (activeWorkout) {
      // 모든 세트가 완료되지 않았다면 휴식 타이머 시작
      const goal = state.workout.goals.find((g: Goal) => g.goalId === activeWorkout.goalId)
      if (goal) {
        const allTasksCompleted = goal.tasks.every(
          (t: Task) => t.completedSets >= t.setCount
        )

        if (!allTasksCompleted) {
          // 휴식 타이머는 클라이언트 상태로 관리되므로 여기서는 액션만 dispatch
          // 실제 타이머는 RestTimer 컴포넌트에서 관리
          storeAPI.dispatch({ type: START_REST_TIMER } as UnknownAction)
        } else {
          // 모든 세트 완료 시 자동으로 세션 종료
          storeAPI.dispatch(
            endSessionAndCompleteGoal({ sessionId: activeWorkout.sessionId }) as UnknownAction
          )
        }
      }
    }
  }
  return result
}
