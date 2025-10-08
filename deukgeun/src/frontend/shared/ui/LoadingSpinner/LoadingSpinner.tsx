const React = require('react').default
const styles = require('./LoadingSpinner.module.css').default

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
