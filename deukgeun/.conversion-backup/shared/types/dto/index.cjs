"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isUserDTO = isUserDTO;
exports.isWorkoutPlanDTO = isWorkoutPlanDTO;
exports.isWorkoutPlanExerciseDTO = isWorkoutPlanExerciseDTO;
exports.isWorkoutSessionDTO = isWorkoutSessionDTO;
exports.isWorkoutGoalDTO = isWorkoutGoalDTO;
exports.isMachineDTO = isMachineDTO;
__exportStar(require('./workoutPlanExercise.types.cjs'), exports);
__exportStar(require('../utils/transform/workoutPlanExercise.cjs'), exports);
function isUserDTO(obj) {
    return (typeof obj === 'object' &&
        obj !== null &&
        'id' in obj &&
        'email' in obj &&
        'nickname' in obj &&
        'role' in obj);
}
function isWorkoutPlanDTO(obj) {
    return (typeof obj === 'object' &&
        obj !== null &&
        'id' in obj &&
        'userId' in obj &&
        'name' in obj &&
        'difficulty' in obj &&
        'exercises' in obj);
}
function isWorkoutPlanExerciseDTO(obj) {
    return (typeof obj === 'object' &&
        obj !== null &&
        'id' in obj &&
        'planId' in obj &&
        'exerciseId' in obj &&
        'exerciseOrder' in obj &&
        'sets' in obj &&
        'repsRange' in obj &&
        'restSeconds' in obj);
}
function isWorkoutSessionDTO(obj) {
    return (typeof obj === 'object' &&
        obj !== null &&
        'id' in obj &&
        'userId' in obj &&
        'name' in obj &&
        'startTime' in obj &&
        'status' in obj);
}
function isWorkoutGoalDTO(obj) {
    return (typeof obj === 'object' &&
        obj !== null &&
        'id' in obj &&
        'userId' in obj &&
        'title' in obj &&
        'type' in obj &&
        'targetValue' in obj);
}
function isMachineDTO(obj) {
    return (typeof obj === 'object' &&
        obj !== null &&
        'id' in obj &&
        'name' in obj &&
        'category' in obj);
}
