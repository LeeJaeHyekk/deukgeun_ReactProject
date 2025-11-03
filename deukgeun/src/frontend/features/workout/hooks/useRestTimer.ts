// ============================================================================
// useRestTimer - 휴식 타이머 훅
// ============================================================================

import { useState, useEffect, useRef, useCallback } from "react"

interface RestTimerState {
  isActive: boolean
  remaining: number
  defaultDuration: number
}

export function useRestTimer(defaultDuration: number = 30) {
  const [state, setState] = useState<RestTimerState>({
    isActive: false,
    remaining: defaultDuration,
    defaultDuration,
  })

  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const startTimer = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isActive: true,
      remaining: prev.defaultDuration,
    }))
  }, [])

  const stopTimer = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isActive: false,
      remaining: prev.defaultDuration,
    }))
  }, [])

  useEffect(() => {
    if (state.isActive && state.remaining > 0) {
      intervalRef.current = setInterval(() => {
        setState((prev) => {
          const newRemaining = prev.remaining - 1
          if (newRemaining <= 0) {
            return {
              ...prev,
              isActive: false,
              remaining: prev.defaultDuration,
            }
          }
          return {
            ...prev,
            remaining: newRemaining,
          }
        })
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
  }, [state.isActive, state.remaining])

  return {
    isActive: state.isActive,
    remaining: state.remaining,
    startTimer,
    stopTimer,
  }
}

