// ============================================================================
// LoadingState - 로딩 상태 표시 공통 컴포넌트
// ============================================================================

import React from "react"
import styles from "./LoadingState.module.css"

interface Props {
  message?: string
}

export function LoadingState({ message = "로딩 중..." }: Props) {
  return (
    <div className={styles.loadingState}>
      <div className={styles.spinner} />
      <p className={styles.message}>{message}</p>
    </div>
  )
}

