// ============================================================================
// ActionButton Component - 액션 버튼 컴포넌트
// ============================================================================

import React, { memo } from "react"
import styles from "../MyPage.module.css"

interface ActionButtonProps {
  children: React.ReactNode
  onClick?: () => void
  variant?: "primary" | "secondary" | "danger"
  icon?: string
  disabled?: boolean
}

export const ActionButton = memo(
  ({
    children,
    onClick,
    variant = "primary",
    icon,
    disabled = false,
  }: ActionButtonProps) => (
    <button
      className={`${styles.actionBtn} ${styles[variant]} ${disabled ? styles.disabled : ''}`}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      aria-disabled={disabled}
    >
      {icon && <span className={styles.buttonIcon}>{icon}</span>}
      {children}
    </button>
  )
)

ActionButton.displayName = "ActionButton"

