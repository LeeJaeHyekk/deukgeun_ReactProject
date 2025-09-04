import { useState, useCallback } from "react"
import type { WorkoutSession } from "../../../../types"

interface SessionData {
  sessionId: number
  planId?: number
  startTime: number
  plan?: any
  exercises?: any[]
  notes?: string
  gymId?: number
}

export function useSessionState() {
  const [currentSessionData, setCurrentSessionData] =
    useState<SessionData | null>({
      sessionId: Date.now(),
      startTime: Date.now(),
      exercises: [],
    })
  const [currentSession, setCurrentSession] = useState<WorkoutSession>({
    id: 0,
    userId: 0,
    planId: 0,
    gymId: 1,
    startTime: new Date(),
    endTime: undefined,
    notes: "",
    status: "in_progress",
    exercises: [],
    plan: {} as any,
    gym: {} as any,
    totalDuration: 0,
    isCompleted: false,
    duration: 0,
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
        // 세션 데이터 초기화
        setCurrentSessionData({
          sessionId: session.id || Date.now(),
          startTime: Date.now(),
          exercises: session.exercises || [],
          plan: plan,
        })
      } else if (plan) {
        const newSession: WorkoutSession = {
          id: 0,
          userId: 0,
          planId: plan.id || 0,
          gymId: 1,
          startTime: new Date(),
          notes: "",
          status: "in_progress",
          exercises: [],
          plan: plan,
          gym: {} as any,
          totalDuration: 0,
          isCompleted: false,
          duration: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
        setCurrentSession(newSession)
        // 계획 기반 세션 데이터 초기화
        setCurrentSessionData({
          sessionId: Date.now(),
          planId: plan.id,
          startTime: Date.now(),
          plan: plan,
          exercises: plan.exercises || [],
        })
      } else {
        const emptySession: WorkoutSession = {
          id: 0,
          userId: 0,
          planId: 0,
          gymId: 1,
          startTime: new Date(),
          notes: "",
          status: "in_progress",
          exercises: [],
          plan: {} as any,
          gym: {} as any,
          totalDuration: 0,
          isCompleted: false,
          duration: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
        setCurrentSession(emptySession)
        // 빈 세션 데이터 초기화
        setCurrentSessionData({
          sessionId: Date.now(),
          startTime: Date.now(),
          exercises: [],
        })
      }

      setCurrentExerciseIndex(0)
      setCurrentSetIndex(0)
      setRestTimer(0)
      setIsRestTimerRunning(false)
      setCompletedSets({})
    },
    []
  )

  const updateSessionData = useCallback((updates: Partial<SessionData>) => {
    setCurrentSessionData((prev: SessionData | null) =>
      prev
        ? { ...prev, ...updates }
        : {
            sessionId: Date.now(),
            startTime: Date.now(),
            exerciseSets: [],
            ...updates,
          }
    )
  }, [])

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
    updateSessionData,
    updateSession,
    completeSet,
    startRest,
    stopRest,
  }
}
