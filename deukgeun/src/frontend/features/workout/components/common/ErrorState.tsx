// ============================================================================
// ErrorState - 오류 상태 표시 공통 컴포넌트
// ============================================================================

import React from "react"
import styles from "./ErrorState.module.css"

interface Props {
  message: string
  onRetry?: () => void
}

export function ErrorState({ message, onRetry }: Props) {
  return (
    <div className={styles.errorState}>
      <div className={styles.icon}>⚠️</div>
      <p className={styles.message}>{message}</p>
      {onRetry && (
        <button onClick={onRetry} className={styles.retryButton}>
          다시 시도
        </button>
      )}
    </div>
  )
}

