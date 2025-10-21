import React from 'react'
import styles from './WorkoutPageLoading.module.css'

interface WorkoutPageLoadingProps {
  message?: string
  className?: string
}

/**
 * 워크아웃 페이지 로딩 컴포넌트
 */
export function WorkoutPageLoading({ 
  message = "운동 데이터를 불러오는 중...",
  className 
}: WorkoutPageLoadingProps) {
  return (
    <div className={`${styles.workoutPageLoading} ${className || ''}`}>
      <div className={styles.loadingSpinner}>
        <div className={styles.spinner}></div>
        <p>{message}</p>
      </div>
    </div>
  )
}
