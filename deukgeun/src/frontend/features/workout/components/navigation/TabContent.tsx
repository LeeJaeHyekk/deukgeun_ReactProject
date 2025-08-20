import React from "react"
import { LoadingSpinner } from "../../../../shared/ui/LoadingSpinner"
import {
  OverviewTab,
  PlansTab,
  SessionsTab,
  GoalsTab,
  ProgressTab,
} from "../../pages/tabs"
import type { TabContentProps } from "../../types"
import "./TabContent.css"

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
