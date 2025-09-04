import { handleApiError, getSuccessMessage } from "../utils/workoutUtils"
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "../constants"
import type { ApiResponse } from "../types"

interface SessionData {
  sessionId: number
  planId?: number
  startTime: number
  plan?: any
  exercises?: any[]
}

// 로깅 유틸리티
const logger = {
  info: (message: string, data?: any) => {
    console.log(`[WorkoutSessionService] ${message}`, data || "")
  },
  debug: (message: string, data?: any) => {
    console.debug(`[WorkoutSessionService] ${message}`, data || "")
  },
  warn: (message: string, data?: any) => {
    console.warn(`[WorkoutSessionService] ${message}`, data || "")
  },
  error: (message: string, data?: any) => {
    console.error(`[WorkoutSessionService] ${message}`, data || "")
  },
}

class WorkoutSessionService {
  private static instance: WorkoutSessionService
  private isInitialized = false
  private currentSession: SessionData | null = null
  private sessionNotes: string = ""

  private constructor() {
    logger.debug("WorkoutSessionService constructor called")
  }

  static getInstance(): WorkoutSessionService {
    if (!WorkoutSessionService.instance) {
      logger.debug("Creating new WorkoutSessionService instance")
      WorkoutSessionService.instance = new WorkoutSessionService()
    } else {
      logger.debug("Returning existing WorkoutSessionService instance")
    }
    return WorkoutSessionService.instance
  }

