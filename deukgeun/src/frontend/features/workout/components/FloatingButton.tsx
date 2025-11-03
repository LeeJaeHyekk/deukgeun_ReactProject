// ============================================================================
// FloatingButton - 새 목표 추가 플로팅 버튼
// ============================================================================

import React from "react"
import styles from "./FloatingButton.module.css"

interface Props {
  onClick: () => void
  label?: string
}

export function FloatingButton({ onClick, label = "새 목표 추가" }: Props) {
  return (
    <button onClick={onClick} className={styles.floatingButton} aria-label={label}>
      <span className={styles.icon}>+</span>
      <span className={styles.label}>{label}</span>
    </button>
  )
}

