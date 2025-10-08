import { useCallback } from "react"
import { useWorkoutSessions } from "../../../../hooks/useWorkoutSessions"

export function useSessionsActions(onDeleteSession: () => void) {
  const { deleteSession } = useWorkoutSessions()

  const handleDeleteSession = useCallback(
    async (sessionId: number) => {
      try {
        await deleteSession(sessionId)
        onDeleteSession()
      } catch (error) {
        console.error("세션 삭제 실패:", error)
      }
    },
    [deleteSession, onDeleteSession]
  )

  return {
    handleDeleteSession,
  }
}
