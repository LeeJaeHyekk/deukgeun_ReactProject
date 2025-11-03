// ============================================================================
// WorkoutPage - 메인 워크아웃 페이지
// ============================================================================

import React, { useState, Suspense, lazy, useCallback } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useAuthRedux } from "@frontend/shared/hooks/useAuthRedux"
import { Navigation } from "@widgets/Navigation/Navigation"
import { TabBar, TabType } from "./components/TabBar"
import { selectActiveWorkout } from "./selectors"
import { pauseWorkout } from "./slices/workoutSlice"
import { useWorkoutPageInitialization } from "./hooks/useWorkoutPageInitialization"
import { EmptyState } from "./components/common"
import styles from "./WorkoutPage.module.css"
import "./styles/variables.css"

// 코드 스플리팅: 탭별 패널을 lazy load로 분리 (성능 최적화)
const GoalSettingPanel = lazy(() => import("./components/GoalSettingPanel").then(module => ({ default: module.GoalSettingPanel })))
const ActiveWorkoutPanel = lazy(() => import("./components/ActiveWorkoutPanel").then(module => ({ default: module.ActiveWorkoutPanel })))
const CompletedWorkoutPanel = lazy(() => import("./components/CompletedWorkoutPanel").then(module => ({ default: module.CompletedWorkoutPanel })))
const AddGoalModal = lazy(() => import("./components/AddGoalModal").then(module => ({ default: module.AddGoalModal })))

// 로딩 컴포넌트
import { LoadingState } from "./components/common"
const PanelLoader = () => <LoadingState />

function WorkoutPageContent() {
  const dispatch = useDispatch()
  const { isLoggedIn: isAuthenticated } = useAuthRedux()
  const activeWorkout = useSelector(selectActiveWorkout)
  const [activeTab, setActiveTab] = useState<TabType>("goals")
  const [isModalOpen, setIsModalOpen] = useState(false)

  // 초기 데이터 로드 (localStorage + 백엔드 병합)
  useWorkoutPageInitialization()

  // activeWorkout이 있으면 자동으로 active 탭으로 전환 (루프 방지)
  React.useEffect(() => {
    if (activeWorkout && activeTab !== "active") {
      setActiveTab("active")
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeWorkout?.sessionId]) // sessionId만 의존성으로 사용하여 루프 방지

  // 탭 전환 시 activeWorkout이 있으면 진행 상태 자동 저장
  const handleTabChange = useCallback((tab: TabType) => {
    // activeWorkout이 있고 다른 탭으로 전환하는 경우 진행 상태 저장
    if (activeWorkout && tab !== "active") {
      // pauseWorkout을 dispatch하여 진행 상태를 goal에 저장
      dispatch(pauseWorkout())
      console.log("💾 탭 전환으로 인한 진행 상태 자동 저장")
    }
    setActiveTab(tab)
  }, [activeWorkout, dispatch])

  const handleCloseModal = () => {
    setIsModalOpen(false)
  }

  if (!isAuthenticated) {
    return (
      <div className={styles.workoutPage}>
        <Navigation />
        <EmptyState
          title="로그인이 필요합니다"
          message="운동 관리를 사용하려면 로그인해주세요."
        />
      </div>
    )
  }

  return (
    <div className={styles.workoutPage}>
      <Navigation />

      <div className={styles.workoutPageContent}>
        <div className={styles.header}>
          <h1>운동 관리</h1>
        </div>

        <TabBar activeTab={activeTab} onTabChange={handleTabChange} />

        <div className={styles.tabContent}>
          <Suspense fallback={<PanelLoader />}>
            {activeTab === "goals" && <GoalSettingPanel />}
            {activeTab === "active" && <ActiveWorkoutPanel />}
            {activeTab === "completed" && <CompletedWorkoutPanel />}
          </Suspense>
        </div>

        {isModalOpen && (
          <Suspense fallback={null}>
            <AddGoalModal onClose={handleCloseModal} />
          </Suspense>
        )}
      </div>
    </div>
  )
}

// 메인 컴포넌트
export function WorkoutPage() {
  return <WorkoutPageContent />
}
