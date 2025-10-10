import { useState, useCallback } from "react"
import type { WorkoutSession, WorkoutPlan, ExerciseSet } from "@shared/types"
import type { WorkoutPlanDTO, ExerciseSetDTO } from "@shared/types/dto"
import { 
  isWorkoutPlanDTO, 
  isExerciseSetDTO, 
  safeParseWorkoutPlan,
  safeParseWorkoutSessionArray 
} from "@shared/types/guards"

interface SessionData {
  sessionId: number
  planId?: number
  startTime: number
  plan?: WorkoutPlanDTO | null
  exercises?: WorkoutPlanDTO['exercises']
  exerciseSets?: ExerciseSetDTO[]
  notes?: string
}

export function useSessionState() {
  const [currentSessionData, setCurrentSessionData] =
    useState<SessionData | null>({
      sessionId: Date.now(),
      startTime: Date.now(),
      exerciseSets: [],
    })
  const [currentSession, setCurrentSession] = useState<WorkoutSession>({
    id: 0,
    userId: 0,
    name: "",
    description: "",
    startTime: new Date(),
    endTime: undefined,
    duration: undefined,
    notes: "",
    status: "in_progress",
    isCompleted: false,
    exerciseSets: [],
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
    (session?: WorkoutSession, plan?: unknown) => {
      // 타입 가드를 사용하여 안전하게 plan 검증
      const validatedPlan = plan ? safeParseWorkoutPlan(plan) : null
      
      if (session) {
        setCurrentSession(session)
        // 세션 데이터 초기화
        setCurrentSessionData({
          sessionId: session.id || Date.now(),
          startTime: Date.now(),
          exerciseSets: session.exerciseSets || [],
          plan: validatedPlan,
        })
      } else if (validatedPlan) {
        const newSession: WorkoutSession = {
          id: 0,
          userId: 0,
          name: validatedPlan.name || "새 운동 세션",
          description: validatedPlan.description || "",
          startTime: new Date(),
          endTime: undefined,
          duration: undefined,
          notes: "",
          status: "in_progress",
          isCompleted: false,
          exerciseSets: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        }
        setCurrentSession(newSession)
        // 계획 기반 세션 데이터 초기화
        setCurrentSessionData({
          sessionId: Date.now(),
          planId: validatedPlan.id,
          startTime: Date.now(),
          plan: validatedPlan,
          exercises: validatedPlan.exercises || [],
        })
      } else {
        const emptySession: WorkoutSession = {
          id: 0,
          userId: 0,
          name: "자유 운동",
          description: "",
          startTime: new Date(),
          endTime: undefined,
          duration: undefined,
          notes: "",
          status: "in_progress",
          isCompleted: false,
          exerciseSets: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        }
        setCurrentSession(emptySession)
        // 빈 세션 데이터 초기화
        setCurrentSessionData({
          sessionId: Date.now(),
          startTime: Date.now(),
          exerciseSets: [],
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
    setCurrentSession((prev: WorkoutSession) => ({ ...prev, ...updates }))
  }, [])

  const completeSet = useCallback((exerciseIndex: number) => {
    setCompletedSets((prev: Record<number, number>) => ({
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
