import React from "react"
import { TAB_CONFIG } from "../../constants"
import type { TabNavigationProps } from "../../types"
import styles from "./TabNavigation.module.css"

export function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  return (
    <div className={styles.tabNavigation}>
      {TAB_CONFIG.map(tab => (
        <button
          key={tab.key}
          className={`${styles.tabButton} ${activeTab === tab.key ? styles.active : ""}`}
          onClick={() => onTabChange(tab.key)}
          aria-label={`${tab.label} 탭으로 이동`}
          aria-selected={activeTab === tab.key}
        >
          <span className={styles.tabIcon}>{tab.icon}</span>
          <span className={styles.tabLabel}>{tab.label}</span>
        </button>
      ))}
    </div>
  )
}
