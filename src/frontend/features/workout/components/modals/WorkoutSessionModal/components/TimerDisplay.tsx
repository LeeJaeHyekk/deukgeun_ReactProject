import React from "react"
import { Play, Pause, Clock } from "lucide-react"

interface TimerDisplayProps {
  seconds: number
  label: string
  isRunning: boolean
  onToggle: () => void
  variant?: "session" | "rest"
  progress?: number // 0-100
}

export const TimerDisplay: React.FC<TimerDisplayProps> = ({
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
