import React, { useState, useEffect } from "react"
import "./WorkoutSessionTimer.css"

export function WorkoutSessionTimer() {
  const [isActive, setIsActive] = useState(false)
  const [time, setTime] = useState(0)

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isActive) {
      interval = setInterval(() => {
        setTime(time => time + 1)
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isActive])

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleStart = () => {
    setIsActive(true)
  }

  const handleStop = () => {
    setIsActive(false)
    setTime(0)
  }

  const handlePause = () => {
    setIsActive(false)
  }

  return (
    <div className="workout-session-timer">
      <div className="timer-display">
        <span className="timer-time">{formatTime(time)}</span>
      </div>

      <div className="timer-controls">
        {!isActive ? (
          <button className="timer-button start" onClick={handleStart}>
            시작
          </button>
        ) : (
          <>
            <button className="timer-button pause" onClick={handlePause}>
              일시정지
            </button>
            <button className="timer-button stop" onClick={handleStop}>
              정지
            </button>
          </>
        )}
      </div>
    </div>
  )
}
