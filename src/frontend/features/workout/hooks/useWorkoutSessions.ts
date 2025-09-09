import { useState, useEffect, useCallback } from "react"
import { workoutApi } from "../api/workoutApi"
import type {
  WorkoutSession,
  CreateSessionRequest,
  UpdateSessionRequest,
} from "../types"

export function useWorkoutSessions() {
  console.log("🚀 [useWorkoutSessions] 훅 초기화")

  const [sessions, setSessions] = useState<WorkoutSession[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  console.log("📊 [useWorkoutSessions] 현재 상태:", {
    sessionsCount: sessions.length,
    loading,
    error,
  })

  // 세션 목록 조회
  const fetchSessions = useCallback(async () => {
    const requestId = Math.random().toString(36).substring(2, 15)
    console.log(`🔍 [useWorkoutSessions:${requestId}] fetchSessions 시작`)

    setLoading(true)
    setError(null)
    try {
      console.log(
        `📡 [useWorkoutSessions:${requestId}] workoutApi.getSessions 호출`
      )
      const response = await workoutApi.getSessions()
      const sessionData = response || []

      console.log(`✅ [useWorkoutSessions:${requestId}] 세션 조회 성공:`, {
        count: sessionData.length,
        sessions: sessionData,
      })

      setSessions(sessionData as WorkoutSession[])
      return sessionData
    } catch (err) {
      console.error(`❌ [useWorkoutSessions:${requestId}] 세션 조회 실패:`, err)
      const errorMessage =
        err instanceof Error
          ? err.message
          : "세션 목록을 불러오는데 실패했습니다."
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
      console.log(`🏁 [useWorkoutSessions:${requestId}] fetchSessions 완료`)
    }
  }, [])

  // 특정 세션 조회
  const fetchSession = useCallback(async (sessionId: number) => {
    const requestId = Math.random().toString(36).substring(2, 15)
    console.log(
      `🔍 [useWorkoutSessions:${requestId}] fetchSession 시작 - sessionId: ${sessionId}`
    )

    setLoading(true)
    setError(null)
    try {
      console.log(
        `📡 [useWorkoutSessions:${requestId}] workoutApi.getSession 호출`
      )
      const response = await workoutApi.getSession(sessionId)

      console.log(
        `✅ [useWorkoutSessions:${requestId}] 특정 세션 조회 성공:`,
        response
      )
      return response
    } catch (err) {
      console.error(
        `❌ [useWorkoutSessions:${requestId}] 특정 세션 조회 실패:`,
        err
      )
      const errorMessage =
        err instanceof Error
          ? err.message
          : "세션 정보를 불러오는데 실패했습니다."
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
      console.log(`🏁 [useWorkoutSessions:${requestId}] fetchSession 완료`)
    }
  }, [])

  // 세션 생성
  const createSession = useCallback(
    async (sessionData: CreateSessionRequest) => {
      const requestId = Math.random().toString(36).substring(2, 15)
      console.log(`🔍 [useWorkoutSessions:${requestId}] createSession 시작`, {
        sessionData,
      })

      setLoading(true)
      setError(null)
      try {
        console.log(
          `📡 [useWorkoutSessions:${requestId}] workoutApi.createSession 호출`
        )
        const response = await workoutApi.createSession(sessionData as any)
        const newSession = response

        console.log(
          `✅ [useWorkoutSessions:${requestId}] 세션 생성 성공:`,
          newSession
        )
        setSessions((prev: any) => {
          const updated = [newSession, ...prev]
          console.log(
            `📝 [useWorkoutSessions:${requestId}] 세션 목록 업데이트:`,
            updated
          )
          return updated
        })
        return newSession
      } catch (err) {
        console.error(
          `❌ [useWorkoutSessions:${requestId}] 세션 생성 실패:`,
          err
        )
        const errorMessage =
          err instanceof Error ? err.message : "세션 생성에 실패했습니다."
        setError(errorMessage)
        throw err
      } finally {
        setLoading(false)
        console.log(`🏁 [useWorkoutSessions:${requestId}] createSession 완료`)
      }
    },
    []
  )

  // 세션 수정
  const updateSession = useCallback(
    async (sessionId: number, updateData: UpdateSessionRequest) => {
      const requestId = Math.random().toString(36).substring(2, 15)
      console.log(`🔍 [useWorkoutSessions:${requestId}] updateSession 시작`, {
        sessionId,
        updateData,
      })

      setLoading(true)
      setError(null)
      try {
        console.log(
          `📡 [useWorkoutSessions:${requestId}] workoutApi.updateSession 호출`
        )
        const response = await workoutApi.updateSession(sessionId, updateData)
        const updatedSession = response

        console.log(
          `✅ [useWorkoutSessions:${requestId}] 세션 수정 성공:`,
          updatedSession
        )
        setSessions((prev: any) => {
          const updated = prev.map((session: any) =>
            session.id === sessionId ? updatedSession : session
          )
          console.log(
            `📝 [useWorkoutSessions:${requestId}] 세션 목록 업데이트:`,
            updated
          )
          return updated
        })
        return updatedSession
      } catch (err) {
        console.error(
          `❌ [useWorkoutSessions:${requestId}] 세션 수정 실패:`,
          err
        )
        const errorMessage =
          err instanceof Error ? err.message : "세션 수정에 실패했습니다."
        setError(errorMessage)
        throw err
      } finally {
        setLoading(false)
        console.log(`🏁 [useWorkoutSessions:${requestId}] updateSession 완료`)
      }
    },
    []
  )

  // 세션 삭제
  const deleteSession = useCallback(async (sessionId: number) => {
    const requestId = Math.random().toString(36).substring(2, 15)
    console.log(
      `🔍 [useWorkoutSessions:${requestId}] deleteSession 시작 - sessionId: ${sessionId}`
    )

    setLoading(true)
    setError(null)
    try {
      console.log(
        `📡 [useWorkoutSessions:${requestId}] workoutApi.deleteSession 호출`
      )
      await workoutApi.deleteSession(sessionId)

      console.log(`✅ [useWorkoutSessions:${requestId}] 세션 삭제 성공`)
      setSessions(prev => {
        const updated = prev.filter(session => session.id !== sessionId)
        console.log(
          `📝 [useWorkoutSessions:${requestId}] 세션 목록 업데이트:`,
          updated
        )
        return updated
      })
    } catch (err) {
      console.error(`❌ [useWorkoutSessions:${requestId}] 세션 삭제 실패:`, err)
      const errorMessage =
        err instanceof Error ? err.message : "세션 삭제에 실패했습니다."
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
      console.log(`🏁 [useWorkoutSessions:${requestId}] deleteSession 완료`)
    }
  }, [])

  // 세션 시작
  const startSession = useCallback(async (sessionId: number) => {
    const requestId = Math.random().toString(36).substring(2, 15)
    console.log(
      `🔍 [useWorkoutSessions:${requestId}] startSession 시작 - sessionId: ${sessionId}`
    )

    setLoading(true)
    setError(null)
    try {
      console.log(
        `📡 [useWorkoutSessions:${requestId}] workoutApi.startSession 호출`
      )
      const response = await workoutApi.startSession(sessionId)
      const updatedSession = response

      console.log(
        `✅ [useWorkoutSessions:${requestId}] 세션 시작 성공:`,
        updatedSession
      )
      setSessions(prev => {
        const updated = prev.map(session =>
          session.id === sessionId ? updatedSession : session
        )
        console.log(
          `📝 [useWorkoutSessions:${requestId}] 세션 목록 업데이트:`,
          updated
        )
        return updated
      })
      return updatedSession
    } catch (err) {
      console.error(`❌ [useWorkoutSessions:${requestId}] 세션 시작 실패:`, err)
      const errorMessage =
        err instanceof Error ? err.message : "세션 시작에 실패했습니다."
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
      console.log(`🏁 [useWorkoutSessions:${requestId}] startSession 완료`)
    }
  }, [])

  // 세션 일시정지
  const pauseSession = useCallback(async (sessionId: number) => {
    const requestId = Math.random().toString(36).substring(2, 15)
    console.log(
      `🔍 [useWorkoutSessions:${requestId}] pauseSession 시작 - sessionId: ${sessionId}`
    )

    setLoading(true)
    setError(null)
    try {
      console.log(
        `📡 [useWorkoutSessions:${requestId}] workoutApi.pauseSession 호출`
      )
      const response = await workoutApi.pauseSession(sessionId)
      const updatedSession = response

      console.log(
        `✅ [useWorkoutSessions:${requestId}] 세션 일시정지 성공:`,
        updatedSession
      )
      setSessions(prev => {
        const updated = prev.map(session =>
          session.id === sessionId ? updatedSession : session
        )
        console.log(
          `📝 [useWorkoutSessions:${requestId}] 세션 목록 업데이트:`,
          updated
        )
        return updated
      })
      return updatedSession
    } catch (err) {
      console.error(
        `❌ [useWorkoutSessions:${requestId}] 세션 일시정지 실패:`,
        err
      )
      const errorMessage =
        err instanceof Error ? err.message : "세션 일시정지에 실패했습니다."
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
      console.log(`🏁 [useWorkoutSessions:${requestId}] pauseSession 완료`)
    }
  }, [])

  // 세션 재개
  const resumeSession = useCallback(async (sessionId: number) => {
    const requestId = Math.random().toString(36).substring(2, 15)
    console.log(
      `🔍 [useWorkoutSessions:${requestId}] resumeSession 시작 - sessionId: ${sessionId}`
    )

    setLoading(true)
    setError(null)
    try {
      console.log(
        `📡 [useWorkoutSessions:${requestId}] workoutApi.resumeSession 호출`
      )
      const response = await workoutApi.resumeSession(sessionId)
      const updatedSession = response

      console.log(
        `✅ [useWorkoutSessions:${requestId}] 세션 재개 성공:`,
        updatedSession
      )
      setSessions(prev => {
        const updated = prev.map(session =>
          session.id === sessionId ? updatedSession : session
        )
        console.log(
          `📝 [useWorkoutSessions:${requestId}] 세션 목록 업데이트:`,
          updated
        )
        return updated
      })
      return updatedSession
    } catch (err) {
      console.error(`❌ [useWorkoutSessions:${requestId}] 세션 재개 실패:`, err)
      const errorMessage =
        err instanceof Error ? err.message : "세션 재개에 실패했습니다."
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
      console.log(`🏁 [useWorkoutSessions:${requestId}] resumeSession 완료`)
    }
  }, [])

  // 세션 완료
  const completeSession = useCallback(async (sessionId: number) => {
    const requestId = Math.random().toString(36).substring(2, 15)
    console.log(
      `🔍 [useWorkoutSessions:${requestId}] completeSession 시작 - sessionId: ${sessionId}`
    )

    setLoading(true)
    setError(null)
    try {
      console.log(
        `📡 [useWorkoutSessions:${requestId}] workoutApi.completeSession 호출`
      )
      const response = await workoutApi.completeSession(sessionId)
      const updatedSession = response

      console.log(
        `✅ [useWorkoutSessions:${requestId}] 세션 완료 성공:`,
        updatedSession
      )
      setSessions(prev => {
        const updated = prev.map(session =>
          session.id === sessionId ? updatedSession : session
        )
        console.log(
          `📝 [useWorkoutSessions:${requestId}] 세션 목록 업데이트:`,
          updated
        )
        return updated
      })
      return updatedSession
    } catch (err) {
      console.error(`❌ [useWorkoutSessions:${requestId}] 세션 완료 실패:`, err)
      const errorMessage =
        err instanceof Error ? err.message : "세션 완료에 실패했습니다."
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
      console.log(`🏁 [useWorkoutSessions:${requestId}] completeSession 완료`)
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
    console.log("🔄 [useWorkoutSessions] useEffect 실행 - 초기 세션 로드")
    fetchSessions().catch(err => {
      console.error("❌ [useWorkoutSessions] 초기 세션 로드 실패:", err)
    })
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
