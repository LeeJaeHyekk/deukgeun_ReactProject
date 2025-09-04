// ============================================================================
// 워크아웃 타이머 Context
// ============================================================================

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'

interface WorkoutTimerState {
  isRunning: boolean
  elapsedTime: number
  totalTime: number
  currentSet: number
  totalSets: number
  restTime: number
  isResting: boolean
}

interface WorkoutTimerContextType {
  // 상태
  timerState: WorkoutTimerState
  
  // 타이머 제어
  startTimer: () => void
  pauseTimer: () => void
  stopTimer: () => void
  resetTimer: () => void
  
  // 설정
  setTotalTime: (time: number) => void
  setTotalSets: (sets: number) => void
  setRestTime: (time: number) => void
  
  // 세트 관리
  nextSet: () => void
  previousSet: () => void
  goToSet: (setNumber: number) => void
  
  // 휴식 관리
  startRest: () => void
  skipRest: () => void
}

const WorkoutTimerContext = createContext<WorkoutTimerContextType | undefined>(undefined)

interface WorkoutTimerProviderProps {
  children: React.ReactNode
}

export function WorkoutTimerProvider({ children }: WorkoutTimerProviderProps) {
  const [timerState, setTimerState] = useState<WorkoutTimerState>({
    isRunning: false,
    elapsedTime: 0,
    totalTime: 0,
    currentSet: 1,
    totalSets: 1,
    restTime: 60,
    isResting: false
  })

  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null)

  // 타이머 시작
  const startTimer = useCallback(() => {
    if (!timerState.isRunning) {
      setTimerState(prev => ({ ...prev, isRunning: true }))
      
      const id = setInterval(() => {
        setTimerState(prev => ({
          ...prev,
          elapsedTime: prev.elapsedTime + 1
        }))
      }, 1000)
      
      setIntervalId(id)
    }
  }, [timerState.isRunning])

  // 타이머 일시정지
  const pauseTimer = useCallback(() => {
    if (timerState.isRunning && intervalId) {
      clearInterval(intervalId)
      setIntervalId(null)
      setTimerState(prev => ({ ...prev, isRunning: false }))
    }
  }, [timerState.isRunning, intervalId])

  // 타이머 정지
  const stopTimer = useCallback(() => {
    if (intervalId) {
      clearInterval(intervalId)
      setIntervalId(null)
    }
    
    setTimerState(prev => ({
      ...prev,
      isRunning: false,
      elapsedTime: 0
    }))
  }, [intervalId])

  // 타이머 리셋
  const resetTimer = useCallback(() => {
    if (intervalId) {
      clearInterval(intervalId)
      setIntervalId(null)
    }
    
    setTimerState(prev => ({
      ...prev,
      isRunning: false,
      elapsedTime: 0,
      currentSet: 1,
      isResting: false
    }))
  }, [intervalId])

  // 총 시간 설정
  const setTotalTime = useCallback((time: number) => {
    setTimerState(prev => ({ ...prev, totalTime: time }))
  }, [])

  // 총 세트 수 설정
  const setTotalSets = useCallback((sets: number) => {
    setTimerState(prev => ({ ...prev, totalSets: sets }))
  }, [])

  // 휴식 시간 설정
  const setRestTime = useCallback((time: number) => {
    setTimerState(prev => ({ ...prev, restTime: time }))
  }, [])

  // 다음 세트로
  const nextSet = useCallback(() => {
    setTimerState(prev => {
      if (prev.currentSet < prev.totalSets) {
        return {
          ...prev,
          currentSet: prev.currentSet + 1,
          isResting: true
        }
      }
      return prev
    })
  }, [])

  // 이전 세트로
  const previousSet = useCallback(() => {
    setTimerState(prev => {
      if (prev.currentSet > 1) {
        return {
          ...prev,
          currentSet: prev.currentSet - 1,
          isResting: false
        }
      }
      return prev
    })
  }, [])

  // 특정 세트로 이동
  const goToSet = useCallback((setNumber: number) => {
    if (setNumber >= 1 && setNumber <= timerState.totalSets) {
      setTimerState(prev => ({
        ...prev,
        currentSet: setNumber,
        isResting: false
      }))
    }
  }, [timerState.totalSets])

  // 휴식 시작
  const startRest = useCallback(() => {
    setTimerState(prev => ({ ...prev, isResting: true }))
  }, [])

  // 휴식 건너뛰기
  const skipRest = useCallback(() => {
    setTimerState(prev => ({ ...prev, isResting: false }))
  }, [])

  // 컴포넌트 언마운트 시 인터벌 정리
  useEffect(() => {
    return () => {
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [intervalId])

  const contextValue: WorkoutTimerContextType = {
    timerState,
    startTimer,
    pauseTimer,
    stopTimer,
    resetTimer,
    setTotalTime,
    setTotalSets,
    setRestTime,
    nextSet,
    previousSet,
    goToSet,
    startRest,
    skipRest
  }

  return (
    <WorkoutTimerContext.Provider value={contextValue}>
      {children}
    </WorkoutTimerContext.Provider>
  )
}

export function useWorkoutTimer(): WorkoutTimerContextType {
  const context = useContext(WorkoutTimerContext)
  
  if (context === undefined) {
    throw new Error('useWorkoutTimer must be used within a WorkoutTimerProvider')
  }
  
  return context
}
