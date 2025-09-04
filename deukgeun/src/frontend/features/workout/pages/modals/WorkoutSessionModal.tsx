import React, { useState, useEffect } from "react"
import {
  X,
  Play,
  Pause,
  Square,
  Save,
  Clock,
  Target,
  Check,
  Timer,
} from "lucide-react"
import type { WorkoutSession, ExerciseSet, Machine } from "../../types"
import { useWorkoutTimer } from "../../../../contexts/WorkoutTimerContext"
import WorkoutSessionService from "../../services/WorkoutSessionService"
import "./WorkoutSessionModal.css"

interface SessionData {
  sessionId: number
  planId?: number
  startTime: number
  plan?: any
  exercises?: any[]
}

interface WorkoutExercise {
  exerciseId: number
  machineId: number
  machineName: string
  targetSets: number
  targetReps: number
  weight?: number
  restSeconds: number
  completedSets: ExerciseSet[]
  isCompleted: boolean
}

interface WorkoutSessionModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (session: WorkoutSession) => Promise<void> | void
  session?: WorkoutSession | null
  plan?: any | null
  machines: Machine[]
}

// 로깅 유틸리티
const logger = {
  info: (message: string, data?: any) => {
    console.log(`[WorkoutSessionModal] ${message}`, data || "")
  },
  debug: (message: string, data?: any) => {
    console.debug(`[WorkoutSessionModal] ${message}`, data || "")
  },
  warn: (message: string, data?: any) => {
    console.warn(`[WorkoutSessionModal] ${message}`, data || "")
  },
  error: (message: string, data?: any) => {
    console.error(`[WorkoutSessionModal] ${message}`, data || "")
  },
  performance: (operation: string, startTime: number) => {
    const duration = performance.now() - startTime
    console.log(
      `[WorkoutSessionModal] ${operation} took ${duration.toFixed(2)}ms`
    )
  },
}

// ------------------- TimerDisplay Component -------------------
interface TimerDisplayProps {
  seconds: number
  label: string
  isRunning: boolean
  onToggle: () => void
  variant?: "session" | "rest"
  progress?: number // 0-100
}

