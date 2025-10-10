import React from 'react'
import styles from './LoadingSpinner.module.css'

interface LoadingSpinnerProps {
  size?: "small" | "medium" | "large"
  text?: string
}

function LoadingSpinner({
  size = "medium",
  text = "로딩 중...",
}: LoadingSpinnerProps) {
  return (
    <div className={styles.container}>
      <div className={`${styles.spinner} ${styles[size]}`}></div>
      {text && <p className={styles.text}>{text}</p>}
    </div>
  )
}

export { LoadingSpinner }