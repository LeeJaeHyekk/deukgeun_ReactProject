import React from "react"
import styles from "./ProgressBar.module.css"

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
    <div className={`${styles.progressBar} ${className}`}>
      <div className={styles.progressBarContainer}>
        <div
          className={styles.progressBarFill}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className={styles.progressBarText}>
        {currentValue}
        {unit} / {targetValue}
        {unit} ({Math.round(percentage)}%)
      </div>
    </div>
  )
}
