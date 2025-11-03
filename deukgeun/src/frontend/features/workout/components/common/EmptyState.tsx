// ============================================================================
// EmptyState - 빈 상태 표시 공통 컴포넌트
// ============================================================================

import React from "react"
import styles from "./EmptyState.module.css"

interface Props {
  title?: string
  message: string
  secondaryMessage?: string
  icon?: React.ReactNode
}

export function EmptyState({ title, message, secondaryMessage, icon }: Props) {
  return (
    <div className={styles.emptyState}>
      {icon && <div className={styles.icon}>{icon}</div>}
      {title && <h3 className={styles.title}>{title}</h3>}
      <p className={styles.message}>{message}</p>
      {secondaryMessage && <p className={styles.secondaryMessage}>{secondaryMessage}</p>}
    </div>
  )
}

