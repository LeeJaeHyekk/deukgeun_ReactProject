import React from "react"
import { TAB_CONFIG } from "../../constants"
import type { TabNavigationProps } from "../../types"
import "./TabNavigation.css"

export function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  return (
    <div className="tab-navigation">
      {TAB_CONFIG.map(tab => (
        <button
          key={tab.id}
          className={`tab-button ${activeTab === tab.id ? "active" : ""}`}
          onClick={() => onTabChange(tab.id)}
          aria-label={`${tab.label} 탭으로 이동`}
          aria-selected={activeTab === tab.id}
        >
          <span className="tab-icon">{tab.icon}</span>
          <span className="tab-label">{tab.label}</span>
        </button>
      ))}
    </div>
  )
}
