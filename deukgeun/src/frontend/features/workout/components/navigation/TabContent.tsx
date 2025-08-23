import React from "react"
import { LoadingSpinner } from "@shared/ui/LoadingSpinner"
import { OverviewTab } from "../tabs/OverviewTab"
import { PlansTab } from "../tabs/PlansTab"
import { SessionsTab } from "../tabs/SessionsTab"
import { GoalsTab } from "../tabs/GoalsTab"
import { ProgressTab } from "../tabs/ProgressTab"
import type { TabType } from "../../types"
import type {
  WorkoutPlan,
  WorkoutSession,
  WorkoutGoal,
  DashboardData,
} from "@shared/types"
import "./TabContent.css"

interface TabContentProps {
  activeTab: TabType
  isLoading: boolean
  dashboardData: DashboardData | null
  plans: WorkoutPlan[]
  sessions: WorkoutSession[]
  goals: WorkoutGoal[]
  plansLoading: boolean
  sessionsLoading: boolean
  goalsLoading: boolean
  onPlanClick: (planId: number) => void
  onSessionClick: (sessionId: number) => void
  onGoalClick: (goalId: number) => void
  onCreatePlan: () => void
  onEditPlan: (planId: number) => void
  onStartSession: (planId: number) => void
  onCreateSession: () => void
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
  plansLoading,
  sessionsLoading,
  goalsLoading,
  onPlanClick,
  onSessionClick,
  onGoalClick,
  onCreatePlan,
  onEditPlan,
  onStartSession,
  onCreateSession,
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
      <div className="tab-content">
        <div className="loading-container">
          <LoadingSpinner />
          <p>데이터를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="tab-content">
      {activeTab === "overview" && (
        <OverviewTab
          dashboardData={dashboardData}
          isLoading={isLoading}
          onPlanClick={onPlanClick}
          onSessionClick={onSessionClick}
          onGoalClick={onGoalClick}
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
          sessions={sessions}
          isLoading={sessionsLoading}
          onCreateSession={onCreateSession}
          onEditSession={onEditSession}
          onViewSession={onViewSession}
          onDeleteSession={onDeleteSession}
        />
      )}

      {activeTab === "goals" && (
        <GoalsTab
          goals={goals}
          isLoading={goalsLoading}
          onCreateGoal={onCreateGoal}
          onEditGoal={onEditGoal}
          onDeleteGoal={onDeleteGoal}
        />
      )}

      {activeTab === "progress" && (
        <ProgressTab
          sessions={sessions}
          isLoading={sessionsLoading}
          onViewSession={onViewSession}
        />
      )}
    </div>
  )
}
