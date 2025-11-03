// ============================================================================
// Workout Persistence Middleware - Redux 상태를 localStorage에 저장
// ============================================================================

import { Middleware } from "@reduxjs/toolkit"

const WORKOUT_STORAGE_KEY = "workout_state"

export const workoutPersistenceMiddleware: Middleware = (storeAPI) => (next) => (action: any) => {
  const result = next(action)
  const state = storeAPI.getState()

  // workout 관련 액션인 경우 localStorage에 저장
  const workoutActions = [
    "workout/addGoal",
    "workout/editGoal",
    "workout/deleteGoal",
    "workout/startSession",
    "workout/pauseWorkout",
    "workout/endSessionAndCompleteGoal",
    "workout/recordSet",
    "workout/undoSet",
    "workout/updateTask",
    "workout/deleteTask",
    "workout/quickAddTaskToActive",
    "workout/updateUserExpDirect",
    "workout/setWorkoutData",
  ]

  if (workoutActions.some((actionType) => action.type.includes(actionType.split("/")[1]))) {
    try {
      const workoutState = state.workout
      // activeWorkout은 세션 중에만 유지되므로 저장하지 않음
      // 하지만 goal.tasks의 completedSets는 저장하여 진행 상태 유지
      const stateToSave = {
        ...workoutState,
        activeWorkout: null, // activeWorkout은 저장하지 않음 (재시작 시 초기화)
        // goals의 tasks는 저장되므로 completedSets 포함 진행 상태 유지됨
      }
      localStorage.setItem(WORKOUT_STORAGE_KEY, JSON.stringify(stateToSave))
      
      // recordSet, undoSet, pauseWorkout 시 상세 로그 출력
      if (action.type.includes("recordSet") || action.type.includes("undoSet") || action.type.includes("pauseWorkout")) {
        // 저장된 goals의 completedSets 확인
        const totalCompletedSets = workoutState.goals.reduce((sum, goal) => {
          return sum + (goal.tasks?.reduce((taskSum, task) => taskSum + (task.completedSets || 0), 0) || 0)
        }, 0)
        
        console.log("💾 진행 상태 저장됨 (localStorage)", {
          action: action.type,
          totalGoals: workoutState.goals.length,
          totalCompletedSets,
          goals: workoutState.goals.map(g => ({
            goalId: g.goalId,
            title: g.title,
            completedSets: g.tasks?.reduce((sum, t) => sum + (t.completedSets || 0), 0) || 0,
            tasks: g.tasks?.map(t => ({
              taskId: t.taskId,
              name: t.name,
              completedSets: t.completedSets,
              setCount: t.setCount
            })) || []
          }))
        })
      }
    } catch (error) {
      console.error("💾 [workoutPersistenceMiddleware] localStorage 저장 실패:", error)
    }
  }

  return result
}

// 초기 상태 복원 함수
export function loadWorkoutStateFromStorage() {
  try {
    const savedState = localStorage.getItem(WORKOUT_STORAGE_KEY)
    if (savedState) {
      return JSON.parse(savedState)
    }
  } catch (error) {
    console.error("💾 [loadWorkoutStateFromStorage] localStorage 로드 실패:", error)
  }
  return null
}

