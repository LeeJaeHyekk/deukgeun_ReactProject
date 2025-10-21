import React from 'react'
import styles from './WorkoutPageHeader.module.css'

interface WorkoutPageHeaderProps {
  title?: string
  description?: string
  className?: string
}

/**
 * 워크아웃 페이지 헤더 컴포넌트
 */
export function WorkoutPageHeader({ 
  title = "운동 관리",
  description = "운동 계획, 진행 상황, 목표, 실시간 세션 트래킹, 분석을 한 페이지에서 확인",
  className 
}: WorkoutPageHeaderProps) {
  return (
    <header className={`${styles.workoutPageHeader} ${className || ''}`}>
      <div className={styles.workoutPageHeaderContent}>
        <div className={styles.headerText}>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
      </div>
    </header>
  )
}
