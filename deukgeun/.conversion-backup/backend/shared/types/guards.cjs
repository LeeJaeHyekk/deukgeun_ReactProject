"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isString = isString;
exports.isNumber = isNumber;
exports.isBoolean = isBoolean;
exports.isDate = isDate;
exports.isDateString = isDateString;
exports.isObject = isObject;
exports.isArray = isArray;
exports.isUserDTO = isUserDTO;
exports.isWorkoutPlanDTO = isWorkoutPlanDTO;
exports.isWorkoutPlanExerciseDTO = isWorkoutPlanExerciseDTO;
exports.isWorkoutSessionDTO = isWorkoutSessionDTO;
exports.isWorkoutGoalDTO = isWorkoutGoalDTO;
exports.isExerciseSetDTO = isExerciseSetDTO;
exports.isMachineDTO = isMachineDTO;
exports.isGymDTO = isGymDTO;
exports.isUserLevelDTO = isUserLevelDTO;
exports.isUserStreakDTO = isUserStreakDTO;
exports.isDTOResponse = isDTOResponse;
exports.isDTOPaginatedResponse = isDTOPaginatedResponse;
exports.isWorkoutPlanWithExercises = isWorkoutPlanWithExercises;
exports.isWorkoutSessionWithSets = isWorkoutSessionWithSets;
exports.isUserWithLevel = isUserWithLevel;
exports.validateUserDTO = validateUserDTO;
exports.validateWorkoutPlanDTO = validateWorkoutPlanDTO;
exports.validateWorkoutSessionDTO = validateWorkoutSessionDTO;
exports.validateWorkoutGoalDTO = validateWorkoutGoalDTO;
exports.validateMachineDTO = validateMachineDTO;
exports.validateExerciseSetDTO = validateExerciseSetDTO;
exports.validateUserDTOArray = validateUserDTOArray;
exports.validateWorkoutPlanDTOArray = validateWorkoutPlanDTOArray;
exports.validateWorkoutSessionDTOArray = validateWorkoutSessionDTOArray;
exports.validateWorkoutGoalDTOArray = validateWorkoutGoalDTOArray;
exports.validateMachineDTOArray = validateMachineDTOArray;
exports.validateExerciseSetDTOArray = validateExerciseSetDTOArray;
exports.validateDTOResponse = validateDTOResponse;
exports.validateDTOPaginatedResponse = validateDTOPaginatedResponse;
exports.safeParseUserDTO = safeParseUserDTO;
exports.safeParseWorkoutPlanDTO = safeParseWorkoutPlanDTO;
exports.safeParseWorkoutSessionDTO = safeParseWorkoutSessionDTO;
exports.safeParseWorkoutGoalDTO = safeParseWorkoutGoalDTO;
exports.safeParseMachineDTO = safeParseMachineDTO;
exports.safeParseExerciseSetDTO = safeParseExerciseSetDTO;
exports.isNonEmptyString = isNonEmptyString;
exports.isPositiveNumber = isPositiveNumber;
exports.isNonNegativeNumber = isNonNegativeNumber;
exports.isInteger = isInteger;
exports.isPositiveInteger = isPositiveInteger;
exports.isNonNegativeInteger = isNonNegativeInteger;
exports.isEmail = isEmail;
exports.isPhoneNumber = isPhoneNumber;
exports.isUrl = isUrl;
exports.isUuid = isUuid;
exports.safeParseWorkoutPlan = safeParseWorkoutPlan;
exports.safeParseWorkoutSession = safeParseWorkoutSession;
exports.safeParseWorkoutGoal = safeParseWorkoutGoal;
exports.safeParseMachine = safeParseMachine;
exports.safeParseWorkoutPlanArray = safeParseWorkoutPlanArray;
exports.safeParseWorkoutSessionArray = safeParseWorkoutSessionArray;
exports.safeParseWorkoutGoalArray = safeParseWorkoutGoalArray;
exports.safeParseMachineArray = safeParseMachineArray;
exports.ensureWorkoutPlan = ensureWorkoutPlan;
exports.ensureWorkoutSession = ensureWorkoutSession;
exports.ensureWorkoutGoal = ensureWorkoutGoal;
exports.ensureMachine = ensureMachine;
exports.isCompletedWorkoutSession = isCompletedWorkoutSession;
exports.isActiveWorkoutSession = isActiveWorkoutSession;
exports.isCompletedWorkoutGoal = isCompletedWorkoutGoal;
exports.isActiveWorkoutGoal = isActiveWorkoutGoal;
exports.hasValidExerciseSets = hasValidExerciseSets;
exports.hasValidExercises = hasValidExercises;
exports.hasValidUserLevel = hasValidUserLevel;
function isString(value) {
    return typeof value === 'string';
}
function isNumber(value) {
    return typeof value === 'number' && !isNaN(value);
}
function isBoolean(value) {
    return typeof value === 'boolean';
}
function isDate(value) {
    return value instanceof Date;
}
function isDateString(value) {
    if (!isString(value))
        return false;
    const date = new Date(value);
    return !isNaN(date.getTime());
}
function isObject(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function isArray(value, itemGuard) {
    if (!Array.isArray(value))
        return false;
    if (itemGuard) {
        return value.every(itemGuard);
    }
    return true;
}
function isUserDTO(obj) {
    if (!isObject(obj))
        return false;
    return (isNumber(obj.id) &&
        isString(obj.email) &&
        isString(obj.nickname) &&
        isString(obj.role) &&
        isBoolean(obj.isActive) &&
        isBoolean(obj.isEmailVerified) &&
        isBoolean(obj.isPhoneVerified) &&
        (isDateString(obj.createdAt) || isDate(obj.createdAt)) &&
        (isDateString(obj.updatedAt) || isDate(obj.updatedAt)));
}
function isWorkoutPlanDTO(obj) {
    if (!isObject(obj))
        return false;
    return (isNumber(obj.id) &&
        isNumber(obj.userId) &&
        isString(obj.name) &&
        isString(obj.difficulty) &&
        isNumber(obj.estimatedDurationMinutes) &&
        isBoolean(obj.isTemplate) &&
        isBoolean(obj.isPublic) &&
        isString(obj.status) &&
        isArray(obj.exercises, isWorkoutPlanExerciseDTO) &&
        (isDateString(obj.createdAt) || isDate(obj.createdAt)) &&
        (isDateString(obj.updatedAt) || isDate(obj.updatedAt)));
}
function isWorkoutPlanExerciseDTO(obj) {
    if (!isObject(obj))
        return false;
    return (isNumber(obj.id) &&
        isNumber(obj.planId) &&
        isString(obj.exerciseName) &&
        isNumber(obj.exerciseOrder) &&
        isNumber(obj.sets) &&
        isObject(obj.repsRange) &&
        isNumber(obj.repsRange.min) &&
        isNumber(obj.repsRange.max) &&
        isNumber(obj.restSeconds));
}
function isWorkoutSessionDTO(obj) {
    if (!isObject(obj))
        return false;
    return (isNumber(obj.id) &&
        isNumber(obj.userId) &&
        isString(obj.name) &&
        (isDateString(obj.startTime) || isDate(obj.startTime)) &&
        isString(obj.status) &&
        isArray(obj.exerciseSets, isExerciseSetDTO) &&
        (isDateString(obj.createdAt) || isDate(obj.createdAt)) &&
        (isDateString(obj.updatedAt) || isDate(obj.updatedAt)));
}
function isWorkoutGoalDTO(obj) {
    if (!isObject(obj))
        return false;
    return (isNumber(obj.id) &&
        isNumber(obj.userId) &&
        isString(obj.title) &&
        isString(obj.type) &&
        isNumber(obj.targetValue) &&
        isNumber(obj.currentValue) &&
        isString(obj.unit) &&
        isBoolean(obj.isCompleted) &&
        (isDateString(obj.createdAt) || isDate(obj.createdAt)) &&
        (isDateString(obj.updatedAt) || isDate(obj.updatedAt)));
}
function isExerciseSetDTO(obj) {
    if (!isObject(obj))
        return false;
    return (isNumber(obj.id) &&
        isNumber(obj.sessionId) &&
        isNumber(obj.machineId) &&
        isString(obj.exerciseName) &&
        isNumber(obj.setNumber) &&
        isNumber(obj.repsCompleted) &&
        isBoolean(obj.isPersonalBest) &&
        isBoolean(obj.isCompleted) &&
        (isDateString(obj.createdAt) || isDate(obj.createdAt)) &&
        (isDateString(obj.updatedAt) || isDate(obj.updatedAt)));
}
function isMachineDTO(obj) {
    if (!isObject(obj))
        return false;
    return (isNumber(obj.id) &&
        isString(obj.name) &&
        isString(obj.category) &&
        (isDateString(obj.createdAt) || isDate(obj.createdAt)) &&
        (isDateString(obj.updatedAt) || isDate(obj.updatedAt)));
}
function isGymDTO(obj) {
    if (!isObject(obj))
        return false;
    return (isNumber(obj.id) &&
        isString(obj.name) &&
        isString(obj.address) &&
        isNumber(obj.latitude) &&
        isNumber(obj.longitude) &&
        (isDateString(obj.createdAt) || isDate(obj.createdAt)) &&
        (isDateString(obj.updatedAt) || isDate(obj.updatedAt)));
}
function isUserLevelDTO(obj) {
    if (!isObject(obj))
        return false;
    return (isNumber(obj.id) &&
        isNumber(obj.userId) &&
        isNumber(obj.level) &&
        isNumber(obj.currentExp) &&
        isNumber(obj.totalExp) &&
        isNumber(obj.seasonExp) &&
        isNumber(obj.expToNextLevel) &&
        isNumber(obj.progressPercentage) &&
        (isDateString(obj.createdAt) || isDate(obj.createdAt)) &&
        (isDateString(obj.updatedAt) || isDate(obj.updatedAt)));
}
function isUserStreakDTO(obj) {
    if (!isObject(obj))
        return false;
    return (isNumber(obj.id) &&
        isNumber(obj.userId) &&
        isNumber(obj.currentStreak) &&
        isNumber(obj.longestStreak) &&
        (isDateString(obj.createdAt) || isDate(obj.createdAt)) &&
        (isDateString(obj.updatedAt) || isDate(obj.updatedAt)));
}
function isDTOResponse(obj, dataGuard) {
    if (!isObject(obj))
        return false;
    const hasRequiredFields = (isBoolean(obj.success) &&
        isString(obj.message));
    if (!hasRequiredFields)
        return false;
    if ('data' in obj && obj.data !== undefined) {
        if (dataGuard) {
            return dataGuard(obj.data);
        }
    }
    return true;
}
function isDTOPaginatedResponse(obj, itemGuard) {
    if (!isObject(obj))
        return false;
    return (isArray(obj.data, itemGuard) &&
        isObject(obj.pagination) &&
        isNumber(obj.pagination.page) &&
        isNumber(obj.pagination.limit) &&
        isNumber(obj.pagination.total) &&
        isNumber(obj.pagination.totalPages));
}
function isWorkoutPlanWithExercises(obj) {
    return isWorkoutPlanDTO(obj) && isArray(obj.exercises, isWorkoutPlanExerciseDTO);
}
function isWorkoutSessionWithSets(obj) {
    return isWorkoutSessionDTO(obj) && isArray(obj.exerciseSets, isExerciseSetDTO);
}
function isUserWithLevel(obj) {
    return isUserDTO(obj) && (!('level' in obj) || isUserLevelDTO(obj.level));
}
function validateUserDTO(data) {
    if (!isUserDTO(data)) {
        throw new Error('Invalid UserDTO: missing required fields or incorrect types');
    }
    return data;
}
function validateWorkoutPlanDTO(data) {
    if (!isWorkoutPlanDTO(data)) {
        throw new Error('Invalid WorkoutPlanDTO: missing required fields or incorrect types');
    }
    return data;
}
function validateWorkoutSessionDTO(data) {
    if (!isWorkoutSessionDTO(data)) {
        throw new Error('Invalid WorkoutSessionDTO: missing required fields or incorrect types');
    }
    return data;
}
function validateWorkoutGoalDTO(data) {
    if (!isWorkoutGoalDTO(data)) {
        throw new Error('Invalid WorkoutGoalDTO: missing required fields or incorrect types');
    }
    return data;
}
function validateMachineDTO(data) {
    if (!isMachineDTO(data)) {
        throw new Error('Invalid MachineDTO: missing required fields or incorrect types');
    }
    return data;
}
function validateExerciseSetDTO(data) {
    if (!isExerciseSetDTO(data)) {
        throw new Error('Invalid ExerciseSetDTO: missing required fields or incorrect types');
    }
    return data;
}
function validateUserDTOArray(data) {
    if (!isArray(data, isUserDTO)) {
        throw new Error('Invalid UserDTO array: one or more items are invalid');
    }
    return data;
}
function validateWorkoutPlanDTOArray(data) {
    if (!isArray(data, isWorkoutPlanDTO)) {
        throw new Error('Invalid WorkoutPlanDTO array: one or more items are invalid');
    }
    return data;
}
function validateWorkoutSessionDTOArray(data) {
    if (!isArray(data, isWorkoutSessionDTO)) {
        throw new Error('Invalid WorkoutSessionDTO array: one or more items are invalid');
    }
    return data;
}
function validateWorkoutGoalDTOArray(data) {
    if (!isArray(data, isWorkoutGoalDTO)) {
        throw new Error('Invalid WorkoutGoalDTO array: one or more items are invalid');
    }
    return data;
}
function validateMachineDTOArray(data) {
    if (!isArray(data, isMachineDTO)) {
        throw new Error('Invalid MachineDTO array: one or more items are invalid');
    }
    return data;
}
function validateExerciseSetDTOArray(data) {
    if (!isArray(data, isExerciseSetDTO)) {
        throw new Error('Invalid ExerciseSetDTO array: one or more items are invalid');
    }
    return data;
}
function validateDTOResponse(data, dataGuard) {
    if (!isDTOResponse(data, dataGuard)) {
        throw new Error('Invalid DTOResponse: missing required fields or incorrect types');
    }
    return data;
}
function validateDTOPaginatedResponse(data, itemGuard) {
    if (!isDTOPaginatedResponse(data, itemGuard)) {
        throw new Error('Invalid DTOPaginatedResponse: missing required fields or incorrect types');
    }
    return data;
}
function safeParseUserDTO(data) {
    try {
        return validateUserDTO(data);
    }
    catch {
        return null;
    }
}
function safeParseWorkoutPlanDTO(data) {
    try {
        return validateWorkoutPlanDTO(data);
    }
    catch {
        return null;
    }
}
function safeParseWorkoutSessionDTO(data) {
    try {
        return validateWorkoutSessionDTO(data);
    }
    catch {
        return null;
    }
}
function safeParseWorkoutGoalDTO(data) {
    try {
        return validateWorkoutGoalDTO(data);
    }
    catch {
        return null;
    }
}
function safeParseMachineDTO(data) {
    try {
        return validateMachineDTO(data);
    }
    catch {
        return null;
    }
}
function safeParseExerciseSetDTO(data) {
    try {
        return validateExerciseSetDTO(data);
    }
    catch {
        return null;
    }
}
function isNonEmptyString(value) {
    return isString(value) && value.length > 0;
}
function isPositiveNumber(value) {
    return isNumber(value) && value > 0;
}
function isNonNegativeNumber(value) {
    return isNumber(value) && value >= 0;
}
function isInteger(value) {
    return isNumber(value) && Number.isInteger(value);
}
function isPositiveInteger(value) {
    return isInteger(value) && value > 0;
}
function isNonNegativeInteger(value) {
    return isInteger(value) && value >= 0;
}
function isEmail(value) {
    if (!isString(value))
        return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
}
function isPhoneNumber(value) {
    if (!isString(value))
        return false;
    const phoneRegex = /^[+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(value.replace(/[\s\-()]/g, ''));
}
function isUrl(value) {
    if (!isString(value))
        return false;
    try {
        new URL(value);
        return true;
    }
    catch {
        return false;
    }
}
function isUuid(value) {
    if (!isString(value))
        return false;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(value);
}
function safeParseWorkoutPlan(data) {
    try {
        return validateWorkoutPlanDTO(data);
    }
    catch {
        return null;
    }
}
function safeParseWorkoutSession(data) {
    try {
        return validateWorkoutSessionDTO(data);
    }
    catch {
        return null;
    }
}
function safeParseWorkoutGoal(data) {
    try {
        return validateWorkoutGoalDTO(data);
    }
    catch {
        return null;
    }
}
function safeParseMachine(data) {
    try {
        return validateMachineDTO(data);
    }
    catch {
        return null;
    }
}
function safeParseWorkoutPlanArray(data) {
    if (!isArray(data))
        return [];
    return data.filter(isWorkoutPlanDTO);
}
function safeParseWorkoutSessionArray(data) {
    if (!isArray(data))
        return [];
    return data.filter(isWorkoutSessionDTO);
}
function safeParseWorkoutGoalArray(data) {
    if (!isArray(data))
        return [];
    return data.filter(isWorkoutGoalDTO);
}
function safeParseMachineArray(data) {
    if (!isArray(data))
        return [];
    return data.filter(isMachineDTO);
}
function ensureWorkoutPlan(data) {
    if (isWorkoutPlanDTO(data))
        return data;
    throw new Error('Invalid workout plan data structure');
}
function ensureWorkoutSession(data) {
    if (isWorkoutSessionDTO(data))
        return data;
    throw new Error('Invalid workout session data structure');
}
function ensureWorkoutGoal(data) {
    if (isWorkoutGoalDTO(data))
        return data;
    throw new Error('Invalid workout goal data structure');
}
function ensureMachine(data) {
    if (isMachineDTO(data))
        return data;
    throw new Error('Invalid machine data structure');
}
function isCompletedWorkoutSession(obj) {
    return isWorkoutSessionDTO(obj) && obj.status === 'completed';
}
function isActiveWorkoutSession(obj) {
    return isWorkoutSessionDTO(obj) && obj.status === 'in_progress';
}
function isCompletedWorkoutGoal(obj) {
    return isWorkoutGoalDTO(obj) && obj.isCompleted === true;
}
function isActiveWorkoutGoal(obj) {
    return isWorkoutGoalDTO(obj) && obj.isCompleted === false;
}
function hasValidExerciseSets(obj) {
    if (!isObject(obj))
        return false;
    return 'exerciseSets' in obj && isArray(obj.exerciseSets, isExerciseSetDTO);
}
function hasValidExercises(obj) {
    if (!isObject(obj))
        return false;
    return 'exercises' in obj && isArray(obj.exercises, isWorkoutPlanExerciseDTO);
}
function hasValidUserLevel(obj) {
    if (!isObject(obj))
        return false;
    return 'level' in obj && isUserLevelDTO(obj.level);
}
