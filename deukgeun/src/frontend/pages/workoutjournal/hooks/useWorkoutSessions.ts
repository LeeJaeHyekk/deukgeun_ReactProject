import { useState, useEffect } from "react"
import {
  WorkoutJournalApi,
  WorkoutSession,
} from "../../../shared/api/workoutJournalApi"

export function useWorkoutSessions() {
  const [sessions, setSessions] = useState<WorkoutSession[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getUserSessions = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await WorkoutJournalApi.getWorkoutSessions()
      setSessions(data)
    } catch (err) {
      console.error("운동 세션 조회 실패:", err)
      setError("운동 세션을 불러오는데 실패했습니다.")
    } finally {
      setLoading(false)
    }
  }

  const createWorkoutSession = async (sessionData: Partial<WorkoutSession>) => {
    try {
      setLoading(true)
      setError(null)
      const newSession =
        await WorkoutJournalApi.createWorkoutSession(sessionData)
      setSessions(prev => [newSession, ...prev])
      return newSession
    } catch (err) {
      console.error("운동 세션 생성 실패:", err)
      setError("운동 세션 생성에 실패했습니다.")
      throw err
    } finally {
      setLoading(false)
    }
  }

  const updateWorkoutSession = async (
    sessionId: number,
    updateData: Partial<WorkoutSession>
  ) => {
    try {
      setLoading(true)
      setError(null)
      const updatedSession = await WorkoutJournalApi.updateWorkoutSession(
        sessionId,
        updateData
      )
      setSessions(prev =>
        prev.map(session =>
          session.session_id === sessionId ? updatedSession : session
        )
      )
      return updatedSession
    } catch (err) {
      console.error("운동 세션 업데이트 실패:", err)
      setError("운동 세션 업데이트에 실패했습니다.")
      throw err
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getUserSessions()
  }, [])

  return {
    sessions,
    loading,
    error,
    getUserSessions,
    createWorkoutSession,
    updateWorkoutSession,
  }
}
