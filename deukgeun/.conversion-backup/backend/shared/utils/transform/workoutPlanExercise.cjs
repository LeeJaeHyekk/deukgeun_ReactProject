"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isWorkoutPlanExerciseAPI = isWorkoutPlanExerciseAPI;
exports.isWorkoutPlanExercise = isWorkoutPlanExercise;
exports.isWorkoutPlanExerciseForm = isWorkoutPlanExerciseForm;
exports.toWorkoutPlanExercise = toWorkoutPlanExercise;
exports.toWorkoutPlanExerciseList = toWorkoutPlanExerciseList;
exports.fromLegacyToWorkoutPlanExercise = fromLegacyToWorkoutPlanExercise;
exports.toCreateWorkoutPlanExerciseAPI = toCreateWorkoutPlanExerciseAPI;
exports.toUpdateWorkoutPlanExerciseAPI = toUpdateWorkoutPlanExerciseAPI;
exports.safeToWorkoutPlanExercise = safeToWorkoutPlanExercise;
exports.safeToWorkoutPlanExerciseList = safeToWorkoutPlanExerciseList;
exports.normalizeWorkoutPlanExerciseForm = normalizeWorkoutPlanExerciseForm;
exports.createEmptyWorkoutPlanExerciseForm = createEmptyWorkoutPlanExerciseForm;
function isWorkoutPlanExerciseAPI(obj) {
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
function isWorkoutPlanExercise(obj) {
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
function isWorkoutPlanExerciseForm(obj) {
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
function toWorkoutPlanExercise(api) {
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
    };
}
function toWorkoutPlanExerciseList(apiList) {
    return apiList.map(toWorkoutPlanExercise);
}
function fromLegacyToWorkoutPlanExercise(legacy) {
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
    };
}
function toCreateWorkoutPlanExerciseAPI(domain) {
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
    };
}
function toUpdateWorkoutPlanExerciseAPI(domain) {
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
    };
}
function safeToWorkoutPlanExercise(obj) {
    if (isWorkoutPlanExerciseAPI(obj)) {
        return toWorkoutPlanExercise(obj);
    }
    if (isWorkoutPlanExercise(obj)) {
        return obj;
    }
    return null;
}
function safeToWorkoutPlanExerciseList(obj) {
    if (Array.isArray(obj)) {
        return obj
            .map(safeToWorkoutPlanExercise)
            .filter((item) => item !== null);
    }
    return [];
}
function normalizeWorkoutPlanExerciseForm(form) {
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
    };
}
function createEmptyWorkoutPlanExerciseForm(planId) {
    return {
        planId,
        exerciseId: 0,
        exerciseName: "",
        exerciseOrder: 0,
        sets: 1,
        repsRange: { min: 1, max: 1 },
        restSeconds: 60,
    };
}
