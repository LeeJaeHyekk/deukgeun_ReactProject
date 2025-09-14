// ============================================================================
// Workout Feature API Client - Unified API Interface
// ============================================================================

import { apiClient } from '../../../../shared/api/client'
import type {
  WorkoutPlan,
  WorkoutSession,
  WorkoutGoal,
  WorkoutPlanExercise,
  ExerciseSet,
  CreatePlanRequest,
  UpdatePlanRequest,
  CreateSessionRequest,
  UpdateSessionRequest,
  CreateGoalRequest,
  UpdateGoalRequest,
  CreateExerciseSetRequest,
  UpdateExerciseSetRequest,
  DashboardData,
  ApiResponse,
  PaginationParams,
  PaginatedResponse,
} from '../types'

// ============================================================================
// API Endpoints Configuration
// ============================================================================

const API_ENDPOINTS = {
  // Plans
  PLANS: '/api/workouts/plans',
  PLAN: (id: number) => `/api/workouts/plans/${id}`,
  PLAN_EXERCISES: (planId: number) => `/api/workouts/plans/${planId}/exercises`,
  PLAN_EXERCISE: (planId: number, exerciseId: number) =>
    `/api/workouts/plans/${planId}/exercises/${exerciseId}`,

  // Sessions
  SESSIONS: '/api/workouts/sessions',
  SESSION: (id: number) => `/api/workouts/sessions/${id}`,
  SESSION_EXERCISES: (sessionId: number) =>
    `/api/workouts/sessions/${sessionId}/exercises`,
  SESSION_EXERCISE: (sessionId: number, exerciseId: number) =>
    `/api/workouts/sessions/${sessionId}/exercises/${exerciseId}`,
  SESSION_START: (id: number) => `/api/workouts/sessions/${id}/start`,
  SESSION_PAUSE: (id: number) => `/api/workouts/sessions/${id}/pause`,
  SESSION_RESUME: (id: number) => `/api/workouts/sessions/${id}/resume`,
  SESSION_COMPLETE: (id: number) => `/api/workouts/sessions/${id}/complete`,

  // Goals
  GOALS: '/api/workouts/goals',
  GOAL: (id: number) => `/api/workouts/goals/${id}`,

  // Dashboard
  DASHBOARD: '/api/workouts/dashboard',
} as const

// ============================================================================
// Error Handling
// ============================================================================

class WorkoutApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
    public details?: any
  ) {
    super(message)
    this.name = 'WorkoutApiError'
  }
}

const handleApiError = (error: any): void => {
  if (error instanceof WorkoutApiError) {
    throw error
  }

  if (error.response) {
    const { status, data } = error.response
    throw new WorkoutApiError(
      data?.message || 'API 요청 실패',
      status,
      data?.code,
      data?.details
    )
  }

  if (error.request) {
    throw new WorkoutApiError('네트워크 연결 실패', 0, 'NETWORK_ERROR')
  }

  throw new WorkoutApiError(
    error.message || '알 수 없는 오류',
    0,
    'UNKNOWN_ERROR'
  )
}

// ============================================================================
// API Client Implementation
// ============================================================================

