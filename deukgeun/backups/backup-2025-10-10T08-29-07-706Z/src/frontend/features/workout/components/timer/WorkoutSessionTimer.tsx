import React, { useState, useEffect, useCallback } from "react"
import { Play, Pause, Square, RotateCcw } from "lucide-react"
import "./WorkoutSessionTimer.css"

// 로깅 유틸리티
const logger = {
  info: (message: string, data?: any) => {
    if (import.meta.env.DEV) {
      console.log(`[WorkoutSessionTimer] ${message}`, data || "")
    }
  },
  debug: (message: string, data?: any) => {
    if (import.meta.env.DEV) {
      console.debug(`[WorkoutSessionTimer] ${message}`, data || "")
    }
  },
  warn: (message: string, data?: any) => {
    console.warn(`[WorkoutSessionTimer] ${message}`, data || "")
  },
  error: (message: string, data?: any) => {
    console.error(`[WorkoutSessionTimer] ${message}`, data || "")
  },
}

interface WorkoutSessionTimerProps {
  initialTime?: number // 초 단위
  onTimeUpdate?: (time: number) => void
  onTimerComplete?: () => void
  autoStart?: boolean
  className?: string
}

export function WorkoutSessionTimer({
  initialTime = 0,
  onTimeUpdate,
  onTimerComplete,
  autoStart = false,
  className = "",
}: WorkoutSessionTimerProps) {
  const [time, setTime] = useState(initialTime)
  const [isRunning, setIsRunning] = useState(autoStart)
  const [isPaused, setIsPaused] = useState(false)

  // 시간 포맷팅 함수
  const formatTime = useCallback((seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }, [])

  // 타이머 효과
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isRunning && !isPaused) {
      interval = setInterval(() => {
        setTime(prevTime => {
          const newTime = prevTime + 1
          onTimeUpdate?.(newTime)
          return newTime
        })
      }, 1000)
    }

    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [isRunning, isPaused, onTimeUpdate])

  // 타이머 시작/일시정지
  const handleStartPause = useCallback(() => {
    if (isRunning) {
      setIsPaused(!isPaused)
      logger.info("타이머 일시정지/재개", { isPaused: !isPaused })
    } else {
      setIsRunning(true)
      setIsPaused(false)
      logger.info("타이머 시작")
    }
  }, [isRunning, isPaused])

  // 타이머 정지
  const handleStop = useCallback(() => {
    setIsRunning(false)
    setIsPaused(false)
    setTime(0)
    logger.info("타이머 정지 및 리셋")
  }, [])

  // 타이머 리셋
  const handleReset = useCallback(() => {
    setTime(initialTime)
    setIsRunning(false)
    setIsPaused(false)
    logger.info("타이머 리셋", { initialTime })
  }, [initialTime])

  // 타이머 완료 처리
  useEffect(() => {
    if (onTimerComplete && time > 0 && !isRunning) {
      onTimerComplete()
    }
  }, [time, isRunning, onTimerComplete])

  logger.debug("WorkoutSessionTimer 렌더링", {
    time,
    isRunning,
    isPaused,
    formattedTime: formatTime(time),
  })

  return (
    <div className={`workout-session-timer ${className}`}>
      <div className="timer-display">
        <div className="timer-time">
          {formatTime(time)}
        </div>
        <div className="timer-status">
          {isRunning ? (isPaused ? "일시정지" : "진행중") : "정지"}
        </div>
      </div>

      <div className="timer-controls">
        <button
          className={`timer-btn ${isRunning && !isPaused ? 'pause' : 'play'}`}
          onClick={handleStartPause}
          title={isRunning && !isPaused ? "일시정지" : "시작"}
        >
          {isRunning && !isPaused ? <Pause size={20} /> : <Play size={20} />}
        </button>

        <button
          className="timer-btn stop"
          onClick={handleStop}
          title="정지"
        >
          <Square size={20} />
        </button>

        <button
          className="timer-btn reset"
          onClick={handleReset}
          title="리셋"
        >
          <RotateCcw size={20} />
        </button>
      </div>

      <div className="timer-info">
        <div className="timer-stats">
          <span>총 시간: {formatTime(time)}</span>
        </div>
      </div>
    </div>
  )
}
