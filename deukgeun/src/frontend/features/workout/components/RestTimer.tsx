// ============================================================================
// RestTimer - 전체 휴식 타이머
// ============================================================================

import React, { useEffect, useImperativeHandle, forwardRef } from "react"
import { useRestTimer } from "../hooks/useRestTimer"
import styles from "./RestTimer.module.css"

export interface RestTimerRef {
  startTimer: () => void
}

export const RestTimer = forwardRef<RestTimerRef, {}>((props, ref) => {
  const { isActive, remaining, startTimer, stopTimer } = useRestTimer()

  useImperativeHandle(ref, () => ({
    startTimer,
  }))

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes}:${secs.toString().padStart(2, "0")}`
  }

  if (!isActive) {
    return null
  }

  return (
    <div className={styles.restTimer}>
      <div className={styles.timerContent}>
        <h4>휴식 시간</h4>
        <div className={styles.timerDisplay}>{formatTime(remaining)}</div>
        <button onClick={stopTimer} className={styles.stopButton}>
          타이머 종료
        </button>
      </div>
    </div>
  )
})

RestTimer.displayName = "RestTimer"
