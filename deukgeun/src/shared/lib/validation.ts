// ============================================================================
// 런타임 검증 및 데이터 변환 유틸리티
// ============================================================================

import {
  isUserDTO,
  isWorkoutPlanDTO,
  isWorkoutSessionDTO,
  isWorkoutGoalDTO,
  isMachineDTO,
  isExerciseSetDTO,
  isGymDTO,
  isUserLevelDTO,
  isUserStreakDTO,
  isDTOResponse,
  isDTOPaginatedResponse,
  validateUserDTO,
  validateWorkoutPlanDTO,
  validateWorkoutSessionDTO,
  validateWorkoutGoalDTO,
  validateMachineDTO,
  validateExerciseSetDTO,
  safeParseUserDTO,
  safeParseWorkoutPlanDTO,
  safeParseWorkoutSessionDTO,
  safeParseWorkoutGoalDTO,
  safeParseMachineDTO,
  safeParseExerciseSetDTO,
  isString,
  isNumber,
  isBoolean,
  isDateString,
  isArray,
  isObject,
  isEmail,
  isPhoneNumber,
  isUrl,
  isPositiveNumber,
  isNonNegativeNumber,
  isPositiveInteger,
  isNonNegativeInteger,
} from '../types/guards'

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
  DTOPaginatedResponse,
} from '../types/dto'

// ============================================================================
// API 응답 검증 및 변환
// ============================================================================

export function validateApiResponse<T>(response: unknown, dataValidator?: (data: unknown) => data is T): DTOResponse<T> {
  if (!isDTOResponse(response, dataValidator)) {
    throw new Error('Invalid API response format')
  }
  return response
}

export function validatePaginatedResponse<T>(response: unknown, itemValidator?: (item: unknown) => item is T): DTOPaginatedResponse<T> {
  if (!isDTOPaginatedResponse(response, itemValidator)) {
    throw new Error('Invalid paginated response format')
  }
  return response
}

export function safeParseApiResponse<T>(response: unknown, dataValidator?: (data: unknown) => data is T): DTOResponse<T> | null {
  try {
    return validateApiResponse(response, dataValidator)
  } catch {
    return null
  }
}

export function safeParsePaginatedResponse<T>(response: unknown, itemValidator?: (item: unknown) => item is T): DTOPaginatedResponse<T> | null {
  try {
    return validatePaginatedResponse(response, itemValidator)
  } catch {
    return null
  }
}

// ============================================================================
// 데이터 변환 유틸리티
// ============================================================================

export function convertStringToDate(dateString: string | Date): Date {
  if (dateString instanceof Date) {
    return dateString
  }
  
  if (!isDateString(dateString)) {
    throw new Error(`Invalid date string: ${dateString}`)
  }
  
  return new Date(dateString)
}

export function convertDateToString(date: Date | string): string {
  if (isString(date)) {
    return date
  }
  
  return date.toISOString()
}

export function normalizeUserDTO(user: unknown): UserDTO {
  const validated = validateUserDTO(user)
  
  // 날짜 필드 정규화
  return {
    ...validated,
    createdAt: convertStringToDate(validated.createdAt),
    updatedAt: convertStringToDate(validated.updatedAt),
    birthDate: validated.birthDate ? convertStringToDate(validated.birthDate) : null,
    lastLoginAt: validated.lastLoginAt ? convertStringToDate(validated.lastLoginAt) : undefined,
    lastActivityAt: validated.lastActivityAt ? convertStringToDate(validated.lastActivityAt) : undefined,
  }
}

export function normalizeWorkoutPlanDTO(plan: unknown): WorkoutPlanDTO {
  const validated = validateWorkoutPlanDTO(plan)
  
  return {
    ...validated,
    createdAt: convertStringToDate(validated.createdAt),
    updatedAt: convertStringToDate(validated.updatedAt),
    exercises: validated.exercises.map(exercise => ({
      ...exercise,
      createdAt: convertStringToDate(exercise.createdAt),
      updatedAt: convertStringToDate(exercise.updatedAt),
    })),
  }
}

