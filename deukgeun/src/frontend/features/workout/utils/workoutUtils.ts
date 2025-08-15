// ============================================================================
// Workout 관련 유틸리티 함수들
// ============================================================================

import type {
  WorkoutPlan,
  WorkoutSession,
  WorkoutGoal,
} from "../../../../types"

/**
 * 운동 난이도 색상 반환
 */
export function getDifficultyColor(difficulty: string): string {
  switch (difficulty?.toLowerCase()) {
    case "beginner":
      return "#4caf50"
    case "intermediate":
      return "#ff9800"
    case "advanced":
      return "#f44336"
    default:
      return "#666"
  }
}

/**
 * 운동 난이도 텍스트 반환
 */
export function getDifficultyText(difficulty: string): string {
  switch (difficulty?.toLowerCase()) {
    case "beginner":
      return "초급"
    case "intermediate":
      return "중급"
    case "advanced":
      return "고급"
    default:
      return difficulty || "기본"
  }
}

/**
 * 날짜 포맷팅
 */
export function formatDate(
  date: Date | string,
  options?: Intl.DateTimeFormatOptions
): string {
  try {
    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
    }

    return new Date(date).toLocaleDateString("ko-KR", {
      ...defaultOptions,
      ...options,
    })
  } catch {
    return "날짜 없음"
  }
}

/**
 * 시간 포맷팅 (초 -> HH:MM:SS 또는 MM:SS)
 */
export function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (hours > 0) {
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }
  return `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
}

/**
 * 운동 계획의 총 예상 시간 계산
 */
export function calculatePlanDuration(plan: WorkoutPlan): number {
  if (plan.estimated_duration_minutes) {
    return plan.estimated_duration_minutes
  }

  // exercises가 있는 경우 각 운동의 예상 시간을 합산
  if (plan.exercises && plan.exercises.length > 0) {
    return plan.exercises.reduce((total, exercise) => {
      // 기본적으로 각 운동당 5분 + 휴식시간 2분으로 계산
      const exerciseTime = 5
      const restTime = exercise.restTime ? exercise.restTime / 60 : 2
      return total + exerciseTime + restTime
    }, 0)
  }

  return 0
}

/**
 * 운동 세션의 총 칼로리 계산
 */
export function calculateSessionCalories(session: WorkoutSession): number {
  if (session.caloriesBurned) {
    return session.caloriesBurned
  }

  // 기본 계산: 시간당 300칼로리
  const duration = session.duration || 0
  return Math.round((duration / 60) * 300)
}

/**
 * 운동 목표 진행률 계산
 */
export function calculateGoalProgress(goal: WorkoutGoal): number {
  if (goal.targetValue === 0) return 0
  const progress = (goal.currentValue / goal.targetValue) * 100
  return Math.min(Math.max(progress, 0), 100)
}

/**
 * 운동 목표 상태 확인
 */
export function getGoalStatus(
  goal: WorkoutGoal
): "completed" | "in-progress" | "overdue" {
  if (goal.isCompleted) return "completed"

  if (goal.deadline && new Date() > goal.deadline) {
    return "overdue"
  }

  return "in-progress"
}

/**
 * 운동 계획의 타겟 근육 그룹 정리
 */
export function getTargetMuscleGroups(plan: WorkoutPlan): string[] {
  if (plan.target_muscle_groups && plan.target_muscle_groups.length > 0) {
    return plan.target_muscle_groups
  }

  // exercises에서 근육 그룹 추출 (실제 구현에서는 운동별 근육 그룹 매핑 필요)
  if (plan.exercises && plan.exercises.length > 0) {
    const muscleGroups = new Set<string>()
    plan.exercises.forEach(exercise => {
      // 여기서는 간단한 예시, 실제로는 운동별 근육 그룹 데이터베이스 필요
      if (exercise.exerciseName?.includes("벤치")) {
        muscleGroups.add("가슴")
      } else if (exercise.exerciseName?.includes("스쿼트")) {
        muscleGroups.add("하체")
      } else if (exercise.exerciseName?.includes("데드")) {
        muscleGroups.add("등")
      }
    })
    return Array.from(muscleGroups)
  }

  return []
}

/**
 * 운동 계획의 운동 개수 반환
 */
export function getExerciseCount(plan: WorkoutPlan): number {
  return plan.exercises?.length || 0
}

/**
 * 운동 세션의 총 세트 수 계산
 */
export function calculateTotalSets(session: WorkoutSession): number {
  // 실제 구현에서는 session의 exercises 데이터가 필요
  return 0
}

/**
 * 운동 세션의 총 볼륨 계산 (무게 × 반복수 × 세트수)
 */
export function calculateTotalVolume(session: WorkoutSession): number {
  // 실제 구현에서는 session의 exercises 데이터가 필요
  return 0
}

/**
 * 운동 목표 타입별 단위 반환
 */
export function getGoalUnit(type: WorkoutGoal["type"]): string {
  switch (type) {
    case "weight":
      return "kg"
    case "reps":
      return "회"
    case "duration":
      return "분"
    case "frequency":
      return "회/주"
    case "streak":
      return "일"
    default:
      return ""
  }
}

/**
 * 운동 목표 타입별 한글 이름 반환
 */
export function getGoalTypeName(type: WorkoutGoal["type"]): string {
  switch (type) {
    case "weight":
      return "무게"
    case "reps":
      return "반복수"
    case "duration":
      return "지속시간"
    case "frequency":
      return "빈도"
    case "streak":
      return "연속일수"
    default:
      return type
  }
}

/**
 * 운동 세션 상태 확인
 */
export function getSessionStatus(
  session: WorkoutSession
): "completed" | "in-progress" | "not-started" {
  if (session.isCompleted) return "completed"
  if (session.startTime && !session.endTime) return "in-progress"
  return "not-started"
}

/**
 * 운동 세션 진행률 계산
 */
export function calculateSessionProgress(session: WorkoutSession): number {
  if (session.isCompleted) return 100

  if (session.startTime && session.endTime) {
    const totalDuration =
      session.endTime.getTime() - session.startTime.getTime()
    const elapsed = Date.now() - session.startTime.getTime()
    return Math.min(Math.max((elapsed / totalDuration) * 100, 0), 100)
  }

  return 0
}

/**
 * 운동 계획의 복잡도 점수 계산
 */
export function calculatePlanComplexity(plan: WorkoutPlan): number {
  let complexity = 0

  // 난이도에 따른 점수
  switch (plan.difficulty?.toLowerCase()) {
    case "beginner":
      complexity += 1
      break
    case "intermediate":
      complexity += 2
      break
    case "advanced":
      complexity += 3
      break
  }

  // 운동 개수에 따른 점수
  const exerciseCount = getExerciseCount(plan)
  complexity += Math.min(exerciseCount * 0.5, 5)

  // 예상 시간에 따른 점수
  const duration = calculatePlanDuration(plan)
  complexity += Math.min(duration / 10, 5)

  return Math.round(complexity)
}

/**
 * 운동 계획의 복잡도 레벨 반환
 */
export function getPlanComplexityLevel(
  plan: WorkoutPlan
): "low" | "medium" | "high" {
  const complexity = calculatePlanComplexity(plan)

  if (complexity <= 3) return "low"
  if (complexity <= 6) return "medium"
  return "high"
}
