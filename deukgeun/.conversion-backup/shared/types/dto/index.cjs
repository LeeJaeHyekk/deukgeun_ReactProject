// ============================================================================
// DTO (Data Transfer Object) 타입 정의
// 백엔드와 프론트엔드 간 데이터 전송을 위한 타입들
// ============================================================================
// ============================================================================
// WorkoutPlan DTOs
// ============================================================================
// 새로운 타입 구조 import (먼저 import)
Object.assign(module.exports, require('./workoutPlanExercise.types'));
Object.assign(module.exports, require('../../../../../../shared/utils/transform/workoutPlanExercise'));
// ============================================================================
// 타입 가드 함수들
// ============================================================================
function isUserDTO
module.exports.isUserDTO = isUserDTO(obj) {
    return (typeof obj === 'object' &&
        obj !== null &&
        'id' in obj &&
        'email' in obj &&
        'nickname' in obj &&
        'role' in obj);
}
module.exports.isUserDTO = isUserDTO
function isWorkoutPlanDTO
module.exports.isWorkoutPlanDTO = isWorkoutPlanDTO(obj) {
    return (typeof obj === 'object' &&
        obj !== null &&
        'id' in obj &&
        'userId' in obj &&
        'name' in obj &&
        'difficulty' in obj &&
        'exercises' in obj);
}
module.exports.isWorkoutPlanDTO = isWorkoutPlanDTO
// 새로운 타입 가드 추가
function isWorkoutPlanExerciseDTO
module.exports.isWorkoutPlanExerciseDTO = isWorkoutPlanExerciseDTO(obj) {
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
module.exports.isWorkoutPlanExerciseDTO = isWorkoutPlanExerciseDTO
function isWorkoutSessionDTO
module.exports.isWorkoutSessionDTO = isWorkoutSessionDTO(obj) {
    return (typeof obj === 'object' &&
        obj !== null &&
        'id' in obj &&
        'userId' in obj &&
        'name' in obj &&
        'startTime' in obj &&
        'status' in obj);
}
module.exports.isWorkoutSessionDTO = isWorkoutSessionDTO
function isWorkoutGoalDTO
module.exports.isWorkoutGoalDTO = isWorkoutGoalDTO(obj) {
    return (typeof obj === 'object' &&
        obj !== null &&
        'id' in obj &&
        'userId' in obj &&
        'title' in obj &&
        'type' in obj &&
        'targetValue' in obj);
}
module.exports.isWorkoutGoalDTO = isWorkoutGoalDTO
function isMachineDTO
module.exports.isMachineDTO = isMachineDTO(obj) {
    return (typeof obj === 'object' &&
        obj !== null &&
        'id' in obj &&
        'name' in obj &&
        'category' in obj);
}
module.exports.isMachineDTO = isMachineDTO
