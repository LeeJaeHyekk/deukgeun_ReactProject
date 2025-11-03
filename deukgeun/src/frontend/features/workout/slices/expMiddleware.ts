// ============================================================================
// EXP Middleware - EXP/레벨 자동 갱신 로직
// ============================================================================

import { Middleware } from "redux"
import type { UnknownAction } from "redux"
import {
  endSessionAndCompleteGoal,
  endSessionAndSaveToBackend,
  updateUserExpDirect,
  WorkoutState,
  setWorkoutData,
} from "./workoutSlice"

/**
 * EXP 정책 예시:
 * - 기본: 완료된 세션에서 계산된 expEarned를 더함
 * - 레벨업: 레벨업 임계치는 level * 1000 (예시)
 * - 실제 서비스에서는 서버에서 계산 및 검증 필요
 */

const calcLevelFromExp = (exp: number): number => {
  // 안정적인 레벨 계산: level = floor(sqrt(exp / 100)) + 1
  // 무한루프 방지 및 최소 레벨 보장
  return Math.max(1, Math.floor(Math.sqrt(exp / 100)) + 1)
}

export const expMiddleware: Middleware = (storeAPI) => (next) => (action: unknown) => {
  const prevState = storeAPI.getState()
  const returned = next(action)
  const nextState = storeAPI.getState()

  // 세션 종료 + 완료 액션을 잡아서 EXP를 부여
  if (typeof action === 'object' && action !== null && 'type' in action &&
    action.type === endSessionAndCompleteGoal.type) {
    // 최근 추가된 completedWorkouts 추출
    const prevLen = (prevState.workout as WorkoutState).completedWorkouts.length
    const nextLen = (nextState.workout as WorkoutState).completedWorkouts.length

    if (nextLen > prevLen) {
      const completed = nextState.workout.completedWorkouts[nextLen - 1]
      const expToAdd = completed.expEarned || 0

      // 1) 클라이언트 상태에 바로 반영 (optimistic)
      const currentExp = (nextState.workout as WorkoutState).user?.exp || 0
      const newExp = currentExp + expToAdd
      storeAPI.dispatch(updateUserExpDirect(newExp) as UnknownAction)

      // 2) 백엔드에 저장
      // prevState에서 activeWorkout 가져오기 (endSessionAndCompleteGoal 후에는 null이 됨)
      const prevWorkoutState = prevState.workout as WorkoutState
      const activeWorkout = prevWorkoutState.activeWorkout
      const user = (nextState.workout as WorkoutState).user
      
      if (activeWorkout && user?.userId) {
        // 백엔드에 저장
        storeAPI.dispatch(
          endSessionAndSaveToBackend({
            sessionId: activeWorkout.sessionId,
            goalId: activeWorkout.goalId,
            userId: user.userId,
            completedWorkout: completed,
          }) as UnknownAction
        )
      }

      // updateUserExpDirect에서 이미 레벨 계산이 포함되어 있으므로
      // 여기서는 별도로 처리할 필요 없음 (무한루프 방지)
    }
  }
  return returned
}
