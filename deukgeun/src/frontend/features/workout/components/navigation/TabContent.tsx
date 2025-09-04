import React from "react"
import { LoadingSpinner } from "../../../../ui/LoadingSpinner"
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
} from "../../types/workout"
import type { DashboardData, WorkoutStats } from "../../types"
import styles from "./TabContent.module.css"

interface TabContentProps {
  activeTab: TabType
  isLoading: boolean
  dashboardData: DashboardData | null
  plans: WorkoutPlan[]
  sessions: WorkoutSession[]
  goals: WorkoutGoal[]
  workoutStats: WorkoutStats | null
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
  selectedGoalId?: number
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
  selectedGoalId,
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
        <div className={styles.developmentMessage}>
          <h3>🚧 개발 중인 기능입니다</h3>
          <p>운동 목표 관리 기능은 현재 개발 중입니다.</p>
          <p>곧 만나보실 수 있습니다!</p>
        </div>
      )}

      {activeTab === "plans" && (
        <div className={styles.developmentMessage}>
          <h3>🚧 개발 중인 기능입니다</h3>
          <p>운동 계획 관리 기능은 현재 개발 중입니다.</p>
          <p>곧 만나보실 수 있습니다!</p>
        </div>
      )}

      {activeTab === "sessions" && (
        <div className={styles.developmentMessage}>
          <h3>🚧 개발 중인 기능입니다</h3>
          <p>운동 세션 관리 기능은 현재 개발 중입니다.</p>
          <p>곧 만나보실 수 있습니다!</p>
        </div>
      )}

      {activeTab === "workoutProgress" && (
        <div className={styles.developmentMessage}>
          <h3>🚧 개발 중인 기능입니다</h3>
          <p>운동 진행상황 시각화 기능은 현재 개발 중입니다.</p>
          <p>곧 만나보실 수 있습니다!</p>
        </div>
      )}
    </div>
  )
}