const TimerDisplay: React.FC<TimerDisplayProps> = ({
  seconds,
  label,
  isRunning,
  onToggle,
  variant = "session",
  progress = 0,
}) => {
  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600)
    const m = Math.floor((s % 3600) / 60)
    const sec = s % 60
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${sec
      .toString()
      .padStart(2, "0")}`
  }

  const isRest = variant === "rest"
  const timerClass = `timer-display ${isRest ? "rest-timer" : "session-timer"}`
  const progressClass = `timer-progress ${isRest ? "rest-progress" : "session-progress"}`

  return (
    <div className={timerClass}>
      <div className="timer-header">
        <span className="timer-label">{label}</span>
        <button onClick={onToggle} className="timer-toggle-btn">
          {isRunning ? <Pause size={16} /> : <Play size={16} />}
        </button>
      </div>
      <div className="timer-content">
        <div className="timer-circle">
          <svg className="timer-svg" viewBox="0 0 120 120">
            <circle
              className="timer-background"
              cx="60"
              cy="60"
              r="54"
              strokeWidth="8"
            />
            <circle
              className="timer-progress-circle"
              cx="60"
              cy="60"
              r="54"
              strokeWidth="8"
              strokeDasharray={`${2 * Math.PI * 54}`}
              strokeDashoffset={`${2 * Math.PI * 54 * (1 - progress / 100)}`}
              transform="rotate(-90 60 60)"
            />
          </svg>
          <div className="timer-text">
            <Clock size={24} />
            <span>{formatTime(seconds)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ------------------- ExerciseCard Component -------------------
interface ExerciseCardProps {
  exercise: any
  machine?: Machine
  isCurrent: boolean
  isCompleted: boolean
  completedSets: number
  totalSets: number
  onCompleteSet: () => void
  onStartRest: (seconds: number) => void
  order: number
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({
  exercise,
  machine,
  isCurrent,
  isCompleted,
  completedSets,
  totalSets,
  onCompleteSet,
  onStartRest,
  order,
}) => {
  const renderSetProgress = () => {
    const dots = []
    for (let i = 0; i < totalSets; i++) {
      const isSetCompleted = i < completedSets
      const isCurrentSet = i === completedSets && isCurrent
      dots.push(
        <span
          key={i}
          className={`set-dot ${isSetCompleted ? "completed" : ""} ${isCurrentSet ? "current" : ""}`}
        >
          ●
        </span>
      )
    }
    return <div className="set-progress-dots">{dots}</div>
  }

  return (
    <div
      className={`exercise-card ${isCurrent ? "active" : ""} ${isCompleted ? "completed" : ""}`}
    >
      <div className="exercise-order">{order}</div>
      <div className="exercise-content">
        <div className="exercise-header">
          <h4>{machine?.name || exercise.exerciseName || "알 수 없는 기구"}</h4>
          <div className="exercise-status">
            {isCompleted && <Check size={16} className="completed-icon" />}
          </div>
        </div>
        <div className="exercise-details">
          <span className="exercise-targets">
            {totalSets}세트 × {exercise.reps || 10}회
            {exercise.weight && ` (${exercise.weight}kg)`}
          </span>
          <span className="exercise-progress">
            {completedSets}/{totalSets} 세트 완료
          </span>
        </div>
        {renderSetProgress()}
        <div className="exercise-controls">
          <button
            onClick={() =>
              onStartRest(
                exercise.restTime ||
                  exercise.restSeconds ||
                  exercise.rest_time ||
                  60
              )
            }
            className="rest-btn"
            disabled={isCompleted}
          >
            <Timer size={14} />
            휴식 (
            {exercise.restTime ||
              exercise.restSeconds ||
              exercise.rest_time ||
              60}
            초)
          </button>
          <button
            onClick={onCompleteSet}
            className="complete-set-btn"
            disabled={isCompleted || !isCurrent}
          >
            <Check size={16} /> 세트 완료
          </button>
        </div>
      </div>
    </div>
  )
}

// ------------------- SessionNotes Component -------------------
interface SessionNotesProps {
  notes: string
  onChange: (notes: string) => void
}

const SessionNotes: React.FC<SessionNotesProps> = ({ notes, onChange }) => {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className={`session-notes ${isExpanded ? "expanded" : ""}`}>
      <div className="notes-header" onClick={() => setIsExpanded(!isExpanded)}>
        <span>세션 메모</span>
        <button className="expand-btn">{isExpanded ? "접기" : "펼치기"}</button>
      </div>
      {isExpanded && (
        <textarea
          value={notes}
          onChange={e => onChange(e.target.value)}
          placeholder="이번 세션에 대한 메모를 입력하세요"
          rows={3}
          className="notes-textarea"
        />
      )}
    </div>
  )
}

// ------------------- ModalFooter Component -------------------
interface ModalFooterProps {
  onClose: () => void
  onComplete: () => void
  isTimerRunning: boolean
  onToggleTimer: () => void
  currentExerciseIndex: number
  totalExercises: number
}

const ModalFooter: React.FC<ModalFooterProps> = ({
  onClose,
  onComplete,
  isTimerRunning,
  onToggleTimer,
  currentExerciseIndex,
  totalExercises,
}) => (
  <div className="modal-footer">
    <div className="footer-progress">
      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{
            width: `${((currentExerciseIndex + 1) / totalExercises) * 100}%`,
          }}
        />
      </div>
      <span className="progress-text">
        {currentExerciseIndex + 1} / {totalExercises} 운동
      </span>
    </div>
    <div className="footer-controls">
      <button onClick={onClose} className="cancel-btn">
        취소
      </button>
      <button onClick={onToggleTimer} className="timer-btn">
        {isTimerRunning ? <Pause size={16} /> : <Play size={16} />}
        {isTimerRunning ? "일시정지" : "운동 시작"}
      </button>
      <button onClick={onComplete} className="complete-btn">
        <Save size={16} />
        세션 저장
      </button>
    </div>
  </div>
)

// ------------------- WorkoutSessionModal -------------------
export function WorkoutSessionModal({
  isOpen,
  onClose,
  onSave,
  session,
  plan,
  machines,
}: WorkoutSessionModalProps) {
  // 글로벌 타이머 컨텍스트 사용
  const {
    timerState,
    sessionState,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    setCurrentExercise: setGlobalCurrentExercise,
    completeSet: completeGlobalSet,
    getFormattedTime,
    getSessionProgress,
  } = useWorkoutTimer()

  // 세션 서비스 인스턴스
  const [sessionService] = useState(() => WorkoutSessionService.getInstance())
  const [currentSessionData, setCurrentSessionData] =
    useState<SessionData | null>(null)

  const [currentSession, setCurrentSession] = useState<WorkoutSession>({
    id: 0,
    userId: 0,
    planId: 0,
    gymId: 0,
    name: "",
    notes: "",
    startTime: new Date(),
    endTime: undefined,
    totalDuration: 0,
    status: "in_progress" as const,
    exercises: [] as ExerciseSet[],
    plan: {} as any,
    gym: {} as any,
    createdAt: new Date(),
    updatedAt: new Date(),
    isCompleted: false,
    duration: 0,
  })

  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0)
  const [currentSetIndex, setCurrentSetIndex] = useState(0)
  const [restTimer, setRestTimer] = useState(0)
  const [isRestTimerRunning, setIsRestTimerRunning] = useState(false)
  const [completedSets, setCompletedSets] = useState<{ [key: number]: number }>(
    {}
  )

  // 초기화 함수
  const initializeSession = (session?: WorkoutSession, plan?: any) => {
    const startTime = performance.now()
    logger.info("Session initialization started", {
      hasSession: !!session,
      hasPlan: !!plan,
      sessionId: session?.id,
      planName: plan?.name,
      exercisesCount: plan?.exercises?.length || 0,
    })

    if (session) {
      setCurrentSession(session)
      logger.debug("Session initialized from existing session", {
        sessionId: session.id,
        sessionName: session.name,
        status: session.status,
      })
    } else if (plan) {
      // 계획 기반 세션 초기화
      const newSession: WorkoutSession = {
        id: 0,
        userId: 0,
        planId: plan.id || 0,
        gymId: 0,
        name: plan.name || "새 운동 세션",
        notes: plan.description || "",
        startTime: new Date(),
        endTime: undefined,
        totalDuration: 0,
        status: "in_progress" as const,
        exercises: [] as ExerciseSet[],
        plan: plan,
        gym: {} as any,
        createdAt: new Date(),
        updatedAt: new Date(),
        isCompleted: false,
        duration: 0,
      }
      setCurrentSession(newSession)
      logger.debug("Session initialized from plan", {
        planName: plan.name,
        exercisesCount: plan.exercises?.length || 0,
        exercises: plan.exercises?.map((ex: any) => ({
          id: ex.id,
          name: ex.exerciseName,
          machineId: ex.machineId,
          sets: ex.sets,
          reps: ex.reps,
        })),
      })
    } else {
      // 자유 운동 세션 초기화
      const emptySession: WorkoutSession = {
        id: 0,
        userId: 0,
        planId: 0,
        gymId: 0,
        name: "자유 운동",
        notes: "",
        startTime: new Date(),
        endTime: undefined,
        totalDuration: 0,
        status: "in_progress" as const,
        exercises: [] as ExerciseSet[],
        plan: {} as any,
        gym: {} as any,
        createdAt: new Date(),
        updatedAt: new Date(),
        isCompleted: false,
        duration: 0,
      }
      setCurrentSession(emptySession)
      logger.debug("Session initialized as free workout session")
    }

    // 상태 초기화
    setCurrentExerciseIndex(0)
    setCurrentSetIndex(0)
    setRestTimer(0)
    setIsRestTimerRunning(false)
    setCompletedSets({})

    logger.performance("Session initialization", startTime)
  }

  // 모달 열릴 때 초기화
  useEffect(() => {
    if (isOpen) {
      logger.info("Modal opened, initializing session", {
        hasSession: !!session,
        hasPlan: !!plan,
        planName: plan?.name,
        planExercises: plan?.exercises?.length || 0,
        machinesCount: machines.length,
      })
      initializeSession(session || undefined, plan || undefined)
    } else {
      logger.debug("Modal closed")
    }
  }, [isOpen, session, plan])

  // 글로벌 타이머와 세션 데이터 동기화
  useEffect(() => {
    const sessionData = sessionService.getCurrentSession()
    setCurrentSessionData(sessionData)
  }, [sessionService, timerState.isRunning, timerState.isPaused])

  // 휴식 타이머
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    if (isRestTimerRunning && restTimer > 0) {
      logger.debug("Rest timer started", { restTimer })
      interval = setInterval(() => {
        setRestTimer(prev => {
          if (prev <= 1) {
            setIsRestTimerRunning(false)
            logger.debug("Rest timer completed")
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      logger.debug("Rest timer stopped", { restTimer, isRestTimerRunning })
    }
    return () => {
      if (interval) {
        clearInterval(interval)
        logger.debug("Rest timer interval cleared")
      }
    }
  }, [isRestTimerRunning, restTimer])

  // 타이머 시작/정지 - 글로벌 컨텍스트 사용
  const toggleTimer = () => {
    logger.info("Toggle timer called", {
      isRunning: timerState.isRunning,
      isPaused: timerState.isPaused,
      hasPlan: !!plan,
      planId: plan?.id,
    })

    if (timerState.isRunning) {
      logger.info("Pausing timer")
      pauseTimer()
      sessionService.pauseSession()
    } else if (timerState.isPaused) {
      logger.info("Resuming timer")
      resumeTimer()
      sessionService.resumeSession()
    } else {
      // 새 세션 시작
      logger.info("Starting new session")
      if (plan) {
        logger.info("Starting session with plan", {
          planId: plan.id,
          planName: plan.name,
        })
        const sessionData = sessionService.startSessionWithPlan(plan)
        logger.info("Session started with plan", { sessionData })
        startTimer()
      } else {
        logger.info("Starting free session")
        const sessionData = sessionService.startFreeSession()
        logger.info("Free session started", { sessionData })
        startTimer()
      }
    }
  }

  // 휴식 타이머 시작
  const startRestTimer = (seconds: number) => {
    logger.info("Rest timer started", {
      seconds,
      exerciseIndex: currentExerciseIndex,
    })
    setRestTimer(seconds)
    setIsRestTimerRunning(true)
    // 글로벌 컨텍스트에도 휴식 타이머 시작
    startRestTimer(seconds)
  }

  // 세트 완료
  const completeSet = () => {
    logger.info("Set completed", {
      exerciseIndex: currentExerciseIndex,
      setIndex: currentSetIndex,
      totalSets: plan?.exercises?.[currentExerciseIndex]?.sets || 0,
    })

    // 글로벌 컨텍스트에 세트 완료 알림
    completeGlobalSet()

    // 완료된 세트 수 업데이트
    setCompletedSets(prev => ({
      ...prev,
      [currentExerciseIndex]: (prev[currentExerciseIndex] || 0) + 1,
    }))

    // 다음 세트 또는 운동으로 이동
    const currentCompletedSets = (completedSets[currentExerciseIndex] || 0) + 1
    const totalSets = plan?.exercises?.[currentExerciseIndex]?.sets || 0

    if (currentCompletedSets < totalSets) {
      setCurrentSetIndex(prev => prev + 1)
      logger.debug("Moving to next set", { newSetIndex: currentSetIndex + 1 })
    } else if (currentExerciseIndex + 1 < (plan?.exercises?.length || 0)) {
      setCurrentExerciseIndex(prev => prev + 1)
      setCurrentSetIndex(0)
      // 글로벌 컨텍스트에 현재 운동 변경 알림
      setGlobalCurrentExercise(currentExerciseIndex + 1)
      logger.debug("Moving to next exercise", {
        newExerciseIndex: currentExerciseIndex + 1,
      })
    } else {
      logger.info("All exercises completed, completing session")
      completeSession()
    }
  }

  // 세션 완료
  const completeSession = async () => {
    const startTime = performance.now()
    logger.info("Session completion started", {
      sessionName: currentSession.name,
      totalExercises: plan?.exercises?.length || 0,
      hasPlan: !!plan,
    })

    // 세션 서비스에서 완료된 세션 데이터 가져오기
    const saveData = sessionService.completeSession()
    if (!saveData) {
      logger.warn("No session data to save, creating basic session data")
      // 기본 세션 데이터 생성
    }

    // 세션 이름이 비어있으면 기본 이름 설정
    const sessionName = currentSession.name?.trim() || "새 운동 세션"

    const endTime = new Date()
    const sessionStartTime =
      currentSession.startTime instanceof Date
        ? currentSession.startTime
        : new Date(currentSession.startTime || Date.now())
    const duration = Math.floor(
      (endTime.getTime() - sessionStartTime.getTime()) / 60000
    ) // 분 단위

    // 운동 세부사항 준비
    const sessionExercises =
      plan?.exercises?.map((exercise: any) => {
        // 백엔드와 프론트엔드 호환성을 위한 데이터 정규화
        const normalizedExercise = {
          id: exercise.id || exercise.plan_exercise_id,
          machineId: exercise.machineId || exercise.machine_id,
          exerciseName:
            exercise.exerciseName || exercise.name || "알 수 없는 운동",
          sets: exercise.sets || 3,
          reps: exercise.reps || exercise.repsRange?.min || 10,
          weight: exercise.weight || exercise.weightRange?.min,
          restTime:
            exercise.restTime ||
            exercise.rest_time ||
            exercise.restSeconds ||
            60,
          order: exercise.order || exercise.exerciseOrder || 0,
          completedSets: exercise.completedSets || [],
        }
        return normalizedExercise
      }) || []

    const completedSession = {
      ...currentSession,
      name: sessionName,
      session_name: sessionName, // 백엔드 호환성
      endTime,
      end_time: endTime, // 백엔드 호환성
      duration,
      isCompleted: true,
      is_completed: true, // 백엔드 호환성
      updatedAt: new Date(),
      exercises: sessionExercises, // 운동 세부사항 추가
      // 필수 필드 보장
      id: currentSession.id || 0,
      userId: currentSession.userId || 0,
      startTime: sessionStartTime,
      status: "completed",
    } as WorkoutSession & {
      session_name?: string
      end_time?: Date
      is_completed?: boolean
      exercises?: any[]
    }

    logger.debug("Completed session data", {
      duration,
      endTime,
      isCompleted: true,
      sessionName: completedSession.name,
      exercisesCount: sessionExercises.length,
      exercises: sessionExercises.map((ex: any) => ({
        id: ex.id,
        name: ex.exerciseName,
        sets: ex.sets,
        reps: ex.reps,
        machineId: ex.machineId,
      })),
    })

    try {
      await onSave(completedSession)
      logger.info("Session saved successfully")
      logger.performance("Session completion", startTime)
      onClose()
    } catch (error) {
      logger.error("Session save failed", {
        error: error instanceof Error ? error.message : error,
        sessionName: completedSession.name,
      })
      logger.performance("Session completion (failed)", startTime)
    }
  }

  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        logger.debug("Modal closed via ESC key")
        onClose()
      }
    }

    if (isOpen) {
      logger.debug("ESC key listener added")
      document.addEventListener("keydown", handleEscape)
      return () => {
        logger.debug("ESC key listener removed")
        document.removeEventListener("keydown", handleEscape)
      }
    }
  }, [isOpen, onClose])

  // 오버레이 클릭으로 모달 닫기
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      logger.debug("Modal closed via overlay click")
      onClose()
    }
  }

  if (!isOpen) return null

  logger.debug("Rendering modal", {
    sessionName: currentSession.name,
    currentExerciseIndex,
    currentSetIndex,
    isTimerRunning: timerState.isRunning,
    restTimer,
    exercisesCount: plan?.exercises?.length || 0,
  })

  const totalExercises = plan?.exercises?.length || 0
  const sessionProgress =
    totalExercises > 0 ? ((currentExerciseIndex + 1) / totalExercises) * 100 : 0

  // 글로벌 타이머에서 시간 가져오기
  const sessionTimer = Math.floor(timerState.elapsedTime / 1000)

  return (
    <div className="workout-session-modal-overlay" onClick={handleOverlayClick}>
      <div className="workout-session-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{currentSession.name || "워크아웃 세션"}</h2>
          <button onClick={onClose} className="close-btn">
            <X size={24} />
          </button>
        </div>

        <div className="modal-content">
          {/* 세션 타이머 */}
          <TimerDisplay
            seconds={sessionTimer}
            label="운동 시간"
            isRunning={timerState.isRunning}
            onToggle={toggleTimer}
            variant="session"
            progress={sessionProgress}
          />

          {/* 휴식 타이머 */}
          {restTimer > 0 && (
            <TimerDisplay
              seconds={restTimer}
              label="휴식 시간"
              isRunning={isRestTimerRunning}
              onToggle={() => setIsRestTimerRunning(false)}
              variant="rest"
              progress={0} // 휴식 타이머는 카운트다운이므로 진행률 계산 필요
            />
          )}

          {/* 운동 목록 */}
          <div className="exercise-list">
            <h3>운동 목록</h3>
            {logger.debug("Rendering exercise list", {
              hasPlan: !!plan,
              planName: plan?.name,
              exercisesCount: plan?.exercises?.length || 0,
              exercises: plan?.exercises?.map((ex: any) => ({
                id: ex.id,
                name: ex.exerciseName,
                machineId: ex.machineId,
                sets: ex.sets,
                reps: ex.reps,
              })),
            })}
            {plan?.exercises && plan.exercises.length > 0 ? (
              // 계획 기반 운동 목록
              plan.exercises.map((exercise: any, index: number) => {
                // 백엔드와 프론트엔드 호환성을 위한 데이터 정규화
                const normalizedExercise = {
                  id: exercise.id || exercise.plan_exercise_id,
                  machineId: exercise.machineId || exercise.machine_id,
                  exerciseName:
                    exercise.exerciseName || exercise.name || "알 수 없는 운동",
                  sets: exercise.sets || 3,
                  reps: exercise.reps || exercise.repsRange?.min || 10,
                  weight: exercise.weight || exercise.weightRange?.min,
                  restTime:
                    exercise.restTime ||
                    exercise.rest_time ||
                    exercise.restSeconds ||
                    60,
                  order: exercise.order || exercise.exerciseOrder || index,
                }

                const machine = machines.find(
                  m => m.id === normalizedExercise.machineId
                )
                const exerciseCompletedSets = completedSets[index] || 0
                const isCurrentExercise = index === currentExerciseIndex
                const isCompleted =
                  exerciseCompletedSets >= normalizedExercise.sets

                return (
                  <ExerciseCard
                    key={normalizedExercise.id || index}
                    exercise={normalizedExercise}
                    machine={machine}
                    isCurrent={isCurrentExercise}
                    isCompleted={isCompleted}
                    completedSets={exerciseCompletedSets}
                    totalSets={normalizedExercise.sets}
                    onCompleteSet={completeSet}
                    onStartRest={startRestTimer}
                    order={index + 1}
                  />
                )
              })
            ) : (
              // 자유 운동 모드
              <div className="free-workout-mode">
                <div className="free-workout-info">
                  <h4>자유 운동 모드</h4>
                  <p>원하는 운동을 자유롭게 수행하세요.</p>
                  <div className="free-workout-stats">
                    <div className="stat-item">
                      <span className="stat-label">운동 시간</span>
                      <span className="stat-value">
                        {Math.floor(sessionTimer / 60)}:
                        {(sessionTimer % 60).toString().padStart(2, "0")}
                      </span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">상태</span>
                      <span className="stat-value">
                        {timerState.isRunning ? "운동 중" : "대기 중"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 세션 메모 */}
          <SessionNotes
            notes={currentSession.notes || ""}
            onChange={notes => {
              logger.debug("Session notes updated", { newValue: notes })
              setCurrentSession(prev => ({ ...prev, notes }))
              // 세션 서비스에도 메모 업데이트
              sessionService.updateNotes(notes)
            }}
          />
        </div>

        {/* 하단 고정 컨트롤바 */}
        <ModalFooter
          onClose={onClose}
          onComplete={completeSession}
          isTimerRunning={timerState.isRunning}
          onToggleTimer={toggleTimer}
          currentExerciseIndex={currentExerciseIndex}
          totalExercises={totalExercises}
        />
      </div>
    </div>
  )
}
