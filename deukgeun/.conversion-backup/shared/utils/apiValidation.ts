// ============================================================================
// API 응답 검증 시스템
// ============================================================================

import { isString, isNumber, isBoolean, isObject, isArray, isDateString } from '@shared/types/guards'
import type { ApiResponse, PaginatedResponse, User, Machine, WorkoutPlan, WorkoutGoal } from '@shared/types/common'

// ============================================================================
// 페이지네이션 응답 타입 (기존 타입과 호환)
// ============================================================================

export interface ApiPaginatedResponse<T = unknown> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// ============================================================================
// API 응답 검증 함수들
// ============================================================================

export function isValidApiResponse<T>(value: unknown): value is ApiResponse<T> {
  if (!isObject(value)) return false
  
  const response = value as Record<string, unknown>
  
  return (
    typeof response.success === 'boolean' &&
    response.data !== undefined &&
    (response.message === undefined || isString(response.message)) &&
    (response.error === undefined || isString(response.error)) &&
    (response.timestamp === undefined || isString(response.timestamp))
  )
}

// API 응답 파싱 및 검증
export function parseApiResponse<T>(response: unknown): ApiResponse<T> {
  if (!isValidApiResponse<T>(response)) {
    throw new Error('Invalid API response format')
  }
  return response
}

// API 에러 생성
export function createApiError(message: string, statusCode = 500): Error {
  const error = new Error(message)
  ;(error as any).statusCode = statusCode
  return error
}

// 타입 안전한 API 클라이언트
export class TypedApiClient {
  private baseURL: string
  private defaultHeaders: Record<string, string>

  constructor(baseURL: string, defaultHeaders: Record<string, string> = {}) {
    this.baseURL = baseURL
    this.defaultHeaders = defaultHeaders
  }

  // GET 요청
  async get<T>(endpoint: string, headers?: Record<string, string>): Promise<T> {
    const response = await this.makeRequest<T>(endpoint, {
      method: 'GET',
      headers: { ...this.defaultHeaders, ...headers }
    })
    if (response.data === undefined) {
      throw createApiError('Response data is undefined')
    }
    return response.data
  }

  // POST 요청
  async post<T>(endpoint: string, data?: unknown, headers?: Record<string, string>): Promise<T> {
    const response = await this.makeRequest<T>(endpoint, {
      method: 'POST',
      headers: { ...this.defaultHeaders, ...headers },
      body: data ? JSON.stringify(data) : undefined
    })
    if (response.data === undefined) {
      throw createApiError('Response data is undefined')
    }
    return response.data
  }

  // PUT 요청
  async put<T>(endpoint: string, data?: unknown, headers?: Record<string, string>): Promise<T> {
    const response = await this.makeRequest<T>(endpoint, {
      method: 'PUT',
      headers: { ...this.defaultHeaders, ...headers },
      body: data ? JSON.stringify(data) : undefined
    })
    if (response.data === undefined) {
      throw createApiError('Response data is undefined')
    }
    return response.data
  }

  // DELETE 요청
  async delete<T>(endpoint: string, headers?: Record<string, string>): Promise<T> {
    const response = await this.makeRequest<T>(endpoint, {
      method: 'DELETE',
      headers: { ...this.defaultHeaders, ...headers }
    })
    if (response.data === undefined) {
      throw createApiError('Response data is undefined')
    }
    return response.data
  }