  // 초기화
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      logger.debug("Service already initialized")
      return
    }

    try {
      // 서비스 초기화 로직
      this.isInitialized = true
      logger.info("WorkoutSessionService initialized successfully")
    } catch (error) {
      logger.error("Failed to initialize WorkoutSessionService", { error })
      console.error("Failed to initialize WorkoutSessionService:", error)
      throw new Error(ERROR_MESSAGES.UNKNOWN_ERROR)
    }
  }

  // 세션 생성
  async createSession(sessionData: any): Promise<ApiResponse<any>> {
    logger.info("Creating session", { sessionData })
    try {
      await this.initialize()

      // API 호출 로직
      const response = await fetch("/api/workout/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(sessionData),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      logger.info("Session created successfully", { data })

      return {
        success: true,
        data,
        message: getSuccessMessage("created", "session"),
        statusCode: 201,
      }
    } catch (error) {
      logger.error("Session creation failed", { error, sessionData })
      const errorMessage = handleApiError(error)
      return {
        success: false,
        message: errorMessage,
        data: null,
        error: errorMessage,
        statusCode: 400,
      }
    }
  }

  // 세션 업데이트
  async updateSession(
    sessionId: number,
    sessionData: any
  ): Promise<ApiResponse<any>> {
    logger.info("Updating session", { sessionId, sessionData })
    try {
      await this.initialize()

      const response = await fetch(`/api/workout/sessions/${sessionId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(sessionData),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      logger.info("Session updated successfully", { sessionId, data })

      return {
        success: true,
        data,
        message: getSuccessMessage("updated", "session"),
        statusCode: 200,
      }
    } catch (error) {
      const errorMessage = handleApiError(error)
      return {
        success: false,
        data: null,
        error: errorMessage,
        message: errorMessage,
        statusCode: 400,
      }
    }
  }

  // 세션 삭제
  async deleteSession(sessionId: number): Promise<ApiResponse<boolean>> {
    logger.info("Deleting session", { sessionId })
    try {
      await this.initialize()

      const response = await fetch(`/api/workout/sessions/${sessionId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      logger.info("Session deleted successfully", { sessionId })
      return {
        success: true,
        data: true,
        message: getSuccessMessage("deleted", "session"),
        statusCode: 200,
      }
    } catch (error) {
      logger.error("Session deletion failed", { sessionId, error })
      const errorMessage = handleApiError(error)
      return {
        success: false,
        data: false,
        error: errorMessage,
        message: errorMessage,
        statusCode: 400,
      }
    }
  }

  // 세션 조회
  async getSession(sessionId: number): Promise<ApiResponse<any>> {
    logger.info("Getting session", { sessionId })
    try {
      await this.initialize()

      const response = await fetch(`/api/workout/sessions/${sessionId}`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      logger.info("Session retrieved successfully", { sessionId, data })

      return {
        success: true,
        data,
        message: "Session retrieved successfully",
        statusCode: 200,
      }
    } catch (error) {
      logger.error("Session retrieval failed", { sessionId, error })
      const errorMessage = handleApiError(error)
      return {
        success: false,
        data: null,
        error: errorMessage,
        message: errorMessage,
        statusCode: 400,
      }
    }
  }

  // 사용자 세션 목록 조회
  async getUserSessions(): Promise<ApiResponse<any[]>> {
    logger.info("Getting user sessions")
    try {
      await this.initialize()

      const response = await fetch("/api/workout/sessions")

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      logger.info("User sessions retrieved successfully", {
        sessionsCount: data.length,
      })

      return {
        success: true,
        data,
        message: "User sessions retrieved successfully",
        statusCode: 200,
      }
    } catch (error) {
      logger.error("User sessions retrieval failed", { error })
      const errorMessage = handleApiError(error)
      return {
        success: false,
        data: [],
        error: errorMessage,
        message: errorMessage,
        statusCode: 400,
      }
    }
  }

  // 세션 상태 업데이트
  async updateSessionStatus(
    sessionId: number,
    status: string
  ): Promise<ApiResponse<any>> {
    logger.info("Updating session status", { sessionId, status })
    try {
      await this.initialize()

      const response = await fetch(
        `/api/workout/sessions/${sessionId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      logger.info("Session status updated successfully", {
        sessionId,
        status,
        data,
      })

      return {
        success: true,
        data,
        message: "세션 상태가 업데이트되었습니다",
        statusCode: 200,
      }
    } catch (error) {
      logger.error("Session status update failed", { sessionId, status, error })
      const errorMessage = handleApiError(error)
      return {
        success: false,
        data: null,
        error: errorMessage,
        message: errorMessage,
        statusCode: 400,
      }
    }
  }

  // 세션 완료 (API 호출)
  async completeSessionApi(sessionId: number): Promise<ApiResponse<any>> {
    logger.info("Completing session via API", { sessionId })
    try {
      await this.initialize()

      const response = await fetch(
        `/api/workout/sessions/${sessionId}/complete`,
        {
          method: "POST",
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      logger.info("Session completed via API successfully", { sessionId, data })

      return {
        success: true,
        data,
        message: "세션이 완료되었습니다",
        statusCode: 200,
      }
    } catch (error) {
      logger.error("Session completion via API failed", { sessionId, error })
      const errorMessage = handleApiError(error)
      return {
        success: false,
        data: null,
        error: errorMessage,
        message: errorMessage,
        statusCode: 400,
      }
    }
  }

  // 오프라인 저장
  async saveOffline(sessionData: any): Promise<void> {
    logger.info("Saving session offline", { sessionData })
    try {
      const offlineData = JSON.parse(
        localStorage.getItem("offline_sessions") || "[]"
      )
      offlineData.push({
        ...sessionData,
        id: Date.now(),
        isOffline: true,
        createdAt: new Date().toISOString(),
      })
      localStorage.setItem("offline_sessions", JSON.stringify(offlineData))
      logger.info("Session saved offline successfully")
    } catch (error) {
      logger.error("Failed to save offline data", { error })
      console.error("Failed to save offline data:", error)
    }
  }

  // 오프라인 데이터 동기화
  async syncOfflineData(): Promise<void> {
    logger.info("Syncing offline data")
    try {
      const offlineData = JSON.parse(
        localStorage.getItem("offline_sessions") || "[]"
      )
      logger.info("Found offline data", { count: offlineData.length })

      for (const session of offlineData) {
        try {
          await this.createSession(session)
          // 성공적으로 동기화된 데이터 제거
          const updatedOfflineData = offlineData.filter(
            (s: any) => s.id !== session.id
          )
          localStorage.setItem(
            "offline_sessions",
            JSON.stringify(updatedOfflineData)
          )
          logger.info("Offline session synced successfully", {
            sessionId: session.id,
          })
        } catch (error) {
          logger.error("Failed to sync offline session", {
            sessionId: session.id,
            error,
          })
          console.error("Failed to sync offline session:", error)
        }
      }
      logger.info("Offline data sync completed")
    } catch (error) {
      logger.error("Failed to sync offline data", { error })
      console.error("Failed to sync offline data:", error)
    }
  }

  // 현재 세션 가져오기
  getCurrentSession(): SessionData | null {
    logger.debug("Getting current session", {
      currentSession: this.currentSession,
    })
    return this.currentSession
  }

  // 세션 일시정지
  pauseSession(): void {
    logger.info("Session paused")
    console.log("Session paused")
  }

  // 세션 재개
  resumeSession(): void {
    logger.info("Session resumed")
    console.log("Session resumed")
  }

  // 계획으로 세션 시작
  startSessionWithPlan(plan: any): SessionData {
    logger.info("Starting session with plan", {
      planId: plan.id,
      planName: plan.name,
    })
    const sessionData: SessionData = {
      sessionId: Date.now(),
      planId: plan.id,
      startTime: Date.now(),
      plan: plan,
      exercises: plan.exercises || [],
    }
    this.currentSession = sessionData
    logger.info("Session started with plan successfully", { sessionData })
    console.log("Session started with plan:", plan.name)
    return sessionData
  }

  // 자유 운동 세션 시작
  startFreeSession(): SessionData {
    logger.info("Starting free session")
    const sessionData: SessionData = {
      sessionId: Date.now(),
      startTime: Date.now(),
      exercises: [],
    }
    this.currentSession = sessionData
    logger.info("Free session started successfully", { sessionData })
    console.log("Free session started")
    return sessionData
  }

  // 세션 취소
  cancelSession(): void {
    logger.info("Cancelling session", { currentSession: this.currentSession })
    this.currentSession = null
    console.log("Session cancelled")
  }

  // 메모 업데이트
  updateNotes(notes: string): void {
    logger.info("Updating session notes", { notes })
    this.sessionNotes = notes
    console.log("Session notes updated")
  }

  // 세션 완료 (매개변수 없이)
  completeSession(): any {
    logger.info("Completing session", { currentSession: this.currentSession })
    const completedSession = this.currentSession
    this.currentSession = null
    logger.info("Session completed successfully", { completedSession })
    console.log("Session completed")
    return completedSession
  }
}

export default WorkoutSessionService
