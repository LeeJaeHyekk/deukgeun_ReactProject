import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  ReactNode,
} from "react"

// 타이머 상태 타입
interface TimerState {
  isRunning: boolean
  isPaused: boolean
  elapsedTime: number
  startTime: number | null
  pauseTime: number | null
  totalPausedTime: number
}

// 운동 세션 상태 타입
interface WorkoutSessionState {
  sessionId: string | null
  planId: number | null
  currentExerciseIndex: number
  currentSetIndex: number
  completedSets: { [exerciseIndex: number]: number }
  restTimer: number
  isRestTimerRunning: boolean
}

// 컨텍스트 타입
interface WorkoutTimerContextType {
  // 타이머 상태
  timerState: TimerState
  sessionState: WorkoutSessionState

  // 타이머 제어
  startTimer: (sessionId: string, planId?: number) => void
  pauseTimer: () => void
  resumeTimer: () => void
  stopTimer: () => void
  resetTimer: () => void

  // 세션 제어
  setCurrentExercise: (exerciseIndex: number) => void
  completeSet: (exerciseIndex: number) => void
  startRestTimer: (seconds: number) => void
  stopRestTimer: () => void

  // 상태 조회
  getFormattedTime: () => string
  getSessionProgress: () => number
  isSessionActive: () => boolean
}

// 컨텍스트 생성
const WorkoutTimerContext = createContext<WorkoutTimerContextType | undefined>(
  undefined
)

// Provider Props
interface WorkoutTimerProviderProps {
  children: ReactNode
}