export function normalizeWorkoutSessionDTO(session: unknown): WorkoutSessionDTO {
  const validated = validateWorkoutSessionDTO(session)
  
  return {
    ...validated,
    createdAt: convertStringToDate(validated.createdAt),
    updatedAt: convertStringToDate(validated.updatedAt),
    startTime: convertStringToDate(validated.startTime),
    endTime: validated.endTime ? convertStringToDate(validated.endTime) : undefined,
    exerciseSets: validated.exerciseSets.map(set => ({
      ...set,
      createdAt: convertStringToDate(set.createdAt),
      updatedAt: convertStringToDate(set.updatedAt),
    })),
  }
}

export function normalizeWorkoutGoalDTO(goal: unknown): WorkoutGoalDTO {
  const validated = validateWorkoutGoalDTO(goal)
  
  return {
    ...validated,
    createdAt: convertStringToDate(validated.createdAt),
    updatedAt: convertStringToDate(validated.updatedAt),
    deadline: validated.deadline ? convertStringToDate(validated.deadline) : undefined,
    completedAt: validated.completedAt ? convertStringToDate(validated.completedAt) : undefined,
  }
}

export function normalizeMachineDTO(machine: unknown): MachineDTO {
  const validated = validateMachineDTO(machine)
  
  return {
    ...validated,
    createdAt: convertStringToDate(validated.createdAt),
    updatedAt: convertStringToDate(validated.updatedAt),
  }
}

export function normalizeExerciseSetDTO(exerciseSet: unknown): ExerciseSetDTO {
  const validated = validateExerciseSetDTO(exerciseSet)
  
  return {
    ...validated,
    createdAt: convertStringToDate(validated.createdAt),
    updatedAt: convertStringToDate(validated.updatedAt),
  }
}

export function normalizeGymDTO(gym: unknown): GymDTO {
  const validated = isGymDTO(gym) ? gym : (() => { throw new Error('Invalid GymDTO') })()
  
  return {
    ...validated,
    createdAt: convertStringToDate(validated.createdAt),
    updatedAt: convertStringToDate(validated.updatedAt),
  }
}

export function normalizeUserLevelDTO(userLevel: unknown): UserLevelDTO {
  const validated = isUserLevelDTO(userLevel) ? userLevel : (() => { throw new Error('Invalid UserLevelDTO') })()
  
  return {
    ...validated,
    createdAt: convertStringToDate(validated.createdAt),
    updatedAt: convertStringToDate(validated.updatedAt),
    lastLevelUpAt: validated.lastLevelUpAt ? convertStringToDate(validated.lastLevelUpAt) : undefined,
  }
}

export function normalizeUserStreakDTO(userStreak: unknown): UserStreakDTO {
  const validated = isUserStreakDTO(userStreak) ? userStreak : (() => { throw new Error('Invalid UserStreakDTO') })()
  
  return {
    ...validated,
    createdAt: convertStringToDate(validated.createdAt),
    updatedAt: convertStringToDate(validated.updatedAt),
    lastWorkoutDate: validated.lastWorkoutDate ? convertStringToDate(validated.lastWorkoutDate) : undefined,
    streakStartDate: validated.streakStartDate ? convertStringToDate(validated.streakStartDate) : undefined,
  }
}

// ============================================================================
// 배열 정규화 함수들
// ============================================================================

export function normalizeUserDTOArray(users: unknown): UserDTO[] {
  if (!isArray(users)) {
    throw new Error('Expected array of users')
  }
  
  return users.map(normalizeUserDTO)
}

export function normalizeWorkoutPlanDTOArray(plans: unknown): WorkoutPlanDTO[] {
  if (!isArray(plans)) {
    throw new Error('Expected array of workout plans')
  }
  
  return plans.map(normalizeWorkoutPlanDTO)
}

