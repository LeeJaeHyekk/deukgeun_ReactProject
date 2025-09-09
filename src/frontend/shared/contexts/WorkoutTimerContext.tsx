import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface WorkoutTimerContextType {
  isActive: boolean
  startTime: Date | null
  duration: number
  startTimer: () => void
  stopTimer: () => void
  resetTimer: () => void
  pauseTimer: () => void
  resumeTimer: () => void
  isPaused: boolean
}

export const WorkoutTimerContext = createContext<WorkoutTimerContextType | undefined>(undefined)

interface WorkoutTimerProviderProps {
  children: ReactNode
}

export function WorkoutTimerProvider({ children }: WorkoutTimerProviderProps) {
  const [isActive, setIsActive] = useState(false)
  const [startTime, setStartTime] = useState<Date | null>(null)
  const [duration, setDuration] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [pausedDuration, setPausedDuration] = useState(0)

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isActive && !isPaused) {
      interval = setInterval(() => {
        if (startTime) {
          const now = new Date()
          const elapsed = Math.floor((now.getTime() - startTime.getTime()) / 1000)
          setDuration(elapsed - pausedDuration)
        }
      }, 1000)
    }

    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [isActive, isPaused, startTime, pausedDuration])

  const startTimer = () => {
    setIsActive(true)
    setStartTime(new Date())
    setDuration(0)
    setPausedDuration(0)
    setIsPaused(false)
  }

  const stopTimer = () => {
    setIsActive(false)
    setStartTime(null)
    setIsPaused(false)
    setPausedDuration(0)
  }

  const resetTimer = () => {
    setDuration(0)
    setPausedDuration(0)
    setIsPaused(false)
    if (isActive) {
      setStartTime(new Date())
    }
  }

  const pauseTimer = () => {
    if (isActive && !isPaused) {
      setIsPaused(true)
      setPausedDuration(duration)
    }
  }

  const resumeTimer = () => {
    if (isActive && isPaused) {
      setIsPaused(false)
      setStartTime(new Date())
    }
  }

  const value: WorkoutTimerContextType = {
    isActive,
    startTime,
    duration,
    startTimer,
    stopTimer,
    resetTimer,
    pauseTimer,
    resumeTimer,
    isPaused,
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
    throw new Error('useWorkoutTimer must be used within a WorkoutTimerProvider')
  }
  return context
}
