// ============================================================================
// TabBar - 목표 설정 / 진행 중 / 완료 탭
// ============================================================================

import React from "react"
import styles from "./TabBar.module.css"

export type TabType = "goals" | "active" | "completed"

interface Props {
  activeTab: TabType
  onTabChange: (tab: TabType) => void
}

export function TabBar({ activeTab, onTabChange }: Props) {
  const tabs: Array<{ id: TabType; label: string }> = [
    { id: "goals", label: "목표 설정" },
    { id: "active", label: "진행 중" },
    { id: "completed", label: "완료" },
  ]

  return (
    <div className={styles.tabBar}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`${styles.tab} ${activeTab === tab.id ? styles.active : ""}`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}