export function normalizeWorkoutSessionDTOArray(sessions: unknown): WorkoutSessionDTO[] {
  if (!isArray(sessions)) {
    throw new Error('Expected array of workout sessions')
  }
  
  return sessions.map(normalizeWorkoutSessionDTO)
}

export function normalizeWorkoutGoalDTOArray(goals: unknown): WorkoutGoalDTO[] {
  if (!isArray(goals)) {
    throw new Error('Expected array of workout goals')
  }
  
  return goals.map(normalizeWorkoutGoalDTO)
}

export function normalizeMachineDTOArray(machines: unknown): MachineDTO[] {
  if (!isArray(machines)) {
    throw new Error('Expected array of machines')
  }
  
  return machines.map(normalizeMachineDTO)
}

export function normalizeExerciseSetDTOArray(exerciseSets: unknown): ExerciseSetDTO[] {
  if (!isArray(exerciseSets)) {
    throw new Error('Expected array of exercise sets')
  }
  
  return exerciseSets.map(normalizeExerciseSetDTO)
}

export function normalizeGymDTOArray(gyms: unknown): GymDTO[] {
  if (!isArray(gyms)) {
    throw new Error('Expected array of gyms')
  }
  
  return gyms.map(normalizeGymDTO)
}

export function normalizeUserLevelDTOArray(userLevels: unknown): UserLevelDTO[] {
  if (!isArray(userLevels)) {
    throw new Error('Expected array of user levels')
  }
  
  return userLevels.map(normalizeUserLevelDTO)
}

export function normalizeUserStreakDTOArray(userStreaks: unknown): UserStreakDTO[] {
  if (!isArray(userStreaks)) {
    throw new Error('Expected array of user streaks')
  }
  
  return userStreaks.map(normalizeUserStreakDTO)
}

// ============================================================================
// 안전한 파싱 함수들
// ============================================================================

export function safeNormalizeUserDTO(user: unknown): UserDTO | null {
  try {
    return normalizeUserDTO(user)
  } catch {
    return null
  }
}

export function safeNormalizeWorkoutPlanDTO(plan: unknown): WorkoutPlanDTO | null {
  try {
    return normalizeWorkoutPlanDTO(plan)
  } catch {
    return null
  }
}

export function safeNormalizeWorkoutSessionDTO(session: unknown): WorkoutSessionDTO | null {
  try {
    return normalizeWorkoutSessionDTO(session)
  } catch {
    return null
  }
}

export function safeNormalizeWorkoutGoalDTO(goal: unknown): WorkoutGoalDTO | null {
  try {
    return normalizeWorkoutGoalDTO(goal)
  } catch {
    return null
  }
}

export function safeNormalizeMachineDTO(machine: unknown): MachineDTO | null {
  try {
    return normalizeMachineDTO(machine)
  } catch {
    return null
  }
}

export function safeNormalizeExerciseSetDTO(exerciseSet: unknown): ExerciseSetDTO | null {
  try {
    return normalizeExerciseSetDTO(exerciseSet)
  } catch {
    return null
  }
}

export function safeNormalizeGymDTO(gym: unknown): GymDTO | null {
  try {
    return normalizeGymDTO(gym)
  } catch {
    return null
  }
}

export function safeNormalizeUserLevelDTO(userLevel: unknown): UserLevelDTO | null {
  try {
    return normalizeUserLevelDTO(userLevel)
  } catch {
    return null
  }
}

export function safeNormalizeUserStreakDTO(userStreak: unknown): UserStreakDTO | null {
  try {
    return normalizeUserStreakDTO(userStreak)
  } catch {
    return null
  }
}

// ============================================================================
// 입력 검증 함수들
// ============================================================================

export function validateEmail(email: unknown): string {
  if (!isEmail(email)) {
    throw new Error('Invalid email format')
  }
  return email
}

export function validatePhoneNumber(phone: unknown): string {
  if (!isPhoneNumber(phone)) {
    throw new Error('Invalid phone number format')
  }
  return phone
}

export function validateUrl(url: unknown): string {
  if (!isUrl(url)) {
    throw new Error('Invalid URL format')
  }
  return url
}

