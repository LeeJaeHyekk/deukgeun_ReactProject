import React, { useState, useEffect, useRef } from "react"
import { Button } from "../ui/Button"

interface SessionTimerProps {
  onSessionStart?: () => void
  onSessionPause?: () => void
  onSessionComplete?: (duration: number) => void
  initialTime?: number
}

export function SessionTimer({
  onSessionStart,
  onSessionPause,
  onSessionComplete,
  initialTime = 0,
}: SessionTimerProps) {
  const [isRunning, setIsRunning] = useState(false)
  const [time, setTime] = useState(initialTime)
  const [startTime, setStartTime] = useState<Date | null>(null)
  const [endTime, setEndTime] = useState<Date | null>(null)
  const [laps, setLaps] = useState<number[]>([])
  const [isPaused, setIsPaused] = useState(false)
  const [pauseTime, setPauseTime] = useState<Date | null>(null)
  const [totalPauseTime, setTotalPauseTime] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (isRunning && !isPaused) {
      intervalRef.current = setInterval(() => {
        setTime(prevTime => prevTime + 1)
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning, isPaused])

  const startTimer = () => {
    setIsRunning(true)
    setIsPaused(false)
    setStartTime(new Date())
    setEndTime(null)
    setPauseTime(null)
    onSessionStart?.()
  }

  const pauseTimer = () => {
    setIsPaused(true)
    setPauseTime(new Date())
    onSessionPause?.()
  }

  const resumeTimer = () => {
    if (pauseTime) {
      const pauseDuration = Math.floor(
        (new Date().getTime() - pauseTime.getTime()) / 1000
      )
      setTotalPauseTime(prev => prev + pauseDuration)
    }
    setIsPaused(false)
    setPauseTime(null)
  }

  const stopTimer = () => {
    setIsRunning(false)
    setIsPaused(false)
    setEndTime(new Date())
    const actualDuration = time - totalPauseTime
    onSessionComplete?.(actualDuration)
  }

  const resetTimer = () => {
    setIsRunning(false)
    setIsPaused(false)
    setTime(0)
    setStartTime(null)
    setEndTime(null)
    setPauseTime(null)
    setTotalPauseTime(0)
    setLaps([])
  }

  const addLap = () => {
    if (isRunning) {
      setLaps(prev => [...prev, time])
    }
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const getDuration = () => {
    if (startTime && endTime) {
      return (
        Math.floor((endTime.getTime() - startTime.getTime()) / 1000) -
        totalPauseTime
      )
    }
    return time - totalPauseTime
  }

  const getActiveTime = () => {
    return time - totalPauseTime
  }

  return (
    <div className="session-timer">
      <h3>세션 타이머</h3>

      <div className="timer-display">
        <div className="current-time">{formatTime(getActiveTime())}</div>

        {totalPauseTime > 0 && (
          <div className="pause-info">
            <span className="pause-text">
              일시정지: {formatTime(totalPauseTime)}
            </span>
          </div>
        )}

        {startTime && (
          <div className="session-info">
            <p>시작 시간: {startTime.toLocaleTimeString()}</p>
            {endTime && <p>종료 시간: {endTime.toLocaleTimeString()}</p>}
            {endTime && <p>총 소요 시간: {formatTime(getDuration())}</p>}
          </div>
        )}
      </div>

      <div className="timer-controls">
        {!isRunning ? (
          <Button onClick={startTimer} variant="primary">
            시작
          </Button>
        ) : isPaused ? (
          <Button onClick={resumeTimer} variant="primary">
            재개
          </Button>
        ) : (
          <Button onClick={pauseTimer} variant="secondary">
            일시정지
          </Button>
        )}

        {isRunning && (
          <Button onClick={addLap} variant="secondary">
            랩
          </Button>
        )}

        <Button onClick={stopTimer} variant="danger">
          정지
        </Button>

        <Button onClick={resetTimer} variant="secondary">
          리셋
        </Button>
      </div>

      {laps.length > 0 && (
        <div className="laps-section">
          <h4>랩 기록</h4>
          <div className="laps-list">
            {laps.map((lap, index) => (
              <div key={index} className="lap-item">
                <span className="lap-number">랩 {index + 1}</span>
                <span className="lap-time">{formatTime(lap)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="timer-stats">
        <div className="stat-item">
          <span className="stat-label">활성 시간:</span>
          <span className="stat-value">{formatTime(getActiveTime())}</span>
        </div>
        {totalPauseTime > 0 && (
          <div className="stat-item">
            <span className="stat-label">일시정지 시간:</span>
            <span className="stat-value">{formatTime(totalPauseTime)}</span>
          </div>
        )}
        <div className="stat-item">
          <span className="stat-label">랩 수:</span>
          <span className="stat-value">{laps.length}</span>
        </div>
      </div>
    </div>
  )
}
