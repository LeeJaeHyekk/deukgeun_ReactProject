// ============================================================================
// 타입 가드 및 런타임 검증 로직
// ============================================================================

import type {
  UserDTO,
  WorkoutPlanDTO,
  WorkoutSessionDTO,
  WorkoutGoalDTO,
  MachineDTO,
  ExerciseSetDTO,
  GymDTO,
  UserLevelDTO,
  UserStreakDTO,
  DTOResponse,
  DTOPaginatedResponse
} from './dto'

// ============================================================================
// 기본 타입 가드
// ============================================================================

export function isString(value: unknown): value is string {
  return typeof value === 'string'
}

export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value)
}

export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean'
}

export function isDate(value: unknown): value is Date {
  return value instanceof Date
}

export function isDateString(value: unknown): value is string {
  if (!isString(value)) return false
  const date = new Date(value)
  return !isNaN(date.getTime())
}

export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function isArray<T>(value: unknown, itemGuard?: (item: unknown) => item is T): value is T[] {
  if (!Array.isArray(value)) return false
  if (itemGuard) {
    return value.every(itemGuard)
  }
  return true
}

// ============================================================================
// DTO 타입 가드
// ============================================================================

export function isUserDTO(obj: unknown): obj is UserDTO {
  if (!isObject(obj)) return false
  
  return (
    isNumber(obj.id) &&
    isString(obj.email) &&
    isString(obj.nickname) &&
    isString(obj.role) &&
    isBoolean(obj.isActive) &&
    isBoolean(obj.isEmailVerified) &&
    isBoolean(obj.isPhoneVerified) &&
    (isDateString(obj.createdAt) || isDate(obj.createdAt)) &&
    (isDateString(obj.updatedAt) || isDate(obj.updatedAt))
  )
}

export function isWorkoutPlanDTO(obj: unknown): obj is WorkoutPlanDTO {
  if (!isObject(obj)) return false
  
  return (
    isNumber(obj.id) &&
    isNumber(obj.userId) &&
    isString(obj.name) &&
    isString(obj.difficulty) &&
    isNumber(obj.estimatedDurationMinutes) &&
    isBoolean(obj.isTemplate) &&
    isBoolean(obj.isPublic) &&
    isString(obj.status) &&
    isArray(obj.exercises, isWorkoutPlanExerciseDTO) &&
    (isDateString(obj.createdAt) || isDate(obj.createdAt)) &&
    (isDateString(obj.updatedAt) || isDate(obj.updatedAt))
  )
}

export function isWorkoutPlanExerciseDTO(obj: unknown): obj is WorkoutPlanDTO['exercises'][0] {
  if (!isObject(obj)) return false
  
  return (
    isNumber(obj.id) &&
    isNumber(obj.planId) &&
    isString(obj.exerciseName) &&
    isNumber(obj.exerciseOrder) &&
    isNumber(obj.sets) &&
    isObject(obj.repsRange) &&
    isNumber(obj.repsRange.min) &&
    isNumber(obj.repsRange.max) &&
    isNumber(obj.restSeconds)
  )
}

export function isWorkoutSessionDTO(obj: unknown): obj is WorkoutSessionDTO {
  if (!isObject(obj)) return false
  
  return (
    isNumber(obj.id) &&
    isNumber(obj.userId) &&
    isString(obj.name) &&
    (isDateString(obj.startTime) || isDate(obj.startTime)) &&
    isString(obj.status) &&
    isArray(obj.exerciseSets, isExerciseSetDTO) &&
    (isDateString(obj.createdAt) || isDate(obj.createdAt)) &&
    (isDateString(obj.updatedAt) || isDate(obj.updatedAt))
  )
}

export function isWorkoutGoalDTO(obj: unknown): obj is WorkoutGoalDTO {
  if (!isObject(obj)) return false
  
  return (
    isNumber(obj.id) &&
    isNumber(obj.userId) &&
    isString(obj.title) &&
    isString(obj.type) &&
    isNumber(obj.targetValue) &&
    isNumber(obj.currentValue) &&
    isString(obj.unit) &&
    isBoolean(obj.isCompleted) &&
    (isDateString(obj.createdAt) || isDate(obj.createdAt)) &&
    (isDateString(obj.updatedAt) || isDate(obj.updatedAt))
  )
}

export function isExerciseSetDTO(obj: unknown): obj is ExerciseSetDTO {
  if (!isObject(obj)) return false
  
  return (
    isNumber(obj.id) &&
    isNumber(obj.sessionId) &&
    isNumber(obj.machineId) &&
    isString(obj.exerciseName) &&
    isNumber(obj.setNumber) &&
    isNumber(obj.repsCompleted) &&
    isBoolean(obj.isPersonalBest) &&
    isBoolean(obj.isCompleted) &&
    (isDateString(obj.createdAt) || isDate(obj.createdAt)) &&
    (isDateString(obj.updatedAt) || isDate(obj.updatedAt))
  )
}

