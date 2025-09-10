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
  startTimer: () => void
  pauseTimer: () => void
  resetTimer: () => void
  formatTime: (seconds: number) => string
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

  const startTimer = () => {
    if (!isRunning) {
      const now = Date.now()
      setStartTime(now)
      setIsRunning(true)
    }
  }

  const pauseTimer = () => {
    if (isRunning) {
      setIsRunning(false)
      setPausedTime(elapsedTime)
      setStartTime(null)
    }
  }

  const resetTimer = () => {
    setIsRunning(false)
    setElapsedTime(0)
    setStartTime(null)
    setPausedTime(0)
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
    resetTimer,
    formatTime,
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
