import React from "react"
import { useTabState } from "../../../hooks/useWorkoutStore"
import { useSharedState } from "../../../hooks/useWorkoutStore"
import type { WorkoutPlan } from "../../../../../shared/api/workoutJournalApi"
import { PlansContent } from "./components/PlansContent"
import { PlansStats } from "./components/PlansStats"
import { usePlansActions } from "./hooks/usePlansActions"
import "./PlansTab.css"

// 로깅 유틸리티
const logger = {
  info: (message: string, data?: any) => {
    if (import.meta.env.DEV) {
      console.log(`[PlansTab] ${message}`, data || "")
    }
  },
  debug: (message: string, data?: any) => {
    if (import.meta.env.DEV) {
      console.debug(`[PlansTab] ${message}`, data || "")
    }
  },
  warn: (message: string, data?: any) => {
    console.warn(`[PlansTab] ${message}`, data || "")
  },
  error: (message: string, data?: any) => {
    console.error(`[PlansTab] ${message}`, data || "")
  },
}

interface PlansTabProps {
  plans: WorkoutPlan[]
  isLoading: boolean
  onCreatePlan: () => void
  onEditPlan: (planId: number) => void
  onStartSession: (planId: number) => void
  onDeletePlan: (planId: number) => void
}

export function PlansTab({
  plans,
  isLoading,
  onCreatePlan,
  onEditPlan,
  onStartSession,
  onDeletePlan,
}: PlansTabProps) {
  // 탭별 상태 관리
  const { tabState, updateTabState } = useTabState("plans")

  // 공유 상태 훅
  const { sharedState } = useSharedState()

  const { handleDeletePlan } = usePlansActions(() => {
    // onDeletePlan은 planId를 받지만, usePlansActions는 매개변수 없는 함수를 기대함
    // 실제 삭제 후 콜백만 호출하면 되므로 빈 함수로 래핑
  })

  logger.info("PlansTab 렌더링", {
    plansCount: plans.length,
    isLoading,
    filterStatus: tabState.filterStatus,
    sortBy: tabState.sortBy,
    viewMode: tabState.viewMode,
    selectedPlanId: tabState.selectedPlanId,
  })

  // 필터링된 계획 목록
  const filteredPlans = React.useMemo(() => {
    let filtered = plans

    // 상태별 필터링
    if (tabState.filterStatus !== "all") {
      filtered = filtered.filter(plan => {
        // 여기에 필터링 로직 추가
        return true
      })
    }

    // 정렬 (최신순으로 기본 정렬)
    filtered.sort((a, b) => {
      switch (tabState.sortBy) {
        case "createdAt":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
        case "name":
          return a.name.localeCompare(b.name)
        case "difficulty":
          const difficultyOrder: Record<string, number> = {
            쉬움: 1,
            보통: 2,
            어려움: 3,
          }
          return (
            (difficultyOrder[a.difficulty] || 0) -
            (difficultyOrder[b.difficulty] || 0)
          )
        default:
          // 기본값: 최신순
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
      }
    })

    return filtered
  }, [plans, tabState.filterStatus, tabState.sortBy])

  const handleSortChange = (sortBy: string) => {
    updateTabState({ sortBy })
  }

  const handleViewModeChange = (viewMode: "grid" | "list") => {
    updateTabState({ viewMode })
  }

  const handlePlanSelect = (planId: number | null) => {
    updateTabState({ selectedPlanId: planId })
  }

  if (isLoading) {
    return (
      <div className="plans-tab">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>계획을 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="plans-tab">
      {/* 간단한 헤더 */}
      <div className="plans-header">
        <div className="header-content">
          <h2>📋 운동 계획</h2>
          <p>운동 계획을 만들고 관리하세요</p>
        </div>
        <button className="create-plan-btn" onClick={onCreatePlan}>
          <span className="icon">+</span>새 계획
        </button>
      </div>

      {/* 간단한 컨트롤 */}
      <div className="plans-controls">
        <div className="control-section">
          <div className="sort-buttons">
            <button
              className={`sort-btn ${tabState.sortBy === "createdAt" ? "active" : ""}`}
              onClick={() => handleSortChange("createdAt")}
            >
              최신순
            </button>
            <button
              className={`sort-btn ${tabState.sortBy === "name" ? "active" : ""}`}
              onClick={() => handleSortChange("name")}
            >
              이름순
            </button>
            <button
              className={`sort-btn ${tabState.sortBy === "difficulty" ? "active" : ""}`}
              onClick={() => handleSortChange("difficulty")}
            >
              난이도순
            </button>
          </div>
          <div className="view-mode-toggle">
            <button
              className={`view-mode-btn ${tabState.viewMode === "grid" ? "active" : ""}`}
              onClick={() => handleViewModeChange("grid")}
            >
              그리드
            </button>
            <button
              className={`view-mode-btn ${tabState.viewMode === "list" ? "active" : ""}`}
              onClick={() => handleViewModeChange("list")}
            >
              리스트
            </button>
          </div>
        </div>
      </div>

      {/* 최근 업데이트된 계획 표시 */}
      {sharedState.lastUpdatedPlan && (
        <div className="recent-update">
          <h4>최근 활동</h4>
          <div
            className="update-item"
            onClick={() => onEditPlan(sharedState.lastUpdatedPlan!.id)}
          >
            <span className="plan-name">
              {sharedState.lastUpdatedPlan.name}
            </span>
            <span className="plan-difficulty">
              {sharedState.lastUpdatedPlan.difficulty}
            </span>
          </div>
        </div>
      )}

      {/* 계획 목록 */}
      {filteredPlans.length > 0 ? (
        <div className="plans-section">
          <div className="section-header">
            <h3>📋 운동 계획 ({filteredPlans.length}개)</h3>
            <p>설정한 운동 계획들을 확인하세요</p>
          </div>
          <PlansContent
            plans={filteredPlans}
            onEditPlan={onEditPlan}
            onStartSession={onStartSession}
            onDeletePlan={handleDeletePlan}
            onCreatePlan={onCreatePlan}
          />
        </div>
      ) : (
        <div className="no-plans-container">
          <div className="no-plans-icon">📋</div>
          <h3>아직 운동 계획이 없습니다</h3>
          <p>첫 번째 운동 계획을 만들어보세요!</p>
          <button className="create-first-plan-btn" onClick={onCreatePlan}>
            첫 계획 만들기
          </button>
        </div>
      )}

      {/* 통계 */}
      {plans.length > 0 && <PlansStats plans={plans} />}
    </div>
  )
}
