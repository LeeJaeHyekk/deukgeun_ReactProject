// ============================================================================
// StatsCard Component - 통계 카드 컴포넌트
// ============================================================================

import React, { memo } from "react"
import styles from "../MyPage.module.css"

interface StatsCardProps {
  title: string
  value: string
  subtitle?: string
  icon?: string
}

export const StatsCard = memo(
  ({ title, value, subtitle, icon }: StatsCardProps) => (
    <div className={styles.statsCard}>
      <div className={styles.statsHeader}>
        {icon && <span className={styles.statsIcon}>{icon}</span>}
        <h4 className={styles.statsTitle}>{title}</h4>
      </div>
      <div className={styles.statsValue}>{value}</div>
      {subtitle && <p className={styles.statsSubtitle}>{subtitle}</p>}
    </div>
  )
)

StatsCard.displayName = "StatsCard"

