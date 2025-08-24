import React from "react"

interface ProgressBarProps {
  currentValue: number
  targetValue: number
  unit?: string
  className?: string
}

export function ProgressBar({
  currentValue,
  targetValue,
  unit = "",
  className = "",
}: ProgressBarProps) {
  const percentage = Math.min((currentValue / targetValue) * 100, 100)

  return (
    <div className={`progress-bar ${className}`}>
      <div className="progress-bar-container">
        <div
          className="progress-bar-fill"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="progress-bar-text">
        {currentValue}
        {unit} / {targetValue}
        {unit} ({Math.round(percentage)}%)
      </div>
    </div>
  )
}
