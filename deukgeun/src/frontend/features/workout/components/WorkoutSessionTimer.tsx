import React, { useState, useEffect, useCallback, useRef } from "react"
import { Play, Pause, Square, RotateCcw } from "lucide-react"
import { formatTime } from "../utils/workoutUtils"
import "./WorkoutSessionTimer.css"

interface WorkoutSessionTimerProps {
  onTimeUpdate?: (time: number) => void
  onSessionComplete?: (duration: number) => void
  className?: string
  autoStart?: boolean
}

export function WorkoutSessionTimer({
  onTimeUpdate,
  onSessionComplete,
  className = "",
  autoStart = false,
}: WorkoutSessionTimerProps) {
  const [isActive, setIsActive] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [time, setTime] = useState(0)
  const [laps, setLaps] = useState<number[]>([])
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<number>(0)

  const startTimer = useCallback(() => {
    if (!isActive) {
      setIsActive(true)
      setIsPaused(false)
      startTimeRef.current = Date.now() - time * 1000
    }
  }, [isActive, time])

  const pauseTimer = useCallback(() => {
    setIsActive(false)
    setIsPaused(true)
  }, [])

  const stopTimer = useCallback(() => {
    setIsActive(false)
    setIsPaused(false)
    const finalTime = time
    setTime(0)
    setLaps([])
    onSessionComplete?.(finalTime)
  }, [time, onSessionComplete])

  const resetTimer = useCallback(() => {
    setIsActive(false)
    setIsPaused(false)
    setTime(0)
    setLaps([])
  }, [])

  const addLap = useCallback(() => {
    if (isActive || isPaused) {
      setLaps(prev => [...prev, time])
    }
  }, [isActive, isPaused, time])

  // 타이머 로직
  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        const newTime = Math.floor((Date.now() - startTimeRef.current) / 1000)
        setTime(newTime)
        onTimeUpdate?.(newTime)
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isActive, onTimeUpdate])

  // 자동 시작
  useEffect(() => {
    if (autoStart && !isActive && !isPaused) {
      startTimer()
    }
  }, [autoStart, isActive, isPaused, startTimer])

  // 키보드 단축키
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return
      }

      switch (e.code) {
        case "Space":
          e.preventDefault()
          if (isActive) {
            pauseTimer()
          } else {
            startTimer()
          }
          break
        case "KeyS":
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault()
            stopTimer()
          }
          break
        case "KeyR":
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault()
            resetTimer()
          }
          break
        case "KeyL":
          e.preventDefault()
          addLap()
          break
      }
    }

    document.addEventListener("keydown", handleKeyPress)
    return () => document.removeEventListener("keydown", handleKeyPress)
  }, [isActive, startTimer, pauseTimer, stopTimer, resetTimer, addLap])

  return (
    <div className={`workout-session-timer ${className}`}>
      <div className="timer-display">
        <span
          className="timer-time"
          role="timer"
          aria-live="polite"
          aria-label={`운동 시간: ${formatTime(time)}`}
        >
          {formatTime(time)}
        </span>
      </div>

      <div className="timer-controls">
        {!isActive && !isPaused ? (
          <button
            className="timer-button start"
            onClick={startTimer}
            title="타이머 시작 (스페이스바)"
            aria-label="타이머 시작"
          >
            <Play size={16} />
            시작
          </button>
        ) : (
          <>
            <button
              className="timer-button pause"
              onClick={pauseTimer}
              title="일시정지 (스페이스바)"
              aria-label="타이머 일시정지"
            >
              <Pause size={16} />
              일시정지
            </button>
            <button
              className="timer-button stop"
              onClick={stopTimer}
              title="정지 (Ctrl+S)"
              aria-label="타이머 정지"
            >
              <Square size={16} />
              정지
            </button>
          </>
        )}

        {isPaused && (
          <button
            className="timer-button resume"
            onClick={startTimer}
            title="재개 (스페이스바)"
            aria-label="타이머 재개"
          >
            <Play size={16} />
            재개
          </button>
        )}

        <button
          className="timer-button reset"
          onClick={resetTimer}
          title="리셋 (Ctrl+R)"
          aria-label="타이머 리셋"
          disabled={isActive}
        >
          <RotateCcw size={16} />
          리셋
        </button>
      </div>

      {laps.length > 0 && (
        <div className="timer-laps">
          <h4>랩 기록</h4>
          <div className="laps-list" role="list" aria-label="랩 기록 목록">
            {laps.map((lapTime, index) => (
              <div key={index} className="lap-item" role="listitem">
                <span className="lap-number">랩 {index + 1}</span>
                <span className="lap-time">{formatTime(lapTime)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="timer-shortcuts">
        <small>
          단축키: 스페이스바 (시작/일시정지), Ctrl+S (정지), Ctrl+R (리셋), L
          (랩)
        </small>
      </div>
    </div>
  )
}