export function isMachineDTO(obj: unknown): obj is MachineDTO {
  if (!isObject(obj)) return false
  
  return (
    isNumber(obj.id) &&
    isString(obj.name) &&
    isString(obj.category) &&
    (isDateString(obj.createdAt) || isDate(obj.createdAt)) &&
    (isDateString(obj.updatedAt) || isDate(obj.updatedAt))
  )
}

export function isGymDTO(obj: unknown): obj is GymDTO {
  if (!isObject(obj)) return false
  
  return (
    isNumber(obj.id) &&
    isString(obj.name) &&
    isString(obj.address) &&
    isNumber(obj.latitude) &&
    isNumber(obj.longitude) &&
    (isDateString(obj.createdAt) || isDate(obj.createdAt)) &&
    (isDateString(obj.updatedAt) || isDate(obj.updatedAt))
  )
}

export function isUserLevelDTO(obj: unknown): obj is UserLevelDTO {
  if (!isObject(obj)) return false
  
  return (
    isNumber(obj.id) &&
    isNumber(obj.userId) &&
    isNumber(obj.level) &&
    isNumber(obj.currentExp) &&
    isNumber(obj.totalExp) &&
    isNumber(obj.seasonExp) &&
    isNumber(obj.expToNextLevel) &&
    isNumber(obj.progressPercentage) &&
    (isDateString(obj.createdAt) || isDate(obj.createdAt)) &&
    (isDateString(obj.updatedAt) || isDate(obj.updatedAt))
  )
}

export function isUserStreakDTO(obj: unknown): obj is UserStreakDTO {
  if (!isObject(obj)) return false
  
  return (
    isNumber(obj.id) &&
    isNumber(obj.userId) &&
    isNumber(obj.currentStreak) &&
    isNumber(obj.longestStreak) &&
    (isDateString(obj.createdAt) || isDate(obj.createdAt)) &&
    (isDateString(obj.updatedAt) || isDate(obj.updatedAt))
  )
}

// ============================================================================
// API 응답 타입 가드
// ============================================================================

export function isDTOResponse<T>(obj: unknown, dataGuard?: (data: unknown) => data is T): obj is DTOResponse<T> {
  if (!isObject(obj)) return false
  
  const hasRequiredFields = (
    isBoolean(obj.success) &&
    isString(obj.message)
  )
  
  if (!hasRequiredFields) return false
  
  // data 필드가 있는 경우 검증
  if ('data' in obj && obj.data !== undefined) {
    if (dataGuard) {
      return dataGuard(obj.data)
    }
  }
  
  return true
}

export function isDTOPaginatedResponse<T>(obj: unknown, itemGuard?: (item: unknown) => item is T): obj is DTOPaginatedResponse<T> {
  if (!isObject(obj)) return false
  
  return (
    isArray(obj.data, itemGuard) &&
    isObject(obj.pagination) &&
    isNumber(obj.pagination.page) &&
    isNumber(obj.pagination.limit) &&
    isNumber(obj.pagination.total) &&
    isNumber(obj.pagination.totalPages)
  )
}

// ============================================================================
// 복합 타입 가드
// ============================================================================

export function isWorkoutPlanWithExercises(obj: unknown): obj is WorkoutPlanDTO & { exercises: WorkoutPlanDTO['exercises'] } {
  return isWorkoutPlanDTO(obj) && isArray(obj.exercises, isWorkoutPlanExerciseDTO)
}

export function isWorkoutSessionWithSets(obj: unknown): obj is WorkoutSessionDTO & { exerciseSets: ExerciseSetDTO[] } {
  return isWorkoutSessionDTO(obj) && isArray(obj.exerciseSets, isExerciseSetDTO)
}

export function isUserWithLevel(obj: unknown): obj is UserDTO & { level?: UserLevelDTO } {
  return isUserDTO(obj) && (!('level' in obj) || isUserLevelDTO(obj.level))
}

// ============================================================================
// 런타임 검증 함수들
// ============================================================================

export function validateUserDTO(data: unknown): UserDTO {
  if (!isUserDTO(data)) {
    throw new Error('Invalid UserDTO: missing required fields or incorrect types')
  }
  return data
}

export function validateWorkoutPlanDTO(data: unknown): WorkoutPlanDTO {
  if (!isWorkoutPlanDTO(data)) {
    throw new Error('Invalid WorkoutPlanDTO: missing required fields or incorrect types')
  }
  return data
}

export function validateWorkoutSessionDTO(data: unknown): WorkoutSessionDTO {
  if (!isWorkoutSessionDTO(data)) {
    throw new Error('Invalid WorkoutSessionDTO: missing required fields or incorrect types')
  }
  return data
}

