import { useState, useCallback } from "react"
import { useAuthContext } from "../../../shared/contexts/AuthContext"

export interface WorkoutSession {
  session_id: number
  user_id: number
  plan_id?: number
  gym_id?: number
  session_name: string
  start_time: string
  end_time?: string
  total_duration_minutes?: number
  mood_rating?: number
  energy_level?: number
  notes?: string
  status: "in_progress" | "completed" | "paused" | "cancelled"
  created_at: string
  updated_at: string
}

export function useWorkoutSessions() {
  const { user } = useAuthContext()
  const [sessions, setSessions] = useState<WorkoutSession[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getUserSessions = useCallback(async () => {
    if (!user) {
      setError("사용자 정보가 없습니다.")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/workouts/sessions`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.accessToken}`,
        },
      })

      if (!response.ok) {
        throw new Error("운동 세션을 불러오는데 실패했습니다.")
      }

      const data = await response.json()
      setSessions(data)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다."
      )
    } finally {
      setLoading(false)
    }
  }, [user])

  const startWorkoutSession = useCallback(
    async (sessionData: {
      plan_id?: number
      gym_id?: number
      session_name: string
    }) => {
      if (!user) {
        throw new Error("사용자 정보가 없습니다.")
      }

      try {
        const response = await fetch(`/api/workouts/sessions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.accessToken}`,
          },
          body: JSON.stringify({
            ...sessionData,
            user_id: user.id,
            start_time: new Date().toISOString(),
          }),
        })

        if (!response.ok) {
          throw new Error("운동 세션 시작에 실패했습니다.")
        }

        const newSession = await response.json()
        setSessions(prev => [newSession, ...prev])
        return newSession
      } catch (err) {
        throw err instanceof Error
          ? err
          : new Error("알 수 없는 오류가 발생했습니다.")
      }
    },
    [user]
  )

  const completeWorkoutSession = useCallback(
    async (sessionId: number) => {
      if (!user) {
        throw new Error("사용자 정보가 없습니다.")
      }

      try {
        const response = await fetch(
          `/api/workouts/sessions/${sessionId}/complete`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${user.accessToken}`,
            },
          }
        )

        if (!response.ok) {
          throw new Error("운동 세션 완료에 실패했습니다.")
        }

        const updatedSession = await response.json()
        setSessions(prev =>
          prev.map(session =>
            session.session_id === sessionId ? updatedSession : session
          )
        )
        return updatedSession
      } catch (err) {
        throw err instanceof Error
          ? err
          : new Error("알 수 없는 오류가 발생했습니다.")
      }
    },
    [user]
  )

  const updateWorkoutSession = useCallback(
    async (sessionId: number, sessionData: Partial<WorkoutSession>) => {
      if (!user) {
        throw new Error("사용자 정보가 없습니다.")
      }

      try {
        const response = await fetch(`/api/workouts/sessions/${sessionId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.accessToken}`,
          },
          body: JSON.stringify(sessionData),
        })

        if (!response.ok) {
          throw new Error("운동 세션 수정에 실패했습니다.")
        }

        const updatedSession = await response.json()
        setSessions(prev =>
          prev.map(session =>
            session.session_id === sessionId ? updatedSession : session
          )
        )
        return updatedSession
      } catch (err) {
        throw err instanceof Error
          ? err
          : new Error("알 수 없는 오류가 발생했습니다.")
      }
    },
    [user]
  )

  const getCurrentSession = useCallback(() => {
    return sessions.find(session => session.status === "in_progress")
  }, [sessions])

  return {
    sessions,
    loading,
    error,
    getUserSessions,
    startWorkoutSession,
    completeWorkoutSession,
    updateWorkoutSession,
    getCurrentSession,
  }
}
