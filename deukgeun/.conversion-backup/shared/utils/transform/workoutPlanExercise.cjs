// ============================================================================
// WorkoutPlanExercise 변환 유틸리티
// API ↔ Domain 변환 및 타입 가드 제공
// ============================================================================
// ============================================================================
// 타입 가드 함수들 (런타임 검증)
// ============================================================================
function isWorkoutPlanExerciseAPI
module.exports.isWorkoutPlanExerciseAPI = isWorkoutPlanExerciseAPI(obj) {
    return (typeof obj === "object" &&
        obj !== null &&
        typeof obj.id === "number" &&
        typeof obj.planId === "number" &&
        typeof obj.exerciseId === "number" &&
        typeof obj.order === "number" &&
        typeof obj.sets === "number" &&
        typeof obj.reps === "number" &&
        typeof obj.restTime === "number" &&
        typeof obj.createdAt === "string" &&
        typeof obj.updatedAt === "string");
}
module.exports.isWorkoutPlanExerciseAPI = isWorkoutPlanExerciseAPI
function isWorkoutPlanExercise
module.exports.isWorkoutPlanExercise = isWorkoutPlanExercise(obj) {
    return (typeof obj === "object" &&
        obj !== null &&
        typeof obj.id === "number" &&
        typeof obj.planId === "number" &&
        typeof obj.exerciseId === "number" &&
        typeof obj.exerciseOrder === "number" &&
        typeof obj.sets === "number" &&
        typeof obj.repsRange === "object" &&
        typeof obj.restSeconds === "number" &&
        typeof obj.isCompleted === "boolean" &&
        typeof obj.progress === "number" &&
        obj.createdAt instanceof Date &&
        obj.updatedAt instanceof Date);
}
module.exports.isWorkoutPlanExercise = isWorkoutPlanExercise
function isWorkoutPlanExerciseForm
module.exports.isWorkoutPlanExerciseForm = isWorkoutPlanExerciseForm(obj) {
    return (typeof obj === "object" &&
        obj !== null &&
        typeof obj.planId === "number" &&
        typeof obj.exerciseId === "number" &&
        typeof obj.exerciseName === "string" &&
        typeof obj.exerciseOrder === "number" &&
        typeof obj.sets === "number" &&
        typeof obj.repsRange === "object" &&
        typeof obj.restSeconds === "number");
}
module.exports.isWorkoutPlanExerciseForm = isWorkoutPlanExerciseForm
// ============================================================================
// 변환 함수들 (API → Domain)
// ============================================================================
/**
 * API 응답을 도메인 객체로 변환
 */
function toWorkoutPlanExercise
module.exports.toWorkoutPlanExercise = toWorkoutPlanExercise(api) {
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
module.exports.toWorkoutPlanExercise = toWorkoutPlanExercise;
}
/**
 * API 응답 배열을 도메인 객체 배열로 변환
 */
function toWorkoutPlanExerciseList
module.exports.toWorkoutPlanExerciseList = toWorkoutPlanExerciseList(apiList) {
    return apiList.map(toWorkoutPlanExercise);
}
module.exports.toWorkoutPlanExerciseList = toWorkoutPlanExerciseList
/**
 * 레거시 객체를 도메인 객체로 변환 (호환성)
 */
function fromLegacyToWorkoutPlanExercise
module.exports.fromLegacyToWorkoutPlanExercise = fromLegacyToWorkoutPlanExercise(legacy) {
    return {
        id: legacy.id,
        planId: legacy.planId,
        exerciseId: legacy.exerciseId,
        machineId: legacy.machineId,
        exerciseName: legacy.exerciseName ?? "Unknown Exercise",
        exerciseOrder: legacy.exerciseOrder ?? legacy.order ?? 0,
        sets: legacy.sets ?? 0,
        repsRange: legacy.repsRange ?? { min: legacy.reps ?? 0, max: legacy.reps ?? 0 }
module.exports.fromLegacyToWorkoutPlanExercise = fromLegacyToWorkoutPlanExercise,
        weightRange: legacy.weightRange ?? (legacy.weight ? { min: legacy.weight, max: legacy.weight } : undefined),
        restSeconds: legacy.restSeconds ?? legacy.restTime ?? 60,
        notes: legacy.notes,
        createdAt: legacy.createdAt,
        updatedAt: legacy.updatedAt,
    };
}
// ============================================================================
// 변환 함수들 (Domain → API)
// ============================================================================
/**
 * 도메인 객체를 API 생성 요청으로 변환
 */
function toCreateWorkoutPlanExerciseAPI
module.exports.toCreateWorkoutPlanExerciseAPI = toCreateWorkoutPlanExerciseAPI(domain) {
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
module.exports.toCreateWorkoutPlanExerciseAPI = toCreateWorkoutPlanExerciseAPI;
}
/**
 * 도메인 객체를 API 업데이트 요청으로 변환
 */
function toUpdateWorkoutPlanExerciseAPI
module.exports.toUpdateWorkoutPlanExerciseAPI = toUpdateWorkoutPlanExerciseAPI(domain) {
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
module.exports.toUpdateWorkoutPlanExerciseAPI = toUpdateWorkoutPlanExerciseAPI;
}
// ============================================================================
// 유틸리티 함수들
// ============================================================================
/**
 * 안전한 변환 (타입 가드 통과 후 변환)
 */
function safeToWorkoutPlanExercise
module.exports.safeToWorkoutPlanExercise = safeToWorkoutPlanExercise(obj) {
    if (isWorkoutPlanExerciseAPI(obj)) {
        return toWorkoutPlanExercise(obj);
    }
module.exports.safeToWorkoutPlanExercise = safeToWorkoutPlanExercise
    if (isWorkoutPlanExercise(obj)) {
        return obj;
    }
    return null;
}
/**
 * 안전한 배열 변환
 */
function safeToWorkoutPlanExerciseList
module.exports.safeToWorkoutPlanExerciseList = safeToWorkoutPlanExerciseList(obj) {
    if (Array.isArray(obj)) {
        return obj
            .map(safeToWorkoutPlanExercise)
            .filter((item) => item !== null);
    }
module.exports.safeToWorkoutPlanExerciseList = safeToWorkoutPlanExerciseList
    return [];
}
/**
 * 폼 데이터 검증 및 정규화
 */
function normalizeWorkoutPlanExerciseForm
module.exports.normalizeWorkoutPlanExerciseForm = normalizeWorkoutPlanExerciseForm(form) {
    return {
        id: form.id,
        planId: form.planId ?? 0,
        exerciseId: form.exerciseId ?? 0,
        exerciseName: form.exerciseName ?? "",
        exerciseOrder: form.exerciseOrder ?? 0,
        sets: form.sets ?? 1,
        repsRange: form.repsRange ?? { min: 1, max: 1 }
module.exports.normalizeWorkoutPlanExerciseForm = normalizeWorkoutPlanExerciseForm,
        weightRange: form.weightRange,
        restSeconds: form.restSeconds ?? 60,
        notes: form.notes,
        machineId: form.machineId,
    };
}
/**
 * 기본값으로 초기화된 폼 데이터 생성
 */
function createEmptyWorkoutPlanExerciseForm
module.exports.createEmptyWorkoutPlanExerciseForm = createEmptyWorkoutPlanExerciseForm(planId) {
    return {
        planId,
        exerciseId: 0,
        exerciseName: "",
        exerciseOrder: 0,
        sets: 1,
        repsRange: { min: 1, max: 1 }
module.exports.createEmptyWorkoutPlanExerciseForm = createEmptyWorkoutPlanExerciseForm,
        restSeconds: 60,
    };
}