export function validatePositiveNumber(value: unknown): number {
  if (!isPositiveNumber(value)) {
    throw new Error('Value must be a positive number')
  }
  return value
}

export function validateNonNegativeNumber(value: unknown): number {
  if (!isNonNegativeNumber(value)) {
    throw new Error('Value must be a non-negative number')
  }
  return value
}

export function validatePositiveInteger(value: unknown): number {
  if (!isPositiveInteger(value)) {
    throw new Error('Value must be a positive integer')
  }
  return value
}

export function validateNonNegativeInteger(value: unknown): number {
  if (!isNonNegativeInteger(value)) {
    throw new Error('Value must be a non-negative integer')
  }
  return value
}

export function validateString(value: unknown): string {
  if (!isString(value)) {
    throw new Error('Value must be a string')
  }
  return value
}

export function validateNonEmptyString(value: unknown): string {
  const str = validateString(value)
  if (str.length === 0) {
    throw new Error('String cannot be empty')
  }
  return str
}

// ============================================================================
// 복합 검증 함수들
// ============================================================================

export function validateWorkoutPlanInput(input: unknown): {
  name: string
  description?: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimatedDurationMinutes: number
  targetMuscleGroups?: string[]
  isTemplate: boolean
  isPublic: boolean
} {
  if (!isObject(input)) {
    throw new Error('Input must be an object')
  }
  
  return {
    name: validateNonEmptyString(input.name),
    description: input.description ? validateString(input.description) : undefined,
    difficulty: validateWorkoutDifficulty(input.difficulty),
    estimatedDurationMinutes: validatePositiveNumber(input.estimatedDurationMinutes),
    targetMuscleGroups: input.targetMuscleGroups ? validateStringArray(input.targetMuscleGroups) : undefined,
    isTemplate: validateBoolean(input.isTemplate),
    isPublic: validateBoolean(input.isPublic),
  }
}

export function validateWorkoutGoalInput(input: unknown): {
  title: string
  description?: string
  type: 'weight' | 'reps' | 'duration' | 'frequency' | 'streak'
  targetValue: number
  currentValue: number
  unit: string
  deadline?: Date
  planId?: number
  exerciseId?: number
} {
  if (!isObject(input)) {
    throw new Error('Input must be an object')
  }
  
  return {
    title: validateNonEmptyString(input.title),
    description: input.description ? validateString(input.description) : undefined,
    type: validateWorkoutGoalType(input.type),
    targetValue: validatePositiveNumber(input.targetValue),
    currentValue: validateNonNegativeNumber(input.currentValue),
    unit: validateNonEmptyString(input.unit),
    deadline: input.deadline ? convertStringToDate(input.deadline as string) : undefined,
    planId: input.planId ? validatePositiveInteger(input.planId) : undefined,
    exerciseId: input.exerciseId ? validatePositiveInteger(input.exerciseId) : undefined,
  }
}

// ============================================================================
// 헬퍼 검증 함수들
// ============================================================================

function validateBoolean(value: unknown): boolean {
  if (!isBoolean(value)) {
    throw new Error('Value must be a boolean')
  }
  return value
}

function validateStringArray(value: unknown): string[] {
  if (!isArray(value, isString)) {
    throw new Error('Value must be an array of strings')
  }
  return value
}

function validateWorkoutDifficulty(value: unknown): 'beginner' | 'intermediate' | 'advanced' {
  if (!isString(value) || !['beginner', 'intermediate', 'advanced'].includes(value)) {
    throw new Error('Difficulty must be one of: beginner, intermediate, advanced')
  }
  return value as 'beginner' | 'intermediate' | 'advanced'
}

function validateWorkoutGoalType(value: unknown): 'weight' | 'reps' | 'duration' | 'frequency' | 'streak' {
  if (!isString(value) || !['weight', 'reps', 'duration', 'frequency', 'streak'].includes(value)) {
    throw new Error('Goal type must be one of: weight, reps, duration, frequency, streak')
  }
  return value as 'weight' | 'reps' | 'duration' | 'frequency' | 'streak'
}

