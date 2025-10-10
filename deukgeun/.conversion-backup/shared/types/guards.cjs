// ============================================================================
// 타입 가드 및 런타임 검증 로직
// ============================================================================
// ============================================================================
// 기본 타입 가드
// ============================================================================
function isString
module.exports.isString = isString(value) {
    return typeof value === 'string';
}
module.exports.isString = isString
function isNumber
module.exports.isNumber = isNumber(value) {
    return typeof value === 'number' && !isNaN(value);
}
module.exports.isNumber = isNumber
function isBoolean
module.exports.isBoolean = isBoolean(value) {
    return typeof value === 'boolean';
}
module.exports.isBoolean = isBoolean
function isDate
module.exports.isDate = isDate(value) {
    return value instanceof Date;
}
module.exports.isDate = isDate
function isDateString
module.exports.isDateString = isDateString(value) {
    if (!isString(value))
        return false;
    const date = new Date(value);
    return !isNaN(date.getTime());
}
module.exports.isDateString = isDateString
function isObject
module.exports.isObject = isObject(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
module.exports.isObject = isObject
function isArray
module.exports.isArray = isArray(value, itemGuard) {
    if (!Array.isArray(value))
        return false;
    if (itemGuard) {
        return value.every(itemGuard);
    }
module.exports.isArray = isArray
    return true;
}
// ============================================================================
// DTO 타입 가드
// ============================================================================
function isUserDTO
module.exports.isUserDTO = isUserDTO(obj) {
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
module.exports.isUserDTO = isUserDTO
function isWorkoutPlanDTO
module.exports.isWorkoutPlanDTO = isWorkoutPlanDTO(obj) {
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
module.exports.isWorkoutPlanDTO = isWorkoutPlanDTO
function isWorkoutPlanExerciseDTO
module.exports.isWorkoutPlanExerciseDTO = isWorkoutPlanExerciseDTO(obj) {
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
module.exports.isWorkoutPlanExerciseDTO = isWorkoutPlanExerciseDTO
function isWorkoutSessionDTO
module.exports.isWorkoutSessionDTO = isWorkoutSessionDTO(obj) {
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
module.exports.isWorkoutSessionDTO = isWorkoutSessionDTO
function isWorkoutGoalDTO
module.exports.isWorkoutGoalDTO = isWorkoutGoalDTO(obj) {
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
module.exports.isWorkoutGoalDTO = isWorkoutGoalDTO
function isExerciseSetDTO
module.exports.isExerciseSetDTO = isExerciseSetDTO(obj) {
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
module.exports.isExerciseSetDTO = isExerciseSetDTO
function isMachineDTO
module.exports.isMachineDTO = isMachineDTO(obj) {
    if (!isObject(obj))
        return false;
    return (isNumber(obj.id) &&
        isString(obj.name) &&
        isString(obj.category) &&
        (isDateString(obj.createdAt) || isDate(obj.createdAt)) &&
        (isDateString(obj.updatedAt) || isDate(obj.updatedAt)));
}
module.exports.isMachineDTO = isMachineDTO
function isGymDTO
module.exports.isGymDTO = isGymDTO(obj) {
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
module.exports.isGymDTO = isGymDTO
function isUserLevelDTO
module.exports.isUserLevelDTO = isUserLevelDTO(obj) {
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
module.exports.isUserLevelDTO = isUserLevelDTO
function isUserStreakDTO
module.exports.isUserStreakDTO = isUserStreakDTO(obj) {
    if (!isObject(obj))
        return false;
    return (isNumber(obj.id) &&
        isNumber(obj.userId) &&
        isNumber(obj.currentStreak) &&
        isNumber(obj.longestStreak) &&
        (isDateString(obj.createdAt) || isDate(obj.createdAt)) &&
        (isDateString(obj.updatedAt) || isDate(obj.updatedAt)));
}
module.exports.isUserStreakDTO = isUserStreakDTO
// ============================================================================
// API 응답 타입 가드
// ============================================================================
function isDTOResponse
module.exports.isDTOResponse = isDTOResponse(obj, dataGuard) {
    if (!isObject(obj))
        return false;
    const hasRequiredFields = (isBoolean(obj.success) &&
        isString(obj.message));
    if (!hasRequiredFields)
        return false;
    // data 필드가 있는 경우 검증
    if ('data' in obj && obj.data !== undefined) {
        if (dataGuard) {
            return dataGuard(obj.data);
        }
module.exports.isDTOResponse = isDTOResponse
    }
    return true;
}
function isDTOPaginatedResponse
module.exports.isDTOPaginatedResponse = isDTOPaginatedResponse(obj, itemGuard) {
    if (!isObject(obj))
        return false;
    return (isArray(obj.data, itemGuard) &&
        isObject(obj.pagination) &&
        isNumber(obj.pagination.page) &&
        isNumber(obj.pagination.limit) &&
        isNumber(obj.pagination.total) &&
        isNumber(obj.pagination.totalPages));
}
module.exports.isDTOPaginatedResponse = isDTOPaginatedResponse
// ============================================================================
// 복합 타입 가드
// ============================================================================
function isWorkoutPlanWithExercises
module.exports.isWorkoutPlanWithExercises = isWorkoutPlanWithExercises(obj) {
    return isWorkoutPlanDTO(obj) && isArray(obj.exercises, isWorkoutPlanExerciseDTO);
}
module.exports.isWorkoutPlanWithExercises = isWorkoutPlanWithExercises
function isWorkoutSessionWithSets
module.exports.isWorkoutSessionWithSets = isWorkoutSessionWithSets(obj) {
    return isWorkoutSessionDTO(obj) && isArray(obj.exerciseSets, isExerciseSetDTO);
}
module.exports.isWorkoutSessionWithSets = isWorkoutSessionWithSets
function isUserWithLevel
module.exports.isUserWithLevel = isUserWithLevel(obj) {
    return isUserDTO(obj) && (!('level' in obj) || isUserLevelDTO(obj.level));
}
module.exports.isUserWithLevel = isUserWithLevel
// ============================================================================
// 런타임 검증 함수들
// ============================================================================
function validateUserDTO
module.exports.validateUserDTO = validateUserDTO(data) {
    if (!isUserDTO(data)) {
        throw new Error('Invalid UserDTO: missing required fields or incorrect types');
    }
module.exports.validateUserDTO = validateUserDTO
    return data;
}
function validateWorkoutPlanDTO
module.exports.validateWorkoutPlanDTO = validateWorkoutPlanDTO(data) {
    if (!isWorkoutPlanDTO(data)) {
        throw new Error('Invalid WorkoutPlanDTO: missing required fields or incorrect types');
    }
module.exports.validateWorkoutPlanDTO = validateWorkoutPlanDTO
    return data;
}
function validateWorkoutSessionDTO
module.exports.validateWorkoutSessionDTO = validateWorkoutSessionDTO(data) {
    if (!isWorkoutSessionDTO(data)) {
        throw new Error('Invalid WorkoutSessionDTO: missing required fields or incorrect types');
    }
module.exports.validateWorkoutSessionDTO = validateWorkoutSessionDTO
    return data;
}
function validateWorkoutGoalDTO
module.exports.validateWorkoutGoalDTO = validateWorkoutGoalDTO(data) {
    if (!isWorkoutGoalDTO(data)) {
        throw new Error('Invalid WorkoutGoalDTO: missing required fields or incorrect types');
    }
module.exports.validateWorkoutGoalDTO = validateWorkoutGoalDTO
    return data;
}
function validateMachineDTO
module.exports.validateMachineDTO = validateMachineDTO(data) {
    if (!isMachineDTO(data)) {
        throw new Error('Invalid MachineDTO: missing required fields or incorrect types');
    }
module.exports.validateMachineDTO = validateMachineDTO
    return data;
}
function validateExerciseSetDTO
module.exports.validateExerciseSetDTO = validateExerciseSetDTO(data) {
    if (!isExerciseSetDTO(data)) {
        throw new Error('Invalid ExerciseSetDTO: missing required fields or incorrect types');
    }
module.exports.validateExerciseSetDTO = validateExerciseSetDTO
    return data;
}
// ============================================================================
// 배열 검증 함수들
// ============================================================================
function validateUserDTOArray
module.exports.validateUserDTOArray = validateUserDTOArray(data) {
    if (!isArray(data, isUserDTO)) {
        throw new Error('Invalid UserDTO array: one or more items are invalid');
    }
module.exports.validateUserDTOArray = validateUserDTOArray
    return data;
}
function validateWorkoutPlanDTOArray
module.exports.validateWorkoutPlanDTOArray = validateWorkoutPlanDTOArray(data) {
    if (!isArray(data, isWorkoutPlanDTO)) {
        throw new Error('Invalid WorkoutPlanDTO array: one or more items are invalid');
    }
module.exports.validateWorkoutPlanDTOArray = validateWorkoutPlanDTOArray
    return data;
}
function validateWorkoutSessionDTOArray
module.exports.validateWorkoutSessionDTOArray = validateWorkoutSessionDTOArray(data) {
    if (!isArray(data, isWorkoutSessionDTO)) {
        throw new Error('Invalid WorkoutSessionDTO array: one or more items are invalid');
    }
module.exports.validateWorkoutSessionDTOArray = validateWorkoutSessionDTOArray
    return data;
}
function validateWorkoutGoalDTOArray
module.exports.validateWorkoutGoalDTOArray = validateWorkoutGoalDTOArray(data) {
    if (!isArray(data, isWorkoutGoalDTO)) {
        throw new Error('Invalid WorkoutGoalDTO array: one or more items are invalid');
    }
module.exports.validateWorkoutGoalDTOArray = validateWorkoutGoalDTOArray
    return data;
}
function validateMachineDTOArray
module.exports.validateMachineDTOArray = validateMachineDTOArray(data) {
    if (!isArray(data, isMachineDTO)) {
        throw new Error('Invalid MachineDTO array: one or more items are invalid');
    }
module.exports.validateMachineDTOArray = validateMachineDTOArray
    return data;
}
function validateExerciseSetDTOArray
module.exports.validateExerciseSetDTOArray = validateExerciseSetDTOArray(data) {
    if (!isArray(data, isExerciseSetDTO)) {
        throw new Error('Invalid ExerciseSetDTO array: one or more items are invalid');
    }
module.exports.validateExerciseSetDTOArray = validateExerciseSetDTOArray
    return data;
}
// ============================================================================
// API 응답 검증 함수들
// ============================================================================
function validateDTOResponse
module.exports.validateDTOResponse = validateDTOResponse(data, dataGuard) {
    if (!isDTOResponse(data, dataGuard)) {
        throw new Error('Invalid DTOResponse: missing required fields or incorrect types');
    }
module.exports.validateDTOResponse = validateDTOResponse
    return data;
}
function validateDTOPaginatedResponse
module.exports.validateDTOPaginatedResponse = validateDTOPaginatedResponse(data, itemGuard) {
    if (!isDTOPaginatedResponse(data, itemGuard)) {
        throw new Error('Invalid DTOPaginatedResponse: missing required fields or incorrect types');
    }
module.exports.validateDTOPaginatedResponse = validateDTOPaginatedResponse
    return data;
}
// ============================================================================
// 안전한 파싱 함수들
// ============================================================================
function safeParseUserDTO
module.exports.safeParseUserDTO = safeParseUserDTO(data) {
    try {
        return validateUserDTO(data);
    }
module.exports.safeParseUserDTO = safeParseUserDTO
    catch {
        return null;
    }
}
function safeParseWorkoutPlanDTO
module.exports.safeParseWorkoutPlanDTO = safeParseWorkoutPlanDTO(data) {
    try {
        return validateWorkoutPlanDTO(data);
    }
module.exports.safeParseWorkoutPlanDTO = safeParseWorkoutPlanDTO
    catch {
        return null;
    }
}
function safeParseWorkoutSessionDTO
module.exports.safeParseWorkoutSessionDTO = safeParseWorkoutSessionDTO(data) {
    try {
        return validateWorkoutSessionDTO(data);
    }
module.exports.safeParseWorkoutSessionDTO = safeParseWorkoutSessionDTO
    catch {
        return null;
    }
}
function safeParseWorkoutGoalDTO
module.exports.safeParseWorkoutGoalDTO = safeParseWorkoutGoalDTO(data) {
    try {
        return validateWorkoutGoalDTO(data);
    }
module.exports.safeParseWorkoutGoalDTO = safeParseWorkoutGoalDTO
    catch {
        return null;
    }
}
function safeParseMachineDTO
module.exports.safeParseMachineDTO = safeParseMachineDTO(data) {
    try {
        return validateMachineDTO(data);
    }
module.exports.safeParseMachineDTO = safeParseMachineDTO
    catch {
        return null;
    }
}
function safeParseExerciseSetDTO
module.exports.safeParseExerciseSetDTO = safeParseExerciseSetDTO(data) {
    try {
        return validateExerciseSetDTO(data);
    }
module.exports.safeParseExerciseSetDTO = safeParseExerciseSetDTO
    catch {
        return null;
    }
}
// ============================================================================
// 유틸리티 함수들
// ============================================================================
function isNonEmptyString
module.exports.isNonEmptyString = isNonEmptyString(value) {
    return isString(value) && value.length > 0;
}
module.exports.isNonEmptyString = isNonEmptyString
function isPositiveNumber
module.exports.isPositiveNumber = isPositiveNumber(value) {
    return isNumber(value) && value > 0;
}
module.exports.isPositiveNumber = isPositiveNumber
function isNonNegativeNumber
module.exports.isNonNegativeNumber = isNonNegativeNumber(value) {
    return isNumber(value) && value >= 0;
}
module.exports.isNonNegativeNumber = isNonNegativeNumber
function isInteger
module.exports.isInteger = isInteger(value) {
    return isNumber(value) && Number.isInteger(value);
}
module.exports.isInteger = isInteger
function isPositiveInteger
module.exports.isPositiveInteger = isPositiveInteger(value) {
    return isInteger(value) && value > 0;
}
module.exports.isPositiveInteger = isPositiveInteger
function isNonNegativeInteger
module.exports.isNonNegativeInteger = isNonNegativeInteger(value) {
    return isInteger(value) && value >= 0;
}
module.exports.isNonNegativeInteger = isNonNegativeInteger
function isEmail
module.exports.isEmail = isEmail(value) {
    if (!isString(value))
        return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
}
module.exports.isEmail = isEmail
function isPhoneNumber
module.exports.isPhoneNumber = isPhoneNumber(value) {
    if (!isString(value))
        return false;
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}
module.exports.isPhoneNumber = isPhoneNumber$/;
    return phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''));
}
function isUrl
module.exports.isUrl = isUrl(value) {
    if (!isString(value))
        return false;
    try {
        new URL(value);
        return true;
    }
module.exports.isUrl = isUrl
    catch {
        return false;
    }
}
function isUuid
module.exports.isUuid = isUuid(value) {
    if (!isString(value))
        return false;
    const uuidRegex = /^[0-9a-f]{8}
module.exports.isUuid = isUuid-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(value);
}
// ============================================================================
// 워크아웃 관련 복합 타입 가드 (중복 제거됨)
// ============================================================================
// ============================================================================
// API 응답 안전 파싱 함수들
// ============================================================================
function safeParseWorkoutPlan
module.exports.safeParseWorkoutPlan = safeParseWorkoutPlan(data) {
    try {
        return validateWorkoutPlanDTO(data);
    }
module.exports.safeParseWorkoutPlan = safeParseWorkoutPlan
    catch {
        return null;
    }
}
function safeParseWorkoutSession
module.exports.safeParseWorkoutSession = safeParseWorkoutSession(data) {
    try {
        return validateWorkoutSessionDTO(data);
    }
module.exports.safeParseWorkoutSession = safeParseWorkoutSession
    catch {
        return null;
    }
}
function safeParseWorkoutGoal
module.exports.safeParseWorkoutGoal = safeParseWorkoutGoal(data) {
    try {
        return validateWorkoutGoalDTO(data);
    }
module.exports.safeParseWorkoutGoal = safeParseWorkoutGoal
    catch {
        return null;
    }
}
function safeParseMachine
module.exports.safeParseMachine = safeParseMachine(data) {
    try {
        return validateMachineDTO(data);
    }
module.exports.safeParseMachine = safeParseMachine
    catch {
        return null;
    }
}
// ============================================================================
// 배열 안전 파싱 함수들
// ============================================================================
function safeParseWorkoutPlanArray
module.exports.safeParseWorkoutPlanArray = safeParseWorkoutPlanArray(data) {
    if (!isArray(data))
        return [];
    return data.filter(isWorkoutPlanDTO);
}
module.exports.safeParseWorkoutPlanArray = safeParseWorkoutPlanArray
function safeParseWorkoutSessionArray
module.exports.safeParseWorkoutSessionArray = safeParseWorkoutSessionArray(data) {
    if (!isArray(data))
        return [];
    return data.filter(isWorkoutSessionDTO);
}
module.exports.safeParseWorkoutSessionArray = safeParseWorkoutSessionArray
function safeParseWorkoutGoalArray
module.exports.safeParseWorkoutGoalArray = safeParseWorkoutGoalArray(data) {
    if (!isArray(data))
        return [];
    return data.filter(isWorkoutGoalDTO);
}
module.exports.safeParseWorkoutGoalArray = safeParseWorkoutGoalArray
function safeParseMachineArray
module.exports.safeParseMachineArray = safeParseMachineArray(data) {
    if (!isArray(data))
        return [];
    return data.filter(isMachineDTO);
}
module.exports.safeParseMachineArray = safeParseMachineArray
// ============================================================================
// 런타임 검증 및 변환 함수들
// ============================================================================
function ensureWorkoutPlan
module.exports.ensureWorkoutPlan = ensureWorkoutPlan(data) {
    if (isWorkoutPlanDTO(data))
        return data;
    throw new Error('Invalid workout plan data structure');
}
module.exports.ensureWorkoutPlan = ensureWorkoutPlan
function ensureWorkoutSession
module.exports.ensureWorkoutSession = ensureWorkoutSession(data) {
    if (isWorkoutSessionDTO(data))
        return data;
    throw new Error('Invalid workout session data structure');
}
module.exports.ensureWorkoutSession = ensureWorkoutSession
function ensureWorkoutGoal
module.exports.ensureWorkoutGoal = ensureWorkoutGoal(data) {
    if (isWorkoutGoalDTO(data))
        return data;
    throw new Error('Invalid workout goal data structure');
}
module.exports.ensureWorkoutGoal = ensureWorkoutGoal
function ensureMachine
module.exports.ensureMachine = ensureMachine(data) {
    if (isMachineDTO(data))
        return data;
    throw new Error('Invalid machine data structure');
}
module.exports.ensureMachine = ensureMachine
// ============================================================================
// 조건부 타입 가드들
// ============================================================================
function isCompletedWorkoutSession
module.exports.isCompletedWorkoutSession = isCompletedWorkoutSession(obj) {
    return isWorkoutSessionDTO(obj) && obj.status === 'completed';
}
module.exports.isCompletedWorkoutSession = isCompletedWorkoutSession
function isActiveWorkoutSession
module.exports.isActiveWorkoutSession = isActiveWorkoutSession(obj) {
    return isWorkoutSessionDTO(obj) && obj.status === 'in_progress';
}
module.exports.isActiveWorkoutSession = isActiveWorkoutSession
function isCompletedWorkoutGoal
module.exports.isCompletedWorkoutGoal = isCompletedWorkoutGoal(obj) {
    return isWorkoutGoalDTO(obj) && obj.isCompleted === true;
}
module.exports.isCompletedWorkoutGoal = isCompletedWorkoutGoal
function isActiveWorkoutGoal
module.exports.isActiveWorkoutGoal = isActiveWorkoutGoal(obj) {
    return isWorkoutGoalDTO(obj) && obj.isCompleted === false;
}
module.exports.isActiveWorkoutGoal = isActiveWorkoutGoal
// ============================================================================
// 중첩 객체 검증 함수들
// ============================================================================
function hasValidExerciseSets
module.exports.hasValidExerciseSets = hasValidExerciseSets(obj) {
    if (!isObject(obj))
        return false;
    return 'exerciseSets' in obj && isArray(obj.exerciseSets, isExerciseSetDTO);
}
module.exports.hasValidExerciseSets = hasValidExerciseSets
function hasValidExercises
module.exports.hasValidExercises = hasValidExercises(obj) {
    if (!isObject(obj))
        return false;
    return 'exercises' in obj && isArray(obj.exercises, isWorkoutPlanExerciseDTO);
}
module.exports.hasValidExercises = hasValidExercises
function hasValidUserLevel
module.exports.hasValidUserLevel = hasValidUserLevel(obj) {
    if (!isObject(obj))
        return false;
    return 'level' in obj && isUserLevelDTO(obj.level);
}
module.exports.hasValidUserLevel = hasValidUserLevel
