import React, { createContext, useContext, useReducer, ReactNode } from 'react'

// 타입 정의
interface TimerState {
  isRunning: boolean
  elapsedTime: number
  totalTime: number
  isPaused: boolean
  pauseStartTime?: number
  pauseDuration: number
}

type TimerAction =
  | { type: 'START_TIMER' }
  | { type: 'PAUSE_TIMER' }
  | { type: 'RESUME_TIMER' }
  | { type: 'STOP_TIMER' }
  | { type: 'UPDATE_ELAPSED_TIME'; payload: number }
  | { type: 'SET_TOTAL_TIME'; payload: number }
  | { type: 'RESET_TIMER' }

// 초기 상태
const initialState: TimerState = {
  isRunning: false,
  elapsedTime: 0,
  totalTime: 0,
  isPaused: false,
  pauseDuration: 0
}

// 리듀서
function timerReducer(state: TimerState, action: TimerAction): TimerState {
  switch (action.type) {
    case 'START_TIMER':
      return {
        ...state,
        isRunning: true,
        isPaused: false,
        pauseDuration: 0
      }
    
    case 'PAUSE_TIMER':
      return {
        ...state,
        isRunning: false,
        isPaused: true,
        pauseStartTime: Date.now()
      }
    
    case 'RESUME_TIMER':
      return {
        ...state,
        isRunning: true,
        isPaused: false,
        pauseDuration: state.pauseDuration + (state.pauseStartTime ? Date.now() - state.pauseStartTime : 0)
      }
    
    case 'STOP_TIMER':
      return {
        ...state,
        isRunning: false,
        isPaused: false,
        elapsedTime: 0,
        pauseDuration: 0
      }
    
    case 'UPDATE_ELAPSED_TIME':
      return {
        ...state,
        elapsedTime: action.payload
      }
    
    case 'SET_TOTAL_TIME':
      return {
        ...state,
        totalTime: action.payload
      }
    
    case 'RESET_TIMER':
      return {
        ...initialState,
        totalTime: state.totalTime
      }
    
    default:
      return state
  }
}

// 컨텍스트 생성
interface WorkoutTimerContextType {
  state: TimerState
  startTimer: () => void
  pauseTimer: () => void
  resumeTimer: () => void
  stopTimer: () => void
  resetTimer: () => void
  setTotalTime: (time: number) => void
  getFormattedTime: (seconds: number) => string
  getProgressPercentage: () => number
  // 추가된 속성들
  timerState: TimerState
  sessionState: any
  setCurrentExercise: (exercise: any) => void
  completeSet: () => void
  getSessionProgress: () => number
}

const WorkoutTimerContext = createContext<WorkoutTimerContextType | undefined>(undefined)

// 프로바이더 컴포넌트
interface WorkoutTimerProviderProps {
  children: ReactNode
}

export function WorkoutTimerProvider({ children }: WorkoutTimerProviderProps) {
  const [state, dispatch] = useReducer(timerReducer, initialState)

  const startTimer = () => {
    dispatch({ type: 'START_TIMER' })
  }

  const pauseTimer = () => {
    dispatch({ type: 'PAUSE_TIMER' })
  }

  const resumeTimer = () => {
    dispatch({ type: 'RESUME_TIMER' })
  }

  const stopTimer = () => {
    dispatch({ type: 'STOP_TIMER' })
  }

  const resetTimer = () => {
    dispatch({ type: 'RESET_TIMER' })
  }

  const setTotalTime = (time: number) => {
    dispatch({ type: 'SET_TOTAL_TIME', payload: time })
  }

  const getFormattedTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getProgressPercentage = (): number => {
    if (state.totalTime === 0) return 0
    return Math.min((state.elapsedTime / state.totalTime) * 100, 100)
  }

  const value: WorkoutTimerContextType = {
    state,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    resetTimer,
    setTotalTime,
    getFormattedTime,
    getProgressPercentage,
    // 추가된 속성들
    timerState: state,
    sessionState: null,
    setCurrentExercise: () => {},
    completeSet: () => {},
    getSessionProgress: () => 0
  }

  return (
    <WorkoutTimerContext.Provider value={value}>
      {children}
    </WorkoutTimerContext.Provider>
  )
}

// 훅
export function useWorkoutTimer() {
  const context = useContext(WorkoutTimerContext)
  if (context === undefined) {
    throw new Error('useWorkoutTimer must be used within a WorkoutTimerProvider')
  }
  return context
}
