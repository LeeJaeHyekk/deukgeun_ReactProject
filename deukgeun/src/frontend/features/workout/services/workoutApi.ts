// ============================================================================
// Workout API Service - Unified API Client
// ============================================================================

import { api } from "../../../shared/api"
import type {
  WorkoutPlan,
  WorkoutSession,
  WorkoutGoal,
  CreatePlanRequest,
  UpdatePlanRequest,
  CreateSessionRequest,
  UpdateSessionRequest,
  CreateGoalRequest,
  UpdateGoalRequest,
  ApiResponse,
  PaginationParams,
  PaginatedResponse,
} from "../types"

// ============================================================================
// API Endpoints
// ============================================================================

const ENDPOINTS = {
  PLANS: {
    LIST: "/api/workout-journal/plans",
    CREATE: "/api/workout-journal/plans",
    DETAIL: (id: number) => `/api/workout-journal/plans/${id}`,
    UPDATE: (id: number) => `/api/workout-journal/plans/${id}`,
    DELETE: (id: number) => `/api/workout-journal/plans/${id}`,
  },
  SESSIONS: {
    LIST: "/api/workout-journal/sessions",
    CREATE: "/api/workout-journal/sessions",
    DETAIL: (id: number) => `/api/workout-journal/sessions/${id}`,
    UPDATE: (id: number) => `/api/workout-journal/sessions/${id}`,
    DELETE: (id: number) => `/api/workout-journal/sessions/${id}`,
  },
  GOALS: {
    LIST: "/api/workout-journal/goals",
    CREATE: "/api/workout-journal/goals",
    DETAIL: (id: number) => `/api/workout-journal/goals/${id}`,
    UPDATE: (id: number) => `/api/workout-journal/goals/${id}`,
    DELETE: (id: number) => `/api/workout-journal/goals/${id}`,
  },
} as const

// ============================================================================
// Error Handling
// ============================================================================

class WorkoutApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message)
    this.name = "WorkoutApiError"
  }
}

const handleApiError = (error: any): never => {
  if (error.response) {
    const { status, data } = error.response
    const message = data?.message || data?.error || "API 요청 실패"
    throw new WorkoutApiError(message, status, data?.code)
  } else if (error.request) {
    throw new WorkoutApiError("네트워크 연결 실패", 0)
  } else {
    throw new WorkoutApiError(error.message || "알 수 없는 오류", 0)
  }
}

// ============================================================================
// Response Transformers
// ============================================================================

const transformPlanResponse = (data: any): WorkoutPlan => ({
  id: data.id,
  userId: data.userId,
  name: data.name,
  description: data.description,
  difficulty: data.difficulty,
  estimatedDurationMinutes: data.estimatedDurationMinutes,
  targetMuscleGroups: data.targetMuscleGroups,
  isTemplate: data.isTemplate,
  isPublic: data.isPublic,
  exercises: data.exercises || [],
  status: data.status || "active",
  createdAt: new Date(data.createdAt),
  updatedAt: new Date(data.updatedAt),
})

const transformSessionResponse = (data: any): WorkoutSession => ({
  id: data.id,
  userId: data.userId,
  planId: data.planId,
  gymId: data.gymId,
  name: data.name,
  startTime: new Date(data.startTime),
  endTime: data.endTime ? new Date(data.endTime) : undefined,
  totalDurationMinutes: data.totalDurationMinutes,
  moodRating: data.moodRating,
  energyLevel: data.energyLevel,
  notes: data.notes,
  status: data.status,
  exerciseSets: data.exerciseSets || [],
  plan: data.plan ? transformPlanResponse(data.plan) : undefined,
  createdAt: new Date(data.createdAt),
  updatedAt: new Date(data.updatedAt),
})

const transformGoalResponse = (data: any): WorkoutGoal => ({
  id: data.id,
  userId: data.userId,
  title: data.title,
  description: data.description,
  type: data.type,
  targetValue: data.targetValue,
  currentValue: data.currentValue,
  unit: data.unit,
  deadline: data.deadline ? new Date(data.deadline) : undefined,
  isCompleted: data.isCompleted,
  completedAt: data.completedAt ? new Date(data.completedAt) : undefined,
  createdAt: new Date(data.createdAt),
  updatedAt: new Date(data.updatedAt),
})

// ============================================================================
// Workout Plans API
// ============================================================================