export const workoutApi = {
  // ============================================================================
  // Plans API
  // ============================================================================

  /**
   * 운동 계획 목록 조회
   */
  async getPlans(params?: PaginationParams): Promise<WorkoutPlan[]> {
    try {
      console.log('📡 [workoutApi] getPlans 호출', { params })
      const queryParams = params
        ? {
            ...(params.page && { page: params.page.toString() }),
            ...(params.limit && { limit: params.limit.toString() }),
            ...(params.sortBy && { sortBy: params.sortBy }),
            ...(params.sortOrder && { sortOrder: params.sortOrder }),
          }
        : undefined
      const response = await apiClient.get<ApiResponse<WorkoutPlan[]>>(
        API_ENDPOINTS.PLANS,
        queryParams
      )
      const data = response.data as unknown as WorkoutPlan[]
      console.log('✅ [workoutApi] getPlans 성공', {
        count: data?.length || 0,
      })
      if (!data) {
        throw new WorkoutApiError('응답 데이터가 없습니다', 500, 'NO_DATA')
      }
      return data
    } catch (error) {
      console.error('❌ [workoutApi] getPlans 실패', error)
      handleApiError(error)
      throw error
    }
  },

  /**
   * 운동 계획 상세 조회
   */
  async getPlan(planId: number): Promise<WorkoutPlan> {
    try {
      console.log('📡 [workoutApi] getPlan 호출', { planId })
      const response = await apiClient.get<ApiResponse<WorkoutPlan>>(
        API_ENDPOINTS.PLAN(planId)
      )
      console.log('✅ [workoutApi] getPlan 성공', { planId })
      const data = response.data?.data || response.data
      if (!data) {
        throw new WorkoutApiError('응답 데이터가 없습니다', 500, 'NO_DATA')
      }
      return data as WorkoutPlan
    } catch (error) {
      console.error('❌ [workoutApi] getPlan 실패', { planId, error })
      handleApiError(error)
      throw error
    }
  },

  /**
   * 운동 계획 생성
   */
  async createPlan(planData: CreatePlanRequest): Promise<WorkoutPlan> {
    try {
      console.log('📡 [workoutApi] createPlan 호출', { planData })
      const response = await apiClient.post<ApiResponse<WorkoutPlan>>(
        API_ENDPOINTS.PLANS,
        planData
      )
      const data = response.data?.data || response.data
      console.log('✅ [workoutApi] createPlan 성공', {
        planId: (data as any)?.id,
      })
      if (!data) {
        throw new WorkoutApiError('응답 데이터가 없습니다', 500, 'NO_DATA')
      }
      return data as WorkoutPlan
    } catch (error) {
      console.error('❌ [workoutApi] createPlan 실패', { planData, error })
      handleApiError(error)
      throw error
    }
  },

  /**
   * 운동 계획 수정
   */
  async updatePlan(
    planId: number,
    planData: UpdatePlanRequest
  ): Promise<WorkoutPlan> {
    try {
      console.log('📡 [workoutApi] updatePlan 호출', { planId, planData })
      const response = await apiClient.put<ApiResponse<WorkoutPlan>>(
        API_ENDPOINTS.PLAN(planId),
        planData
      )
      const data = response.data?.data || response.data
      console.log('✅ [workoutApi] updatePlan 성공', { planId })
      if (!data) {
        throw new WorkoutApiError('응답 데이터가 없습니다', 500, 'NO_DATA')
      }
      return data as WorkoutPlan
    } catch (error) {
      console.error('❌ [workoutApi] updatePlan 실패', {
        planId,
        planData,
        error,
      })
      handleApiError(error)
      throw error
    }
  },

  /**
   * 운동 계획 삭제
   */
  async deletePlan(planId: number): Promise<void> {
    try {
      console.log('📡 [workoutApi] deletePlan 호출', { planId })
      await apiClient.delete(API_ENDPOINTS.PLAN(planId))
      console.log('✅ [workoutApi] deletePlan 성공', { planId })
    } catch (error) {
      console.error('❌ [workoutApi] deletePlan 실패', { planId, error })
      handleApiError(error)
      throw error
    }
  },

  /**
   * 계획 운동 추가
   */
  async addPlanExercise(
    planId: number,
    exerciseData: Omit<WorkoutPlanExercise, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<WorkoutPlanExercise> {
    try {
      console.log('📡 [workoutApi] addPlanExercise 호출', {
        planId,
        exerciseData,
      })
      const response = await apiClient.post<ApiResponse<WorkoutPlanExercise>>(
        API_ENDPOINTS.PLAN_EXERCISES(planId),
        exerciseData
      )
      console.log('✅ [workoutApi] addPlanExercise 성공', {
        planId,
        exerciseId: response.data?.data?.id,
      })
      const data = response.data?.data
      if (!data) {
        throw new Error('응답 데이터가 없습니다')
      }
      return data
    } catch (error) {
      console.error('❌ [workoutApi] addPlanExercise 실패', {
        planId,
        exerciseData,
        error,
      })
      handleApiError(error)
      throw error
    }
  },

  /**
   * 계획 운동 수정
   */
  async updatePlanExercise(
    planId: number,
    exerciseId: number,
    exerciseData: Partial<WorkoutPlanExercise>
  ): Promise<WorkoutPlanExercise> {
    try {
      console.log('📡 [workoutApi] updatePlanExercise 호출', {
        planId,
        exerciseId,
        exerciseData,
      })
      const response = await apiClient.put<ApiResponse<WorkoutPlanExercise>>(
        API_ENDPOINTS.PLAN_EXERCISE(planId, exerciseId),
        exerciseData
      )
      console.log('✅ [workoutApi] updatePlanExercise 성공', {
        planId,
        exerciseId,
      })
      const data = response.data?.data
      if (!data) {
        throw new WorkoutApiError('응답 데이터가 없습니다', 500, 'NO_DATA')
      }
      return data
    } catch (error) {
      console.error('❌ [workoutApi] updatePlanExercise 실패', {
        planId,
        exerciseId,
        exerciseData,
        error,
      })
      handleApiError(error)
      throw error
    }
  },

  /**
   * 계획 운동 삭제
   */
  async deletePlanExercise(planId: number, exerciseId: number): Promise<void> {
    try {
      console.log('📡 [workoutApi] deletePlanExercise 호출', {
        planId,
        exerciseId,
      })
      await apiClient.delete(API_ENDPOINTS.PLAN_EXERCISE(planId, exerciseId))
      console.log('✅ [workoutApi] deletePlanExercise 성공', {
        planId,
        exerciseId,
      })
    } catch (error) {
      console.error('❌ [workoutApi] deletePlanExercise 실패', {
        planId,
        exerciseId,
        error,
      })
      handleApiError(error)
      throw error
    }
  },

  // ============================================================================
  // Sessions API
  // ============================================================================

  /**
   * 운동 세션 목록 조회
   */
  async getSessions(params?: PaginationParams): Promise<WorkoutSession[]> {
    try {
      console.log('📡 [workoutApi] getSessions 호출', { params })

      const queryParams = params
        ? {
            ...(params.page && { page: params.page.toString() }),
            ...(params.limit && { limit: params.limit.toString() }),
            ...(params.sortBy && { sortBy: params.sortBy }),
            ...(params.sortOrder && { sortOrder: params.sortOrder }),
          }
        : undefined
      const response = await apiClient.get<ApiResponse<WorkoutSession[]>>(
        API_ENDPOINTS.SESSIONS,
        queryParams
      )
      console.log('✅ [workoutApi] getSessions 성공', {
        count: response.data?.data?.length,
      })
      return response.data?.data || []
    } catch (error) {
      console.error('❌ [workoutApi] getSessions 실패', error)
      handleApiError(error)
      throw error
    }
  },

  /**
   * 운동 세션 상세 조회
   */
  async getSession(sessionId: number): Promise<WorkoutSession> {
    try {
      console.log('📡 [workoutApi] getSession 호출', { sessionId })
      const response = await apiClient.get<ApiResponse<WorkoutSession>>(
        API_ENDPOINTS.SESSION(sessionId)
      )
      console.log('✅ [workoutApi] getSession 성공', { sessionId })
      const data = response.data?.data
      if (!data) {
        throw new WorkoutApiError('응답 데이터가 없습니다', 500, 'NO_DATA')
      }
      return data
    } catch (error) {
      console.error('❌ [workoutApi] getSession 실패', { sessionId, error })
      handleApiError(error)
      throw error
    }
  },

  /**
   * 운동 세션 생성
   */
  async createSession(
    sessionData: CreateSessionRequest
  ): Promise<WorkoutSession> {
    try {
      console.log('📡 [workoutApi] createSession 호출', { sessionData })
      const response = await apiClient.post<ApiResponse<WorkoutSession>>(
        API_ENDPOINTS.SESSIONS,
        sessionData
      )
      console.log('✅ [workoutApi] createSession 성공', {
        sessionId: response.data?.data?.id,
      })
      const data = response.data?.data
      if (!data) {
        throw new WorkoutApiError('응답 데이터가 없습니다', 500, 'NO_DATA')
      }
      return data
    } catch (error) {
      console.error('❌ [workoutApi] createSession 실패', {
        sessionData,
        error,
      })
      handleApiError(error)
      throw error
    }
  },

  /**
   * 운동 세션 수정
   */
  async updateSession(
    sessionId: number,
    sessionData: UpdateSessionRequest
  ): Promise<WorkoutSession> {
    try {
      console.log('📡 [workoutApi] updateSession 호출', {
        sessionId,
        sessionData,
      })
      const response = await apiClient.put<ApiResponse<WorkoutSession>>(
        API_ENDPOINTS.SESSION(sessionId),
        sessionData
      )
      console.log('✅ [workoutApi] updateSession 성공', { sessionId })
      const data = response.data?.data
      if (!data) {
        throw new WorkoutApiError('응답 데이터가 없습니다', 500, 'NO_DATA')
      }
      return data
    } catch (error) {
      console.error('❌ [workoutApi] updateSession 실패', {
        sessionId,
        sessionData,
        error,
      })
      handleApiError(error)
      throw error
    }
  },

  /**
   * 운동 세션 삭제
   */
  async deleteSession(sessionId: number): Promise<void> {
    try {
      console.log('📡 [workoutApi] deleteSession 호출', { sessionId })
      await apiClient.delete(API_ENDPOINTS.SESSION(sessionId))
      console.log('✅ [workoutApi] deleteSession 성공', { sessionId })
    } catch (error) {
      console.error('❌ [workoutApi] deleteSession 실패', { sessionId, error })
      handleApiError(error)
      throw error
    }
  },

  /**
   * 운동 세션 시작
   */
  async startSession(sessionId: number): Promise<WorkoutSession> {
    try {
      console.log('📡 [workoutApi] startSession 호출', { sessionId })
      const response = await apiClient.post<ApiResponse<WorkoutSession>>(
        API_ENDPOINTS.SESSION_START(sessionId)
      )
      console.log('✅ [workoutApi] startSession 성공', { sessionId })
      const data = response.data?.data
      if (!data) {
        throw new WorkoutApiError('응답 데이터가 없습니다', 500, 'NO_DATA')
      }
      return data
    } catch (error) {
      console.error('❌ [workoutApi] startSession 실패', { sessionId, error })
      handleApiError(error)
      throw error
    }
  },

  /**
   * 운동 세션 일시정지
   */
  async pauseSession(sessionId: number): Promise<WorkoutSession> {
    try {
      console.log('📡 [workoutApi] pauseSession 호출', { sessionId })
      const response = await apiClient.post<ApiResponse<WorkoutSession>>(
        API_ENDPOINTS.SESSION_PAUSE(sessionId)
      )
      console.log('✅ [workoutApi] pauseSession 성공', { sessionId })
      const data = response.data?.data
      if (!data) {
        throw new WorkoutApiError('응답 데이터가 없습니다', 500, 'NO_DATA')
      }
      return data
    } catch (error) {
      console.error('❌ [workoutApi] pauseSession 실패', { sessionId, error })
      handleApiError(error)
      throw error
    }
  },

  /**
   * 운동 세션 재개
   */
  async resumeSession(sessionId: number): Promise<WorkoutSession> {
    try {
      console.log('📡 [workoutApi] resumeSession 호출', { sessionId })
      const response = await apiClient.post<ApiResponse<WorkoutSession>>(
        API_ENDPOINTS.SESSION_RESUME(sessionId)
      )
      console.log('✅ [workoutApi] resumeSession 성공', { sessionId })
      const data = response.data?.data
      if (!data) {
        throw new WorkoutApiError('응답 데이터가 없습니다', 500, 'NO_DATA')
      }
      return data
    } catch (error) {
      console.error('❌ [workoutApi] resumeSession 실패', { sessionId, error })
      handleApiError(error)
      throw error
    }
  },

  /**
   * 운동 세션 완료
   */
  async completeSession(sessionId: number): Promise<WorkoutSession> {
    try {
      console.log('📡 [workoutApi] completeSession 호출', { sessionId })
      const response = await apiClient.post<ApiResponse<WorkoutSession>>(
        API_ENDPOINTS.SESSION_COMPLETE(sessionId)
      )
      console.log('✅ [workoutApi] completeSession 성공', { sessionId })
      const data = response.data?.data
      if (!data) {
        throw new WorkoutApiError('응답 데이터가 없습니다', 500, 'NO_DATA')
      }
      return data
    } catch (error) {
      console.error('❌ [workoutApi] completeSession 실패', {
        sessionId,
        error,
      })
      handleApiError(error)
      throw error
    }
  },

  /**
   * 세션 운동 목록 조회
   */
  async getSessionExercises(sessionId: number): Promise<ExerciseSet[]> {
    try {
      console.log('📡 [workoutApi] getSessionExercises 호출', { sessionId })
      const response = await apiClient.get<ApiResponse<ExerciseSet[]>>(
        API_ENDPOINTS.SESSION_EXERCISES(sessionId)
      )
      console.log('✅ [workoutApi] getSessionExercises 성공', { sessionId })
      return response.data?.data || []
    } catch (error) {
      console.error('❌ [workoutApi] getSessionExercises 실패', {
        sessionId,
        error,
      })
      handleApiError(error)
      throw error
    }
  },

  /**
   * 세션 운동 추가
   */
  async addSessionExercise(
    sessionId: number,
    exerciseData: CreateExerciseSetRequest
  ): Promise<ExerciseSet> {
    try {
      console.log('📡 [workoutApi] addSessionExercise 호출', {
        sessionId,
        exerciseData,
      })
      const response = await apiClient.post<ApiResponse<ExerciseSet>>(
        API_ENDPOINTS.SESSION_EXERCISES(sessionId),
        exerciseData
      )
      console.log('✅ [workoutApi] addSessionExercise 성공', { sessionId })
      const data = response.data?.data
      if (!data) {
        throw new WorkoutApiError('응답 데이터가 없습니다', 500, 'NO_DATA')
      }
      return data
    } catch (error) {
      console.error('❌ [workoutApi] addSessionExercise 실패', {
        sessionId,
        exerciseData,
        error,
      })
      handleApiError(error)
      throw error
    }
  },

  /**
   * 세션 운동 수정
   */
  async updateSessionExercise(
    sessionId: number,
    exerciseId: number,
    exerciseData: UpdateExerciseSetRequest
  ): Promise<ExerciseSet> {
    try {
      console.log('📡 [workoutApi] updateSessionExercise 호출', {
        sessionId,
        exerciseId,
        exerciseData,
      })
      const response = await apiClient.put<ApiResponse<ExerciseSet>>(
        API_ENDPOINTS.SESSION_EXERCISE(sessionId, exerciseId),
        exerciseData
      )
      console.log('✅ [workoutApi] updateSessionExercise 성공', {
        sessionId,
        exerciseId,
      })
      const data = response.data?.data
      if (!data) {
        throw new WorkoutApiError('응답 데이터가 없습니다', 500, 'NO_DATA')
      }
      return data
    } catch (error) {
      console.error('❌ [workoutApi] updateSessionExercise 실패', {
        sessionId,
        exerciseId,
        exerciseData,
        error,
      })
      handleApiError(error)
      throw error
    }
  },

  /**
   * 세션 운동 삭제
   */
  async deleteSessionExercise(
    sessionId: number,
    exerciseId: number
  ): Promise<void> {
    try {
      console.log('📡 [workoutApi] deleteSessionExercise 호출', {
        sessionId,
        exerciseId,
      })
      await apiClient.delete(
        API_ENDPOINTS.SESSION_EXERCISE(sessionId, exerciseId)
      )
      console.log('✅ [workoutApi] deleteSessionExercise 성공', {
        sessionId,
        exerciseId,
      })
    } catch (error) {
      console.error('❌ [workoutApi] deleteSessionExercise 실패', {
        sessionId,
        exerciseId,
        error,
      })
      handleApiError(error)
      throw error
    }
  },

  // ============================================================================
  // Goals API
  // ============================================================================

  /**
   * 운동 목표 목록 조회
   */
  async getGoals(params?: PaginationParams): Promise<WorkoutGoal[]> {
    try {
      console.log('📡 [workoutApi] getGoals 호출', { params })
      const queryParams = params
        ? {
            ...(params.page && { page: params.page.toString() }),
            ...(params.limit && { limit: params.limit.toString() }),
          }
        : undefined
      const response = await apiClient.get<ApiResponse<WorkoutGoal[]>>(
        API_ENDPOINTS.GOALS,
        queryParams
      )

      console.log('📡 [workoutApi] getGoals 응답 전체:', response)
      console.log('📡 [workoutApi] getGoals response.data:', response.data)
      console.log(
        '📡 [workoutApi] getGoals response.data?.data:',
        response.data?.data
      )

      // 응답 구조 확인 및 데이터 추출
      let goals: WorkoutGoal[] = []

      if (response.data?.data) {
        goals = response.data.data
      } else if (Array.isArray(response.data)) {
        goals = response.data
      } else if (response.data?.success && Array.isArray(response.data.data)) {
        goals = response.data.data
      }

      console.log('✅ [workoutApi] getGoals 성공', {
        count: goals.length,
        goals: goals.map(g => ({ id: g.id, title: g.title, type: g.type })),
      })
      return goals
    } catch (error) {
      console.error('❌ [workoutApi] getGoals 실패', error)
      handleApiError(error)
      throw error
    }
  },

  /**
   * 운동 목표 상세 조회
   */
  async getGoal(goalId: number): Promise<WorkoutGoal> {
    try {
      console.log('📡 [workoutApi] getGoal 호출', { goalId })
      const response = await apiClient.get<ApiResponse<WorkoutGoal>>(
        API_ENDPOINTS.GOAL(goalId)
      )
      console.log('✅ [workoutApi] getGoal 성공', { goalId })
      const data = response.data?.data
      if (!data) {
        throw new WorkoutApiError('응답 데이터가 없습니다', 500, 'NO_DATA')
      }
      return data
    } catch (error) {
      console.error('❌ [workoutApi] getGoal 실패', { goalId, error })
      handleApiError(error)
      throw error
    }
  },

  /**
   * 운동 목표 생성
   */
  async createGoal(goalData: CreateGoalRequest): Promise<WorkoutGoal> {
    try {
      console.log('📡 [workoutApi] createGoal 호출', { goalData })
      const response = await apiClient.post<ApiResponse<WorkoutGoal>>(
        API_ENDPOINTS.GOALS,
        goalData
      )
      const data = response.data?.data || response.data
      console.log('✅ [workoutApi] createGoal 성공', {
        goalId: (data as any)?.id,
      })
      if (!data) {
        throw new WorkoutApiError('응답 데이터가 없습니다', 500, 'NO_DATA')
      }
      return data as WorkoutGoal
    } catch (error) {
      console.error('❌ [workoutApi] createGoal 실패', { goalData, error })
      handleApiError(error)
      throw error
    }
  },

  /**
   * 운동 목표 수정
   */
  async updateGoal(
    goalId: number,
    goalData: UpdateGoalRequest
  ): Promise<WorkoutGoal> {
    try {
      console.log('📡 [workoutApi] updateGoal 호출', { goalId, goalData })
      const response = await apiClient.put<ApiResponse<WorkoutGoal>>(
        API_ENDPOINTS.GOAL(goalId),
        goalData
      )
      const data = response.data?.data || response.data
      console.log('✅ [workoutApi] updateGoal 성공', { goalId })
      if (!data) {
        throw new WorkoutApiError('응답 데이터가 없습니다', 500, 'NO_DATA')
      }
      return data as WorkoutGoal
    } catch (error) {
      console.error('❌ [workoutApi] updateGoal 실패', {
        goalId,
        goalData,
        error,
      })
      handleApiError(error)
      throw error
    }
  },

  /**
   * 운동 목표 삭제
   */
  async deleteGoal(goalId: number): Promise<void> {
    try {
      console.log('📡 [workoutApi] deleteGoal 호출', { goalId })
      await apiClient.delete(API_ENDPOINTS.GOAL(goalId))
      console.log('✅ [workoutApi] deleteGoal 성공', { goalId })
    } catch (error) {
      console.error('❌ [workoutApi] deleteGoal 실패', { goalId, error })
      handleApiError(error)
      throw error
    }
  },

  // ============================================================================
  // Dashboard API
  // ============================================================================

  /**
   * 대시보드 데이터 조회
   */
  async getDashboardData(): Promise<DashboardData> {
    try {
      console.log('📡 [workoutApi] getDashboardData 호출')
      const response = await apiClient.get<ApiResponse<DashboardData>>(
        API_ENDPOINTS.DASHBOARD
      )

      console.log('📡 [workoutApi] getDashboardData 응답:', response.data)

      // 응답 구조 확인 및 데이터 추출
      let data: DashboardData | null = null

      if (response.data?.data) {
        data = response.data.data
      } else if (response.data && !response.data.data) {
        // data 필드가 없는 경우 전체 응답을 사용
        data = response.data as DashboardData
      }

      console.log('✅ [workoutApi] getDashboardData 성공', { data })

      if (!data) {
        throw new WorkoutApiError('응답 데이터가 없습니다', 500, 'NO_DATA')
      }

      return data
    } catch (error) {
      console.error('❌ [workoutApi] getDashboardData 실패', error)
      handleApiError(error)
      throw error
    }
  },
}

// ============================================================================
// Export
// ============================================================================

export { WorkoutApiError }
export type { WorkoutApiError as WorkoutApiErrorType }
