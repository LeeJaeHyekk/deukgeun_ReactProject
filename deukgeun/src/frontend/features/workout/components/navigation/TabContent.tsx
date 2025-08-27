import React from "react"
import { LoadingSpinner } from "@shared/ui/LoadingSpinner"
import { OverviewTab } from "../tabs/OverviewTab"
import { PlansTab } from "../tabs/PlansTab"
import { SessionsTab } from "../tabs/SessionsTab"
import { GoalsTab } from "../tabs/GoalsTab"
import { ProgressTab } from "../tabs/ProgressTab/ProgressTab"
import type { TabType } from "../../types"
import type {
  WorkoutPlan,
  WorkoutSession,
  WorkoutGoal,
  Machine,
} from "@shared/types"
import type { DashboardData, WorkoutStatsDTO } from "../../types"
import styles from "./TabContent.module.css"

interface TabContentProps {
  activeTab: TabType
  isLoading: boolean
  dashboardData: DashboardData | null
  plans: WorkoutPlan[]
  sessions: WorkoutSession[]
  goals: WorkoutGoal[]
  workoutStats: WorkoutStatsDTO | null
  machines: Machine[]
  plansLoading: boolean
  sessionsLoading: boolean
  goalsLoading: boolean
  onPlanClick: (planId: number) => void
  onSessionClick: (sessionId: number) => void
  onGoalClick: (goalId: number) => void
  onCreatePlan: () => void
  onEditPlan: (planId: number) => void
  onStartSession: (planId: number) => void
  // onCreateSession: () => void  // 주석 처리: 새 세션 생성 기능 비활성화
  onEditSession: (sessionId: number) => void
  onViewSession: (sessionId: number) => void
  onCreateGoal: () => void
  onEditGoal: (goalId: number) => void
  onDeletePlan: (planId: number) => void
  onDeleteSession: (sessionId: number) => void
  onDeleteGoal: (goalId: number) => void
}

export function TabContent({
  activeTab,
  isLoading,
  dashboardData,
  plans,
  sessions,
  goals,
  workoutStats,
  machines,
  plansLoading,
  sessionsLoading,
  goalsLoading,
  onPlanClick,
  onSessionClick,
  onGoalClick,
  onCreatePlan,
  onEditPlan,
  onStartSession,
  // onCreateSession,  // 주석 처리: 새 세션 생성 기능 비활성화
  onEditSession,
  onViewSession,
  onCreateGoal,
  onEditGoal,
  onDeletePlan,
  onDeleteSession,
  onDeleteGoal,
}: TabContentProps) {
  if (isLoading) {
    return (
      <div className={styles.tabContent}>
        <div className={styles.tabLoadingState}>
          <div className={styles.tabLoadingSpinner}></div>
          <p className={styles.tabLoadingText}>데이터를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.tabContent}>
      {activeTab === "overview" && (
        <OverviewTab
          dashboardData={dashboardData}
          isLoading={isLoading}
          onPlanClick={onPlanClick}
          onSessionClick={onSessionClick}
          onGoalClick={onGoalClick}
        />
      )}

      {activeTab === "goals" && (
        <GoalsTab
          goals={goals as any}
          isLoading={goalsLoading}
          onCreateGoal={onCreateGoal}
          onEditGoal={onEditGoal}
          onDeleteGoal={onDeleteGoal}
        />
      )}

      {activeTab === "plans" && (
        <PlansTab
          plans={plans}
          isLoading={plansLoading}
          onCreatePlan={onCreatePlan}
          onEditPlan={onEditPlan}
          onStartSession={onStartSession}
          onDeletePlan={onDeletePlan}
        />
      )}

      {activeTab === "sessions" && (
        <SessionsTab
          sessions={sessions as any}
          isLoading={sessionsLoading}
          onEditSession={onEditSession}
          onViewSession={onViewSession}
          onDeleteSession={onDeleteSession}
        />
      )}

      {activeTab === "workoutProgress" && (
        <ProgressTab
          sessions={sessions as any}
          onViewSession={onViewSession}
          isLoading={sessionsLoading}
        />
      )}
    </div>
  )
}