export const workoutPlansApi = {
  // 계획 목록 조회
  getPlans: async (
    params?: PaginationParams
  ): Promise<PaginatedResponse<WorkoutPlan>> => {
    try {
      console.log("📡 [WorkoutPlansApi] Fetching plans...")
      const response = await api.get(ENDPOINTS.PLANS.LIST, { params })

      const plans = Array.isArray(response.data.data)
        ? response.data.data.map(transformPlanResponse)
        : []

      console.log(`✅ [WorkoutPlansApi] Fetched ${plans.length} plans`)

      return {
        data: plans,
        total: (response.data as any).total || plans.length,
        page: (response.data as any).page || 1,
        limit: (response.data as any).limit || plans.length,
        totalPages: (response.data as any).totalPages || 1,
      }
    } catch (error) {
      console.error("❌ [WorkoutPlansApi] Failed to fetch plans:", error)
      handleApiError(error)
      throw error
      throw error
    }
  },

  // 계획 상세 조회
  getPlan: async (id: number): Promise<WorkoutPlan> => {
    try {
      console.log(`📡 [WorkoutPlansApi] Fetching plan ${id}...`)
      const response = await api.get(ENDPOINTS.PLANS.DETAIL(id))

      const plan = transformPlanResponse(response.data.data || response.data)
      console.log(`✅ [WorkoutPlansApi] Fetched plan: ${plan.name}`)

      return plan
    } catch (error) {
      console.error(`❌ [WorkoutPlansApi] Failed to fetch plan ${id}:`, error)
      handleApiError(error)
      throw error
      throw error
    }
  },

  // 계획 생성
  createPlan: async (planData: CreatePlanRequest): Promise<WorkoutPlan> => {
    try {
      console.log("📡 [WorkoutPlansApi] Creating plan...")
      const response = await api.post(ENDPOINTS.PLANS.CREATE, planData)

      const plan = transformPlanResponse(response.data.data || response.data)
      console.log(`✅ [WorkoutPlansApi] Created plan: ${plan.name}`)

      return plan
    } catch (error) {
      console.error("❌ [WorkoutPlansApi] Failed to create plan:", error)
      handleApiError(error)
      throw error
      throw error
    }
  },

  // 계획 수정
  updatePlan: async (
    id: number,
    planData: UpdatePlanRequest
  ): Promise<WorkoutPlan> => {
    try {
      console.log(`📡 [WorkoutPlansApi] Updating plan ${id}...`)
      const response = await api.put(ENDPOINTS.PLANS.UPDATE(id), planData)

      const plan = transformPlanResponse(response.data.data || response.data)
      console.log(`✅ [WorkoutPlansApi] Updated plan: ${plan.name}`)

      return plan
    } catch (error) {
      console.error(`❌ [WorkoutPlansApi] Failed to update plan ${id}:`, error)
      handleApiError(error)
      throw error
      throw error
    }
  },

  // 계획 삭제
  deletePlan: async (id: number): Promise<void> => {
    try {
      console.log(`📡 [WorkoutPlansApi] Deleting plan ${id}...`)
      await api.delete(ENDPOINTS.PLANS.DELETE(id))
      console.log(`✅ [WorkoutPlansApi] Deleted plan ${id}`)
    } catch (error) {
      console.error(`❌ [WorkoutPlansApi] Failed to delete plan ${id}:`, error)
      handleApiError(error)
      throw error
    }
  },
}

// ============================================================================
// Workout Sessions API
// ============================================================================

export const workoutSessionsApi = {
  // 세션 목록 조회
  getSessions: async (
    params?: PaginationParams
  ): Promise<PaginatedResponse<WorkoutSession>> => {
    try {
      console.log("📡 [WorkoutSessionsApi] Fetching sessions...")
      const response = await api.get(ENDPOINTS.SESSIONS.LIST, { params })

      const sessions = Array.isArray(response.data.data)
        ? response.data.data.map(transformSessionResponse)
        : []

      console.log(`✅ [WorkoutSessionsApi] Fetched ${sessions.length} sessions`)

      return {
        data: sessions,
        total: (response.data as any).total || sessions.length,
        page: (response.data as any).page || 1,
        limit: (response.data as any).limit || sessions.length,
        totalPages: (response.data as any).totalPages || 1,
      }
    } catch (error) {
      console.error("❌ [WorkoutSessionsApi] Failed to fetch sessions:", error)
      handleApiError(error)
      throw error
    }
  },

  // 세션 상세 조회
  getSession: async (id: number): Promise<WorkoutSession> => {
    try {
      console.log(`📡 [WorkoutSessionsApi] Fetching session ${id}...`)
      const response = await api.get(ENDPOINTS.SESSIONS.DETAIL(id))

      const session = transformSessionResponse(
        response.data.data || response.data
      )
      console.log(`✅ [WorkoutSessionsApi] Fetched session: ${session.name}`)

      return session
    } catch (error) {
      console.error(
        `❌ [WorkoutSessionsApi] Failed to fetch session ${id}:`,
        error
      )
      handleApiError(error)
      throw error
    }
  },

  // 세션 생성
  createSession: async (
    sessionData: CreateSessionRequest
  ): Promise<WorkoutSession> => {
    try {
      console.log("📡 [WorkoutSessionsApi] Creating session...")
      const response = await api.post(ENDPOINTS.SESSIONS.CREATE, sessionData)

      const session = transformSessionResponse(
        response.data.data || response.data
      )
      console.log(`✅ [WorkoutSessionsApi] Created session: ${session.name}`)

      return session
    } catch (error) {
      console.error("❌ [WorkoutSessionsApi] Failed to create session:", error)
      handleApiError(error)
      throw error
    }
  },

  // 세션 수정
  updateSession: async (
    id: number,
    sessionData: UpdateSessionRequest
  ): Promise<WorkoutSession> => {
    try {
      console.log(`📡 [WorkoutSessionsApi] Updating session ${id}...`)
      const response = await api.put(ENDPOINTS.SESSIONS.UPDATE(id), sessionData)

      const session = transformSessionResponse(
        response.data.data || response.data
      )
      console.log(`✅ [WorkoutSessionsApi] Updated session: ${session.name}`)

      return session
    } catch (error) {
      console.error(
        `❌ [WorkoutSessionsApi] Failed to update session ${id}:`,
        error
      )
      handleApiError(error)
      throw error
    }
  },

  // 세션 삭제
  deleteSession: async (id: number): Promise<void> => {
    try {
      console.log(`📡 [WorkoutSessionsApi] Deleting session ${id}...`)
      await api.delete(ENDPOINTS.SESSIONS.DELETE(id))
      console.log(`✅ [WorkoutSessionsApi] Deleted session ${id}`)
    } catch (error) {
      console.error(
        `❌ [WorkoutSessionsApi] Failed to delete session ${id}:`,
        error
      )
      handleApiError(error)
      throw error
    }
  },
}

