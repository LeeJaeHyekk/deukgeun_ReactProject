// ============================================================================
// Workout Selectors - 메모이제이션된 Selectors
// ============================================================================

import { createSelector } from '@reduxjs/toolkit'
import type { RootState } from '@frontend/shared/store'
import type { Goal, CompletedWorkout } from '../slices/workoutSlice'
import { calcGoalProgress } from '../utils/goalUtils'

// Base selectors
const selectWorkoutState = (state: RootState) => state.workout
const selectGoalsArray = (state: RootState) => state.workout.goals
const selectCompletedWorkoutsArray = (state: RootState) => state.workout.completedWorkouts

// Memoized selectors
export const selectUser = createSelector(
  [selectWorkoutState],
  (workout) => workout.user
)

export const selectActiveWorkout = createSelector(
  [selectWorkoutState],
  (workout) => workout.activeWorkout
)

export const selectGoals = createSelector(
  [selectGoalsArray],
  (goals): Goal[] => {
    // 중복 제거 및 안정화
    const seen = new Set<string>()
    const uniqueGoals: Goal[] = []
    
    for (const goal of goals) {
      if (!seen.has(goal.goalId)) {
        seen.add(goal.goalId)
        uniqueGoals.push(goal)
      }
    }
    
    return uniqueGoals
  }
)

export const selectCompletedWorkouts = createSelector(
  [selectCompletedWorkoutsArray],
  (workouts): CompletedWorkout[] => {
    // 중복 제거 및 안정화
    const seen = new Set<string>()
    const uniqueWorkouts: CompletedWorkout[] = []
    
    for (const workout of workouts) {
      if (!seen.has(workout.completedId)) {
        seen.add(workout.completedId)
        uniqueWorkouts.push(workout)
      }
    }
    
    return uniqueWorkouts
  }
)

export const selectGoalById = createSelector(
  [selectGoalsArray, (_: RootState, goalId: string) => goalId],
  (goals, goalId): Goal | undefined =>
    goals.find((g: Goal) => g.goalId === goalId)
)

export const selectCompletedWorkoutById = createSelector(
  [selectCompletedWorkoutsArray, (_: RootState, completedId: string) => completedId],
  (workouts, completedId): CompletedWorkout | undefined =>
    workouts.find((w: CompletedWorkout) => w.completedId === completedId)
)

export const selectWorkoutStatus = createSelector(
  [selectWorkoutState],
  (workout) => workout.status
)

export const selectWorkoutError = createSelector(
  [selectWorkoutState],
  (workout) => workout.error
)

/**
 * 활성 목표의 진행률을 계산하는 Selector (성능 최적화)
 */
export const selectActiveGoalProgress = createSelector(
  [selectActiveWorkout, selectGoalsArray],
  (activeWorkout, goals): number => {
    if (!activeWorkout) return 0
    const goal = goals.find((g: Goal) => g.goalId === activeWorkout.goalId)
    return goal ? calcGoalProgress(goal) : 0
  }
)

/**
 * 활성 목표를 반환하는 Selector (최적화)
 */
export const selectActiveGoal = createSelector(
  [selectActiveWorkout, selectGoalsArray],
  (activeWorkout, goals): Goal | undefined => {
    if (!activeWorkout) return undefined
    return goals.find((g: Goal) => g.goalId === activeWorkout.goalId)
  }
)