// Provider 컴포넌트
export function WorkoutTimerProvider({ children }: WorkoutTimerProviderProps) {
  // 타이머 상태
  const [timerState, setTimerState] = useState<TimerState>({
    isRunning: false,
    isPaused: false,
    elapsedTime: 0,
    startTime: null,
    pauseTime: null,
    totalPausedTime: 0,
  })

  // 세션 상태
  const [sessionState, setSessionState] = useState<WorkoutSessionState>({
    sessionId: null,
    planId: null,
    currentExerciseIndex: 0,
    currentSetIndex: 0,
    completedSets: {},
    restTimer: 0,
    isRestTimerRunning: false,
  })

  // 타이머 인터벌 참조
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const restTimerIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // 타이머 시작
  const startTimer = useCallback((sessionId: string, planId?: number) => {
    const now = Date.now()
    setTimerState(prev => ({
      ...prev,
      isRunning: true,
      isPaused: false,
      startTime: now,
      pauseTime: null,
    }))

    setSessionState(prev => ({
      ...prev,
      sessionId,
      planId: planId || null,
    }))

    // 로컬 스토리지에 세션 정보 저장
    localStorage.setItem(
      "activeWorkoutSession",
      JSON.stringify({
        sessionId,
        planId,
        startTime: now,
      })
    )
  }, [])

  // 타이머 일시정지
  const pauseTimer = useCallback(() => {
    const now = Date.now()
    setTimerState(prev => ({
      ...prev,
      isRunning: false,
      isPaused: true,
      pauseTime: now,
      totalPausedTime:
        prev.totalPausedTime +
        (prev.pauseTime ? 0 : now - (prev.startTime || now)),
    }))
  }, [])

  // 타이머 재개
  const resumeTimer = useCallback(() => {
    setTimerState(prev => ({
      ...prev,
      isRunning: true,
      isPaused: false,
      pauseTime: null,
    }))
  }, [])

  // 타이머 정지
  const stopTimer = useCallback(() => {
    setTimerState({
      isRunning: false,
      isPaused: false,
      elapsedTime: 0,
      startTime: null,
      pauseTime: null,
      totalPausedTime: 0,
    })

    setSessionState({
      sessionId: null,
      planId: null,
      currentExerciseIndex: 0,
      currentSetIndex: 0,
      completedSets: {},
      restTimer: 0,
      isRestTimerRunning: false,
    })

    // 로컬 스토리지에서 세션 정보 제거
    localStorage.removeItem("activeWorkoutSession")
  }, [])

  // 타이머 리셋
  const resetTimer = useCallback(() => {
    setTimerState(prev => ({
      ...prev,
      elapsedTime: 0,
      totalPausedTime: 0,
    }))
  }, [])

  // 현재 운동 설정
  const setCurrentExercise = useCallback((exerciseIndex: number) => {
    setSessionState(prev => ({
      ...prev,
      currentExerciseIndex: exerciseIndex,
      currentSetIndex: 0,
    }))
  }, [])

  // 세트 완료
  const completeSet = useCallback((exerciseIndex: number) => {
    setSessionState(prev => ({
      ...prev,
      completedSets: {
        ...prev.completedSets,
        [exerciseIndex]: (prev.completedSets[exerciseIndex] || 0) + 1,
      },
    }))
  }, [])

  // 휴식 타이머 시작
  const startRestTimer = useCallback((seconds: number) => {
    setSessionState(prev => ({
      ...prev,
      restTimer: seconds,
      isRestTimerRunning: true,
    }))
  }, [])

  // 휴식 타이머 정지
  const stopRestTimer = useCallback(() => {
    setSessionState(prev => ({
      ...prev,
      restTimer: 0,
      isRestTimerRunning: false,
    }))
  }, [])

  // 포맷된 시간 반환
  const getFormattedTime = useCallback(() => {
    const totalSeconds = Math.floor(timerState.elapsedTime / 1000)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60

    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
  }, [timerState.elapsedTime])

  // 세션 진행률 반환
  const getSessionProgress = useCallback(() => {
    // 운동 계획이 있는 경우 진행률 계산
    if (sessionState.planId) {
      // TODO: 운동 계획의 총 운동 수를 가져와서 계산
      return (sessionState.currentExerciseIndex / 10) * 100 // 임시 계산
    }
    return 0
  }, [sessionState.planId, sessionState.currentExerciseIndex])

  // 세션 활성 상태 확인
  const isSessionActive = useCallback(() => {
    return timerState.isRunning || timerState.isPaused
  }, [timerState.isRunning, timerState.isPaused])

  // 메인 타이머 로직
  useEffect(() => {
    if (timerState.isRunning) {
      timerIntervalRef.current = setInterval(() => {
        const now = Date.now()
        const startTime = timerState.startTime || now
        const elapsed = now - startTime - timerState.totalPausedTime

        setTimerState(prev => ({
          ...prev,
          elapsedTime: elapsed,
        }))
      }, 1000)
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current)
        timerIntervalRef.current = null
      }
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current)
      }
    }
  }, [timerState.isRunning, timerState.startTime, timerState.totalPausedTime])

  // 휴식 타이머 로직
  useEffect(() => {
    if (sessionState.isRestTimerRunning && sessionState.restTimer > 0) {
      restTimerIntervalRef.current = setInterval(() => {
        setSessionState(prev => {
          if (prev.restTimer <= 1) {
            return {
              ...prev,
              restTimer: 0,
              isRestTimerRunning: false,
            }
          }
          return {
            ...prev,
            restTimer: prev.restTimer - 1,
          }
        })
      }, 1000)
    } else {
      if (restTimerIntervalRef.current) {
        clearInterval(restTimerIntervalRef.current)
        restTimerIntervalRef.current = null
      }
    }

    return () => {
      if (restTimerIntervalRef.current) {
        clearInterval(restTimerIntervalRef.current)
      }
    }
  }, [sessionState.isRestTimerRunning, sessionState.restTimer])

  // 페이지 로드 시 이전 세션 복원
  useEffect(() => {
    const savedSession = localStorage.getItem("activeWorkoutSession")
    if (savedSession) {
      try {
        const sessionData = JSON.parse(savedSession)
        const { sessionId, planId, startTime } = sessionData

        // 세션이 24시간 이내인지 확인
        const sessionAge = Date.now() - startTime
        const maxSessionAge = 24 * 60 * 60 * 1000 // 24시간

        if (sessionAge < maxSessionAge) {
          setTimerState(prev => ({
            ...prev,
            isRunning: false,
            isPaused: true,
            startTime,
            elapsedTime: sessionAge,
          }))

          setSessionState(prev => ({
            ...prev,
            sessionId,
            planId,
          }))
        } else {
          // 오래된 세션 제거
          localStorage.removeItem("activeWorkoutSession")
        }
      } catch (error) {
        console.error("세션 복원 실패:", error)
        localStorage.removeItem("activeWorkoutSession")
      }
    }
  }, [])

  // 컨텍스트 값
  const contextValue: WorkoutTimerContextType = {
    timerState,
    sessionState,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    resetTimer,
    setCurrentExercise,
    completeSet,
    startRestTimer,
    stopRestTimer,
    getFormattedTime,
    getSessionProgress,
    isSessionActive,
  }

  return (
    <WorkoutTimerContext.Provider value={contextValue}>
      {children}
    </WorkoutTimerContext.Provider>
  )
}

// Hook
export function useWorkoutTimer() {
  const context = useContext(WorkoutTimerContext)
  if (context === undefined) {
    throw new Error(
      "useWorkoutTimer must be used within a WorkoutTimerProvider"
    )
  }
  return context
}
