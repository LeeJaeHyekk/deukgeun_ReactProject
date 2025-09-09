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
          className={`${styles.tabButton} ${activeTab === tab.key ? styles.active : ""} ${!tab.enabled ? styles.disabled : ""}`}
          onClick={() => tab.enabled && onTabChange(tab.key)}
          disabled={!tab.enabled}
          aria-label={`${tab.label} 탭으로 이동`}
          aria-selected={activeTab === tab.key}
          title={!tab.enabled ? "개발 중인 기능입니다" : tab.description}
        >
          <span className={styles.tabIcon}>{tab.icon}</span>
          <span className={styles.tabLabel}>{tab.label}</span>
          {!tab.enabled && <span className={styles.developmentBadge}>🚧</span>}
        </button>
      ))}
    </div>
  )
}
