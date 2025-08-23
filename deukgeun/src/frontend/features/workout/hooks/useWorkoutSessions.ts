import { useState, useEffect, useCallback } from "react"
import { workoutApi } from "../api/workoutApi"
import type {
  WorkoutSession,
  CreateSessionRequest,
  UpdateSessionRequest,
} from "../types"

export function useWorkoutSessions() {
  const [sessions, setSessions] = useState<WorkoutSession[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 세션 목록 조회
  const fetchSessions = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await workoutApi.getSessions()
      const sessionData = response || []
      setSessions(sessionData)
      return sessionData
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "세션 목록을 불러오는데 실패했습니다."
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // 특정 세션 조회
  const fetchSession = useCallback(async (sessionId: number) => {
    setLoading(true)
    setError(null)
    try {
      const response = await workoutApi.getSession(sessionId)
      return response
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "세션 정보를 불러오는데 실패했습니다."
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // 세션 생성
  const createSession = useCallback(
    async (sessionData: CreateSessionRequest) => {
      setLoading(true)
      setError(null)
      try {
        const response = await workoutApi.createSession(sessionData)
        const newSession = response
        setSessions(prev => [newSession, ...prev])
        return newSession
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "세션 생성에 실패했습니다."
        setError(errorMessage)
        throw err
      } finally {
        setLoading(false)
      }
    },
    []
  )

  // 세션 수정
  const updateSession = useCallback(
    async (sessionId: number, updateData: UpdateSessionRequest) => {
      setLoading(true)
      setError(null)
      try {
        const response = await workoutApi.updateSession(sessionId, updateData)
        const updatedSession = response
        setSessions(prev =>
          prev.map(session =>
            session.id === sessionId ? updatedSession : session
          )
        )
        return updatedSession
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "세션 수정에 실패했습니다."
        setError(errorMessage)
        throw err
      } finally {
        setLoading(false)
      }
    },
    []
  )

  // 세션 삭제
  const deleteSession = useCallback(async (sessionId: number) => {
    setLoading(true)
    setError(null)
    try {
      await workoutApi.deleteSession(sessionId)
      setSessions(prev => prev.filter(session => session.id !== sessionId))
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "세션 삭제에 실패했습니다."
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // 세션 시작
  const startSession = useCallback(async (sessionId: number) => {
    setLoading(true)
    setError(null)
    try {
      const response = await workoutApi.startSession(sessionId)
      const updatedSession = response
      setSessions(prev =>
        prev.map(session =>
          session.id === sessionId ? updatedSession : session
        )
      )
      return updatedSession
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "세션 시작에 실패했습니다."
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // 세션 일시정지
  const pauseSession = useCallback(async (sessionId: number) => {
    setLoading(true)
    setError(null)
    try {
      const response = await workoutApi.pauseSession(sessionId)
      const updatedSession = response
      setSessions(prev =>
        prev.map(session =>
          session.id === sessionId ? updatedSession : session
        )
      )
      return updatedSession
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "세션 일시정지에 실패했습니다."
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // 세션 재개
  const resumeSession = useCallback(async (sessionId: number) => {
    setLoading(true)
    setError(null)
    try {
      const response = await workoutApi.resumeSession(sessionId)
      const updatedSession = response
      setSessions(prev =>
        prev.map(session =>
          session.id === sessionId ? updatedSession : session
        )
      )
      return updatedSession
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "세션 재개에 실패했습니다."
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // 세션 완료
  const completeSession = useCallback(async (sessionId: number) => {
    setLoading(true)
    setError(null)
    try {
      const response = await workoutApi.completeSession(sessionId)
      const updatedSession = response
      setSessions(prev =>
        prev.map(session =>
          session.id === sessionId ? updatedSession : session
        )
      )
      return updatedSession
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "세션 완료에 실패했습니다."
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // 사용자 세션 조회 (getUserSessions 별칭)
  const getUserSessions = useCallback(async () => {
    return fetchSessions()
  }, [fetchSessions])

  // 에러 초기화
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // 초기 로드
  useEffect(() => {
    fetchSessions()
  }, [fetchSessions])

  return {
    sessions,
    loading,
    error,
    fetchSessions,
    fetchSession,
    createSession,
    updateSession,
    deleteSession,
    startSession,
    pauseSession,
    resumeSession,
    completeSession,
    getUserSessions,
    clearError,
  }
}