// ============================================================================
// Workout Goals API
// ============================================================================

export const workoutGoalsApi = {
  // 목표 목록 조회
  getGoals: async (
    params?: PaginationParams
  ): Promise<PaginatedResponse<WorkoutGoal>> => {
    try {
      console.log("📡 [WorkoutGoalsApi] Fetching goals...")
      const response = await api.get(ENDPOINTS.GOALS.LIST, { params })

      const goals = Array.isArray(response.data.data)
        ? response.data.data.map(transformGoalResponse)
        : []

      console.log(`✅ [WorkoutGoalsApi] Fetched ${goals.length} goals`)

      return {
        data: goals,
        total: (response.data as any).total || goals.length,
        page: (response.data as any).page || 1,
        limit: (response.data as any).limit || goals.length,
        totalPages: (response.data as any).totalPages || 1,
      }
    } catch (error) {
      console.error("❌ [WorkoutGoalsApi] Failed to fetch goals:", error)
      handleApiError(error)
      throw error
    }
  },

  // 목표 상세 조회
  getGoal: async (id: number): Promise<WorkoutGoal> => {
    try {
      console.log(`📡 [WorkoutGoalsApi] Fetching goal ${id}...`)
      const response = await api.get(ENDPOINTS.GOALS.DETAIL(id))

      const goal = transformGoalResponse(response.data.data || response.data)
      console.log(`✅ [WorkoutGoalsApi] Fetched goal: ${goal.title}`)

      return goal
    } catch (error) {
      console.error(`❌ [WorkoutGoalsApi] Failed to fetch goal ${id}:`, error)
      handleApiError(error)
      throw error
    }
  },

  // 목표 생성
  createGoal: async (goalData: CreateGoalRequest): Promise<WorkoutGoal> => {
    try {
      console.log("📡 [WorkoutGoalsApi] Creating goal...")
      const response = await api.post(ENDPOINTS.GOALS.CREATE, goalData)

      const goal = transformGoalResponse(response.data.data || response.data)
      console.log(`✅ [WorkoutGoalsApi] Created goal: ${goal.title}`)

      return goal
    } catch (error) {
      console.error("❌ [WorkoutGoalsApi] Failed to create goal:", error)
      handleApiError(error)
      throw error
    }
  },

  // 목표 수정
  updateGoal: async (
    id: number,
    goalData: UpdateGoalRequest
  ): Promise<WorkoutGoal> => {
    try {
      console.log(`📡 [WorkoutGoalsApi] Updating goal ${id}...`)
      const response = await api.put(ENDPOINTS.GOALS.UPDATE(id), goalData)

      const goal = transformGoalResponse(response.data.data || response.data)
      console.log(`✅ [WorkoutGoalsApi] Updated goal: ${goal.title}`)

      return goal
    } catch (error) {
      console.error(`❌ [WorkoutGoalsApi] Failed to update goal ${id}:`, error)
      handleApiError(error)
      throw error
    }
  },

  // 목표 삭제
  deleteGoal: async (id: number): Promise<void> => {
    try {
      console.log(`📡 [WorkoutGoalsApi] Deleting goal ${id}...`)
      await api.delete(ENDPOINTS.GOALS.DELETE(id))
      console.log(`✅ [WorkoutGoalsApi] Deleted goal ${id}`)
    } catch (error) {
      console.error(`❌ [WorkoutGoalsApi] Failed to delete goal ${id}:`, error)
      handleApiError(error)
      throw error
    }
  },
}

// ============================================================================
// Unified Workout API
// ============================================================================

export const workoutApi = {
  plans: workoutPlansApi,
  sessions: workoutSessionsApi,
  goals: workoutGoalsApi,
}

export { WorkoutApiError }
