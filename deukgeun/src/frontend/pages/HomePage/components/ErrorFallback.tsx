import { useCallback } from 'react'
import styles from '../HomePage.module.css'
import { SAFETY_LIMITS, ERROR_MESSAGES } from '../constants'

interface ErrorFallbackProps {
  dataError: string | null
  retryCount: number
  isRetrying: boolean
  onRetry: () => void
  onClear: () => void
}

/**
 * 에러 폴백 컴포넌트
 */
export const ErrorFallback = ({ 
  dataError, 
  retryCount, 
  isRetrying, 
  onRetry, 
  onClear 
}: ErrorFallbackProps) => {
  return (
    <div className={styles.errorFallback}>
      <div className={styles.errorContent}>
        <h2>⚠️ 일시적인 오류가 발생했습니다</h2>
        <p>{dataError || ERROR_MESSAGES.GENERIC_ERROR}</p>
        <div className={styles.errorActions}>
          <button 
            onClick={onRetry}
            disabled={retryCount >= SAFETY_LIMITS.MAX_RETRY_ATTEMPTS || isRetrying}
            className={styles.retryButton}
          >
            {isRetrying ? '재시도 중...' : '다시 시도'}
          </button>
          <button 
            onClick={onClear}
            className={styles.dismissButton}
          >
            닫기
          </button>
        </div>
        {retryCount >= SAFETY_LIMITS.MAX_RETRY_ATTEMPTS && (
          <p className={styles.maxRetryMessage}>
            최대 재시도 횟수에 도달했습니다. 잠시 후 다시 시도해주세요.
          </p>
        )}
      </div>
    </div>
  )
}
