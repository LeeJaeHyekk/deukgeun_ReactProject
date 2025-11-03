// ============================================================================
// InfoItem Component - 정보 아이템 컴포넌트
// ============================================================================

import React, { memo } from "react"
import styles from "../MyPage.module.css"

interface InfoItemProps {
  label: string
  value: string | undefined
  icon?: string
}

export const InfoItem = memo(
  ({ label, value, icon }: InfoItemProps) => (
    <div className={styles.infoItem}>
      <div className={styles.infoHeader}>
        {icon && <span className={styles.infoIcon}>{icon}</span>}
        <p className={styles.label}>{label}</p>
      </div>
      <p className={styles.value}>{value || "미등록"}</p>
    </div>
  )
)

InfoItem.displayName = "InfoItem"