// ============================================================================
// 에러 처리 유틸리티
// ============================================================================

export class ValidationError extends Error {
  constructor(message: string, public field?: string, public value?: unknown) {
    super(message)
    this.name = 'ValidationError'
  }
}

export function createValidationError(message: string, field?: string, value?: unknown): ValidationError {
  return new ValidationError(message, field, value)
}

export function isValidationError(error: unknown): error is ValidationError {
  return error instanceof ValidationError
}

// ============================================================================
// 추가 검증 함수들
// ============================================================================

export function isRequired(value: unknown): boolean {
  if (value === null || value === undefined) return false
  if (typeof value === 'string') return value.trim().length > 0
  if (Array.isArray(value)) return value.length > 0
  return true
}

export function minLength(value: string, min: number): boolean {
  return value.length >= min
}

export function maxLength(value: string, max: number): boolean {
  return value.length <= max
}

// ============================================================================
// 통합 validation 객체 (기존 코드 호환성)
// ============================================================================

export const validation = {
  // 타입 가드 함수들
  isUserDTO,
  isWorkoutPlanDTO,
  isWorkoutSessionDTO,
  isWorkoutGoalDTO,
  isMachineDTO,
  isExerciseSetDTO,
  isGymDTO,
  isUserLevelDTO,
  isUserStreakDTO,
  isDTOResponse,
  isDTOPaginatedResponse,
  
  // 검증 함수들
  validateUserDTO,
  validateWorkoutPlanDTO,
  validateWorkoutSessionDTO,
  validateWorkoutGoalDTO,
  validateMachineDTO,
  validateExerciseSetDTO,
  validateGymDTO,
  validateUserLevelDTO,
  validateUserStreakDTO,
  
  // 안전한 파싱 함수들
  safeParseUserDTO,
  safeParseWorkoutPlanDTO,
  safeParseWorkoutSessionDTO,
  safeParseWorkoutGoalDTO,
  safeParseMachineDTO,
  safeParseExerciseSetDTO,
  safeParseGymDTO,
  safeParseUserLevelDTO,
  safeParseUserStreakDTO,
  
  // 기본 타입 검증
  isString,
  isNumber,
  isBoolean,
  isDateString,
  isArray,
  isObject,
  isEmail,
  isPhoneNumber,
  isUrl,
  isPositiveNumber,
  isNonNegativeNumber,
  isPositiveInteger,
  isNonNegativeInteger,
  
  // 에러 처리
  ValidationError,
  createValidationError,
  isValidationError,
  
  // 추가 검증 함수들
  isRequired,
  minLength,
  maxLength,
}

// ============================================================================
// 누락된 검증 함수들 추가
// ============================================================================

export function validateGymDTO(gym: unknown): GymDTO {
  if (!isGymDTO(gym)) {
    throw new Error('Invalid gym data')
  }
  
  return normalizeGymDTO(gym)
}

export function validateUserLevelDTO(userLevel: unknown): UserLevelDTO {
  if (!isUserLevelDTO(userLevel)) {
    throw new Error('Invalid user level data')
  }
  
  return normalizeUserLevelDTO(userLevel)
}

export function validateUserStreakDTO(userStreak: unknown): UserStreakDTO {
  if (!isUserStreakDTO(userStreak)) {
    throw new Error('Invalid user streak data')
  }
  
  return normalizeUserStreakDTO(userStreak)
}

export function safeParseGymDTO(gym: unknown): GymDTO | null {
  try {
    return validateGymDTO(gym)
  } catch {
    return null
  }
}

export function safeParseUserLevelDTO(userLevel: unknown): UserLevelDTO | null {
  try {
    return validateUserLevelDTO(userLevel)
  } catch {
    return null
  }
}

export function safeParseUserStreakDTO(userStreak: unknown): UserStreakDTO | null {
  try {
    return validateUserStreakDTO(userStreak)
  } catch {
    return null
  }
}