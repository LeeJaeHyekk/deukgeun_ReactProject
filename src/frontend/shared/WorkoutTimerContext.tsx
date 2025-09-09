// ============================================================================
// Frontend 워크아웃 타이머 컨텍스트
// ============================================================================

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react"

interface WorkoutTimerState {
  isRunning: boolean
  elapsedTime: number
  startTime: Date | null
  pauseTime: number
}

interface WorkoutTimerContextType {
  timerState: WorkoutTimerState
  startTimer: () => void
  pauseTimer: () => void
  resumeTimer: () => void
  stopTimer: () => void
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
  const [timerState, setTimerState] = useState<WorkoutTimerState>({
    isRunning: false,
    elapsedTime: 0,
    startTime: null,
    pauseTime: 0,
  })

  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null)

  const startTimer = () => {
    if (timerState.isRunning) return

    const now = new Date()
    setTimerState(prev => ({
      ...prev,
      isRunning: true,
      startTime: now,
    }))

    const id = setInterval(() => {
      setTimerState(prev => {
        if (!prev.startTime) return prev

        const elapsed =
          Math.floor((Date.now() - prev.startTime.getTime()) / 1000) +
          prev.pauseTime
        return {
          ...prev,
          elapsedTime: elapsed,
        }
      })
    }, 1000)

    setIntervalId(id)
  }

  const pauseTimer = () => {
    if (!timerState.isRunning) return

    if (intervalId) {
      clearInterval(intervalId)
      setIntervalId(null)
    }

    setTimerState(prev => ({
      ...prev,
      isRunning: false,
      pauseTime: prev.elapsedTime,
    }))
  }

  const resumeTimer = () => {
    if (timerState.isRunning) return

    const now = new Date()
    setTimerState(prev => ({
      ...prev,
      isRunning: true,
      startTime: now,
    }))

    const id = setInterval(() => {
      setTimerState(prev => {
        if (!prev.startTime) return prev

        const elapsed =
          Math.floor((Date.now() - prev.startTime.getTime()) / 1000) +
          prev.pauseTime
        return {
          ...prev,
          elapsedTime: elapsed,
        }
      })
    }, 1000)

    setIntervalId(id)
  }

  const stopTimer = () => {
    if (intervalId) {
      clearInterval(intervalId)
      setIntervalId(null)
    }

    setTimerState(prev => ({
      ...prev,
      isRunning: false,
    }))
  }

  const resetTimer = () => {
    if (intervalId) {
      clearInterval(intervalId)
      setIntervalId(null)
    }

    setTimerState({
      isRunning: false,
      elapsedTime: 0,
      startTime: null,
      pauseTime: 0,
    })
  }

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
    } else {
      return `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
    }
  }

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [intervalId])

  const value: WorkoutTimerContextType = {
    timerState,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    resetTimer,
    formatTime,
  }

  return (
    <WorkoutTimerContext.Provider value={value}>
      {children}
    </WorkoutTimerContext.Provider>
  )
}

export function useWorkoutTimer(): WorkoutTimerContextType {
  const context = useContext(WorkoutTimerContext)
  if (context === undefined) {
    throw new Error(
      "useWorkoutTimer는 WorkoutTimerProvider 내에서 사용되어야 합니다"
    )
  }
  return context
}