  // 내부 요청 처리
  private async makeRequest<T>(endpoint: string, options: RequestInit): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseURL}${endpoint}`
      const response = await fetch(url, options)
      
      if (!response.ok) {
        throw createApiError(`HTTP ${response.status}: ${response.statusText}`, response.status)
      }

      const data = await response.json()
      return parseApiResponse<T>(data)
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw createApiError('Unknown API error occurred')
    }
  }
}

// ============================================================================
// 특정 엔티티 타입 가드 함수들
// ============================================================================

// 사용자 타입 검증
export function isValidUser(value: unknown): value is User {
  if (!isObject(value)) return false
  
  const user = value as Record<string, unknown>
  
  return (
    isNumber(user.id) &&
    isString(user.email) &&
    isString(user.name) &&
    (user.phone === undefined || isString(user.phone)) &&
    (user.birthDate === undefined || isDateString(user.birthDate)) &&
    (user.gender === undefined || isString(user.gender)) &&
    (user.height === undefined || isNumber(user.height)) &&
    (user.weight === undefined || isNumber(user.weight)) &&
    (user.createdAt === undefined || isDateString(user.createdAt)) &&
    (user.updatedAt === undefined || isDateString(user.updatedAt))
  )
}

// 머신 타입 검증
export function isValidMachine(value: unknown): value is Machine {
  if (!isObject(value)) return false
  
  const machine = value as Record<string, unknown>
  
  return (
    isNumber(machine.id) &&
    isString(machine.name) &&
    isString(machine.description) &&
    isString(machine.category) &&
    isString(machine.difficulty) &&
    isString(machine.targetMuscle) &&
    (machine.imageUrl === undefined || isString(machine.imageUrl)) &&
    (machine.videoUrl === undefined || isString(machine.videoUrl)) &&
    (machine.createdAt === undefined || isDateString(machine.createdAt)) &&
    (machine.updatedAt === undefined || isDateString(machine.updatedAt))
  )
}

// 운동 계획 타입 검증
export function isValidWorkoutPlan(value: unknown): value is WorkoutPlan {
  if (!isObject(value)) return false
  
  const plan = value as Record<string, unknown>
  
  return (
    isNumber(plan.id) &&
    isString(plan.name) &&
    isString(plan.description) &&
    isString(plan.difficulty) &&
    isNumber(plan.estimatedDurationMinutes) &&
    (plan.exercises === undefined || isArray(plan.exercises)) &&
    (plan.createdAt === undefined || isDateString(plan.createdAt)) &&
    (plan.updatedAt === undefined || isDateString(plan.updatedAt))
  )
}

// 운동 목표 타입 검증
export function isValidWorkoutGoal(value: unknown): value is WorkoutGoal {
  if (!isObject(value)) return false
  
  const goal = value as Record<string, unknown>
  
  return (
    isNumber(goal.id) &&
    isString(goal.title) &&
    isString(goal.description) &&
    isString(goal.type) &&
    isString(goal.unit) &&
    isNumber(goal.targetValue) &&
    isNumber(goal.currentValue) &&
    isBoolean(goal.isCompleted) &&
    (goal.deadline === undefined || isDateString(goal.deadline)) &&
    (goal.createdAt === undefined || isDateString(goal.createdAt)) &&
    (goal.updatedAt === undefined || isDateString(goal.updatedAt))
  )
}

// 배열 타입 검증 헬퍼
export function isValidArray<T>(
  value: unknown, 
  itemValidator: (item: unknown) => item is T
): value is T[] {
  if (!isArray(value)) return false
  
  return value.every(itemValidator)
}

// 사용자 배열 검증
export function isValidUserArray(value: unknown): value is User[] {
  return isValidArray(value, isValidUser)
}

// 머신 배열 검증
export function isValidMachineArray(value: unknown): value is Machine[] {
  return isValidArray(value, isValidMachine)
}

// 운동 계획 배열 검증
export function isValidWorkoutPlanArray(value: unknown): value is WorkoutPlan[] {
  return isValidArray(value, isValidWorkoutPlan)
}

// 운동 목표 배열 검증
export function isValidWorkoutGoalArray(value: unknown): value is WorkoutGoal[] {
  return isValidArray(value, isValidWorkoutGoal)
}

export function isValidPaginatedResponse<T>(value: unknown): value is ApiPaginatedResponse<T> {
  if (!isValidApiResponse<T[]>(value)) return false
  
  const response = value as ApiPaginatedResponse<T>
  
  if (!isObject(response.pagination)) return false
  
  const pagination = response.pagination as Record<string, unknown>
  
  return (
    isNumber(pagination.page) &&
    isNumber(pagination.limit) &&
    isNumber(pagination.total) &&
    isNumber(pagination.totalPages)
  )
}

// ============================================================================
// 안전한 API 응답 파싱 함수들 (중복 제거됨)
// ============================================================================

export function parsePaginatedResponse<T>(
  response: unknown,
  itemValidator?: (item: unknown) => item is T
): ApiPaginatedResponse<T> | null {
  if (!isValidPaginatedResponse<T>(response)) {
    console.error('Invalid paginated API response structure:', response)
    return null
  }
  
  const apiResponse = response as ApiPaginatedResponse<T>
  
  if (itemValidator && !isArray(apiResponse.data, itemValidator)) {
    console.error('Invalid paginated API response data:', apiResponse.data)
    return null
  }
  
  return apiResponse
}

// ============================================================================
// 에러 처리 유틸리티
// ============================================================================

// createApiError 함수는 중복으로 제거됨

export function handleApiError(error: unknown, context: string): never {
  if (error instanceof Error) {
    throw createApiError(`${context}: ${error.message}`)
  }
  
  throw createApiError(`${context}: Unknown error occurred`)
}

// ============================================================================
// 타입 안전한 API 클라이언트 래퍼 (중복 제거됨)
// ============================================================================

// ============================================================================
// 특정 도메인별 검증 함수들
// ============================================================================

export function isValidUserData(value: unknown): value is {
  id: number
  nickname: string
  email: string
  createdAt: string
} {
  if (!isObject(value)) return false
  
  const user = value as Record<string, unknown>
  
  return (
    isNumber(user.id) &&
    isString(user.nickname) &&
    isString(user.email) &&
    isDateString(user.createdAt)
  )
}

export function isValidMachineData(value: unknown): value is {
  id: number
  name: string
  category: string
  difficulty: string
  targetMuscle: string
  description?: string
  imageUrl?: string
} {
  if (!isObject(value)) return false
  
  const machine = value as Record<string, unknown>
  
  return (
    isNumber(machine.id) &&
    isString(machine.name) &&
    isString(machine.category) &&
    isString(machine.difficulty) &&
    isString(machine.targetMuscle) &&
    (machine.description === undefined || isString(machine.description)) &&
    (machine.imageUrl === undefined || isString(machine.imageUrl))
  )
}

export function isValidWorkoutPlanData(value: unknown): value is {
  id: number
  name: string
  description?: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimatedDurationMinutes: number
  targetMuscleGroups?: string[]
  isTemplate: boolean
  createdAt: string
  updatedAt: string
} {
  if (!isObject(value)) return false
  
  const plan = value as Record<string, unknown>
  
  return (
    isNumber(plan.id) &&
    isString(plan.name) &&
    (plan.description === undefined || isString(plan.description)) &&
    isString(plan.difficulty) && ['beginner', 'intermediate', 'advanced'].includes(plan.difficulty) &&
    isNumber(plan.estimatedDurationMinutes) &&
    (plan.targetMuscleGroups === undefined || isArray(plan.targetMuscleGroups, isString)) &&
    isBoolean(plan.isTemplate) &&
    isDateString(plan.createdAt) &&
    isDateString(plan.updatedAt)
  )
}
