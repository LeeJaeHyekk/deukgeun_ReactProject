import React, { useState, useEffect } from "react"
import { X, Play, Pause, Square, Save, Clock, Target } from "lucide-react"
import type { Machine, WorkoutSession, ExerciseSet } from "../../../../types"
import "./WorkoutSessionModal.css"

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
  onSave: (session: WorkoutSession) => void
  session?: WorkoutSession | null
  plan?: any | null
  machines: Machine[]
}

export function WorkoutSessionModal({
  isOpen,
  onClose,
  onSave,
  session,
  plan,
  machines,
}: WorkoutSessionModalProps) {
  const [currentSession, setCurrentSession] = useState<WorkoutSession>({
    id: 0,
    userId: 0,
    name: "",
    description: "",
    startTime: new Date(),
    endTime: undefined,
    duration: undefined,
    caloriesBurned: undefined,
    notes: "",
    isCompleted: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  })

  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0)
  const [currentSetIndex, setCurrentSetIndex] = useState(0)
  const [sessionTimer, setSessionTimer] = useState(0)
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [restTimer, setRestTimer] = useState(0)
  const [isRestTimerRunning, setIsRestTimerRunning] = useState(false)

  // 기존 세션이나 계획이 있으면 초기화
  useEffect(() => {
    if (session) {
      setCurrentSession(session)
      setCurrentExerciseIndex(0)
    } else if (plan) {
      setCurrentSession({
        id: 0,
        userId: 0,
        name: plan.name,
        description: "",
        startTime: new Date(),
        endTime: undefined,
        duration: undefined,
        caloriesBurned: undefined,
        notes: "",
        isCompleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    } else {
      setCurrentSession({
        id: 0,
        userId: 0,
        name: "",
        description: "",
        startTime: new Date(),
        endTime: undefined,
        duration: undefined,
        caloriesBurned: undefined,
        notes: "",
        isCompleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    }
    setCurrentExerciseIndex(0)
    setCurrentSetIndex(0)
    setSessionTimer(0)
    setIsTimerRunning(false)
    setRestTimer(0)
    setIsRestTimerRunning(false)
  }, [session, plan, isOpen])

  // 세션 타이머
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    if (isTimerRunning) {
      interval = setInterval(() => {
        setSessionTimer(prev => prev + 1)
      }, 1000)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isTimerRunning])

  // 휴식 타이머
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    if (isRestTimerRunning && restTimer > 0) {
      interval = setInterval(() => {
        setRestTimer(prev => {
          if (prev <= 1) {
            setIsRestTimerRunning(false)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRestTimerRunning, restTimer])

  // 타이머 시작/정지
  const toggleTimer = () => {
    setIsTimerRunning(!isTimerRunning)
  }

  // 휴식 타이머 시작
  const startRestTimer = (seconds: number) => {
    setRestTimer(seconds)
    setIsRestTimerRunning(true)
  }

  // 세션 완료
  const completeSession = () => {
    const endTime = new Date()
    const duration = Math.floor(
      (endTime.getTime() - currentSession.startTime.getTime()) / 60000
    ) // 분 단위

    const completedSession: WorkoutSession = {
      ...currentSession,
      endTime,
      duration,
      isCompleted: true,
      updatedAt: new Date(),
    }

    onSave(completedSession)
    onClose()
  }

  // 시간 포맷팅
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  if (!isOpen) return null

  return (
    <div className="workout-session-modal-overlay">
      <div className="workout-session-modal">
        <div className="modal-header">
          <h2>워크아웃 세션</h2>
          <button onClick={onClose} className="close-btn">
            <X size={24} />
          </button>
        </div>

        <div className="modal-content">
          {/* 세션 정보 */}
          <div className="session-info">
            <h3>{currentSession.name || "새 세션"}</h3>
            <div className="session-timer">
              <Clock size={20} />
              <span>{formatTime(sessionTimer)}</span>
              <button onClick={toggleTimer} className="timer-button">
                {isTimerRunning ? <Pause size={16} /> : <Play size={16} />}
              </button>
            </div>
          </div>

          {/* 휴식 타이머 */}
          {restTimer > 0 && (
            <div className="rest-timer">
              <Target size={20} />
              <span>휴식: {formatTime(restTimer)}</span>
              <button
                onClick={() => setIsRestTimerRunning(false)}
                className="stop-rest-button"
              >
                <Square size={16} />
              </button>
            </div>
          )}

          {/* 운동 목록 */}
          <div className="exercises-section">
            <h3>운동 목록</h3>
            {plan?.exercises?.map((exercise: any, index: number) => {
              const machine = machines.find(m => m.id === exercise.machineId)
              return (
                <div
                  key={index}
                  className={`exercise-item ${
                    index === currentExerciseIndex ? "active" : ""
                  }`}
                >
                  <div className="exercise-header">
                    <h4>{machine?.name || "알 수 없는 기구"}</h4>
                    <span className="exercise-details">
                      {exercise.sets}세트 × {exercise.reps}회
                      {exercise.weight && ` (${exercise.weight}kg)`}
                    </span>
                  </div>
                  <div className="exercise-actions">
                    <button
                      onClick={() => startRestTimer(exercise.restSeconds)}
                      className="rest-button"
                    >
                      휴식 ({exercise.restSeconds}초)
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {/* 세션 메모 */}
          <div className="form-group">
            <label>세션 메모</label>
            <textarea
              value={currentSession.notes || ""}
              onChange={e =>
                setCurrentSession(prev => ({ ...prev, notes: e.target.value }))
              }
              placeholder="이번 세션에 대한 메모를 입력하세요"
              rows={3}
            />
          </div>
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="cancel-button">
            취소
          </button>
          <button onClick={completeSession} className="complete-button">
            <Save size={16} />
            세션 완료
          </button>
        </div>
      </div>
    </div>
  )
}
