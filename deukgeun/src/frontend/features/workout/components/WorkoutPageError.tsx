import React from 'react'
import styles from './WorkoutPageError.module.css'

interface WorkoutPageErrorProps {
  error: string
  onRetry?: () => void
  className?: string
}

/**
 * 워크아웃 페이지 에러 컴포넌트
 */
export function WorkoutPageError({ 
  error, 
  onRetry,
  className 
}: WorkoutPageErrorProps) {
  return (
    <div className={`${styles.errorContainer} ${className || ''}`}>
      <div className={styles.errorContent}>
        <div className={styles.errorIcon}>⚠️</div>
        <h2>오류가 발생했습니다</h2>
        <p>{error}</p>
        {onRetry && (
          <button 
            className={styles.retryButton}
            onClick={onRetry}
          >
            다시 시도
          </button>
        )}
        <button 
          className={styles.refreshButton}
          onClick={() => window.location.reload()}
        >
          페이지 새로고침
        </button>
      </div>
    </div>
  )
}
