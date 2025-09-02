import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react"

interface TimerState {
  isRunning: boolean
  isPaused: boolean
  elapsedTime: number
  totalTime: number
  seconds: number
  totalSeconds: number
  currentSection: number
  sections: Array<{
    id: number
    name: string
    duration: number
    isCompleted: boolean
  }>
}

interface SessionState {
  currentSession: any
  currentSessionData: any
  currentExerciseIndex: number
  currentSetIndex: number
  restTimer: number
  isRestTimerRunning: boolean
  completedSets: { [key: number]: number }
  updateSessionData: (data: any) => void
  setCurrentExercise: (index: number) => void
  completeSet: (exerciseIndex: number, setIndex: number) => void
  startRest: (seconds: number) => void
  stopRest: () => void
}

interface WorkoutTimerContextType {
  timerState: TimerState
  sessionState: SessionState
  startTimer: (sessionId?: string, planId?: number) => void
  pauseTimer: () => void
  resumeTimer: () => void
  stopTimer: () => void
  resetTimer: () => void
  completeSection: (sectionId: number) => void
  setSections: (
    sections: Array<{ id: number; name: string; duration: number }>
  ) => void
  getFormattedTime: () => string
  getSessionProgress: () => number
  setCurrentExercise: (index: number) => void
  completeSet: (exerciseIndex: number, setIndex: number) => void
  startRestTimer: (seconds: number) => void
  stopRestTimer: () => void
  updateSessionData: (data: any) => void
}

const WorkoutTimerContext = createContext<WorkoutTimerContextType | undefined>(
  undefined
)

export function WorkoutTimerProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [timerState, setTimerState] = useState<TimerState>({
    isRunning: false,
    isPaused: false,
    elapsedTime: 0,
    totalTime: 0,
    seconds: 0,
    totalSeconds: 0,
    currentSection: 0,
    sections: [],
  })

  const [sessionState, setSessionState] = useState<SessionState>({
    currentSession: null,
    currentSessionData: null,
    currentExerciseIndex: 0,
    currentSetIndex: 0,
    restTimer: 0,
    isRestTimerRunning: false,
    completedSets: {},
    updateSessionData: () => {},
    setCurrentExercise: () => {},
    completeSet: () => {},
    startRest: () => {},
    stopRest: () => {},
  })

  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null)

  const startTimer = useCallback(
    (sessionId?: string, planId?: number) => {
      if (timerState.isRunning) return

      setTimerState(prev => ({ ...prev, isRunning: true, isPaused: false }))

      const id = setInterval(() => {
        setTimerState(prev => ({
          ...prev,
          elapsedTime: prev.elapsedTime + 1,
          seconds: prev.elapsedTime + 1,
        }))
      }, 1000)

      setIntervalId(id)
    },
    [timerState.isRunning]
  )

  const pauseTimer = useCallback(() => {
    if (!timerState.isRunning) return

    setTimerState(prev => ({ ...prev, isRunning: false, isPaused: true }))

    if (intervalId) {
      clearInterval(intervalId)
      setIntervalId(null)
    }
  }, [timerState.isRunning, intervalId])

  const resumeTimer = useCallback(() => {
    if (timerState.isRunning) return

    setTimerState(prev => ({ ...prev, isRunning: true, isPaused: false }))

    const id = setInterval(() => {
      setTimerState(prev => ({
        ...prev,
        elapsedTime: prev.elapsedTime + 1,
        seconds: prev.elapsedTime + 1,
      }))
    }, 1000)

    setIntervalId(id)
  }, [timerState.isRunning])

  const stopTimer = useCallback(() => {
    if (intervalId) {
      clearInterval(intervalId)
      setIntervalId(null)
    }

    setTimerState(prev => ({
      ...prev,
      isRunning: false,
      isPaused: false,
      elapsedTime: 0,
    }))
  }, [intervalId])

  const setCurrentExercise = useCallback((index: number) => {
    setSessionState(prev => ({ ...prev, currentExerciseIndex: index }))
  }, [])

  const completeSet = useCallback((exerciseIndex: number, setIndex: number) => {
    setSessionState(prev => ({
      ...prev,
      completedSets: { ...prev.completedSets, [exerciseIndex]: setIndex },
    }))
  }, [])

  const startRestTimer = useCallback((seconds: number) => {
    setSessionState(prev => ({
      ...prev,
      restTimer: seconds,
      isRestTimerRunning: true,
    }))
  }, [])

  const stopRestTimer = useCallback(() => {
    setSessionState(prev => ({
      ...prev,
      isRestTimerRunning: false,
      restTimer: 0,
    }))
  }, [])

  const updateSessionData = useCallback((data: any) => {
    setSessionState(prev => ({ ...prev, currentSessionData: data }))
  }, [])

  const resetTimer = useCallback(() => {
    if (intervalId) {
      clearInterval(intervalId)
      setIntervalId(null)
    }

    setTimerState({
      isRunning: false,
      isPaused: false,
      elapsedTime: 0,
      totalTime: 0,
      seconds: 0,
      totalSeconds: 0,
      currentSection: 0,
      sections: [],
    })
  }, [intervalId])

  const completeSection = useCallback((sectionId: number) => {
    setTimerState(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.id === sectionId ? { ...section, isCompleted: true } : section
      ),
      currentSection: prev.currentSection + 1,
    }))
  }, [])

  const setSections = useCallback(
    (sections: Array<{ id: number; name: string; duration: number }>) => {
      const totalTime = sections.reduce(
        (sum, section) => sum + section.duration,
        0
      )

      setTimerState(prev => ({
        ...prev,
        sections: sections.map(section => ({
          ...section,
          isCompleted: false,
        })),
        totalTime,
      }))
    },
    []
  )

  const getFormattedTime = useCallback(() => {
    const { elapsedTime } = timerState
    const hours = Math.floor(elapsedTime / 3600)
    const minutes = Math.floor((elapsedTime % 3600) / 60)
    const seconds = elapsedTime % 60

    if (hours > 0) {
      return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
    }
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
  }, [timerState.elapsedTime])

  const getSessionProgress = useCallback(() => {
    const { elapsedTime, totalTime } = timerState
    if (totalTime === 0) return 0
    return Math.min((elapsedTime / totalTime) * 100, 100)
  }, [timerState.elapsedTime, timerState.totalTime])

  useEffect(() => {
    return () => {
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [intervalId])

  const value: WorkoutTimerContextType = {
    timerState,
    sessionState,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    resetTimer,
    completeSection,
    setSections,
    getFormattedTime,
    getSessionProgress,
    setCurrentExercise,
    completeSet,
    startRestTimer,
    stopRestTimer,
    updateSessionData,
  }

  return (
    <WorkoutTimerContext.Provider value={value}>
      {children}
    </WorkoutTimerContext.Provider>
  )
}

export function useWorkoutTimer() {
  const context = useContext(WorkoutTimerContext)
  if (context === undefined) {
    throw new Error(
      "useWorkoutTimer must be used within a WorkoutTimerProvider"
    )
  }
  return context
}
