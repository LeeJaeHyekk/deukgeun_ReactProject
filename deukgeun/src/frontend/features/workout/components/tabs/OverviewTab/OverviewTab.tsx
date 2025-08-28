import React, { useEffect } from "react"
import {
  useTabState,
  useDashboardData,
  useSharedState,
} from "../../../hooks/useWorkoutStore"
import type { DashboardData } from "../../../types/workout"
import { StatsSection } from "./components/StatsSection"
import { RecentSessionsSection } from "./components/RecentSessionsSection"
import { GoalsProgressSection } from "./components/GoalsProgressSection"
import { ChartsSection } from "./components/ChartsSection"
import styles from "./OverviewTab.module.css"

// 로깅 유틸리티
const logger = {
  info: (message: string, data?: any) => {
    if (import.meta.env.DEV) {
      console.log(`[OverviewTab] ${message}`, data || "")
    }
  },
  debug: (message: string, data?: any) => {
    if (import.meta.env.DEV) {
      console.debug(`[OverviewTab] ${message}`, data || "")
    }
  },
  warn: (message: string, data?: any) => {
    console.warn(`[OverviewTab] ${message}`, data || "")
  },
  error: (message: string, data?: any) => {
    console.error(`[OverviewTab] ${message}`, data || "")
  },
  grid: (message: string, data?: any) => {
    const gridEl = document.querySelector(`.${styles.overviewGrid}`)
    console.log("overviewGrid element:", gridEl)
    if (gridEl) {
      console.log("Computed style:", window.getComputedStyle(gridEl).display)
    }
  },
}

interface OverviewTabProps {
  dashboardData: DashboardData | null
  isLoading: boolean
  onPlanClick: (planId: number) => void
  onSessionClick: (sessionId: number) => void
  onGoalClick: (goalId: number) => void
}

export function OverviewTab({
  dashboardData,
  isLoading,
  onPlanClick,
  onSessionClick,
  onGoalClick,
}: OverviewTabProps) {
  const { tabState, updateTabState } = useTabState("overview")

  // 대시보드 데이터 훅
  const { dashboardData: storeDashboardData, isLoading: storeIsLoading } =
    useDashboardData()

  // 공유 상태 훅
  const { sharedState } = useSharedState()

  logger.info("OverviewTab 렌더링", {
    hasPropsData: !!dashboardData,
    hasStoreData: !!storeDashboardData,
    isLoading,
    storeIsLoading,
    recentUpdatesCount:
      sharedState.lastUpdatedPlan || sharedState.lastUpdatedSession ? 1 : 0,
  })

  // 실제 사용할 데이터 결정 (props 우선, 없으면 스토어에서)
  const finalDashboardData: any = dashboardData || storeDashboardData || null
  const finalIsLoading = isLoading || storeIsLoading

  // 최근 업데이트된 항목들 표시 (최대 2개만)
  const recentUpdates = [
    sharedState.lastUpdatedPlan && {
      type: "plan" as const,
      item: sharedState.lastUpdatedPlan,
      onClick: () => onPlanClick(sharedState.lastUpdatedPlan!.id),
    },
    sharedState.lastUpdatedSession && {
      type: "session" as const,
      item: sharedState.lastUpdatedSession,
      onClick: () => onSessionClick(sharedState.lastUpdatedSession!.id),
    },
  ]
    .filter(Boolean)
    .slice(0, 2)

  if (finalIsLoading) {
    return (
      <div className={styles.overviewTab}>
        <div className={styles.overviewLoadingContainer}>
          <div className={styles.overviewLoadingSpinner}></div>
          <p>데이터를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (!finalDashboardData) {
    return (
      <div className={styles.overviewTab}>
        <div className={styles.overviewNoDataContainer}>
          <h3>운동 데이터가 없습니다</h3>
          <p>첫 번째 운동 계획을 만들어보세요!</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.overviewTab}>
      {/* 간단한 헤더 */}
      <div className={styles.overviewHeader}>
        <h2>운동 대시보드</h2>
        <p>현재 운동 현황을 한눈에 확인하세요</p>
      </div>

      {/* 최근 업데이트 알림 (간소화) */}
      {recentUpdates.length > 0 && (
        <div className={styles.recentUpdates}>
          <h4>최근 활동</h4>
          <div className={styles.updatesList}>
            {recentUpdates.map(update => {
              if (!update) return null

              const displayName = (() => {
                if (
                  "name" in update.item &&
                  typeof update.item.name === "string"
                ) {
                  return update.item.name
                }
                if (
                  "title" in update.item &&
                  typeof update.item.title === "string"
                ) {
                  return update.item.title
                }
                return "Unknown"
              })()

              return (
                <div
                  key={`${update.type}-${update.item.id}`}
                  className={styles.updateItem}
                  onClick={update.onClick}
                >
                  <span className={styles.updateType}>{update.type}</span>
                  <span className={styles.updateName}>{displayName}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* 메인 콘텐츠 그리드 */}
      <div className={styles.overviewGrid}>
        <div className={styles.overviewStatsSection}>
          <StatsSection dashboardData={finalDashboardData} />
        </div>
        <div className={styles.overviewSessionsSection}>
          <RecentSessionsSection
            dashboardData={finalDashboardData}
            onSessionClick={onSessionClick}
          />
        </div>
        <div className={styles.overviewGoalsSection}>
          <GoalsProgressSection
            dashboardData={finalDashboardData}
            onGoalClick={onGoalClick}
          />
        </div>
        <div className={styles.overviewChartsSection}>
          <ChartsSection dashboardData={finalDashboardData} />
        </div>
      </div>
    </div>
  )
}