export function validateWorkoutGoalDTO(data: unknown): WorkoutGoalDTO {
  if (!isWorkoutGoalDTO(data)) {
    throw new Error('Invalid WorkoutGoalDTO: missing required fields or incorrect types')
  }
  return data
}

export function validateMachineDTO(data: unknown): MachineDTO {
  if (!isMachineDTO(data)) {
    throw new Error('Invalid MachineDTO: missing required fields or incorrect types')
  }
  return data
}

export function validateExerciseSetDTO(data: unknown): ExerciseSetDTO {
  if (!isExerciseSetDTO(data)) {
    throw new Error('Invalid ExerciseSetDTO: missing required fields or incorrect types')
  }
  return data
}

// ============================================================================
// 배열 검증 함수들
// ============================================================================

export function validateUserDTOArray(data: unknown): UserDTO[] {
  if (!isArray(data, isUserDTO)) {
    throw new Error('Invalid UserDTO array: one or more items are invalid')
  }
  return data
}

export function validateWorkoutPlanDTOArray(data: unknown): WorkoutPlanDTO[] {
  if (!isArray(data, isWorkoutPlanDTO)) {
    throw new Error('Invalid WorkoutPlanDTO array: one or more items are invalid')
  }
  return data
}

export function validateWorkoutSessionDTOArray(data: unknown): WorkoutSessionDTO[] {
  if (!isArray(data, isWorkoutSessionDTO)) {
    throw new Error('Invalid WorkoutSessionDTO array: one or more items are invalid')
  }
  return data
}

export function validateWorkoutGoalDTOArray(data: unknown): WorkoutGoalDTO[] {
  if (!isArray(data, isWorkoutGoalDTO)) {
    throw new Error('Invalid WorkoutGoalDTO array: one or more items are invalid')
  }
  return data
}

export function validateMachineDTOArray(data: unknown): MachineDTO[] {
  if (!isArray(data, isMachineDTO)) {
    throw new Error('Invalid MachineDTO array: one or more items are invalid')
  }
  return data
}

export function validateExerciseSetDTOArray(data: unknown): ExerciseSetDTO[] {
  if (!isArray(data, isExerciseSetDTO)) {
    throw new Error('Invalid ExerciseSetDTO array: one or more items are invalid')
  }
  return data
}

// ============================================================================
// API 응답 검증 함수들
// ============================================================================

export function validateDTOResponse<T>(data: unknown, dataGuard?: (data: unknown) => data is T): DTOResponse<T> {
  if (!isDTOResponse(data, dataGuard)) {
    throw new Error('Invalid DTOResponse: missing required fields or incorrect types')
  }
  return data
}

export function validateDTOPaginatedResponse<T>(data: unknown, itemGuard?: (item: unknown) => item is T): DTOPaginatedResponse<T> {
  if (!isDTOPaginatedResponse(data, itemGuard)) {
    throw new Error('Invalid DTOPaginatedResponse: missing required fields or incorrect types')
  }
  return data
}

// ============================================================================
// 안전한 파싱 함수들
// ============================================================================

export function safeParseUserDTO(data: unknown): UserDTO | null {
  try {
    return validateUserDTO(data)
  } catch {
    return null
  }
}

export function safeParseWorkoutPlanDTO(data: unknown): WorkoutPlanDTO | null {
  try {
    return validateWorkoutPlanDTO(data)
  } catch {
    return null
  }
}

export function safeParseWorkoutSessionDTO(data: unknown): WorkoutSessionDTO | null {
  try {
    return validateWorkoutSessionDTO(data)
  } catch {
    return null
  }
}

export function safeParseWorkoutGoalDTO(data: unknown): WorkoutGoalDTO | null {
  try {
    return validateWorkoutGoalDTO(data)
  } catch {
    return null
  }
}

export function safeParseMachineDTO(data: unknown): MachineDTO | null {
  try {
    return validateMachineDTO(data)
  } catch {
    return null
  }
}

export function safeParseExerciseSetDTO(data: unknown): ExerciseSetDTO | null {
  try {
    return validateExerciseSetDTO(data)
  } catch {
    return null
  }
}

// ============================================================================
// 유틸리티 함수들
// ============================================================================

export function isNonEmptyString(value: unknown): value is string {
  return isString(value) && value.length > 0
}

export function isPositiveNumber(value: unknown): value is number {
  return isNumber(value) && value > 0
}

export function isNonNegativeNumber(value: unknown): value is number {
  return isNumber(value) && value >= 0
}

export function isInteger(value: unknown): value is number {
  return isNumber(value) && Number.isInteger(value)
}

export function isPositiveInteger(value: unknown): value is number {
  return isInteger(value) && value > 0
}

export function isNonNegativeInteger(value: unknown): value is number {
  return isInteger(value) && value >= 0
}

