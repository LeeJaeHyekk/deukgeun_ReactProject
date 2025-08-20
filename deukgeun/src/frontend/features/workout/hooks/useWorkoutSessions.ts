import { useState, useEffect, useCallback } from "react"
import {
  WorkoutJournalApi,
  WorkoutSession,
} from "../../../shared/api/workoutJournalApi"

export function useWorkoutSessions() {
  const [sessions, setSessions] = useState<WorkoutSession[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getUserSessions = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await WorkoutJournalApi.getWorkoutSessions()
      setSessions(data)
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "운동 세션을 불러오는데 실패했습니다."
      console.error("운동 세션 조회 실패:", err)
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  const createSession = useCallback(
    async (sessionData: Partial<WorkoutSession>) => {
      try {
        setLoading(true)
        setError(null)
        // userId는 백엔드에서 인증된 사용자 정보로 설정하므로 제거
        const { userId, ...createData } = sessionData
        const newSession = await WorkoutJournalApi.createWorkoutSession(
          createData as any
        )
        setSessions(prev => [newSession, ...prev])
        return newSession
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "운동 세션 생성에 실패했습니다."
        console.error("운동 세션 생성 실패:", err)
        setError(errorMessage)
        throw err
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const updateSession = useCallback(
    async (sessionId: number, updateData: Partial<WorkoutSession>) => {
      try {
        setLoading(true)
        setError(null)
        // sessionId가 필수이므로 추가
        const updateDataWithId = {
          ...updateData,
          sessionId,
        } as any
        const updatedSession = await WorkoutJournalApi.updateWorkoutSession(
          sessionId,
          updateDataWithId
        )
        setSessions(prev =>
          prev.map(session =>
            session.id === sessionId ? updatedSession : session
          )
        )
        return updatedSession
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "운동 세션 업데이트에 실패했습니다."
        console.error("운동 세션 업데이트 실패:", err)
        setError(errorMessage)
        throw err
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const deleteSession = useCallback(async (sessionId: number) => {
    try {
      setLoading(true)
      setError(null)
      await WorkoutJournalApi.deleteWorkoutSession(sessionId)
      setSessions(prev => prev.filter(session => session.id !== sessionId))
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "운동 세션 삭제에 실패했습니다."
      console.error("운동 세션 삭제 실패:", err)
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // 현재 활성화된 세션 찾기 (완료되지 않은 세션 중 가장 최근 것)
  const activeSession = sessions.find(session => !session.isCompleted)

  useEffect(() => {
    getUserSessions()
  }, [getUserSessions])

  return {
    sessions,
    loading,
    error,
    activeSession,
    getUserSessions,
    createSession,
    updateSession,
    deleteSession,
    clearError,
  }
}
