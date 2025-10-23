// ============================================================================
// WorkoutPlanExercise 변환 유틸리티
// API ↔ Domain 변환 및 타입 가드 제공
// ============================================================================

import {
  WorkoutPlanExercise,
  WorkoutPlanExerciseForm,
  CreateWorkoutPlanExercise,
  UpdateWorkoutPlanExercise,
} from "../../types/dto/workoutPlanExercise.types"

// ============================================================================
// 타입 가드 함수들 (런타임 검증)
// ============================================================================

export function isWorkoutPlanExerciseAPI(obj: unknown): obj is WorkoutPlanExercise {
  return (
    typeof obj === "object" &&
    obj !== null &&
    typeof (obj as any).id === "number" &&
    typeof (obj as any).planId === "number" &&
    typeof (obj as any).exerciseId === "number" &&
    typeof (obj as any).order === "number" &&
    typeof (obj as any).sets === "number" &&
    typeof (obj as any).reps === "number" &&
    typeof (obj as any).restTime === "number" &&
    typeof (obj as any).createdAt === "string" &&
    typeof (obj as any).updatedAt === "string"
  )
}

export function isWorkoutPlanExercise(obj: unknown): obj is WorkoutPlanExercise {
  return (
    typeof obj === "object" &&
    obj !== null &&
    typeof (obj as any).id === "number" &&
    typeof (obj as any).planId === "number" &&
    typeof (obj as any).exerciseId === "number" &&
    typeof (obj as any).exerciseOrder === "number" &&
    typeof (obj as any).sets === "number" &&
    typeof (obj as any).repsRange === "object" &&
    typeof (obj as any).restSeconds === "number" &&
    typeof (obj as any).isCompleted === "boolean" &&
    typeof (obj as any).progress === "number" &&
    (obj as any).createdAt instanceof Date &&
    (obj as any).updatedAt instanceof Date
  )
}

export function isWorkoutPlanExerciseForm(obj: unknown): obj is WorkoutPlanExerciseForm {
  return (
    typeof obj === "object" &&
    obj !== null &&
    typeof (obj as any).planId === "number" &&
    typeof (obj as any).exerciseId === "number" &&
    typeof (obj as any).exerciseName === "string" &&
    typeof (obj as any).exerciseOrder === "number" &&
    typeof (obj as any).sets === "number" &&
    typeof (obj as any).repsRange === "object" &&
    typeof (obj as any).restSeconds === "number"
  )
}

// ============================================================================
// 변환 함수들 (API → Domain)
// ============================================================================

/**
 * API 응답을 도메인 객체로 변환
 */
export function toWorkoutPlanExercise(api: WorkoutPlanExercise): WorkoutPlanExercise {
  return {
    id: api.id,
    planId: api.planId,
    exerciseId: api.exerciseId,
    machineId: api.machineId,
    exerciseName: api.exerciseName ?? "Unknown Exercise",
    exerciseOrder: api.exerciseOrder,
    sets: api.sets,
    repsRange: api.repsRange,
    weightRange: api.weightRange,
    restSeconds: api.restSeconds,
    notes: api.notes,
    createdAt: new Date(api.createdAt),
    updatedAt: new Date(api.updatedAt),
  }
}

/**
 * API 응답 배열을 도메인 객체 배열로 변환
 */
export function toWorkoutPlanExerciseList(apiList: WorkoutPlanExercise[]): WorkoutPlanExercise[] {
  return apiList.map(toWorkoutPlanExercise)
}

/**
 * 레거시 객체를 도메인 객체로 변환 (호환성)
 */
export function fromLegacyToWorkoutPlanExercise(legacy: any): WorkoutPlanExercise {
  return {
    id: legacy.id,
    planId: legacy.planId,
    exerciseId: legacy.exerciseId,
    machineId: legacy.machineId,
    exerciseName: legacy.exerciseName ?? "Unknown Exercise",
    exerciseOrder: legacy.exerciseOrder ?? legacy.order ?? 0,
    sets: legacy.sets ?? 0,
    repsRange: legacy.repsRange ?? { min: legacy.reps ?? 0, max: legacy.reps ?? 0 },
    weightRange: legacy.weightRange ?? (legacy.weight ? { min: legacy.weight, max: legacy.weight } : undefined),
    restSeconds: legacy.restSeconds ?? legacy.restTime ?? 60,
    notes: legacy.notes,
    createdAt: legacy.createdAt,
    updatedAt: legacy.updatedAt,
  }
}

// ============================================================================
// 변환 함수들 (Domain → API)
// ============================================================================

/**
 * 도메인 객체를 API 생성 요청으로 변환
 */
export function toCreateWorkoutPlanExerciseAPI(domain: WorkoutPlanExerciseForm): CreateWorkoutPlanExercise {
  return {
    planId: domain.planId,
    exerciseId: domain.exerciseId,
    machineId: domain.machineId,
    exerciseName: domain.exerciseName,
    exerciseOrder: domain.exerciseOrder,
    sets: domain.sets,
    repsRange: domain.repsRange,
    weightRange: domain.weightRange,
    restSeconds: domain.restSeconds,
    notes: domain.notes,
  }
}

/**
 * 도메인 객체를 API 업데이트 요청으로 변환
 */
export function toUpdateWorkoutPlanExerciseAPI(domain: WorkoutPlanExercise): UpdateWorkoutPlanExercise {
  return {
    id: domain.id,
    planId: domain.planId,
    exerciseId: domain.exerciseId,
    machineId: domain.machineId,
    exerciseName: domain.exerciseName,
    exerciseOrder: domain.exerciseOrder,
    sets: domain.sets,
    repsRange: domain.repsRange,
    weightRange: domain.weightRange,
    restSeconds: domain.restSeconds,
    notes: domain.notes,
  }
}

// ============================================================================
// 유틸리티 함수들
// ============================================================================

/**
 * 안전한 변환 (타입 가드 통과 후 변환)
 */
export function safeToWorkoutPlanExercise(obj: unknown): WorkoutPlanExercise | null {
  if (isWorkoutPlanExerciseAPI(obj)) {
    return toWorkoutPlanExercise(obj)
  }
  if (isWorkoutPlanExercise(obj)) {
    return obj
  }
  return null
}

/**
 * 안전한 배열 변환
 */
export function safeToWorkoutPlanExerciseList(obj: unknown): WorkoutPlanExercise[] {
  if (Array.isArray(obj)) {
    return obj
      .map(safeToWorkoutPlanExercise)
      .filter((item): item is WorkoutPlanExercise => item !== null)
  }
  return []
}

/**
 * 폼 데이터 검증 및 정규화
 */
export function normalizeWorkoutPlanExerciseForm(form: Partial<WorkoutPlanExerciseForm>): WorkoutPlanExerciseForm {
  return {
    id: form.id,
    planId: form.planId ?? 0,
    exerciseId: form.exerciseId ?? 0,
    exerciseName: form.exerciseName ?? "",
    exerciseOrder: form.exerciseOrder ?? 0,
    sets: form.sets ?? 1,
    repsRange: form.repsRange ?? { min: 1, max: 1 },
    weightRange: form.weightRange,
    restSeconds: form.restSeconds ?? 60,
    notes: form.notes,
    machineId: form.machineId,
  }
}

/**
 * 기본값으로 초기화된 폼 데이터 생성
 */
export function createEmptyWorkoutPlanExerciseForm(planId: number): WorkoutPlanExerciseForm {
  return {
    planId,
    exerciseId: 0,
    exerciseName: "",
    exerciseOrder: 0,
    sets: 1,
    repsRange: { min: 1, max: 1 },
    restSeconds: 60,
  }
}