export function isEmail(value: unknown): value is string {
  if (!isString(value)) return false
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(value)
}

export function isPhoneNumber(value: unknown): value is string {
  if (!isString(value)) return false
  const phoneRegex = /^[+]?[1-9][\d]{0,15}$/
  return phoneRegex.test(value.replace(/[\s\-()]/g, ''))
}

export function isUrl(value: unknown): value is string {
  if (!isString(value)) return false
  try {
    new URL(value)
    return true
  } catch {
    return false
  }
}

export function isUuid(value: unknown): value is string {
  if (!isString(value)) return false
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(value)
}

// ============================================================================
// 워크아웃 관련 복합 타입 가드 (중복 제거됨)
// ============================================================================

// ============================================================================
// API 응답 안전 파싱 함수들
// ============================================================================

export function safeParseWorkoutPlan(data: unknown): WorkoutPlanDTO | null {
  try {
    return validateWorkoutPlanDTO(data)
  } catch {
    return null
  }
}

export function safeParseWorkoutSession(data: unknown): WorkoutSessionDTO | null {
  try {
    return validateWorkoutSessionDTO(data)
  } catch {
    return null
  }
}

export function safeParseWorkoutGoal(data: unknown): WorkoutGoalDTO | null {
  try {
    return validateWorkoutGoalDTO(data)
  } catch {
    return null
  }
}

export function safeParseMachine(data: unknown): MachineDTO | null {
  try {
    return validateMachineDTO(data)
  } catch {
    return null
  }
}

// ============================================================================
// 배열 안전 파싱 함수들
// ============================================================================

export function safeParseWorkoutPlanArray(data: unknown): WorkoutPlanDTO[] {
  if (!isArray(data)) return []
  return data.filter(isWorkoutPlanDTO)
}

export function safeParseWorkoutSessionArray(data: unknown): WorkoutSessionDTO[] {
  if (!isArray(data)) return []
  return data.filter(isWorkoutSessionDTO)
}

export function safeParseWorkoutGoalArray(data: unknown): WorkoutGoalDTO[] {
  if (!isArray(data)) return []
  return data.filter(isWorkoutGoalDTO)
}

export function safeParseMachineArray(data: unknown): MachineDTO[] {
  if (!isArray(data)) return []
  return data.filter(isMachineDTO)
}

// ============================================================================
// 런타임 검증 및 변환 함수들
// ============================================================================

export function ensureWorkoutPlan(data: unknown): WorkoutPlanDTO {
  if (isWorkoutPlanDTO(data)) return data
  throw new Error('Invalid workout plan data structure')
}

export function ensureWorkoutSession(data: unknown): WorkoutSessionDTO {
  if (isWorkoutSessionDTO(data)) return data
  throw new Error('Invalid workout session data structure')
}

export function ensureWorkoutGoal(data: unknown): WorkoutGoalDTO {
  if (isWorkoutGoalDTO(data)) return data
  throw new Error('Invalid workout goal data structure')
}

export function ensureMachine(data: unknown): MachineDTO {
  if (isMachineDTO(data)) return data
  throw new Error('Invalid machine data structure')
}

// ============================================================================
// 조건부 타입 가드들
// ============================================================================

export function isCompletedWorkoutSession(obj: unknown): obj is WorkoutSessionDTO & { status: 'completed' } {
  return isWorkoutSessionDTO(obj) && obj.status === 'completed'
}

export function isActiveWorkoutSession(obj: unknown): obj is WorkoutSessionDTO & { status: 'in_progress' } {
  return isWorkoutSessionDTO(obj) && obj.status === 'in_progress'
}

export function isCompletedWorkoutGoal(obj: unknown): obj is WorkoutGoalDTO & { isCompleted: true } {
  return isWorkoutGoalDTO(obj) && obj.isCompleted === true
}

export function isActiveWorkoutGoal(obj: unknown): obj is WorkoutGoalDTO & { isCompleted: false } {
  return isWorkoutGoalDTO(obj) && obj.isCompleted === false
}

// ============================================================================
// 중첩 객체 검증 함수들
// ============================================================================

export function hasValidExerciseSets(obj: unknown): obj is { exerciseSets: ExerciseSetDTO[] } {
  if (!isObject(obj)) return false
  return 'exerciseSets' in obj && isArray(obj.exerciseSets, isExerciseSetDTO)
}

export function hasValidExercises(obj: unknown): obj is { exercises: WorkoutPlanDTO['exercises'] } {
  if (!isObject(obj)) return false
  return 'exercises' in obj && isArray(obj.exercises, isWorkoutPlanExerciseDTO)
}

export function hasValidUserLevel(obj: unknown): obj is { level: UserLevelDTO } {
  if (!isObject(obj)) return false
  return 'level' in obj && isUserLevelDTO(obj.level)
}