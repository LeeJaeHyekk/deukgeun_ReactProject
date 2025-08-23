import { useState, useCallback } from "react"
import type { WorkoutSession } from "../../../../shared/types"

interface SessionData {
  sessionId: number
  planId?: number
  startTime: number
  plan?: any
  exercises?: any[]
}

export function useSessionState() {
  const [currentSessionData, setCurrentSessionData] =
    useState<SessionData | null>(null)
  const [currentSession, setCurrentSession] = useState<WorkoutSession>({
    id: 0,
    userId: 0,
    name: "",
    description: "",
    startTime: new Date(),
    endTime: undefined,
    duration: undefined,
    caloriesBurned: undefined,
    notes: "",
    isCompleted: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  })

  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0)
  const [currentSetIndex, setCurrentSetIndex] = useState(0)
  const [restTimer, setRestTimer] = useState(0)
  const [isRestTimerRunning, setIsRestTimerRunning] = useState(false)
  const [completedSets, setCompletedSets] = useState<{ [key: number]: number }>(
    {}
  )

  const initializeSession = useCallback(
    (session?: WorkoutSession, plan?: any) => {
      if (session) {
        setCurrentSession(session)
      } else if (plan) {
        const newSession: WorkoutSession = {
          id: 0,
          userId: 0,
          name: plan.name || "새 운동 세션",
          description: plan.description || "",
          startTime: new Date(),
          endTime: undefined,
          duration: undefined,
          caloriesBurned: undefined,
          notes: "",
          isCompleted: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
        setCurrentSession(newSession)
      } else {
        const emptySession: WorkoutSession = {
          id: 0,
          userId: 0,
          name: "자유 운동",
          description: "",
          startTime: new Date(),
          endTime: undefined,
          duration: undefined,
          caloriesBurned: undefined,
          notes: "",
          isCompleted: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
        setCurrentSession(emptySession)
      }

      setCurrentExerciseIndex(0)
      setCurrentSetIndex(0)
      setRestTimer(0)
      setIsRestTimerRunning(false)
      setCompletedSets({})
    },
    []
  )

  const updateSession = useCallback((updates: Partial<WorkoutSession>) => {
    setCurrentSession(prev => ({ ...prev, ...updates }))
  }, [])

  const completeSet = useCallback((exerciseIndex: number) => {
    setCompletedSets(prev => ({
      ...prev,
      [exerciseIndex]: (prev[exerciseIndex] || 0) + 1,
    }))
  }, [])

  const startRest = useCallback((seconds: number) => {
    setRestTimer(seconds)
    setIsRestTimerRunning(true)
  }, [])

  const stopRest = useCallback(() => {
    setIsRestTimerRunning(false)
    setRestTimer(0)
  }, [])

  return {
    currentSession,
    currentSessionData,
    currentExerciseIndex,
    currentSetIndex,
    restTimer,
    isRestTimerRunning,
    completedSets,
    setCurrentSessionData,
    setCurrentExerciseIndex,
    setCurrentSetIndex,
    initializeSession,
    updateSession,
    completeSet,
    startRest,
    stopRest,
  }
}
