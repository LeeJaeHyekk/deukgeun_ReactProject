import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react'

interface WorkoutTimerContextType {
  isRunning: boolean
  elapsedTime: number
  startTimer: (sessionId?: string) => void
  pauseTimer: () => void
  stopTimer: () => void
  resetTimer: () => void
  formatTime: (seconds: number) => string
  // 추가 속성들
  timerState: {
    isRunning: boolean
    isPaused: boolean
    elapsedTime: number
    totalTime: number
    seconds: number
    totalSeconds: number
    startTime?: Date
    pauseTime?: Date
    sessionId?: number
  }
  sessionState: {
    isActive: boolean
    currentSession?: any
    progress: number
  }
  resumeTimer: () => void
  setCurrentExercise: (exercise: any) => void
  completeSet: (setData: any) => void
  startRestTimer: (duration: number) => void
  stopRestTimer: () => void
  getFormattedTime: (seconds: number) => string
  getSessionProgress: () => number
}

const WorkoutTimerContext = createContext<WorkoutTimerContextType | undefined>(
  undefined
)

interface WorkoutTimerProviderProps {
  children: ReactNode
}

export function WorkoutTimerProvider({ children }: WorkoutTimerProviderProps) {
  const [isRunning, setIsRunning] = useState(false)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [startTime, setStartTime] = useState<number | null>(null)
  const [pausedTime, setPausedTime] = useState(0)
  const [currentSession, setCurrentSession] = useState<any>(null)
  const [currentExercise, setCurrentExercise] = useState<any>(null)
  const [restTimer, setRestTimer] = useState<number | null>(null)

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isRunning && startTime) {
      interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000) + pausedTime)
      }, 1000)
    }

    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [isRunning, startTime, pausedTime])

  const startTimer = (sessionId?: string) => {
    if (!isRunning) {
      const now = Date.now()
      setStartTime(now)
      setIsRunning(true)
      if (sessionId) {
        setCurrentSession({ id: sessionId })
      }
    }
  }

  const pauseTimer = () => {
    if (isRunning) {
      setIsRunning(false)
      setPausedTime(elapsedTime)
      setStartTime(null)
    }
  }

  const stopTimer = () => {
    setIsRunning(false)
    setStartTime(null)
    setPausedTime(0)
  }

  const resetTimer = () => {
    setIsRunning(false)
    setElapsedTime(0)
    setStartTime(null)
    setPausedTime(0)
    setCurrentSession(null)
  }

  const resumeTimer = () => {
    if (!isRunning) {
      const now = Date.now()
      setStartTime(now)
      setIsRunning(true)
    }
  }

  const setCurrentExerciseHandler = (exercise: any) => {
    setCurrentExercise(exercise)
  }

  const completeSet = (setData: any) => {
    // 세트 완료 로직
    console.log('Set completed:', setData)
  }

  const startRestTimer = (duration: number) => {
    setRestTimer(duration)
  }

  const stopRestTimer = () => {
    setRestTimer(null)
  }

  const getFormattedTime = (seconds: number): string => {
    return formatTime(seconds)
  }

  const getSessionProgress = (): number => {
    if (!currentSession) return 0
    // 세션 진행률 계산 로직
    return Math.min(elapsedTime / 3600, 1) * 100 // 예시: 1시간 기준
  }

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const value: WorkoutTimerContextType = {
    isRunning,
    elapsedTime,
    startTimer,
    pauseTimer,
    stopTimer,
    resetTimer,
    formatTime,
    timerState: {
      isRunning,
      isPaused: !isRunning && pausedTime > 0,
      elapsedTime,
      totalTime: 0,
      seconds: elapsedTime,
      totalSeconds: 0,
      startTime: startTime ? new Date(startTime) : undefined,
      pauseTime: undefined,
      sessionId: currentSession?.id,
    },
    sessionState: {
      isActive: !!currentSession,
      currentSession,
      progress: getSessionProgress(),
    },
    resumeTimer,
    setCurrentExercise: setCurrentExerciseHandler,
    completeSet,
    startRestTimer,
    stopRestTimer,
    getFormattedTime,
    getSessionProgress,
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
      'useWorkoutTimer must be used within a WorkoutTimerProvider'
    )
  }
  return context
}
